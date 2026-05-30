"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogOut, User, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "@/components/providers/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

/* Mini pixel sword icon matching the landing page swords */
function MiniSword({ className, isNoir }: { className?: string; isNoir?: boolean }) {
  return (
    <svg 
      viewBox="0 -20 64 230" 
      className={className} 
      aria-hidden="true"
      style={isNoir ? { filter: "grayscale(100%) brightness(150%)" } : {}}
    >
      {/* Blade tip */}
      <polygon points="32,-18 24,8 40,8" fill="#e9ab2b" />
      <polygon points="32,-18 24,8 28,8" fill="#c4901f" />
      <polygon points="32,-18 36,8 40,8" fill="#f5c34a" />
      {/* Blade body */}
      <rect x="28" y="8" width="8" height="120" fill="#e9ab2b" />
      <rect x="24" y="8" width="4" height="120" fill="#c4901f" />
      <rect x="36" y="8" width="4" height="120" fill="#f5c34a" />
      {/* Guard */}
      <rect x="10" y="128" width="44" height="7" fill="#8b6914" rx="1" />
      <rect x="10" y="128" width="44" height="3" fill="#a07818" />
      {/* Grip */}
      <rect x="27" y="135" width="10" height="30" fill="#4a3510" />
      <rect x="27" y="135" width="10" height="3" fill="#5c4418" />
      <rect x="27" y="145" width="10" height="3" fill="#5c4418" />
      {/* Pommel */}
      <rect x="24" y="165" width="16" height="8" fill="#e9ab2b" rx="1" />
      <rect x="30" y="167" width="4" height="4" fill="#ff6b6b" />
    </svg>
  );
}

/* Two mini swords crossed for the navbar brand */
function MiniCrossedSwords({ className, isNoir }: { className?: string; isNoir?: boolean }) {
  return (
    <div className={`relative ${className}`}>
      <div className="rotate-[-45deg] absolute inset-0 flex items-center justify-center">
        <MiniSword className="h-full" isNoir={isNoir} />
      </div>
      <div className="rotate-[45deg] scale-x-[-1] absolute inset-0 flex items-center justify-center">
        <MiniSword className="h-full" isNoir={isNoir} />
      </div>
    </div>
  );
}

export function Navbar() {
  const { data: session } = useSession();
  const { theme } = useTheme();
  const isNoir = theme === "spider-noir";
  const router = useRouter();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-20 border-b border-border/50 bg-background/60 backdrop-blur-2xl">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-5 sm:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-0 group">
          <MiniCrossedSwords className="w-9 h-9 transition-transform duration-300 group-hover:scale-110" isNoir={isNoir} />
          <span className="text-lg tracking-wide flex items-center">
            <span className="text-foreground relative inline-block">
              {/* Spider-Noir fedora hat */}
              {theme === "spider-noir" && (
                <span className="absolute -top-3.5 -left-1 text-[14px] transform -rotate-12" title="Noir Mode">
                  🎩
                </span>
              )}
              Code
            </span>
            <span className="text-primary">Arena</span>
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {session?.user ? (
            /* Authenticated state */
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex items-center gap-2 rounded-full p-0.5 transition-all hover:ring-2 hover:ring-primary/50 cursor-pointer"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={session.user.image || ""}
                    alt={session.user.name || "User"}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2">
                <div className="px-2 py-2">
                  <p className="text-sm font-medium">
                    {session.displayName || session.user.name || "Warrior"}
                  </p>
                  <p className="text-xs text-muted-foreground font-sans">
                    {session.username ? `@${session.username}` : session.user.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/profile")}
                  className="flex items-center gap-3 cursor-pointer text-sm py-2"
                >
                  <User className="h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/profile/edit")}
                  className="flex items-center gap-3 cursor-pointer text-sm py-2"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-3 cursor-pointer text-destructive focus:text-destructive text-sm py-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* Unauthenticated state — Login / Sign Up */
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="text-[10px] h-9 px-4 cursor-pointer"
                onClick={() => router.push("/login")}
              >
                Log In
              </Button>
              <Button
                className="text-[10px] h-9 px-5 cursor-pointer"
                onClick={() => router.push("/signup")}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
