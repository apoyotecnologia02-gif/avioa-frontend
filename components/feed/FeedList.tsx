"use client";

import { useCallback, useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { useFeedSocket } from "@/hooks/useFeedSocket";
import { useFeedStore } from "@/store/feedStore";
import { CreatePostBox } from "./CreatePostBox";
import { BirthdaysSidebar } from "./BirthdaysSidebar";
import { FeedSkeleton } from "./FeedSkeleton";
import { PostCard } from "./PostCard";

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
    <div className="mx-auto grid max-w-5xl grid-cols-1 items-start gap-6 px-3 pb-8 sm:px-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-8">
      <div className="order-1 min-w-0 lg:order-none lg:col-start-1 lg:row-start-1">
        <CreatePostBox />
      </div>

      <div className="order-2 min-w-0 lg:order-none lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-6 lg:self-start">
        <BirthdaysSidebar />
      </div>

      <div className="order-3 flex min-w-0 flex-col gap-5 lg:order-none lg:col-start-1 lg:row-start-2">
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
      </div>
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
