import { api } from "@/lib/axios";
import { ACCESS_KEY } from "@/utils/constants";
import type { AuxiliaryRepository, AuxiliaryRecord } from "@/types/auxiliary";

export function createAuxiliaryRepository(): AuxiliaryRepository {
  return {
    list: async () =>
      (await api.get<AuxiliaryRecord[]>("/auxiliary/records")).data,
    save: async (input, files) => {
      const form = new FormData();
      form.set("payload", JSON.stringify(input));
      for (const file of files) form.append("images", file);
      return (
        await (input.revision
          ? api.put<AuxiliaryRecord>("/auxiliary/records/" + input.id, form)
          : api.post<AuxiliaryRecord>("/auxiliary/records", form))
      ).data;
    },
    archive: async (id, revision, restore) => {
      await api.patch("/auxiliary/records/" + id, { revision, restore });
    },
  };
}

export async function downloadAuxiliaryPdf(
  id: string,
  filename = `avioa-${id}.pdf`,
): Promise<void> {
  const response = await api.get(`/auxiliary/records/${id}/pdf`, {
    responseType: "blob",
  });

  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export const auxiliaryPdfUrl = (id: string) =>
  "/auxiliary/records/" + id + "/pdf";
export const auxiliaryImageUrl = (id: string, fileId: string) =>
  "/auxiliary/records/" + id + "/files/" + fileId;
