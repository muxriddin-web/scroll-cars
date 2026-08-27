import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import {
  MODEL_PATH,
  NODE_NAME_HINTS,
  COLORS,
  CAMERA_PATH,
  DOOR_OPEN_RANGE,
  INTERIOR_HIDE_SHELL_RANGE
} from './config.js';

// ── ASOSIY O'ZGARUVCHILAR ──
let scene, camera, renderer, carModel;
let carParts = { shell: [] };
let scrollProgress = 0;

// Model animatsiyalari uchun
let mixer, doorAction, doorClipDuration = 0;

// ── SAHNANI TAYYORLASH ──
const canvas = document.querySelector('#webgl-canvas');
scene = new THREE.Scene();
scene.background = new THREE.Color(COLORS.void);
scene.fog = new THREE.Fog(COLORS.void, 5, 20);

// Kamera
camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(...CAMERA_PATH[0].position);

// Renderer
renderer = new THREE.WebGLRenderer({ canvas, antialias: window.devicePixelRatio < 2 });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// ── YORUG'LIK ──
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

// ── POL VA AKSLANISH ──
const floorGeometry = new THREE.PlaneGeometry(30, 30);
const floorReflector = new Reflector(floorGeometry, {
  clipBias: 0.003,
  textureWidth: (window.innerWidth * window.devicePixelRatio) / 2,
  textureHeight: (window.innerHeight * window.devicePixelRatio) / 2,
  color: 0x222222,
});
floorReflector.rotation.x = -Math.PI / 2;
floorReflector.position.y = 0;
scene.add(floorReflector);

// ── MODELNI YUKLASH VA ANIMATSIYANI ULAB OLISH ──
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

loader.load(
  MODEL_PATH,
  (gltf) => {
    carModel = gltf.scene;
    scene.add(carModel);

    // 1. MODEL ICHIDAGI TAYYOR ANIMATSIYALARNI USHLASH
    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(carModel);
      
      console.log("Topilgan animatsiyalar:", gltf.animations.map(a => a.name));

      // Eshik animatsiyasini qidirish (yoki birinchi animatsiyani olish)
      const doorClip = gltf.animations.find(a => 
        a.name.toLowerCase().includes('door') || a.name.toLowerCase().includes('eshik')
      ) || gltf.animations[0];

      if (doorClip) {
        doorAction = mixer.clipAction(doorClip);
        doorAction.play();
        doorAction.paused = true; // Avtomatik o'ynashni to'xtatib, scroll'ga topshiramiz
        doorClipDuration = doorClip.duration;
      }
    }

    // 2. TUGUNLARNI TEKSHIRISH
    carModel.traverse((child) => {
      const name = child.name.toLowerCase();

      if (child.isMesh && child.material && child.material.transparent) {
        child.material.opacity = Math.max(child.material.opacity, 0.1);
        child.material.depthWrite = false;
      }

      if (NODE_NAME_HINTS.bodyShell.some((hint) => name.includes(hint))) {
        carParts.shell.push(child);
      }
    });

    // Loading oynasini yashirish
    const loaderEl = document.getElementById('loader');
    if (loaderEl) {
      loaderEl.style.transition = 'opacity 0.8s ease';
      loaderEl.style.opacity = '0';
      setTimeout(() => {
        loaderEl.style.display = 'none';
        document.body.classList.remove('overflow-hidden');
      }, 800);
    }

    tick();
  },
  (xhr) => {
    if (xhr.total) {
      const percent = Math.round((xhr.loaded / xhr.total) * 100);
      const loaderBar = document.getElementById('loader-bar');
      if (loaderBar) loaderBar.style.width = percent + '%';
    }
  },
  (error) => {
    console.error('Model yuklashda xatolik:', error);
  }
);

// ── SCROLL HISOBLASH ──
window.addEventListener('scroll', () => {
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  scrollProgress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
});

function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end;
}

// ── ANIMATSIYALARNI SCROLL'GA BOG'LASH ──
function updateCameraAndCar() {
  if (!carModel) return;

  // 1. Kamera trayektoriyasi
  let currentPoint = CAMERA_PATH[0];
  let nextPoint = CAMERA_PATH[1];
  let localT = 0;

  for (let i = 0; i < CAMERA_PATH.length - 1; i++) {
    if (scrollProgress >= CAMERA_PATH[i].t && scrollProgress <= CAMERA_PATH[i + 1].t) {
      currentPoint = CAMERA_PATH[i];
      nextPoint = CAMERA_PATH[i + 1];
      localT = (scrollProgress - currentPoint.t) / (nextPoint.t - currentPoint.t);
      break;
    }
  }

  camera.position.set(
    lerp(currentPoint.position[0], nextPoint.position[0], localT),
    lerp(currentPoint.position[1], nextPoint.position[1], localT),
    lerp(currentPoint.position[2], nextPoint.position[2], localT)
  );

  const lookAtX = lerp(currentPoint.lookAt[0], nextPoint.lookAt[0], localT);
  const lookAtY = lerp(currentPoint.lookAt[1], nextPoint.lookAt[1], localT);
  const lookAtZ = lerp(currentPoint.lookAt[2], nextPoint.lookAt[2], localT);
  camera.lookAt(lookAtX, lookAtY, lookAtZ);

  // 2. MODEL NING ICHI O'ZIDAGI ANIMATSIYANI SCROLL BO'YICHA BOSHQARISH
  if (mixer && doorAction) {
    let doorProgress = 0;
    if (scrollProgress >= DOOR_OPEN_RANGE[0]) {
      doorProgress = Math.min(
        1,
        Math.max(0, (scrollProgress - DOOR_OPEN_RANGE[0]) / (DOOR_OPEN_RANGE[1] - DOOR_OPEN_RANGE[0]))
      );
    }
    
    // Animatsiya vaqtini scroll progressga o'tkazamiz
    doorAction.time = doorProgress * doorClipDuration;
    mixer.update(0); // O'zgarishni kadrda darhol yangilaymiz
  }

  // 3. Salonga kirganda kuzovni yashirish
  if (carParts.shell && carParts.shell.length > 0) {
    const isInside = scrollProgress >= INTERIOR_HIDE_SHELL_RANGE[0];
    carParts.shell.forEach((mesh) => {
      mesh.visible = !isInside;
    });
  }
}

// ── RESIZE ──
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  floorReflector.getRenderTarget().setSize(
    (window.innerWidth * window.devicePixelRatio) / 2,
    (window.innerWidth * window.devicePixelRatio) / 2
  );
});

// ── RENDER LOOP ──
function tick() {
  updateCameraAndCar();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}