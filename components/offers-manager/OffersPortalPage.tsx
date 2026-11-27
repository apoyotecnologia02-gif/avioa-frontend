"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent } from "../ui/card";
import { OffersWorkspace } from "./OffersWorkspace";
import { Badge } from "../ui/badge";
import { BookOpen, Layers3, Plane, Sparkles } from "lucide-react";
import { OffersNativeReadOnly } from "./OffersNativeReadOnly";

export function OffersPortalPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab =
    searchParams.get("tab") === "catalogo" ? "catalogo" : "ofertas";

  const handleTabChange = (value: string) => {
    router.replace(`${pathname}?tab=${value}`, { scroll: false });
  };

  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-6 p-4 md:p-6 lg:p-8">
      {/* Encabezado */}
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-background p-6 md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1.5">
                <Sparkles className="size-3.5" />
                Espacio de Producto
              </Badge>
              <span className="text-xs text-muted-foreground">
                Gestión comercial
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Ofertas y Catálogo de Cazador
              </h1>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
                Administra las ofertas de viaje y consulta el catálogo de
                Cazador desde un mismo espacio de trabajo.
              </p>
            </div>
          </div>

          <div className="hidden shrink-0 items-center justify-center rounded-2xl border bg-background/70 p-5 shadow-sm md:flex">
            <div className="flex -space-x-3">
              <div className="flex size-14 items-center justify-center rounded-xl border bg-background shadow-sm">
                <Plane className="size-7 text-primary" />
              </div>
              <div className="flex size-14 items-center justify-center rounded-xl border bg-background shadow-sm">
                <BookOpen className="size-7 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Selector de módulos */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            Espacio de trabajo
          </h2>
          <p className="text-sm text-muted-foreground">
            Selecciona el módulo que deseas utilizar.
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid h-auto w-full grid-cols-2 rounded-xl border bg-muted/50 p-1.5 md:w-[440px]">
            <TabsTrigger
              value="ofertas"
              className="min-h-14 gap-2 rounded-lg px-3 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Plane className="size-4 shrink-0" />
              <span className="text-sm font-semibold">Ofertas</span>
            </TabsTrigger>

            <TabsTrigger
              value="catalogo"
              className="min-h-14 gap-2 rounded-lg px-3 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <BookOpen className="size-4 shrink-0" />
              <span className="text-sm font-semibold">Catálogo de Cazador</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ofertas" className="mt-5 space-y-4">
            <Card className="overflow-hidden border-border/70 shadow-sm">
              <CardContent className="p-0">
                <div className="flex flex-col gap-2 border-b bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                      <Plane className="size-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Gestión de ofertas</h3>
                      <p className="text-xs text-muted-foreground">
                        Administra y consulta las ofertas de viaje.
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">Módulo de ofertas</Badge>
                </div>

                <div className="p-3 md:p-5">
                  {/* <OffersWorkspace view="offers" /> */}
                  <OffersNativeReadOnly />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="catalogo" className="mt-5 space-y-4">
            <Card className="overflow-hidden border-border/70 shadow-sm">
              <CardContent className="p-0">
                <div className="flex flex-col gap-2 border-b bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                      <Layers3 className="size-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Catálogo de Cazador</h3>
                      <p className="text-xs text-muted-foreground">
                        Consulta y administra el catálogo de productos.
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">Módulo de catálogo</Badge>
                </div>

                <div className="p-3 md:p-5">
                  <OffersWorkspace view="catalogo" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
}
