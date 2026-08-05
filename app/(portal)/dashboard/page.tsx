// app/(portal)/colaboradores/page.tsx
import { WallOfPosts } from "@/components/mainPage/main";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
export default function ColaboradoresPage() {
  return (
    <ThemeProvider>
    <div className="w-full h-full overflow-hidden">
      <h1 className="text-2xl font-semibold"></h1>
      <WallOfPosts/>
    </div>
    </ThemeProvider>
  );
}
