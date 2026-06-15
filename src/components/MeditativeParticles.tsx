import { useRef, useEffect } from "react";
import * as THREE from "three";
import { MeshLine, MeshLineMaterial } from "three.meshline";

export default function MeditativeParticles() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.offsetWidth;
    let height = container.offsetHeight;

    const scene = new THREE.Scene();
    const cameraDistance = 300;
    const camera = new THREE.PerspectiveCamera(50, width / height, 10, 3000);
    camera.position.z = cameraDistance;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const params = {
      speed: 0.3,
      color1: "#6B8F71",
      color2: "#A8C4AD",
      color3: "#F7F6F2",
      bg: "#F7F6F2",
      radius: 600,
      size: 1.0,
      lines: true,
      lineWidth: 0.05,
      amplitude: 80,
      time: 0,
      particlesCount: window.innerWidth < 768 ? 120 : 250,
    };

    function getColors() {
      const c1 = new THREE.Color(params.color1);
      const c2 = new THREE.Color(params.color2);
      const c3 = new THREE.Color(params.color3);
      return { c1, c2, c3 };
    }

    function getTexture() {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d")!;
      const gradient = ctx.createRadialGradient(16, 16, 4, 16, 16, 16);
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
      return new THREE.CanvasTexture(canvas);
    }

    // Create particles
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];
    const movements: number[] = [];

    for (let i = 0; i < params.particlesCount; i++) {
      positions.push(
        Math.random() * params.radius - params.radius / 2,
        Math.random() * params.radius - params.radius / 2,
        Math.random() * params.radius - params.radius / 2
      );
      movements.push(
        (-1 + Math.random() * 2) * 0.4,
        (-1 + Math.random() * 2) * 0.4,
        (-1 + Math.random() * 2) * 0.4
      );
    }

    const cols = getColors();
    const setColor = (i: number, c: THREE.Color) => {
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    };

    for (let i = 0; i < params.particlesCount; i++) {
      const r = Math.random();
      if (r < 0.15) setColor(i, cols.c1);
      else if (r < 0.3) setColor(i, cols.c3);
      else if (r < 0.8) setColor(i, cols.c2);
      else setColor(i, cols.c1);
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(colors, 3)
    );
    geometry.setAttribute(
      "movement",
      new THREE.Float32BufferAttribute(movements, 3)
    );

    const material = new THREE.PointsMaterial({
      size: params.size,
      vertexColors: true,
      map: getTexture(),
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Lines
    function removeLines() {
      for (let i = scene.children.length - 1; i >= 0; i--) {
        if (scene.children[i].name === "animated-line") {
          scene.remove(scene.children[i]);
        }
      }
    }

    function createLines() {
      if (!params.lines || window.innerWidth < 768) return;
      removeLines();

      const posArray = particles.geometry.attributes.position
        .array as Float32Array;
      const movArray = particles.geometry.attributes.movement
        .array as Float32Array;
      const totalLines = 25;
      const pointsPerLine = 50;
      const lineColor = new THREE.Color(params.color1);

      for (let i = 0; i < totalLines; i++) {
        const pIndex = Math.floor(Math.random() * params.particlesCount);
        const x = posArray[pIndex * 3];
        const y = posArray[pIndex * 3 + 1];
        const z = posArray[pIndex * 3 + 2];
        const mX = movArray[pIndex * 3];
        const mY = movArray[pIndex * 3 + 1];
        const mZ = movArray[pIndex * 3 + 2];

        const points: THREE.Vector3[] = [];
        for (let j = 0; j < pointsPerLine; j++) {
          const jRatio = j / pointsPerLine;
          points.push(
            new THREE.Vector3(
              x + 5.1 * jRatio * mX,
              y + 5.1 * jRatio * mY,
              z + 5.1 * jRatio * mZ
            )
          );
        }

        const line = new MeshLine();
        line.setPoints(
          points.map((p) => [p.x, p.y, p.z]).flat() as number[]
        );
        const lineMaterial = new MeshLineMaterial({
          lineWidth: params.lineWidth,
          color: lineColor,
          transparent: true,
          opacity: 0.25,
          depthWrite: false,
          blending: THREE.NormalBlending,
        });
        const mesh = new THREE.Mesh(line as unknown as THREE.BufferGeometry, lineMaterial);
        mesh.name = "animated-line";
        scene.add(mesh);
      }
    }

    let isVisible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    function update() {
      if (!isVisible) return;
      const posArray = particles.geometry.attributes.position
        .array as Float32Array;
      params.time += params.speed / 1000;

      for (let i = 0; i < params.particlesCount; i++) {
        posArray[i * 3 + 1] +=
          (Math.sin(params.time + posArray[i * 3] * 0.015) +
            Math.cos(params.time * 0.5 + posArray[i * 3] * 0.005)) *
          (params.amplitude / 100);

        if (posArray[i * 3] < -params.radius / 2) {
          posArray[i * 3] += params.radius;
        } else if (posArray[i * 3] > params.radius / 2) {
          posArray[i * 3] -= params.radius;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;
    }

    let animId: number;
    function animate() {
      animId = requestAnimationFrame(animate);
      update();
      renderer.render(scene, camera);
    }

    createLines();
    animate();

    const handleResize = () => {
      width = container.offsetWidth;
      height = container.offsetHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
      removeLines();
      scene.remove(particles);
      particles.geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 -z-10 pointer-events-none"
    />
  );
}
