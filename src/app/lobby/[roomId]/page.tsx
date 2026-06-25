"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "motion/react";
import { 
  Users, 
  Clock, 
  Settings2, 
  Copy, 
  Check, 
  Play, 
  ShieldAlert,
  Hash,
  Crown,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

import { useRoomStore } from "@/store/useRoomStore";
import { useLobbyWebSocket } from "@/hooks/useLobbyWebSocket";
import { fetchWithAuth } from "@/lib/api/fetchWithAuth";
import { CrossedSwords } from "@/components/landing/crossed-swords";

// --- Dummy Data (Fallback if store empty) ---
const DUMMY_ROOM_DATA = {
  name: "Leetcode Grind Session",
  mode: "blitz",
  duration_secs: 600,
  max_players: 4,
  question_count: 1,
};

const DUMMY_QUESTIONS = [
  {
    id: "add-two-numbers",
    title: "Add Two Numbers",
    subtitle: "You are given two non-empty linked lists representing two non-negative integers.",
    difficulty: "Easy",
    tags: ["Math", "Linked List"],
  }
];

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const roomId = params.roomId as string;
  const { data: session, status } = useSession();

  useEffect(() => {
    if (searchParams.get("fromActive") === "true") {
      toast.error("You cannot host/join another game while you have an active match. Please complete this match first!");
      window.history.replaceState(null, '', pathname);
    }
  }, [searchParams, pathname]);

  const [copied, setCopied] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const roomStoreData = useRoomStore((state) => state.room);
  const [isLoadingRoom, setIsLoadingRoom] = useState(!roomStoreData || roomStoreData.room_id !== roomId);

  // Fetch Room Data on mount to ensure we have the latest state (especially for new users joining via link)
  useEffect(() => {
    async function fetchRoom() {
      if (status !== "authenticated") return;
      
      try {
        console.log("LOBBY PAGE SESSION STATE:", { status, session });
        const res = await fetchWithAuth(`/api/backend/rooms/${roomId}`, {}, session);
        if (res.ok) {
          const data = await res.json();
          useRoomStore.getState().setRoom(data);

          // Block late joiners or reconnect active players
          if (data.status === "active") {
            const isUserInRoom = data.players?.some((p: any) => 
              p.user_id === session?.user?.email || 
              p.user_id === (session as any)?.user?.id || 
              p.username === session?.username
            );
            if (!isUserInRoom) {
              toast.error("This game has already started. You cannot join.");
              router.push("/dashboard");
              return;
            } else {
              toast.info("Reconnecting to active game...");
              router.push(`/play/${roomId}`);
              return;
            }
          }

          // Kick out anyone trying to view a full lobby if they aren't already a player
          if (data.status === "waiting") {
            const isUserInRoom = data.players?.some((p: any) => 
              p.user_id === session?.user?.email || 
              p.user_id === (session as any)?.user?.id || 
              p.username === session?.username
            );
            const maxPlayers = data.max_players || 4;
            
            if (!isUserInRoom && data.players?.length >= maxPlayers) {
              toast.error(`This room is full (max ${maxPlayers} players). Contact the host to increase the size.`);
              router.push("/dashboard");
              return;
            }
          }

        } else {
          // Attempt to get backend error message
          let errMsg = `Status ${res.status}`;
          try {
            const errData = await res.json();
            if (errData.detail) errMsg = errData.detail;
          } catch(e) {}
          
          toast.error(`Failed to load room: ${errMsg}`);
          router.push("/dashboard");
        }
      } catch (err: any) {
        console.error("Failed to fetch room details:", err);
        toast.error(`Error loading room: ${err.message}`);
        router.push("/dashboard");
      } finally {
        setIsLoadingRoom(false);
      }
    }
    fetchRoom();
  }, [roomId, status, router]);

  // Invite link logic
  const inviteLink = typeof window !== 'undefined' ? `${window.location.origin}/lobby/${roomId}` : `https://codearena.com/lobby/${roomId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success("Invite link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Use real data from store if available, provide sensible defaults
  const roomName = roomStoreData?.room_name || `Room ${roomId.split('-')[0]}`;
  const roomMode = roomStoreData?.mode || "blitz";
  const roomDuration = roomStoreData?.duration_secs ?? 600;
  const roomMaxPlayers = roomStoreData?.max_players || 4;
  const roomQuestions = roomStoreData?.questions?.length ? roomStoreData.questions : DUMMY_QUESTIONS;
  
  // For players: use store data if available, otherwise fallback to session user as host (temporary)
  const players = roomStoreData?.players || [
    {
      user_id: session?.user?.email || "dummy",
      username: session?.username || session?.user?.name || "Host User",
      display_name: session?.user?.name || "Host User",
      avatar_url: session?.user?.image || session?.avatarUrl || "",
      is_ready: true,
      is_host: true,
    }
  ];

  // Logic to determine user state
  const currentUserPlayer = players.find(p => 
    p.username === session?.username || 
    p.user_id === session?.user?.email || 
    p.user_id === (session as any)?.user?.id
  );
  const isHost = currentUserPlayer?.is_host ?? false;
  const hasJoined = !!currentUserPlayer;
  const isReady = currentUserPlayer?.is_ready ?? false;

  // Initialize WebSocket connection only if joined
  const { isConnected, sendMessage } = useLobbyWebSocket(roomId, hasJoined);

  // Logic for starting the game
  const activePlayers = players.filter(p => !p.is_offline);
  const canStartGame = activePlayers.length > 1 && activePlayers.every(p => p.is_ready);

  const handleActionClick = async () => {
    if (isHost) {
      if (!canStartGame) {
        toast.error("All players must be ready before starting the game.");
        return;
      }
      
      const loadingToast = toast.loading("Starting game...");
      try {
        const res = await fetchWithAuth(`/api/backend/rooms/${roomId}/start`, {
          method: "POST"
        }, session);
        
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.detail || "Failed to start game");
        }
        
        // The backend should immediately broadcast GAME_STARTED via WebSocket to everyone.
        // If we redirect instantly, we close our WebSocket connection, which might crash 
        // a poorly handled broadcast loop on the backend before it reaches other players!
        // We delay our fallback redirect by 1s to ensure the backend finishes broadcasting.
        toast.success("Game started successfully!", { id: loadingToast });
        setTimeout(() => {
          router.push(`/play/${roomId}`);
        }, 1000);
      } catch (err: any) {
        console.error("Start game error:", err);
        toast.error(`Error starting game: ${err.message}`, { id: loadingToast });
      }
    } else {
      if (isReady) return; // Cannot un-ready
      
      // Send ready event to websocket
      sendMessage({
        event: "ready"
      });
      // We also update local store instantly so the UI feels snappy
      if (currentUserPlayer?.user_id) {
        useRoomStore.getState().setPlayerReady(currentUserPlayer.user_id, true);
      }
    }
  };

  const handleJoinRoom = async () => {
    setIsJoining(true);
    try {
      const res = await fetchWithAuth(`/api/backend/rooms/${roomId}/join`, {
        method: "POST"
      }, session);
      
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || "Failed to join room");
      }
      
      const data = await res.json();
      useRoomStore.getState().setRoom(data);
      toast.success("Joined room successfully!");
    } catch (err: any) {
      console.error("Join room error:", err);
      toast.error(`Error joining room: ${err.message}`);
    } finally {
      setIsJoining(false);
    }
  };

  // Helper to format time
  const formatTime = (secs: number) => {
    if (secs === 0) return "Custom";
    const m = Math.floor(secs / 60);
    return `${m} min`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {isLoadingRoom ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#e9ab2b]" />
          <p className="font-retro tracking-widest text-[#e9ab2b] text-sm animate-pulse">Loading Room...</p>
        </div>
      ) : (
        <>
          {/* ── Brand Header ── */}
          <div className="group flex justify-center mt-2 mb-6 cursor-default">
            <div className="relative flex items-center justify-center h-16 w-full">
              <div className="absolute opacity-35 scale-[0.28] sm:scale-[0.30] transition-all duration-500 ease-out group-hover:scale-[0.32] sm:group-hover:scale-[0.34] group-hover:opacity-60 group-hover:rotate-3">
                <CrossedSwords />
              </div>
              <h1 className="relative z-10 text-2xl sm:text-3xl tracking-wider flex items-center justify-center font-retro transition-all duration-500 group-hover:scale-105">
                <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">Code</span>
                <span className="text-[#e9ab2b] drop-shadow-[0_0_15px_rgba(233,171,43,0.6)]">Warz</span>
              </h1>
            </div>
          </div>

          {/* ── Top Section: Room Config & Invite ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-black/40 border border-white/10 p-6 rounded-2xl backdrop-blur-md"
      >
        <div className="space-y-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold font-retro tracking-wider text-foreground">
                {roomName}
              </h1>
              <div className="relative flex h-3 w-3 mt-1" title={isConnected ? "Connected to Server" : "Connecting..."}>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              </div>
            </div>
            <div className="flex items-center mt-1">
              <span className="text-xs font-retro tracking-widest text-[#e9ab2b] animate-pulse">WAITING IN LOBBY...</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Badge variant="outline" className="text-[#e9ab2b] border-[#e9ab2b]/30 bg-[#e9ab2b]/10 uppercase font-retro text-[10px]">
              {roomMode}
            </Badge>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {formatTime(roomDuration)}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Users className="h-4 w-4" /> max {roomMaxPlayers}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Hash className="h-4 w-4" /> {roomQuestions.length} Qs</span>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Invite Friends</span>
          <div className="flex items-center gap-2 bg-black/50 border border-white/10 p-1 pl-3 rounded-lg w-full md:w-auto">
            <code className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-[300px]">
              {inviteLink}
            </code>
            <Button size="sm" variant="secondary" className="h-8 gap-1.5 shrink-0" onClick={copyToClipboard}>
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── Main Content Split ── */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Side: Questions (70%) */}
        <div className="lg:w-[70%] space-y-6 flex flex-col">
          <Card className="border-white/10 bg-black/20 backdrop-blur-sm flex-1">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg font-retro flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-[#e9ab2b]" />
                Selected Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {DUMMY_QUESTIONS.map((q, idx) => (
                <motion.div 
                  key={q.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 rounded-xl border border-white/5 bg-black/40 hover:bg-black/60 transition-colors group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-retro text-lg">{q.title}</h3>
                    <Badge variant="outline" className="text-emerald-400 border-emerald-400/30">
                      {q.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {q.subtitle || q.description_md?.substring(0, 80) + '...' || 'No description available'}
                  </p>
                  
                  {q.tags && (
                    <div className="flex gap-2">
                      {q.tags.map((t: string) => (
                        <Badge key={t} variant="secondary" className="bg-white/5 hover:bg-white/10 text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Action Button */}
          <div className="flex justify-end pt-2">
            {!hasJoined ? (
              <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                <Button 
                  size="lg" 
                  onClick={handleJoinRoom}
                  disabled={isJoining || players.length >= roomMaxPlayers}
                  className="w-full sm:w-auto px-8 gap-2 font-retro text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed bg-[#e9ab2b] text-black hover:bg-[#e9ab2b]/90"
                >
                  {isJoining ? 'Joining...' : players.length >= roomMaxPlayers ? 'ROOM FULL' : 'Join Game'}
                </Button>
                {players.length >= roomMaxPlayers && (
                  <p className="text-xs text-[#e9ab2b]/80 max-w-[250px] text-right mt-1">
                    This room has reached its maximum capacity of {roomMaxPlayers} players. Contact the host to increase the room size.
                  </p>
                )}
              </div>
            ) : (
              <Button 
                size="lg" 
                onClick={handleActionClick}
                disabled={(isHost && !canStartGame) || (!isHost && isReady)}
                title={isHost && !canStartGame ? (players.length <= 1 ? "Waiting for more players to join..." : "Waiting for all players to be ready...") : ""}
                className={`w-full sm:w-auto px-8 gap-2 font-retro text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed ${
                  isHost 
                    ? "bg-[#e9ab2b] text-black hover:bg-[#e9ab2b]/90" 
                    : isReady 
                      ? "bg-[#e9ab2b]/20 text-[#e9ab2b] border border-[#e9ab2b]/50" // Ready state (disabled)
                      : "bg-transparent text-[#e9ab2b] border border-[#e9ab2b] hover:bg-[#e9ab2b]/10" // Not ready state (clickable)
                }`}
              >
                {isHost ? 'START GAME' : 'READY'}
              </Button>
            )}
          </div>
        </div>

        {/* Right Side: Players (30%) */}
        <div className="lg:w-[30%]">
          <Card className="border-white/10 bg-black/20 backdrop-blur-sm h-full">
            <CardHeader className="border-b border-white/5 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-retro flex items-center gap-2">
                <Users className="h-5 w-5 text-[#e9ab2b]" />
                Players
              </CardTitle>
              <Badge variant="secondary" className="bg-white/5">
                {players.length} / {roomMaxPlayers}
              </Badge>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {players.map((p) => (
                <motion.div 
                  key={p.user_id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${p.is_host ? 'border-[#e9ab2b]/50 bg-[#e9ab2b]/10 shadow-[0_0_15px_rgba(233,171,43,0.15)]' : 'border-white/5 bg-black/40'} ${p.is_offline ? 'opacity-50 grayscale' : ''}`}
                >
                  <div className="relative">
                    <Avatar className={`h-10 w-10 border ${p.is_host ? 'border-[#e9ab2b]/50' : 'border-white/10'}`}>
                      <AvatarImage src={p.avatar_url} />
                      <AvatarFallback className={`bg-black font-retro text-xs ${p.is_host ? 'text-[#e9ab2b]' : 'text-white'}`}>
                        {p.username?.charAt(0) || p.display_name?.charAt(0) || "P"}
                      </AvatarFallback>
                    </Avatar>
                    {p.is_host && (
                      <div className="absolute -bottom-1 -right-1 bg-[#e9ab2b] text-black rounded-full p-0.5">
                        <Crown className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate text-foreground">
                        {p.display_name || p.username}
                      </p>
                      {p.is_host && (
                        <Badge variant="outline" className="text-[9px] uppercase tracking-wider border-[#e9ab2b] text-[#e9ab2b] px-1 py-0 h-4">
                          Host
                        </Badge>
                      )}
                    </div>
                    <p className={`text-xs font-medium ${p.is_offline ? 'text-red-400' : p.is_ready ? (p.is_host ? 'text-[#e9ab2b]/70' : 'text-emerald-400') : 'text-muted-foreground'}`}>
                      {p.is_offline ? 'Offline' : p.is_ready ? 'Ready' : 'Not Ready'}
                    </p>
                  </div>
                </motion.div>
              ))}

            </CardContent>
          </Card>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
