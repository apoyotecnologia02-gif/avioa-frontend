export interface FeedPostAuthor {
  userId: string;
  name: string;
  avatarUrl?: string;
  role: string;
}

export interface FeedComment {
  feedCommentId: string;
  postId: string;
  content: string;
  author: FeedPostAuthor;
  createdAt: string;
}

export enum FeedPostType {
  PUBLICATION = "PUBLICATION",
  RECOGNITION = "RECOGNITION",
  ANNOUNCEMENT = "ANNOUNCEMENT",
}

export enum ReactionType {
  LIKE = "LIKE",
  CELEBRATE = "CELEBRATE",
  SUPPORT = "SUPPORT",
  LOVE = "LOVE",
}

export interface FeedPost {
  feedPostId: string;
  type: "PUBLICATION" | "RECOGNITION" | "ANNOUNCEMENT";
  content: string;
  images: string[];
  author: FeedPostAuthor;
  recognizedUser?: FeedPostAuthor;
  pinned: boolean;
  reactionsCount: number;
  myReaction?: "LIKE" | "CELEBRATE" | "SUPPORT" | "LOVE" | null;
  comments: FeedComment[];
  commentsCount: number;
  createdAt: string;
}

export interface Birthday {
  userId: string;
  name: string;
  avatarUrl: string | null;
  birthDay: number;
  birthMonth: number;
}
