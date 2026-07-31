// app/(portal)/colaboradores/page.tsx
import { WallOfPosts } from "@/components/mainPage/main";


export default function ColaboradoresPage() {
  return (
    <div className="w-full h-full overflow-hidden">
      <h1 className="text-2xl font-semibold"></h1>
      <WallOfPosts/>
    </div>
  );
}

