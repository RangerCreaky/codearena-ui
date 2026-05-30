"use client";

import { motion } from "motion/react";
import { Navbar } from "@/components/layout/navbar";
import { MatrixRain } from "@/components/landing/matrix-rain";
import { CrossedSwords } from "@/components/landing/crossed-swords";
import { CodeBattle } from "@/components/landing/code-battle";
import { useTheme } from "@/components/providers/theme-provider";

export default function LandingPage() {
  const { theme } = useTheme();
  const isNoir = theme === "spider-noir";
  
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Matrix rain background */}
      <MatrixRain />

      {/* Navbar */}
      <Navbar />

      {/* Main content — single centered composition */}
      <main className="relative z-10 flex items-center justify-center min-h-screen px-4">
        {/* The unified battle scene: editors + branding layered */}
        <div className="relative flex items-center justify-center w-full max-w-[1200px]">

          {/* Layer 1: The two code editors side by side */}
          <CodeBattle />

          {/* Layer 2: CodeWarz branding overlaid in the center */}
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
            >
              {/* Swords behind text */}
              <div className="relative flex items-center justify-center pointer-events-auto">
                <div className="absolute">
                  <CrossedSwords />
                </div>

                {/* CodeWarz title */}
                <div className="relative z-10 flex flex-col items-center">
                  <h1
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-wider flex items-center justify-center"
                    style={{ fontFamily: "var(--font-retro)" }}
                  >
                    <span className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] [text-shadow:_0_0_40px_rgba(0,0,0,1),_0_0_80px_rgba(0,0,0,1)] relative">
                      {isNoir && (
                        <span className="absolute -top-6 -left-2 sm:-top-8 sm:-left-3 text-2xl sm:text-4xl transform -rotate-12" title="Noir Mode">
                          🎩
                        </span>
                      )}
                      Code
                    </span>
                    <span 
                      className={`drop-shadow-[0_0_30px_rgba(233,171,43,0.6)] [text-shadow:_0_0_40px_rgba(0,0,0,1),_0_0_80px_rgba(0,0,0,1)] ${isNoir ? "text-white" : "text-[#e9ab2b]"}`}
                      style={isNoir ? { filter: "drop-shadow(0 0 20px rgba(255,255,255,0.5))" } : {}}
                    >
                      Warz
                    </span>
                  </h1>

                  {/* Subtitle */}
                  <motion.p
                    className="text-center text-[9px] sm:text-[11px] md:text-sm font-bold text-white/60 max-w-md mt-3 sm:mt-4 tracking-wide leading-relaxed [text-shadow:_0_0_20px_rgba(0,0,0,1),_0_0_40px_rgba(0,0,0,1)]"
                    style={{ fontFamily: "var(--font-retro)" }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
                    <span className={isNoir ? "text-white/80" : "text-[#e9ab2b]/80"}>Sharpen your syntax</span>
                    <span className="mx-1 sm:mx-2">—</span>
                    <span>The battle of codes is about to begin</span>
                  </motion.p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Subtle bottom glow */}
        <div
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full pointer-events-none z-0"
          style={{
            background: "radial-gradient(ellipse, rgba(233,171,43,0.06) 0%, transparent 70%)",
          }}
        />
      </main>
    </div>
  );
}
