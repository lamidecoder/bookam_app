# Bookam 🏨

> Hotels, shortlets and event centers — all in one place.

A Lagos-based property booking app built with **Expo Router** (same stack as Displyn).

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | Expo SDK 52 + Expo Router v4 |
| UI | React Native + expo-linear-gradient |
| State | Zustand (for cart/booking state) |
| Auth | AsyncStorage (swap for Supabase) |
| Payments | Paystack (Phase 1) |
| Navigation | File-based routing via expo-router |

---

## Folder Structure

```
bookam/
├── app/
│   ├── _layout.tsx          ← Root layout + auth guard (like Displyn)
│   ├── index.tsx            ← Entry redirect
│   ├── onboarding.tsx       ← 3-slide onboarding (from Figma)
│   ├── auth/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   └── tabs/
│       ├── _layout.tsx      ← Bottom nav
│       ├── home.tsx         ← Listings feed
│       ├── explore.tsx      ← Map + filters
│       ├── bookings.tsx     ← My bookings
│       └── profile.tsx      ← Account
├── constants/
│   └── theme.ts             ← Colors, spacing, radii
├── components/
│   ├── ui/                  ← Reusable primitives
│   └── shared/              ← Shared feature components
├── store/                   ← Zustand stores
├── lib/                     ← API, Supabase, Paystack helpers
└── hooks/                   ← Custom hooks
```

---

## Getting Started

```bash
# 1. Install deps
npm install

# 2. Start Expo Go
npx expo start

# 3. Scan QR with Expo Go app (Android)
```

---

## Production Checklist (before store submission)

- [ ] `app/_layout.tsx` — Currently routes to `/onboarding` always. Restore full auth check for prod.
- [ ] Add Supabase credentials to `lib/supabase.ts`
- [ ] Add Paystack public key to `lib/paystack.ts`
- [ ] Add Google OAuth client IDs
- [ ] Replace emoji placeholder images with real `require()` asset imports
- [ ] Add Supabase RLS policies for listings, bookings, users

---

## Onboarding Slides (from Figma — Bookam)

| Slide | Headline | Subtext |
|-------|----------|---------|
| 1 | Find your perfect stay in Lagos. | Browse verified hotels, shortlets and event centers all in one place. |
| 2 | Book instantly, no back and forth. | Pick your dates, pay securely through Paystack and get confirmed immediately. |
| 3 | Hotels, shortlets and event centers in one place. | Every listing is verified by the Bookam team before it goes live. |

---

## Brand

- **Primary:** `#5B2D8E` (deep violet-purple)
- **Gold accent:** `#C9A84C`
- **CTA buttons:** linear gradient `#7C4BAE → #5B2D8E → #3D1A6E`
