"use client";
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
//import {TOKEN_KEY} from "@/store/authStore"

export const ACCESS_KEY = "portal_access_token";
export const REFRESH_KEY = "portal_refresh_token";
export const USER_KEY = "portal_user";

declare module "axios" {
  interface AxiosRequestConfig {
    skip401Redirect?: boolean;
    _retry?: boolean;
  }
}

// const baseURL = process.env.NEXT_PUBLIC_API_URL || '/api/v1'
const baseURL = "/api";

type BackendErrorPayload = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
  path?: string;
  timestamp?: string;
};

function getBackendErrorMessage(error: AxiosError): string | null {
  const data = error.response?.data as BackendErrorPayload | undefined;

  if (!data) return null;

  if (Array.isArray(data.message) && data.message.length > 0) {
    return data.message.join(", ");
  }

  if (typeof data.message === "string" && data.message.trim().length > 0) {
    return data.message;
  }

  if (typeof data.error === "string" && data.error.trim().length > 0) {
    return data.error;
  }

  return null;
}

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export function setSession(accessToken: string, refreshToken?: string) {
  localStorage.setItem(ACCESS_KEY, accessToken);
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${ACCESS_KEY}=${accessToken}; path=/; SameSite=Lax${secure}`;

  if (refreshToken) {
    localStorage.setItem(REFRESH_KEY, refreshToken);
    document.cookie = `${REFRESH_KEY}=${refreshToken}; path=/; SameSite=Lax${secure}`;
  }
}

export function clearSession() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = `${ACCESS_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  document.cookie = `${REFRESH_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

function redirectToLogin() {
  clearSession();
  if (
    typeof window !== "undefined" &&
    !window.location.pathname.startsWith("/login")
  ) {
    window.location.href = "/login";
  }
}

let refreshPromise: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  const p = (async () => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_KEY);
      if (!refreshToken) throw new Error("Missing refresh token");

      const { data } = await axios.post(`${baseURL}/auth/refresh`, {
        refreshToken,
      });
      if (!data?.access_token) throw new Error("Refresh sin access_token");

      if (data.refresh_token) {
        localStorage.setItem(REFRESH_KEY, data.refresh_token);
      }
      setSession(data.access_token, data.refresh_token);
      return data.access_token as string;
    } finally {
      refreshPromise = null;
    }
  })();

  refreshPromise = p;
  return p;
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("portal_access_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// Response interceptor for 401 handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const backendMessage = getBackendErrorMessage(error);
    if (backendMessage) {
      error.message = backendMessage;
    }

    const original = error.config as InternalAxiosRequestConfig | undefined;
    const status = error.response?.status;

    if ((status !== 401 && typeof window === "undefined") || !original) {
      return Promise.reject(error);
    }

    const url = original.url ?? "";
    const isAuthRoute =
      url.includes("/auth/login") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/logout") ||
      url.includes("/auth/forgot-password");

    if (isAuthRoute) {
      if (url.includes("/auth/refresh")) redirectToLogin();
      return Promise.reject(error);
    }

    if (original.skip401Redirect) {
      return Promise.reject(error);
    }

    if (original._retry) {
      redirectToLogin();
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      const newToken = await refreshAccessToken();
      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch {
      redirectToLogin();
      return Promise.reject(error);
    }
  },
);
