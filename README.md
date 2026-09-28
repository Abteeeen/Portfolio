# Abhiram Anil — portfolio

**Send the problem. Get back a system.**

The personal site of Abhiram Anil: AI automation engineer, HR analyst, growth marketer and co-founder of [CJ Studios](https://www.cjstudios.tech/). It is built as a film, not a document: twelve screens, about 220 words, one signal colour, a WebGL canvas of the real workflow, and a brief you can send in one line.

Built with Next.js 16 (App Router), React 19, Tailwind CSS 4, Three.js, GSAP and Lenis. No analytics, no tracking scripts, no database. Fonts are self-hosted.

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

## The screens

| # | Screen | What happens |
| --- | --- | --- |
| 00 | Power on | Telemetry lines, 1.8 s, skippable, once per session |
| 01 | Hero | Letters assemble, highlighter draws, the Canvas glides behind |
| 02 | Running now | Three numbers count up, each with a source |
| 03–07 | Casework | Five full-bleed screens: client, one phrase from the brief, one line of result, one real screen in a device |
| 08 | The system | The Canvas pinned; scroll drives the camera, hover names the case |
| 09 | Founder | A yellow band torn across the black, portrait in duotone |
| 10 | Method | Read. Measure. Build. Report. under a light beam |
| 11 | Power off | The closing line, the ring, the brief form, the marquee |

Persistent: the sigil, the nav, the sound toggle (a low hum, off by default), the ticker, the cursor dot.

## Where things live

| What | Where |
| --- | --- |
| Case studies, roles, contact details | `content/site.ts` |
| Every word of the film: boot lines, hero, numbers, phrases, method, ending, ticker, canvas nodes | `content/film.ts` |
| Screens | `components/film/*.tsx` |
| The Canvas (Three.js) | `components/film/CanvasScene.tsx` |
| Kinetic letters, highlighter, fade-ins | `components/film/Kinetic.tsx`, `Highlight.tsx`, `Appear.tsx` |
| Boot, HUD, smooth scroll | `components/film/Boot.tsx`, `Hud.tsx`, `Smooth.tsx` |
| "Write me a brief" form and API | `components/BriefForm.tsx`, `app/api/brief/route.ts`, `lib/match.ts` |
| Tokens, grain, highlighter, device frames | `app/globals.css` |
| Proof images | `public/proof/` |
| Fonts (Gloock, Archivo, JetBrains Mono) | `app/fonts/` |

## Adding the proof images

Each casework screen shows a device with either a real screenshot or a yellow placeholder that names what is missing. To fill one:

1. Drop the file in `public/proof/`.
2. In `content/film.ts`, set `image: "/proof/your-file.jpg"` on that case.

Specs: laptop 1600 × 1000, phone 1170 × 2532, tablet 1600 × 1200. The founder portrait goes in `founder.photo` (2000 × 2500 or larger, plain background); the site converts it to duotone.

Client naming is controlled in `content/site.ts` (`client.public`). Anonymised clients show `client.anonymised`.

## "Write me a brief"

A visitor types one line about their problem, or pastes a role. The site answers with how Abhiram would start and the two closest cases.

- **Default:** `lib/match.ts` scores the text against each case's keywords. No external calls, nothing stored.
- **Optional upgrade:** set `N8N_BRIEF_WEBHOOK_URL` and the API proxies to an n8n workflow (which can call Claude). It receives `{ "text", "mode": "brief" | "role" }` and returns `{ "approach", "cases": ["slug", ...] }`. `N8N_BRIEF_TOKEN` is sent as `X-Brief-Token`. If the webhook fails, the local matcher answers.

## The ticker

`ticker` in `content/film.ts` is a static list. To make it live, expose a sanitised n8n log endpoint (workflow name, timestamp, one-line outcome, no client data) and fetch it in `components/film/Hud.tsx`.

## Performance and accessibility

- Three.js loads on the client after first paint; phones get fewer cards, no transmission and pixel ratio 1.
- Everything is visible at rest under `prefers-reduced-motion`: no letter flight, no boot delay, no glide.
- The boot never gates the page: it ends by itself, any click or key skips it, and it is skipped for the rest of the session.
- Sound is off until the visitor turns it on.

## Deploy

1. Import the repo in [Vercel](https://vercel.com/new). Framework: Next.js.
2. Environment variables (see `.env.example`): `NEXT_PUBLIC_SITE_URL`, and optionally `N8N_BRIEF_WEBHOOK_URL`, `N8N_BRIEF_TOKEN`.
3. Add the domain under Settings → Domains.
