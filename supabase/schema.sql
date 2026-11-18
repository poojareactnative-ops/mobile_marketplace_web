-- ====================================================================
-- SMARTFIX HUB: PRODUCTION SUPABASE POSTGRESQL SCHEMA
-- Hyperlocal Mobile Repair Shop & 2% Seller Referral Platform
-- ====================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- TABLE 1: PROFILES
-- Stores Super Admin, Shop Admins, Accessory Sellers, and Customers
-- ====================================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'SELLER', 'CUSTOMER')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING', 'REJECTED', 'SUSPENDED')),
    is_default_password BOOLEAN NOT NULL DEFAULT false,
    shop_id UUID,
    admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure all columns exist if table was already created
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'password') THEN
        ALTER TABLE profiles ADD COLUMN password TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'status') THEN
        ALTER TABLE profiles ADD COLUMN status TEXT NOT NULL DEFAULT 'ACTIVE';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_default_password') THEN
        ALTER TABLE profiles ADD COLUMN is_default_password BOOLEAN NOT NULL DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'admin_id') THEN
        ALTER TABLE profiles ADD COLUMN admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'shop_id') THEN
        ALTER TABLE profiles ADD COLUMN shop_id UUID;
    END IF;
END $$;

-- Drop old status check if it restricts 'REJECTED'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_status_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_status_check CHECK (status IN ('ACTIVE', 'PENDING', 'REJECTED', 'SUSPENDED'));

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_admin_id ON profiles(admin_id);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);

-- ====================================================================
-- TABLE 2: SHOPS (Repair Centers owned by Admins)
-- ====================================================================
CREATE TABLE IF NOT EXISTS shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    is_verified BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shops_owner ON shops(owner_id);

-- ====================================================================
-- TABLE 3: REPAIR JOBS (Referral Tickets & Work Orders)
-- ====================================================================
CREATE TABLE IF NOT EXISTS repair_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id TEXT UNIQUE NOT NULL,
    admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    shop_id UUID REFERENCES shops(id) ON DELETE SET NULL,
    seller_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    seller_name TEXT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    device_brand TEXT NOT NULL,
    device_model TEXT NOT NULL,
    problem_description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
    estimated_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    final_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    seller_commission_percent NUMERIC(5, 2) NOT NULL DEFAULT 2.00,
    seller_commission_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    platform_fee_percent NUMERIC(5, 2) NOT NULL DEFAULT 1.00,
    platform_fee_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    admin_remaining_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    commission_status TEXT NOT NULL DEFAULT 'NOT_APPLICABLE',
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Update status constraint to include all operational statuses
ALTER TABLE repair_jobs DROP CONSTRAINT IF EXISTS repair_jobs_status_check;
ALTER TABLE repair_jobs ADD CONSTRAINT repair_jobs_status_check 
    CHECK (status IN ('PENDING_APPROVAL', 'ACCEPTED', 'IN_PROGRESS', 'READY_FOR_DELIVERY', 'COMPLETED', 'CANCELLED', 'REJECTED'));

ALTER TABLE repair_jobs DROP CONSTRAINT IF EXISTS repair_jobs_commission_status_check;
ALTER TABLE repair_jobs ADD CONSTRAINT repair_jobs_commission_status_check 
    CHECK (commission_status IN ('NOT_APPLICABLE', 'PENDING', 'PAID'));

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'repair_jobs' AND column_name = 'platform_fee_percent') THEN
        ALTER TABLE repair_jobs ADD COLUMN platform_fee_percent NUMERIC(5, 2) NOT NULL DEFAULT 1.00;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'repair_jobs' AND column_name = 'platform_fee_amount') THEN
        ALTER TABLE repair_jobs ADD COLUMN platform_fee_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_repair_jobs_ticket_id ON repair_jobs(ticket_id);
CREATE INDEX IF NOT EXISTS idx_repair_jobs_admin_id ON repair_jobs(admin_id);
CREATE INDEX IF NOT EXISTS idx_repair_jobs_seller_id ON repair_jobs(seller_id);
CREATE INDEX IF NOT EXISTS idx_repair_jobs_status ON repair_jobs(status);

-- ====================================================================
-- TABLE 4: REPAIR COMMISSIONS (2% Referral Commission Ledger)
-- ====================================================================
CREATE TABLE IF NOT EXISTS repair_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repair_job_id UUID REFERENCES repair_jobs(id) ON DELETE CASCADE,
    ticket_id TEXT NOT NULL,
    shop_id UUID REFERENCES shops(id) ON DELETE SET NULL,
    admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    seller_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    seller_name TEXT,
    final_repair_amount NUMERIC(12, 2) NOT NULL,
    commission_percent NUMERIC(5, 2) NOT NULL DEFAULT 2.00,
    commission_amount NUMERIC(12, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    payment_reference TEXT,
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE repair_commissions DROP CONSTRAINT IF EXISTS repair_commissions_status_check;
ALTER TABLE repair_commissions ADD CONSTRAINT repair_commissions_status_check 
    CHECK (status IN ('PENDING', 'PAID'));

CREATE INDEX IF NOT EXISTS idx_commissions_seller ON repair_commissions(seller_id);
CREATE INDEX IF NOT EXISTS idx_commissions_admin ON repair_commissions(admin_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON repair_commissions(status);

-- ====================================================================
-- TABLE 5: PRODUCTS (Accessories Catalog)
-- ====================================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES shops(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    brand TEXT,
    category TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- TABLE 6: OFFERS (Promotional Discounts)
-- ====================================================================
CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    discount_percent INTEGER NOT NULL,
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- TABLE 7: INQUIRIES (Customer Leads / Inquiries)
-- ====================================================================
CREATE TABLE IF NOT EXISTS inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_type TEXT NOT NULL CHECK (item_type IN ('PRODUCT', 'OFFER', 'REPAIR')),
    item_id TEXT,
    item_title TEXT NOT NULL,
    shop_id UUID REFERENCES shops(id) ON DELETE SET NULL,
    shop_name TEXT,
    owner_role TEXT NOT NULL CHECK (owner_role IN ('ADMIN', 'SELLER')),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'CLOSED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_shop ON inquiries(shop_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_owner_role ON inquiries(owner_role);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);

-- ====================================================================
-- TABLE 8: NOTIFICATIONS (Real Platform Audit & Alert Feed)
-- ====================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    recipient_role TEXT,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_role ON notifications(recipient_role);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ====================================================================
-- TABLE 9: PAYOUT_REQUESTS (Seller Wallet Settlement via UPI / Bank)
-- ====================================================================
CREATE TABLE IF NOT EXISTS payout_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    seller_name TEXT NOT NULL,
    shop_id UUID REFERENCES shops(id) ON DELETE SET NULL,
    admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'UPI',
    upi_id TEXT,
    bank_account_no TEXT,
    bank_ifsc TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSED', 'REJECTED')),
    transaction_ref TEXT,
    processed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payouts_seller ON payout_requests(seller_id);
CREATE INDEX IF NOT EXISTS idx_payouts_admin ON payout_requests(admin_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payout_requests(status);

-- ====================================================================
-- SEED INITIAL SUPER ADMIN IF MISSING
-- ====================================================================
INSERT INTO profiles (email, password, name, phone, role, status, is_default_password)
VALUES ('superadmin@smartfix.com', 'Admin@123', 'Master Platform Super Admin', '+91 99999 00000', 'SUPER_ADMIN', 'ACTIVE', false)
ON CONFLICT (email) DO UPDATE 
SET role = 'SUPER_ADMIN', status = 'ACTIVE', name = 'Master Platform Super Admin';

-- ====================================================================
-- STORED PROCEDURE / RPC: complete_repair_job
-- Automatically calculates 3-Way Split: 2% Seller, 1% Platform, 97% Workshop
-- ====================================================================
CREATE OR REPLACE FUNCTION complete_repair_job(
    p_job_id UUID,
    p_final_amount NUMERIC,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_job repair_jobs%ROWTYPE;
    v_seller profiles%ROWTYPE;
    v_commission NUMERIC(12, 2);
    v_platform_fee NUMERIC(12, 2);
    v_remaining NUMERIC(12, 2);
    v_comm_id UUID;
BEGIN
    SELECT * INTO v_job FROM repair_jobs WHERE id = p_job_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Repair job not found';
    END IF;

    -- Calculate 3-Way Split
    v_commission := CASE WHEN v_job.seller_id IS NOT NULL THEN ROUND(p_final_amount * 0.02, 2) ELSE 0.00 END;
    v_platform_fee := ROUND(p_final_amount * 0.01, 2);
    v_remaining := p_final_amount - v_commission - v_platform_fee;

    UPDATE repair_jobs
    SET final_amount = p_final_amount,
        seller_commission_amount = v_commission,
        platform_fee_percent = 1.00,
        platform_fee_amount = v_platform_fee,
        admin_remaining_amount = v_remaining,
        status = 'COMPLETED',
        commission_status = CASE WHEN v_job.seller_id IS NOT NULL THEN 'PENDING' ELSE 'NOT_APPLICABLE' END,
        notes = COALESCE(p_notes, notes),
        updated_at = now()
    WHERE id = p_job_id
    RETURNING * INTO v_job;

    IF v_job.seller_id IS NOT NULL THEN
        SELECT * INTO v_seller FROM profiles WHERE id = v_job.seller_id;
        
        INSERT INTO repair_commissions (
            repair_job_id,
            ticket_id,
            shop_id,
            admin_id,
            seller_id,
            seller_name,
            final_repair_amount,
            commission_percent,
            commission_amount,
            status,
            created_at
        ) VALUES (
            v_job.id,
            v_job.ticket_id,
            v_job.shop_id,
            v_job.admin_id,
            v_job.seller_id,
            COALESCE(v_job.seller_name, v_seller.name, 'Seller'),
            p_final_amount,
            2.00,
            v_commission,
            'PENDING',
            now()
        )
        ON CONFLICT (id) DO NOTHING
        RETURNING id INTO v_comm_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'job', row_to_json(v_job),
        'commissionAmount', v_commission,
        'adminRemainingAmount', v_remaining
    );
END;
$$;

-- ====================================================================
-- STORED PROCEDURE / RPC: pay_seller_commission
-- ====================================================================
CREATE OR REPLACE FUNCTION pay_seller_commission(
    p_commission_id UUID,
    p_payment_ref TEXT,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_comm repair_commissions%ROWTYPE;
BEGIN
    UPDATE repair_commissions
    SET status = 'PAID',
        payment_reference = p_payment_ref,
        paid_at = now(),
        notes = COALESCE(p_notes, notes),
        updated_at = now()
    WHERE id = p_commission_id
    RETURNING * INTO v_comm;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Commission record not found';
    END IF;

    UPDATE repair_jobs
    SET commission_status = 'PAID',
        paid_at = now(),
        updated_at = now()
    WHERE id = v_comm.repair_job_id;

    RETURN jsonb_build_object(
        'success', true,
        'commission', row_to_json(v_comm)
    );
END;
$$;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enables clean CRUD access for the web app frontend
-- ====================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public Read Profiles" ON profiles;
DROP POLICY IF EXISTS "Public Insert Profiles" ON profiles;
DROP POLICY IF EXISTS "Public Update Profiles" ON profiles;
CREATE POLICY "Public Read Profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public Insert Profiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Profiles" ON profiles FOR UPDATE USING (true);

-- Shops Policies
DROP POLICY IF EXISTS "Public Read Shops" ON shops;
DROP POLICY IF EXISTS "Public Insert Shops" ON shops;
DROP POLICY IF EXISTS "Public Update Shops" ON shops;
CREATE POLICY "Public Read Shops" ON shops FOR SELECT USING (true);
CREATE POLICY "Public Insert Shops" ON shops FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Shops" ON shops FOR UPDATE USING (true);

-- Repair Jobs Policies
DROP POLICY IF EXISTS "Public Read RepairJobs" ON repair_jobs;
DROP POLICY IF EXISTS "Public Insert RepairJobs" ON repair_jobs;
DROP POLICY IF EXISTS "Public Update RepairJobs" ON repair_jobs;
CREATE POLICY "Public Read RepairJobs" ON repair_jobs FOR SELECT USING (true);
CREATE POLICY "Public Insert RepairJobs" ON repair_jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update RepairJobs" ON repair_jobs FOR UPDATE USING (true);

-- Commissions Policies
DROP POLICY IF EXISTS "Public Read Commissions" ON repair_commissions;
DROP POLICY IF EXISTS "Public Insert Commissions" ON repair_commissions;
DROP POLICY IF EXISTS "Public Update Commissions" ON repair_commissions;
CREATE POLICY "Public Read Commissions" ON repair_commissions FOR SELECT USING (true);
CREATE POLICY "Public Insert Commissions" ON repair_commissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Commissions" ON repair_commissions FOR UPDATE USING (true);

-- Products Policies
DROP POLICY IF EXISTS "Public Read Products" ON products;
DROP POLICY IF EXISTS "Public Insert Products" ON products;
DROP POLICY IF EXISTS "Public Update Products" ON products;
CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);
CREATE POLICY "Public Insert Products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Products" ON products FOR UPDATE USING (true);

-- Offers Policies
DROP POLICY IF EXISTS "Public Read Offers" ON offers;
DROP POLICY IF EXISTS "Public Insert Offers" ON offers;
CREATE POLICY "Public Read Offers" ON offers FOR SELECT USING (true);
CREATE POLICY "Public Insert Offers" ON offers FOR INSERT WITH CHECK (true);

-- Inquiries Policies
DROP POLICY IF EXISTS "Public Read Inquiries" ON inquiries;
DROP POLICY IF EXISTS "Public Insert Inquiries" ON inquiries;
DROP POLICY IF EXISTS "Public Update Inquiries" ON inquiries;
CREATE POLICY "Public Read Inquiries" ON inquiries FOR SELECT USING (true);
CREATE POLICY "Public Insert Inquiries" ON inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Inquiries" ON inquiries FOR UPDATE USING (true);

-- Notifications Policies
DROP POLICY IF EXISTS "Public Read Notifications" ON notifications;
DROP POLICY IF EXISTS "Public Insert Notifications" ON notifications;
DROP POLICY IF EXISTS "Public Update Notifications" ON notifications;
CREATE POLICY "Public Read Notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Public Insert Notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Notifications" ON notifications FOR UPDATE USING (true);

-- Payout Requests Policies
DROP POLICY IF EXISTS "Public Read PayoutRequests" ON payout_requests;
DROP POLICY IF EXISTS "Public Insert PayoutRequests" ON payout_requests;
DROP POLICY IF EXISTS "Public Update PayoutRequests" ON payout_requests;
CREATE POLICY "Public Read PayoutRequests" ON payout_requests FOR SELECT USING (true);
CREATE POLICY "Public Insert PayoutRequests" ON payout_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update PayoutRequests" ON payout_requests FOR UPDATE USING (true);
