import { api } from "@/lib/axios";

export type JsonPrimitive = string | number | boolean | null;

export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { [key: string]: JsonValue };

export type JsonObject = Record<string, JsonValue>;

export interface OfferRecord extends JsonObject {
  id: string;
}

export interface OffersPayload extends JsonObject {
  version: number;
  offers: OfferRecord[];
  removedPilotIds: string[];
  productoDefaults: JsonObject | null;
  workbookImports: string[] | null;
}

export interface OffersSession {
  userId: string;
  email: string;
  role: "editor" | "approver";
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canApprove: boolean;
}

export interface OffersWorkspaceSnapshot {
  id: 1;
  revision: number;
  payload: OffersPayload;
  updatedAt: string;
}

export interface OffersHistoryEntry {
  revision: number;
  actor: string;
  actorId: string;
  action: string;
  createdAt: string;
  payload: OffersPayload;
  summary: string;
}

export interface SaveOffersPayloadRequest {
  expectedRevision: number;
  payload: OffersPayload;
}

export const offersManagerNativeApi = {
  async getSession(): Promise<OffersSession> {
    const { data } = await api.get<OffersSession>(
      "/offers-manager/native/session",
    );

    return data;
  },

  async getState(): Promise<OffersWorkspaceSnapshot> {
    const { data } = await api.get<OffersWorkspaceSnapshot>(
      "/offers-manager/native/state",
    );

    return data;
  },

  async getHistory(): Promise<OffersHistoryEntry[]> {
    const { data } = await api.get<OffersHistoryEntry[]>(
      "/offers-manager/native/history",
    );

    return data;
  },

  async getHistoryRevision(revision: number): Promise<OffersHistoryEntry> {
    const { data } = await api.get<OffersHistoryEntry>(
      `/offers-manager/native/history/${revision}`,
    );

    return data;
  },

  async saveState(
    request: SaveOffersPayloadRequest,
  ): Promise<OffersWorkspaceSnapshot> {
    const { data } = await api.put<OffersWorkspaceSnapshot>(
      "/offers-manager/native/state",
      request,
    );

    return data;
  },
};
