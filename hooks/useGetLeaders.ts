"use client";

import { useState, useCallback, useEffect } from "react";
import { api } from "@/lib/axios";

export interface LeadersData {
  userId: string;
  name: string;
}

export function useGetLeaders() {
  const [requests, setRequests] = useState<LeadersData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("/admin/users/leaders");
      const data = response?.data.data || response.data || [];
      setRequests(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error al obtener las solicitudes",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return { requests, isLoading, error, reload: fetchRequests };
}
