-- ============================================================================
-- HYPERLOCAL MARKETPLACE - COMPLETE MYSQL QUERIES
-- Database: MySQL 5.7+ / 8.0+ Compatible
-- Covers: DDL (Table Creation) + Full CRUD for every entity
-- Roles: SUPER_SELLER, SELLER_ADMIN, SELLER, CUSTOMER, PLATFORM_ADMIN
-- ============================================================================

-- ============================================================================
-- SECTION A: DDL - CREATE ALL TABLES
-- ============================================================================

-- Create & switch to database
CREATE DATABASE IF NOT EXISTS `hyperlocal_marketplace`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `hyperlocal_marketplace`;

-- Disable FK checks during schema creation
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- TABLE 1: users
-- Stores all user accounts: Super Sellers, Seller Admins, Sellers, Customers
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id`                  VARCHAR(36)   NOT NULL,
  `name`                VARCHAR(255)  NOT NULL,
  `email`               VARCHAR(255)  NOT NULL,
  `phone`               VARCHAR(50)   DEFAULT NULL,
  `password_hash`       VARCHAR(255)  NOT NULL,
  `role`                ENUM('CUSTOMER','SELLER','SELLER_ADMIN','SUPER_SELLER','PLATFORM_ADMIN') NOT NULL DEFAULT 'CUSTOMER',
  `status`              ENUM('ACTIVE','PENDING_VERIFICATION','SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  `shop_id`             VARCHAR(36)   DEFAULT NULL,
  `created_by_user_id`  VARCHAR(36)   DEFAULT NULL,
  `created_at`          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_email`      (`email`),
  KEY        `idx_users_role`       (`role`),
  KEY        `idx_users_shop_id`    (`shop_id`),
  KEY        `idx_users_created_by` (`created_by_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- TABLE 2: shops
-- Each Super Seller or Seller Admin has one storefront
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `shops`;
CREATE TABLE `shops` (
  `id`            VARCHAR(36)    NOT NULL,
  `owner_user_id` VARCHAR(36)    NOT NULL,
  `name`          VARCHAR(255)   NOT NULL,
  `type`          ENUM('SUPER_SELLER','ACCESSORY_SELLER') NOT NULL DEFAULT 'SUPER_SELLER',
  `description`   TEXT           DEFAULT NULL,
  `phone`         VARCHAR(50)    DEFAULT NULL,
  `address`       TEXT           DEFAULT NULL,
  `latitude`      DECIMAL(10,7)  NOT NULL DEFAULT 12.9716000,
  `longitude`     DECIMAL(10,7)  NOT NULL DEFAULT 77.5946000,
  `is_active`     TINYINT(1)     NOT NULL DEFAULT 1,
  `is_verified`   TINYINT(1)     NOT NULL DEFAULT 0,
  `opening_hours` VARCHAR(100)   DEFAULT '9:00 AM - 9:00 PM',
  `rating`        DECIMAL(3,2)   NOT NULL DEFAULT 4.70,
  `review_count`  INT            NOT NULL DEFAULT 0,
  `created_at`    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_shops_owner` (`owner_user_id`),
  KEY `idx_shops_geo`   (`is_active`, `latitude`, `longitude`),
  CONSTRAINT `fk_shops_owner` FOREIGN KEY (`owner_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Back-reference FKs added after shops is created
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_shop`    FOREIGN KEY (`shop_id`)            REFERENCES `shops`(`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_users_creator` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- TABLE 3: categories
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id`         VARCHAR(36)  NOT NULL,
  `name`       VARCHAR(255) NOT NULL,
  `slug`       VARCHAR(255) NOT NULL,
  `type`       ENUM('ACCESSORY','REPAIR') NOT NULL DEFAULT 'ACCESSORY',
  `image_url`  TEXT         DEFAULT NULL,
  `is_active`  TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_categories_slug` (`slug`),
  KEY        `idx_categories_type` (`type`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- TABLE 4: products
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id`                     VARCHAR(36)  NOT NULL,
  `shop_id`                VARCHAR(36)  NOT NULL,
  `category_id`            VARCHAR(36)  DEFAULT NULL,
  `name`                   VARCHAR(255) NOT NULL,
  `brand`                  VARCHAR(100) DEFAULT NULL,
  `sku`                    VARCHAR(100) DEFAULT NULL,
  `model_compatibility`    VARCHAR(255) DEFAULT NULL,
  `condition_state`        VARCHAR(50)  DEFAULT 'New',
  `warranty`               VARCHAR(100) DEFAULT NULL,
  `price_paise`            INT          NOT NULL,
  `compare_at_price_paise` INT          DEFAULT NULL,
  `discount_percent`       INT          DEFAULT 0,
  `stock`                  INT          NOT NULL DEFAULT 0,
  `status`                 ENUM('ACTIVE','DRAFT','ARCHIVED','OUT_OF_STOCK') NOT NULL DEFAULT 'ACTIVE',
  `features`               TEXT         DEFAULT NULL,
  `tags`                   TEXT         DEFAULT NULL,
  `description`            TEXT         DEFAULT NULL,
  `created_at`             TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`             TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_products_shop_status` (`shop_id`, `status`),
  KEY `idx_products_category`    (`category_id`),
  CONSTRAINT `fk_products_shop`     FOREIGN KEY (`shop_id`)     REFERENCES `shops`(`id`)      ON DELETE CASCADE,
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- TABLE 5: product_images
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `product_images`;
CREATE TABLE `product_images` (
  `id`         VARCHAR(36)  NOT NULL,
  `product_id` VARCHAR(36)  NOT NULL,
  `url`        TEXT         NOT NULL,
  `alt_text`   VARCHAR(255) DEFAULT NULL,
  `position`   INT          NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_images_order` (`product_id`, `position`),
  CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- TABLE 6: offers
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `offers`;
CREATE TABLE `offers` (
  `id`             VARCHAR(36)  NOT NULL,
  `shop_id`        VARCHAR(36)  NOT NULL,
  `title`          VARCHAR(255) NOT NULL,
  `text`           TEXT         DEFAULT NULL,
  `description`    TEXT         DEFAULT NULL,
  `discount_type`  ENUM('PERCENT','FLAT','BOGO') NOT NULL DEFAULT 'PERCENT',
  `discount_value` INT          NOT NULL DEFAULT 10,
  `code`           VARCHAR(50)  DEFAULT NULL,
  `theme_color`    VARCHAR(50)  DEFAULT 'indigo',
  `starts_at`      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ends_at`        TIMESTAMP    NULL DEFAULT NULL,
  `status`         ENUM('ACTIVE','EXPIRED','DRAFT') NOT NULL DEFAULT 'ACTIVE',
  `created_at`     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_offers_shop_status`   (`shop_id`, `status`),
  KEY `idx_offers_active_window` (`status`, `ends_at`),
  CONSTRAINT `fk_offers_shop` FOREIGN KEY (`shop_id`) REFERENCES `shops`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- TABLE 7: enquiries
-- Customer enquiries for a Product OR a Running Offer
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `enquiries`;
CREATE TABLE `enquiries` (
  `id`               VARCHAR(36)  NOT NULL,
  `shop_id`          VARCHAR(36)  NOT NULL,
  `customer_user_id` VARCHAR(36)  DEFAULT NULL,
  `customer_name`    VARCHAR(255) NOT NULL,
  `customer_phone`   VARCHAR(50)  NOT NULL,
  `product_id`       VARCHAR(36)  DEFAULT NULL,
  `offer_id`         VARCHAR(36)  DEFAULT NULL,
  `message`          TEXT         NOT NULL,
  `status`           ENUM('NEW','RESPONDED','CLOSED') NOT NULL DEFAULT 'NEW',
  `response_note`    TEXT         DEFAULT NULL,
  `responded_at`     TIMESTAMP    NULL DEFAULT NULL,
  `created_at`       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_enquiries_shop_status` (`shop_id`, `status`),
  KEY `idx_enquiries_product`     (`product_id`),
  KEY `idx_enquiries_offer`       (`offer_id`),
  KEY `idx_enquiries_customer`    (`customer_user_id`),
  CONSTRAINT `fk_enquiries_shop`     FOREIGN KEY (`shop_id`)          REFERENCES `shops`(`id`)    ON DELETE CASCADE,
  CONSTRAINT `fk_enquiries_customer` FOREIGN KEY (`customer_user_id`) REFERENCES `users`(`id`)    ON DELETE SET NULL,
  CONSTRAINT `fk_enquiries_product`  FOREIGN KEY (`product_id`)       REFERENCES `products`(`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_enquiries_offer`    FOREIGN KEY (`offer_id`)         REFERENCES `offers`(`id`)   ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- TABLE 8: orders
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id`               VARCHAR(36) NOT NULL,
  `shop_id`          VARCHAR(36) NOT NULL,
  `customer_user_id` VARCHAR(36) DEFAULT NULL,
  `status`           ENUM('PENDING','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `subtotal_paise`   INT         NOT NULL,
  `total_paise`      INT         NOT NULL,
  `placed_at`        TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at`       TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_orders_shop_placed` (`shop_id`, `placed_at`),
  CONSTRAINT `fk_orders_shop`     FOREIGN KEY (`shop_id`)          REFERENCES `shops`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_orders_customer` FOREIGN KEY (`customer_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- SECTION B: FULL CRUD QUERIES (? = prepared statement param for mysql2)
-- ============================================================================

-- ============================================================================
-- B1. USERS
-- ============================================================================

-- Check email exists (before register)
SELECT `id`, `email`, `role` FROM `users` WHERE `email` = ? LIMIT 1;

-- Get user by ID (with shop info)
SELECT u.`id`, u.`name`, u.`email`, u.`phone`, u.`role`, u.`status`,
       u.`shop_id`, u.`created_by_user_id`, u.`created_at`,
       s.`name` AS `shop_name`, s.`type` AS `shop_type`
FROM `users` u
LEFT JOIN `shops` s ON u.`shop_id` = s.`id`
WHERE u.`id` = ? LIMIT 1;

-- Login: get user with password hash + shop details
SELECT u.`id`, u.`name`, u.`email`, u.`phone`, u.`password_hash`, u.`role`, u.`status`,
       s.`id` AS `shop_id`, s.`name` AS `shop_name`, s.`type` AS `shop_type`, s.`is_verified`
FROM `users` u
LEFT JOIN `shops` s ON s.`owner_user_id` = u.`id` AND s.`is_active` = 1
WHERE u.`email` = ? AND u.`status` != 'SUSPENDED' LIMIT 1;

-- Register Super Seller
INSERT INTO `users` (`id`,`name`,`email`,`phone`,`password_hash`,`role`,`status`,`created_at`,`updated_at`)
VALUES (?, ?, ?, ?, ?, 'SUPER_SELLER', 'ACTIVE', NOW(), NOW());

-- Register Customer
INSERT INTO `users` (`id`,`name`,`email`,`phone`,`password_hash`,`role`,`status`,`created_at`,`updated_at`)
VALUES (?, ?, ?, ?, ?, 'CUSTOMER', 'ACTIVE', NOW(), NOW());

-- Super Seller creates Seller / Seller Admin
INSERT INTO `users` (`id`,`name`,`email`,`phone`,`password_hash`,`role`,`status`,`shop_id`,`created_by_user_id`,`created_at`,`updated_at`)
VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, NOW(), NOW());
-- Params: id, name, email, phone, password_hash, role(SELLER|SELLER_ADMIN), shop_id, created_by_user_id

-- Update user profile
UPDATE `users` SET `name`=?, `phone`=?, `updated_at`=NOW() WHERE `id`=?;

-- Change user status
UPDATE `users` SET `status`=?, `updated_at`=NOW() WHERE `id`=?;

-- Change user password
UPDATE `users` SET `password_hash`=?, `updated_at`=NOW() WHERE `id`=?;

-- Delete user
DELETE FROM `users` WHERE `id`=?;

-- List staff created by Super Seller
SELECT u.`id`, u.`name`, u.`email`, u.`phone`, u.`role`, u.`status`, u.`shop_id`,
       s.`name` AS `shop_name`, u.`created_at`
FROM `users` u
LEFT JOIN `shops` s ON u.`shop_id` = s.`id`
WHERE (u.`created_by_user_id`=? OR u.`shop_id`=?)
  AND u.`role` IN ('SELLER','SELLER_ADMIN')
ORDER BY u.`created_at` DESC;
-- Params: super_seller_user_id, super_seller_shop_id

-- ============================================================================
-- B2. SHOPS
-- ============================================================================

-- Create shop (for Super Seller)
INSERT INTO `shops` (`id`,`owner_user_id`,`name`,`type`,`description`,`phone`,`address`,
                     `latitude`,`longitude`,`is_active`,`is_verified`,`opening_hours`,`created_at`,`updated_at`)
VALUES (?, ?, ?, 'SUPER_SELLER', ?, ?, ?, ?, ?, 1, 1, '9:00 AM - 9:00 PM', NOW(), NOW());

-- Get shop by ID
SELECT s.*, u.`name` AS `owner_name`, u.`email` AS `owner_email`, u.`role` AS `owner_role`
FROM `shops` s
JOIN `users` u ON s.`owner_user_id` = u.`id`
WHERE s.`id` = ? LIMIT 1;

-- Get shop owned by user
SELECT * FROM `shops` WHERE `owner_user_id`=? AND `is_active`=1 LIMIT 1;

-- Get all active shops (customer browse)
SELECT `id`,`name`,`type`,`description`,`phone`,`address`,`latitude`,`longitude`,
       `opening_hours`,`rating`,`review_count`,`is_verified`
FROM `shops` WHERE `is_active`=1 ORDER BY `rating` DESC;

-- Update shop
UPDATE `shops`
SET `name`=?, `description`=?, `phone`=?, `address`=?, `opening_hours`=?, `updated_at`=NOW()
WHERE `id`=?;

-- Toggle shop active/inactive
UPDATE `shops` SET `is_active`=?, `updated_at`=NOW() WHERE `id`=?;

-- Delete shop (cascades to products, offers, enquiries)
DELETE FROM `shops` WHERE `id`=?;

-- ============================================================================
-- B3. CATEGORIES
-- ============================================================================

-- Create category
INSERT INTO `categories` (`id`,`name`,`slug`,`type`,`image_url`,`is_active`,`created_at`,`updated_at`)
VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW());

-- List all active categories
SELECT `id`,`name`,`slug`,`type`,`image_url` FROM `categories`
WHERE `is_active`=1 ORDER BY `type`, `name`;

-- Get category by slug
SELECT * FROM `categories` WHERE `slug`=? LIMIT 1;

-- Update category
UPDATE `categories` SET `name`=?, `slug`=?, `type`=?, `image_url`=?, `updated_at`=NOW() WHERE `id`=?;

-- Delete category
DELETE FROM `categories` WHERE `id`=?;

-- ============================================================================
-- B4. PRODUCTS
-- ============================================================================

-- Create product
INSERT INTO `products`
  (`id`,`shop_id`,`category_id`,`name`,`brand`,`sku`,`model_compatibility`,
   `condition_state`,`warranty`,`price_paise`,`compare_at_price_paise`,
   `discount_percent`,`stock`,`status`,`features`,`tags`,`description`,`created_at`,`updated_at`)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW());

-- Get all products for a shop (with category)
SELECT p.*, c.`name` AS `category_name`, c.`slug` AS `category_slug`, c.`type` AS `category_type`
FROM `products` p
LEFT JOIN `categories` c ON p.`category_id` = c.`id`
WHERE p.`shop_id`=? ORDER BY p.`created_at` DESC;

-- Get single product by ID
SELECT p.*, c.`name` AS `category_name`, c.`slug` AS `category_slug`
FROM `products` p
LEFT JOIN `categories` c ON p.`category_id` = c.`id`
WHERE p.`id`=? LIMIT 1;

-- Get all images for a product
SELECT `id`,`url`,`alt_text`,`position` FROM `product_images`
WHERE `product_id`=? ORDER BY `position` ASC;

-- Browse active products (customer view, all shops)
SELECT p.`id`,p.`name`,p.`brand`,p.`price_paise`,p.`compare_at_price_paise`,
       p.`discount_percent`,p.`condition_state`,p.`stock`,
       s.`id` AS `shop_id`, s.`name` AS `shop_name`, c.`name` AS `category_name`
FROM `products` p
JOIN  `shops` s ON p.`shop_id` = s.`id`
LEFT JOIN `categories` c ON p.`category_id` = c.`id`
WHERE p.`status`='ACTIVE' AND s.`is_active`=1 ORDER BY p.`created_at` DESC;

-- Update product
UPDATE `products`
SET `name`=?, `brand`=?, `category_id`=?, `sku`=?, `model_compatibility`=?,
    `condition_state`=?, `warranty`=?, `price_paise`=?, `compare_at_price_paise`=?,
    `discount_percent`=?, `stock`=?, `status`=?, `features`=?, `tags`=?,
    `description`=?, `updated_at`=NOW()
WHERE `id`=? AND `shop_id`=?;

-- Update stock only
UPDATE `products` SET `stock`=?, `updated_at`=NOW() WHERE `id`=? AND `shop_id`=?;

-- Change status only
UPDATE `products` SET `status`=?, `updated_at`=NOW() WHERE `id`=? AND `shop_id`=?;

-- Delete product (cascades to images and enquiries)
DELETE FROM `products` WHERE `id`=? AND `shop_id`=?;

-- ============================================================================
-- B5. PRODUCT IMAGES
-- ============================================================================

-- Add image
INSERT INTO `product_images` (`id`,`product_id`,`url`,`alt_text`,`position`,`created_at`,`updated_at`)
VALUES (?, ?, ?, ?, ?, NOW(), NOW());

-- Reorder image
UPDATE `product_images` SET `position`=?, `updated_at`=NOW() WHERE `id`=? AND `product_id`=?;

-- Delete single image
DELETE FROM `product_images` WHERE `id`=? AND `product_id`=?;

-- Delete ALL images for a product (before re-upload)
DELETE FROM `product_images` WHERE `product_id`=?;

-- ============================================================================
-- B6. OFFERS
-- ============================================================================

-- Create offer
INSERT INTO `offers`
  (`id`,`shop_id`,`title`,`text`,`description`,`discount_type`,`discount_value`,
   `code`,`theme_color`,`starts_at`,`ends_at`,`status`,`created_at`,`updated_at`)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', NOW(), NOW());

-- All active offers (customer browse)
SELECT o.`id`,o.`title`,o.`text`,o.`description`,o.`discount_type`,o.`discount_value`,
       o.`code`,o.`theme_color`,o.`starts_at`,o.`ends_at`,o.`status`,
       s.`id` AS `shop_id`, s.`name` AS `shop_name`, s.`phone` AS `shop_phone`, s.`rating`
FROM `offers` o
JOIN `shops` s ON o.`shop_id` = s.`id`
WHERE o.`status`='ACTIVE'
  AND (o.`ends_at` IS NULL OR o.`ends_at` > NOW())
  AND s.`is_active`=1
ORDER BY o.`created_at` DESC;

-- Offers for a shop (seller dashboard)
SELECT * FROM `offers` WHERE `shop_id`=? ORDER BY `created_at` DESC;

-- Get single offer by ID
SELECT o.*, s.`name` AS `shop_name`, s.`phone` AS `shop_phone`
FROM `offers` o JOIN `shops` s ON o.`shop_id`=s.`id`
WHERE o.`id`=? LIMIT 1;

-- Update offer
UPDATE `offers`
SET `title`=?, `text`=?, `description`=?, `discount_type`=?, `discount_value`=?,
    `code`=?, `theme_color`=?, `ends_at`=?, `status`=?, `updated_at`=NOW()
WHERE `id`=? AND `shop_id`=?;

-- Expire offer
UPDATE `offers` SET `status`='EXPIRED', `updated_at`=NOW() WHERE `id`=? AND `shop_id`=?;

-- Delete offer
DELETE FROM `offers` WHERE `id`=? AND `shop_id`=?;

-- ============================================================================
-- B7. ENQUIRIES
-- ============================================================================

-- Customer submits PRODUCT enquiry
INSERT INTO `enquiries`
  (`id`,`shop_id`,`product_id`,`offer_id`,`customer_user_id`,
   `customer_name`,`customer_phone`,`message`,`status`,`created_at`,`updated_at`)
VALUES (?, ?, ?, NULL, ?, ?, ?, ?, 'NEW', NOW(), NOW());
-- Params: id, shop_id, product_id, customer_user_id, name, phone, message

-- Customer submits OFFER enquiry
INSERT INTO `enquiries`
  (`id`,`shop_id`,`product_id`,`offer_id`,`customer_user_id`,
   `customer_name`,`customer_phone`,`message`,`status`,`created_at`,`updated_at`)
VALUES (?, ?, NULL, ?, ?, ?, ?, ?, 'NEW', NOW(), NOW());
-- Params: id, shop_id, offer_id, customer_user_id, name, phone, message

-- Seller fetches all enquiries for their shop (joined)
SELECT
  e.`id`, e.`customer_name`, e.`customer_phone`, e.`message`,
  e.`status`, e.`response_note`, e.`responded_at`, e.`created_at`,
  p.`id` AS `product_id`, p.`name` AS `product_name`, p.`price_paise`,
  o.`id` AS `offer_id`, o.`title` AS `offer_title`, o.`code` AS `offer_code`,
  o.`discount_type`, o.`discount_value`,
  CASE
    WHEN e.`offer_id`   IS NOT NULL THEN 'OFFER'
    WHEN e.`product_id` IS NOT NULL THEN 'PRODUCT'
    ELSE 'GENERAL'
  END AS `enquiry_type`
FROM `enquiries` e
LEFT JOIN `products` p ON e.`product_id` = p.`id`
LEFT JOIN `offers`   o ON e.`offer_id`   = o.`id`
WHERE e.`shop_id`=?
ORDER BY e.`created_at` DESC;

-- Count new (unread) enquiries
SELECT COUNT(*) AS `new_enquiry_count` FROM `enquiries`
WHERE `shop_id`=? AND `status`='NEW';

-- Get single enquiry
SELECT e.*, p.`name` AS `product_name`, o.`title` AS `offer_title`
FROM `enquiries` e
LEFT JOIN `products` p ON e.`product_id`=p.`id`
LEFT JOIN `offers`   o ON e.`offer_id`=o.`id`
WHERE e.`id`=? AND e.`shop_id`=? LIMIT 1;

-- Seller responds to enquiry
UPDATE `enquiries`
SET `status`=?, `response_note`=?, `responded_at`=NOW(), `updated_at`=NOW()
WHERE `id`=? AND `shop_id`=?;
-- Params: status(RESPONDED|CLOSED), response_note, enquiry_id, shop_id

-- Close enquiry
UPDATE `enquiries` SET `status`='CLOSED', `updated_at`=NOW() WHERE `id`=? AND `shop_id`=?;

-- Delete enquiry
DELETE FROM `enquiries` WHERE `id`=? AND `shop_id`=?;

-- ============================================================================
-- B8. ORDERS
-- ============================================================================

-- Place order
INSERT INTO `orders`
  (`id`,`shop_id`,`customer_user_id`,`status`,`subtotal_paise`,`total_paise`,`placed_at`,`created_at`,`updated_at`)
VALUES (?, ?, ?, 'PENDING', ?, ?, NOW(), NOW(), NOW());

-- Get all orders for a shop (with customer info)
SELECT o.*, u.`name` AS `customer_name`, u.`email` AS `customer_email`, u.`phone` AS `customer_phone`
FROM `orders` o
LEFT JOIN `users` u ON o.`customer_user_id` = u.`id`
WHERE o.`shop_id`=? ORDER BY o.`placed_at` DESC;

-- Get orders filtered by status
SELECT * FROM `orders` WHERE `shop_id`=? AND `status`=? ORDER BY `placed_at` DESC;
-- status options: PENDING | CONFIRMED | IN_PROGRESS | COMPLETED | CANCELLED

-- Customer's own orders (with shop name)
SELECT o.*, s.`name` AS `shop_name`
FROM `orders` o
JOIN `shops` s ON o.`shop_id`=s.`id`
WHERE o.`customer_user_id`=? ORDER BY o.`placed_at` DESC;

-- Update order status
UPDATE `orders` SET `status`=?, `updated_at`=NOW() WHERE `id`=? AND `shop_id`=?;

-- Delete order
DELETE FROM `orders` WHERE `id`=? AND `shop_id`=?;

-- ============================================================================
-- SECTION C: REPORTING & SECURITY QUERIES
-- ============================================================================

-- Dashboard stats (all in one query for a seller shop)
SELECT
  (SELECT COUNT(*) FROM `products`  WHERE `shop_id`=? AND `status`='ACTIVE') AS `active_products`,
  (SELECT COUNT(*) FROM `offers`    WHERE `shop_id`=? AND `status`='ACTIVE') AS `active_offers`,
  (SELECT COUNT(*) FROM `enquiries` WHERE `shop_id`=? AND `status`='NEW')    AS `new_enquiries`,
  (SELECT COUNT(*) FROM `orders`    WHERE `shop_id`=?)                        AS `total_orders`;
-- Params: shop_id x4

-- List all Super Sellers (Platform Admin view)
SELECT u.`id`, u.`name`, u.`email`, u.`phone`, u.`status`, u.`created_at`,
       s.`id` AS `shop_id`, s.`name` AS `shop_name`, s.`is_verified`
FROM `users` u
LEFT JOIN `shops` s ON s.`owner_user_id`=u.`id`
WHERE u.`role`='SUPER_SELLER' ORDER BY u.`created_at` DESC;

-- Security: verify product is enquiry-eligible (owned by Super Seller / Admin)
SELECT p.`id`, p.`name`, p.`status`, s.`id` AS `shop_id`, u.`role` AS `owner_role`
FROM `products` p
JOIN `shops` s ON p.`shop_id`=s.`id`
JOIN `users` u ON s.`owner_user_id`=u.`id`
WHERE p.`id`=? AND p.`status`='ACTIVE'
  AND u.`role` IN ('SUPER_SELLER','PLATFORM_ADMIN','SELLER_ADMIN')
LIMIT 1;

-- Security: verify offer is enquiry-eligible (active + owned by Super Seller / Admin)
SELECT o.`id`, o.`title`, o.`status`, s.`id` AS `shop_id`, u.`role` AS `owner_role`
FROM `offers` o
JOIN `shops` s ON o.`shop_id`=s.`id`
JOIN `users` u ON s.`owner_user_id`=u.`id`
WHERE o.`id`=? AND o.`status`='ACTIVE'
  AND (o.`ends_at` IS NULL OR o.`ends_at` > NOW())
  AND u.`role` IN ('SUPER_SELLER','PLATFORM_ADMIN','SELLER_ADMIN')
LIMIT 1;

-- ============================================================================
-- END OF QUERIES FILE
-- ============================================================================
