# Abhiram Anil — portfolio

**Send the problem. Get back a system.**

The personal site of Abhiram Anil: AI automation engineer, HR analyst, growth marketer and co-founder of [CJ Studios](https://www.cjstudios.tech/). The homepage opens on a client's brief with the decisive phrases highlighted, then shows what was built and what changed.

Built with Next.js 16 (App Router), React 19, Tailwind CSS 4 and TypeScript. No analytics, no tracking scripts, no database. Fonts are self-hosted.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm run build      # production build
npm start          # serve the build
```

## Where things live

| What | Where |
| --- | --- |
| Every word on the site | `content/site.ts` |
| "Recently shipped" ledger | `content/week.json` |
| Page sections | `components/sections/*.tsx` |
| The marked-up brief (highlights + tap-to-reveal notes) | `components/BriefBlock.tsx` |
| Rotating hero briefs | `components/HeroBrief.tsx` |
| "Write me a brief" form | `components/BriefForm.tsx` |
| Brief matching API | `app/api/brief/route.ts`, `lib/match.ts` |
| Theme tokens (light and dark), highlighter styles | `app/globals.css` |
| Fonts (Gloock, Archivo) | `app/fonts/` |
| Resume PDF | `public/Abhiram-Anil-Resume.pdf` |

## Editing content

Open `content/site.ts`. Each case study is one object:

- `brief` is the client's problem. Wrap a phrase in `[[double brackets]]` to highlight it.
- `marks` maps a highlighted phrase to the note shown when a reader taps it.
- `client.public` controls naming. `false` shows `client.anonymised` instead of `client.name`. Flip it to `true` once the client has agreed to be named.
- `wording` is `"paraphrased"` or `"client"`. Paraphrased briefs carry a small note saying so.
- `hero: true` puts the case in the rotating hero. Keep it to three, one per discipline.
- `keywords` drive the local matcher behind "Write me a brief".

Roles, education, research, certifications, toolkit and the systems list are plain arrays in the same file.

## "Write me a brief"

A visitor types one line about their problem (or pastes a role). The site answers with how Abhiram would start and the two closest case studies.

- **Default:** `lib/match.ts` scores the text against each case study's keywords. No external calls, nothing stored.
- **Optional upgrade:** set `N8N_BRIEF_WEBHOOK_URL` and the API proxies the request to an n8n workflow (which can call Claude). The webhook receives `{ "text": "...", "mode": "brief" | "role" }` and should return `{ "approach": "...", "cases": ["five-star-training-academy", "tender-radar"] }` (slugs, or objects with a `slug`). If the webhook fails or times out, the local matcher answers instead. Set `N8N_BRIEF_TOKEN` to have it sent as the `X-Brief-Token` header so the workflow can reject other callers.

Requests are limited to 20 per minute per address and 1,500 characters.

## "Recently shipped" ledger

`content/week.json` holds five dated lines. To automate it: an n8n workflow (weekly cron → summarise the week's commits or client work → GitHub "create or update file" on `content/week.json`) will trigger a Vercel deploy on every commit.

## Deploy

1. Push this repo to GitHub and import it in [Vercel](https://vercel.com/new). Framework: Next.js. No build settings to change.
2. Add environment variables in Vercel → Settings → Environment Variables (see `.env.example`):
   - `NEXT_PUBLIC_SITE_URL` — the live URL, used for canonical links, sitemap and OpenGraph.
   - `N8N_BRIEF_WEBHOOK_URL`, `N8N_BRIEF_TOKEN` — optional, see above.
3. Add the custom domain under Settings → Domains.

The OpenGraph image is generated at build time from `app/opengraph-image.tsx`. `robots.txt` and `sitemap.xml` are generated from `app/robots.ts` and `app/sitemap.ts`.

## Design

- **Type:** Gloock for display, Archivo (variable width and weight) for everything else. Condensed uppercase labels use Archivo at 75% width.
- **Colour:** white, ink and one highlighter yellow (`#FFE94D`). Dark mode uses a warm near-black and keeps the same yellow.
- **Motion:** highlights draw in when a brief scrolls into view. Disabled under `prefers-reduced-motion`.
- **Themes:** follows the system setting; the toggle in the header overrides it and remembers the choice in `localStorage`.
