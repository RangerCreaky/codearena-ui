"use client";

import { motion } from "motion/react";
import { Server, Users, Settings2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HostPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Server className="h-8 w-8 text-primary" />
          Host Custom Arena
        </h1>
        <p className="text-muted-foreground">
          Create a private room to battle with your friends or host a local tournament.
        </p>
      </motion.div>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-border/50 bg-black/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6 text-muted-foreground border-b border-border/50 pb-4">
                <Settings2 className="h-5 w-5" />
                <h3 className="font-semibold text-foreground">Room Configuration</h3>
                <span className="ml-auto text-xs uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-full">Coming Soon</span>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-black/40 border border-white/5">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Game Mode</p>
                    <p className="font-mono text-sm">1v1 Duel</p>
                  </div>
                  <div className="p-4 rounded-lg bg-black/40 border border-white/5">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Visibility</p>
                    <p className="font-mono text-sm flex items-center gap-2">
                      <Users className="h-3.5 w-3.5" /> Invite Only
                    </p>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-black/40 border border-white/5 opacity-50 cursor-not-allowed">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Language Restrictions</p>
                  <p className="font-mono text-sm">Python, JavaScript</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-end"
        >
          <Button size="lg" disabled className="gap-2 px-8">
            <Play className="h-4 w-4" />
            Launch Room
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
