"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/components/providers/theme-provider";

const CHARS = "01{}[]()<>;:=+-*/&|!?@#$%^~ABCDEFabcdef";

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const isNoir = theme === "spider-noir";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const fontSize = 16;
    let columns: number;
    let drops: number[];

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      columns = Math.floor(canvas!.width / fontSize);
      drops = Array.from({ length: columns }, () =>
        Math.random() * -50
      );
    }

    resize();
    window.addEventListener("resize", resize);

    function draw() {
      // Trail effect — slightly more transparent for longer trails
      ctx!.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height);

      ctx!.font = `bold ${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Render ~8% of columns each frame (more visible)
        if (Math.random() > 0.08) {
          drops[i] += 0.4;
          if (drops[i] * fontSize > canvas!.height && Math.random() > 0.985) {
            drops[i] = Math.random() * -20;
          }
          continue;
        }

        const char = CHARS[Math.floor(Math.random() * CHARS.length)];

        // Brighter colors for more visibility
        const rand = Math.random();
        if (rand < 0.25) {
          // Bright golden — the "head" of a stream
          ctx!.fillStyle = "rgba(233, 171, 43, 0.8)";
        } else if (rand < 0.5) {
          // Medium golden
          ctx!.fillStyle = "rgba(233, 171, 43, 0.45)";
        } else if (rand < 0.75) {
          // Dim white
          ctx!.fillStyle = "rgba(255, 255, 255, 0.25)";
        } else {
          // Soft golden
          ctx!.fillStyle = "rgba(200, 160, 40, 0.3)";
        }

        ctx!.fillText(char, x, y);

        drops[i] += 0.5;

        if (drops[i] * fontSize > canvas!.height && Math.random() > 0.975) {
          drops[i] = Math.random() * -10;
        }
      }

      animationId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ 
        opacity: 0.85,
        filter: isNoir ? "grayscale(100%) brightness(130%)" : "none" 
      }}
    />
  );
}
