# KAIROS — OMBRA

A scroll-driven 3D product page for a fictional luxury hybrid hypercar.
Vanilla ES modules + Tailwind (CDN) + Three.js + GSAP/ScrollTrigger —
no build step, no bundler required.

## Run

Browsers block `import` in files opened directly as `file://`, so
serve the folder over HTTP. Any static server works, e.g. from this
folder:

```bash
python3 -m http.server 8080
# or
npx serve .
```

Then open `http://localhost:8080`.

## What's here




