# Node.js Backend Specification: Dynamic Landing Page and Seller Dashboard

## Purpose

Replace the current mock data, browser `localStorage`, and file-based JSON store with a Node.js API backed by a database. The API will make the public landing page and seller dashboard dynamic, role-aware, and safe for multiple users.

This document is an implementation contract for the existing Next.js frontend. It can be implemented as:

- a standalone Node.js service using Express or Fastify, or
- Next.js route handlers/API routes while the app remains a single deployment.

Recommended stack: **Node.js + TypeScript + Fastify/Express + PostgreSQL + Prisma**. Use object storage (S3-compatible) for product images, Redis only if caching or queues become necessary, and a managed authentication provider or JWT-based authentication.

## Existing demo code to replace

| Current source | Limitation | Backend replacement |
| --- | --- | --- |
| `pages/api/sellers.js` | Static seller list | Nearby-shop query against shops and locations |
| `services/repairingService.js` | Browser-only repair data | Repair job and repair update APIs |
| `lib/apiStore.js` | Local JSON files; unsuitable for concurrent production users | Database repository/service layer |
| `pages/seller/dashboard.js` | Hard-coded products, counts, revenue, and shop data | Single seller dashboard summary endpoint |
| `pages/seller/products.js` | Browser `localStorage` product CRUD | Authenticated product and image APIs |
| `src/app/page.tsx` | Static radius, empty nearby state, static sections | Landing-page content and discovery APIs |

## Roles and authorization

| Role | Core permissions |
| --- | --- |
| Customer | Browse published shops/products; create enquiries and repair requests; view own requests/orders |
| Seller | Manage only their shop, products, offers, enquiries, orders, and repair jobs assigned to their shop |
| Seller Admin | Create local customer repair problems and view their shop's repair workflow |
| Super Seller | Review and update repair jobs assigned to their shop, including sellability/repair decisions |
| Platform Admin | Manage users, shops, categories, landing-page content, and moderation |

Every authenticated endpoint derives the active user and role from the access token. The client must never send a trusted `sellerId`, `ownerId`, or role in request data.

## Core data model

All records use UUIDs, `createdAt`, and `updatedAt`. Monetary fields use integer paise (for example, `19900` means INR 199.00), never floating-point values.

| Entity | Important fields |
| --- | --- |
| `User` | `id`, `name`, `email`, `phone`, `role`, `status` |
| `Shop` | `id`, `ownerUserId`, `name`, `type`, `description`, `phone`, `address`, `latitude`, `longitude`, `isActive`, `isVerified`, `openingHours` |
| `Product` | `id`, `shopId`, `categoryId`, `name`, `brand`, `sku`, `pricePaise`, `compareAtPricePaise`, `stock`, `status`, `description` |
| `ProductImage` | `id`, `productId`, `url`, `altText`, `position` |
| `Category` | `id`, `name`, `slug`, `type`, `isActive` |
| `Offer` | `id`, `shopId`, `title`, `discountType`, `discountValue`, `startsAt`, `endsAt`, `status` |
| `Enquiry` | `id`, `shopId`, `customerUserId`, `productId`, `message`, `status`, `respondedAt` |
| `Order` | `id`, `shopId`, `customerUserId`, `status`, `subtotalPaise`, `totalPaise`, `placedAt` |
| `RepairJob` | `id`, `shopId`, `customerId`, `deviceId`, `problemDescription`, `status`, `estimatedCostPaise`, `isSellable`, `assignedToUserId` |
| `RepairUpdate` | `id`, `repairJobId`, `authorUserId`, `status`, `note`, `estimatedCostPaise` |
| `LandingPageSection` | `id`, `key`, `title`, `subtitle`, `body`, `imageUrl`, `ctaLabel`, `ctaUrl`, `isPublished`, `sortOrder` |
| `Testimonial` | `id`, `authorName`, `role`, `quote`, `rating`, `isPublished`, `sortOrder` |

Suggested indexes: `Shop(isActive, latitude, longitude)`, `Product(shopId, status)`, `Order(shopId, placedAt)`, `Enquiry(shopId, status)`, and `RepairJob(shopId, status, createdAt)`. For a large shop catalogue, use PostgreSQL PostGIS geography indexes for nearby-shop searches.

## API conventions

- Base URL: `/api/v1`
- JSON request and response bodies use `camelCase`.
- List endpoints accept `page`, `limit`, `search`, `sort`, and applicable filters. Return `{ data, meta: { page, limit, total } }`.
- Success status codes: `200`, `201`, or `204`; validation: `422`; unauthenticated: `401`; forbidden: `403`; missing: `404`; conflict: `409`.
- Error body: `{ "error": { "code": "VALIDATION_ERROR", "message": "...", "fields": { "name": "Required" } } }`.
- Validate every body and query with Zod, Joi, or an equivalent server-side schema.
- Provide pagination and a maximum `limit` of 100.

## Authentication endpoints

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/auth/register` | Register customer or seller account; seller starts pending verification |
| `POST` | `/auth/login` | Return access token and refresh token/session cookie |
| `POST` | `/auth/refresh` | Rotate access token |
| `POST` | `/auth/logout` | Revoke session/refresh token |
| `GET` | `/auth/me` | Return current user and their active shop/role |

Use HTTPS, short-lived access tokens, refresh-token rotation, password hashing with Argon2 or bcrypt, rate limits on authentication routes, and httpOnly secure cookies if the frontend and API share a parent domain.

## Dynamic landing page

The landing page must fetch public data, not redirect based on `localStorage`. After login, `/auth/me` determines whether the user sees a dashboard link or is redirected by an intentional role-based navigation decision.

### Public endpoints

| Method | Route | Used by |
| --- | --- | --- |
| `GET` | `/public/landing-page` | Hero, banner, feature cards, how-it-works content, testimonials, featured categories, and SEO metadata |
| `GET` | `/shops/nearby?lat=12.9716&lng=77.5946&radiusMeters=2500&type=super` | Nearby Shops panel after browser location permission |
| `GET` | `/products/featured?limit=8` | Product showcase |
| `GET` | `/categories?type=accessory` | Category browsing/filtering |
| `GET` | `/shops/:shopId` | Shop profile/detail page |
| `GET` | `/shops/:shopId/products` | Shop catalogue |
| `POST` | `/enquiries` | Customer enquiry from a product/shop |

`GET /public/landing-page` response shape:

```json
{
  "data": {
    "topBanner": { "text": "Same-day repairs near you", "isVisible": true },
    "hero": {
      "title": "Mobile repairs and accessories, nearby",
      "subtitle": "Compare trusted local sellers.",
      "ctaLabel": "Find nearby shops"
    },
    "featuredCategories": [{ "id": "...", "name": "Chargers", "slug": "chargers", "imageUrl": "..." }],
    "howItWorks": [{ "title": "Share your location", "description": "...", "sortOrder": 1 }],
    "features": [{ "title": "Verified sellers", "description": "...", "icon": "ShieldCheck" }],
    "testimonials": [{ "authorName": "Asha", "quote": "...", "rating": 5 }]
  }
}
```

`GET /shops/nearby` must reject invalid coordinates and clamp `radiusMeters` to a safe range (for example 500–20,000). Return only active, published shops, sorted by `distanceMeters`.

```json
{
  "data": [{
    "id": "shop-uuid",
    "name": "Rapid Repairs & Accessories",
    "type": "SUPER_SELLER",
    "distanceMeters": 840,
    "address": "Indiranagar, Bengaluru",
    "isVerified": true,
    "rating": 4.7,
    "reviewCount": 138,
    "services": ["Screen repair", "Battery replacement"]
  }]
}
```

Location is sensitive data: request browser consent, use it only to service the nearby search, do not store exact coordinates without explicit user consent, and document retention rules if it is stored.

## Dynamic seller dashboard

Load the dashboard from one aggregate endpoint after authentication. It eliminates hard-coded values such as `Pooja Mobile`, 12 orders, and sample products.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/seller/dashboard?period=30d` | Header, shop status, KPI cards, chart series, low-stock count, and recent products/enquiries |
| `GET` | `/seller/products` | Paginated/filterable product list |
| `POST` | `/seller/products` | Create product for current seller's shop |
| `GET` | `/seller/products/:productId` | Read own product |
| `PATCH` | `/seller/products/:productId` | Update own product/details/stock/status |
| `DELETE` | `/seller/products/:productId` | Archive or delete own product |
| `POST` | `/uploads/presign` | Return a restricted presigned image-upload URL |
| `GET` | `/seller/orders` | Seller orders with status/date filters |
| `GET` | `/seller/offers` | Seller offers |
| `POST` | `/seller/offers` | Create offer |
| `PATCH` | `/seller/offers/:offerId` | Edit offer/status |
| `GET` | `/seller/enquiries` | Seller enquiries, newest first |
| `PATCH` | `/seller/enquiries/:enquiryId` | Reply/update enquiry status |
| `GET` | `/seller/shop` | Current seller shop profile |
| `PATCH` | `/seller/shop` | Update current seller shop profile |

Example dashboard response:

```json
{
  "data": {
    "seller": { "name": "Pooja" },
    "shop": {
      "id": "shop-uuid",
      "name": "Pooja Mobile",
      "isActive": true,
      "isVerified": true,
      "profileCompletionPercent": 100
    },
    "summary": {
      "activeProducts": 42,
      "orders": 12,
      "activeOffers": 3,
      "newEnquiries": 5,
      "revenuePaise": 2485000,
      "revenueChangePercent": 12.5,
      "lowStockProducts": 4
    },
    "revenueSeries": [
      { "date": "2026-09-01", "revenuePaise": 145000 },
      { "date": "2026-09-02", "revenuePaise": 173000 }
    ],
    "recentProducts": [{ "id": "...", "name": "Tempered Glass", "pricePaise": 19900, "stock": 42, "status": "ACTIVE" }],
    "recentEnquiries": [{ "id": "...", "customerName": "Asha", "message": "Available today?", "createdAt": "..." }]
  }
}
```

The dashboard query must calculate metrics from server-side data and scope every query to the current seller's `shopId`. Cache a short-lived aggregate response only after correctness is established; invalidate it after product, order, offer, or enquiry changes.

## Repair workflow APIs

These supersede the current local repair-problem service and keep the existing admin → super seller workflow.

| Method | Route | Role |
| --- | --- | --- |
| `POST` | `/seller/repair-customers` | Seller Admin |
| `GET` | `/seller/repair-customers` | Seller/Admin |
| `POST` | `/seller/repair-jobs` | Seller Admin |
| `GET` | `/seller/repair-jobs?status=SUBMITTED` | Seller/Admin/Super Seller, shop-scoped |
| `GET` | `/seller/repair-jobs/:jobId` | Authorized shop user |
| `PATCH` | `/seller/repair-jobs/:jobId` | Assigned Super Seller/Admin |
| `POST` | `/seller/repair-jobs/:jobId/updates` | Assigned Super Seller/Admin |
| `POST` | `/seller/repair-jobs/:jobId/payments` | Authorized shop user |

Use explicit repair statuses: `SUBMITTED`, `UNDER_REVIEW`, `QUOTED`, `APPROVED`, `IN_PROGRESS`, `READY`, `COMPLETED`, `CANCELLED`, and `NOT_REPAIRABLE`. Every status change creates a `RepairUpdate` audit record; do not allow a generic patch to silently overwrite workflow history.

## Frontend integration

1. Configure `NEXT_PUBLIC_API_BASE_URL` for the deployed API and use the existing Axios client in `src/lib/api/client.ts` as the single HTTP client.
2. Replace the landing-page static values with React Query calls to `/public/landing-page` and `/products/featured`.
3. Connect the Hero button to browser geolocation, then call `/shops/nearby` using the selected radius state. Render loading, permission-denied, empty, and error states.
4. On the seller dashboard, call `/auth/me` and `/seller/dashboard`; format `revenuePaise` on the client with `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`.
5. Replace all product `localStorage` reads/writes with seller product mutations. Invalidate `sellerProducts` and `sellerDashboard` queries after a successful change.
6. Upload images directly to object storage using `/uploads/presign`, then save the returned object URL/key as part of the product mutation. Never store base64 images in browser storage or the database.
7. Retire `lib/apiStore.js`, `services/repairingService.js`, and mock data only after the equivalent API paths are live and the UI has been migrated.

## Security and operational requirements

- Enforce authorization at the service/repository layer, not only in route middleware.
- Add request IDs, structured logs, health endpoints (`/health`, `/ready`), and error monitoring.
- Rate-limit authentication, public nearby searches, uploads, and enquiry creation.
- Validate upload content type and size, scan uploads if possible, and serve images from a CDN.
- Use database migrations, automated backups, and separate development/staging/production environments.
- Keep secrets only in environment variables: database URL, token keys, object-storage credentials, and allowed frontend origins.
- Add API tests for authentication, shop ownership boundaries, nearby-search sorting/radius limits, product CRUD, dashboard aggregation, and repair-status transitions.

## Delivery order

1. Create database schema, migrations, authentication, and shop ownership model.
2. Implement public landing, nearby shops, categories, and featured-products endpoints; migrate the landing page.
3. Implement seller profile, products, uploads, enquiries, offers, and orders; migrate seller management pages.
4. Implement the aggregate seller dashboard endpoint and remove dashboard mock values.
5. Implement the repair workflow and migrate all remaining `localStorage` repair flows.
6. Add monitoring, authorization tests, seed data, API documentation (OpenAPI), and deployment configuration.

## Acceptance criteria

- A visitor can change the radius and see real nearby shops returned from database data.
- Landing-page content, products, categories, and testimonials can be changed by an admin without a frontend deployment.
- A seller sees only their own shop’s products, metrics, offers, enquiries, orders, and repair jobs.
- Dashboard counts, revenue chart, shop status, and product table update after real API mutations and page refreshes.
- No landing-page, product, dashboard, or repair workflow state relies on `localStorage`, hard-coded dashboard arrays, or the JSON-file data store.
- All protected requests reject unauthenticated users and prevent cross-shop access.
