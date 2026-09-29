"use client";

import { useAuthStore } from "@/store/authStore";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface FeedSocketContextValue {
  socket: Socket | null;
}

const FeedSocketContext = createContext<FeedSocketContextValue>({
  socket: null,
});

export const FeedSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const socketRef = useRef<Socket | null>(null);
  const [, forceRender] = useState(0);
  const { user, token, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !token || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        forceRender((n) => n + 1);
      }
      return;
    }

    if (socketRef.current) return;

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
    let socketUrl = "http://localhost:3001";

    try {
      const urlObj = new URL(apiUrl);
      socketUrl = `${urlObj.protocol}//${urlObj.host}`;
    } catch {}

    if (process.env.NEXT_PUBLIC_SOCKET_URL) {
      socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    }

    const socket = io(`${socketUrl}/feed`, {
      auth: { token },
      transports: ["websocket"],
    });

    socket.onAny((event, ...args) => {
      console.log("🔵 [feed] onAny —", event, args);
    });

    socketRef.current = socket;
    forceRender((n) => n + 1);

    socket.on("connect", () => {
      console.log("✅ Conectado a websockets (/feed)");
    });
    socket.on("disconnect", () => {
      console.log("❌ Desconectado de websockets (/feed)");
    });
    socket.on("connect_error", (err) => {
      console.error("⚠️ Error de conexión a /feed:", err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, token, user]);

  return (
    <FeedSocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </FeedSocketContext.Provider>
  );
};

export const useFeedSocketContext = () => useContext(FeedSocketContext);
