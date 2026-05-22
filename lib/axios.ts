"use client";
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

declare module "axios" {
  interface AxiosRequestConfig {
    /** Si es true, un 401 no borra la sesión ni redirige al login (errores de negocio / proxy). */
    skip401Redirect?: boolean;
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
  (error: AxiosError) => {
    const backendMessage = getBackendErrorMessage(error);
    if (backendMessage) {
      error.message = backendMessage;
    }

    if (error.response?.status === 401 && !error.config?.skip401Redirect) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("portal_access_token");
        localStorage.removeItem("portal_user");
        document.cookie =
          "portal_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);
