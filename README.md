# Murmur

> An anonymous campus confession & gossip content pipeline — from submission to Instagram-ready post.

Murmur replaces the manual Google Form → Canva → Instagram workflow with a polished, full-stack web application that handles submissions, moderation, post generation, and caption writing in one place.

---

## ✨ Features

- **Public submission form** — anonymous, mobile-friendly, with draft autosave and character count
- **Admin moderation dashboard** — queue, detail view, inline editing, risk scoring
- **6 Instagram-ready post templates** — Scrapbook, Bold Card, Journal, Handwritten, Framed Note, Confession
- **Smart text fitting** — font size adapts automatically to submission length
- **Caption suggestions** — 3 styles generated per submission (soft reflective, neutral, brand voice)
- **Moderation helpers** — heuristic risk analysis with soften/reduce/grammar tools
- **PNG export** — download final post as an image
- **Template manager** — enable/disable templates, preview with sample data
- **Settings panel** — branding, thresholds, export size, watermark

---

## 🚀 Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public submission form.  
Open [http://localhost:3000/admin](http://localhost:3000/admin) for the admin dashboard.

---

## 🗂 Architecture

```
src/
  app/                        # Next.js App Router pages
    page.tsx                  # Public submission form
    admin/
      overview/               # Stats & charts
      queue/                  # Moderation queue + detail (master-detail layout)
      posts/                  # Generated posts gallery
      templates/              # Template manager
      settings/               # App settings
  components/
    submission/               # Public form components
    admin/                    # Admin dashboard components
    templates/                # 6 post template renderers
    charts/                   # Recharts wrappers
    ui/                       # Reusable design system primitives
  lib/
    types.ts                  # All TypeScript types & interfaces
    store.ts                  # Zustand global state (seeded with mock data)
    seed-data.ts              # 14 realistic campus submissions
    utils.ts                  # cn(), generateId(), formatDate()
    text-fitting.ts           # Smart font-size logic based on text length
    caption-generator.ts      # 3-style caption suggestion engine
    moderation.ts             # Heuristic risk scoring & text helpers
    template-registry.ts      # Template metadata & theme definitions
```

### Where things live

| Concern | File |
|---|---|
| Template logic | `src/components/templates/` + `src/lib/template-registry.ts` |
| Text fitting | `src/lib/text-fitting.ts` |
| Caption generation | `src/lib/caption-generator.ts` |
| Moderation helpers | `src/lib/moderation.ts` |
| Data types | `src/lib/types.ts` |
| Global state | `src/lib/store.ts` |

---

## 🔌 Plugging in a Real Backend

The app uses Zustand with in-memory state seeded from `src/lib/seed-data.ts`.

To replace with a real database:
1. Replace store actions in `src/lib/store.ts` with API calls (e.g. `fetch('/api/submissions')`)
2. Add Next.js API routes or a tRPC/REST layer in `src/app/api/`
3. Connect to Prisma + PostgreSQL (or any ORM) — the data model in `src/lib/types.ts` maps directly to DB tables

To add cloud image storage (for PNG exports):
1. Generate the canvas image with `html2canvas`
2. Upload the `dataUrl` to S3/Cloudflare R2
3. Store the URL in `GeneratedPost.imageDataUrl`

---

## 🛠 Tech Stack

- **Next.js 14** (App Router)
- **TypeScript** (strict)
- **Tailwind CSS**
- **Zustand** — state management
- **React Hook Form + Zod** — form validation
- **Recharts** — analytics charts
- **Lucide React** — icons
- **html2canvas** — PNG export
