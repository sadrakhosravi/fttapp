<script setup lang="ts"></script>

<template>
  <div id="app">
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

<script>
import * as THREE from 'three';
import jsPDF from 'jspdf';

export default {
  name: 'CylinderComponent',
  data() {
    return {
      r1: 3, // Bottom radius in cm
      r2: 1.5, // Top radius in cm
      h: 5, // Height in cm
      cutAngle: 45, // Cut angle in degrees
      cirRes: 100, // Circular resolution
      scene: null,
      camera: null,
      renderer: null,
      cylinderMesh: null,
      animationId: null
    };
  },
  mounted() {
    this.initThreeJS();
    this.createGeometry();
    window.addEventListener('resize', this.onWindowResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
    cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
  },
  methods: {
    initThreeJS() {
      const width = this.$refs.rendererContainer.clientWidth;
      const height = this.$refs.rendererContainer.clientHeight;

      // Scene and Camera
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      this.camera.position.set(0, 0, 10);

      // Renderer
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize(width, height);
      this.$refs.rendererContainer.appendChild(this.renderer.domElement);

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      this.scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 10, 7.5);
      this.scene.add(directionalLight);

      // Start Animation
      this.animate();
    },
    animate() {
      this.animationId = requestAnimationFrame(this.animate);
      if (this.cylinderMesh) {
        this.cylinderMesh.rotation.y += 0.005;
      }
      this.renderer.render(this.scene, this.camera);
    },
    onWindowResize() {
      const width = this.$refs.rendererContainer.clientWidth;
      const height = this.$refs.rendererContainer.clientHeight;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);
    },
    updateGeometry() {
      this.createGeometry();
    },
    createGeometry() {
      const r1 = this.r1;
      const r2 = this.r2;
      const h = this.h;
      const cutAngle = THREE.MathUtils.degToRad(this.cutAngle);
      const cirRes = Math.max(3, this.cirRes); // Minimum of 3 segments

      // Remove existing mesh
      if (this.cylinderMesh) {
        this.scene.remove(this.cylinderMesh);
        this.cylinderMesh.geometry.dispose();
        this.cylinderMesh.material.dispose();
        this.cylinderMesh = null;
      }

      // Compute thetaLength (angle for the cylinder's geometry)
      const thetaLength = 2 * Math.PI - cutAngle;

      // Create geometry
      const geometry = new THREE.CylinderGeometry(r2, r1, h, cirRes, 1, false, 0, thetaLength);

      // Material
      const material = new THREE.MeshStandardMaterial({
        color: 0x0077ff,
        side: THREE.DoubleSide,
        flatShading: true
      });

      // Mesh
      this.cylinderMesh = new THREE.Mesh(geometry, material);
      this.scene.add(this.cylinderMesh);
    },
    exportPDF() {
      const doc = new jsPDF('portrait', 'cm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const r1 = this.r1;
      const r2 = this.r2;
      const h = this.h;
      const cutAngle = THREE.MathUtils.degToRad(this.cutAngle);

      // Calculate slant height of the frustum
      const slantHeight = Math.sqrt((r2 - r1) ** 2 + h ** 2);

      // Calculate the arc lengths
      const circumference1 = 2 * Math.PI * r1;
      const circumference2 = 2 * Math.PI * r2;
      const arcLength1 = ((2 * Math.PI - cutAngle) / (2 * Math.PI)) * circumference1;
      const arcLength2 = ((2 * Math.PI - cutAngle) / (2 * Math.PI)) * circumference2;

      // Unwrapped shape as a trapezoid
      const path = [
        { x: 0, y: 0 },
        { x: arcLength1, y: 0 },
        { x: arcLength2, y: h },
        { x: 0, y: h },
        { x: 0, y: 0 }
      ];

      // Scale and center the path on the page
      const minX = 0;
      const maxX = Math.max(arcLength1, arcLength2);
      const minY = 0;
      const maxY = h;

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
    }
  }
};
</script>

<style scoped>
#app {
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
}
</style>
