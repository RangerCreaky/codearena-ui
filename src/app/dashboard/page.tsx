"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "motion/react";
import Link from "next/link";
import { User, Settings, Terminal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const TERMINAL_LINES = [
  "$ codearena status",
  "> Connecting to arena servers...",
  "> Dashboard loading...",
  "> Arena features coming soon.",
  "> Stay sharp, warrior. 🗡️",
];

function DashboardTerminal() {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < TERMINAL_LINES.length) {
        const nextLine = TERMINAL_LINES[i];
        setLines((prev) => [...prev, nextLine]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[oklch(0.12_0.01_260)] rounded-xl border border-white/[0.06] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06]">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[oklch(0.65_0.2_25)]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[oklch(0.8_0.15_85)]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[oklch(0.72_0.19_145)]" />
        </div>
        <span className="text-xs text-muted-foreground font-mono ml-1">
          terminal
        </span>
      </div>
      <div className="p-4 font-mono text-sm space-y-1 min-h-[160px]">
        {lines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className={
              line?.startsWith("$")
                ? "text-primary font-semibold"
                : line?.startsWith(">")
                  ? "text-muted-foreground"
                  : "text-foreground"
            }
          >
            {line}
          </motion.div>
        ))}
        <span className="inline-block w-2 h-4 bg-primary animate-pulse" />
      </div>
    </div>
  );
}

const quickActions = [
  {
    title: "View Profile",
    description: "See your arena identity",
    href: "/profile",
    icon: User,
  },
  {
    title: "Edit Profile",
    description: "Update your details",
    href: "/profile/edit",
    icon: Settings,
  },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Warrior";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-1">
          Welcome back,{" "}
          <span className="text-primary">{userName}</span>!
        </h1>
        <p className="text-muted-foreground mb-8">
          Your arena awaits.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mb-8"
      >
        <DashboardTerminal />
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="group cursor-pointer border-border/50 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <action.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{action.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </motion.div>

      <motion.div
        className="mt-8 flex items-center gap-2 text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Terminal className="h-3.5 w-3.5" />
        <span>More features dropping soon. Arena rooms, leaderboards, and live battles.</span>
      </motion.div>
    </div>
  );
}
