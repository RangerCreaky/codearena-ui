"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Swords, TimerReset, Code, User, Users, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const gameModes = [
  {
    title: "Codewarz",
    description: "Multiplayer free-for-all coding battle. Create or join a room.",
    detailedDescription:
      "Welcome to the ultimate arena. In Codewarz, you can create a public or private room and invite multiple players to compete simultaneously on the same algorithmic challenge. The first player to successfully pass all test cases gets the highest rating boost. Are you fast enough to beat the crowd?",
    icon: Users,
    soon: false,
  },
  {
    title: "1v1 Duel",
    description: "Head-to-head competitive coding match.",
    detailedDescription:
      "A pure test of skill. Face off against a randomly matched opponent of a similar rank. Both of you will receive the exact same problem at the exact same time. The fastest correct submission claims the victory and the rating points. Lose, and your rating drops.",
    icon: Swords,
    soon: false,
  },
  {
    title: "Survival",
    description: "Solve to survive before the timer runs out.",
    detailedDescription:
      "Race against the clock. You are given a question and a strict countdown timer. If you successfully submit a passing solution before the time runs out, the timer resets and you face a harder question. If you fail, you are eliminated. How many rounds can you survive?",
    icon: TimerReset,
    soon: true,
  },
  {
    title: "The Dojo (Practice)",
    description: "Hone your skills at your own pace without pressure.",
    detailedDescription:
      "A stress-free solo environment to practice coding. Choose your difficulty, browse the problem set, and focus on mastering algorithms without timers, opponents, or rating changes. Perfect for warming up before a ranked duel.",
    icon: User,
    soon: true,
  },
  {
    title: "Co-op Lounge",
    description: "Unrated private rooms for friends to practice and discuss.",
    detailedDescription:
      "Create a private room to invite your friends. There are no ratings, no leaderboards, and no stress. Jump into a voice call via Discord and collaborate, discuss logic, or just practice together casually without worrying about your rank.",
    icon: Code,
    soon: true,
  },
];

export default function PlayPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center"
      >
        <h1 className="text-4xl font-bold mb-3 tracking-tight">Choose Your Mode</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Select a game mode to enter the arena. Will you climb the ranks in a duel, or survive against the clock?
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {gameModes.map((mode, index) => (
          <motion.div
            key={mode.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
            className="h-full"
          >
            <Card className={`h-full group relative overflow-hidden transition-all duration-300 hover:shadow-lg ${mode.soon ? 'opacity-70 cursor-not-allowed border-white/5' : 'cursor-pointer border-border/50 hover:border-primary/50 hover:shadow-primary/10'}`}>
              <CardContent className="p-6 h-full flex flex-col">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${mode.soon ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors'}`}>
                    <mode.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-base">{mode.title}</h3>
                      <div className="flex items-center gap-2">
                        {mode.soon && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            Coming Soon
                          </span>
                        )}
                        <Dialog>
                          <DialogTrigger
                            className="p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                            aria-label={`How to play ${mode.title}`}
                          >
                            <Info className="h-4 w-4" />
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                  <mode.icon className="h-5 w-5" />
                                </div>
                                <DialogTitle className="text-xl">{mode.title}</DialogTitle>
                              </div>
                              <DialogDescription className="text-base leading-relaxed pt-2">
                                {mode.detailedDescription}
                              </DialogDescription>
                            </DialogHeader>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed pr-8">
                      {mode.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
