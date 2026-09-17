// components/providers/SocketProvider.tsx
"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import {
  AddOvertimeRequestPayload,
  NotificationPayload,
  NotificationType,
} from "@/types/notification.types";
import { toast } from "sonner";

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

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
    if (!isAuthenticated || !token || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
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
    } catch (e) {}

    if (process.env.NEXT_PUBLIC_SOCKET_URL) {
      socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    }

    const socket = io(`${socketUrl}/portal`, {
      auth: {
        token: handshakeAuthToken(token),
        userId: (user as { userId?: string }).userId ?? user.id,
      },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Conectado a websockets (/portal) de forma global");
    });

    socket.on("disconnect", () => {
      console.log("❌ Desconectado de websockets");
    });

    socket.on("connect_error", (err) => {
      console.error("⚠️ Error de conexión a websockets:", err.message);
    });

    // ===== HANDLER GENÉRICO =====
    const handleNotification = (data: NotificationPayload) => {
      useNotificationStore.getState().addNotification(data);
      toast(data.title || "Nueva notificación", {
        description: data.message,
        duration: 5000,
      });
    };

    // ===== HANDLERS DE OVERTIME =====
    const handleAddOvertimeRequest = (data: AddOvertimeRequestPayload) => {
      window.dispatchEvent(
        new CustomEvent("overtime-request-created", {
          detail: data,
        }),
      );
    };

    const handleOvertimeRequestApproved = (data: any) => {
      window.dispatchEvent(
        new CustomEvent("overtime_request_approved", {
          detail: data,
        }),
      );
    };

    const handleOvertimeRequestRejected = (data: any) => {
      window.dispatchEvent(
        new CustomEvent("overtime_request_rejected", {
          detail: data,
        }),
      );
    };

    // ===== HANDLERS DE EQUIPMENT LOANS =====

    // Nueva solicitud de préstamo (llega al creador)
    // components/providers/SocketProvider.tsx

    // ===== HANDLERS DE EQUIPMENT LOANS =====

    // Nueva solicitud de préstamo (llega al creador)
    const handleLoanNewRequest = (data: any) => {
      console.log("handleLoanNewRequest:", data);
      useNotificationStore.getState().addNotification({
        notificationId: `loan-new-${data.loanId}-${Date.now()}`,
        title: "Solicitud de préstamo creada",
        message:
          data.message ||
          `Tu solicitud para ${data.equipmentName} ha sido creada`,
        type: NotificationType.EQUIPMENT_LOAN_REQUEST,
        isRead: false,
      } as any);

      // Disparar evento global para que el componente refetchee
      window.dispatchEvent(new CustomEvent("equipment-loan-update"));
    };

    // Cambio de estado del préstamo (llega al creador)
    const handleLoanStatusChange = (data: any) => {
      console.log("handleLoanStatusChange:", data);

      let notificationType: NotificationType;
      let title: string;

      switch (data.status) {
        case "APPROVED":
          notificationType = NotificationType.EQUIPMENT_LOAN_APPROVED;
          title = "Préstamo aprobado";
          break;
        case "REJECTED":
          notificationType = NotificationType.EQUIPMENT_LOAN_REJECTED;
          title = "Préstamo rechazado";
          break;
        case "RETURNED":
          notificationType = NotificationType.EQUIPMENT_LOAN_RETURNED;
          title = "Equipo devuelto";
          break;
        case "CANCELLED":
          notificationType = NotificationType.EQUIPMENT_LOAN_REQUEST;
          title = "Solicitud cancelada";
          break;
        default:
          notificationType = NotificationType.EQUIPMENT_LOAN_REQUEST;
          title = "Actualización de préstamo";
      }

      useNotificationStore.getState().addNotification({
        notificationId: `loan-status-${data.loanId}-${Date.now()}`,
        title,
        message: data.message || `El estado cambió a ${data.status}`,
        type: notificationType,
        isRead: false,
      } as any);

      // Disparar evento global para que el componente refetchee
      window.dispatchEvent(new CustomEvent("equipment-loan-update"));
    };

    // Nueva solicitud pendiente (llega a líderes/admins)
    const handleLoanPendingApproval = (data: any) => {
      console.log("handleLoanPendingApproval:", data);
      useNotificationStore.getState().addNotification({
        notificationId: `loan-pending-${data.loanId}-${Date.now()}`,
        title: "Nueva solicitud de préstamo",
        message:
          data.message || `${data.userName} solicita ${data.equipmentName}`,
        type: NotificationType.EQUIPMENT_LOAN_REQUEST,
        isRead: false,
      } as any);

      // Disparar evento global para que el componente refetchee
      window.dispatchEvent(new CustomEvent("equipment-loan-update"));
    };

    // ===== REGISTRO DE LISTENERS =====

    // Notificaciones generales
    socket.on("point_request_received", handleNotification);
    socket.on("point_request_approved", handleNotification);
    socket.on("point_request_rejected", handleNotification);
    socket.on("overtime_request_approved", handleNotification);
    socket.on("overtime_request_rejected", handleNotification);
    socket.on("overtime_request_received", handleNotification);
    socket.on("leave_request_received", handleNotification);
    socket.on("leave_request_approved", handleNotification);
    socket.on("leave_request_rejected", handleNotification);

    // Overtime
    socket.on("overtime_request_received", handleAddOvertimeRequest);
    socket.on("overtime_request_approved", handleOvertimeRequestApproved);
    socket.on("overtime_request_rejected", handleOvertimeRequestRejected);

    // Equipment Loans
    socket.on("loan:newRequest", handleLoanNewRequest);
    socket.on("loan:statusChange", handleLoanStatusChange);
    socket.on("loan:pendingApproval", handleLoanPendingApproval);

    return () => {
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
