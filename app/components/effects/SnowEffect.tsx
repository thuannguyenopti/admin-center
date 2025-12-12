"use client";

import { useEffect, useRef } from "react";

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speed: number;
  drift: number;
  opacity: number;
  active: boolean;
}

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  targetOpacity: number;
  fadeSpeed: number;
  active: boolean;
}

interface Ornament {
  x: number;
  y: number;
  radius: number;
  speed: number;
  swing: number;
  swingOffset: number;
  color: string;
  rotation: number;
  active: boolean;
}

interface Light {
  x: number;
  y: number;
  color: string;
  brightness: number;
  targetBrightness: number;
  blinkSpeed: number;
}

const COLORS = {
  snow: ["#FFFFFF", "#E8F4F8", "#A8D8EA"],
  ornaments: ["#DC143C", "#FFD700", "#228B22", "#4169E1", "#FF6347"],
  lights: ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"],
};

// Device-based particle counts
const getParticleCounts = () => {
  const width = typeof window !== "undefined" ? window.innerWidth : 1920;
  
  if (width > 1920) {
    return { snow: 60, stars: 15, ornaments: 8, lights: 30 };
  } else if (width > 768) {
    return { snow: 40, stars: 10, ornaments: 5, lights: 20 };
  } else {
    return { snow: 25, stars: 8, ornaments: 3, lights: 15 };
  }
};

export function SnowEffect() {
  const dynamicCanvasRef = useRef<HTMLCanvasElement>(null);
  const staticCanvasRef = useRef<HTMLCanvasElement>(null);
  const snowflakesRef = useRef<Snowflake[]>([]);
  const starsRef = useRef<Star[]>([]);
  const ornamentsRef = useRef<Ornament[]>([]);
  const lightsRef = useRef<Light[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastFrameTimeRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(true);

  useEffect(() => {
    const dynamicCanvas = dynamicCanvasRef.current;
    const staticCanvas = staticCanvasRef.current;
    if (!dynamicCanvas || !staticCanvas) return;

    const dynamicCtx = dynamicCanvas.getContext("2d", { alpha: true });
    const staticCtx = staticCanvas.getContext("2d", { alpha: true });
    if (!dynamicCtx || !staticCtx) return;

    const counts = getParticleCounts();

    // Draw static elements (Christmas lights)
    const drawStaticElements = () => {
      staticCtx.clearRect(0, 0, staticCanvas.width, staticCanvas.height);
      
      // Draw string
      staticCtx.beginPath();
      staticCtx.moveTo(0, 20);
      for (let i = 0; i <= counts.lights; i++) {
        const x = (staticCanvas.width / (counts.lights + 1)) * (i + 1);
        const y = 20 + Math.sin(i * 0.5) * 5;
        staticCtx.lineTo(x, y);
      }
      staticCtx.strokeStyle = "#333";
      staticCtx.lineWidth = 2;
      staticCtx.stroke();
    };

    // Set canvas size
    const resizeCanvas = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      dynamicCanvas.width = width;
      dynamicCanvas.height = height;
      staticCanvas.width = width;
      staticCanvas.height = height;
      
      // Redraw static elements
      drawStaticElements();
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize particle pools
    const initSnowflakes = () => {
      snowflakesRef.current = Array.from({ length: counts.snow }, () => ({
        x: Math.random() * dynamicCanvas.width,
        y: Math.random() * dynamicCanvas.height,
        radius: Math.random() * 3 + 1,
        speed: Math.random() * 1 + 0.5,
        drift: Math.random() * 0.5 - 0.25,
        opacity: Math.random() * 0.6 + 0.4,
        active: true,
      }));
    };

    const initStars = () => {
      starsRef.current = Array.from({ length: counts.stars }, () => ({
        x: Math.random() * dynamicCanvas.width,
        y: Math.random() * (dynamicCanvas.height * 0.4),
        size: Math.random() * 3 + 2,
        opacity: Math.random(),
        targetOpacity: Math.random(),
        fadeSpeed: Math.random() * 0.02 + 0.01,
        active: true,
      }));
    };

    const initOrnaments = () => {
      ornamentsRef.current = Array.from({ length: counts.ornaments }, () => ({
        x: Math.random() * dynamicCanvas.width,
        y: Math.random() * dynamicCanvas.height - dynamicCanvas.height,
        radius: Math.random() * 8 + 6,
        speed: Math.random() * 0.8 + 0.4,
        swing: Math.random() * 2 - 1,
        swingOffset: Math.random() * Math.PI * 2,
        color: COLORS.ornaments[Math.floor(Math.random() * COLORS.ornaments.length)],
        rotation: 0,
        active: true,
      }));
    };

    const initLights = () => {
      const spacing = dynamicCanvas.width / (counts.lights + 1);
      lightsRef.current = Array.from({ length: counts.lights }, (_, i) => ({
        x: spacing * (i + 1),
        y: 20,
        color: COLORS.lights[i % COLORS.lights.length],
        brightness: Math.random(),
        targetBrightness: Math.random(),
        blinkSpeed: Math.random() * 0.03 + 0.01,
      }));
    };

    initSnowflakes();
    initStars();
    initOrnaments();
    initLights();

    // Page Visibility API
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      if (isVisibleRef.current && animationFrameRef.current === undefined) {
        lastFrameTimeRef.current = performance.now();
        animate(lastFrameTimeRef.current);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Batch render snowflakes
    const renderSnowflakes = () => {
      const canvas = dynamicCanvas;
      
      snowflakesRef.current.forEach((snowflake) => {
        if (!snowflake.active) return;
        
        // Viewport culling
        if (snowflake.y < -10 || snowflake.y > canvas.height + 10) {
          snowflake.y = -10;
          snowflake.x = Math.random() * canvas.width;
          return;
        }

        // Update position
        snowflake.y += snowflake.speed;
        snowflake.x += snowflake.drift;

        if (snowflake.x > canvas.width) snowflake.x = 0;
        else if (snowflake.x < 0) snowflake.x = canvas.width;

        // Draw
        dynamicCtx.beginPath();
        dynamicCtx.arc(snowflake.x, snowflake.y, snowflake.radius, 0, Math.PI * 2);
        const colorIndex = Math.floor(snowflake.radius / 1.5) % COLORS.snow.length;
        dynamicCtx.fillStyle = COLORS.snow[colorIndex];
        dynamicCtx.globalAlpha = snowflake.opacity;
        dynamicCtx.fill();
      });
      dynamicCtx.globalAlpha = 1;
    };

    // Batch render stars
    const renderStars = () => {
      starsRef.current.forEach((star) => {
        if (!star.active) return;

        // Update opacity (twinkling)
        if (Math.abs(star.opacity - star.targetOpacity) < 0.05) {
          star.targetOpacity = Math.random();
        }
        star.opacity += (star.targetOpacity - star.opacity) * star.fadeSpeed;

        // Draw 5-point star
        dynamicCtx.save();
        dynamicCtx.translate(star.x, star.y);
        dynamicCtx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const x = Math.cos(angle) * star.size;
          const y = Math.sin(angle) * star.size;
          if (i === 0) dynamicCtx.moveTo(x, y);
          else dynamicCtx.lineTo(x, y);
        }
        dynamicCtx.closePath();
        dynamicCtx.fillStyle = "#FFD700";
        dynamicCtx.globalAlpha = star.opacity;
        dynamicCtx.fill();
        dynamicCtx.restore();
      });
      dynamicCtx.globalAlpha = 1;
    };

    // Batch render ornaments
    const renderOrnaments = () => {
      const canvas = dynamicCanvas;
      
      ornamentsRef.current.forEach((ornament) => {
        if (!ornament.active) return;

        // Viewport culling
        if (ornament.y > canvas.height + 50) {
          ornament.y = -50;
          ornament.x = Math.random() * canvas.width;
          return;
        }

        // Update position
        ornament.y += ornament.speed;
        const swingX = Math.sin(Date.now() / 1000 + ornament.swingOffset) * ornament.swing * 20;

        // Draw ornament with gradient
        const gradient = dynamicCtx.createRadialGradient(
          ornament.x + swingX - ornament.radius * 0.3,
          ornament.y - ornament.radius * 0.3,
          0,
          ornament.x + swingX,
          ornament.y,
          ornament.radius
        );
        gradient.addColorStop(0, ornament.color);
        gradient.addColorStop(0.3, ornament.color);
        gradient.addColorStop(1, "#000");

        dynamicCtx.beginPath();
        dynamicCtx.arc(ornament.x + swingX, ornament.y, ornament.radius, 0, Math.PI * 2);
        dynamicCtx.fillStyle = gradient;
        dynamicCtx.fill();

        // Cap
        dynamicCtx.beginPath();
        dynamicCtx.rect(
          ornament.x + swingX - ornament.radius * 0.3,
          ornament.y - ornament.radius - 3,
          ornament.radius * 0.6,
          3
        );
        dynamicCtx.fillStyle = "#FFD700";
        dynamicCtx.fill();
      });
    };

    // Render lights (on static canvas, updated for blinking)
    const renderLights = () => {
      lightsRef.current.forEach((light) => {
        // Update brightness
        if (Math.abs(light.brightness - light.targetBrightness) < 0.05) {
          light.targetBrightness = Math.random() * 0.5 + 0.5;
        }
        light.brightness += (light.targetBrightness - light.brightness) * light.blinkSpeed;

        // Draw light bulb
        staticCtx.beginPath();
        staticCtx.arc(light.x, light.y, 6, 0, Math.PI * 2);
        staticCtx.fillStyle = light.color;
        staticCtx.globalAlpha = light.brightness;
        staticCtx.fill();

        // Glow effect
        staticCtx.beginPath();
        staticCtx.arc(light.x, light.y, 10, 0, Math.PI * 2);
        staticCtx.fillStyle = light.color;
        staticCtx.globalAlpha = light.brightness * 0.3;
        staticCtx.fill();
      });
      staticCtx.globalAlpha = 1;
    };

    // Animation loop
    const animate = (currentTime: number) => {
      if (!isVisibleRef.current) {
        animationFrameRef.current = undefined;
        return;
      }

      const deltaTime = currentTime - lastFrameTimeRef.current;
      lastFrameTimeRef.current = currentTime;

      // Clear dynamic canvas
      dynamicCtx.clearRect(0, 0, dynamicCanvas.width, dynamicCanvas.height);

      // Render all elements
      renderSnowflakes();
      renderStars();
      renderOrnaments();
      
      // Update lights less frequently (every 3 frames)
      if (Math.floor(currentTime / 50) % 3 === 0) {
        staticCtx.clearRect(0, 0, staticCanvas.width, staticCanvas.height);
        drawStaticElements();
        renderLights();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    lastFrameTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <>
      <canvas
        ref={staticCanvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 9998 }}
      />
      <canvas
        ref={dynamicCanvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 9999 }}
      />
    </>
  );
}