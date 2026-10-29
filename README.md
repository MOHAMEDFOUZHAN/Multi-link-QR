# Maple Connect QR

> **One QR. Everything Connected.**

Maple Connect QR is a modern, lightweight, high-performance multi-link QR code web platform built entirely using standard web technologies: **HTML5**, **CSS3**, and **Vanilla JavaScript**.

It requires **no frontend frameworks**, no compilation steps, and no heavyweight runtime dependencies.

---

## 🚀 Key Features

- **Multi-Link Profiles**: Create and customize mobile-optimized landing pages for businesses, restaurants, creators, or personal portfolios.
- **15+ Destination Types**:
  - Direct WhatsApp chat with optional prefilled text messages
  - Social media profiles (Instagram, Facebook, YouTube, LinkedIn, TikTok, X)
  - Google Maps & location directions
  - Direct contact links (`tel:` and `mailto:`)
  - Restaurant menus, online stores, Telegram, and custom URLs
- **Live Interactive Phone Mockup**: Real-time smartphone preview that instantly reflects every typed character, color swatch, and theme change.
- **High-Precision QR Engine**:
  - Generates real, scannable QR codes representing public profile URLs
  - Download high-res **PNG** (512px, 1024px, 2048px for print & billboards)
  - Download crisp, infinitely scalable **SVG** vector files
  - Optional center logo embed with protective white boundary for scanner safety
  - Print-ready sheet generator
- **Curated & Custom Themes**:
  - 5 Predefined styles: *Minimal*, *Business*, *Premium*, *Creative*, and *Dark Mode*
  - Granular control over background color, card/button color, accent colors, button shapes (rounded, pill, outline, soft, shadow), and typography
- **Local Analytics Tracking**:
  - Live impression counters and outbound click tracking
  - Click-Through Rate (CTR) calculations
  - Top-performing links breakdown with visual progress bars
  - Chronological event stream
- **Data Portability & Resilience**:
  - Defensive JSON parsing with versioned client storage (`maple_qr_v1_profiles`)
  - Single-click JSON backup export and import
  - Portable hash-encoded profile payload for instant serverless cross-device scanning
  - Zero server/framework runtime dependencies — ready for instant static deployment (Vercel, Netlify, GitHub Pages)

---

## 📁 Project Structure

```
MULTI-LINK QR/
├── index.html              # Main dashboard, studio editor, live preview & analytics
├── styles.css              # Deep navy & clean white SaaS design system
├── app.js                  # Core application logic, storage service, QR generator
├── cloud-sync.js           # Supabase cloud engine for Dynamic Wall QR codes
├── profile.html            # Public mobile-optimized landing page
├── profile.css             # Responsive public profile styling and theme system
├── profile.js              # Public page renderer, query parser & analytics logger
├── assets/
│   ├── logo.svg            # Official Maple Connect QR brand mark
│   └── vendor/
│       └── qrcode.min.js   # High-resolution vector QR code engine (ISO/IEC compliant)
├── README.md               # Complete documentation and architecture guide
└── package.json            # Minimal development scripts and lightweight server
```

---

## 🛠️ Local Development & Quick Start

### Prerequisites
- Node.js (v18 or higher recommended) to run the local development server.

### 1. Install dependencies
```bash
npm install
```

### 2. Start the local server
```bash
npm run dev
```

The application will start immediately at:
```
http://localhost:3000
```

> **Why use a local server instead of double-clicking `index.html`?**  
> Modern browsers enforce security restrictions (such as CORS and clipboard API access) on the `file:///` protocol. Running through `npm run dev` (powered by the lightweight `serve` utility) ensures full compatibility with the Clipboard API, local downloads, and canvas drawing.

---

## ⚡ Deploying to Vercel

This platform is 100% static HTML5, CSS3, and Vanilla JavaScript with zero server dependencies, making it instantly deployable to Vercel:

1. Import this repository in [Vercel](https://vercel.com/new).
2. Framework Preset: Choose **Other**.
3. Root Directory: `./` (default).
4. Click **Deploy**.

Vercel will deploy your multi-link landing page and QR studio in under 30 seconds. All generated QR codes will automatically use your live Vercel domain (`https://*.vercel.app`) for seamless mobile camera scanning worldwide!

---

## 📐 Architecture: Future Backend Readiness

All client data persistence is isolated behind `StorageService` inside `app.js` and `profile.js`:

```javascript
// StorageService interface:
StorageService.getProfiles()
StorageService.getProfileById(id)
StorageService.getProfileBySlug(slug)
StorageService.createProfile(data)
StorageService.updateProfile(id, updates)
StorageService.deleteProfile(id)
StorageService.duplicateProfile(id)
StorageService.getAnalyticsEvents()
```

### Swapping to a Backend (MySQL / REST API)
Because the UI never interacts directly with low-level `localStorage` calls across components, upgrading to a cloud database (MySQL/PostgreSQL) and backend API (e.g. Node/Express, Go, or Python) requires modifying **only** the `StorageService` methods to execute `fetch('/api/profiles')` requests. The dashboard, studio, live preview, and QR generation remain 100% intact.

---

## ⚠️ Prototype Storage Notice

- In this prototype version, all profile data, customization settings, and analytics events are persisted in the **browser's LocalStorage**.
- Profiles created in one browser are specific to that browser on that device.
- For public sharing across the open internet, the application can be connected to a centralized cloud backend and hosted on a public domain.

---

## 📄 License
MIT License. Created for Maple Connect QR.
