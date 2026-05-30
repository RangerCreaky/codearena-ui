"use client";

import { Moon, Sun, Bug, Check } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const iconMap = {
  Sun,
  Moon,
  Bug,
} as const;

export function ThemeToggle() {
  const { theme, setTheme, availableThemes } = useTheme();

  const currentTheme = availableThemes.find((t) => t.id === theme);
  const CurrentIcon = currentTheme ? iconMap[currentTheme.icon] : Moon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="relative inline-flex items-center justify-center h-9 w-9 rounded-full hover:bg-accent hover:text-accent-foreground cursor-pointer"
      >
        <CurrentIcon className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {availableThemes.map((t) => {
          const Icon = iconMap[t.icon];
          return (
            <DropdownMenuItem
              key={t.id}
              onClick={() => setTheme(t.id)}
              className="flex items-center justify-between gap-2 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{t.label}</span>
              </div>
              {theme === t.id && <Check className="h-3.5 w-3.5 opacity-70" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
