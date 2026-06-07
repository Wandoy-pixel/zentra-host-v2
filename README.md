# 🚀 Zentra Host V2 — Next.js 14 Edition

Modern web hosting platform built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

🌐 **Live Demo:** _coming soon (deploy to Vercel)_
📂 **Source V1 (Vanilla):** [github.com/Wandoy-pixel/zentra-host](https://github.com/Wandoy-pixel/zentra-host)

---

## ✨ Features

### 🏠 Public Pages
- **Home** — Hero, features bento grid, pricing preview, CTA
- **Paket** — 3 hosting categories (Shared/Cloud/VPS) with toggle
- **Domain** — Deterministic domain search + price list
- **Kontak** — Contact form (saves to Supabase) + FAQ

### 🔐 Authentication
- Email/Password (Supabase Auth)
- Google OAuth
- Server actions with proper error handling
- Middleware-protected routes

### 📊 Dashboard
- **Overview** — Real-time stats, server status, resource usage (calculated from real orders), quick actions, activity timeline, notifications
- **Hosting** — Manage active hosting packages
- **DNS Manager** — Full CRUD for DNS records
- **Backup** — Create/restore/delete backups
- **cPanel** — Subdomain, Email, Database CRUD
- **Invoice** — Transaction history
- **Profile** — Edit account info

### 🎨 UX
- Dark/Light theme toggle (persisted)
- Toast notification system
- Mobile responsive
- Loading states everywhere
- Empty states with CTAs

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Backend** | Supabase (PostgreSQL + Auth + RLS) |
| **Auth** | @supabase/ssr (cookie-based) |
| **Deployment** | Vercel |
| **CI/CD** | GitHub Actions (via Vercel integration) |

---

## 📦 Database Schema

10 tables with Row Level Security:

1. **profiles** — User info extends auth.users
2. **orders** — Transactions
3. **messages** — Contact form submissions
4. **dns_records** — DNS Manager CRUD
5. **backups** — Backup management
6. **notifications** — Real-time notifications
7. **activity_log** — User activity tracker
8. **subdomains** — cPanel Subdomain manager
9. **email_accounts** — cPanel Email manager
10. **user_databases** — cPanel MySQL manager

All tables have RLS policies: user can only access their own data.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17+
- Supabase project (sudah ada: `nkzfgcdwyckzgxcdvumu`)
- Vercel account (for deployment)

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables
# .env.local already configured with Supabase credentials

# 3. Run dev server
npm run dev

# 4. Open http://localhost:3000
```

### Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start

# Type check
npm run type-check
```

---

## 📁 Project Structure

```
zentra-host-v2/
├── app/
│   ├── actions/              # Server Actions
│   │   ├── auth.ts           # login, register, logout
│   │   ├── orders.ts         # checkout, getOrders
│   │   └── resources.ts      # DNS, backup, cPanel CRUD
│   ├── dashboard/
│   │   ├── layout.tsx        # Sidebar + auth gate
│   │   ├── page.tsx          # Overview
│   │   ├── hosting/page.tsx
│   │   ├── dns/page.tsx
│   │   ├── backup/page.tsx
│   │   ├── cpanel/page.tsx
│   │   ├── invoice/page.tsx
│   │   └── profile/page.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── paket/page.tsx
│   ├── domain/page.tsx
│   ├── kontak/page.tsx
│   ├── checkout/page.tsx
│   ├── page.tsx              # Home
│   ├── layout.tsx            # Root layout
│   └── globals.css
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── ThemeProvider.tsx
│   ├── ThemeToggle.tsx
│   ├── ToastProvider.tsx
│   └── DashboardSidebar.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Browser client
│   │   ├── server.ts         # Server client
│   │   └── middleware.ts     # Auth middleware
│   ├── types.ts
│   └── data.ts               # Static paket/domain data
├── middleware.ts             # Route protection
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🔒 Security

- ✅ Row Level Security on all tables
- ✅ Server actions (no exposed API endpoints)
- ✅ Auth middleware protects /dashboard
- ✅ Password hashed by Supabase (bcrypt)
- ✅ HTTPS enforced by Vercel
- ✅ Session cookies httpOnly

---

## 📊 Architecture Highlights

### Server Components by Default
Dashboard pages are Server Components — fetch data directly from Supabase on the server. No client-side waterfalls.

### Server Actions for Mutations
All mutations (create order, add DNS, etc.) use Next.js Server Actions — no API routes needed.

### Real-time Triggers
Every user action automatically:
- Logs to `activity_log` table
- Creates a `notification` for the user
- Revalidates affected pages

### Theme Persistence
Uses CSS variables + localStorage. SSR-safe with hydration handling.

---

## 🌟 What's Different from V1?

| Aspect | V1 (Vanilla) | V2 (Next.js) |
|---|---|---|
| Architecture | Single HTML file SPA | Multi-page Next.js App |
| Routing | Hash-based (`#dashboard`) | File-based (`/dashboard`) |
| Auth | Client-side Supabase | SSR with cookies |
| Type Safety | None | Full TypeScript |
| Styling | Inline CSS | Tailwind CSS |
| SEO | Limited | Full SSR/Metadata |
| Performance | Decent | Optimized (RSC) |
| Dev Experience | Manual | Hot reload, types |

---

## 🚢 Deploy to Vercel

```bash
# Push to GitHub
git push origin main

# Then on Vercel:
# 1. Import repository
# 2. Framework Preset: Next.js (auto-detected)
# 3. Environment Variables:
#    - NEXT_PUBLIC_SUPABASE_URL
#    - NEXT_PUBLIC_SUPABASE_ANON_KEY
# 4. Deploy!
```

---

## 📝 License

MIT License — Built for production use.

---

**🎓 Built by [Wandoy](https://github.com/Wandoy-pixel) — 2026**
