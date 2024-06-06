// Mengimpor pustaka THREE.js dan modul tambahan
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Membuat sebuah scene Three.JS
const scene = new THREE.Scene();

// Membuat kamera dengan sudut pandang, aspek rasio, jarak terdekat dan terjauh
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Menginstansiasi renderer dan mengatur ukurannya
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Menambahkan renderer ke dalam DOM
document.getElementById("container3D").appendChild(renderer.domElement);

// Mengatur posisi awal kamera
camera.position.z = 10;
camera.position.x = 5;

// Fungsi untuk membuat bintang-bintang
function createStars() {
  const starGeometry = new THREE.BufferGeometry();
  const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 1.5 });

  const starVertices = [];
  for (let i = 0; i < 10000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starVertices.push(x, y, z);
  }

  starGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(starVertices, 3)
  );
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
}
createStars();

// Membuat grup untuk planet yang akan diorbitkan
const planetGroup = new THREE.Group();
scene.add(planetGroup);

// Memuat model planet dan menambahkannya ke dalam grup
let planet;
const loader = new GLTFLoader();
loader.load(
  `models/planet/scene.gltf`,
  function (gltf) {
    planet = gltf.scene;
    planet.scale.set(3, 3, 3);
    planet.position.set(6, 0, 0); // x,y,z
    planetGroup.add(planet);
    console.log("*[i] Objek Planet berhasil meload", planet);
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (error) {
    console.error("*[i] Objek Planet gagal meload", error);
  }
);

// Menambahkan cahaya ambient ke dalam scene
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// Menambahkan kontrol orbit ke kamera untuk rotasi dan zoom dengan mouse
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = false;

// Membuat raycaster untuk mendeteksi interseksi
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Menambahkan event listener untuk gerakan mouse
document.addEventListener("mousemove", onMouseMove, false);

function onMouseMove(event) {
  // Menghitung posisi mouse dalam koordinat perangkat ternormalisasi
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Memperbarui raycaster
  raycaster.setFromCamera(mouse, camera);

  // Memeriksa interseksi
  const intersects = raycaster.intersectObjects([planet]);

  // Mengaktifkan kontrol orbit jika raycaster berinterseksi dengan objek planet
  if (intersects.length > 3) {
    controls.enabled = true;
  } else {
    controls.enabled = true;
  }
}

// Menambahkan efek berkedip pada bintang
function blinkStars() {
  scene.traverse((object) => {
    if (object.isPoints) {
      // Mengatur warna menjadi kuning atau putih
      const color = Math.random() < 0.5 ? 0xefef74 : 0xffffff;
      object.material.size = Math.random() * 1.2 + 0.2; // Mengacak ukuran
      object.material.color.setHex(color); // Mengatur warna
    }
  });
}
setInterval(blinkStars, 2000); // Memperbarui setiap 2000ms

// Membuat konstelasi bintang
function createConstellations() {
  const constellationMaterial = new THREE.LineBasicMaterial({
    color: 0x1e30f3,
  });

  const zodiacConstellations = [
    {
      name: "Taurus",
      stars: [
        [-1, 1, 5],
        [0, 2, 5],
        [1, 1.5, 5],
        [4, 1, 5],
        [1.5, 0, 5],
        [3.5, -1, 5],
        [-0.5, -1.5, 5],
        [-2.7, 2, 5],
      ],
    },
  ];

  zodiacConstellations.forEach((constellation) => {
    const starPositions = new THREE.Float32BufferAttribute(
      constellation.stars.flat(),
      3
    );
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute("position", starPositions);

    const line = new THREE.Line(starGeometry, constellationMaterial);
    scene.add(line);
  });
}
createConstellations();

// Merender scene
function animate() {
  requestAnimationFrame(animate);

  // Memperbarui kontrol
  controls.update();

  // Memutar planet
  if (planet) {
    planet.rotation.y += 0.005;
  }

  renderer.render(scene, camera);
}

// Menambahkan listener ke window untuk memperbarui ukuran jendela dan kamera
window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Memulai rendering 3D
animate();
