# Hyperlocal Mobile Marketplace - Comprehensive Backend Specification
**Architecture, Database Schema, and REST API Documentation Designed Directly from the Frontend UI & Multi-Tier Hierarchy**

---

## 1. Executive Summary & Multi-Tier Hierarchy Architecture

This specification defines the complete backend architecture for the **Hyperlocal Mobile Marketplace**, directly tailored to fulfill the UI screens, user journeys, role hierarchies, and future monetization workflows.

### 1.1. Role Hierarchy & Operational Responsibilities

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 1. SUPER ADMIN (Platform Owner)                        │
│  • Reviews & accepts/approves Super Seller registration requests                       │
│  • Future Paid Monetization (No Gateway): Manages listing tiers & manual verification  │
│  • Platform-wide governance, shop activation, global categories, and traffic oversight │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ (Accepts / Approves Request)
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              2. SUPER SELLER (Shop Owner)                              │
│  • Registers shop request (waits for Super Admin acceptance & activation)              │
│  • Creates and manages Admins (Seller Admins / Store Managers) for their shop          │
│  • Manages product catalogue, inventory, promotional offers, and shop profile          │
│  • Reviews repair diagnostic solutions and tracks shop-level revenue                   │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ (Creates & Manages Admins)
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                           3. ADMIN / SELLER ADMIN (Shop Staff / Manager)               │
│  • Created & governed by the Super Seller                                              │
│  • Manages store users: logs walk-in customers, customer repair history & complaints   │
│  • Submits local customer repair problems, updates tickets, and handles customer leads  │
└────────────────────────────────────────────────────────────────────────────────────────┘

                                            ▲
                                            │ (Interacts via WhatsApp / In-Store)
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        4. CLIENT USER / VISITOR (End Consumer)                         │
│  ★ NO REGISTRATION OR LOGIN REQUIRED AT ALL!                                           │
│  • Discovers products & repair shops NEAREST to their live GPS location (Haversine geo)│
│  • Adjusts live proximity search radius (500m to 10km)                                 │
│  • Initiates pre-filled WhatsApp enquiries directly to sellers                         │
│  • Books and tracks repair status online with simple Phone / Ticket ID                 │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2. Key Architectural Guarantees
1. **Zero-Friction Client Experience:** End consumers browse freely as guests without passwords, sign-ups, or verification barriers. They find products and shops strictly based on physical proximity (nearest first).
2. **Super Admin Approval Gate (No Payment Gateway):** Super Sellers cannot access the system immediately upon registration. Their profile sits in a `PENDING_APPROVAL` queue. The Super Admin reviews the request, verifies shop details, assigns tier/status (e.g. Free or Manually Verified Paid Tier), and approves activation directly. **No external payment gateway (e.g., Razorpay, Stripe) is involved or required.**
3. **Delegated Admin Management:** The Super Seller has full administrative capability over their shop staff (`SELLER_ADMIN`). They can create admin accounts, set credentials, grant permissions, and suspend or revoke them at will.
4. **Local User/Customer Management by Admins:** Shop Admins manage their local customer base directly (recording customer walk-ins, phone numbers, repair histories, and service inquiries).
5. **Integer Paise Financial Precision:** All product prices, listing fees, and repair quotes are integer paise (`₹199.00` = `19900 paise`).

---

## 2. Relational Database Schema (MySQL 8.0+)

Below is the complete MySQL 8.0+ production DDL supporting the multi-tier hierarchy, Super Admin request approvals, future monetization fields, Super Seller admin management, and guest client discovery.

```sql
-- ============================================================================
-- HYPERLOCAL MARKETPLACE - PRODUCTION MYSQL 8.0+ SCHEMA
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `hyperlocal_marketplace`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `hyperlocal_marketplace`;

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- 1. USERS TABLE (Super Admin, Super Seller, Seller Admin, Customer)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('SUPER_ADMIN', 'SUPER_SELLER', 'SELLER_ADMIN', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
  `status` ENUM('ACTIVE', 'PENDING_APPROVAL', 'SUSPENDED', 'REJECTED') NOT NULL DEFAULT 'PENDING_APPROVAL',
  `shop_id` VARCHAR(36) DEFAULT NULL,
  `created_by_user_id` VARCHAR(36) DEFAULT NULL, -- Super Seller creates Admin; Admin creates local customer
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_email` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_status` (`status`),
  KEY `idx_users_shop_id` (`shop_id`),
  KEY `idx_users_created_by` (`created_by_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. SHOPS TABLE (Storefronts owned by Super Sellers)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `shops`;
CREATE TABLE `shops` (
  `id` VARCHAR(36) NOT NULL,
  `owner_user_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `type` ENUM('SUPER_SELLER', 'ACCESSORY_SELLER') NOT NULL DEFAULT 'SUPER_SELLER',
  `description` TEXT DEFAULT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `whatsapp_number` VARCHAR(50) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `latitude` DECIMAL(10, 7) NOT NULL DEFAULT 12.9716000,
  `longitude` DECIMAL(10, 7) NOT NULL DEFAULT 77.5946000,
  `is_active` TINYINT(1) NOT NULL DEFAULT 0,    -- 0 until Super Admin approves request
  `is_verified` TINYINT(1) NOT NULL DEFAULT 0,  -- 1 once verified by Super Admin
  `opening_hours` VARCHAR(100) DEFAULT '9:00 AM - 9:00 PM',
  `rating` DECIMAL(3, 2) NOT NULL DEFAULT 4.70,
  `review_count` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_shops_owner` (`owner_user_id`),
  KEY `idx_shops_geo` (`is_active`, `is_verified`, `latitude`, `longitude`),
  CONSTRAINT `fk_shops_owner` FOREIGN KEY (`owner_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_shop` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_users_creator` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- 3. SUPER SELLER ONBOARDING REQUESTS TABLE (Super Admin Queue & Future Paid Subscriptions)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `super_seller_requests`;
CREATE TABLE `super_seller_requests` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `shop_id` VARCHAR(36) NOT NULL,
  `shop_name` VARCHAR(255) NOT NULL,
  `shop_type` ENUM('SUPER_SELLER', 'ACCESSORY_SELLER') NOT NULL DEFAULT 'SUPER_SELLER',
  `owner_name` VARCHAR(255) NOT NULL,
  `owner_email` VARCHAR(255) NOT NULL,
  `owner_phone` VARCHAR(50) NOT NULL,
  `address` TEXT NOT NULL,
  `latitude` DECIMAL(10, 7) NOT NULL,
  `longitude` DECIMAL(10, 7) NOT NULL,
  `business_document_url` TEXT DEFAULT NULL,
  `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  
  -- FUTURE MONETIZATION & MEMBERSHIP TIERS (NO PAYMENT GATEWAY - INTERNAL ADMIN CONTROLLED)
  `plan_tier` ENUM('STANDARD_FREE', 'STARTER', 'PRO', 'ENTERPRISE') NOT NULL DEFAULT 'STANDARD_FREE',
  `billing_status` ENUM('FREE_TIER', 'PENDING_APPROVAL', 'MANUALLY_VERIFIED', 'EXEMPT') NOT NULL DEFAULT 'FREE_TIER',
  `fee_paise` INT NOT NULL DEFAULT 0,
  `subscription_expires_at` TIMESTAMP NULL DEFAULT NULL,

  -- SUPER ADMIN REVIEW AUDIT
  `reviewed_by_super_admin_id` VARCHAR(36) DEFAULT NULL,
  `reviewed_at` TIMESTAMP NULL DEFAULT NULL,
  `rejection_reason` TEXT DEFAULT NULL,
  `admin_notes` TEXT DEFAULT NULL,

  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_requests_status` (`status`),
  KEY `idx_requests_billing` (`billing_status`, `plan_tier`),
  KEY `idx_requests_user` (`user_id`),
  KEY `idx_requests_shop` (`shop_id`),
  CONSTRAINT `fk_requests_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_requests_shop` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_requests_admin` FOREIGN KEY (`reviewed_by_super_admin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. SUBSCRIPTION PLANS TABLE (Future Monetization for Super Sellers)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `subscription_plans`;
CREATE TABLE `subscription_plans` (
  `id` VARCHAR(36) NOT NULL,
  `code` VARCHAR(50) NOT NULL UNIQUE,       -- 'STARTER_MONTHLY', 'PRO_ANNUAL'
  `name` VARCHAR(100) NOT NULL,             -- 'Starter Super Seller'
  `price_paise` INT NOT NULL DEFAULT 0,      -- 99900 = ₹999/mo
  `duration_days` INT NOT NULL DEFAULT 30,
  `max_products` INT NOT NULL DEFAULT 100,
  `max_admins` INT NOT NULL DEFAULT 3,      -- How many Admins the Super Seller can create
  `features_json` JSON DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. LOCAL CUSTOMERS TABLE (Managed by Shop Admins)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `local_customers`;
CREATE TABLE `local_customers` (
  `id` VARCHAR(36) NOT NULL,
  `shop_id` VARCHAR(36) NOT NULL,
  `created_by_admin_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `total_orders_count` INT NOT NULL DEFAULT 0,
  `total_repairs_count` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_local_cust_shop_phone` (`shop_id`, `phone`),
  CONSTRAINT `fk_local_cust_shop` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_local_cust_admin` FOREIGN KEY (`created_by_admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. CATEGORIES TABLE
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `type` ENUM('ACCESSORY', 'REPAIR', 'CUSTOM') NOT NULL DEFAULT 'ACCESSORY',
  `image_url` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_categories_slug` (`slug`),
  KEY `idx_categories_type` (`type`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. PRODUCTS TABLE
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` VARCHAR(36) NOT NULL,
  `shop_id` VARCHAR(36) NOT NULL,
  `category_id` VARCHAR(36) DEFAULT NULL,
  `name` VARCHAR(255) NOT NULL,
  `brand` VARCHAR(100) DEFAULT NULL,
  `sku` VARCHAR(100) DEFAULT NULL,
  `model_compatibility` VARCHAR(255) DEFAULT NULL,
  `condition_state` VARCHAR(50) DEFAULT 'New',
  `warranty` VARCHAR(100) DEFAULT NULL,
  `price_paise` INT NOT NULL,
  `compare_at_price_paise` INT DEFAULT NULL,
  `discount_percent` INT DEFAULT 0,
  `stock` INT NOT NULL DEFAULT 0,
  `status` ENUM('ACTIVE', 'DRAFT', 'ARCHIVED', 'OUT_OF_STOCK') NOT NULL DEFAULT 'ACTIVE',
  `features` TEXT DEFAULT NULL,
  `tags` TEXT DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_products_shop_status` (`shop_id`, `status`),
  KEY `idx_products_category` (`category_id`),
  KEY `idx_products_stock` (`stock`),
  CONSTRAINT `fk_products_shop` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. PRODUCT IMAGES TABLE
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `product_images`;
CREATE TABLE `product_images` (
  `id` VARCHAR(36) NOT NULL,
  `product_id` VARCHAR(36) NOT NULL,
  `url` TEXT NOT NULL,
  `alt_text` VARCHAR(255) DEFAULT NULL,
  `position` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_images_order` (`product_id`, `position`),
  CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 9. OFFERS TABLE (Promotions & Running Discounts)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `offers`;
CREATE TABLE `offers` (
  `id` VARCHAR(36) NOT NULL,
  `shop_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `text` VARCHAR(255) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `discount_type` ENUM('PERCENT', 'FLAT', 'BOGO') NOT NULL DEFAULT 'PERCENT',
  `discount_value` INT NOT NULL DEFAULT 10,
  `code` VARCHAR(50) DEFAULT NULL,
  `theme_color` ENUM('indigo', 'violet', 'rose', 'cyan') NOT NULL DEFAULT 'indigo',
  `starts_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ends_at` TIMESTAMP NULL DEFAULT NULL,
  `status` ENUM('ACTIVE', 'EXPIRED', 'DRAFT') NOT NULL DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_offers_shop_status` (`shop_id`, `status`),
  CONSTRAINT `fk_offers_shop` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 10. ENQUIRIES TABLE (Client WhatsApp & Web Leads)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `enquiries`;
CREATE TABLE `enquiries` (
  `id` VARCHAR(36) NOT NULL,
  `shop_id` VARCHAR(36) NOT NULL,
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_phone` VARCHAR(50) NOT NULL,
  `product_id` VARCHAR(36) DEFAULT NULL,
  `offer_id` VARCHAR(36) DEFAULT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('NEW', 'RESPONDED', 'CLOSED') NOT NULL DEFAULT 'NEW',
  `response_note` TEXT DEFAULT NULL,
  `responded_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_enquiries_shop_status` (`shop_id`, `status`),
  CONSTRAINT `fk_enquiries_shop` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_enquiries_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_enquiries_offer` FOREIGN KEY (`offer_id`) REFERENCES `offers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 11. REPAIR JOBS TABLE (Booked by Client or Logged by Admin)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `repair_jobs`;
CREATE TABLE `repair_jobs` (
  `id` VARCHAR(36) NOT NULL,
  `shop_id` VARCHAR(36) DEFAULT NULL,
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_phone` VARCHAR(50) NOT NULL,
  `customer_email` VARCHAR(255) DEFAULT NULL,
  `brand` VARCHAR(100) NOT NULL,
  `model` VARCHAR(100) NOT NULL,
  `problem_description` TEXT NOT NULL,
  `status` ENUM(
    'SUBMITTED',
    'UNDER_REVIEW',
    'QUOTED',
    'APPROVED',
    'IN_PROGRESS',
    'READY',
    'COMPLETED',
    'CANCELLED',
    'NOT_REPAIRABLE'
  ) NOT NULL DEFAULT 'SUBMITTED',
  `estimated_cost_paise` INT DEFAULT NULL,
  `final_cost_paise` INT DEFAULT NULL,
  `assigned_admin_id` VARCHAR(36) DEFAULT NULL,  -- Shop Admin managing the ticket
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_repairs_phone` (`customer_phone`),
  KEY `idx_repairs_shop_status` (`shop_id`, `status`),
  CONSTRAINT `fk_repairs_shop` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_repairs_admin` FOREIGN KEY (`assigned_admin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 12. REPAIR UPDATES AUDIT LOG TABLE
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `repair_updates`;
CREATE TABLE `repair_updates` (
  `id` VARCHAR(36) NOT NULL,
  `repair_job_id` VARCHAR(36) NOT NULL,
  `author_user_id` VARCHAR(36) NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `note` TEXT NOT NULL,
  `cost_estimate_paise` INT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_repair_updates_job` (`repair_job_id`, `created_at`),
  CONSTRAINT `fk_repair_updates_job` FOREIGN KEY (`repair_job_id`) REFERENCES `repair_jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_repair_updates_user` FOREIGN KEY (`author_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
```

---

## 3. Tier 1: Super Admin Specifications (Request Acceptance & Future Monetization)

The Super Admin is the top-tier authority who reviews, accepts, or rejects Super Seller onboarding requests. In future phases, this can be gated by listing tiers or manual fee clearance (without any payment gateway).

### 3.1. List Pending Super Seller Onboarding Requests
- **Route:** `GET /super-admin/requests`
- **Auth:** Bearer Token (`role = 'SUPER_ADMIN'`)
- **Query Params:** `status=PENDING | APPROVED | REJECTED`, `billingStatus=FREE_TIER | MANUALLY_VERIFIED`, `page=1`, `limit=20`
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "requestId": "req-uuid-001",
      "status": "PENDING",
      "createdAt": "2026-10-01T10:30:00Z",
      "shop": {
        "id": "shop-uuid-001",
        "name": "Pooja Mobile Hub",
        "type": "SUPER_SELLER",
        "address": "12/4 Brigade Road, Bangalore",
        "latitude": 12.9716,
        "longitude": 77.5946
      },
      "applicant": {
        "userId": "user-uuid-101",
        "name": "Pooja Mourya",
        "email": "pooja@poojamobile.com",
        "phone": "+91 98450 12345"
      },
      "membership": {
        "planTier": "STARTER",
        "feePaise": 99900,
        "billingStatus": "MANUALLY_VERIFIED"
      }
    }
  ],
  "meta": { "totalPending": 4, "totalApproved": 38 }
}
```

### 3.2. Accept & Approve Super Seller Request
- **Route:** `PATCH /super-admin/requests/:requestId/approve`
- **Auth:** Bearer Token (`role = 'SUPER_ADMIN'`)
- **Payload:**
```json
{
  "grantVerificationBadge": true,
  "planTier": "STARTER",
  "billingStatus": "MANUALLY_VERIFIED",
  "adminNotes": "Physical storefront verified on Brigade Road. GST documents valid."
}
```
- **Backend Execution (Atomic Transaction):**
  1. Verifies caller is `SUPER_ADMIN`.
  2. Updates `super_seller_requests`:
     - `status = 'APPROVED'`
     - `plan_tier = payload.planTier || 'STANDARD_FREE'`
     - `billing_status = payload.billingStatus || 'FREE_TIER'`
     - `reviewed_by_super_admin_id = currentAdmin.id`
     - `reviewed_at = NOW()`
  3. Updates `users.status = 'ACTIVE'` for the applicant Super Seller.
  4. Updates `shops.is_active = 1` and `shops.is_verified = grantVerificationBadge`.
  5. Sends activation confirmation notification (Email / SMS / WhatsApp).
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Super Seller request approved. Shop is now activated and live for nearby clients.",
  "data": {
    "requestId": "req-uuid-001",
    "status": "APPROVED",
    "shopId": "shop-uuid-001",
    "isVerified": true,
    "isActive": true
  }
}
```

### 3.3. Reject Super Seller Request
- **Route:** `PATCH /super-admin/requests/:requestId/reject`
- **Auth:** Bearer Token (`role = 'SUPER_ADMIN'`)
- **Payload:**
```json
{
  "rejectionReason": "Address could not be verified. Please re-submit with valid business proof."
}
```
- **Backend Action:**
  - Updates `super_seller_requests.status = 'REJECTED'`, `rejection_reason = ...`.
  - Sets `users.status = 'REJECTED'`.

### 3.4. Future Monetization: Subscription Plans Management (Direct Admin Control)
- **Route:** `POST /super-admin/plans`
- **Payload:**
```json
{
  "code": "PRO_ANNUAL",
  "name": "Pro Annual Super Seller",
  "pricePaise": 999900,
  "durationDays": 365,
  "maxProducts": 500,
  "maxAdmins": 10,
  "featuresJson": {
    "priorityNearbyRanking": true,
    "whatsappLeadAnalytics": true,
    "verifiedBadgeIncluded": true
  }
}
```

---

## 4. Tier 2: Super Seller Specifications (Shop Owner & Admin Management)

Approved Super Sellers have complete control over their store catalog, offers, and **can create and manage Admins (`SELLER_ADMIN`)**.

### 4.1. Super Seller Onboarding Registration
- **Route:** `POST /auth/register-super-seller`
- **Auth:** Public
- **Payload:**
```json
{
  "name": "Pooja Mourya",
  "email": "pooja@poojamobile.com",
  "password": "StrongSecurePassword123!",
  "phone": "+91 98450 12345",
  "shopName": "Pooja Mobile Hub",
  "shopType": "SUPER_SELLER",
  "address": "12/4 Brigade Road, Bangalore",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "planType": "STARTER_MONTHLY"
}
```
- **Backend Action:** Creates `users` record in `PENDING_APPROVAL`, creates unverified `shops` record, and inserts into `super_seller_requests` for Super Admin review.

### 4.2. Super Seller Creates an Admin (`SELLER_ADMIN`)
The Super Seller delegates store operations to shop technicians or managers.
- **Route:** `POST /super-seller/admins`
- **Auth:** Bearer Token (`role = 'SUPER_SELLER'`)
- **Payload:**
```json
{
  "name": "Rajesh Kumar",
  "email": "rajesh@poojamobile.com",
  "password": "TempAdminPassword456!",
  "phone": "+91 98765 43210"
}
```
- **Backend Execution:**
  1. Confirms authenticated user has active `SUPER_SELLER` role and valid `shop_id`.
  2. Checks plan limit (e.g. `max_admins` allowed under subscription).
  3. Inserts into `users` table:
     - `role = 'SELLER_ADMIN'`
     - `status = 'ACTIVE'`
     - `shop_id = currentSuperSeller.shop_id`
     - `created_by_user_id = currentSuperSeller.id`
- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Admin user created successfully for your shop.",
  "data": {
    "id": "admin-uuid-501",
    "name": "Rajesh Kumar",
    "email": "rajesh@poojamobile.com",
    "phone": "+91 98765 43210",
    "role": "SELLER_ADMIN",
    "shopId": "shop-uuid-001",
    "status": "ACTIVE"
  }
}
```

### 4.3. Super Seller Lists & Manages Admins
- **List Admins:** `GET /super-seller/admins`
- **Update Admin Status (Suspend / Reactivate):** `PATCH /super-seller/admins/:adminId`
  - Payload: `{ "status": "SUSPENDED" | "ACTIVE" }`
- **Remove Admin:** `DELETE /super-seller/admins/:adminId`

---

## 5. Tier 3: Admin / Seller Admin Specifications (Store Staff & Local User Management)

Shop Admins handle front-desk operations, manage walk-in customers (`local_customers`), and process repair tickets under their Super Seller's shop.

### 5.1. Admin Manages Local Customers
- **List Local Customers:** `GET /seller/admin/customers?search=...`
  - Returns customers logged under this store.
- **Register / Log Walk-In Customer:** `POST /seller/admin/customers`
- **Payload:**
```json
{
  "name": "Vijay Sundaram",
  "phone": "9812345678",
  "email": "vijay@example.com",
  "address": "MG Road, Bangalore",
  "notes": "Prefers OEM parts for iPhone 14 Pro"
}
```
- **Backend Action:** Inserts into `local_customers` linked to `shop_id` and `created_by_admin_id`.

### 5.2. Admin Submits Local Repair Job for Customer
- **Route:** `POST /seller/admin/repair-jobs`
- **Auth:** Bearer Token (`role = 'SELLER_ADMIN'` or `'SUPER_SELLER'`)
- **Payload:**
```json
{
  "customerName": "Vijay Sundaram",
  "customerPhone": "9812345678",
  "brand": "Apple iPhone",
  "model": "iPhone 14 Pro",
  "problemDescription": "Screen glass broken, digitizer functioning normally.",
  "estimatedCostPaise": 599900
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "ticketId": "rep-uuid-9999",
    "referenceNumber": "REP-9999",
    "status": "UNDER_REVIEW",
    "estimatedCostPaise": 599900
  }
}
```

### 5.3. Admin Updates Repair Diagnostic Status & Quote
- **Route:** `PATCH /seller/admin/repair-jobs/:jobId`
- **Payload:**
```json
{
  "status": "IN_PROGRESS",
  "estimatedCostPaise": 599900,
  "note": "Original display panel arrived and being assembled."
}
```

---

## 6. Tier 4: Client User Specifications (Zero Registration & Nearest Product Discovery)

> **CRITICAL RULE:** Client users **NEVER** need to register or log in. They enjoy frictionless guest discovery and interact directly through location-based proximity and WhatsApp.

### 6.1. Nearest Product Discovery (Haversine Geo-Search)
- **Route:** `GET /public/products/nearest`
- **Auth:** Public / Guest (No tokens required)
- **Query Params:**
  - `lat` (required, client GPS latitude, e.g. `12.9716`)
  - `lng` (required, client GPS longitude, e.g. `77.5946`)
  - `radiusMeters` (default: `2500`, dynamic range: `500` to `10000`)
  - `categoryId` (optional filter)
  - `q` (optional keyword search)
- **Production Haversine Query:**
```sql
SELECT 
  p.id, p.name, p.brand, p.price_paise, p.compare_at_price_paise, p.discount_percent,
  p.stock, p.condition_state, p.warranty,
  s.id AS shop_id, s.name AS shop_name, s.phone AS shop_phone, s.whatsapp_number,
  s.is_verified, s.address AS shop_address,
  ROUND(
    6371000 * 2 * ASIN(
      SQRT(
        POWER(SIN(RADIANS(s.latitude - :lat) / 2), 2) +
        COS(RADIANS(:lat)) * COS(RADIANS(s.latitude)) *
        POWER(SIN(RADIANS(s.longitude - :lng) / 2), 2)
      )
    )
  ) AS distance_meters
FROM products p
JOIN shops s ON p.shop_id = s.id
WHERE p.status = 'ACTIVE'
  AND s.is_active = 1
  AND (:categoryId IS NULL OR p.category_id = :categoryId)
  AND (:q IS NULL OR (p.name LIKE CONCAT('%', :q, '%') OR p.brand LIKE CONCAT('%', :q, '%')))
HAVING distance_meters <= :radiusMeters
ORDER BY distance_meters ASC, p.stock DESC
LIMIT 50;
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod-101",
      "name": "iPhone 15 Matte Finish Shield Case",
      "brand": "Spigen",
      "pricePaise": 89900,
      "stock": 14,
      "distanceMeters": 420,
      "shop": {
        "id": "shop-uuid-001",
        "name": "Pooja Mobile Hub",
        "phone": "+91 98450 12345",
        "whatsappNumber": "919845012345",
        "isVerified": true,
        "address": "Brigade Road, Bangalore",
        "distanceFormatted": "420 m away"
      }
    }
  ]
}
```

### 6.2. Direct WhatsApp Enquiry (Zero-Auth Lead Generation)
- **Route:** `POST /enquiries`
- **Auth:** Public / Guest
- **Payload:**
```json
{
  "shopId": "shop-uuid-001",
  "productId": "prod-101",
  "customerName": "Suresh Raina",
  "customerPhone": "9888877777",
  "message": "Hi, do you have this in matte black color in stock today?"
}
```
- **Backend Flow:**
  1. Inserts into `enquiries` table for shop audit.
  2. Looks up seller's `whatsapp_number`.
  3. Formats pre-filled message URL:
     `https://wa.me/919845012345?text=Hi%20Pooja%20Mobile%20Hub%2C%20I%20am%20interested%20in%20iPhone%2015%20Matte%20Finish%20Shield%20Case...`
- **Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "enquiryId": "enq-909",
    "whatsappUrl": "https://wa.me/919845012345?text=Hi%20Pooja%20Mobile%20Hub...",
    "status": "NEW"
  }
}
```

### 6.3. Guest Repair Booking & Online Ticket Tracking
- **Booking (No Login):** `POST /public/repairs/book`
  - Payload: `{ customerName, customerPhone, customerEmail, brand, model, problemDescription, preferredShopId }`
- **Tracking (No Login):** `GET /public/repairs/track?ticketId=REP-8888` OR `?phone=9876543210`
  - Live milestone progress bar: `SUBMITTED` ➔ `UNDER_REVIEW` ➔ `QUOTED` ➔ `APPROVED` ➔ `IN_PROGRESS` ➔ `READY` ➔ `COMPLETED`.

---

## 7. Role-Based Access Control (RBAC) Permission Matrix

| Endpoint Route | Public / Guest | SELLER_ADMIN (Admin) | SUPER_SELLER | SUPER_ADMIN |
|---|:---:|:---:|:---:|:---:|
| `GET /public/products/nearest` | **ALLOWED** | ALLOWED | ALLOWED | ALLOWED |
| `GET /shops/nearby` | **ALLOWED** | ALLOWED | ALLOWED | ALLOWED |
| `POST /enquiries` (WhatsApp) | **ALLOWED** | ALLOWED | ALLOWED | ALLOWED |
| `POST /public/repairs/book` | **ALLOWED** | ALLOWED | ALLOWED | ALLOWED |
| `GET /public/repairs/track` | **ALLOWED** | ALLOWED | ALLOWED | ALLOWED |
| `POST /auth/register-super-seller` | **ALLOWED** | DENIED | DENIED | DENIED |
| `GET /super-admin/requests` | DENIED | DENIED | DENIED | **ALLOWED** |
| `PATCH /super-admin/requests/:id/approve` | DENIED | DENIED | DENIED | **ALLOWED** |
| `POST /super-admin/plans` (Monetization) | DENIED | DENIED | DENIED | **ALLOWED** |
| `POST /super-seller/admins` (Create Admin) | DENIED | DENIED | **ALLOWED** | DENIED |
| `GET /super-seller/admins` (List Admins) | DENIED | DENIED | **ALLOWED** | DENIED |
| `POST /seller/products` (Add Product) | DENIED | ALLOWED | **ALLOWED** | DENIED |
| `POST /seller/admin/customers` (Log User) | DENIED | **ALLOWED** | **ALLOWED** | DENIED |
| `PATCH /seller/admin/repair-jobs/:id` | DENIED | **ALLOWED** | **ALLOWED** | DENIED |

---

## 8. Summary of Benefits & Implementation Checklist

1. **Clean Separation of Concerns:**
   - **Super Admin** acts as the platform gatekeeper and monetizer.
   - **Super Seller** acts as the business store owner with delegation powers.
   - **Seller Admin** acts as the operational executor managing local customers and tickets.
   - **Client User** experiences instant hyperlocal discovery without signup fatigue.
2. **Monetization Readiness:**
   - Future listing fee and monthly/annual subscription models are architected in `super_seller_requests` and `subscription_plans`.
3. **Hyperlocal Precision:**
   - Nearest-first sorting powered by SQL Haversine calculation guarantees users always see products from shops nearest to them.
