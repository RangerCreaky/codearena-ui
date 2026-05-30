"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { MatrixRain } from "@/components/landing/matrix-rain";
import { useTheme } from "@/components/providers/theme-provider";
import { MoreHorizontal } from "lucide-react";

function MiniSword({ className, isNoir }: { className?: string; isNoir?: boolean }) {
  return (
    <svg 
      viewBox="0 -20 64 230" 
      className={className} 
      aria-hidden="true"
      style={isNoir ? { filter: "grayscale(100%) brightness(150%)" } : {}}
    >
      <polygon points="32,-18 24,8 40,8" fill="#e9ab2b" />
      <polygon points="32,-18 24,8 28,8" fill="#c4901f" />
      <polygon points="32,-18 36,8 40,8" fill="#f5c34a" />
      <rect x="28" y="8" width="8" height="120" fill="#e9ab2b" />
      <rect x="24" y="8" width="4" height="120" fill="#c4901f" />
      <rect x="36" y="8" width="4" height="120" fill="#f5c34a" />
      <rect x="10" y="128" width="44" height="7" fill="#8b6914" rx="1" />
      <rect x="10" y="128" width="44" height="3" fill="#a07818" />
      <rect x="27" y="135" width="10" height="30" fill="#4a3510" />
      <rect x="27" y="135" width="10" height="3" fill="#5c4418" />
      <rect x="27" y="145" width="10" height="3" fill="#5c4418" />
      <rect x="24" y="165" width="16" height="8" fill="#e9ab2b" rx="1" />
      <rect x="30" y="167" width="4" height="4" fill="#ff6b6b" />
    </svg>
  );
}

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

export default function LoginPage() {
  const { theme } = useTheme();
  const isNoir = theme === "spider-noir";
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center overflow-hidden">
      {/* Matrix rain background */}
      <MatrixRain />
      
      {/* Spider-Noir Film Grain Overlay */}
      {isNoir && (
        <div 
          className="fixed inset-0 z-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "256px 256px",
          }}
        />
      )}

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[420px] mx-4 p-8 bg-card/95 border border-primary/20 rounded-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,1)] backdrop-blur-md flex flex-col items-center">
        
        {/* Brand Logo & Name */}
        <div className="flex flex-col items-center mb-8 gap-0">
          <MiniCrossedSwords className="w-16 h-16" isNoir={isNoir} />
          <h1 className="text-xl tracking-wide flex items-center">
            <span className="text-foreground relative inline-block">
              {isNoir && (
                <span className="absolute -top-4 -left-1.5 text-[16px] transform -rotate-12" title="Noir Mode">
                  🎩
                </span>
              )}
              Code
            </span>
            <span className="text-primary">Arena</span>
          </h1>
        </div>

        <div className="w-full space-y-4">
          {/* Email / Password Fields (Visual Only) */}
          <div className="space-y-3">
            <div className="relative">
              <input 
                type="text" 
                disabled
                placeholder="Username or E-mail"
                className="w-full h-12 px-4 rounded-lg bg-background border border-input text-foreground placeholder:text-muted-foreground/60 opacity-60 cursor-not-allowed font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="relative">
              <input 
                type="password" 
                disabled
                placeholder="Password"
                className="w-full h-12 px-4 rounded-lg bg-background border border-input text-foreground placeholder:text-muted-foreground/60 opacity-60 cursor-not-allowed font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="text-center my-4">
            <p className="text-xs font-bold text-destructive animate-pulse">
              Only Login with Google is currently supported
            </p>
          </div>

          {/* Sign In Button */}
          <button 
            disabled
            className="w-full h-12 rounded-lg bg-primary/50 text-primary-foreground font-bold tracking-wide opacity-50 cursor-not-allowed transition-all"
          >
            Sign In
          </button>

          {/* Terms text */}
          <p className="text-xs text-center text-muted-foreground font-sans mt-6">
            By continuing, you agree to{" "}
            <Link href="#" className="text-primary hover:underline">Terms</Link> &{" "}
            <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>

          {/* Links */}
          <div className="flex justify-between items-center w-full mt-6 text-sm font-sans text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors cursor-not-allowed opacity-60">Forgot Password?</Link>
            <Link href="/login" className="hover:text-foreground transition-colors opacity-60 cursor-not-allowed">Sign Up</Link>
          </div>

          {/* Social Logins */}
          <div className="flex flex-col items-center mt-8 pt-6 border-t border-border/50">
            <span className="text-xs text-muted-foreground font-sans mb-4">or you can sign in with</span>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </button>
              <button disabled className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center opacity-50 cursor-not-allowed">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
              </button>
              <button disabled className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center opacity-50 cursor-not-allowed">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M16.92 5.093c.895-1.07 1.488-2.585 1.32-4.093-1.344.055-2.92 1.004-3.834 2.062-.806.91-1.503 2.484-1.305 3.96 1.506.113 2.92-1.01 3.818-1.93zM22.012 18.06c-.846 2.302-2.025 4.14-3.155 4.14-.997 0-1.295-.628-3.072-.628-1.782 0-2.155.61-3.09.61-1.066 0-2.228-1.748-3.14-4.062-1.89-4.787-1.92-8.397-.04-10.36 1.03-1.082 2.396-1.742 3.737-1.742 1.644 0 2.84.975 3.774.975.894 0 2.457-1.127 4.183-.996.793.05 3.01.272 4.417 2.25-3.69 1.942-3.13 6.945.54 8.273-1.026 2.502-1.026 2.502-2.155 4.14z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
