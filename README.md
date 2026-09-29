# Abhiram Anil — portfolio

**Send the problem. Get back a system.**

The personal site of Abhiram Anil: AI automation engineer, HR analyst, growth marketer and co-founder of [CJ Studios](https://www.cjstudios.tech/). It is built as a film, not a document: it opens on a pinned 3D scene of one working day at the desk, then runs through the casework, a WebGL canvas of the real workflow, and a brief you can send in one line. One signal colour throughout.

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
| 01 | Night desk | A pinned film of one day, rendered in Blender and scrubbed by scroll. Abhiram at his desk at night: the day's AI updates fly to a pinboard, most fall off, the keepers are tied with yellow thread to client problems, and results get pinned over them. Four chapter captions on the left |
| 02 | Running now | Three numbers count up, each with a source |
| 03 | Casework: the board | The hero's pinboard, one case at a time. The section is pinned and the cork board slides sideways under a picture light: problem card, a photo of the proof, what was built, the stack, and the results on sticky notes tied on with yarn. On phones each case is its own small board |
| 08 | The system | The Canvas pinned; scroll drives the camera, hover names the case |
| 09 | Founder | A yellow band torn across the black, portrait in duotone |
| 10 | Method | Read. Measure. Build. Report. under a light beam |
| 11 | Power off | The closing line, the ring, the brief form, the marquee |

Persistent: the sigil, the nav, the sound toggle (a low hum, off by default), the ticker, the cursor dot.

## Where things live

| What | Where |
| --- | --- |
| Case studies, roles, contact details | `content/site.ts` |
| Every word of the film: boot lines, hero, chapters, desk cards, numbers, phrases, method, ending, ticker, canvas nodes | `content/film.ts` |
| Screens | `components/film/*.tsx` |
| Night desk hero (frame player) | `components/film/NightDesk.tsx`, frames in `public/hero/frames/` |
| How the frames are made (scene, Blender, grade) | `components/film/night/`, `scripts/night-desk/` |
| Casework board | `components/film/Casework.tsx`, textures in `public/board/` |
| The Canvas (Three.js) | `components/film/CanvasScene.tsx` |
| Kinetic letters, highlighter, fade-ins | `components/film/Kinetic.tsx`, `Highlight.tsx`, `Appear.tsx` |
| Boot, HUD, smooth scroll | `components/film/Boot.tsx`, `Hud.tsx`, `Smooth.tsx` |
| "Write me a brief" form and API | `components/BriefForm.tsx`, `app/api/brief/route.ts`, `lib/match.ts` |
| Tokens, grain, highlighter, the board's paper and pins | `app/globals.css` |
| Proof images | `public/proof/` |
| Fonts (Gloock, Archivo, JetBrains Mono, Caveat for the handwriting on the board) | `app/fonts/` |

## The Night desk hero

`components/film/NightDesk.tsx` pins a stage for about seven screens of scroll and scrubs through 180 frames with scroll progress from 0 to 1, the way the scroll-driven sites on Scrolltide and Motionsites play their footage: the nearest frame is drawn to a canvas, frames load coarse-first (every 32nd, then 16th, down to every frame; phones take every other one), and fitted to the part of the screen beside the captions.

| Progress | Chapter | In the film |
| --- | --- | --- |
| 0 | Opening | Wide shot of the room at night |
| 0.12–0.29 | 01 Every day | Over the shoulder, the feed on the laptop |
| 0.31–0.49 | 02 Tested | Cards fly to the board, rejects fall, keepers turn yellow |
| 0.51–0.69 | 03 Applied | Yellow thread ties keepers to client problems |
| 0.71–0.89 | 04 Proven | Result cards get pinned over the problems |
| 0.93–1 | Close | Wide shot, the loop starts again tomorrow |

The captions are `hero` and `story` in `content/film.ts`. `public/hero/night-desk.jpg` and `night-desk-portrait.jpg` show until the first frame is ready.

### How the frames are made

The realism comes from rendering, not from a real-time shader: the scene is path traced in Blender's Cycles with physically based materials, CC0 textures, real lights and depth of field, then graded with a LUT.

1. **The scene** is still code: `components/film/night/` builds the room, the board, the cards and the timeline in Three.js (the words come from `night` in `content/film.ts`), and `night/figure.js` dresses the sculpted man in `scripts/night-desk/person.glb` (sculpted from signed distance fields by `scripts/night-desk/sculpt-person.mjs`).
2. **Export.** `node scripts/night-desk/dump-content.mjs`, then `python3 scripts/night-desk/serve.py` and open the page it prints. It writes `export/scene.glb`, `export/anim.json` (camera, moving objects, yarn and card colours for every frame) and the screen images.
3. **Build and render.** With Blender's Python (`pip install bpy==4.2.0`): `python scripts/night-desk/fetch-textures.py`, `python scripts/night-desk/build.py`, then `python scripts/night-desk/render.py scripts/night-desk/frames 1152 720 24 1-180`. About 40 seconds a frame on four CPU cores.
4. **Grade and encode.** `scripts/night-desk/encode.sh` applies `night-desk.cube` (made by `make-lut.py`: cool shadows, warm highlights, a milky black, the yellow kept) and a soft vignette with ffmpeg, and writes the WebP frames and the posters.

## Proof images

Each case on the board shows its proof as a photo pinned to the cork. The five images are in place:

| Case | File | Kind |
| --- | --- | --- |
| Five Star Training Academy | `proof/five-star-home.jpg` | Capture of the live site |
| Tender Radar | `proof/tender-radar-slack.jpg` | Rendered Slack digest |
| Eco Clean | `proof/eco-clean-whatsapp.jpg` | Rendered WhatsApp thread |
| Codevantage | `proof/codevantage-people.jpg` | Rendered people dashboard |
| NOT A BASIC | `proof/not-a-basic.jpg` | Capture of the homepage design |

`proof/n8n-resume-ats.jpg` is a spare: the Resume ATS workflow canvas, same size as the dashboard. Swap it in on the Codevantage case if you would rather show the workflow than the report.

To replace one:

1. Drop the file in `public/proof/`.
2. In `content/film.ts`, set `image: "/proof/your-file.jpg"` on that case.

Specs: laptop 1600 × 1000, phone 1170 × 2532, tablet 1600 × 1200. The Founder band plays a muted clip from the CJ Studios reel (`public/founder/cj-reel.mp4`, only while it is on screen and never under reduced motion). To show a still instead, for example one from the CJ Studios Twitter pipeline, put it in `public/founder/` (16:9, 1600 × 900 or larger) and set `founder.image` in `content/film.ts`.

Client naming is controlled in `content/site.ts` (`client.public`). Anonymised clients show `client.anonymised`.

## "Write me a brief"

A visitor types one line about their problem, or pastes a role. The site answers with how Abhiram would start and the two closest cases.

- **Default:** `lib/match.ts` scores the text against each case's keywords. No external calls, nothing stored.
- **Optional upgrade:** set `N8N_BRIEF_WEBHOOK_URL` and the API proxies to an n8n workflow (which can call Claude). It receives `{ "text", "mode": "brief" | "role" }` and returns `{ "approach", "cases": ["slug", ...] }`. `N8N_BRIEF_TOKEN` is sent as `X-Brief-Token`. If the webhook fails, the local matcher answers.

## The ticker

`ticker` in `content/film.ts` is a static list. To make it live, expose a sanitised n8n log endpoint (workflow name, timestamp, one-line outcome, no client data) and fetch it in `components/film/Hud.tsx`.

## Performance and accessibility

- Three.js loads on the client after first paint. The Night desk renders only while it is on screen, caps the pixel ratio, and uses smaller shadow maps on phones and low-core machines; the Canvas gives phones fewer cards, no transmission and pixel ratio 1.
- Everything is visible at rest under `prefers-reduced-motion`: no letter flight, no boot delay, no glide.
- The boot never gates the page: it ends by itself, any click or key skips it, and it is skipped for the rest of the session.
- Sound is off until the visitor turns it on.

## Deploy

1. Import the repo in [Vercel](https://vercel.com/new). Framework: Next.js. Give the project any free name; it becomes the address, e.g. `abhiram-anil.vercel.app`.
2. No environment variables are needed. The site reads its Vercel address automatically for metadata, the sitemap and robots.
3. Optional later: add a custom domain under Settings → Domains and set `NEXT_PUBLIC_SITE_URL` to it. Set `N8N_BRIEF_WEBHOOK_URL` and `N8N_BRIEF_TOKEN` to answer briefs with n8n.
