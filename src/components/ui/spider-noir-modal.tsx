"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/providers/theme-provider";

const STORAGE_KEY = "spider-noir-intro-seen";

export function SpiderNoirModal() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (theme === "spider-noir") {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) {
        setOpen(true);
      }
    }
  }, [theme]);

  function handleConfirm() {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  }

  function handleRevert() {
    setTheme("dark");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md border-2 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <span className="text-3xl">🕷️</span>
            Spider-Noir Mode
          </DialogTitle>
          <DialogDescription className="text-base leading-relaxed pt-2">
            Welcome to the shadows. This limited-time theme pays tribute to{" "}
            <span className="font-semibold text-foreground">
              Spider-Man Noir
            </span>
            . The city is dark, the code is sharp. Every battle is a black and
            white affair — except for the blood red of victory.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center py-4 text-6xl opacity-80">
          🎩🕸️
        </div>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleRevert}
            className="flex-1"
          >
            Back to default
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-[oklch(0.55_0.25_25)] hover:bg-[oklch(0.48_0.25_25)] text-white"
          >
            Enter the Shadows
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
