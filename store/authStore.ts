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
  // ACCESS_KEY,
  // REFRESH_KEY,
  // USER_KEY,
} from "@/lib/axios";
import router from "next/router";
import { REFRESH_KEY, USER_KEY } from "@/utils/constants";

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

    const {
      accessToken,
      user,
      refreshToken,
      temporaryToken,
      mustChangePassword,
      twoFactorEnabled,
    } = response.data;

    if (mustChangePassword) {
      return {
        mustChangePassword: true,
        twoFactorEnabled,
        temporaryToken,
      };
    }

    if (twoFactorEnabled) {
      return {
        mustChangePassword: false,
        twoFactorEnabled: true,
        temporaryToken: temporaryToken,
      };
    }

    if (!accessToken || !refreshToken || !user) {
      console.error("El backend no devolvió un refresh token");
    }

    get().setAuth(accessToken, refreshToken, user);

    return {
      mustChangePassword: false,
      twoFactorEnabled: false,
    };
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

  refreshAccessToken: async () => {
    const refreshToken = localStorage.getItem(REFRESH_KEY);

    if (!refreshToken) {
      get().logout();
      return false;
    }

    try {
      const response = await api.post("/auth/refresh", {
        refreshToken,
      });

      const {
        accessToken,
        refreshToken: newRefreshToken,
        user,
      } = response.data;

      localStorage.setItem(TOKEN_KEY, accessToken);

      if (newRefreshToken) {
        localStorage.setItem(REFRESH_KEY, newRefreshToken);
      }

      get().setAuth(accessToken, newRefreshToken, user);
      return true;
    } catch (error) {
      get().logout();
      return false;
    }
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

  setAuth: (accessToken: string, refreshToken: string, user: User) => {
    const payload = decodeJwt(accessToken);

    // const fullUser = {
    //   ...user,
    //   ...(payload?.area && { area: payload.area }),
    //   ...(payload?.leaderId && { leaderId: payload.leaderId }),
    //   ...(payload?.leaderName && { leaderName: payload.leaderName }),
    //   ...(payload?.twoFactorEnabled && {
    //     twoFactorEnabled: payload.twoFactorEnabled,
    //   }),
    // };

    const fullUser = {
      ...user,

      ...(payload?.area && {
        area: payload.area,
      }),

      ...(payload?.leaderId && {
        leaderId: payload.leaderId,
      }),

      ...(payload?.leaderName && {
        leaderName: payload.leaderName,
      }),

      ...(payload?.twoFactorEnabled && {
        twoFactorEnabled: payload.twoFactorEnabled,
      }),

      ...(payload?.role && {
        role: payload.role,
      }),
    };

    setSession(accessToken, refreshToken);

    localStorage.setItem(REFRESH_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(fullUser));

    set({
      user: fullUser,
      token: accessToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  hydrate: async () => {
    if (typeof window === "undefined") {
      set({ isLoading: false });
      return;
    }

    const token = localStorage.getItem(TOKEN_KEY);
    const userJson = localStorage.getItem(USER_KEY);

    if (token && userJson) {
      if (isTokenExpired(token)) {
        const refreshed = await get().refreshAccessToken();
        if (refreshed === false) {
          return;
        }

        set({ isLoading: false });
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
        set({ user, token, isAuthenticated: true, isLoading: false });
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
