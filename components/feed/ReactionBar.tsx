import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { FeedPost, ReactionType } from "@/types/feed.types";
import { useFeedStore } from "@/store/feedStore";
import { REACTIONS_META, REACTIONS_ORDER } from "@/lib/feed-reactions";

interface Props {
  post: FeedPost;
}

export function ReactionBar({ post }: Props) {
  const { react, unreact } = useFeedStore();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [hoverTimer, setHoverTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [pending, setPending] = useState(false);

  const total = post.reactionsCount;
  const sorted = REACTIONS_ORDER.filter(
    (t) => (post.reactionsSummary[t] ?? 0) > 0,
  ).sort(
    (a, b) => (post.reactionsSummary[b] ?? 0) - (post.reactionsSummary[a] ?? 0),
  );
  const topThree = sorted.slice(0, 3);
  const myMeta = post.myReaction ? REACTIONS_META[post.myReaction] : null;

  const handleReact = async (type: ReactionType) => {
    if (pending) return;
    setPending(true);
    try {
      if (post.myReaction === type) await unreact(post.feedPostId);
      else await react(post.feedPostId, type);
    } finally {
      setPending(false);
      setPickerOpen(false);
    }
  };

  const openPicker = () => {
    if (hoverTimer) clearTimeout(hoverTimer);
    setPickerOpen(true);
  };
  const scheduleClose = () => {
    const t = setTimeout(() => setPickerOpen(false), 250);
    setHoverTimer(t);
  };

  const displayText =
    post.recentReactors.length === 0
      ? ""
      : post.recentReactors.length === 1
        ? post.recentReactors[0].name
        : post.recentReactors.length === 2
          ? `${post.recentReactors[0].name} y ${post.recentReactors[1].name}`
          : `${post.recentReactors[0].name}, ${post.recentReactors[1].name} y ${
              total - 2
            } más`;

  return (
    <div className="flex min-w-0 items-center gap-3">
      <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            onMouseEnter={openPicker}
            onMouseLeave={scheduleClose}
            onClick={() => handleReact(post.myReaction ?? "LIKE")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all",
              "hover:bg-muted active:scale-95",
              myMeta ? myMeta.color : "text-muted-foreground",
            )}
          >
            <span className="text-base leading-none">
              {myMeta ? myMeta.emoji : "👍"}
            </span>
            <span>{myMeta ? myMeta.label : "Reaccionar"}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="start"
          sideOffset={8}
          onMouseEnter={openPicker}
          onMouseLeave={scheduleClose}
          className="flex w-auto gap-0.5 rounded-full border border-border/60 p-1 shadow-lg"
        >
          {REACTIONS_ORDER.map((t) => {
            const meta = REACTIONS_META[t];
            const active = post.myReaction === t;
            return (
              <button
                key={t}
                type="button"
                title={meta.label}
                aria-label={meta.label}
                aria-pressed={active}
                disabled={pending}
                onClick={() => handleReact(t)}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full text-2xl transition-transform",
                  "hover:-translate-y-1 hover:scale-125",
                  active && cn(meta.bg, "ring-1 ring-inset ring-current"),
                  active && meta.color,
                )}
              >
                {meta.emoji}
              </button>
            );
          })}
        </PopoverContent>
      </Popover>

      {total > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="group flex items-center gap-1.5 rounded-full py-1 pl-0.5 pr-2.5 transition-colors hover:bg-muted"
            >
              <span className="flex -space-x-1">
                {topThree.map((t) => (
                  <span
                    key={t}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-background text-[12px] ring-2 ring-background"
                    title={REACTIONS_META[t].label}
                  >
                    {REACTIONS_META[t].emoji}
                  </span>
                ))}
              </span>
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
                {total}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" align="start" className="w-64 p-0">
            <div className="border-b border-border/60 px-3 py-2">
              <p className="text-xs font-semibold text-muted-foreground">
                Reacciones
              </p>
            </div>
            <div className="max-h-56 overflow-y-auto p-2">
              {sorted.map((t) => (
                <div
                  key={t}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5"
                >
                  <span className="text-lg">{REACTIONS_META[t].emoji}</span>
                  <span className="text-xs text-muted-foreground">
                    {post.reactionsSummary[t]} · {REACTIONS_META[t].label}
                  </span>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* {displayText && (
        <span className="hidden min-w-0 truncate text-xs text-muted-foreground sm:inline">
          {displayText} reaccionaron
        </span>
      )} */}
    </div>
  );
}
