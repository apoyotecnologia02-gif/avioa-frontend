"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { api, clearSession } from "@/lib/axios";

export function useAuth() {
  const router = useRouter();
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hydrate,
    setUser,
  } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const handleLogout = async () => {
    // await api.post("/auth/logout");
    // localStorage.removeItem("portal_access_token");
    // localStorage.removeItem("portal_user");
    // document.cookie =
    //   "portal_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    // logout();
    // router.push("/login");
    try {
      await api.post("/auth/logout");
    } catch {
    } finally {
      clearSession();
      logout();
      router.push("/login");
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout: handleLogout,
    setUser,
  };
}
