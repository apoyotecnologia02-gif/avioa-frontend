"use client";

import { useFeedStore } from "@/store/feedStore";
import { useCallback, useEffect, useRef } from "react";
import { Skeleton } from "../ui/skeleton";
import { CreatePostBox } from "./CreatePostBox";
import { BirthdaysWidget } from "./BirthdayWidget";
import { PostCard } from "./PostCard";
import { BirthdaysSidebar } from "./BirthdaysSidebar";
import { useFeedSocket } from "@/hooks/useFeedSocket";

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
    birthdays,
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
    // <div className="mx-auto grid max-w-4xl grid-cols-1 gap-5 py-6 lg:grid-cols-[minmax(0,1fr)_260px]">
    //   <div className="flex min-w-0 flex-col gap-4">
    //     <CreatePostBox />

    //     {isLoading ? (
    //       <FeedSkeleton />
    //     ) : posts.length === 0 ? (
    //       <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
    //         Todavía no hay publicaciones en el feed.
    //       </div>
    //     ) : (
    //       <>
    //         {posts.map((post) => (
    //           <PostCard key={post.feedPostId} post={post} />
    //         ))}
    //         <div ref={observerTarget} className="h-4">
    //           {isLoadingMore && <FeedSkeleton count={1} />}
    //         </div>
    //       </>
    //     )}
    //   </div>

    //   <BirthdaysSidebar />
    // </div>
    <div className="mx-auto max-w-5xl px-4 py-8 lg:grid lg:grid-cols-[1fr_280px] lg:gap-8">
      <div className="flex min-w-0 flex-col gap-6">
        <CreatePostBox />

        {isLoading ? (
          <FeedSkeleton />
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/10 p-10 text-center">
            <p className="text-sm text-muted-foreground">
              ✨ Todavía no hay publicaciones. ¡Sé el primero en compartir algo!
            </p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard key={post.feedPostId} post={post} />
            ))}
            <div>{isLoadingMore && <FeedSkeleton count={1} />}</div>
          </>
        )}
      </div>

      <BirthdaysSidebar />
    </div>
  );
}

function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="space-y-4 rounded-2xl border border-border/50 bg-card/50 p-5"
        >
          <div className="flex items-center gap-4">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-6 pt-2">
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-6 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}
