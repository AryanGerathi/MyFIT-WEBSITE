
# MyFit – Fitness Creator Marketplace

A modern, responsive marketplace where users discover fitness creators, book 1-on-1 sessions, and creators/admins manage their business. **Frontend-only v1 with mock data** — clickable end-to-end so it feels like a real product.

## Design direction
- **Palette:** Crisp **white** background with deep **dark navy** (`#0B1B3B`) as the primary, paired with a vivid **electric blue** accent (`#2563EB`) for CTAs and highlights. Soft slate greys for borders/muted text. Optional dark mode toggle (navy → near-black).
- **Typography:** **Outfit** for headings (bold, modern), **Figtree** for body — lifestyle brand feel.
- **Style:** Card-based, generous whitespace, rounded-xl corners, soft shadows, smooth hover/scroll animations. Mobile-first responsive.
- **Currency:** INR (₹) throughout. Payment options: UPI, Card, Net Banking.

## Pages & routes

**Public**
1. **/** — Landing: navbar, hero ("Train with Top Fitness Creators"), featured creators grid, "How It Works" 3-step, testimonials, footer.
2. **/explore** — Creator listing with left sidebar filters (price slider, category, rating) + sort dropdown + responsive card grid.
3. **/creator/:id** — Profile: photo, verified badge, bio, pricing, experience, specialization, date picker + time slot buttons, reviews, "Book Session" CTA.
4. **/booking** — Booking summary (creator, date, time, price) → "Proceed to Payment".
5. **/payment** — Order summary + tabbed UPI / Card / Net Banking forms → "Pay Now" → success toast → redirect to user dashboard.
6. **/login** & **/signup** — Tabs for "Continue as User" / "Continue as Creator" (UI only, mock auth via local state).

**User dashboard** (`/dashboard/*`)
- Sidebar: Dashboard, My Bookings, Saved Creators, Profile, Logout
- Upcoming sessions cards with **Join Session** button, bookings list (Upcoming/Completed tabs), saved creators, profile edit.

**Creator dashboard** (`/creator-dashboard/*`)
- Sidebar: Dashboard, Schedule, Bookings, Earnings, Profile
- KPI cards (earnings, clients, upcoming), schedule calendar with add-slot, bookings list with **Start Session**, earnings + withdraw, profile editor.

**Admin dashboard** (`/admin/*`)
- Sidebar: Overview, Users, Creators, Payments, Bookings, Reports
- KPI cards + revenue chart, creator approval table (Approve/Reject), users table, transactions table with commission column.

**Video call:** "Join/Start Session" buttons open a modal with a mock meeting link (placeholder for Zoom/Daily integration later).

## Shared building blocks
- Top navbar (with auth state + role-aware links) and footer on public pages.
- Reusable `CreatorCard`, `KpiCard`, `BookingCard`, `Sidebar` (shadcn sidebar with collapsible mini mode), `RatingStars`.
- Mock data file (`src/data/mock.ts`) for creators, bookings, reviews, transactions so every screen feels populated.
- Toast notifications for booking, payment, approval actions.
- Light/dark theme toggle in navbar.

## Out of scope (v1)
Real auth, database, payments, and video calls — all mocked. Easy to wire to Lovable Cloud + Stripe/Razorpay + Daily.co later.
