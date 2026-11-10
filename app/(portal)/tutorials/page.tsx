"use client";

import { VideoModal } from "@/components/tutorials/VideoModal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getDriveThumbnail, Tutorial } from "@/lib/tutorials/drive";
import { useTutorialStore } from "@/store/tutorial-store";
import { ArrowRight, BookOpen, PlayCircle, Search, Video } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function TutorialsPage() {
  // const permissions = useModulePermissions()
  const { tutorials, isLoading, fetchTutorials } = useTutorialStore();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [selectedVideo, setSelectedVideo] = useState<Tutorial | null>(null);

  useEffect(() => {
    fetchTutorials();
  }, [fetchTutorials]);

  const categories = useMemo(() => {
    const cats = new Set(tutorials.map((t) => t.category));
    return ["Todos", ...Array.from(cats)];
  }, [tutorials]);

  // Filtrado
  const filtered = useMemo(() => {
    return tutorials.filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.description?.toLowerCase() || "").includes(search.toLowerCase());
      const matchCategory =
        activeCategory === "Todos" || t.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [tutorials, search, activeCategory]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      {/* Header */}
      <div className="mb-8 md:flex md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary mb-2">
            <BookOpen className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Centro de aprendizaje
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Tutoriales y guías<span className="text-primary">.</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Aprende a usar el portal viendo nuestros videos paso a paso.
          </p>
        </div>
      </div>

      {/* Controles */}
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tutorial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/90"
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {/* Grid de Videos */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-2xl bg-muted/10">
          <Video className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <h3 className="text-lg font-medium">No hay tutoriales disponibles</h3>
          <p className="text-sm text-muted-foreground">
            Prueba con otra búsqueda o categoría.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((tutorial) => {
            const thumbnail = getDriveThumbnail(tutorial.driveUrl);

            return (
              <Card
                key={tutorial.tutorialId}
                className="group cursor-pointer overflow-hidden border-border/60 bg-card hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 flex flex-col"
                onClick={() => setSelectedVideo(tutorial)}
              >
                <div className="relative aspect-video bg-muted flex items-center justify-center overflow-hidden">
                  {thumbnail ? (
                    <img
                      src={thumbnail}
                      alt={tutorial.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                        (
                          e.target as HTMLImageElement
                        ).nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                  ) : null}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-background flex items-center justify-center ${thumbnail ? "hidden" : ""}`}
                  >
                    <Video className="h-8 w-8 text-primary/40" />
                  </div>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors z-10" />
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="bg-white/20 backdrop-blur-md p-4 rounded-full shadow-lg group-hover:scale-110 group-hover:bg-primary transition-all duration-300">
                      <PlayCircle className="h-8 w-8 text-white" />
                    </div>
                  </div>

                  <Badge className="absolute top-3 left-3 z-20 bg-black/60 backdrop-blur-md text-white border-0 hover:bg-black/80">
                    {tutorial.category}
                  </Badge>
                </div>

                <CardContent className="p-5 flex-1 flex flex-col">
                  <h3 className="font-semibold text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                    {tutorial.title}
                  </h3>
                  {tutorial.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2 flex-1">
                      {tutorial.description}
                    </p>
                  )}
                  <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Video tutorial</span>
                    <span className="flex items-center gap-1 text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Ver ahora <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <VideoModal
        tutorial={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </div>
  );
}
