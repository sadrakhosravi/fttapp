<template>
  <div class="cylinder-component">
    <div class="controls">
      <label>
        Radius 1 (cm):
        <input type="number" v-model.number="r1" step="0.1" />
      </label>
      <label>
        Radius 2 (cm):
        <input type="number" v-model.number="r2" step="0.1" />
      </label>
      <label>
        Height (cm):
        <input type="number" v-model.number="h" step="0.1" />
      </label>
      <label>
        Cut Angle (degrees):
        <input type="number" v-model.number="cutAngle" step="1" min="0" max="90" />
      </label>
      <button @click="updateGeometry">Update Geometry</button>
      <button @click="exportPDF">Export PDF</button>
    </div>
    <div ref="rendererContainer" class="renderer-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as THREE from 'three';
import { jsPDF } from 'jspdf';

// Reactive state variables
const r1 = ref<number>(3); // Bottom radius in cm
const r2 = ref<number>(1.5); // Top radius in cm
const h = ref<number>(5); // Height in cm
const cutAngle = ref<number>(45); // Cut angle in degrees
const cirRes = ref<number>(100); // Circular resolution

// References and Three.js related variables
const rendererContainer = ref<HTMLElement | null>(null);
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let cylinderMesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material> | null = null;
let animationId: number;

// Initialize Three.js
const initThreeJS = () => {
  if (!rendererContainer.value) return;

  const width = rendererContainer.value.clientWidth;
  const height = rendererContainer.value.clientHeight;

  // Scene and Camera
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.set(0, 0, 10);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  rendererContainer.value.appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 10, 7.5);
  scene.add(directionalLight);

  // Start Animation
  animate();
};

// Animation loop
const animate = () => {
  animationId = requestAnimationFrame(animate);
  if (cylinderMesh) {
    cylinderMesh.rotation.y += 0.005;
  }
  renderer.render(scene, camera);
};

// Handle window resize
const onWindowResize = () => {
  if (!rendererContainer.value) return;

  const width = rendererContainer.value.clientWidth;
  const height = rendererContainer.value.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
};

// Create or update the cylinder geometry
const createGeometry = () => {
  const currentR1 = r1.value;
  const currentR2 = r2.value;
  const currentH = h.value;
  const currentCutAngle = THREE.MathUtils.degToRad(cutAngle.value);
  const currentCirRes = Math.max(3, cirRes.value); // Minimum of 3 segments

  // Remove existing mesh
  if (cylinderMesh) {
    scene.remove(cylinderMesh);
    cylinderMesh.geometry.dispose();
    (cylinderMesh.material as THREE.Material).dispose();
    cylinderMesh = null;
  }

  // Compute thetaLength (angle for the cylinder's geometry)
  const thetaLength = 2 * Math.PI - currentCutAngle;

  // Create geometry
  const geometry = new THREE.CylinderGeometry(
    currentR2,
    currentR1,
    currentH,
    currentCirRes,
    1,
    false,
    0,
    thetaLength
  );

  // Material
  const material = new THREE.MeshStandardMaterial({
    color: 0x0077ff,
    side: THREE.DoubleSide,
    flatShading: true
  });

  // Mesh
  cylinderMesh = new THREE.Mesh(geometry, material);
  scene.add(cylinderMesh);
};

// Update geometry when parameters change
const updateGeometry = () => {
  createGeometry();
};

// Export the unwrapped shape as a PDF
const exportPDF = () => {
  const doc = new jsPDF('portrait', 'cm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const currentR1 = r1.value;
  const currentR2 = r2.value;
  const currentH = h.value;
  const currentCutAngle = THREE.MathUtils.degToRad(cutAngle.value);

  // Calculate slant height of the frustum (optional, not used here)
  // const slantHeight = Math.sqrt((currentR2 - currentR1) ** 2 + currentH ** 2);

  // Calculate the arc lengths
  const circumference1 = 2 * Math.PI * currentR1;
  const circumference2 = 2 * Math.PI * currentR2;
  const arcLength1 = ((2 * Math.PI - currentCutAngle) / (2 * Math.PI)) * circumference1;
  const arcLength2 = ((2 * Math.PI - currentCutAngle) / (2 * Math.PI)) * circumference2;

  // Unwrapped shape as a trapezoid
  const path = [
    { x: 0, y: 0 },
    { x: arcLength1, y: 0 },
    { x: arcLength2, y: currentH },
    { x: 0, y: currentH },
    { x: 0, y: 0 }
  ];

  // Scale and center the path on the page
  const minX = 0;
  const maxX = Math.max(arcLength1, arcLength2);
  const minY = 0;
  const maxY = currentH;

  const scaleX = (pageWidth - 2) / (maxX - minX); // 1 cm margin
  const scaleY = (pageHeight - 2) / (maxY - minY);

  const scale = Math.min(scaleX, scaleY);

  const offsetX = (pageWidth - (maxX - minX) * scale) / 2 - minX * scale;
  const offsetY = (pageHeight - (maxY - minY) * scale) / 2 - minY * scale;

  // Draw the unwrapped shape
  doc.setLineWidth(0.05);
  doc.setDrawColor(0, 0, 0);

  doc.moveTo(offsetX + path[0].x * scale, offsetY + path[0].y * scale);

  for (let i = 1; i < path.length; i++) {
    doc.lineTo(offsetX + path[i].x * scale, offsetY + path[i].y * scale);
  }

  // Optional: Add edge lines or markers if needed
  doc.stroke();

  // Save the PDF
  doc.save('cylinder_unwrapped.pdf');
};

// Lifecycle hooks
onMounted(() => {
  initThreeJS();
  createGeometry();
  window.addEventListener('resize', onWindowResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', onWindowResize);
  cancelAnimationFrame(animationId);
  if (renderer) {
    renderer.dispose();
  }
});
</script>

<style scoped>
.cylinder-component {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  text-align: center;
}

.controls {
  margin-bottom: 20px;
}

label {
  display: inline-block;
  margin: 0 10px 10px 0;
}

.renderer-container {
  width: 800px;
  height: 600px;
  margin: 0 auto;
  border: 1px solid #ccc;
}
</style>
