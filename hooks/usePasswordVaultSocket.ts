"use client";

import { useAuthStore } from "@/store/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

export function usePasswordVaultSocket() {
  const token = useAuthStore((s) => s.token);
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) return;

    const socket = io(`${SOCKET_URL}/password-vault`, {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔐 Password vault socket conectado");
    });

    socket.on("connect_error", (err) => {
      console.error("Error de conexión al password vault socket:", err.message);
    });

    socket.on("password:shared", (data: { passwordVaultId: string }) => {
      console.log("🔐 Nuevo password compartido:", data.passwordVaultId);

      queryClient.invalidateQueries({
        queryKey: ["vault-shares"],
      });

      queryClient.invalidateQueries({
        queryKey: ["vault-shares", data.passwordVaultId],
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);
}
