import { useEffect, useRef, useState } from "react";
import { fetchWithAuth } from "@/lib/api/fetchWithAuth";
import { toast } from "sonner";
import { useRoomStore } from "@/store/useRoomStore";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function useLobbyWebSocket(roomId: string, hasJoined: boolean) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    let active = true;

    async function connectWs() {
      try {
        // 1. Fetch the WS Token
        const res = await fetchWithAuth(`/api/backend/rooms/${roomId}/ws-token`, {
          method: "POST",
        }, session);
        if (!res.ok) {
          throw new Error("Failed to get websocket token");
        }
        const data = await res.json();
        const wsToken = data.ws_token;

        if (!active) return;

        // 2. Construct WebSocket URL
        // Convert HTTP to WS (e.g. http://localhost:8000 -> ws://localhost:8000)
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const wsBaseUrl = baseUrl.replace(/^http/, "ws");
        
        const wsUrl = `${wsBaseUrl}/ws/${roomId}?token=${wsToken}`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setIsConnected(true);
          console.log("WebSocket connected to room:", roomId);
          
          // Force current user online locally to fix any race conditions with REST fetches
          const store = useRoomStore.getState();
          const currentUserPlayer = store.room?.players.find(p => 
            p.user_id === (session as any)?.user?.id || 
            p.username === session?.username ||
            p.user_id === session?.user?.email
          );
          if (currentUserPlayer) {
            store.setPlayerOffline(currentUserPlayer.user_id, false);
          }
        };

        ws.onmessage = async (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log("Received WS message:", message);
            
            if (message.event === "PLAYER_JOINED") {
              const store = useRoomStore.getState();
              const existingPlayer = store.room?.players.find(p => p.user_id === message.user_id);
              
              if (existingPlayer) {
                store.setPlayerOffline(message.user_id, false);
                toast.success(`${message.username} rejoined the room!`);
              } else {
                store.addPlayer({
                  user_id: message.user_id,
                  username: message.username,
                  display_name: message.display_name,
                  avatar_url: message.avatar_url,
                  is_ready: false,
                  is_host: false,
                  is_offline: false,
                });
                toast.success(`${message.display_name} joined the room!`);
              }
            } else if (message.event === "PLAYER_LEFT") {
              // Ignore PLAYER_LEFT for ourselves (fixes "ghost reconnects" from old sockets closing)
              const isCurrentUser = 
                message.user_id === (session as any)?.user?.id || 
                message.username === session?.username ||
                message.user_id === session?.user?.email;
                
              if (isCurrentUser) {
                console.log("Ignoring PLAYER_LEFT for self (ghost reconnect)");
                // We shouldn't return here completely, because if the host (us) left, 
                // the backend might still assign a new host, but usually that doesn't happen for self.
                // It's safe to return.
                return;
              }

              const store = useRoomStore.getState();
              store.setPlayerOffline(message.user_id, true);
              toast.info(`${message.username} left the room`);
              
              // If the host left during the waiting phase, the backend assigns a new host.
              // We need to re-fetch the room to get the new host privileges.
              if (message.is_host && store.room?.status === "waiting") {
                const session = await fetch("/api/auth/session").then(res => res.json());
                const res = await fetch(`/api/backend/rooms/${roomId}`, {
                  headers: {
                    "Authorization": `Bearer ${session?.accessToken || ""}`
                  }
                });
                if (res.ok) {
                  const data = await res.json();
                  store.setRoom(data);
                  const newHost = data.players?.find((p: any) => p.is_host);
                  if (newHost) {
                    toast.info(`${newHost.display_name || newHost.username} is the new host!`);
                  }
                }
              }
            } else if (message.event === "PLAYER_READY") {
              useRoomStore.getState().setPlayerReady(message.user_id, true);
              toast.info(`${message.username} is ready!`);
            } else if (message.event === "GAME_STARTED") {
              const store = useRoomStore.getState();
              store.setRoomStatus("active");
              
              const isPlayer = store.room?.players.some(p => 
                p.user_id === (session as any)?.user?.id || 
                p.username === session?.username ||
                p.user_id === session?.user?.email
              );

              if (isPlayer) {
                toast.success("Game is starting!");
                router.push(`/play/${roomId}`);
              } else {
                toast.error("The match has started! You have been returned to the dashboard because you were not joined in the lobby.");
                router.push("/dashboard");
              }
            } else if (message.event === "TIMER_SYNC") {
              const store = useRoomStore.getState();
              if (message.deadline && message.time_remaining_secs !== undefined) {
                store.updateDeadline(message.deadline, message.time_remaining_secs);
              }
            } else if (message.event === "SUBMISSION_RECIEVED") {
              const { display_name, username } = message;
              toast.info(`⚡ ${display_name || username || "Someone"} just submitted their code!`, {
                icon: "🚀",
                style: {
                  borderRadius: '10px',
                  background: '#333',
                  color: '#fff',
                  border: '1px solid #10b981',
                },
              });
            } else {
              console.log("Unhandled WS message event:", message.event, message);
            }
          } catch (e) {
            console.error("Failed to parse WS message", e);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          console.log("WebSocket disconnected from room:", roomId);
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          // Only show error toast if we are actively trying to connect/communicate
          // toast.error("Connection to lobby server lost.");
        };

        wsRef.current = ws;
      } catch (err: any) {
        if (active) {
          console.error("WebSocket init error:", err);
          toast.error("Failed to connect to lobby", {
            description: err.message
          });
        }
      }
    }

    if (roomId && status === "authenticated" && hasJoined) {
      connectWs();
    }

    return () => {
      active = false;
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [roomId, status, hasJoined, session]);

  const sendMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log("Sending WS message:", message);
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error("Cannot send message, WebSocket is not open. Attempted message:", message);
      toast.error("Not connected to lobby server.");
    }
  };

  return { isConnected, ws: wsRef.current, sendMessage };
}
