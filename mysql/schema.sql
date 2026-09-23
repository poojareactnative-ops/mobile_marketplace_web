-- ============================================================================
-- HYPERLOCAL MARKETPLACE - MYSQL PRODUCTION SCHEMA DDL
-- Database: MySQL 5.7+ / 8.0+ Compatible
-- Supports: Super Seller Auth, Seller Creation, Product & Offer Enquiries
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `hyperlocal_marketplace`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `hyperlocal_marketplace`;

-- Disable FK checks during schema setup
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- 1. USERS TABLE (Super Sellers, Seller Admins, Customers, Platform Admins)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('CUSTOMER', 'SELLER', 'SELLER_ADMIN', 'SUPER_SELLER', 'PLATFORM_ADMIN') NOT NULL DEFAULT 'CUSTOMER',
  `status` ENUM('ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  `shop_id` VARCHAR(36) DEFAULT NULL,
  `created_by_user_id` VARCHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_email` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_shop_id` (`shop_id`),
  KEY `idx_users_created_by` (`created_by_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. SHOPS TABLE (Super Seller & Regular Seller Storefronts)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `shops`;
CREATE TABLE `shops` (
  `id` VARCHAR(36) NOT NULL,
  `owner_user_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `type` ENUM('SUPER_SELLER', 'ACCESSORY_SELLER') NOT NULL DEFAULT 'SUPER_SELLER',
  `description` TEXT DEFAULT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `latitude` DECIMAL(10, 7) NOT NULL DEFAULT 12.9716000,
  `longitude` DECIMAL(10, 7) NOT NULL DEFAULT 77.5946000,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `is_verified` TINYINT(1) NOT NULL DEFAULT 0,
  `opening_hours` VARCHAR(100) DEFAULT '9:00 AM - 9:00 PM',
  `rating` DECIMAL(3, 2) NOT NULL DEFAULT 4.70,
  `review_count` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_shops_owner` (`owner_user_id`),
  KEY `idx_shops_geo` (`is_active`, `latitude`, `longitude`),
  CONSTRAINT `fk_shops_owner` FOREIGN KEY (`owner_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add User -> Shop and User -> Creator foreign keys
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_shop` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_users_creator` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- 3. CATEGORIES TABLE
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `type` ENUM('ACCESSORY', 'REPAIR') NOT NULL DEFAULT 'ACCESSORY',
  `image_url` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_categories_slug` (`slug`),
  KEY `idx_categories_type` (`type`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. PRODUCTS TABLE
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
  CONSTRAINT `fk_products_shop` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. PRODUCT IMAGES TABLE
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `product_images`;
CREATE TABLE `product_images` (
  `id` VARCHAR(36) NOT NULL,
  `product_id` VARCHAR(36) NOT NULL,
  `url` TEXT NOT NULL,
  `alt_text` VARCHAR(255) DEFAULT NULL,
  `position` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_images_order` (`product_id`, `position`),
  CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. OFFERS TABLE (Promotional & Running Discounts)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `offers`;
CREATE TABLE `offers` (
  `id` VARCHAR(36) NOT NULL,
  `shop_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `text` TEXT DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `discount_type` ENUM('PERCENT', 'FLAT', 'BOGO') NOT NULL DEFAULT 'PERCENT',
  `discount_value` INT NOT NULL DEFAULT 10,
  `code` VARCHAR(50) DEFAULT NULL,
  `theme_color` VARCHAR(50) DEFAULT 'indigo',
  `starts_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ends_at` TIMESTAMP NULL DEFAULT NULL,
  `status` ENUM('ACTIVE', 'EXPIRED', 'DRAFT') NOT NULL DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_offers_shop_status` (`shop_id`, `status`),
  KEY `idx_offers_active_window` (`status`, `ends_at`),
  CONSTRAINT `fk_offers_shop` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. ENQUIRIES TABLE (Product & Running Offer Inquiries by Customers)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `enquiries`;
CREATE TABLE `enquiries` (
  `id` VARCHAR(36) NOT NULL,
  `shop_id` VARCHAR(36) NOT NULL,
  `customer_user_id` VARCHAR(36) DEFAULT NULL,
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
  KEY `idx_enquiries_product` (`product_id`),
  KEY `idx_enquiries_offer` (`offer_id`),
  KEY `idx_enquiries_customer` (`customer_user_id`),
  CONSTRAINT `fk_enquiries_shop` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_enquiries_customer` FOREIGN KEY (`customer_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_enquiries_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_enquiries_offer` FOREIGN KEY (`offer_id`) REFERENCES `offers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. ORDERS TABLE
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` VARCHAR(36) NOT NULL,
  `shop_id` VARCHAR(36) NOT NULL,
  `customer_user_id` VARCHAR(36) DEFAULT NULL,
  `status` ENUM('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  `subtotal_paise` INT NOT NULL,
  `total_paise` INT NOT NULL,
  `placed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_orders_shop_placed` (`shop_id`, `placed_at`),
  CONSTRAINT `fk_orders_shop` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_orders_customer` FOREIGN KEY (`customer_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- SCHEMA SETUP COMPLETED SUCCESSFULLY
-- ============================================================================
