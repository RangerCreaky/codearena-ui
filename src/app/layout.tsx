import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SpiderNoirModal } from "@/components/ui/spider-noir-modal";
import { Toaster } from "@/components/ui/sonner";
import { ActiveRoomBanner } from "@/components/layout/active-room-banner";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pressStart2P = Press_Start_2P({
  variable: "--font-retro",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CodeArena — Where Code Becomes Competition",
  description:
    "Multiplayer gamified coding platform. Create rooms, challenge friends, and battle with code in real-time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${pressStart2P.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AuthSessionProvider>
          <AuthProvider>
            <QueryProvider>
              <ThemeProvider>
                <TooltipProvider>
                  <ActiveRoomBanner />
                  <SpiderNoirModal />
                  {children}
                  <Toaster position="bottom-right" theme="dark" />
                </TooltipProvider>
              </ThemeProvider>
            </QueryProvider>
          </AuthProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
