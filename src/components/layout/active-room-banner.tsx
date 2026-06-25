"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { fetchWithAuth } from "@/lib/api/fetchWithAuth";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActiveRoom {
  room_id: string;
  room_name: string;
  status: string;
  time_remaining: number;
}

export function ActiveRoomBanner() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [activeRoom, setActiveRoom] = useState<ActiveRoom | null>(null);

  useEffect(() => {
    // Don't poll if we are already in a lobby or play page (to save backend calls)
    if (pathname.startsWith("/play/") || pathname.startsWith("/lobby/")) {
      setActiveRoom(null);
      return;
    }

    async function checkActiveRoom() {
      if (status !== "authenticated") return;

      try {
        const res = await fetchWithAuth("/api/backend/rooms/active", {}, session);
        if (res.ok) {
          const data: ActiveRoom[] = await res.json();
          if (data && data.length > 0) {
            setActiveRoom(data[0]); // Take the first active room
          } else {
            setActiveRoom(null);
          }
        }
      } catch (err) {
        console.error("Failed to check active rooms", err);
      }
    }

    // Check immediately and then every 30 seconds
    checkActiveRoom();
    const interval = setInterval(checkActiveRoom, 30000);
    return () => clearInterval(interval);
  }, [status, session, pathname]);

  // Don't show if unauthenticated, or if no active room
  if (status !== "authenticated" || !activeRoom) return null;

  // Don't show the banner if we are already in the room's lobby or play page
  if (pathname.startsWith(`/play/${activeRoom.room_id}`) || pathname.startsWith(`/lobby/${activeRoom.room_id}`)) {
    return null;
  }

  // Determine where to redirect based on status
  const reconnectUrl = activeRoom.status === "waiting" 
    ? `/lobby/${activeRoom.room_id}` 
    : `/play/${activeRoom.room_id}`;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#111111]/90 border border-primary/30 backdrop-blur-md shadow-2xl rounded-full px-6 py-3 flex items-center gap-4 text-sm animate-in slide-in-from-bottom-4 fade-in">
      <div className="flex items-center gap-2 text-primary font-medium">
        <AlertTriangle className="h-4 w-4" />
        <span>You have an ongoing match: <strong className="text-foreground ml-1">{activeRoom.room_name}</strong></span>
      </div>
      <Button 
        size="sm" 
        className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4 py-0 rounded-full shadow-[0_0_15px_var(--color-primary)] transition-all"
        onClick={() => router.push(reconnectUrl)}
      >
        Reconnect <ArrowRight className="h-3 w-3 ml-1" />
      </Button>
    </div>
  );
}
