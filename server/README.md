# SmartFix Hub - Node.js Backend API

Production-ready Node.js & Express REST API powered by **Supabase PostgreSQL** and **Supabase Auth**.

---

## 1. Architectural Overview

```
server/
├── index.js                  # Main server entrypoint (Express, CORS, routes & error handling)
├── config/
│   └── supabase.js           # Supabase client initialization (@supabase/supabase-js)
├── middleware/
│   └── auth.js               # Supabase Auth verification & Role-Based Access Control (RBAC)
├── controllers/
│   ├── repairController.js   # Repair jobs, referrals, status, completion & 2% split
│   ├── commissionController.js# 2% commission ledger, summaries & settlements
│   ├── shopController.js     # Shop registration, GPS geofence data, seller onboarding
│   ├── catalogController.js  # Mobile accessories & promotional offers
│   └── inquiryController.js  # Zero-login guest customer inquiries & leads
├── routes/
│   ├── authRoutes.js         # /api/auth
│   ├── repairRoutes.js       # /api/repairs
│   ├── commissionRoutes.js   # /api/commissions
│   ├── shopRoutes.js         # /api/shops
│   ├── catalogRoutes.js      # /api/catalog
│   └── inquiryRoutes.js      # /api/inquiries
└── package.json              # Server package scripts
```

---

## 2. Authentication: Managed via Supabase

Authentication is handled natively by **Supabase Auth**:
- **Clients (Next.js / Mobile)** sign in directly via Supabase Auth (`supabase.auth.signInWithPassword(...)`).
- Clients send the returned JWT access token in the `Authorization` header:
  ```http
  Authorization: Bearer <supabase_access_token>
  ```
- The backend middleware ([`server/middleware/auth.js`](./middleware/auth.js)) calls `supabase.auth.getUser(token)` to validate the session and loads the user's role (`ADMIN`, `SELLER`, `SUPER_ADMIN`, `CUSTOMER`) from the `profiles` table.

---

## 3. API Endpoints Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/auth/me` | Authenticated | Get current authenticated user profile and shop affiliation |
| `POST` | `/api/auth/validate-token` | Public | Validate a Supabase JWT token and return profile data |

---

### 🛠️ Repair Jobs (`/api/repairs`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/repairs/track/:ticketId` | **Public (Zero-Login)** | Customer looks up repair status by ticket ID (e.g. `REP-1048`) |
| `GET` | `/api/repairs` | Authenticated | List repair jobs (supports `?adminId=&sellerId=&status=`) |
| `POST` | `/api/repairs` | Seller / Admin | Create repair referral (generates `REP-XXXX` ticket) |
| `PATCH` | `/api/repairs/:id/status` | Admin | Update status (`ACCEPTED`, `IN_PROGRESS`, `CANCELLED`) |
| `POST` | `/api/repairs/:id/complete` | Admin | Complete repair, enter final amount, and **auto-calculate 2% commission split** |

---

### 💰 2% Commissions Ledger (`/api/commissions`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/commissions` | Seller / Admin | Fetch commissions ledger + totals (`totalCommission`, `paidCommission`, `pendingCommission`) |
| `POST` | `/api/commissions/:id/pay` | Admin | Record commission payout with UPI / Bank transaction reference |

---

### 🏪 Shops & Onboarding (`/api/shops`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/shops` | Public | List verified shops with coordinates (`latitude`, `longitude`) for 1–2 km geofence |
| `POST` | `/api/shops` | Admin | Register new physical repair shop |
| `POST` | `/api/shops/onboard-seller` | Admin | Onboard 2% partner accessory store |
| `GET` | `/api/shops/sellers` | Admin | List all affiliated partner sellers |

---

### 📦 Catalog & Offers (`/api/catalog`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/catalog/products` | Public | List accessories catalog (`?category=&search=`) |
| `POST` | `/api/catalog/products` | Admin / Seller | Upload new mobile accessory product |
| `DELETE` | `/api/catalog/products/:id` | Admin / Seller | Delete product by ID |
| `GET` | `/api/catalog/offers` | Public | List active promotional repair and accessory deals |
| `POST` | `/api/catalog/offers` | Admin / Seller | Publish promotional discount |
| `DELETE` | `/api/catalog/offers/:id` | Admin / Seller | Delete offer by ID |

---

### 📩 Customer Inquiries (`/api/inquiries`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/inquiries` | **Public (Zero-Login)** | End-user sends query on product or offer |
| `GET` | `/api/inquiries` | Shop Owner | Retrieve incoming customer leads |
| `PATCH` | `/api/inquiries/:id/status` | Shop Owner | Update inquiry status (`NEW`, `CONTACTED`, `RESOLVED`) |

---

## 4. Running the Server

### Using Root NPM Scripts
From the project root directory:
```bash
# Start server in production mode (port 5001)
npm run server

# Start server in development mode (with auto-reload on file change)
npm run server:dev
```

### Server Port Configuration
By default, the server runs on port **5001** (to avoid conflicting with Next.js on port 3000). You can customize it in `.env`:
```env
BACKEND_PORT=5001
```
Check health:
```bash
curl http://localhost:5001/api/health
```

