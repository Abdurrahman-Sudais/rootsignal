# Rootsignal

**See the changes happening below.**

Marketing website and interactive product demonstration for Rootsignal, an AI-assisted root-zone monitoring and inspection platform for commercial growers. Rootsignal organises root images, irrigation readings, environmental measurements and inspection records by growing zone, highlights changes between observations, and helps teams decide which areas need inspection.

- Domain: rootsignal.top
- Founder: Dave Michael
- Contact: yusuf@rootsignal.top

## Quick start

Requirements: Node.js 18+ (tested on Node 22) and npm.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build to dist/
npm run preview    # serve the production build locally
```

No API keys or external services are needed. Fonts are loaded from Google Fonts; the site falls back to system fonts offline.

> **Deploying:** this is a single-page app using client-side routes (`/dashboard/zones/GN-A1`, etc.). Configure your host to serve `index.html` for unknown paths (e.g. Netlify `_redirects: /* /index.html 200`, or Vercel rewrites).

## Stack

Vite · React 18 · TypeScript (strict) · Tailwind CSS v4 · React Router 6 · Lucide React. No chart or UI libraries — charts and the comparison view are small custom components.

## Routes

| Route | Page |
| --- | --- |
| `/` | Home — hero with dashboard preview, sections A–G |
| `/product` | Product features, what Rootsignal does and does not do |
| `/how-it-works` | Four-step walkthrough, simulated vs integration-required |
| `/use-cases` | Hydroponic farms, greenhouse operations, commercial nurseries |
| `/pricing` | Plans (from `src/config/pricing.ts`), limits table, FAQ |
| `/about` | Company, founder, principles |
| `/contact` | Validated enquiry form |
| `/dashboard` | Overview for Greenhouse North |
| `/dashboard/zones` | Searchable, filterable zone inventory |
| `/dashboard/zones/:zoneId` | Zone detail: gallery, comparison, timeline, readings, notes, inspection history |
| `/dashboard/observations` | All observations with filters and "open flagged observation" |
| `/dashboard/irrigation` | Per-zone measurement charts and tables with units |
| `/dashboard/inspections` | Inspection queue and workflow |
| `/dashboard/reports` | Activity, throughput, data quality, CSV exports |
| `/dashboard/team` | Team ownership |
| `/dashboard/settings` | Thresholds, units, integrations status, reset sample data |

## Project structure

```
src/
  config/      site.ts (company info, nav) · pricing.ts (plans, prices, limits)
  data/        types.ts · greenhouse.ts (all sample data for Greenhouse North)
  lib/         analysis.ts (data quality, summaries) · rootModel.ts (procedural root imagery + change detection) · dates.ts · usePageMeta.ts
  components/  Layout, logo, UI primitives (modal, tooltip, badges), LineChart, RootImage, ComparisonSlider, illustrations
  pages/       Marketing pages
  dashboard/   Dashboard layout, state store, views, inspection & observation modals
```

## Editing pricing

All plan names, prices, annual discount, limits and feature lists live in [`src/config/pricing.ts`](src/config/pricing.ts). Set `monthlyPrice: null` to show "Custom"; set a limit to `null` to show "Custom" in the limits table.

## What is simulated

This is a frontend demonstration. Everything below runs in the browser with sample data:

| Feature | In this demo | Needed for production |
| --- | --- | --- |
| Greenhouse, zones, team, readings | Fictional sample data in `src/data/greenhouse.ts`, labelled "Sample data" throughout | Backend database, accounts, permissions |
| Root images | Procedurally generated SVG "scans" from a per-zone seed (`src/lib/rootModel.ts`). Uploaded photos are shown for the current session only (object URLs) | Secure image storage / CDN |
| Visual change detection | Grid comparison of the sample image parameters (visible root density and tone) | A real computer-vision model: image registration, segmentation, and quality scoring on actual photos |
| Observation summary | Rule-based text from the simulated comparison. Describes visible differences only, never diagnoses disease, deficiency or treatment | An image/LLM pipeline with the same guardrails, evaluated against grower-verified inspections |
| Irrigation readings | Static sample values, with gaps deliberately left as "not supplied" | Manual entry API, CSV import, and/or integrations with sensors, climate computers and fertigation controllers |
| Persistence | `localStorage` in the current browser (reset in Settings) | Server persistence, audit history |
| Contact form | Client-side validation only; nothing is transmitted | Form endpoint or CRM integration |

There is **no live sensor connectivity** anywhere in this build.

## Accessibility & quality

- Keyboard-navigable navigation, mobile menu, dashboard drawer, tabs, tooltips (hover + focus, Esc to dismiss) and modals (focus trap, Esc to close, focus restore).
- Comparison slider uses a native range input; charts support arrow-key stepping and include screen-reader tables.
- Form validation with inline, announced errors and `aria-invalid`.
- `prefers-reduced-motion` disables animations and smooth scrolling.
- Per-route document titles, meta descriptions, canonical URLs and Open Graph tags; SVG favicon.

## Imagery

Illustrations are hand-built SVG in the brand palette, and root images are procedural, so the demo has no third-party image licensing concerns. For production marketing, swap the `UseCaseScene` and `ChannelCrossSection` components in `src/components/Illustrations.tsx` for licensed greenhouse and root-system photography.

## Launch readiness

- **Founders:** Dave Michael (Founder/CEO) and Yusuf Abdulhamid (Co-founder/CTO) — edit `FOUNDERS` in `src/config/site.ts`.
- **Lead form:** set `VITE_HUBSPOT_PORTAL_ID`, `VITE_HUBSPOT_FORM_GUID` and optionally `VITE_HUBSPOT_MARKETING_SUBSCRIPTION_ID` (see `.env.example`). Without them the form saves to the browser and offers a pre-filled email.
- **Demo roles & audit:** “Demo as” in the dashboard sidebar switches between head grower, inspections lead, grower and irrigation technician; every action is permission-checked and logged at `/dashboard/audit`.
- **Assistant:** answers from the sample records only and refuses diagnosis, treatment and yield prediction (`src/dashboard/assistant.ts`).
- **Hosting:** `public/_redirects`, `public/_headers` and `vercel.json` serve the SPA on Netlify, Cloudflare Pages or Vercel. OG image, icons, manifest, sitemap and Organization JSON-LD are included.
- **Tests:** `npm test` (Vitest).

### Content to confirm before launch

- Problem statistics on the home page (`PROBLEM_STATS` in `src/pages/Home.tsx`) are from Cuesta Roble (2019), USDA NASS 2019 Census of Horticultural Specialties and Stanghellini & Kronland, *Plant Disease* 70 (1986). Re-check the figures and links.
- The contact email is `yusuf@rootsignal.top` while the Founder/CEO is Dave Michael — confirm this is the intended public address.
- Founder bios describe roles only; replace with confirmed biographies.
- Privacy notice and terms are review drafts; add operator details, governing law and the confirmed form service.
- AWS architecture on `/technology` is proposed, not deployed.
