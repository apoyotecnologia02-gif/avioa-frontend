import { formatBytes } from "@/lib/feed-attachments";
import { cn } from "@/lib/utils";
import { FeedAttachment } from "@/types/feed.types";
import { Download, FileIcon } from "lucide-react";
import { useState } from "react";

interface Props {
  attachments: FeedAttachment[];
}

export function FeedPostAttachments({ attachments }: Props) {
  if (!attachments.length) return null;

  const images = attachments.filter((a) => a.type === "IMAGE");
  const files = attachments.filter((a) => a.type === "FILE");

  return (
    <div className="space-y-3">
      {images.length > 0 && <ImageGrid images={images} />}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f) => (
            <FileRow key={f.feedAttachmentId} file={f} />
          ))}
        </div>
      )}
    </div>
  );
}

function ImageGrid({ images }: { images: FeedAttachment[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const gridClass = cn(
    "grid gap-1.5 overflow-hidden rounded-xl",
    images.length === 1 && "grid-cols-1",
    images.length === 2 && "grid-cols-2",
    images.length === 3 && "grid-cols-3",
    images.length >= 4 && "grid-cols-2",
  );

  return (
    <>
      <div className={gridClass}>
        {images.map((img, i) => (
          <button
            key={img.feedAttachmentId}
            type="button"
            onClick={() => setOpenIdx(i)}
            className={cn(
              "relative overflow-hidden bg-muted",
              images.length === 1 ? "aspect-vide" : "aspect-square",
            )}
          >
            <img
              src={img.url}
              alt={img.fileName}
              loading="lazy"
              className="h-full w-full object-cover transition-transform hover:scale-[1.02]"
            />
          </button>
        ))}
      </div>

      {openIdx !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpenIdx(null)}
        >
          <img
            src={images[openIdx].url}
            alt={images[openIdx].fileName}
            className="max-h-full max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

function FileRow({ file }: { file: FeedAttachment }) {
  return (
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      download={file.fileName}
      className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-3 transition-colors hover:bg-muted/60"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background">
        <FileIcon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{file.fileName}</p>
        <p className="text-xs text-muted-foreground">
          {formatBytes(file.sizeBytes)}
        </p>
      </div>
      <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
    </a>
  );
}
