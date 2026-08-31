import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/axios";

export interface DashboardSummary {
  total: number;
  shared: number;
  expiringSoon: number;
  weak: number;
  uncategorized: number;
  duplicates: number;
}

export function useVaultDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get<DashboardSummary>(
        "/password-vault/dashboard",
        { skip401Redirect: true },
      );
      setSummary(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { summary, isLoading, reload };
}
