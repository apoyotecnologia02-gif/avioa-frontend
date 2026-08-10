export interface VaultItem {
  passwordVaultId: string;
  title: string;
  username?: string;
  email?: string;
  website?: string;
  notes?: string;
  favorite: boolean;
  categoryId?: string;
  strengthLevel?: "VERY_WEAK" | "WEAK" | "MEDIUM" | "STRONG" | "VERY_STRONG";
  expiresAt?: string;
  category?: { name: string; color?: string };
  tags?: { tag: { name: string } }[];
}

export interface CreateVaultDto {
  title: string;
  username?: string;
  email?: string;
  password: string;
  website?: string;
  notes?: string;
  categoryId?: string;
  expiresAt?: string;
  tagIds?: string[];
}

export interface GeneratorOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeSimilar: boolean;
}

export interface DashboardSummary {
  total: number;
  shared: number;
  expiringSoon: number;
  weak: number;
  uncategorized: number;
  duplicates: number;
}
