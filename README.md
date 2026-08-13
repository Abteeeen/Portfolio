# Abhiram Anil — Portfolio

A rebuilt personal portfolio: Next.js 16 (App Router), React 19, Tailwind CSS v4,
Motion, and React Three Fiber.

The previous version's source was lost, so this is a fresh build. The 3D lives in
the repo as code (`src/components/HeroCanvas.tsx`) rather than in a hosted scene
file, so it is version-controlled alongside everything else.

## Running it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint
```

## Editing content

**All copy and data lives in one file: [`src/content/profile.ts`](src/content/profile.ts).**
Components read from it and never hardcode content — edit there, not in the JSX.

It covers profile details, social links, skills, stats, the tech marquee,
experience, certifications, and projects.

### Fill these in before going live

The old deployment could only be read from the outside, so some values could not
be recovered. They are marked `TODO` in `profile.ts` and render visibly on the
page so they are hard to ship by accident:

- `profile.location` — inferred, confirm it
- `profile.resumeUrl` — add a PDF to `public/` and point at it
- `socials` — the GitHub and LinkedIn URLs are guesses
- `experience[].org` — current employer and university names
- `certifications[]` — exact titles, issue years, and credential links
- `projects[].repoUrl` / `liveUrl` — currently all `null`, so those links are hidden

### A note on the project metrics

The accuracy and precision figures (92%, 89%, 88%) were carried over from the
previous deployment. Every other project is described structurally, without
invented numbers — add the real figures rather than leaving approximations to
stand in.

## Structure

```
src/
  app/
    layout.tsx        metadata, fonts, root shell
    globals.css       design tokens, utilities, keyframes
    page.tsx          section composition
  content/
    profile.ts        ← all content lives here
  components/
    Nav, Hero, HeroCanvas, Stats, Projects, Skills, Experience, Contact, Footer
    ui/               Reveal, SectionHeading
```

## Design notes

- Colour, font, and animation tokens are defined in `@theme` in `globals.css`.
- `prefers-reduced-motion` is respected throughout — counters snap to their final
  value, reveals stop translating, and animations are cut short.
- The particle field uses a seeded PRNG so it renders identically every time
  rather than reshuffling between renders.

## Deploying

Vercel: import the repo, no configuration needed. The existing deployment is
untouched by this build — point a new project at this branch to preview it side
by side before switching anything over.
