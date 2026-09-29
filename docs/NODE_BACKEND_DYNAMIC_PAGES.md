# Node.js Backend Specification: Dynamic Landing Page, Seller Dashboard, and System Admin Management

## Purpose

Replace the current mock data, browser `localStorage`, and file-based JSON store with a Node.js API backed by a database. The API will make the public landing page and seller dashboard dynamic, role-aware, and safe for multiple users.

**Key User Flow Updates:**
1. **No Customer Registration Required:** Normal users (customers) do not create accounts or log in. They browse shops and products freely as visitors and send enquiries directly via WhatsApp.
2. **System User Role:** Introduced a `System User` (Platform Admin) who tracks visitor traffic ("how many users come") and reviews/approves Super Seller account registration requests before they can access the platform.

This document is an implementation contract for the existing Next.js frontend. It can be implemented as:

- a standalone Node.js service using Express or Fastify, or
- Next.js route handlers/API routes while the app remains a single deployment.

Recommended stack: **Node.js + TypeScript + Fastify/Express + PostgreSQL + Prisma**. Use object storage (S3-compatible) for product images, Redis for session/rate-limiting/analytics counters if necessary, and JWT-based authentication for backend users (Sellers and System Users).

## Existing demo code to replace

| Current source | Limitation | Backend replacement |
| --- | --- | --- |
| `pages/api/sellers.js` | Static seller list | Nearby-shop query against verified shops and locations |
| `services/repairingService.js` | Browser-only repair data | Repair job and repair update APIs |
| `lib/apiStore.js` | Local JSON files; unsuitable for concurrent production users | Database repository/service layer |
| `pages/seller/dashboard.js` | Hard-coded products, counts, revenue, and shop data | Single seller dashboard summary endpoint |
| `pages/seller/products.js` | Browser `localStorage` product CRUD | Authenticated product and image APIs |
| `src/app/page.tsx` | Static radius, empty nearby state, static sections | Visitor-friendly landing page and WhatsApp enquiry APIs |

## Roles and authorization

| Role | Access Level | Core permissions |
| --- | --- | --- |
| Normal User (Visitor / Customer) | Unauthenticated / Guest | Browse published shops, products, and categories; search nearby repair/accessory shops; generate pre-filled WhatsApp enquiry links directly to sellers. **No registration or login required.** |
| Super Seller | Authenticated (Requires System User approval) | Register shop application; after approval by System User, manage shop profile, products, offers, WhatsApp enquiry logs, repair jobs, and view shop performance. |
| Seller Admin | Authenticated | Create local customer repair problems, manage customer entries, and handle shop repair workflows. |
| System User (Platform Admin) | Authenticated | Track visitor analytics ("how many users come" - page views, unique visitors, WhatsApp clicks); review and accept/approve or reject Super Seller registration applications; manage platform categories and landing page content. |

Every authenticated endpoint derives the active user and role from the access token. The client must never send a trusted `sellerId`, `ownerId`, or role in request data.

## Core data model

All records use UUIDs, `createdAt`, and `updatedAt`. Monetary fields use integer paise (for example, `19900` means INR 199.00), never floating-point values.

| Entity | Important fields | Description |
| --- | --- | --- |
| `User` | `id`, `name`, `email`, `phone`, `passwordHash`, `role` (`SYSTEM_USER`, `SUPER_SELLER`, `SELLER_ADMIN`), `status` (`PENDING_APPROVAL`, `APPROVED`, `REJECTED`, `ACTIVE`, `SUSPENDED`) | Accounts for Super Sellers, Seller Admins, and System Users. Normal customers do not have User records. |
| `SuperSellerApplication` | `id`, `userId`, `shopName`, `shopType`, `phone`, `address`, `businessDocUrl`, `status` (`PENDING`, `APPROVED`, `REJECTED`), `reviewedBySystemUserId`, `reviewedAt`, `rejectionReason` | Application queue for System User review and account approval. |
| `Shop` | `id`, `ownerUserId`, `name`, `type`, `description`, `phone`, `whatsappNumber`, `address`, `latitude`, `longitude`, `isActive`, `isVerified`, `openingHours` | Seller business profile. `isVerified` and `isActive` are controlled by System User approval. |
| `Product` | `id`, `shopId`, `categoryId`, `name`, `brand`, `sku`, `pricePaise`, `compareAtPricePaise`, `stock`, `status`, `description` | Product catalogue items managed by approved sellers. |
| `ProductImage` | `id`, `productId`, `url`, `altText`, `position` | Image gallery per product. |
| `Category` | `id`, `name`, `slug`, `type`, `isActive` | Product and repair categories managed by System Users. |
| `Offer` | `id`, `shopId`, `title`, `discountType`, `discountValue`, `startsAt`, `endsAt`, `status` | Promotional discounts created by Super Sellers. |
| `WhatsAppEnquiry` | `id`, `shopId`, `productId`, `customerName`, `customerPhone`, `message`, `whatsappUrl`, `ipAddress`, `createdAt` | Logged when a guest user initiates a WhatsApp enquiry to a seller. |
| `VisitorAnalytics` | `id`, `visitorId` (anonymous UUID cookie/session), `ipHash`, `userAgent`, `pageUrl`, `actionType` (`PAGE_VIEW`, `NEARBY_SEARCH`, `WHATSAPP_ENQUIRY_CLICK`), `shopId`, `timestamp` | Recorded to track platform visitor traffic and user counts for the System User dashboard. |
| `RepairJob` | `id`, `shopId`, `customerName`, `customerPhone`, `deviceId`, `problemDescription`, `status`, `estimatedCostPaise`, `isSellable`, `assignedToUserId` | Repair orders submitted by Seller Admins and managed by Super Sellers. |
| `RepairUpdate` | `id`, `repairJobId`, `authorUserId`, `status`, `note`, `estimatedCostPaise` | Audit trail for repair job updates. |
| `LandingPageSection` | `id`, `key`, `title`, `subtitle`, `body`, `imageUrl`, `ctaLabel`, `ctaUrl`, `isPublished`, `sortOrder` | Managed by System Users for public display. |

Suggested indexes: `Shop(isActive, isVerified, latitude, longitude)`, `VisitorAnalytics(timestamp, actionType)`, `SuperSellerApplication(status)`, `Product(shopId, status)`, `WhatsAppEnquiry(shopId, createdAt)`, and `RepairJob(shopId, status, createdAt)`.

## API conventions

- Base URL: `/api/v1`
- JSON request and response bodies use `camelCase`.
- List endpoints accept `page`, `limit`, `search`, `sort`, and applicable filters. Return `{ data, meta: { page, limit, total } }`.
- Success status codes: `200`, `201`, or `204`; validation: `422`; unauthenticated: `401`; forbidden: `403`; missing: `404`; conflict: `409`.
- Error body: `{ "error": { "code": "VALIDATION_ERROR", "message": "...", "fields": { "name": "Required" } } }`.
- Validate every body and query with Zod, Joi, or an equivalent server-side schema.

## Authentication endpoints (Sellers & System Users)

Normal users (customers) **do not** register or log in. Registration is exclusively for sellers seeking platform access, subject to System User approval.

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/auth/register-seller` | Public | Register a new Super Seller account & shop details. Account status defaults to `PENDING_APPROVAL`. |
| `POST` | `/auth/login` | Public | Login for Super Sellers, Seller Admins, and System Users. Returns access token & user profile. Rejects `PENDING_APPROVAL` or `REJECTED` accounts with explanatory messages. |
| `POST` | `/auth/refresh` | Public | Rotate access token using refresh token. |
| `POST` | `/auth/logout` | Authenticated | Revoke refresh token / clear session. |
| `GET` | `/auth/me` | Authenticated | Return current user details, active role, shop profile, and application approval status. |

## Normal User (Customer) WhatsApp Enquiry & Public Endpoints

Customers require no login. They browse the site and launch enquiries directly to seller WhatsApp numbers.

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/public/landing-page` | Public | Fetch landing hero, banners, featured categories, and testimonials. |
| `GET` | `/shops/nearby?lat=12.9716&lng=77.5946&radiusMeters=2500` | Public | Fetch active and System-User verified nearby Super Sellers & accessory shops. |
| `GET` | `/products/featured?limit=8` | Public | View top featured accessories/products. |
| `GET` | `/categories?type=accessory` | Public | Browse product categories. |
| `GET` | `/shops/:shopId` | Public | View shop profile details and verified badge status. |
| `GET` | `/shops/:shopId/products` | Public | Browse shop catalogue. |
| `POST` | `/enquiries/whatsapp` | Public | Initiate a WhatsApp enquiry. Validates request, logs enquiry for analytics, increments shop lead count, and generates formatted WhatsApp web/app link (`https://wa.me/<whatsappNumber>?text=...`). |
| `POST` | `/analytics/track-visitor` | Public | Log visitor traffic event (page view, shop visit, search) for System User analytics. |

### WhatsApp Enquiry Request & Response Example

`POST /enquiries/whatsapp` payload:
```json
{
  "shopId": "shop-uuid-123",
  "productId": "prod-uuid-456",
  "customerName": "Ramesh Kumar",
  "customerPhone": "+919876543210",
  "message": "Hi, is this Tempered Glass in stock for iPhone 15?"
}
```

Response:
```json
{
  "data": {
    "enquiryId": "enquiry-uuid-789",
    "whatsappNumber": "919812345678",
    "whatsappUrl": "https://wa.me/919812345678?text=Hi%20Pooja%20Mobile%2C%20I%20am%20interested%20in%20Tempered%20Glass%20(Ref%3A%20prod-uuid-456).%20Message%3A%20Hi%2C%20is%20this%20Tempered%20Glass%20in%20stock%20for%20iPhone%2015%3F",
    "status": "REDIRECT_TO_WHATSAPP"
  }
}
```

## System User Endpoints (Traffic Tracking & Super Seller Approvals)

System Users (Platform Admins) have exclusive access to platform-wide traffic tracking and Super Seller application management.

| Method | Route | Role | Purpose |
| --- | --- | --- | --- |
| `GET` | `/system/analytics/visitors?period=30d` | System User | **Track user traffic:** Total site visits, unique visitors, daily visitor counts, top visited shops, and WhatsApp enquiry conversion counts. |
| `GET` | `/system/seller-applications?status=PENDING` | System User | **Super Seller Queue:** List all registered Super Seller applications awaiting review. |
| `GET` | `/system/seller-applications/:id` | System User | View detailed application info, owner contact, and business verification documents. |
| `PATCH` | `/system/seller-applications/:id/approve` | System User | **Accept Super Seller:** Approve application, update user status to `APPROVED`, set shop `isVerified = true` and `isActive = true`, send activation notification. |
| `PATCH` | `/system/seller-applications/:id/reject` | System User | Reject application with reason, update status to `REJECTED`. |
| `GET` | `/system/shops` | System User | Manage all platform shops (activate, suspend, verify). |
| `PATCH` | `/system/landing-page` | System User | Update landing page sections, banners, and hero text. |

### System User Visitor Tracking Response Example

`GET /system/analytics/visitors?period=7d` response:
```json
{
  "data": {
    "summary": {
      "totalPageViews": 14250,
      "uniqueVisitors": 3820,
      "nearbySearches": 2100,
      "whatsAppEnquiriesTriggered": 640,
      "activeSuperSellers": 28,
      "pendingSellerApplications": 5
    },
    "dailyTrafficSeries": [
      { "date": "2026-09-19", "pageViews": 1850, "uniqueVisitors": 510, "whatsAppEnquiries": 82 },
      { "date": "2026-09-20", "pageViews": 2100, "uniqueVisitors": 620, "whatsAppEnquiries": 95 }
    ],
    "topVisitedShops": [
      { "shopId": "shop-1", "shopName": "Pooja Mobile", "views": 1240, "whatsAppClicks": 88 }
    ]
  }
}
```

### System User Accept Super Seller Response Example

`PATCH /system/seller-applications/app-uuid-101/approve` response:
```json
{
  "data": {
    "applicationId": "app-uuid-101",
    "status": "APPROVED",
    "approvedAt": "2026-09-25T21:15:00Z",
    "user": {
      "id": "user-seller-01",
      "email": "seller@poojamobile.com",
      "status": "APPROVED",
      "role": "SUPER_SELLER"
    },
    "shop": {
      "id": "shop-uuid-123",
      "name": "Pooja Mobile Repair & Accessories",
      "isVerified": true,
      "isActive": true
    },
    "message": "Super Seller account successfully approved and activated."
  }
}
```

## Dynamic Seller Dashboard (Approved Super Sellers)

Available only to Super Sellers whose account status is `APPROVED` by a System User.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/seller/dashboard?period=30d` | Aggregate dashboard summary (KPI cards, stock alerts, WhatsApp enquiry count, repair statistics). |
| `GET` | `/seller/products` | Paginated product catalogue list for seller's shop. |
| `POST` | `/seller/products` | Add product to seller shop. |
| `GET` | `/seller/products/:productId` | View single product details. |
| `PATCH` | `/seller/products/:productId` | Update product details/stock/status. |
| `DELETE` | `/seller/products/:productId` | Archive/delete product. |
| `POST` | `/uploads/presign` | Obtain presigned S3/storage URL for product images. |
| `GET` | `/seller/enquiries` | View logged WhatsApp enquiry leads received by shop. |
| `GET` | `/seller/shop` | View shop profile. |
| `PATCH` | `/seller/shop` | Update shop details, WhatsApp number, opening hours. |

## Repair workflow APIs

Preserves the existing Admin → Super Seller repair workflow.

| Method | Route | Role |
| --- | --- | --- |
| `POST` | `/seller/repair-customers` | Seller Admin |
| `GET` | `/seller/repair-customers` | Seller Admin / Super Seller |
| `POST` | `/seller/repair-jobs` | Seller Admin |
| `GET` | `/seller/repair-jobs?status=SUBMITTED` | Seller Admin / Super Seller |
| `GET` | `/seller/repair-jobs/:jobId` | Authorized Shop User |
| `PATCH` | `/seller/repair-jobs/:jobId` | Assigned Super Seller / Admin |
| `POST` | `/seller/repair-jobs/:jobId/updates` | Assigned Super Seller / Admin |

Status enum: `SUBMITTED`, `UNDER_REVIEW`, `QUOTED`, `APPROVED`, `IN_PROGRESS`, `READY`, `COMPLETED`, `CANCELLED`, `NOT_REPAIRABLE`.

## Frontend integration

1. **Customer Flow (No Auth):**
   - Remove registration/login prompts for normal users on the landing page and shop listings.
   - When a customer clicks "Enquire" or "Buy on WhatsApp", trigger `POST /api/v1/enquiries/whatsapp` and redirect to the returned `whatsappUrl`.
   - On landing page load or shop view, send a lightweight ping to `POST /api/v1/analytics/track-visitor`.

2. **Super Seller Onboarding & Approval:**
   - Registration at `/seller/register` submits shop details to `POST /auth/register-seller`.
   - Show a pending status page ("Your Super Seller registration is pending System User approval").
   - Restrict access to `/seller/dashboard` until `status === 'APPROVED'`.

3. **System User Portal:**
   - Add `/system/admin` route handler/view for System Users.
   - Display Visitor Analytics tab (calling `GET /system/analytics/visitors`) with visitor charts and counts.
   - Display Pending Applications tab (calling `GET /system/seller-applications`) with "Accept / Approve" and "Reject" buttons for Super Seller applications.

4. **Retire obsolete code:**
   - Remove customer login/registration flows from `lib/apiStore.js` and pages.
   - Keep repair flow for Seller Admin and Super Seller.

## Security and operational requirements

- **Role-Based Access Control (RBAC):** Strict enforcement ensuring only `SYSTEM_USER` can access `/system/*` endpoints and accept Super Seller accounts.
- **Shop Scoping:** Super Sellers can only query or mutate data belonging to their approved `shopId`.
- **Visitor Privacy:** Track visitor analytics using hashed IP addresses (`ipHash`) and anonymized visitor identifiers. Do not store PII for unregistered normal users.
- **WhatsApp Sanitization:** Validate and sanitize phone numbers and pre-filled message strings to prevent injection.
- **Rate Limiting:** Protect public endpoints (`/shops/nearby`, `/enquiries/whatsapp`, `/analytics/track-visitor`) against abuse.

## Delivery order

1. **Database Schema & Migrations:** Update schema for `User` roles (`SYSTEM_USER`, `SUPER_SELLER`), `SuperSellerApplication`, `VisitorAnalytics`, and `WhatsAppEnquiry`.
2. **System User Module:** Implement visitor traffic tracking endpoints (`/system/analytics/visitors`) and Super Seller application approval endpoints (`/system/seller-applications/:id/approve`).
3. **Super Seller Registration & Onboarding:** Implement `/auth/register-seller` with `PENDING_APPROVAL` flow.
4. **WhatsApp Enquiry Module:** Implement `POST /enquiries/whatsapp` and public shop/product endpoints (no customer auth needed).
5. **Seller Dashboard & Repair Workflow:** Wire approved seller dashboard and existing repair job workflow.
6. **Testing & Verification:** Verify visitor counting, Super Seller registration approval by System User, and direct WhatsApp enquiry generation.

## Acceptance criteria

- **Normal Users:** Can browse shops, search nearby locations, view products, and initiate WhatsApp enquiries without any account registration or login.
- **WhatsApp Link Generation:** Clicking enquiry generates a working `wa.me` URL with pre-filled seller and item details while logging the event for analytics.
- **System User Traffic Tracking:** System User can view real-time traffic statistics detailing total visitors, unique visitors, page views, and WhatsApp enquiry counts.
- **System User Super Seller Acceptance:** Newly registered Super Sellers remain pending until a System User accepts/approves their application. Once approved, the Super Seller can log in and access their dashboard.
- **Security:** Unapproved Super Sellers cannot access shop management or seller APIs. Non-System Users cannot access admin traffic metrics or approval endpoints.

