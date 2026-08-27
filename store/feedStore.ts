import { api } from "@/lib/axios";
import { Birthday, FeedPost } from "@/types/feed.types";
import { create } from "zustand";

interface FeedState {
  posts: FeedPost[];
  birthdays: Birthday[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  page: number;
  cursor: string | null;

  fetchFeed: () => Promise<void>;
  fetchMore: () => Promise<void>;
  fetchBirthdays: () => Promise<void>;
  createPost: (data: {
    content: string;
    type: string;
    images?: string[];
    recognizedUserId?: string;
  }) => Promise<void>;
  react: (postId: string, type: string) => Promise<void>;
  unreact: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  removeComment: (postId: string, content: string) => Promise<void>;
  removePost: (postId: string) => Promise<void>;
  togglePin: (postId: string) => Promise<void>;

  // socket
  receiveNewPost: (post: FeedPost) => void;
  receivePostDeleted: (postId: string) => void;
  receivePinToggled: (postId: string, pinned: boolean) => void;
  receiveReaction: (postId: string, reactionsCount: number) => void;
  receiveNewComment: (
    postId: string,
    comment: FeedPost["comments"][number],
    commentsCount: number,
  ) => void;
  receiveCommentDeleted: (
    postId: string,
    commentId: string,
    commentsCount: number,
  ) => void;
}

const insertPostIfNew = (posts: FeedPost[], post: FeedPost): FeedPost[] => {
  if (posts.some((p) => p.feedPostId === post.feedPostId)) return posts;
  return [post, ...posts];
};

const addCommentIfNew = (
  comments: FeedPost["comments"],
  comment: FeedPost["comments"][number],
): FeedPost["comments"] => {
  if (comments.some((c) => c.feedCommentId === comment.feedCommentId))
    return comments;
  return [...comments, comment];
};

const mergeUniquePosts = (
  existing: FeedPost[],
  incoming: FeedPost[],
): FeedPost[] => {
  const seen = new Set(existing.map((p) => p.feedPostId));
  const uniqueIncoming = incoming.filter((p) => !seen.has(p.feedPostId));
  return [...existing, ...uniqueIncoming];
};

export const useFeedStore = create<FeedState>((set, get) => ({
  posts: [],
  birthdays: [],
  isLoading: false,
  isLoadingMore: false,
  hasMore: true,
  page: 1,
  cursor: null,

  fetchFeed: async (reset = false) => {
    set({ isLoading: true });
    const page = reset ? 1 : get().page;
    try {
      const { data } = await api.get(`/feed?limit=10`, {
        skip401Redirect: true,
      });
      // set((state) => ({
      //   posts: reset ? data.posts : [...state.posts, ...data.posts],
      //   hasMore: data.hasMore,
      //   page: page + 1,
      //   isLoading: false,
      // }));
      set({
        posts: data.posts,
        hasMore: data.hasMore,
        cursor: data.nextCursor,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error cargando el feed:", error);
      // set({ isLoading: false });
      set({ posts: [], hasMore: false, cursor: null, isLoading: false });
    }
  },

  fetchMore: async () => {
    const { cursor, hasMore, isLoadingMore } = get();
    if (!hasMore || isLoadingMore) return;

    set({ isLoadingMore: true });
    try {
      // const { data } = await api.get(`/feed?page=${page}&limit=10`);
      const { data } = await api.get(
        `/feed?limit=10${cursor ? `&cursor=${cursor}` : ""}}`,
        {
          skip401Redirect: true,
        },
      );
      set((state) => ({
        // posts: [...state.posts, ...data.posts],
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

  togglePin: async (postId) => {
    const { data } = await api.patch(`/feed/${postId}/pin`, {
      skip401Redirect: true,
    });
    set((state) => ({
      posts: state.posts.map((p) =>
        p.feedPostId === postId ? { ...p, pinned: data.pinned } : p,
      ),
    }));
  },

  createPost: async (payload) => {
    const { data } = await api.post("/feed", payload, {
      skip401Redirect: true,
    });
    set((state) => ({ posts: insertPostIfNew(state.posts, data) }));
  },

  react: async (postId, type) => {
    const prev = get().posts;

    set((state) => ({
      posts: state.posts.map((p) =>
        p.feedPostId === postId
          ? {
              ...p,
              reactionsCount: p.myReaction
                ? p.reactionsCount
                : p.reactionsCount + 1,
            }
          : p,
      ),
    }));

    try {
      await api.post(
        `/feed/${postId}/reactions`,
        { type },
        { skip401Redirect: true },
      );
    } catch (error) {
      console.error("Error al reaccionar:", error);
      set({ posts: prev });
    }
  },

  unreact: async (postId) => {
    const prev = get().posts;
    set((state) => ({
      posts: state.posts.map((p) =>
        p.feedPostId === postId
          ? {
              ...p,
              reactionsCount: Math.max(0, p.reactionsCount - 1),
              myReaction: null,
            }
          : p,
      ),
    }));

    try {
      await api.delete(`/feed/${postId}/reactions`, { skip401Redirect: true });
    } catch (error) {
      console.error("Error al desreaccionar:", error);
      set({ posts: prev });
    }
  },

  addComment: async (postId, content) => {
    const { data } = await api.post(
      `/feed/${postId}/comments`,
      { content },
      { skip401Redirect: true },
    );
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.feedPostId !== postId) return p;

        if (p.comments.some((c) => c.feedCommentId === data.feedCommentId)) {
          return p;
        }

        return {
          ...p,
          comments: [...p.comments, data],
          commentsCount: p.commentsCount + 1,
        };
      }),
    }));
  },

  removeComment: async (postId, commentId) => {
    await api.delete(`/feed/comments/${commentId}`, { skip401Redirect: true });
    set((state) => ({
      posts: state.posts.map((p) =>
        p.feedPostId === postId
          ? {
              ...p,
              comments: p.comments.filter((c) => c.feedCommentId !== commentId),
              commentsCount: Math.max(0, p.commentsCount - 1),
            }
          : p,
      ),
    }));
  },

  removePost: async (postId) => {
    await api.delete(`/feed/${postId}`, { skip401Redirect: true });
    set((state) => ({
      posts: state.posts.filter((p) => p.feedPostId !== postId),
    }));
  },

  receiveNewPost: (post) =>
    set((state) => ({ posts: insertPostIfNew(state.posts, post) })),

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

  receiveReaction: (postId, reactionsCount) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.feedPostId === postId ? { ...p, reactionsCount } : p,
      ),
    })),

  receiveNewComment: (postId, comment, commentsCount) =>
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.feedPostId !== postId) return p;
        if (p.comments.some((c) => c.feedCommentId === comment.feedCommentId))
          return p;
        return {
          ...p,
          comments: [...p.comments, comment],
          commentsCount,
        };
      }),
    })),

  receiveCommentDeleted: (postId, commentId, commentsCount) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.feedPostId === postId
          ? {
              ...p,
              comments: p.comments.filter((c) => c.feedCommentId !== commentId),
              commentsCount,
            }
          : p,
      ),
    })),
}));
