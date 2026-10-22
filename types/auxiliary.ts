import type { HotelVoucher } from "@/lib/auxiliary/domain/aux-voucher";
import type { TransferVoucher } from "@/lib/auxiliary/domain/aux-transfer";
import type { TransferRequestData } from "@/lib/auxiliary/domain/transfer-requests";
import type { FlightItinerary } from "@/lib/auxiliary/domain/flight-itinerary";
import type { QuickReply } from "@/lib/auxiliary/domain/auxiliary-quick-import";
export type AuxiliaryKind =
  | "hotel"
  | "transfer"
  | "request"
  | "flight"
  | "reply";
export type AuxiliaryPayload =
  | HotelVoucher
  | TransferVoucher
  | TransferRequestData
  | FlightItinerary
  | QuickReply;
export type Asset = {
  id: string;
  name: string;
  type: "image/png" | "image/jpeg";
  size: number;
};
export type AuxiliaryRecord = {
  auxiliaryRecordId: string;
  kind: AuxiliaryKind;
  reference: string;
  payload: AuxiliaryPayload;
  assets: Asset[];
  state: "ready" | "pending" | "manual" | "confirmed";
  revision: number;
  updatedAt: string;
  archivedAt: string | null;
};
export type SaveInput = {
  id: string;
  kind: AuxiliaryKind;
  payload: AuxiliaryPayload;
  revision: number;
  assets: Asset[];
  state: AuxiliaryRecord["state"];
};
export type AuxiliaryPermissions = {
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};
export interface AuxiliaryRepository {
  list(): Promise<AuxiliaryRecord[]>;
  save(input: SaveInput, files: File[]): Promise<AuxiliaryRecord>;
  archive(id: string, revision: number, restore?: boolean): Promise<void>;
}
