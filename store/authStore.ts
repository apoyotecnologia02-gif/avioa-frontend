"use client";

import { create } from "zustand";
import type {
  AuthState,
  LoginCredentials,
  User,
  LoginResponse,
} from "@/types/auth.types";
import {
  api,
  setSession,
  ACCESS_KEY,
  REFRESH_KEY,
  USER_KEY,
} from "@/lib/axios";

export const TOKEN_KEY = "portal_access_token";
// export const USER_KEY = "portal_user";

function setAuthCookie(token: string | null) {
  if (typeof document === "undefined") return;
  if (token) {
    document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  } else {
    document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}

function decodeJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  const payload = decodeJwt(token);
  if (!payload || !payload.exp) return true;
  return payload.exp * 1000 < Date.now();
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (credentials: LoginCredentials) => {
    const response = await api.post<LoginResponse>("/auth/login", credentials);
    const { accessToken, user, refreshToken } = response.data;

    if (!refreshToken) {
      console.error("El backend no devolvió un refresh token");
    }

    const payload = decodeJwt(accessToken);
    let fullUser = {
      ...user,
      ...(payload?.area && { area: payload.area }),
      ...(payload?.leaderId && { leaderId: payload.leaderId }),
      ...(payload?.leaderName && { leaderName: payload.leaderName }),
    };

    // if (payload && payload.area) {
    //   fullUser.area = payload.area;
    // }

    // if (payload && payload.leaderId) {
    //   fullUser.leaderId = payload.leaderId;
    // }

    // if (payload && payload.leaderName) {
    //   fullUser.leaderName = payload.leaderName;
    // }

    setSession(accessToken, refreshToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(fullUser));
    // localStorage.setItem("portal_refresh_token", refreshToken);
    // setAuthCookie(accessToken);

    set({
      user: fullUser,
      token: accessToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: async () => {
    // await api.post("/auth/logout");
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAuthCookie(null);

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
    set({ user });
  },

  setToken: (token: string | null) => {
    setAuthCookie(token);
    set({ token, isAuthenticated: !!token });
  },

  hydrate: () => {
    if (typeof window === "undefined") {
      set({ isLoading: false });
      return;
    }

    const token = localStorage.getItem(TOKEN_KEY);
    const userJson = localStorage.getItem(USER_KEY);

    if (token && userJson) {
      if (isTokenExpired(token)) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setAuthCookie(null);
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }

      try {
        let user = JSON.parse(userJson) as User;

        const payload = decodeJwt(token);
        if (payload && payload.area && !user.area) {
          user.area = payload.area;
          localStorage.setItem(USER_KEY, JSON.stringify(user));
        }

        setAuthCookie(token);
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setAuthCookie(null);
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } else {
      set({ isLoading: false });
    }
  },
}));
