"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { AnimatedTerminal } from "./animated-terminal";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const floatingBadges = [
  { label: "Python", x: "5%", y: "15%", delay: 0 },
  { label: "Rust", x: "75%", y: "8%", delay: 0.5 },
  { label: "TypeScript", x: "85%", y: "65%", delay: 1.0 },
  { label: "Go", x: "10%", y: "72%", delay: 1.5 },
];

const stats = [
  { value: 1200, suffix: "+", label: "Challenges" },
  { value: 50, suffix: "K+", label: "Lines Battled" },
  { value: 300, suffix: "+", label: "Active Arenas" },
];

export function HeroSection() {
  return (
    <div className="relative flex flex-col justify-center px-6 sm:px-10 lg:px-14 py-12 overflow-hidden">
      {/* Floating language badges */}
      {floatingBadges.map((badge) => (
        <motion.div
          key={badge.label}
          className="absolute hidden lg:block"
          style={{ left: badge.x, top: badge.y }}
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: badge.delay,
            ease: "easeInOut",
          }}
        >
          <span className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-medium">
            {badge.label}
          </span>
        </motion.div>
      ))}

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
          Where Code
          <br />
          Becomes{" "}
          <span className="text-primary">Competition</span>
        </h1>
      </motion.div>

      <motion.p
        className="mt-5 text-lg text-muted-foreground max-w-md leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
      >
        Join the arena. Solve challenges. Battle other coders in real-time
        multiplayer coding duels.
      </motion.p>

      {/* Terminal */}
      <motion.div
        className="mt-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
      >
        <AnimatedTerminal />
      </motion.div>

      {/* Stats */}
      <motion.div
        className="mt-10 grid grid-cols-3 gap-4 max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="text-center p-3 rounded-xl bg-card/50 border border-border"
          >
            <div className="text-2xl font-bold text-primary font-mono">
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
