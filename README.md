# SmartFix Hub — Mobile Repair & 2% Referral Platform (Supabase & Next.js)

A complete full-stack **Next.js (App Router)** and **Supabase (PostgreSQL)** application implementing a hyperlocal mobile repair shop and accessory seller ecosystem with an automated **2% Seller Referral Commission** mechanism.

---

## 1. Supabase Credentials & Configuration

- **Supabase Project URL:** `https://gpvyatfnnkrsrckarxbh.supabase.com`
- **Supabase Anon Public Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwdnlhdGZubmtyc3Jja2FyeGJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyOTEyNzIsImV4cCI6MjEwODg2NzI3Mn0.1v5HSfsgDA-rWVKb6ftLO-fjQg6Cp2y4wtsNp9H9j9A`

These are already configured in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://gpvyatfnnkrsrckarxbh.supabase.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwdnlhdGZubmtyc3Jja2FyeGJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyOTEyNzIsImV4cCI6MjEwODg2NzI3Mn0.1v5HSfsgDA-rWVKb6ftLO-fjQg6Cp2y4wtsNp9H9j9A
```

---

## 2. Business Model & 2% Commission Formula

```
                        ┌─────────────────────────────────────┐
                        │             SUPER ADMIN             │
                        │    (Platform Owner & Auditor)       │
                        └──────────────────┬──────────────────┘
                                           │ Manages & Audits
                                           ▼
                        ┌─────────────────────────────────────┐
                        │          ADMIN (SHOP OWNER)         │
                        │   • Runs Mobile Repair Shop         │
                        │   • Completes Repairs & Enters Bill │
                        │   • Settle/Pay 2% to Seller         │
                        └───────▲─────────────────────▲───────┘
                                │                     │
            Refers Repair Client│                     │ Direct Customer
            & Earns 2% (₹40)    │                     │
                                │                     │
┌───────────────────────────────┴─────┐                 ┌────────────────────────┐
│               SELLER                │ ◄───────────────┤        CUSTOMER        │
│   • Sells Accessories               │  Customer Walk-in│  • Buys accessories   │
│   • Refers Repair Customers         │                 │  • Tracks repair by    │
│   • Earns 2% on Completed Jobs      │                 │    Ticket ID (REP-101) │
│   • Cannot alter repair bill        │                 │  • Views estimates     │
└─────────────────────────────────────┘                 └────────────────────────┘
```

### The 2% Referral Commission Formula

$$\text{Seller Commission (2\%)} = \text{round}(\text{Final Repair Bill} \times 0.02)$$
$$\text{Admin Shop Keeps (98\%)} = \text{Final Repair Bill} - \text{Seller Commission}$$

| Final Repair Bill | Seller Referral Commission (2%) | Admin Shop Keeps (98%) | Commission Status |
| :---: | :---: | :---: | :---: |
| **₹500** | **₹10** | ₹490 | `PENDING` $\rightarrow$ `PAID` |
| **₹1,000** | **₹20** | ₹980 | `PENDING` $\rightarrow$ `PAID` |
| **₹2,000** | **₹40** | ₹1,960 | `PENDING` $\rightarrow$ `PAID` |
| **₹5,000** | **₹100** | ₹4,900 | `PENDING` $\rightarrow$ `PAID` |
| **₹10,000** | **₹200** | ₹9,800 | `PENDING` $\rightarrow$ `PAID` |

---

## 3. How to Set Up Supabase Database

1. Open your Supabase Dashboard: **[https://supabase.com/dashboard/project/gpvyatfnnkrsrckarxbh](https://supabase.com/dashboard/project/gpvyatfnnkrsrckarxbh)**
2. Go to **SQL Editor** in the left sidebar.
3. Open `supabase/schema.sql` from this repository, copy all contents, paste into the SQL Editor, and click **Run**.
   - This creates all tables: `profiles`, `shops`, `repair_jobs`, `repair_commissions`, `products`, `offers`.
   - Sets up the automated PostgreSQL stored procedures `complete_repair_job` and `pay_seller_commission`.
   - Enables Row Level Security (RLS) policies.

---

## 4. Next.js Project Structure

```
mobile_marketplace_web/
├── supabase/
│   └── schema.sql                   # Complete PostgreSQL DDL & Stored Procedures
├── src/
│   ├── app/
│   │   ├── layout.jsx               # Next.js Root Layout with AuthProvider
│   │   ├── page.jsx                 # Modern Landing Page
│   │   ├── login/page.jsx           # Sign In + 1-Click Demo Login
│   │   ├── register/page.jsx        # Role-based Registration (Admin, Seller, Customer)
│   │   ├── dashboard/page.jsx       # Dedicated Role-Based Dashboard
│   │   ├── marketplace/page.jsx     # Products & Offers Catalog uploaded by Admin & Seller
│   │   ├── admin/page.jsx           # Dedicated Admin repair shop page
│   │   ├── seller/page.jsx          # Dedicated Seller referrals page
│   │   ├── super-admin/page.jsx     # Dedicated Super Admin oversight page
│   │   └── track/page.jsx           # Dedicated Customer repair tracker
│   ├── context/
│   │   └── AuthContext.jsx          # Global Auth Provider & Session State
│   ├── components/
│   │   ├── Navbar.jsx               # Top navigation with Auth profile & Role Switcher
│   │   ├── Providers.jsx            # Context providers wrapper
│   │   ├── CommissionCalculator.jsx # Live 2% calculation simulator
│   │   ├── AdminCompleteRepairModal.jsx # Auto-calculates 2% commission upon bill entry
│   │   ├── AdminPayCommissionModal.jsx  # Payout dialog
│   │   └── SellerReferralModal.jsx      # Referral submission modal
│   ├── lib/
│   │   └── supabase.js              # Universal Supabase client & REST fallback
│   └── services/
│       └── supabaseService.js       # Core business logic, Auth & CRUD operations
├── .env.local                       # Supabase URL & Anon Key
├── next.config.mjs                  # Next.js Configuration
├── tailwind.config.cjs              # Tailwind CSS configuration
├── postcss.config.cjs
├── package.json
└── README.md
```

---

## 5. Running the Application

### Development Server:
```bash
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser.

Use the **Instant Persona Switcher** in the top bar to toggle between:
- 🛠️ **Admin Suresh**: Repair Queue, Update Status, Complete Repair & Enter Bill, Pay 2% Commission
- 🏪 **Seller Rahul**: Refer Customer for Repair, Track 2% Commission Earnings
- 🛡️ **Super Admin**: Audit platform repair volume and 2% commission ledger
- 📱 **Customer**: Search repair status by Ticket ID (`REP-101`)
