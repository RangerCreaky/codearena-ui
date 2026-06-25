import { create } from 'zustand';

export interface Player {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  is_ready: boolean;
  is_host: boolean;
  is_offline?: boolean;
}

export interface Question {
  position: number;
  question_id: string;
  title: string;
  description_md: string;
  difficulty: string;
  sample_input: string;
  sample_output: string;
  time_limit_ms: number;
}

export interface RoomData {
  room_id: string;
  status: string;
  invite_link: string;
  mode: string;
  duration_secs: number;
  time_remaining: number;
  host_id: string;
  max_players: number;
  players: Player[];
  questions: Question[];
  // Frontend only state for now, as backend might not return name
  room_name?: string;
  deadline?: string;
}

interface RoomStore {
  room: RoomData | null;
  setRoom: (room: RoomData) => void;
  clearRoom: () => void;
  addPlayer: (player: Player) => void;
  setPlayerReady: (userId: string, isReady: boolean) => void;
  setPlayerOffline: (userId: string, isOffline: boolean) => void;
  updateDeadline: (deadline: string, timeRemaining: number) => void;
  setRoomStatus: (status: string) => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  room: null,
  setRoom: (room) => set({ room }),
  clearRoom: () => set({ room: null }),
  addPlayer: (player) => set((state) => {
    if (!state.room) return state;
    if (state.room.players.some(p => p.user_id === player.user_id)) return state;
    return {
      room: {
        ...state.room,
        players: [...state.room.players, player]
      }
    };
  }),
  setPlayerReady: (userId, isReady) => set((state) => {
    if (!state.room) return state;
    return {
      room: {
        ...state.room,
        players: state.room.players.map(p => 
          p.user_id === userId ? { ...p, is_ready: isReady } : p
        )
      }
    };
  }),
  setPlayerOffline: (userId, isOffline) => set((state) => {
    if (!state.room) return state;
    return {
      room: {
        ...state.room,
        players: state.room.players.map(p => 
          p.user_id === userId ? { ...p, is_offline: isOffline } : p
        )
      }
    };
  }),
  updateDeadline: (deadline, timeRemaining) => set((state) => ({
    room: state.room ? { ...state.room, deadline, time_remaining: timeRemaining } : null
  })),
  setRoomStatus: (status) => set((state) => ({
    room: state.room ? { ...state.room, status } : null
  }))
}));
