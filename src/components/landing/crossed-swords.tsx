"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useTheme } from "@/components/providers/theme-provider";

/* Reusable SVG sword with a long, sharp pointed blade tip */
function SwordSVG({ glow, isNoir }: { glow: boolean; isNoir?: boolean }) {
  let filterStr = glow
    ? "drop-shadow(0 0 30px rgba(233,171,43,0.5))"
    : "drop-shadow(0 0 20px rgba(233,171,43,0.3))";
    
  if (isNoir) {
    filterStr = glow 
      ? "grayscale(100%) brightness(150%) drop-shadow(0 0 30px rgba(255,255,255,0.5))" 
      : "grayscale(100%) brightness(150%) drop-shadow(0 0 20px rgba(255,255,255,0.3))";
  }

  return (
    <svg
      viewBox="0 -50 64 280"
      className="h-[280px] sm:h-[350px]"
      style={{ filter: filterStr }}
    >
      {/* ── Blade tip (sharp but not pencil-thin) ── */}
      <polygon points="32,-20 24,10 40,10" fill="#e9ab2b" />
      <polygon points="32,-20 24,10 28,10" fill="#c4901f" />
      <polygon points="32,-20 36,10 40,10" fill="#f5c34a" />
      <rect x="30" y="-14" width="4" height="4" fill="#ffe080" opacity="0.3" />

      {/* ── Blade body ── */}
      <rect x="28" y="10" width="8" height="150" fill="#e9ab2b" />
      <rect x="24" y="10" width="4" height="150" fill="#c4901f" />
      <rect x="36" y="10" width="4" height="150" fill="#f5c34a" />

      {/* Edge details (pixel notches along blade) */}
      <rect x="20" y="30" width="4" height="4" fill="#c4901f" opacity="0.5" />
      <rect x="40" y="50" width="4" height="4" fill="#f5c34a" opacity="0.5" />
      <rect x="20" y="70" width="4" height="4" fill="#c4901f" opacity="0.5" />
      <rect x="40" y="90" width="4" height="4" fill="#f5c34a" opacity="0.5" />
      <rect x="20" y="110" width="4" height="4" fill="#c4901f" opacity="0.5" />
      <rect x="40" y="130" width="4" height="4" fill="#f5c34a" opacity="0.5" />

      {/* ── Guard / Crossguard ── */}
      <rect x="8" y="160" width="48" height="8" fill="#8b6914" rx="1" />
      <rect x="8" y="160" width="48" height="3" fill="#a07818" />
      <rect x="4" y="162" width="4" height="4" fill="#6b5010" />
      <rect x="56" y="162" width="4" height="4" fill="#6b5010" />

      {/* ── Grip ── */}
      <rect x="26" y="168" width="12" height="40" fill="#4a3510" />
      <rect x="26" y="168" width="12" height="4" fill="#5c4418" />
      <rect x="26" y="180" width="12" height="4" fill="#5c4418" />
      <rect x="26" y="192" width="12" height="4" fill="#5c4418" />

      {/* ── Pommel ── */}
      <rect x="22" y="208" width="20" height="10" fill="#e9ab2b" rx="2" />
      <rect x="22" y="208" width="20" height="4" fill="#f5c34a" />
      {/* Gem */}
      <rect x="29" y="210" width="6" height="6" fill="#ff6b6b" />
      <rect x="29" y="210" width="6" height="2" fill="#ff8787" />
    </svg>
  );
}

export function CrossedSwords() {
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();
  const isNoir = theme === "spider-noir";

  return (
    <motion.div
      className="relative cursor-pointer select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={isHovered ? { scale: 1.08 } : { scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      <div className="relative w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] -translate-y-6">
        {/* Left sword */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={isHovered ? { rotate: -15 } : { rotate: -35 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
        >
          <SwordSVG glow={isHovered} isNoir={isNoir} />
        </motion.div>

        {/* Right sword (mirrored) */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={isHovered ? { rotate: 15 } : { rotate: 35 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          style={{ transform: "scaleX(-1)" }}
        >
          <SwordSVG glow={isHovered} isNoir={isNoir} />
        </motion.div>
      </div>
    </motion.div>
  );
}
