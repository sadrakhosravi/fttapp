import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Types
import type { Matrix } from '@/algorithm/ThroatUnwrap';

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

interface ShapeViewerProps {
  Vuv: Matrix;
  edges: number[];
  color?: RGBColor;
  padding?: number; // mm
  strokeThickness?: number; // mm
  pageSize?: string; // default 'a4'
}

export const ShapeViewer: React.FC<ShapeViewerProps> = ({
  Vuv,
  edges,
  color = { r: 0, g: 0, b: 0 },
  padding = 0,
  strokeThickness = 0.5,
  pageSize = 'a4',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Initialize the Three.js screen
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const pageWidthMm = 210;
    const pageHeightMm = 297;

    // Set up Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const camera = new THREE.OrthographicCamera(
      0, // left
      pageWidthMm, // right
      pageHeightMm, // top
      0, // bottom
      0.1,
      1000,
    );
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });

    const { clientWidth, clientHeight } = container;
    renderer.setSize(clientWidth, clientHeight);
    container.appendChild(renderer.domElement);

    // Store references
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    return () => {
      if (renderer.domElement && mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Draw to the screen when dependencies change
  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;

    if (!scene || !camera || !renderer) return;

    // Clear previous objects
    scene.clear();

    const pageWidthPts = 595;
    const pageHeightPts = 842;
    const pageHeightMm = 297;
    const effectiveWidthPts = pageWidthPts - 2 * padding;
    const effectiveHeightPts = pageHeightPts - 2 * padding;
    const cm2pxw = (10 * effectiveWidthPts) / 210;
    const cm2pxh = (10 * effectiveHeightPts) / 297;
    const pointToMmWidth = 210 / 595;
    const pointToMmHeight = 297 / 842;

    const minx = Math.min(...Vuv.map((r) => r[0]));
    const maxx = Math.max(...Vuv.map((r) => r[0]));
    const miny = Math.min(...Vuv.map((r) => r[1]));
    const maxy = Math.max(...Vuv.map((r) => r[1]));

    if (maxx - minx >= effectiveWidthPts || maxy - miny >= effectiveHeightPts) {
      console.warn('Shape is larger than the page and will be cut off, as intended.');
    }

    const offset = padding + 5;

    const lineMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(`rgb(${color.r},${color.g},${color.b})`),
      linewidth: strokeThickness,
    });

    const lineGeometry = new THREE.BufferGeometry();
    const vertices: number[] = [];

    for (let i = 0; i < edges.length; i += 2) {
      const x0Points = offset + (Vuv[edges[i]][0] - minx) * cm2pxw;
      const x1Points = offset + (Vuv[edges[i + 1]][0] - minx) * cm2pxw;
      const y0Points = pageHeightPts - (offset + (Vuv[edges[i]][1] - miny) * cm2pxh);
      const y1Points = pageHeightPts - (offset + (Vuv[edges[i + 1]][1] - miny) * cm2pxh);
      const x0 = x0Points * pointToMmWidth;
      const x1 = x1Points * pointToMmWidth;
      let y0 = y0Points * pointToMmHeight;
      let y1 = y1Points * pointToMmHeight;

      y0 = pageHeightMm - y0;
      y1 = pageHeightMm - y1;

      vertices.push(x0, y0, 0, x1, y1, 0);
    }

    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineSegments);

    renderer.render(scene, camera);

    return () => {
      lineGeometry.dispose();
      lineMaterial.dispose();
      scene.remove(lineSegments);
    };
  }, [Vuv, edges, color, padding, strokeThickness, pageSize]);

  return (
    <div
      ref={mountRef}
      className="relative aspect-[210/297] h-[calc(100%-4rem)] overflow-hidden rounded-md"
    />
  );
};

export default ShapeViewer;
