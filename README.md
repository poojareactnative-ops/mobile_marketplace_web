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
