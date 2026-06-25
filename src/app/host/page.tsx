"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Server,
  Zap,
  Timer,
  Clock,
  Settings2,
  Users,
  Hash,
  ChevronRight,
  ChevronLeft,
  Rocket,
  Search,
  Filter,
  PackageOpen,
  Lock,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { fetchWithAuth } from "@/lib/api/fetchWithAuth";
import { toast } from "sonner";

/* ──────────────────────── constants ──────────────────────── */

const MODES = [
  {
    value: "blitz",
    label: "Blitz",
    time: "10 min",
    secs: 600,
    icon: Zap,
  },
  {
    value: "rapid",
    label: "Rapid",
    time: "30 min",
    secs: 1800,
    icon: Timer,
  },
  {
    value: "classic",
    label: "Classic",
    time: "90 min",
    secs: 5400,
    icon: Clock,
  },
  {
    value: "custom",
    label: "Custom",
    time: "You decide",
    secs: 0,
    icon: Settings2,
  },
];

const STEPS = [
  { label: "Configuration", icon: Settings2 },
  { label: "Questions", icon: Hash },
];

// Dummy question buckets for the placeholder UI
const QUESTION_BUCKETS = [
  { id: "dp-google", name: "DP for Google", tag: "Dynamic Programming", company: "Google", difficulty: "Hard", count: 12 },
  { id: "graphs-uber", name: "Graphs for Uber", tag: "Graphs", company: "Uber", difficulty: "Medium", count: 8 },
  { id: "bs-easy", name: "Binary Search (Easy)", tag: "Binary Search", company: "General", difficulty: "Easy", count: 15 },
  { id: "arrays-meta", name: "Arrays for Meta", tag: "Arrays", company: "Meta", difficulty: "Medium", count: 10 },
  { id: "trees-amazon", name: "Trees for Amazon", tag: "Trees", company: "Amazon", difficulty: "Medium", count: 9 },
  { id: "strings-ms", name: "Strings for Microsoft", tag: "Strings", company: "Microsoft", difficulty: "Easy", count: 11 },
];

// Default question for now (backend not ready)
const DEFAULT_QUESTION = {
  id: "add-two-numbers",
  title: "Add Two Numbers",
  difficulty: "Easy",
  tags: ["Math", "Basics"],
};

/* ──────────────────────── component ──────────────────────── */

export default function HostPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [isCheckingActive, setIsCheckingActive] = useState(true);

  // Check for active room on mount
  useEffect(() => {
    async function check() {
      try {
        const res = await fetchWithAuth("/api/backend/rooms/active", {});
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const activeRoom = data[0];
            router.replace(activeRoom.status === "waiting" ? `/lobby/${activeRoom.room_id}?fromActive=true` : `/play/${activeRoom.room_id}?fromActive=true`);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to check active rooms", err);
      }
      setIsCheckingActive(false);
    }
    check();
  }, [router]);

  // Step 1 state
  const [roomName, setRoomName] = useState("");
  const [selectedMode, setSelectedMode] = useState("blitz");
  const [customMinutes, setCustomMinutes] = useState(15);
  const [maxPlayers, setMaxPlayers] = useState(4);

  // Step 2 state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState(DEFAULT_QUESTION);

  const currentMode = MODES.find((m) => m.value === selectedMode)!;
  const durationSecs =
    selectedMode === "custom" ? customMinutes * 60 : currentMode.secs;

  const canProceedStep1 = roomName.trim().length > 0;

  async function handleCreateRoom() {
    setIsCreating(true);
    try {
      const res = await fetchWithAuth("/api/backend/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_name: roomName.trim(),
          mode: selectedMode,
          duration_secs: durationSecs,
          max_players: maxPlayers,
          question_count: 1,
          difficulty_filter: "mixed",
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || "Failed to create room");
      }

      const data = await res.json();
      
      // Save to Zustand store
      import("@/store/useRoomStore").then((mod) => {
        mod.useRoomStore.getState().setRoom({
          ...data,
          room_name: roomName.trim(), // Keep the name from frontend since schema might lack it
        });
      });

      toast.success("Room created!", {
        description: `"${roomName}" is ready. Redirecting to lobby...`,
      });

      // Redirect to lobby with room_id
      router.push(`/lobby/${data.room_id}`);
    } catch (err: any) {
      toast.error("Failed to create room", {
        description: err.message || "An unexpected error occurred",
      });
    } finally {
      setIsCreating(false);
    }
  }

  if (isCheckingActive) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#e9ab2b]" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Server className="h-8 w-8 text-primary" />
          Create Room
        </h1>
        <p className="text-muted-foreground">
          Configure your arena and invite players to battle.
        </p>
      </motion.div>

      {/* ── Progress Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex items-center flex-1 last:flex-none">
              {/* Step circle */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    i < step
                      ? "bg-primary border-primary text-primary-foreground"
                      : i === step
                        ? "border-primary text-primary bg-primary/10"
                        : "border-white/10 text-muted-foreground bg-transparent"
                  }`}
                >
                  {i < step ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <s.icon className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={`text-sm font-medium hidden sm:block ${
                    i <= step ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
              </div>

              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="flex-1 mx-4">
                  <div className="h-[2px] w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: i < step ? "100%" : "0%" }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Step Content ── */}
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step-config"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-border/50 bg-black/20 backdrop-blur-sm">
              <CardContent className="p-6 space-y-6">
                {/* Room Name */}
                <div className="space-y-2">
                  <Label htmlFor="room-name" className="text-sm font-medium">
                    Room Name
                  </Label>
                  <Input
                    id="room-name"
                    placeholder="e.g. Leetcode Grind Session"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="h-10"
                  />
                </div>

                {/* Mode Selector */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Game Mode</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {MODES.map((mode) => {
                      const isActive = selectedMode === mode.value;
                      return (
                        <button
                          key={mode.value}
                          onClick={() => setSelectedMode(mode.value)}
                          className={`relative p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                            isActive
                              ? "bg-[#e9ab2b]/10 border-[#e9ab2b]/50 ring-1 ring-[#e9ab2b]/30"
                              : "bg-black/40 border-white/[0.06] hover:border-[#e9ab2b]/20 hover:bg-black/60"
                          }`}
                        >
                          <mode.icon
                            className={`h-5 w-5 mb-2 transition-colors ${
                              isActive ? "text-[#e9ab2b]" : "text-white/40"
                            }`}
                            strokeWidth={1.5}
                          />
                          <p
                            className={`text-[11px] font-bold tracking-wider uppercase transition-colors ${
                              isActive ? "text-[#e9ab2b]" : "text-foreground"
                            }`}
                            style={{ fontFamily: "var(--font-retro), monospace" }}
                          >
                            {mode.label}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{mode.time}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom time picker */}
                <AnimatePresence>
                  {selectedMode === "custom" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2 pt-1">
                        <Label
                          htmlFor="custom-time"
                          className="text-sm font-medium"
                        >
                          Duration (minutes)
                        </Label>
                        <div className="flex items-center gap-3">
                          <Input
                            id="custom-time"
                            type="number"
                            min={1}
                            max={180}
                            value={customMinutes}
                            onChange={(e) =>
                              setCustomMinutes(
                                Math.max(1, Math.min(180, Number(e.target.value)))
                              )
                            }
                            className="h-10 w-28"
                          />
                          <span className="text-sm text-muted-foreground">
                            = {Math.floor(customMinutes / 60)}h {customMinutes % 60}m
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Max Players */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Max Players</Label>
                  <div className="flex gap-2">
                    {[2, 3, 4].map((n) => (
                      <button
                        key={n}
                        onClick={() => setMaxPlayers(n)}
                        className={`px-5 py-2 rounded-lg border text-sm font-mono font-semibold transition-all cursor-pointer ${
                          maxPlayers === n
                            ? "bg-primary/20 border-primary/50 text-primary ring-1 ring-primary/30"
                            : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                        }`}
                      >
                        <Users className="h-3.5 w-3.5 inline mr-1.5" />
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Count (disabled) */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    Question Count
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  </Label>
                  <div className="flex items-center gap-3">
                    <div className="px-5 py-2 rounded-lg border bg-white/5 border-white/10 text-muted-foreground text-sm font-mono font-semibold opacity-50 cursor-not-allowed">
                      1
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Locked to 1 for now (more coming soon)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next button */}
            <div className="flex justify-end mt-6">
              <Button
                size="lg"
                onClick={() => setStep(1)}
                disabled={!canProceedStep1}
                className="gap-2 px-6"
              >
                Next: Choose Question
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step-questions"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-border/50 bg-black/20 backdrop-blur-sm">
              <CardContent className="p-6 space-y-6">
                {/* Search and Filters */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Find a Question
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by question name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-10 pl-9"
                      disabled
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" disabled className="gap-1.5 text-xs opacity-50">
                      <Filter className="h-3 w-3" /> Difficulty
                    </Button>
                    <Button variant="outline" size="sm" disabled className="gap-1.5 text-xs opacity-50">
                      <Filter className="h-3 w-3" /> Tags
                    </Button>
                    <Button variant="outline" size="sm" disabled className="gap-1.5 text-xs opacity-50">
                      <Filter className="h-3 w-3" /> Company
                    </Button>
                  </div>
                </div>

                {/* Question Buckets */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <PackageOpen className="h-4 w-4 text-muted-foreground" />
                    Pre-built Buckets
                    <span className="text-xs text-muted-foreground font-normal">(coming soon)</span>
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {QUESTION_BUCKETS.map((bucket) => (
                      <div
                        key={bucket.id}
                        className="p-3 rounded-lg border border-white/5 bg-black/30 opacity-50 cursor-not-allowed"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium">{bucket.name}</p>
                          <Badge variant="outline" className="text-[10px]">
                            {bucket.count} Qs
                          </Badge>
                        </div>
                        <div className="flex gap-1.5">
                          <Badge variant="secondary" className="text-[10px]">
                            {bucket.tag}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            {bucket.company}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className={`text-[10px] ${
                              bucket.difficulty === "Easy"
                                ? "text-emerald-400"
                                : bucket.difficulty === "Medium"
                                  ? "text-amber-400"
                                  : "text-red-400"
                            }`}
                          >
                            {bucket.difficulty}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Question (default) */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Selected Question
                  </Label>
                  <div className="p-4 rounded-xl border border-primary/30 bg-primary/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">
                          {selectedQuestion.title}
                        </p>
                        <div className="flex gap-1.5 mt-1.5">
                          <Badge
                            variant="secondary"
                            className="text-[10px] text-emerald-400"
                          >
                            {selectedQuestion.difficulty}
                          </Badge>
                          {selectedQuestion.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-[10px]"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Back + Create */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setStep(0)}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                size="lg"
                onClick={handleCreateRoom}
                disabled={isCreating}
                className="gap-2 px-6"
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Rocket className="h-4 w-4" />
                )}
                {isCreating ? "Creating..." : "Launch Room"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Config summary pill (visible on step 2) */}
      <AnimatePresence>
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
          >
            <span className="font-medium text-foreground">{roomName}</span>
            <span>·</span>
            <span className="text-[#e9ab2b]">{currentMode.label}</span>
            <span>·</span>
            <span>
              {selectedMode === "custom"
                ? `${customMinutes}m`
                : currentMode.time}
            </span>
            <span>·</span>
            <span>{maxPlayers} players</span>
            <span>·</span>
            <span>1 question</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
