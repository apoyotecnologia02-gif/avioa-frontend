import { FeedAttachmentType } from "@/types/feed.types";
import { api } from "./axios";

export interface PresignInput {
  type: FeedAttachmentType;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

export interface PresignedUpload {
  uploadUrl: string;
  token: string;
  key: string;
  type: FeedAttachmentType;
  fileName: string;
  mimeType: string;
}

export async function presignAttachments(items: PresignInput[]) {
  const { data } = await api.post<PresignedUpload[]>(
    "/feed/attachments/presign",
    items,
  );

  return data;
}
