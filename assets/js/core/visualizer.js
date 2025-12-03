import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';

let scene, camera, renderer, plane, clock, objects = [];

export function initScene() {
  scene = new THREE.Scene();
  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;
  
  const width = canvas.clientWidth || window.innerWidth;
  const height = canvas.clientHeight || window.innerHeight;
  
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.set(0, 10, 30);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
  // Manejar resize
  function handleResize() {
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  
  window.addEventListener('resize', handleResize);

  const light = new THREE.PointLight(0xffffff, 1);
  light.position.set(10, 20, 10);
  scene.add(light);

  const geometry = new THREE.PlaneGeometry(40, 40, 100, 100); // ancho, alto, subdivisiones
  const material = new THREE.MeshStandardMaterial({
    color: 0x0099ff,
    side: THREE.DoubleSide,
    wireframe: true
  });

  plane = new THREE.Mesh(geometry, material);
  plane.rotation.x = -Math.PI / 2;
  scene.add(plane);

  clock = new THREE.Clock();

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
export function createSphere(freq, velocity) {
  const hue = (freq % 1000) * 0.36;
  const color = new THREE.Color(`hsl(${hue}, 100%, 50%)`);
  const geometry = new THREE.SphereGeometry(velocity * 2, 16, 16);
  const material = new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.9 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set((Math.random() - 0.5) * 20, freq / 100, 0);
  mesh.userData = { lifespan: 1.0 };
  scene.add(mesh);
  objects.push(mesh);
}

export function createWave(freq, strength = 1) {
  const time = clock.getElapsedTime();
  const positionAttr = plane.geometry.attributes.position;

  for (let i = 0; i < positionAttr.count; i++) {
    const x = positionAttr.getX(i);
    const y = positionAttr.getY(i);
    const wave = Math.sin((x + time * 5) * 0.5) * Math.cos((y + time * 2) * 0.5);
    const height = wave * (strength * 0.5);
    positionAttr.setZ(i, height);
  }

  positionAttr.needsUpdate = true;
}