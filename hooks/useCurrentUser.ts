// hooks/useCurrentUser.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import Cookies from "js-cookie";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  // ... otros campos
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      try {

        const accessToken = Cookies.get("portal_access_token");
        const refreshToken = Cookies.get("portal_refresh_token");
        
        console.log("🔍 Access Token:", accessToken ? "Presente" : "No presente");
        console.log("🔍 Refresh Token:", refreshToken ? "Presente" : "No presente");

        // Si no hay token, intentar obtenerlo del localStorage como fallback
        const token = accessToken || localStorage.getItem("token");

        if (!token) {
          console.warn("No se encontró token de autenticación");
          return null;
        }


        try {
          // El token JWT tiene 3 partes: header.payload.signature
          const parts = token.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            console.log("Payload del token:", payload);
            
            // Mapear el rol según la estructura del token
            const role = payload.role || payload.rol || payload.userRole || payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
            
            return {
              id: payload.sub || payload.id || payload.userId || payload.user_id,
              name: payload.name || payload.username || payload.email || "Usuario",
              email: payload.email || payload.emailAddress || "",
              role: role || "EMPLOYEE",
            };
          }
        } catch (decodeError) {
          console.error(" Error decodificando token:", decodeError);
        }

        // Si no se puede decodificar, hacer una petición al backend
        const response = await api.get<User>("/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        console.log("Usuario obtenido del backend:", response.data);
        return response.data;
      } catch (error) {
        console.error(" Error obteniendo usuario:", error);
        
        // Intentar obtener el usuario desde el refresh token
        try {
          const refreshToken = Cookies.get("portal_refresh_token");
          if (refreshToken) {
            const response = await api.post("/auth/refresh", {
              refreshToken,
            });
            
            if (response.data?.user) {
              return response.data.user;
            }
          }
        } catch (refreshError) {
          console.error("Error refrescando token:", refreshError);
        }
        
        return null;
      }
    },
    // Reintentar si falla
    retry: 1,
    // No ejecutar en el servidor
    enabled: typeof window !== "undefined",
    // Refrescar cada 5 minutos
    refetchInterval: 5 * 60 * 1000,
  });
}