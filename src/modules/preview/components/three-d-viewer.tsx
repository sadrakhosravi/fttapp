'use client';

import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Types
import type { Vector3d, Matrix, Faces } from '@/algorithm/ThroatUnwrap';
import { ThroatUnwrap } from '@/algorithm/ThroatUnwrap';

interface ThreeDViewerProps {
  throatUnwrap: ThroatUnwrap | null;
  animated?: boolean;
}

export const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ throatUnwrap, animated = false }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameRef = useRef<number>(0);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const cylinderMeshRef = useRef<THREE.Mesh | null>(null);
  const cylinderEdgesRef = useRef<THREE.LineSegments | null>(null);
  const animationStartTimeRef = useRef<number | null>(null);

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const [animationProgress, setAnimationProgress] = useState(0);

  // Update container size based on available space
  const updateContainerSize = () => {
    const container = mountRef.current;
    if (!container) return;

    const parentElement = container.parentElement;
    if (!parentElement) return;

    const parentWidth = parentElement.clientWidth || window.innerWidth;
    const parentHeight = parentElement.clientHeight || window.innerHeight;

    // Use most of the available space
    const width = Math.min(parentWidth, 600);
    const height = Math.min(parentHeight, 500);

    setContainerSize({ width, height });
  };

  // Initialize Three.js scene
  useLayoutEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Initial size calculation
    updateContainerSize();

    // Set up ResizeObserver for reliable size detection
    if (!resizeObserverRef.current) {
      const observer = new ResizeObserver(() => {
        updateContainerSize();
      });
      observer.observe(container);
      observer.observe(document.body);
      resizeObserverRef.current = observer;
    }

    // Set up Three.js scene
    if (!sceneRef.current) {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x222222);

      // Add ambient light
      const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
      scene.add(ambientLight);

      // Add directional light
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);

      // Add a second directional light from opposite direction
      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
      directionalLight2.position.set(-1, -1, -1);
      scene.add(directionalLight2);

      sceneRef.current = scene;
    }

    // Create camera if it doesn't exist
    if (!cameraRef.current) {
      const camera = new THREE.PerspectiveCamera(
        45, // FOV
        containerSize.width / containerSize.height, // Aspect ratio
        0.1, // Near clipping plane
        1000, // Far clipping plane
      );
      camera.position.set(0, 0, 15);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;
    }

    // Create renderer if it doesn't exist
    if (!rendererRef.current) {
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true;
      rendererRef.current = renderer;
      container.appendChild(renderer.domElement);
    }

    // Create orbit controls if they don't exist
    if (cameraRef.current && rendererRef.current && !controlsRef.current) {
      const controls = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
      controls.rotateSpeed = 0.8;
      controls.zoomSpeed = 1.2;
      controls.enablePan = true;
      controls.update();
      controlsRef.current = controls;
    }

    // Window resize handler
    window.addEventListener('resize', updateContainerSize);

    // Mark initialization complete
    setTimeout(() => {
      setIsInitialized(true);
    }, 100);

    return () => {
      // Clean up
      window.removeEventListener('resize', updateContainerSize);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }

      // Cancel any ongoing animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Clean up Three.js objects
      if (rendererRef.current) {
        if (container.contains(rendererRef.current.domElement)) {
          container.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current.dispose();
        rendererRef.current = null;
      }

      if (controlsRef.current) {
        controlsRef.current.dispose();
        controlsRef.current = null;
      }

      sceneRef.current = null;
      cameraRef.current = null;
    };
  }, []);

  // Update renderer size when container size changes
  useEffect(() => {
    const renderer = rendererRef.current;
    const camera = cameraRef.current;

    if (renderer && camera && containerSize.width > 0 && containerSize.height > 0) {
      renderer.setSize(containerSize.width, containerSize.height);

      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = containerSize.width / containerSize.height;
        camera.updateProjectionMatrix();
      }

      // Force a render after resize
      if (sceneRef.current) {
        renderer.render(sceneRef.current, camera);
      }
    }
  }, [containerSize]);

  // Create both the 3D cylinder and unwrapped 2D version for animation
  useEffect(() => {
    if (!throatUnwrap || !isInitialized || !sceneRef.current) return;

    const scene = sceneRef.current;

    // Remove previous cylinder if it exists
    if (cylinderMeshRef.current) {
      scene.remove(cylinderMeshRef.current);
      cylinderMeshRef.current.geometry.dispose();
      (cylinderMeshRef.current.material as THREE.Material).dispose();
      cylinderMeshRef.current = null;
    }

    if (cylinderEdgesRef.current) {
      scene.remove(cylinderEdgesRef.current);
      cylinderEdgesRef.current.geometry.dispose();
      (cylinderEdgesRef.current.material as THREE.Material).dispose();
      cylinderEdgesRef.current = null;
    }

    const [vertices3D, faces] = throatUnwrap.cylinder;
    const vertices2D = throatUnwrap.unwrappedCylinder;

    // Create geometry
    const geometry = new THREE.BufferGeometry();

    // Create morphing vertices
    // Start with the 2D unwrapped positions
    const positions2D: number[] = [];
    vertices2D.forEach((vertex) => {
      // Place the 2D unwrapped version flat on the XZ plane
      positions2D.push(vertex[0], 0, vertex[1]);
    });

    // Set the 3D target positions
    const positions3D: number[] = [];
    vertices3D.forEach((vertex) => {
      positions3D.push(vertex[0], vertex[1], vertex[2]);
    });

    // Set initial positions (flat unwrapped)
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions2D, 3));

    // Create faces
    const indices: number[] = [];
    faces.forEach((face) => {
      indices.push(face[0], face[1], face[2]);
    });

    geometry.setIndex(indices);

    // Calculate normals for proper lighting
    geometry.computeVertexNormals();

    // Create materials
    const material = new THREE.MeshPhongMaterial({
      color: 0x4a9eff,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      flatShading: false,
    });

    // Create cylinder mesh
    const cylinderMesh = new THREE.Mesh(geometry, material);
    scene.add(cylinderMesh);
    cylinderMeshRef.current = cylinderMesh;

    // Create edges for wireframe look
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 1,
    });

    const lineSegments = new THREE.LineSegments(edges, lineMaterial);
    scene.add(lineSegments);
    cylinderEdgesRef.current = lineSegments;

    // Position camera to view the shape properly
    if (cameraRef.current) {
      const boundingBox = new THREE.Box3().setFromObject(cylinderMesh);
      const center = new THREE.Vector3();
      boundingBox.getCenter(center);

      // Center the object in world space
      cylinderMesh.position.sub(center);
      lineSegments.position.sub(center);

      // Reset camera target to origin now that object is centered
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }

      const size = new THREE.Vector3();
      boundingBox.getSize(size);

      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = cameraRef.current.fov * (Math.PI / 180);
      let cameraDistance = Math.abs(maxDim / Math.sin(fov / 2));

      // Further reduce padding to zoom in closer to the object
      cameraDistance *= 0.9;

      // Set camera position to look at the center from a distance
      const phi = Math.PI / 4; // 45 degrees
      const theta = Math.PI / 3; // 60 degrees

      cameraRef.current.position.set(
        cameraDistance * Math.sin(phi) * Math.cos(theta),
        cameraDistance * Math.cos(phi),
        cameraDistance * Math.sin(phi) * Math.sin(theta),
      );

      cameraRef.current.lookAt(0, 0, 0);
      cameraRef.current.updateProjectionMatrix();
    }

    // Store both position arrays for animation
    cylinderMesh.userData = {
      positions2D: positions2D,
      positions3D: positions3D,
    };

    // Reset animation state
    setIsAnimating(true);
    setAnimationProgress(0);
    animationStartTimeRef.current = null;

    // Render initial scene
    if (rendererRef.current && cameraRef.current) {
      rendererRef.current.render(scene, cameraRef.current);
    }
  }, [throatUnwrap, isInitialized]);

  // Handle folding animation
  useEffect(() => {
    if (!isInitialized || !cylinderMeshRef.current || !isAnimating) return;

    const ANIMATION_DURATION = 2000; // Animation duration in ms

    const animate = (time: number) => {
      if (!cylinderMeshRef.current || !cylinderEdgesRef.current) return;

      // Initialize start time on first animation frame
      if (animationStartTimeRef.current === null) {
        animationStartTimeRef.current = time;
      }

      // Calculate elapsed time and progress
      const elapsedTime = time - animationStartTimeRef.current;
      const progress = Math.min(elapsedTime / ANIMATION_DURATION, 1);
      setAnimationProgress(progress);

      // Get the stored position arrays
      const { positions2D, positions3D } = cylinderMeshRef.current.userData;

      // Create a new array for interpolated positions
      const currentPositions = new Float32Array(positions2D.length);

      // Interpolate between 2D and 3D positions using easing function
      // Cubic easing for a more natural folding effect
      const easedProgress =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      for (let i = 0; i < positions2D.length; i++) {
        currentPositions[i] = positions2D[i] + (positions3D[i] - positions2D[i]) * easedProgress;
      }

      // Update the vertex positions
      cylinderMeshRef.current.geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(currentPositions, 3),
      );

      // Update normals
      cylinderMeshRef.current.geometry.computeVertexNormals();

      // Update the edges
      cylinderEdgesRef.current.geometry.dispose();
      cylinderEdgesRef.current.geometry = new THREE.EdgesGeometry(cylinderMeshRef.current.geometry);

      // Update controls
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      // Render
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      // Continue animation if not complete
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    // Start animation
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isInitialized, isAnimating]);

  // Continuous rendering for interactive controls after animation completes
  useEffect(() => {
    if (
      isAnimating ||
      !isInitialized ||
      !sceneRef.current ||
      !cameraRef.current ||
      !rendererRef.current
    )
      return;

    // Render on controls change for interactivity
    const renderScene = () => {
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    // Set up continuous rendering for smooth controls
    const animate = () => {
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      renderScene();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start continuous rendering
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isInitialized, isAnimating]);

  return (
    <div
      ref={mountRef}
      className="relative overflow-hidden rounded-md border border-white/25"
      style={{
        width: containerSize.width > 0 ? containerSize.width : '100%',
        height: containerSize.height > 0 ? containerSize.height : '400px',
        minHeight: '300px',
        margin: 'auto',
      }}
    >
      {!throatUnwrap && (
        <div className="absolute inset-0 flex items-center justify-center text-white/50">
          No 3D model available
        </div>
      )}

      {throatUnwrap && isAnimating && (
        <div className="absolute right-4 bottom-4 left-4 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full bg-white/70 transition-all duration-300 ease-in-out"
              style={{ width: `${animationProgress * 100}%` }}
            />
          </div>
          <span className="text-xs text-white/70">Folding</span>
        </div>
      )}
    </div>
  );
};
