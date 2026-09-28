import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import type {
  CommentDeletedSocketPayload,
  CommentSocketPayload,
  FeedPost,
  ReactionSocketPayload,
} from "@/types/feed.types";
import { useAuthStore } from "@/store/authStore";
import { useFeedStore } from "@/store/feedStore";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

export function useFeedSocket() {
  const token = useAuthStore((s) => s.token);
  const currentUserId = useAuthStore(
    (s) => s.user?.userId ?? (s.user as { id?: string } | null)?.id,
  );
  const socketRef = useRef<Socket | null>(null);

  const {
    upsertPost,
    receivePostDeleted,
    receivePinToggled,
    applyReactionUpdate,
    receiveNewComment,
    receiveCommentDeleted,
  } = useFeedStore();

  useEffect(() => {
    if (!token || !currentUserId) {
      return;
    }

    const socket = io(`${SOCKET_URL}/feed`, {
      auth: { token },
      transports: ["websocket"],
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 8000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.debug("[feed:socket] connected", socket.id);
      }
    });

    socket.on("connect_error", (err) => {
      // eslint-disable-next-line no-console
      console.error("[feed:socket] connect_error:", err.message);
    });

    socket.on("feed:post:new", (post: FeedPost) => {
      console.log("[feed:socket] NUEVO POST RECIBIDOew", post);
      upsertPost(post);
    });
    socket.on("feed:post:updated", (post: FeedPost) => upsertPost(post));
    socket.on("feed:post:deleted", ({ postId }: { postId: string }) =>
      receivePostDeleted(postId),
    );
    socket.on(
      "feed:post:pinned",
      ({ postId, pinned }: { postId: string; pinned: boolean }) =>
        receivePinToggled(postId, pinned),
    );

    socket.on(
      "feed:post:reaction",
      (payload: ReactionSocketPayload & { postId: string }) => {
        if (!payload?.postId) return;
        applyReactionUpdate(
          payload.postId,
          {
            reactionsCount: payload.reactionsCount ?? 0,
            reactionsSummary: payload.reactionsSummary ?? {},
            recentReactors: payload.recentReactors ?? [],
            reactionsByUser: payload.reactionsByUser ?? {},
          },
          currentUserId,
        );
      },
    );

    socket.on("feed:comment:new", (payload: CommentSocketPayload) => {
      if (!payload?.postId || !payload?.comment) return;
      receiveNewComment(payload);
    });

    socket.on(
      "feed:comment:deleted",
      (payload: CommentDeletedSocketPayload) => {
        if (!payload?.postId || !payload?.commentId) return;
        receiveCommentDeleted(payload);
      },
    );

    return () => {
      socket.off("feed:post:new");
      socket.off("feed:post:updated");
      socket.off("feed:post:deleted");
      socket.off("feed:post:pinned");
      socket.off("feed:post:reaction");
      socket.off("feed:comment:new");
      socket.off("feed:comment:deleted");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [
    token,
    currentUserId,
    upsertPost,
    receivePostDeleted,
    receivePinToggled,
    applyReactionUpdate,
    receiveNewComment,
    receiveCommentDeleted,
  ]);
}
