import { z } from "zod";
import { resourceKinds } from "@/types/commercial.types";

export const resourceInput = z
  .object({
    kind: z.enum(resourceKinds),
    title: z.string().trim().min(1).max(250),
    text: z.string().max(20000).default(""),
    url: z
      .string()
      .max(2000)
      .default("")
      .refine((value) => {
        if (!value) return true;
        try {
          const u = new URL(value);
          return u.protocol === "https:" && !u.username && !u.password;
        } catch {
          return false;
        }
      }, "Usa un enlace HTTPS válido."),
    category: z.string().max(120).default(""),
    origin: z.string().max(80).default(""),
  })
  .strict();

export type ResourceInputPayload = z.infer<typeof resourceInput>;