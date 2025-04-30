import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import * as THREE from 'three';

// Types
import type { Matrix } from '@/algorithm/ThroatUnwrap';
import { PageSize, PAGE_DIMENSIONS, RGBColor } from '@/modules/pdf/constants';

interface ShapeViewerProps {
  Vuv: Matrix;
  edges: number[];
  color?: RGBColor;
  padding?: number; // mm
  strokeThickness?: number; // mm
  pageSize?: PageSize; // default 'a4'
  isLandscape?: boolean; // default false (portrait)
}

export const ShapeViewer: React.FC<ShapeViewerProps> = ({
  Vuv,
  edges,
  color = { r: 255, g: 255, b: 255 }, // Default to white for the shape
  padding = 0,
  strokeThickness = 0.5,
  pageSize = PageSize.A4,
  isLandscape = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isInitialized, setIsInitialized] = useState(false);

  // Get current page dimensions for aspect ratio, swapping if landscape
  let {
    mm: [pageWidthMm, pageHeightMm],
  } = PAGE_DIMENSIONS[pageSize];

  // Swap dimensions for landscape mode
  if (isLandscape) {
    [pageWidthMm, pageHeightMm] = [pageHeightMm, pageWidthMm];
  }

  // Calculate container dimensions based on available space
  const updateContainerSize = () => {
    const container = mountRef.current;
    if (!container) return;

    const parentElement = container.parentElement?.parentElement?.parentElement;
    if (!parentElement) return;

    const parentHeight = parentElement.clientHeight || window.innerHeight;
    const maxHeight = Math.min(parentHeight - 40, window.innerHeight * 0.8); // Reduce height a bit more for scrollbar

    // Calculate width based on aspect ratio and maximum height
    const aspectRatio = pageWidthMm / pageHeightMm;
    let height = maxHeight;
    let width = height * aspectRatio;

    // Since the parent now has horizontal scrolling, we don't need to constrain the width
    // to the visible area. This allows the component to maintain its proper aspect ratio.
    // Only constrain the height to prevent vertical scrolling

    setContainerSize({ width, height });
  };

  // Initialize the Three.js scene - use useLayoutEffect for DOM measurements before painting
  useLayoutEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Initial size calculation
    updateContainerSize();

    // Set up ResizeObserver for more reliable size detection
    if (!resizeObserverRef.current) {
      const observer = new ResizeObserver((entries) => {
        if (entries[0]) {
          updateContainerSize();
        }
      });
      observer.observe(container);

      // Observe the scrollable parent container too
      const scrollableParent = container.parentElement?.parentElement;
      if (scrollableParent) {
        observer.observe(scrollableParent);
      }

      observer.observe(document.body); // Also observe body for layout changes
      resizeObserverRef.current = observer;
    }

    // Set up Three.js scene if it doesn't exist yet
    if (!sceneRef.current) {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x222222); // Darker background
      sceneRef.current = scene;
    } else {
      // Update background color if scene exists
      if (sceneRef.current.background) {
        sceneRef.current.background = new THREE.Color(0x222222);
      }
    }

    // Create or update camera with the current page dimensions
    const camera = cameraRef.current || new THREE.OrthographicCamera(0, 1, 1, 0, 0.1, 1000);
    camera.left = 0;
    camera.right = pageWidthMm;
    camera.top = pageHeightMm;
    camera.bottom = 0;
    camera.updateProjectionMatrix();
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Create renderer if it doesn't exist
    if (!rendererRef.current) {
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      rendererRef.current = renderer;
      container.appendChild(renderer.domElement);
    }

    // Also listen for window resize events for additional safety
    window.addEventListener('resize', updateContainerSize);

    // Mark initialization complete after a small delay to ensure everything is ready
    setTimeout(() => {
      setIsInitialized(true);
    }, 100);

    return () => {
      // Clean up event listener and observer
      window.removeEventListener('resize', updateContainerSize);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }

      // Only clean up on component unmount
      if (!mountRef.current) {
        if (rendererRef.current) {
          rendererRef.current.dispose();
          rendererRef.current = null;
        }
        if (sceneRef.current) {
          sceneRef.current = null;
        }
        if (cameraRef.current) {
          cameraRef.current = null;
        }
      }
    };
  }, [pageSize, pageWidthMm, pageHeightMm, isLandscape]);

  // Update renderer size when container or page size changes
  useEffect(() => {
    const renderer = rendererRef.current;
    const container = mountRef.current;

    if (renderer && container && containerSize.width > 0 && containerSize.height > 0) {
      renderer.setSize(containerSize.width, containerSize.height);

      // Force a render after resize
      if (sceneRef.current && cameraRef.current) {
        renderer.render(sceneRef.current, cameraRef.current);
      }
    }
  }, [containerSize, pageSize, isLandscape]);

  // Draw to the screen when dependencies change
  useEffect(() => {
    // Skip initial render until component is properly initialized with dimensions
    if (!isInitialized || containerSize.width === 0 || containerSize.height === 0) {
      return;
    }

    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;

    if (!scene || !camera || !renderer) return;

    // Clear previous objects
    scene.clear();

    // Get base dimensions
    let {
      pts: [pageWidthPts, pageHeightPts],
      mm: [pageWidthMm, pageHeightMm],
    } = PAGE_DIMENSIONS[pageSize];

    // Swap dimensions for landscape
    if (isLandscape) {
      [pageWidthPts, pageHeightPts] = [pageHeightPts, pageWidthPts];
      [pageWidthMm, pageHeightMm] = [pageHeightMm, pageWidthMm];
    }

    const effectiveWidthPts = pageWidthPts - 2 * padding;
    const effectiveHeightPts = pageHeightPts - 2 * padding;
    const cm2pxw = (10 * effectiveWidthPts) / pageWidthMm;
    const cm2pxh = (10 * effectiveHeightPts) / pageHeightMm;
    const pointToMmWidth = pageWidthMm / pageWidthPts;
    const pointToMmHeight = pageHeightMm / pageHeightPts;

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
  }, [
    Vuv,
    edges,
    color,
    padding,
    strokeThickness,
    pageSize,
    containerSize,
    isInitialized,
    isLandscape,
  ]);

  return (
    <div
      ref={mountRef}
      className="relative overflow-clip rounded-md border border-white/25"
      style={{
        width: containerSize.width > 0 ? containerSize.width : 'auto',
        height: containerSize.height > 0 ? containerSize.height : '100%',
        minHeight: '200px', // Ensure there's a minimum height during initial render
      }}
    />
  );
};

export default ShapeViewer;
