# Hyperlocal Mobile Marketplace (Demo)

This repository is a minimal Next.js scaffold demonstrating a hyperlocal marketplace for mobile accessories and repairs.

User roles implemented in the demo:

- Customer: detects location and discovers nearby Super Sellers and Accessory Sellers.
- Super Seller: registration stub + concept for repairs + accessories.
- Accessory Seller: registration stub.
- Platform Admin: not implemented in UI (would manage users/shops).

Core demo features:

- Client geolocation detection using the browser.
- Configurable radius (meters) to limit visible shops.
- Mock API at `/api/sellers` that filters sellers by distance using the Haversine formula.

How to run:

```bash
cd "./"
npm install
npm run dev
```

Tailwind setup (one-time, after updating repo):

```bash
# install tailwind and postcss deps
npm install -D tailwindcss postcss autoprefixer
# (we included config files already) then run dev
npm run dev
```

You can further customise `tailwind.config.cjs` and add utility classes in `styles.css`.

Open http://localhost:3000 and allow location access.

Notes:
- This is a demo scaffold. Registration pages are non-functional stubs.
- To implement full functionality, add authentication, persistent storage, administrative UIs, and server-side shop management.


repairing for admin :
admin : 
1) add repairing problems of their local customer
2) list the total mobile repairing problem for supper seller
3) view the detail for repairing proble after submitting the mobile repairing problem 

repairing is Order for super seller :
1) super seller will update mobile repairing proble of problem is soldable 
2) 

Demo: Admin -> Super Seller flow

You can test a basic admin->super-seller repairing flow locally without a backend:

1. As an Admin, open: /seller/admin/repairing/customers and click `+ Submit Problem`.
2. Fill customer details and submit — the problem is saved in browser localStorage.
3. As a Super Seller, open: /seller/super-seller/repairing/solutions to review submitted problems.
4. Click `Review` and `Mark Sellable` to simulate the super seller accepting the problem.

All data is stored in `localStorage` under the key `repair_problems` for demo purposes.

