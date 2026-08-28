# KAIROS — OMBRA

A scroll-driven 3D product page for a fictional luxury hybrid hypercar.
Vanilla ES modules + Tailwind (CDN) + Three.js + GSAP/ScrollTrigger —
no build step, no bundler required.

## Run it

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

**Hinges.** For a correct hood/trunk/door swing, author an empty
("hinge" node) at the real pivot point in your DCC tool, parent the
panel mesh to it, and name the empty using the same hints above
(e.g. an empty named `Hood_Hinge` with the hood mesh as its child).

better.

If you don't do any of the above, the page still runs perfectly —
it just falls back to the procedural placeholder, which already has
every part correctly named and hinged.

## Retiming or reshaping the story

Everything about *when* things happen and *where the camera goes*
lives in `js/config.js`:

- `SECTION_VH` — relative scroll-length of each of the 5 story beats.
  Raise a number to slow that section down.
- `CAMERA_PATH` — an ordered list of `{ t, position, lookAt, fov }`
  waypoints. `t` is 0–1 global scroll progress; `main.js` linearly
  interpolates between the two waypoints surrounding the current
  scroll position. Add more waypoints wherever you want tighter
  control over the motion (the hero orbit is generated
  programmatically by `orbitRing()` for a smooth 360°).
- `HOOD_OPEN_RANGE` / `INTERIOR_HIDE_SHELL_RANGE` / `FREE_LOOK_START_T`
  — progress windows for the hood-open beat, the "camera is inside
  the cabin so hide the outer shell" beat, and where OrbitControls
  takes over for the free-look reveal at the end.
- `SPECS` — the four numbers on the final CTA card (also hand-written
  into `index.html`'s markup for the actual copy — keep both in sync
  if you change them).

`main.js` is organized top-to-bottom (renderer → load/fallback →
scroll timeline → text reveals → render loop) and shouldn't need
edits for normal retuning — see the inline comments at each
`camera.position` / `lookAt` touch point if you do need to go in.

## Design notes

- The placeholder vehicle is deliberately stylized — matte panels
  with glowing copper seams — rather than an attempt at photoreal
  car paint, so it reads honestly as a scanned engineering concept
  rather than a fake photo. The corner-bracket HUD, sector labels
  and live coordinates carry that same "viewing the car through a
  precision instrument" idea through the whole page.
- Canvas is `position:fixed; inset:0; z-1; pointer-events:none` as
  requested, and stays that way — `main.js` only flips
  `pointerEvents` to `auto` for the brief free-look window at the
  end (so OrbitControls can receive drag input), then hands it back.
- Respects `prefers-reduced-motion` (see `index.html`'s `<style>`).

## Dependencies (all via CDN, pinned versions)

- Tailwind CSS (Play CDN)
- Three.js `0.160.0` (`GLTFLoader`, `OrbitControls`, `Reflector`,
  `RoomEnvironment`)
- GSAP `3.12.5` + `ScrollTrigger`
- Google Fonts: Big Shoulders Display, Manrope, Space Mono
Swap any of these for local/npm copies later without touching the
rest of the code — only the `importmap` in `index.html` needs to
change.
