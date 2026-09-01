// app/(portal)/colaboradores/page.tsx
import { UsersInfo } from "@/components/users/UsersInfo";


export default function ColaboradoresPage() {
  return (
    <div className="w-full h-full min-h-0">
      <h1 className="text-2xl font-semibold">Directorio</h1>
      <UsersInfo/>
    </div>
  );
}

