import { FeedAttachmentType } from "@/types/feed.types";

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
export const MAX_FILE_SIZE = 25 * 1024 * 1024;
export const MAX_ATTACHMENTS = 10;

export const IMAGE_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
];

export const FILE_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "text/plain",
];

export function detectAttachmentType(file: File): FeedAttachmentType | null {
  if (IMAGE_MIME.includes(file.type)) return "IMAGE";
  if (FILE_MIME.includes(file.type)) return "FILE";
  return null;
}

export function validateFile(file: File): string | null {
  const type = detectAttachmentType(file);
  if (!type) return `Formato no permitido: ${file.type || "desconocido"}`;
  const max = type === "IMAGE" ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;

  if (file.size > max) {
    return `El archivo "${file.name}" supera el máximo de ${Math.round(max / 1024 / 1024)} MB`;
  }

  return null;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
