export type FeedPostType =
  | "PUBLICATION"
  | "RECOGNITION"
  | "ANNOUNCEMENT"
  | "BIRTHDAY";

export type ReactionType =
  | "LIKE"
  | "LOVE"
  | "CELEBRATE"
  | "SUPPORT"
  | "INSIGHTFUL";

export interface FeedAuthor {
  userId: string;
  name: string;
  avatarUrl: string | null;
  role: string;
}

export interface FeedComment {
  feedCommentId: string;
  content: string;
  author: FeedAuthor;
  parentId: string | null;
  replies: FeedComment[];
  createdAt: string;
}

export interface FeedPost {
  feedPostId: string;
  type: FeedPostType;
  content: string;
  images: string[];
  pinned: boolean;
  author: FeedAuthor;
  recognizedUser: FeedAuthor | null;
  reactionsCount: number;
  reactionsSummary: Partial<Record<ReactionType, number>>;
  recentReactors: FeedAuthor[];
  myReaction: ReactionType | null;
  comments: FeedComment[];
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Birthday {
  userId: string;
  name: string;
  avatarUrl: string | null;
  birthDay: number;
  birthMonth: number;
}

export interface ReactionSocketPayload {
  reactionsCount: number;
  reactionsSummary: Partial<Record<ReactionType, number>>;
  recentReactors: FeedAuthor[];
  reactionsByUser: Record<string, ReactionType>;
}

export interface CommentSocketPayload {
  postId: string;
  comment: FeedComment;
  commentsCount: number;
  parentId: string | null;
}

export interface CommentDeletedSocketPayload {
  postId: string;
  commentId: string;
  parentId: string | null;
  commentsCount: number;
}
