"use client";

import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
}

interface Firework {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  color: string;
  exploded: boolean;
  particles: Particle[];
}

interface Balloon {
  x: number;
  y: number;
  color: string;
  size: number;
  speed: number;
  sway: number;
  swayOffset: number;
}

const CONFETTI_COLORS = ["#FF6B9D", "#FFD93D", "#6BCF7F", "#4ECDC4", "#FF1744", "#FFB300"];
const FIREWORK_COLORS = ["#FF1744", "#FFB300", "#00E676", "#2196F3", "#9C27B0"];
const BALLOON_COLORS = ["#FF6B9D", "#4ECDC4", "#FFD93D", "#9C27B0", "#FF1744"];

const CONFETTI_COUNT = 120;
const BALLOON_COUNT = 12;

export function NewYearEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiRef = useRef<Particle[]>([]);
  const balloonsRef = useRef<Balloon[]>([]);
  const fireworksRef = useRef<Firework[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastFireworkTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize confetti
    const initConfetti = () => {
      confettiRef.current = Array.from({ length: CONFETTI_COUNT }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        vx: Math.random() * 4 - 2,
        vy: Math.random() * 3 + 2,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: Math.random() * 8 + 4,
        opacity: Math.random() * 0.6 + 0.4,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 10 - 5,
      }));
    };
    initConfetti();

    // Initialize balloons
    const initBalloons = () => {
      balloonsRef.current = Array.from({ length: BALLOON_COUNT }, () => ({
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 200,
        color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
        size: Math.random() * 20 + 30,
        speed: Math.random() * 0.5 + 0.3,
        sway: Math.random() * 2 - 1,
        swayOffset: Math.random() * Math.PI * 2,
      }));
    };
    initBalloons();

    // Create firework
    const createFirework = () => {
      const x = Math.random() * (canvas.width * 0.6) + canvas.width * 0.2;
      const targetY = Math.random() * (canvas.height * 0.4) + canvas.height * 0.1;
      fireworksRef.current.push({
        x,
        y: canvas.height,
        targetY,
        vy: -12,
        color: FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)],
        exploded: false,
        particles: [],
      });
    };

    // Draw confetti
    const drawConfetti = () => {
      confettiRef.current.forEach((particle) => {
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate((particle.rotation * Math.PI) / 180);
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size / 2);
        ctx.restore();

        // Update
        particle.y += particle.vy;
        particle.x += particle.vx;
        particle.rotation += particle.rotationSpeed;
        particle.vy += 0.1; // Gravity

        // Reset if off screen
        if (particle.y > canvas.height) {
          particle.y = -20;
          particle.x = Math.random() * canvas.width;
          particle.vy = Math.random() * 3 + 2;
        }
      });
    };

    // Draw balloons
    const drawBalloons = () => {
      balloonsRef.current.forEach((balloon) => {
        const swayX = Math.sin(Date.now() / 1000 + balloon.swayOffset) * 20;

        // Balloon body
        ctx.beginPath();
        ctx.ellipse(
          balloon.x + swayX,
          balloon.y,
          balloon.size * 0.7,
          balloon.size,
          0,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = balloon.color;
        ctx.fill();

        // Balloon highlight
        ctx.beginPath();
        ctx.ellipse(
          balloon.x + swayX - balloon.size * 0.2,
          balloon.y - balloon.size * 0.3,
          balloon.size * 0.2,
          balloon.size * 0.3,
          0,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.fill();

        // String
        ctx.beginPath();
        ctx.moveTo(balloon.x + swayX, balloon.y + balloon.size);
        ctx.quadraticCurveTo(
          balloon.x + swayX + 10,
          balloon.y + balloon.size + 30,
          balloon.x + swayX,
          balloon.y + balloon.size + 60
        );
        ctx.strokeStyle = "#666";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Update
        balloon.y -= balloon.speed;

        // Reset if off screen
        if (balloon.y < -balloon.size - 100) {
          balloon.y = canvas.height + 100;
          balloon.x = Math.random() * canvas.width;
        }
      });
    };

    // Draw fireworks
    const drawFireworks = (currentTime: number) => {
      // Launch new firework every 2-3 seconds
      if (currentTime - lastFireworkTimeRef.current > 2000 + Math.random() * 1000) {
        createFirework();
        lastFireworkTimeRef.current = currentTime;
      }

      fireworksRef.current.forEach((firework, index) => {
        if (!firework.exploded) {
          // Draw ascending firework
          ctx.beginPath();
          ctx.arc(firework.x, firework.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = firework.color;
          ctx.fill();

          // Draw trail
          ctx.beginPath();
          ctx.moveTo(firework.x, firework.y);
          ctx.lineTo(firework.x, firework.y + 20);
          ctx.strokeStyle = firework.color;
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.5;
          ctx.stroke();
          ctx.globalAlpha = 1;

          // Update
          firework.y += firework.vy;
          firework.vy += 0.15; // Gravity

          // Explode when reaching target or when velocity becomes positive (starts falling)
          if (firework.y <= firework.targetY || firework.vy >= 0) {
            firework.exploded = true;
            // Create explosion particles
            const particleCount = 50;
            for (let i = 0; i < particleCount; i++) {
              const angle = (Math.PI * 2 * i) / particleCount;
              const speed = Math.random() * 4 + 3;
              // Add some variation to create more natural burst
              const angleVariation = (Math.random() - 0.5) * 0.3;
              firework.particles.push({
                x: firework.x,
                y: firework.y,
                vx: Math.cos(angle + angleVariation) * speed,
                vy: Math.sin(angle + angleVariation) * speed,
                color: firework.color,
                size: Math.random() * 4 + 2,
                opacity: 1,
                rotation: 0,
                rotationSpeed: 0,
              });
            }
          }
        } else {
          // Draw explosion particles
          let allFaded = true;
          firework.particles.forEach((particle) => {
            if (particle.opacity > 0) {
              allFaded = false;
              ctx.beginPath();
              ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
              ctx.fillStyle = particle.color;
              ctx.globalAlpha = particle.opacity;
              ctx.fill();
              ctx.globalAlpha = 1;

              // Update
              particle.x += particle.vx;
              particle.y += particle.vy;
              particle.vy += 0.15; // Gravity
              particle.vx *= 0.98; // Air resistance
              particle.opacity -= 0.015;
            }
          });

          // Remove firework if all particles faded
          if (allFaded) {
            fireworksRef.current.splice(index, 1);
          }
        }
      });
    };

    // Animation loop
    const animate = (currentTime: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawConfetti();
      drawBalloons();
      drawFireworks(currentTime);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
    />
  );
}