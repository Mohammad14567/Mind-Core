# Mind Core

A cinematic single-page experience for the Mind Core software studio.
Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · Framer Motion 11.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (verified: 138 kB first load JS)
```

## Architecture

```
app/                  layout (fonts, metadata, skip link), page, global glow system
components/
  core/               Orb (the signature light object), LightField (cursor light)
  layout/             Nav, Footer
  sections/           Hero, Services, Process, Work, Why, Testimonials, Contact
  ui/primitives.tsx   SectionHeader, Reveal, GlowButton
content/site.ts       all copy as typed data
lib/motion.ts         house easing, shared variants, useCursorField hook
```

## Design system

- **Canvas** `void #05060A` · surfaces `carbon/graphite` · hairline borders at 10% blue-white
- **Light** `beam #9CC2FF` (primary), `core #5E8BFF` (saturated), `pulse #8E7BFF` — violet is
  reserved exclusively for AI/intelligence moments so it stays meaningful
- **Type** Schibsted Grotesk (display, -0.045em), Inter (body), IBM Plex Mono (labels, 0.22em caps)
- **Motion** one house easing `cubic-bezier(0.22,1,0.36,1)`; springs for pointer-driven motion;
  transform/opacity only (GPU-composited); `prefers-reduced-motion` honored everywhere

## Performance notes

- No WebGL — the Core is layered CSS gradients animated on transform/opacity
- One global pointer listener (`useCursorField`) feeds all mouse-reactive elements via springs
- All scroll effects use Framer's `useScroll` motion values (no scroll-triggered React re-renders)
- Static prerender; fonts via `next/font` (self-hosted at build, zero layout shift)

## Wiring the contact form

`components/sections/Contact.tsx` → `onSubmit`. Point it at an API route or form service;
the success state is already designed.
