"use client";

import { useCallback, useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { useFeedSocket } from "@/hooks/useFeedSocket";
import { useFeedStore } from "@/store/feedStore";
import { CreatePostBox } from "./CreatePostBox";
import { BirthdaysSidebar } from "./BirthdaysSidebar";
import { FeedSkeleton } from "./FeedSkeleton";
import { PostCard } from "./PostCard";
import { FeedQuickActions } from "./FeedQuickActions";
import { FeedQuickActionsMobile } from "./FeedQuickActionsMobile";
import { cn } from "@/lib/utils";

const scrollbarStyles = `
  [&::-webkit-scrollbar]:w-1.5
  [&::-webkit-scrollbar]:h-1.5
  [&::-webkit-scrollbar-track]:bg-muted/20
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-muted-foreground/25
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/40
  dark:[&::-webkit-scrollbar-track]:bg-muted/15
  dark:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30
  dark:[&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/50
  scrollbar-width:thin
  scrollbar-color:hsl(var(--muted-foreground)/0.25) transparent
`;

export function FeedList() {
  useFeedSocket();

  const {
    posts,
    isLoading,
    isLoadingMore,
    hasMore,
    fetchMore,
    fetchFeed,
    fetchBirthdays,
  } = useFeedStore();

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchFeed();
    fetchBirthdays();
  }, [fetchFeed, fetchBirthdays]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
        fetchMore();
      }
    },
    [hasMore, isLoadingMore, fetchMore],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.5,
    });
    const target = observerTarget.current;
    if (target) observer.observe(target);
    return () => {
      if (target) observer.unobserve(target);
    };
  }, [handleObserver]);

  return (
    <div className="w-full h-full overflow-hidden">
      <div className="h-full w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-4 lg:gap-6 h-full min-h-0">

          {/* ===== COLUMNA IZQUIERDA — FEED ===== */}
          <main
            className={cn(
              "min-w-0 min-h-0 h-full flex flex-col gap-4 overflow-y-auto pr-1 pb-4",
              scrollbarStyles,
            )}
          >
            <CreatePostBox />

            {isLoading ? (
              <FeedSkeleton />
            ) : posts.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {posts.map((post) => (
                  <PostCard key={post.feedPostId} post={post} />
                ))}
                <div ref={observerTarget} className="h-2" />
                {isLoadingMore && <FeedSkeleton count={1} />}
                {!hasMore && posts.length > 3 && (
                  <p className="py-4 text-center text-xs text-muted-foreground">
                    Has llegado al final del feed ✨
                  </p>
                )}
              </>
            )}
          </main>

          {/* ===== COLUMNA DERECHA — Cumpleaños (top) + Acciones (bottom) ===== */}
          <aside className="hidden lg:grid min-w-0 min-h-0 h-full grid-rows-2 gap-4 lg:gap-6">
            <div className="min-h-0 overflow-hidden">
              <BirthdaysSidebar />
            </div>
            <div className="min-h-0 overflow-hidden">
              <FeedQuickActions />
            </div>
          </aside>

        </div>
      </div>
      <FeedQuickActionsMobile />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/60 bg-muted/10 p-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Sparkles className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold">Todavía no hay publicaciones</h3>
      <p className="mt-1 max-w-xs text-xs text-muted-foreground">
        Sé la primera persona en compartir algo con el equipo.
      </p>
    </div>
  );
}