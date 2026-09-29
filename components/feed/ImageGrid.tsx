import { cn } from "@/lib/utils";

export function ImageGrid({ images }: { images: string[] }) {
  if (!images.length) return null;
  const count = images.length;

  return (
    <div
      className={cn(
        "mt-4 grid gap-1.5 overflow-hidden rounded-xl",
        count === 1 && "grid-cols-1",
        count === 2 && "grid-cols-2",
        count === 3 && "grid-cols-2 grid-rows-2",
        count >= 4 && "grid-cols-2 grid-rows-2",
      )}
    >
      {images.slice(0, 4).map((src, i) => (
        <div
          key={i}
          className={cn(
            "relative overflow-hidden bg-muted",
            count === 1 && "aspect-[16/10]",
            count === 2 && "aspect-square",
            count === 3 && i === 0 && "row-span-2",
            count >= 4 && "aspect-square",
          )}
        >
          <img
            src={src}
            alt=""
            className="h-full w-full object-cover transition-transform hover:scale-[1.02]"
            loading="lazy"
          />
          {count > 4 && i === 3 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-lg font-semibold text-white">
              +{count - 4}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
