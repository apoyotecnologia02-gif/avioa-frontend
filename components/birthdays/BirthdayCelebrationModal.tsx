"use client";

import { api } from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Cake, PartyPopper, X } from "lucide-react";
import { Button } from "../ui/button";
import { io, Socket } from "socket.io-client";
import { FeedPost } from "@/types/feed.types";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

interface BirthdayStatus {
  isBirthday: boolean;
  alreadySeen: boolean;
  feedPostId?: string | null;
  firstName?: string;
}

export function BirthdayCelebrationModal() {
  const currentUserId = useAuthStore(
    (s) => s.user?.userId ?? (s.user as { id?: string } | null)?.id,
  );
  const token = useAuthStore((s) => s.token);

  const [status, setStatus] = useState<BirthdayStatus | null>(null);
  const [open, setOpen] = useState(false);
  const firedRef = useRef(false);
  const socketRef = useRef<Socket | null>(null);

  // ============================================================
  // 1. Fetch inicial — deps primitivas, solo [currentUserId, token]
  // ============================================================
  useEffect(() => {
    if (!currentUserId || !token) return;

    let cancelled = false;
    const openTimeout = { id: null as ReturnType<typeof setTimeout> | null };

    (async () => {
      try {
        console.debug("[birthday-modal] fetching /birthdays/me...");
        const { data } = await api.get<BirthdayStatus>("/birthdays/me", {
          skip401Redirect: true,
        });

        if (cancelled) {
          console.debug("[birthday-modal] fetch cancelled");
          return;
        }

        console.debug("[birthday-modal] status recibido:", data);
        setStatus(data);

        if (data.isBirthday && !data.alreadySeen) {
          console.debug("[birthday-modal] programando apertura en 800ms");
          openTimeout.id = setTimeout(() => {
            if (cancelled) return;
            console.debug("[birthday-modal] abriendo modal");
            setOpen(true);
          }, 800);
        } else {
          console.debug(
            "[birthday-modal] no abrir — isBirthday:",
            data.isBirthday,
            "alreadySeen:",
            data.alreadySeen,
          );
        }
      } catch (error) {
        console.error("[birthday-modal] error fetching status:", error);
      }
    })();

    return () => {
      cancelled = true;
      if (openTimeout.id) clearTimeout(openTimeout.id);
    };
  }, [currentUserId, token]);

  // ============================================================
  // 2. Socket listener — si llega el post BIRTHDAY en vivo
  // ============================================================
  useEffect(() => {
    if (!currentUserId || !token || !SOCKET_URL) return;

    const socket = io(`${SOCKET_URL}/feed`, {
      auth: { token },
      transports: ["websocket"],
      withCredentials: true,
    });

    socketRef.current = socket;

    const handle = (post: FeedPost) => {
      if (post.type !== "BIRTHDAY") return;
      if (post.recognizedUser?.userId !== currentUserId) return;
      if (firedRef.current) return;

      console.debug("[birthday-modal] recibí mi post por socket:", post);
      firedRef.current = true;

      setStatus({
        isBirthday: true,
        alreadySeen: false,
        firstName: post.recognizedUser.name.split(" ")[0],
        feedPostId: post.feedPostId,
      });

      setTimeout(() => setOpen(true), 400);
    };

    socket.on("feed:post:new", handle);

    return () => {
      socket.off("feed:post:new", handle);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUserId, token]);

  // ============================================================
  // 3. Confeti
  // ============================================================
  useEffect(() => {
    if (!open) return;

    const duration = 6000;
    const end = Date.now() + duration;
    const colors = ["#ec4899", "#8b5cf6", "#3b82f6", "#f59e0b", "#10b981"];

    const interval = setInterval(() => {
      const timeLeft = end - Date.now();
      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }
      const particleCount = 50 * (timeLeft / duration);
      confetti({
        particleCount,
        spread: 70,
        origin: { x: 0.15, y: 0.6 },
        colors,
        zIndex: 9999,
        startVelocity: 45,
      });
      confetti({
        particleCount,
        spread: 70,
        origin: { x: 0.85, y: 0.6 },
        colors,
        zIndex: 9999,
        startVelocity: 45,
      });
    }, 250);

    return () => clearInterval(interval);
  }, [open]);

  const handleClose = async () => {
    setOpen(false);
    try {
      await api.post("/birthdays/me/seen", {}, { skip401Redirect: true });
    } catch {
      // no-op
    }
  };

  const goToPost = async () => {
    await handleClose();
    if (status?.feedPostId) {
      window.location.href = `/feed#post-${status.feedPostId}`;
    }
  };

  if (!status?.isBirthday || !status.firstName) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        className="max-w-lg overflow-hidden border-0 bg-gradient-to-br from-pink-50 via-white to-violet-50 p-0 shadow-2xl dark:from-pink-950/30 dark:via-background dark:to-violet-950/30 [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={handleClose}
      >
        <DialogTitle className="sr-only">
          ¡Feliz cumpleaños, {status.firstName}!
        </DialogTitle>

        <button
          onClick={handleClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-white/60 p-1.5 text-muted-foreground backdrop-blur transition-colors hover:bg-white hover:text-foreground dark:bg-black/40 dark:hover:bg-black/60"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative px-6 py-10 text-center sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <span className="absolute left-6 top-6 animate-bounce text-2xl [animation-duration:2.5s]">
              🎈
            </span>
            <span className="absolute right-8 top-10 animate-bounce text-2xl [animation-duration:3s]">
              🎈
            </span>
            <span className="absolute bottom-8 left-10 animate-bounce text-2xl [animation-duration:2.8s]">
              🎉
            </span>
            <span className="absolute bottom-10 right-12 animate-bounce text-2xl [animation-duration:2.2s]">
              ✨
            </span>
          </div>

          <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-violet-500 text-white shadow-lg">
            <Cake className="h-8 w-8" />
          </div>

          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Hoy es un día especial
          </p>

          <h2 className="mt-2 bg-gradient-to-r from-pink-600 via-fuchsia-600 to-violet-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            ¡Feliz cumpleaños, {status.firstName}!
          </h2>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Todo el equipo te desea un año lleno de motivos para sonreír, nuevos
            sueños por cumplir y momentos muy especiales. 🥳
          </p>

          <div className="mt-8 flex flex-col-reverse items-center justify-center gap-2 sm:flex-row sm:gap-3">
            <Button
              variant="ghost"
              onClick={handleClose}
              className="rounded-full text-muted-foreground hover:text-foreground"
            >
              Cerrar
            </Button>
            <Button
              onClick={goToPost}
              className="rounded-full bg-gradient-to-r from-pink-500 to-violet-500 px-6 font-medium shadow-md hover:shadow-lg"
            >
              <PartyPopper className="mr-2 h-4 w-4" />
              Ver el post en el feed
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
