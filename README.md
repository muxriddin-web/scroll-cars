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

```
index.html          Markup, Tailwind config, fonts, import map
js/config.js         Camera path, section timing, colors — edit THIS to retune the story
js/car-builder.js    Procedural placeholder car (used automatically if car.glb is absent)
js/main.js           Scene setup, loading, scroll timeline, render loop
assets/models/       Put your car.glb here
```

## Using your own car model

Drop a `.glb` (or `.gltf` + its assets) at `assets/models/car.glb`.
`main.js` tries to load it first and only falls back to the built-in
procedural car if that file is missing or fails to load — nothing
else needs to change.

**Node naming.** For the hood-opening, wheel-spin and interior reveal
to wire up automatically, name the relevant nodes in your modeling
tool so they *contain* one of the substrings listed in
 the camera is inside the cabin).

## Design notes

- The placeholder vehicle is deliberately stylized — matte panels
  with glowing copper seams — rather than an attempt at photoreal
  car paint, so it reads honestly as a scanned engineering concept


