import { Area } from "./user.types";

export type UserRole = "employee" | "manager" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  area: Area;
  leaderId?: string;
  leaderName?: string;
  avatarUrl?: string;
  twoFactorEnabled: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email?: string;
  password: string;
  documentNumber?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  temporaryToken?: string;
  twoFactorEnabled?: boolean;
  mustChangePassword?: boolean;
}

export interface Login2FAResponse {
  twoFactorEnabled?: boolean;
  temporaryToken?: string;
  mustChangePassword?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<Login2FAResponse>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setAuth: (accessToken: string, refreshToken: string, user: User) => void;
  refreshAccessToken: () => boolean | Promise<boolean>;
  hydrate: () => void;
}
