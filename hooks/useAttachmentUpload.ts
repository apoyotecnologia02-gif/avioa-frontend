"use client";

import { presignAttachments } from "@/lib/feed-api";
import {
  detectAttachmentType,
  MAX_ATTACHMENTS,
  validateFile,
} from "@/lib/feed-attachments";
import { CreateAttachmentInput, FeedAttachmentType } from "@/types/feed.types";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

export interface PendingAttachment {
  id: string;
  file: File;
  type: FeedAttachmentType;
  previewUrl?: string;
  status: "uploading" | "done" | "error";
  progress: number;
  storageKey?: string;
  width?: number;
  height?: number;
  error?: string;
}

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(35).slice(2);

async function getImageDimensions(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function putToSignedUrl(
  url: string,
  file: File,
  onProgress: (p: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream",
    );
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable)
        onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload falló (${xhr.status})`));
    xhr.onerror = () => reject(new Error("Error de red al subir el archivo"));
    xhr.send(file);
  });
}

export function useAttachmentUpload() {
  const [items, setItems] = useState<PendingAttachment[]>([]);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const update = useCallback(
    (id: string, patch: Partial<PendingAttachment>) => {
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, ...patch } : it)),
      );
    },
    [],
  );

  const uploadOne = useCallback(
    async (item: PendingAttachment) => {
      try {
        let width: number | undefined;
        let height: number | undefined;
        if (item.type === "IMAGE") {
          try {
            const dims = await getImageDimensions(item.file);
            width = dims.width;
            height = dims.height;
          } catch {
            /* no bloquea */
          }
        }

        const [signed] = await presignAttachments([
          {
            type: item.type,
            fileName: item.file.name,
            mimeType: item.file.type || "application/octet-stream",
            sizeBytes: item.file.size,
          },
        ]);

        await putToSignedUrl(signed.uploadUrl, item.file, (p) =>
          update(item.id, { progress: p }),
        );

        update(item.id, {
          status: "done",
          progress: 100,
          storageKey: signed.key,
          width,
          height,
        });
      } catch (err) {
        console.error(err);
        update(item.id, {
          status: "error",
          error: err instanceof Error ? err.message : "Error al subir",
        });
      }
    },
    [update],
  );

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const incoming = Array.from(files);

      setItems((prev) => {
        const slots = MAX_ATTACHMENTS - prev.length;
        if (slots <= 0) {
          toast.error(`Máximo ${MAX_ATTACHMENTS} adjuntos`);
          return prev;
        }

        const accepted: PendingAttachment[] = [];
        for (const f of incoming.slice(0, slots)) {
          const err = validateFile(f);
          if (err) {
            toast.error(err);
            continue;
          }
          const type = detectAttachmentType(f)!;
          accepted.push({
            id: uid(),
            file: f,
            type,
            previewUrl: type === "IMAGE" ? URL.createObjectURL(f) : undefined,
            status: "uploading",
            progress: 0,
          });
        }

        accepted.forEach((it) => void uploadOne(it));
        return [...prev, ...accepted];
      });
    },
    [uploadOne],
  );

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const reset = useCallback(() => {
    setItems((prev) => {
      prev.forEach((i) => i.previewUrl && URL.revokeObjectURL(i.previewUrl));
      return [];
    });
  }, []);

  const isUploading = items.some((i) => i.status === "uploading");
  const hasErrors = items.some((i) => i.status === "error");

  const toPayload = useCallback((): CreateAttachmentInput[] => {
    if (isUploading)
      throw new Error("Esperá a que terminen de subirse los archivos");
    if (hasErrors)
      throw new Error("Hay archivos con error. Eliminalos y volvé a intentar");

    return itemsRef.current
      .filter((i) => i.status === "done" && i.storageKey)
      .map((i) => ({
        type: i.type,
        storageKey: i.storageKey!,
        fileName: i.file.name,
        mimeType: i.file.type || "application/octet-stream",
        sizeBytes: i.file.size,
        width: i.width,
        height: i.height,
      }));
  }, [isUploading, hasErrors]);

  return { items, addFiles, remove, reset, toPayload, isUploading, hasErrors };
}
