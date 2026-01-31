"use client";

import { useRef, useEffect } from "react";

/**
 * StarfieldCanvas — a gentle field of twinkling stars
 *
 * Renders behind all content to create depth and intimacy.
 * Uses Canvas API + requestAnimationFrame for smooth 60fps animation.
 */

interface Star {
  x: number;
  y: number;
  radius: number;
  baseOpacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  drift: number;
}

function createStars(width: number, height: number): Star[] {
  // Scale star count by viewport area; fewer on small screens
  const count = Math.floor((width * height) / 3000);
  const stars: Star[] = [];

  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 0.5 + Math.random() * 1.5,
      baseOpacity: 0.3 + Math.random() * 0.5,
      twinkleSpeed: 0.01 + Math.random() * 0.02,
      twinkleOffset: Math.random() * Math.PI * 2,
      drift: 0.05,
    });
  }

  return stars;
}

export default function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // DPR-aware sizing
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      starsRef.current = createStars(w, h);
    };

    resize();

    // Throttle resize to avoid excessive re-creation
    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    };
    window.addEventListener("resize", handleResize);

    // Animation loop
    let frame = 0;
    const animate = () => {
      frame++;
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      for (const star of starsRef.current) {
        // Sine-wave twinkle (±0.3 around base opacity)
        const twinkle = Math.sin(frame * star.twinkleSpeed + star.twinkleOffset) * 0.3;
        const opacity = Math.max(0, Math.min(1, star.baseOpacity + twinkle));

        // Slow upward drift
        star.y -= star.drift;
        if (star.y < -2) {
          star.y = h + 2;
          star.x = Math.random() * w;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
