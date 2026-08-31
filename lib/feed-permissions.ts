import { FeedPost, FeedPostType } from "@/types/feed.types";
import { User } from "@/types/auth.types";

interface CurrentUser {
  id: string;
  role: string;
  canPublishInFeed?: boolean;
}

export function canPublish(user?: CurrentUser | null): boolean {
  if (!user) return false;
  return (
    user.role === "ADMIN" ||
    user.role === "LEADER" ||
    user.canPublishInFeed === true
  );
}

export function canPublishType(
  user: CurrentUser | null | undefined,
  type: FeedPostType,
): boolean {
  if (!canPublish(user)) return false;
  if (type === "ANNOUNCEMENT") return user?.role === "ADMIN";
  return true;
}

export function canManagePost(
  user: CurrentUser | null | undefined,
  authorId: string,
): boolean {
  if (!user) return false;
  return user.id === authorId || user.role === "ADMIN";
}
