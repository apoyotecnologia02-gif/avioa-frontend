export type FlightArrival = 'after' | 'before' | 'unknown' | 'manual';
export type ArrivalFilter = FlightArrival | 'all';
export type ReviewState = 'new' | 'changed' | 'reviewed';
export type InboxFilter = ReviewState | 'pending' | 'all';
export type Tab = 'inventory' | 'reservations' | 'paymentAlerts' | 'dataAlerts' | 'history' | 'setup';
export type TaskKind = 'payment' | 'names';
export type InventoryMode = 'remaining' | 'total';

export interface PublicDriveBalance {
  available: number;
  price: number;
  inventoryMode?: InventoryMode;
}
export interface DriveBalance extends PublicDriveBalance {
  at: string;
  checkedAt?: string;
  prior: Record<string, number>;
  row: number;
  adjustedAt?: string;
  adjustedBy?: string;
  adjustmentReason?: string;
}
export interface BlockData {
  deletedAt?: string;
  source?: 'manual';
  drive?: DriveBalance;
  code: string;
  title: string;
  departDate: string;
  returnDate: string;
  departTime: string;
  returnTime: string;
  origin: string;
  destination: string;
  flight: string;
  capacity: number | null;
  notes: string;
  aliases: string[];
}
export interface PublicBlock extends Omit<BlockData, 'drive'> {
  drive?: PublicDriveBalance;
  id: string;
  sold: number;
  netSold: number;
  available: number | null;
  oversold: boolean;
  inventoryUnresolved: number;
}
export interface InventoryIssue { avi: string; reason: string }
export interface AdminBlock extends PublicBlock {
  drive?: DriveBalance;
  revision: number;
  inventoryIssues?: InventoryIssue[];
  unresolved: number;
  reservations: number;
  paidAt: string | null;
  paidBy: string | null;
  namesAt: string | null;
  namesBy: string | null;
  namesComplete: boolean;
  paymentDue: string;
  namesDue: string;
  paymentAlert: boolean;
  namesAlert: boolean;
  signature: string;
}
export type Block = PublicBlock | AdminBlock;
export interface PassengerSplit { code: string; passengers: number; note: string }
export interface Service {
  id: string;
  avi: string;
  reference: string;
  references?: string[];
  passenger: string;
  advisor: string;
  date: string;
  returnDate: string;
  origin: string;
  destination: string;
  flight: string;
  time: string;
  seats: number | null;
  status: string;
  sourceAt?: string;
  source?: 'manual';
  deletedAt?: string;
  blockId: string | null;
  reason: string;
  cancelled: boolean;
  confirmed: boolean;
  sourceSignature: string;
  arrivalGroup: FlightArrival;
  arrivalCreatedAt: string;
  splits: PassengerSplit[];
  splitSignature: string;
  splitReady: boolean;
  splitRevision: string;
  splitStale: boolean;
  splitRemaining: number | null;
  splitBy: string | null;
  splitAt: string | null;
  reviewKey: string;
  reviewSignature: string;
  reviewState: ReviewState;
  reviewBlocked: boolean;
  reviewedAt: string | null;
  reviewedBy: string | null;
}
export interface Alert { blockId: string; kind: TaskKind; due: string }
export interface Attachment {
  id: string; blockId: string; kind: TaskKind;
  name: string; at: string; by: string;
}
export interface BlockingEvent {
  id: string; blockId: string | null; serviceId: string | null;
  action: string; data: string; by: string; at: string;
}
export interface BlockReference extends BlockData {
  id: string; suggestedSeats: string; snapshotAt: string;
}
export interface Board {
  admin: boolean;
  edit: boolean;
  integrationAt?: string;
  today: string;
  blocks: Block[];
  services: Service[];
  unmatched: Service[];
  references: BlockReference[];
  alerts: Alert[];
  files: Attachment[];
  events: BlockingEvent[];
  drive: { checkedAt: string; source: string; error: string | null };
  sync: {
    configured: boolean; lastSuccess: string | null;
    pending: boolean; error: string | null;
  };
}
export interface BlockEditData extends BlockData {
  id?: string; revision?: number; suggestedSeats?: string;
}
export interface ManualReservationInput {
  requestId: string; blockId: string; reference: string;
  passenger: string; advisor: string; seats: number;
}
export interface InventoryAdjustment {
  mode: InventoryMode; quantity: number; reason: string;
}
export interface InventoryDraft {
  mode: InventoryMode; quantityText: string; reason: string;
}
export interface LinkDraft { blockId: string; seatsText: string }
export interface ManualReservationDraft extends Omit<ManualReservationInput, 'blockId' | 'seats'> {
  blockId: string | null;
  seatsText: string;
}
export type EditorState =
  | { kind: 'closed' }
  | { kind: 'block'; data: BlockEditData; capacityText: string; aliasesText: string }
  | { kind: 'inventory'; data: AdminBlock; draft: InventoryDraft }
  | { kind: 'link'; service: Service; draft: LinkDraft }
  | { kind: 'split'; service: Service; rows: PassengerSplit[] }
  | { kind: 'manual'; requestId: string; blockId: string; draft: ManualReservationDraft };
export interface Confirmation { title: string; message: string }
export interface Filters {
  search: string; allDates: boolean; selected: string | null;
  destination: string; nights: string; arrival: ArrivalFilter;
  inbox: InboxFilter; related: boolean; reviewOnly: boolean;
}
export interface ReviewCounts {
  pending: number; new: number; changed: number; reviewed: number;
}
export type FlightBlockingAction =
  | { action: 'saveBlock'; data: BlockData; id?: string; revision?: number }
  | { action: 'deleteBlock'; blockId: string; revision: number }
  | ({ action: 'addManualReservation' } & ManualReservationInput)
  | { action: 'deleteManualReservation'; serviceId: string; signature: string }
  | { action: 'link'; serviceId: string; blockId: string; seats: number | null; signature: string }
  | { action: 'splitReservation'; serviceId: string; signature: string; revision: string; splits: PassengerSplit[] }
  | { action: 'reviewReservation'; reviewKey: string; signature: string }
  | ({ action: 'adjustDriveInventory'; blockId: string; revision: number; inventorySignature: string } & InventoryAdjustment)
  | { action: 'complete' | 'reopen'; kind: TaskKind; blockId: string; revision: number; signature: string; previousPaymentConfirmed: boolean; previousDataDeliveryConfirmed: boolean }
  | { action: 'importBlocks'; rows: BlockData[] };
export interface MutationResponse { ok: boolean; imported?: number }
export interface ApiError { error: string }
export interface UseFlightBlockingsOptions {
  control?: boolean;
  endpoint?: string;
  filesEndpoint?: string;
  refreshIntervalMs?: number;
  inventoryPath?: string;
  controlPath?: string;
  navigate?: (url: string) => void;
}
