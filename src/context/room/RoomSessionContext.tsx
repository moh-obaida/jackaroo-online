import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RoomData, PlayerState } from '../../types/game';
import { subscribeToRoom } from '../../lib/firebase/rooms';
import { isFirebaseConfigured } from '../../lib/firebase/config';
import { removePlayerFromRoom, leaveWarningMessage } from '../../lib/leave/safeLeave';
import {
  markLeft,
  hasLeft,
  setActiveRoomCode,
  clearLeftMark,
} from '../../lib/room/sessionMarks';
import { useApp } from '../AppContext';

export type RoomSessionContextValue = {
  room: RoomData | null;
  roomCode: string | null;
  roomLoaded: boolean;
  loading: boolean;
  error: string | null;
  isLeaving: boolean;
  leaveWarning: string | null;
  sessionEpoch: number;
  myPlayer: PlayerState | null;
  bindRoomFromRoute: (code: string, options?: { allowRejoin?: boolean }) => void;
  setRoomCode: (code: string | null) => void;
  clearGameSession: () => void;
  safeLeaveRoom: (code: string) => Promise<void>;
  acceptSessionUpdate: (epoch: number, code: string | null) => boolean;
  setSessionError: (message: string | null) => void;
  setSessionLoading: (loading: boolean) => void;
};

const RoomSessionContext = createContext<RoomSessionContextValue | null>(null);

export function RoomSessionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const playerId = user?.uid?.trim() || null;

  const [room, setRoom] = useState<RoomData | null>(null);
  const [roomCode, setRoomCodeState] = useState<string | null>(null);
  const [roomLoaded, setRoomLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const [leaveWarning, setLeaveWarning] = useState<string | null>(null);
  const [sessionEpoch, setSessionEpoch] = useState(0);

  const isLeavingRef = useRef(false);
  const sessionEpochRef = useRef(0);
  const leaveInFlightRef = useRef(false);

  sessionEpochRef.current = sessionEpoch;

  const acceptSessionUpdate = useCallback((epoch: number, code: string | null) => {
    if (isLeavingRef.current) return false;
    if (epoch !== sessionEpochRef.current) return false;
    if (code && hasLeft(code)) return false;
    return true;
  }, []);

  const clearGameSession = useCallback(() => {
    setRoomCodeState(null);
    setRoom(null);
    setRoomLoaded(false);
    setError(null);
    setActiveRoomCode(null);
  }, []);

  const setRoomCode = useCallback(
    (code: string | null) => {
      if (isLeavingRef.current) return;
      const trimmed = code?.trim() || null;
      if (trimmed && hasLeft(trimmed)) return;
      setRoomCodeState(trimmed);
      if (trimmed) {
        clearLeftMark(trimmed);
        setActiveRoomCode(trimmed);
      } else {
        setActiveRoomCode(null);
      }
    },
    []
  );

  const bindRoomFromRoute = useCallback(
    (code: string, options?: { allowRejoin?: boolean }) => {
      const trimmed = code?.trim();
      if (!trimmed) return;

      if (options?.allowRejoin) {
        clearLeftMark(trimmed);
        isLeavingRef.current = false;
        setIsLeaving(false);
        leaveInFlightRef.current = false;
        setRoomCode(trimmed);
        return;
      }

      if (isLeavingRef.current || isLeaving) return;
      if (hasLeft(trimmed)) return;
      setRoomCode(trimmed);
    },
    [isLeaving, setRoomCode]
  );

  const safeLeaveRoom = useCallback(
    async (code: string) => {
      const trimmed = code?.trim();
      if (!trimmed || leaveInFlightRef.current) return;
      leaveInFlightRef.current = true;

      // 1. Mark leaving
      isLeavingRef.current = true;
      setIsLeaving(true);

      // 2. Bump epoch (invalidate all in-flight callbacks)
      sessionEpochRef.current += 1;
      setSessionEpoch(sessionEpochRef.current);

      // 3. Clear route/session state (+ left mark blocks rejoin on refresh)
      markLeft(trimmed);
      clearGameSession();

      // 4. Navigate home immediately (never wait on Firebase)
      navigate('/', { replace: true });

      // 5. Firebase cleanup in background only
      const uid = playerId;
      if (uid) {
        try {
          await removePlayerFromRoom({ roomCode: trimmed, playerUid: uid });
        } catch (err) {
          console.warn('safeLeaveRoom: Firebase remove failed', err);
          if (acceptSessionUpdate(sessionEpochRef.current, null)) {
            setLeaveWarning(leaveWarningMessage(err));
          }
        }
      }

      leaveInFlightRef.current = false;
    },
    [playerId, clearGameSession, navigate, acceptSessionUpdate]
  );

  useEffect(() => {
    if (location.pathname === '/') {
      const t = window.setTimeout(() => {
        isLeavingRef.current = false;
        setIsLeaving(false);
      }, 100);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [location.pathname]);

  useEffect(() => {
    if (isLeavingRef.current || isLeaving) return;

    if (!roomCode || !isFirebaseConfigured) {
      setRoom(null);
      setRoomLoaded(!roomCode);
      return;
    }

    if (hasLeft(roomCode)) {
      setRoom(null);
      setRoomLoaded(true);
      return;
    }

    const epoch = sessionEpochRef.current;
    setRoomLoaded(false);

    const unsub = subscribeToRoom(roomCode, (roomData) => {
      if (!acceptSessionUpdate(epoch, roomCode)) return;
      setRoom(roomData);
      setRoomLoaded(true);
    });

    return () => {
      unsub();
    };
  }, [roomCode, isLeaving, sessionEpoch, acceptSessionUpdate]);

  const myPlayer = React.useMemo(() => {
    if (!room || !playerId) return null;
    return room.players[playerId] || null;
  }, [room, playerId]);

  const setSessionError = useCallback((message: string | null) => {
    setError(message);
  }, []);

  const setSessionLoading = useCallback((value: boolean) => {
    setLoading(value);
  }, []);

  const value: RoomSessionContextValue = {
    room,
    roomCode,
    roomLoaded,
    loading,
    error,
    isLeaving,
    leaveWarning,
    sessionEpoch,
    myPlayer,
    bindRoomFromRoute,
    setRoomCode,
    clearGameSession,
    safeLeaveRoom,
    acceptSessionUpdate,
    setSessionError,
    setSessionLoading,
  };

  return (
    <RoomSessionContext.Provider value={value}>{children}</RoomSessionContext.Provider>
  );
}

export function useRoomSession(): RoomSessionContextValue {
  const ctx = useContext(RoomSessionContext);
  if (!ctx) throw new Error('useRoomSession must be used within RoomSessionProvider');
  return ctx;
}
