"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { fetchWithAuth } from "@/lib/api/fetchWithAuth";
import { toast } from "sonner";
import { motion } from "motion/react";
import { 
  Loader2, 
  Play, 
  Upload, 
  Code2, 
  Trophy, 
  Maximize, 
  Minimize, 
  LayoutDashboard, 
  Clock, 
  CheckCircle2, 
  XCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useRoomStore } from "@/store/useRoomStore";
import { useLobbyWebSocket } from "@/hooks/useLobbyWebSocket";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import Editor from "@monaco-editor/react";

// Types based on the start game response
interface Question {
  position: number;
  question_id: string;
  title: string;
  description_md: string;
  difficulty: string;
  sample_input: string;
  sample_output: string;
  time_limit_ms: number;
}

interface GameState {
  status: string;
  started_at: string;
  deadline: string;
  questions: Question[];
  settings?: {
    mode?: string;
    time_limit?: number;
  };
}

export default function ActiveGamePage() {
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

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<string>("00:00");
  const roomStoreData = useRoomStore((state) => state.room);
  
  // Editor State
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("# Write your solution here\n\nclass Solution:\n    def addTwoNumbers(self, l1, l2):\n        pass");

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize WebSocket connection to listen for PLAYER_LEFT and PLAYER_JOINED during the game
  useLobbyWebSocket(roomId, true);

  // Sync global deadline updates from WebSocket into local gameState
  useEffect(() => {
    if (roomStoreData?.deadline && gameState && roomStoreData.deadline !== gameState.deadline) {
      setGameState(prev => prev ? { ...prev, deadline: roomStoreData.deadline! } : null);
    }
  }, [roomStoreData?.deadline, gameState?.deadline]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen mode: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    async function fetchGameState() {
      if (status !== "authenticated" || !roomId) return;
      
      try {
        const res = await fetchWithAuth(`/api/backend/rooms/${roomId}`, {}, session);
        if (!res.ok) throw new Error("Failed to fetch room state");
        
        const data = await res.json();
        
        // Ensure the current user is actually a participant in this game!
        const isPlayer = data.players?.some((p: any) => 
          p.user_id === (session as any)?.user?.id || 
          p.username === session?.username ||
          p.user_id === session?.user?.email
        );
        
        if (!isPlayer) {
          toast.error("You are not a participant in this match.");
          router.push("/dashboard");
          return;
        }

        useRoomStore.getState().setRoom(data);
        
        if (data.status !== "active") {
          toast.error("Game is not active!");
        }
        
        const startedAtStr = data.started_at || new Date().toISOString();
        const startedAtTime = new Date(startedAtStr).getTime();
        const timeLimitMs = (data.settings?.time_limit || 30) * 60000;
        
        // Use time_remaining if the backend provides it, otherwise calculate from started_at
        const calculatedDeadline = typeof data.time_remaining === "number" 
          ? new Date(Date.now() + data.time_remaining * 1000).toISOString() 
          : new Date(startedAtTime + timeLimitMs).toISOString();
        
        setGameState({
          status: data.status,
          started_at: startedAtStr,
          deadline: data.deadline || calculatedDeadline,
          settings: data.settings,
          questions: data.questions?.length > 0 ? data.questions : [
            {
              position: 0,
              question_id: "dummy",
              title: "Add Two Numbers",
              description_md: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.",
              difficulty: "Medium",
              sample_input: "l1 = [2,4,3], l2 = [5,6,4]",
              sample_output: "[7,0,8]",
              time_limit_ms: 2000
            }
          ]
        });
      } catch (err) {
        console.error("Error loading game:", err);
        toast.error("Error loading game state");
      } finally {
        setIsLoading(false);
      }
    }

    fetchGameState();
  }, [roomId, status, session]);

  // Timer logic
  useEffect(() => {
    if (!gameState?.deadline) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const deadlineTime = new Date(gameState.deadline).getTime();
      const distance = deadlineTime - now;

      if (distance <= 0) {
        clearInterval(interval);
        setTimeRemaining("00:00");
        return;
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeRemaining(
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState?.deadline]);

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 font-retro tracking-widest text-primary animate-pulse">LOADING ARENA...</span>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] gap-4">
        <XCircle className="h-12 w-12 text-red-500" />
        <span className="font-retro tracking-widest text-white text-xl">FAILED TO LOAD ARENA</span>
        <p className="text-gray-400 text-sm max-w-md text-center">
          We couldn't fetch the game state from the backend. Please check if your backend services (like the Question service) are running properly.
        </p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
          Retry Connection
        </Button>
      </div>
    );
  }

  const question = gameState?.questions[0];
  const roomName = roomStoreData?.room_name || `Room ${roomId.split('-')[0]}`;

  const handleSubmit = async () => {
    if (!question) {
      toast.error("Error: No question data loaded!");
      return;
    }
    
    setIsSubmitting(true);
    const toastId = toast.loading("Submitting code...");
    
    try {
      const payload = {
        question_id: question.question_id,
        language,
        code
      };
      
      const res = await fetchWithAuth(`/api/backend/submissions/${roomId}/submit`, {
        method: "POST",
        body: JSON.stringify(payload)
      }, session);
      
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || "Failed to submit code");
      }
      
      toast.success("Submission sent successfully! Waiting for results...", { id: toastId });
      
    } catch (err: any) {
      toast.error(`Submission error: ${err.message}`, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn(
      "flex flex-col overflow-hidden bg-[#0f0f11] text-white font-sans",
      isFullscreen ? "fixed inset-0 z-[100] bg-[#0c0c0e] h-screen" : "h-[calc(100vh-80px)]"
    )}>
      {/* Top Navbar */}
      <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 shrink-0 bg-[#0a0a0a]">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <div className="text-lg font-bold font-mono text-white tracking-wide">
              {roomName}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="text-emerald-400 font-medium">{gameState?.settings?.mode || "BLITZ"}</span>
              <span>•</span>
              <span>{gameState?.settings?.time_limit || 10} min</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-md border border-white/10 ml-4">
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Q{question?.position !== undefined ? question.position + 1 : 1} / {gameState?.questions?.length || 1}</span>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-md">
            <Clock className="h-4 w-4 text-red-500" />
            <span className="font-mono text-lg font-bold text-red-500 tracking-wider">
              {timeRemaining}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`transition-colors ${showLeaderboard ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-white hover:bg-white/10'}`}
            onClick={() => setShowLeaderboard(!showLeaderboard)}
          >
            <Trophy className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-white hover:bg-white/10"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        <ResizablePanelGroup id="main-workspace" direction="horizontal" orientation="horizontal" className="h-full w-full">
          
          {/* LEFT PANEL: Problem Description */}
          <ResizablePanel id="left-panel" defaultSize={35} minSize={20} className="bg-[#121214] flex flex-col">
            <div className="h-10 border-b border-white/5 flex items-center px-4 shrink-0 bg-white/5">
              <span className="text-sm font-medium flex items-center gap-2">
                <Code2 className="h-4 w-4 text-primary" />
                Problem Description
              </span>
            </div>
            <ScrollArea className="flex-1 p-6">
              <div className="max-w-none">
                <h1 className="text-xl font-bold mb-2 font-mono">
                  {question?.position !== undefined ? question.position + 1 : 1}. {question?.title || "Add Two Numbers"}
                </h1>
                <div className="flex items-center gap-3 mb-6">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    question?.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-500' :
                    question?.difficulty === 'Hard' ? 'bg-red-500/20 text-red-500' :
                    'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {question?.difficulty || "Medium"}
                  </span>
                </div>
                
                <div className="prose prose-invert prose-sm max-w-none leading-relaxed text-gray-300 font-sans">
                  <p>
                    {question?.description_md || "You are given two non-empty linked lists representing two non-negative integers."}
                  </p>
                  
                  <h3 className="text-white mt-6 mb-2 text-sm font-bold font-sans">Example 1:</h3>
                  <div className="bg-white/5 p-3 rounded-lg font-mono text-xs border border-white/5">
                    <strong>Input:</strong> {question?.sample_input || "l1 = [2,4,3], l2 = [5,6,4]"}<br />
                    <strong>Output:</strong> {question?.sample_output || "[7,0,8]"}<br />
                    <strong>Explanation:</strong> 342 + 465 = 807.
                  </div>

                  <h3 className="text-white mt-6 mb-2 text-sm font-bold font-sans">Constraints:</h3>
                  <ul className="list-disc pl-5 space-y-1 text-xs bg-white/5 p-3 rounded-lg border border-white/5 font-mono">
                    <li>The number of nodes in each linked list is in the range <code>[1, 100]</code>.</li>
                    <li><code>0 &lt;= Node.val &lt;= 9</code></li>
                    <li>It is guaranteed that the list represents a number that does not have leading zeros.</li>
                  </ul>
                </div>
              </div>
            </ScrollArea>
          </ResizablePanel>
          
          <ResizableHandle id="handle-1" withHandle className="bg-white/10 hover:bg-primary/50 transition-colors" />
          
          {/* RIGHT PANEL: Editor & Test Cases */}
          <ResizablePanel id="right-panel" defaultSize={65} minSize={30} className="h-full flex flex-col">
            <ResizablePanelGroup id="inner-workspace" direction="vertical" orientation="vertical" style={{ width: "100%", height: "100%" }}>
              
              {/* EDITOR PANEL */}
              <ResizablePanel id="editor-panel" defaultSize={70} minSize={30} className="flex flex-col bg-[#1e1e1e]">
                {/* Editor Toolbar */}
                <div className="h-10 border-b border-white/5 flex items-center justify-between px-4 shrink-0 bg-[#181818]">
                  <select 
                    className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm outline-none text-gray-300 hover:text-white transition-colors"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="python">Python 3</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    <option value="javascript">JavaScript</option>
                  </select>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-7 text-xs bg-white/5 border-white/10 hover:bg-white/10">
                      <Play className="h-3 w-3 mr-1.5" />
                      Run Code
                    </Button>
                    <Button 
                      size="sm" 
                      className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium disabled:opacity-50"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                      ) : (
                        <Upload className="h-3 w-3 mr-1.5" />
                      )}
                      {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                  </div>
                </div>
                
                {/* Monaco Editor Container */}
                <div className="flex-1 relative">
                  <Editor
                    height="100%"
                    language={language}
                    theme="vs-dark"
                    value={code}
                    onChange={(val) => setCode(val || "")}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineHeight: 1.5,
                      padding: { top: 16 },
                      scrollBeyondLastLine: false,
                      smoothScrolling: true,
                      cursorBlinking: "smooth",
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    }}
                  />
                </div>
              </ResizablePanel>
              
              <ResizableHandle id="handle-2" withHandle direction="vertical" className="w-full h-1 bg-white/10 hover:bg-primary/50 transition-colors" />
              
              {/* TEST CASES PANEL */}
              <ResizablePanel id="testcases-panel" defaultSize={30} minSize={15} className="bg-[#121214] flex flex-col">
                <Tabs defaultValue="testcases" className="h-full flex flex-col w-full">
                  <div className="h-10 border-b border-white/5 px-2 flex items-center bg-white/5 shrink-0">
                    <TabsList className="bg-transparent h-8">
                      <TabsTrigger value="testcases" className="text-xs data-[state=active]:bg-white/10 rounded-sm">
                        <CheckCircle2 className="h-3 w-3 mr-1.5" />
                        Test Cases
                      </TabsTrigger>
                      <TabsTrigger value="result" className="text-xs data-[state=active]:bg-white/10 rounded-sm">
                        Test Result
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <ScrollArea className="flex-1">
                    <TabsContent value="testcases" className="p-4 m-0 h-full">
                      <div className="flex gap-2 mb-4">
                        <div className="px-3 py-1.5 bg-white/10 rounded-md text-sm font-medium cursor-pointer hover:bg-white/20 transition-colors border border-white/5">Case 1</div>
                        <div className="px-3 py-1.5 bg-white/5 rounded-md text-sm text-gray-400 cursor-pointer hover:bg-white/10 transition-colors">Case 2</div>
                        <div className="px-3 py-1.5 bg-white/5 rounded-md text-sm text-gray-400 cursor-pointer hover:bg-white/10 transition-colors">Case 3</div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-gray-400 font-semibold mb-1 block">l1 =</label>
                          <div className="bg-black/40 border border-white/10 rounded-md p-2.5 font-mono text-sm text-gray-300">
                            [2,4,3]
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 font-semibold mb-1 block">l2 =</label>
                          <div className="bg-black/40 border border-white/10 rounded-md p-2.5 font-mono text-sm text-gray-300">
                            [5,6,4]
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="result" className="p-4 m-0 h-full flex items-center justify-center text-gray-500 text-sm">
                      Run your code to see results here.
                    </TabsContent>
                  </ScrollArea>
                </Tabs>
              </ResizablePanel>

            </ResizablePanelGroup>
          </ResizablePanel>

        </ResizablePanelGroup>
        
        {/* LEADERBOARD OVERLAY */}
        {showLeaderboard && (
          <div className="absolute top-16 right-4 w-80 bg-[#18181b] border border-white/10 rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-200">
            <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 bg-white/5">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Trophy className="h-4 w-4 text-emerald-500" />
                Live Leaderboard
              </h3>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white" onClick={() => setShowLeaderboard(false)}>
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-2 flex flex-col gap-1 max-h-[60vh] overflow-y-auto">
              {roomStoreData?.players?.map((p, idx) => (
                <div key={p.user_id} className={`flex items-center justify-between p-2 rounded border border-transparent ${p.is_offline ? 'opacity-50 grayscale' : 'hover:bg-white/5'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`font-bold w-4 ${idx === 0 ? 'text-emerald-500' : 'text-gray-500'}`}>{idx + 1}</span>
                    <span className="text-sm font-medium">{p.display_name || p.username}</span>
                  </div>
                  <span className={`text-xs ${p.is_offline ? 'text-red-400' : 'text-gray-400'}`}>
                    {p.is_offline ? 'Offline' : 'Coding...'}
                  </span>
                </div>
              ))}
              {(!roomStoreData?.players || roomStoreData.players.length === 0) && (
                <div className="text-sm text-center text-gray-500 py-4">No players found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
