/**
 * car-builder.js
 * ─────────────────────────────────────────────────────────────
 * Procedurally builds a stylized "digital-twin" placeholder car —
 * used automatically when assets/models/car.glb is not present.
 * It is deliberately not photoreal: matte panels with glowing
 * copper seams, read as a scanned engineering blueprint rather
 * than a photo pretending to be a real vehicle. This also means
 * every part main.js needs (hood, trunk, 4 doors, 4 wheels, an
 * interior group) is guaranteed to exist with a predictable name,
 * so the scroll timeline always has something correct to animate.
 *
 * Swap in a real GLTF at any time — main.js prefers it automatically
 * and only falls back to this file if the load fails.
 * ─────────────────────────────────────────────────────────────
 */
import * as THREE from 'three';
import { COLORS } from './config.js';

function panelMaterial(color = COLORS.panel, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: 0.75,
    roughness: 0.35,
    ...opts,
  });
}

function glowSeam(color = COLORS.copper) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 1.4,
    roughness: 0.4,
    metalness: 0.1,
  });
}

function roundedBox(w, h, d, segments = 4) {
  // Cheap "rounded" look: a box slightly scaled + bevel-ish via
  // extra edge geometry would be overkill here — a plain box read
  // at studio distance is enough, kept intentionally low-poly.
  return new THREE.BoxGeometry(w, h, d, segments, segments, segments);
}

export function buildFallbackCar() {
  const root = new THREE.Group();
  root.name = 'car-root';

  // ── Body shell (hidden while camera is inside the cabin) ──
  const bodyShell = new THREE.Group();
  bodyShell.name = 'bodyShell';
  root.add(bodyShell);

  // Lower chassis wedge
  const chassis = new THREE.Mesh(roundedBox(4.4, 0.62, 1.9), panelMaterial(0x101215));
  chassis.position.set(0, 0.52, 0);
  chassis.castShadow = chassis.receiveShadow = true;
  bodyShell.add(chassis);

  // Cabin/greenhouse taper
  const cabinShell = new THREE.Mesh(roundedBox(2.05, 0.6, 1.66), panelMaterial(0x0d0e10, { roughness: 0.15, metalness: 0.9 }));
  cabinShell.position.set(-0.15, 1.02, 0);
  cabinShell.castShadow = true;
  bodyShell.add(cabinShell);

  // Nose taper
  const nose = new THREE.Mesh(roundedBox(1.1, 0.5, 1.7), panelMaterial(0x141619));
  nose.position.set(1.85, 0.5, 0);
  nose.castShadow = true;
  bodyShell.add(nose);

  // Copper light seam running the beltline — the car's signature
  // glowing line, echoing the HUD reticle used in the HTML overlay.
  const seam = new THREE.Mesh(new THREE.BoxGeometry(4.35, 0.035, 0.035), glowSeam(COLORS.copper));
  seam.position.set(0, 0.86, 0.97);
  bodyShell.add(seam);
  const seamL = seam.clone();
  seamL.position.z = -0.97;
  bodyShell.add(seamL);

  // Headlights / taillights
  const headMat = glowSeam(COLORS.ivory);
  const headL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.34), headMat);
  headL.position.set(2.38, 0.62, 0.62);
  bodyShell.add(headL);
  const headR = headL.clone();
  headR.position.z = -0.62;
  bodyShell.add(headR);

  const tailMat = glowSeam(0xb5443a);
  const tailL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.3), tailMat);
  tailL.position.set(-2.36, 0.68, 0.6);
  bodyShell.add(tailL);
  const tailR = tailL.clone();
  tailR.position.z = -0.6;
  bodyShell.add(tailR);

  // ── Hood (pivots open like a real bonnet hinge at the windshield edge) ──
  const hoodPivot = new THREE.Group();
  hoodPivot.name = 'hoodPivot';
  hoodPivot.position.set(1.05, 0.82, 0);
  bodyShell.add(hoodPivot);
  const hood = new THREE.Mesh(roundedBox(1.55, 0.08, 1.72), panelMaterial(0x16181c));
  hood.position.set(0.75, 0, 0);
  hood.castShadow = true;
  hood.name = 'hood';
  hoodPivot.add(hood);

  // ── Trunk (subtle lift, hinge at rear window edge) ──
  const trunkPivot = new THREE.Group();
  trunkPivot.name = 'trunkPivot';
  trunkPivot.position.set(-1.15, 0.86, 0);
  bodyShell.add(trunkPivot);
  const trunk = new THREE.Mesh(roundedBox(1.15, 0.07, 1.68), panelMaterial(0x16181c));
  trunk.position.set(-0.55, 0, 0);
  trunk.castShadow = true;
  trunk.name = 'trunk';
  trunkPivot.add(trunk);

  // ── Doors (pivot at the front edge of each door) ──
  const doorSpecs = [
    { name: 'doorFL', x: 0.05, z: 0.955, sign: 1 },
    { name: 'doorFR', x: 0.05, z: -0.955, sign: -1 },
    { name: 'doorRL', x: -1.0, z: 0.955, sign: 1 },
    { name: 'doorRR', x: -1.0, z: -0.955, sign: -1 },
  ];
  const doors = {};
  doorSpecs.forEach(({ name, x, z, sign }) => {
    const pivot = new THREE.Group();
    pivot.name = `${name}Pivot`;
    pivot.position.set(x - 0.45, 0.75, z);
    bodyShell.add(pivot);
    const panel = new THREE.Mesh(roundedBox(0.9, 0.55, 0.05), panelMaterial(0x121417));
    panel.position.set(0.45, 0, sign * 0.025);
    panel.castShadow = true;
    panel.name = name;
    pivot.add(panel);
    doors[name] = pivot;
  });

  // ── Wheels (tire + rim + spoke accent) ──
  function buildWheel(name) {
    const wheel = new THREE.Group();
    wheel.name = name;
    const tire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.36, 0.36, 0.26, 24),
      new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.9, metalness: 0.1 })
    );
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    wheel.add(tire);
    const rim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.27, 6),
      panelMaterial(0xc4c6ca, { roughness: 0.25, metalness: 0.95 })
    );
    rim.rotation.z = Math.PI / 2;
    wheel.add(rim);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.012, 8, 24), glowSeam(COLORS.copper));
    ring.rotation.y = Math.PI / 2;
    wheel.add(ring);
    return wheel;
  }
  const wheelFL = buildWheel('wheelFL');
  wheelFL.position.set(1.42, 0.38, 0.98);
  const wheelFR = buildWheel('wheelFR');
  wheelFR.position.set(1.42, 0.38, -0.98);
  const wheelRL = buildWheel('wheelRL');
  wheelRL.position.set(-1.42, 0.38, 0.98);
  const wheelRR = buildWheel('wheelRR');
  wheelRR.position.set(-1.42, 0.38, -0.98);
  [wheelFL, wheelFR, wheelRL, wheelRR].forEach((w) => root.add(w));

  // ── Engine bay (revealed once the hood lifts) ──
  const engineBay = new THREE.Group();
  engineBay.name = 'engineBay';
  engineBay.position.set(1.5, 0.62, 0);
  bodyShell.add(engineBay);
  const block = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.5, 8), panelMaterial(0x2a2d32, { roughness: 0.5 }));
  block.rotation.z = Math.PI / 2;
  engineBay.add(block);
  for (let i = -1; i <= 1; i += 2) {
    const manifold = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.03, 8, 16), glowSeam(COLORS.copper));
    manifold.position.set(0, 0.12, i * 0.28);
    manifold.rotation.x = Math.PI / 2;
    engineBay.add(manifold);
  }

  // ── Interior (dash, seats, wheel, center AI display) — hidden
  //    until the camera is inside; toggled by main.js ──
  const interior = new THREE.Group();
  interior.name = 'interior';
  interior.visible = false;
  root.add(interior);

  const dash = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.14, 0.5), panelMaterial(0x1a1c20, { roughness: 0.5 }));
  dash.position.set(0.62, 0.92, 0);
  interior.add(dash);

  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.16), glowSeam(COLORS.steel));
  screen.position.set(0.6, 0.98, 0);
  screen.rotation.x = -0.3;
  interior.add(screen);

  const wheelRingGeo = new THREE.TorusGeometry(0.17, 0.025, 8, 20);
  const steering = new THREE.Mesh(wheelRingGeo, panelMaterial(0x111214, { roughness: 0.6 }));
  steering.position.set(0.35, 0.85, 0.28);
  steering.rotation.y = Math.PI / 2;
  interior.add(steering);

  function buildSeat(z) {
    const seat = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.08, 0.42), panelMaterial(0x1c1e22, { roughness: 0.7 }));
    base.position.set(0, 0.5, 0);
    seat.add(base);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.4), panelMaterial(0x1c1e22, { roughness: 0.7 }));
    back.position.set(-0.2, 0.72, 0);
    seat.add(back);
    const stitch = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.02, 0.36), glowSeam(COLORS.copper));
    stitch.position.set(-0.16, 0.9, 0);
    seat.add(stitch);
    seat.position.set(-0.35, 0, z);
    return seat;
  }
  interior.add(buildSeat(0.3));
  interior.add(buildSeat(-0.3));

  return {
    root,
    parts: {
      bodyShell,
      hoodPivot,
      trunkPivot,
      doors,
      wheels: { wheelFL, wheelFR, wheelRL, wheelRR },
      engineBay,
      interior,
    },
  };
}
