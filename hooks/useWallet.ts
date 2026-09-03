import { api } from "@/lib/axios";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface Wallet {
  total: number;
}

export function useWallet() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadWallet = useCallback(async () => {
    try {
      setIsLoading(true);

      const res = await api.get<Wallet>("/points/wallet", {
        skip401Redirect: true,
        headers: {
          authorization: `${localStorage.getItem("portal_access_token")}`,
        },
      });

      setWallet(res.data);
    } catch (error: any) {
      console.error("Error loading wallet:", error);
      toast.error(
        error?.response?.data?.message || "Error al cargar el monedero",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  return {
    wallet,
    isLoading,
    reload: loadWallet,
  };
}
