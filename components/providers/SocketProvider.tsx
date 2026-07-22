"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { NotificationPayload } from "@/types/notification.types";
import { toast } from "sonner";

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

/** JWT que el backend lee en handshake.auth.token */
function handshakeAuthToken(rawToken: string) {
  const t = rawToken.trim();
  if (!t) return t;
  if (/^Bearer\s+/i.test(t)) return t;
  return `Bearer ${t}`;
}

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socketRef = useRef<Socket | null>(null);
  const { user, token, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Si no está autenticado, nos aseguramos de desconectar el socket
    if (!isAuthenticated || !token || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Si ya existe una conexión para este usuario, no creamos otra (Singleton Provider)
    if (socketRef.current) return;

    // Inferir la URL base desde la URL de la API (para apuntar correctamente al puerto del backend ej: 3001)
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
    let socketUrl = "http://localhost:3001";
    try {
      const urlObj = new URL(apiUrl);
      socketUrl = `${urlObj.protocol}//${urlObj.host}`;
    } catch (e) {}

    // Permitir sobrescribir con una variable de entorno específica si existe
    if (process.env.NEXT_PUBLIC_SOCKET_URL) {
      socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    }

    const socket = io(`${socketUrl}/points`, {
      // handshake.auth debe incluir JWT en `token`; sin esto el servidor desconecta por seguridad.
      auth: {
        token: handshakeAuthToken(token),
        userId: (user as { userId?: string }).userId ?? user.id,
      },
      transports: ["websocket"], // Forzar uso de WebSocket (evitar polling)
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Conectado a websockets (/points) de forma global");
    });

    socket.on("disconnect", () => {
      console.log("❌ Desconectado de websockets");
    });

    socket.on("connect_error", (err) => {
      console.error("⚠️ Error de conexión a websockets:", err.message);
    });

    // Handler de notificaciones
    const handleNotification = (data: NotificationPayload) => {
      useNotificationStore.getState().addNotification(data);
      toast(data.title || "Nueva notificación", {
        description: data.message,
        duration: 5000,
      });
    };

    socket.on("point_request_received", handleNotification);
    socket.on("point_request_approved", handleNotification);
    socket.on("point_request_rejected", handleNotification);
    socket.on("overtime_request_approved", handleNotification);
    socket.on("overtime_request_rejected", handleNotification);
    socket.on("overtime_request_received", handleNotification);

    return () => {
      // La limpieza solo ocurre si el componente se desmonta por completo (ej: saliendo de la app)
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, token, user]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);
