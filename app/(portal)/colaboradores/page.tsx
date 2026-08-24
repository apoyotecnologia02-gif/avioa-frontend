// app/(portal)/colaboradores/page.tsx
import { UsersInfo } from "@/components/users/UsersInfo";


export default function ColaboradoresPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Directorio</h1>
      <UsersInfo/>
    </div>
  );
}

