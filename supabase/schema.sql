-- ====================================================================
-- SMARTFIX HUB: SUPABASE POSTGRESQL SCHEMA
-- Hyperlocal Mobile Repair Shop & 2% Seller Referral Platform
-- ====================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop existing tables if re-running (safe initialization)
DROP TABLE IF EXISTS repair_commissions CASCADE;
DROP TABLE IF EXISTS repair_jobs CASCADE;
DROP TABLE IF EXISTS offers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS shops CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ====================================================================
-- TABLE 1: PROFILES (Users with Roles: SUPER_ADMIN, ADMIN, SELLER, CUSTOMER)
-- ====================================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'SELLER', 'CUSTOMER')),
    shop_id UUID,
    admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING', 'SUSPENDED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for role-based lookups
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_admin_id ON profiles(admin_id);

-- ====================================================================
-- TABLE 2: SHOPS (Admin Mobile Repair Shops)
-- ====================================================================
CREATE TABLE shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shops_owner ON shops(owner_id);

-- ====================================================================
-- TABLE 3: REPAIR JOBS (Referral Tickets & Work Orders)
-- ====================================================================
CREATE TABLE repair_jobs (
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
    status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL' 
        CHECK (status IN ('PENDING_APPROVAL', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    estimated_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    final_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    seller_commission_percent NUMERIC(5, 2) NOT NULL DEFAULT 2.00,
    seller_commission_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    admin_remaining_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    commission_status TEXT NOT NULL DEFAULT 'NOT_APPLICABLE' 
        CHECK (commission_status IN ('NOT_APPLICABLE', 'PENDING', 'PAID')),
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_repair_jobs_ticket_id ON repair_jobs(ticket_id);
CREATE INDEX idx_repair_jobs_admin_id ON repair_jobs(admin_id);
CREATE INDEX idx_repair_jobs_seller_id ON repair_jobs(seller_id);
CREATE INDEX idx_repair_jobs_status ON repair_jobs(status);

-- ====================================================================
-- TABLE 4: REPAIR COMMISSIONS (2% Referral Commission Ledger)
-- ====================================================================
CREATE TABLE repair_commissions (
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
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID')),
    payment_reference TEXT,
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_commissions_seller ON repair_commissions(seller_id);
CREATE INDEX idx_commissions_admin ON repair_commissions(admin_id);
CREATE INDEX idx_commissions_status ON repair_commissions(status);

-- ====================================================================
-- TABLE 5: PRODUCTS (Accessories Catalog)
-- ====================================================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES shops(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    brand TEXT,
    category TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- TABLE 6: OFFERS (Promotional Discounts)
-- ====================================================================
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    discount_percent INTEGER NOT NULL,
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- STORED PROCEDURE / RPC: complete_repair_job
-- Automatically calculates 2% Seller Commission and 98% Admin remainder
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
    v_remaining NUMERIC(12, 2);
    v_comm_id UUID;
BEGIN
    -- 1. Fetch Job
    SELECT * INTO v_job FROM repair_jobs WHERE id = p_job_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Repair job not found';
    END IF;

    -- 2. Calculate strictly 2% Commission
    v_commission := ROUND(p_final_amount * 0.02, 2);
    v_remaining := p_final_amount - v_commission;

    -- 3. Update Repair Job
    UPDATE repair_jobs
    SET final_amount = p_final_amount,
        seller_commission_amount = v_commission,
        admin_remaining_amount = v_remaining,
        status = 'COMPLETED',
        commission_status = CASE WHEN v_job.seller_id IS NOT NULL THEN 'PENDING' ELSE 'NOT_APPLICABLE' END,
        notes = COALESCE(p_notes, notes),
        updated_at = now()
    WHERE id = p_job_id
    RETURNING * INTO v_job;

    -- 4. If referred by Seller, insert/update Commission Ledger
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
-- Settles commission payment from Admin to Seller
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

    -- Synchronize Repair Job commission status
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
-- ====================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Allow read/write access via anon key for this full-stack application
CREATE POLICY "Public Read Profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public Insert Profiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Profiles" ON profiles FOR UPDATE USING (true);

CREATE POLICY "Public Read Shops" ON shops FOR SELECT USING (true);
CREATE POLICY "Public Insert Shops" ON shops FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Shops" ON shops FOR UPDATE USING (true);

CREATE POLICY "Public Read RepairJobs" ON repair_jobs FOR SELECT USING (true);
CREATE POLICY "Public Insert RepairJobs" ON repair_jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update RepairJobs" ON repair_jobs FOR UPDATE USING (true);

CREATE POLICY "Public Read Commissions" ON repair_commissions FOR SELECT USING (true);
CREATE POLICY "Public Insert Commissions" ON repair_commissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Commissions" ON repair_commissions FOR UPDATE USING (true);

CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);
CREATE POLICY "Public Insert Products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Products" ON products FOR UPDATE USING (true);

CREATE POLICY "Public Read Offers" ON offers FOR SELECT USING (true);
CREATE POLICY "Public Insert Offers" ON offers FOR INSERT WITH CHECK (true);

