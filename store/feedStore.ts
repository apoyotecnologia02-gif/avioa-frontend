import { api } from "@/lib/axios";
import {
  Birthday,
  CommentDeletedSocketPayload,
  CommentSocketPayload,
  FeedComment,
  FeedPost,
  ReactionSocketPayload,
  ReactionType,
} from "@/types/feed.types";
import { create } from "zustand";

interface FeedState {
  posts: FeedPost[];
  birthdays: Birthday[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  cursor: string | null;

  fetchFeed: (reset?: boolean) => Promise<void>;
  fetchMore: () => Promise<void>;
  fetchBirthdays: () => Promise<void>;

  createPost: (data: {
    content: string;
    type: string;
    images?: string[];
    recognizedUserId?: string;
  }) => Promise<void>;
  react: (postId: string, type: ReactionType) => Promise<void>;
  unreact: (postId: string) => Promise<void>;
  addComment: (
    postId: string,
    content: string,
    parentId?: string | null,
  ) => Promise<void>;
  removeComment: (postId: string, commentId: string) => Promise<void>;
  removePost: (postId: string) => Promise<void>;
  togglePin: (postId: string) => Promise<void>;

  upsertPost: (post: FeedPost) => void;
  receivePostDeleted: (postId: string) => void;
  receivePinToggled: (postId: string, pinned: boolean) => void;
  applyReactionUpdate: (
    postId: string,
    payload: ReactionSocketPayload,
    currentUserId: string,
  ) => void;
  receiveNewComment: (payload: CommentSocketPayload) => void;
  receiveCommentDeleted: (payload: CommentDeletedSocketPayload) => void;
}

// ============================================================
// Helpers
// ============================================================
const insertPostIfNew = (posts: FeedPost[], post: FeedPost): FeedPost[] =>
  posts.some((p) => p.feedPostId === post.feedPostId)
    ? posts.map((p) => (p.feedPostId === post.feedPostId ? post : p))
    : [post, ...posts];

const mergeUniquePosts = (
  existing: FeedPost[],
  incoming: FeedPost[],
): FeedPost[] => {
  const seen = new Set(existing.map((p) => p.feedPostId));
  return [...existing, ...incoming.filter((p) => !seen.has(p.feedPostId))];
};

const findComment = (
  comments: FeedComment[],
  id: string,
): FeedComment | undefined => {
  for (const c of comments) {
    if (c.feedCommentId === id) return c;
    const found = findComment(c.replies, id);
    if (found) return found;
  }
  return undefined;
};

const insertComment = (
  comments: FeedComment[],
  incoming: FeedComment,
  parentId: string | null,
): FeedComment[] => {
  if (findComment(comments, incoming.feedCommentId)) return comments;

  if (!parentId) {
    return [...comments, { ...incoming, replies: incoming.replies ?? [] }];
  }

  return comments.map((c) =>
    c.feedCommentId === parentId
      ? { ...c, replies: [...c.replies, { ...incoming, replies: [] }] }
      : { ...c, replies: insertComment(c.replies, incoming, parentId) },
  );
};

const countReplies = (comment: FeedComment): number =>
  comment.replies.reduce((sum, r) => sum + 1 + countReplies(r), 0);

const removeCommentFromTree = (
  comments: FeedComment[],
  id: string,
): { tree: FeedComment[]; removed: number } => {
  let removed = 0;

  const walk = (list: FeedComment[]): FeedComment[] =>
    list.reduce<FeedComment[]>((acc, c) => {
      if (c.feedCommentId === id) {
        removed += 1 + countReplies(c);
        return acc;
      }
      const nextReplies = walk(c.replies);
      acc.push(nextReplies === c.replies ? c : { ...c, replies: nextReplies });
      return acc;
    }, []);

  const tree = walk(comments);
  return { tree, removed };
};

const bumpSummary = (
  summary: Partial<Record<ReactionType, number>>,
  type: ReactionType,
  delta: number,
): Partial<Record<ReactionType, number>> => {
  const next = { ...summary };
  const current = next[type] ?? 0;
  const value = current + delta;
  if (value <= 0) delete next[type];
  else next[type] = value;
  return next;
};

// ============================================================
// Store
// ============================================================
export const useFeedStore = create<FeedState>((set, get) => ({
  posts: [],
  birthdays: [],
  isLoading: false,
  isLoadingMore: false,
  hasMore: true,
  cursor: null,

  // ---------------- FETCH ----------------
  fetchFeed: async (reset = false) => {
    set({ isLoading: true, ...(reset ? { cursor: null, hasMore: true } : {}) });
    try {
      const { cursor } = get();
      const url = `/feed?limit=10${!reset && cursor ? `&cursor=${cursor}` : ""}`;
      const { data } = await api.get(url, { skip401Redirect: true });

      set({
        posts: reset ? data.posts : mergeUniquePosts(get().posts, data.posts),
        hasMore: data.hasMore,
        cursor: data.nextCursor,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error cargando el feed:", error);
      set({ posts: [], hasMore: false, cursor: null, isLoading: false });
    }
  },

  fetchMore: async () => {
    const { cursor, hasMore, isLoadingMore } = get();
    if (!hasMore || isLoadingMore) return;

    set({ isLoadingMore: true });
    try {
      const url = `/feed?limit=10${cursor ? `&cursor=${cursor}` : ""}`;
      const { data } = await api.get(url, { skip401Redirect: true });

      set((state) => ({
        posts: mergeUniquePosts(state.posts, data.posts),
        hasMore: data.hasMore,
        cursor: data.nextCursor,
        isLoadingMore: false,
      }));
    } catch (error) {
      console.error("Error cargando más publicaciones:", error);
      set({ isLoadingMore: false });
    }
  },

  fetchBirthdays: async () => {
    try {
      const { data } = await api.get(`/feed/birthdays`, {
        skip401Redirect: true,
      });
      set({ birthdays: data });
    } catch (error) {
      console.error("Error cargando cumpleaños:", error);
    }
  },

  // ---------------- POSTS ----------------
  createPost: async (payload) => {
    const { data } = await api.post("/feed", payload, {
      skip401Redirect: true,
    });
    set((state) => ({ posts: insertPostIfNew(state.posts, data) }));
  },

  removePost: async (postId) => {
    const previous = get().posts;
    set((state) => ({
      posts: state.posts.filter((p) => p.feedPostId !== postId),
    }));
    try {
      await api.delete(`/feed/${postId}`, { skip401Redirect: true });
    } catch (error) {
      console.error("Error eliminando post:", error);
      set({ posts: previous });
    }
  },

  togglePin: async (postId) => {
    const previous = get().posts;
    const current = previous.find((p) => p.feedPostId === postId);
    if (!current) return;

    set((state) => ({
      posts: state.posts.map((p) =>
        p.feedPostId === postId ? { ...p, pinned: !p.pinned } : p,
      ),
    }));

    try {
      const { data } = await api.patch(
        `/feed/${postId}/pin`,
        {},
        { skip401Redirect: true },
      );
      set((state) => ({
        posts: state.posts.map((p) =>
          p.feedPostId === postId ? { ...p, pinned: data.pinned } : p,
        ),
      }));
    } catch (error) {
      console.error("Error al fijar:", error);
      set({ posts: previous });
    }
  },

  // ---------------- REACCIONES ----------------
  react: async (postId, type) => {
    const previous = get().posts.find((p) => p.feedPostId === postId);
    if (!previous) return;

    const oldReaction = previous.myReaction;

    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.feedPostId !== postId) return p;
        if (p.myReaction === type) return p;

        let summary = { ...p.reactionsSummary };
        let count = p.reactionsCount;

        if (oldReaction) {
          summary = bumpSummary(summary, oldReaction, -1);
        } else {
          count += 1;
        }
        summary = bumpSummary(summary, type, 1);

        return {
          ...p,
          myReaction: type,
          reactionsSummary: summary,
          reactionsCount: count,
        };
      }),
    }));

    try {
      await api.post(
        `/feed/${postId}/reactions`,
        { type },
        { skip401Redirect: true },
      );
    } catch (error) {
      console.error("Error al reaccionar:", error);
      set((state) => ({
        posts: state.posts.map((p) => (p.feedPostId === postId ? previous : p)),
      }));
    }
  },

  unreact: async (postId) => {
    const previous = get().posts.find((p) => p.feedPostId === postId);
    if (!previous?.myReaction) return;

    const oldReaction = previous.myReaction;

    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.feedPostId !== postId) return p;
        return {
          ...p,
          myReaction: null,
          reactionsCount: Math.max(0, p.reactionsCount - 1),
          reactionsSummary: bumpSummary(p.reactionsSummary, oldReaction, -1),
        };
      }),
    }));

    try {
      await api.delete(`/feed/${postId}/reactions`, { skip401Redirect: true });
    } catch (error) {
      console.error("Error al desreaccionar:", error);
      set((state) => ({
        posts: state.posts.map((p) => (p.feedPostId === postId ? previous : p)),
      }));
    }
  },

  // ---------------- COMENTARIOS ----------------
  addComment: async (postId, content, parentId = null) => {
    const { data } = await api.post(
      `/feed/${postId}/comments`,
      { content, parentId: parentId ?? undefined },
      { skip401Redirect: true },
    );

    const incoming: FeedComment = { ...data, replies: data.replies ?? [] };

    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.feedPostId !== postId) return p;
        return {
          ...p,
          comments: insertComment(p.comments, incoming, parentId),
          commentsCount: p.commentsCount + 1,
        };
      }),
    }));
  },

  removeComment: async (postId, commentId) => {
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.feedPostId !== postId) return p;
        const { tree, removed } = removeCommentFromTree(p.comments, commentId);
        return {
          ...p,
          comments: tree,
          commentsCount: Math.max(0, p.commentsCount - removed),
        };
      }),
    }));

    try {
      await api.delete(`/feed/comments/${commentId}`, {
        skip401Redirect: true,
      });
    } catch (error) {
      console.error("Error eliminando comentario:", error);
      get().fetchFeed(true);
    }
  },

  // ---------------- SOCKETS ----------------
  upsertPost: (post) =>
    set((state) => {
      const exists = state.posts.some((p) => p.feedPostId === post.feedPostId);
      if (exists) {
        return {
          posts: state.posts.map((p) =>
            p.feedPostId === post.feedPostId ? post : p,
          ),
        };
      }
      return { posts: [post, ...state.posts] };
    }),

  receivePostDeleted: (postId) =>
    set((state) => ({
      posts: state.posts.filter((p) => p.feedPostId !== postId),
    })),

  receivePinToggled: (postId, pinned) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.feedPostId === postId ? { ...p, pinned } : p,
      ),
    })),

  applyReactionUpdate: (postId, payload, currentUserId) =>
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.feedPostId !== postId) return p;
        return {
          ...p,
          reactionsCount: payload.reactionsCount,
          reactionsSummary: payload.reactionsSummary,
          recentReactors: payload.recentReactors,
          myReaction: payload.reactionsByUser[currentUserId] ?? null,
        };
      }),
    })),

  receiveNewComment: ({ postId, comment, commentsCount, parentId }) =>
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.feedPostId !== postId) return p;
        const incoming: FeedComment = {
          ...comment,
          replies: comment.replies ?? [],
        };
        return {
          ...p,
          comments: insertComment(p.comments, incoming, parentId),
          commentsCount,
        };
      }),
    })),

  receiveCommentDeleted: ({ postId, commentId, commentsCount }) =>
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.feedPostId !== postId) return p;
        const { tree } = removeCommentFromTree(p.comments, commentId);
        return { ...p, comments: tree, commentsCount };
      }),
    })),
}));
