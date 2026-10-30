export const resourceKinds = [
  "offer",
  "video",
  "reply",
  "protocol",
  "rate",
  "operator",
  "document",
] as const;

export type ResourceKind = (typeof resourceKinds)[number];

export interface CommercialResource {
  id: string;
  kind: ResourceKind;
  title: string;
  text: string;
  url: string;
  category: string;
  origin: string;
  updatedAt: string;
  example?: boolean;
}

export type ResourceInput = Omit<
  CommercialResource,
  "id" | "updatedAt" | "example"
>;

export interface CommercialRepository {
  list(): Promise<CommercialResource[]>;
  save(input: ResourceInput, id?: string): Promise<CommercialResource>;
  remove(id: string): Promise<void>;
}