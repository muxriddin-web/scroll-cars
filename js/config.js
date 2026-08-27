export const MODEL_PATH = 'assets/models/lamborghini.glb';

export const NODE_NAME_HINTS = {
  hood: ['hood', 'kapot', 'bonnet'],
  trunk: ['trunk', 'boot'],
  doorFL: ['door_fl', 'doorfrontleft', 'door_front_left', 'door_l', 'door_left', 'door', 'eshik', 'object_12', 'door_driver'],
  doorFR: ['door_fr', 'doorfrontright', 'door_front_right', 'door_r', 'door_right'],
  doorRL: ['door_rl', 'doorrearleft'],
  doorRR: ['door_rr', 'doorrearright'],
  wheelFL: ['wheel_fl', 'balon_fl'],
  wheelFR: ['wheel_fr', 'balon_fr'],
  wheelRL: ['wheel_rl', 'balon_rl'],
  wheelRR: ['wheel_rr', 'balon_rr'],
  bodyShell: ['body', 'shell', 'exterior', 'chassis', 'kuzov', 'carbody'],
  interior: ['interior', 'cabin', 'salon', 'seat', 'dash', 'steering'],
};

export const COLORS = {
  void: 0x0a0b0d,
  panel: 0x15171b,
  steel: 0x4a5d6c,
  copper: 0xc08552,
  copperBright: 0xe0a876,
  ivory: 0xedeae2,
};

export const SECTION_VH = {
  orbit: 400,
  doorOpen: 250,
  interior: 350,
};

const total = Object.values(SECTION_VH).reduce((a, b) => a + b, 0);
const cum = {};
let running = 0;
for (const [key, vh] of Object.entries(SECTION_VH)) {
  cum[key] = { start: running / total, end: (running + vh) / total };
  running += vh;
}
export const SECTION_RANGES = cum;

const CAR_CENTER = [0, 0.6, 0];

// ── TO'LIQ AYLANIBAK VA SALONGA KIRISH TRAYEKTORIYASI ──
export const CAMERA_PATH = [
  // 1. Mashina atrofida to'liq aylanib chiqish (0.00 -> 0.50)
  { t: 0.00, position: [0.0, 1.4, 7.0], lookAt: CAR_CENTER, fov: 38, label: 'SECTOR 01 // FRONT VIEW' },
  { t: 0.15, position: [5.2, 1.5, 2.5], lookAt: CAR_CENTER, fov: 40, label: 'SECTOR 01 // RIGHT SIDE' },
  { t: 0.32, position: [0.0, 1.6, -6.5], lookAt: CAR_CENTER, fov: 38, label: 'SECTOR 01 // REAR VIEW' },
  { t: 0.48, position: [-5.2, 1.5, 2.5], lookAt: CAR_CENTER, fov: 40, label: 'SECTOR 01 // LEFT SIDE' },

  // 2. Chap eshik yoniga silliq kelish (0.48 -> 0.65)
  { t: 0.65, position: [-2.2, 1.15, 0.5], lookAt: [0, 0.8, 0], fov: 42, label: 'SECTOR 02 // APPROACHING DOOR' },

  // 3. Salonga kirish va orqaroq nuqtadan keng namoyish etish (0.65 -> 1.00)
  { t: 0.82, position: [-0.8, 1.05, -0.2], lookAt: [0.0, 0.80, 1.0], fov: 50, label: 'SECTOR 03 // ENTERING CABIN' },
  { t: 1.00, position: [0.0, 0.95, -0.75], lookAt: [0.0, 0.75, 2.0], fov: 55, label: 'SECTOR 03 // FULL CABIN VIEW' }
];

// Eshik ochilishi kamera chap tomonga kelganda (t=0.55) boshlanadi
export const DOOR_OPEN_RANGE = [0.55, 0.80];

// Kamera salonga to'liq kiringach to'siq panellar yashiriladi
export const INTERIOR_HIDE_SHELL_RANGE = [0.75, 1.01];

export const FREE_LOOK_START_T = 0.98;
export const SPECS = [
  { label: 'TOP SPEED', value: '340', unit: 'km/h' },
  { label: '0–100 KM/H', value: '2.6', unit: 'sec' },
  { label: 'COMBINED RANGE', value: '620', unit: 'km' },
  { label: 'SYSTEM OUTPUT', value: '800', unit: 'hp' },
];