"use client";

import { useAuthStore } from "@/store/authStore";
import { useFeedStore } from "@/store/feedStore";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

export function useFeedSocket() {
  const token = useAuthStore((s) => s.token);
  const socketRef = useRef<Socket | null>(null);

  const {
    receiveNewPost,
    receivePostDeleted,
    receivePinToggled,
    receiveReaction,
    receiveNewComment,
    receiveCommentDeleted,
  } = useFeedStore();

  useEffect(() => {
    if (!token) return;

    const socket = io(`${SOCKET_URL}/feed`, {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect_error", (err) => {
      console.error("Error de conexión al feed socket:", err.message);
    });

    socket.on("feed:post:new", receiveNewPost);
    socket.on("feed:post:deleted", ({ postId }) => receivePostDeleted(postId));
    socket.on("feed:post:pinned", ({ postId, pinned }) =>
      receivePinToggled(postId, pinned),
    );
    socket.on(
      "feed:post:reaction",
      ({ postId, reactionsCount, reactionCount, total }) => {
        const count = reactionsCount ?? reactionCount ?? total;
        if (typeof postId === "string" && typeof count === "number") {
          receiveReaction(postId, count);
        }
      },
    );
    socket.on("feed:comment:new", ({ postId, comment, commentsCount }) =>
      receiveNewComment(postId, comment, commentsCount),
    );
    socket.on("feed:comment:deleted", ({ postId, commentId, commentsCount }) =>
      receiveCommentDeleted(postId, commentId, commentsCount),
    );

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [
    token,
    receiveNewPost,
    receivePostDeleted,
    receivePinToggled,
    receiveReaction,
    receiveNewComment,
    receiveCommentDeleted,
  ]);
}
