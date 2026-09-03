// hooks/useUpdateForm.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Cookies from "js-cookie";

// hooks/useUpdateForm.ts
export function useUpdateForm() {
  return useMutation({
    mutationFn: async ({ formId, data }: { formId: string; data: any }) => {
      const token = Cookies.get("portal_access_token") || localStorage.getItem("token");
      
     
      const backendUrl = `http://localhost:3001/api/v1/forms/${formId}`;
      console.log(` PUT directo a: ${backendUrl}`);

      const response = await fetch(backendUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Error ${response.status}: ${text}`);
      }

      return response.json();
    },
    // ...
  });
}
