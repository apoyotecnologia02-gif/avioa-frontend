import type { VaultData } from "./vault-crypto";
/** DTO only. Encryption and persistence run exclusively in NestJS. */
export type PasswordEntry = VaultData & {
  id: string;
  revision: number;
  updatedAt: string;
};
