# Maple Connect QR — Multi-Client SaaS Agency Platform

> **One QR. Everything Connected.** Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Supabase Cloud**.

Maple Connect QR is a powerful, production-grade Multi-Link QR SaaS Agency platform engineered for agencies managing **100+ local shops and business clients**.

---

## 🚀 Key Features

- **👑 SaaS Agency Multi-Client Command Center (`/`)**:
  - Manage 100+ local shop and business clients from a single command dashboard.
  - Real-time KPI summary: Total Shops, Active Paid Clients (🟢), Expiring Soon (≤ 7 days ⚠️), Suspended/Unpaid (🔴), and Estimated Monthly Revenue ($).
  - Search by shop name, owner name, phone, or slug; filter by Active, Expiring, Suspended, or Expired.
  - Sort by due date, name, plan fee, or creation date.
- **⚡ Instant 1-Click Kill-Switch**:
  - Instant toggle switch to flip any client between **Active / Paid 🟢** and **Suspended / Unpaid 🔴**.
  - Syncs instantly to **Supabase Cloud Database** and local storage.
  - Permanent printed acrylic standee QR codes never need to be reprinted!
- **🔒 Dynamic Lock Screen (`/p/[slug]`)**:
  - When unpaid, suspended, or expired: customer scans are immediately redirected to a clean, professional **"Page Not Available / Subscription Expired"** lock screen.
  - All shop links, phone numbers, menus, and socials remain completely suppressed.
  - Displays a direct **"Contact Agency to Renew"** button via WhatsApp / phone.
- **⏳ Auto-Expiration & Subscription Engine**:
  - Set subscription validity dates (30 days, 90 days, 1 year, or lifetime).
  - 1-click **Renew (+30 Days)** button extends validity instantly.
  - Dynamic countdown badges (e.g. "Expires in 3 days", "Expired 2 days ago").
  - 1-click **WhatsApp Payment Reminders** with prefilled polite messages to shop owners.
- **🖨️ Acrylic Counter Standee & Print Generator**:
  - Generates ready-to-print acrylic table standees with the client's shop name, tagline, "SCAN WITH PHONE CAMERA" badge, and high-contrast QR code.
  - Direct 1-click print formatting (`window.print()`).
  - Download high-res PNG (1024x1024px) for print shops.
  - Download vector SVG for large-format signage.
- **📱 Studio & Generator with Live Smartphone Mockup**:
  - Interactive smartphone mockup that dynamically updates with shop name, avatar, bio, links, and themes.
  - Toggle between **Preview Active Mode** and **Preview Suspended Lock** in real-time.
  - 5 Curated Themes: *Minimal Light*, *Navy Business*, *Obsidian Azure*, *Royal Amethyst*, and *Pure Black*.
  - Button Shapes: *Rounded (12px)*, *Pill (9999px)*, *Wire Outline*, and *Card Shadow*.
  - 15+ destination types: WhatsApp, Instagram, Facebook, YouTube, LinkedIn, Google Maps, Phone, Email, Menu, Store, Website.
  - Direct vCard (.vcf) download for customers to save shop contacts with 1 click.

---

## 📁 Modern Next.js Architecture

```
MULTI-LINK QR/
├── app/
│   ├── layout.tsx              # Root HTML & metadata layout
│   ├── page.tsx                # Admin SaaS Command Center & Studio (React Client)
│   ├── globals.css             # Unified SaaS design system & theme stylesheets
│   └── p/
│       └── [slug]/
│           ├── page.tsx        # Public QR scanner landing page (Server Component)
│           └── ProfileClient.tsx # Interactive profile & lock screen (Client Component)
├── lib/
│   ├── types.ts                # TypeScript data models & subscription types
│   ├── supabase.ts             # Supabase cloud database client & sync methods
│   ├── storage.ts              # LocalStorage cache, expiry calculations & purger
│   └── brand-icons.tsx         # Optimized SVG icons for Instagram, Facebook, YouTube, LinkedIn
├── public/
│   └── assets/
│       └── logo.svg            # Agency logo mark
├── .env                        # Supabase Cloud URL & Publishable Key
├── next.config.ts              # Next.js configuration
├── package.json                # Next.js 16, React 19, TypeScript, QRCode, Supabase
└── tsconfig.json               # Path aliases (@/*) and TypeScript configuration
```

---

## ⚙️ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase Cloud (Already in `.env`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://igbqdesjyepguqrluxlu.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_knwjJsGcS-4tz9mHNW5_gw_cKoTnnlg
```

#### Supabase Database Table Schema (Run in Supabase SQL Editor if starting from scratch):
```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  slug text PRIMARY KEY,
  name text NOT NULL,
  bio text,
  avatar_url text,
  contact_phone text,
  contact_email text,
  theme text DEFAULT 'minimal',
  button_shape text DEFAULT 'rounded',
  links jsonb DEFAULT '[]'::jsonb,
  client_name text,
  client_phone text,
  plan_price text DEFAULT '25',
  currency text DEFAULT '$',
  billing_cycle text DEFAULT 'monthly',
  status text DEFAULT 'active',
  expiry_date text,
  inactive_message text,
  admin_contact text,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for QR code scanners)
CREATE POLICY "Allow public read access"
  ON public.profiles FOR SELECT
  USING (true);

-- Allow public upsert/write
CREATE POLICY "Allow public insert and update"
  ON public.profiles FOR ALL
  USING (true)
  WITH CHECK (true);
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```
