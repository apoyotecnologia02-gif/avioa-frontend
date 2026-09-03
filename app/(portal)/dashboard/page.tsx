// app/(portal)/colaboradores/page.tsx
import { FeedList } from "@/components/feed/FeedList";
import { WallOfPosts } from "@/components/mainPage/main";
export default function Dashboard() {
  return (
    <>
      {/* <div className="w-full h-full overflow-hidden bg-background">
      <h1 className="text-2xl font-semibold"></h1>
      <WallOfPosts/>
    </div> */}
      <FeedList />
    </>
  );
}
