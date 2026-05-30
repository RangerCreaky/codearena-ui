"use client";

import { signIn } from "next-auth/react";
import { motion } from "motion/react";
import { Phone } from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function AuthCard() {
  return (
    <motion.div
      className="flex items-center justify-center px-6 sm:px-10"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
    >
      <Card className="w-full max-w-sm border-border/50 shadow-xl transition-shadow duration-300 hover:shadow-2xl hover:shadow-primary/5">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold">
            Welcome to the Arena
          </CardTitle>
          <CardDescription className="text-base">
            Sign in to start coding battles
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 pt-4">
          {/* Google - Active */}
          <Button
            variant="outline"
            className="w-full h-11 text-sm font-medium gap-3 cursor-pointer hover:bg-primary/5 hover:border-primary/30 transition-all"
            onClick={() => signIn("google")}
          >
            <GoogleIcon />
            Continue with Google
          </Button>

          {/* GitHub - Disabled */}
          <div className="relative">
            <Button
              variant="outline"
              className="w-full h-11 text-sm font-medium gap-3 opacity-50 cursor-not-allowed"
              disabled
            >
              <GithubIcon className="h-5 w-5" />
              Continue with GitHub
            </Button>
            <Badge
              variant="secondary"
              className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0.5"
            >
              Coming Soon
            </Badge>
          </div>

          {/* Phone - Disabled */}
          <div className="relative">
            <Button
              variant="outline"
              className="w-full h-11 text-sm font-medium gap-3 opacity-50 cursor-not-allowed"
              disabled
            >
              <Phone className="h-5 w-5" />
              Continue with Phone
            </Button>
            <Badge
              variant="secondary"
              className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0.5"
            >
              Coming Soon
            </Badge>
          </div>

          <Separator className="my-4" />

          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <span className="underline cursor-pointer hover:text-foreground transition-colors">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="underline cursor-pointer hover:text-foreground transition-colors">
              Privacy Policy
            </span>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
