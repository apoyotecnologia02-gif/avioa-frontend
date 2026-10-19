"use client";

import { useFlightFilters } from "@/hooks/useFlightFilters";
import { FilterFields } from "./FilterFields";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { Filter } from "lucide-react";

export function FilterPanelDesktop() {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-4 rounded-2xl border bg-card p-4">
        <h2 className="mb-4 text-sm font-semibold">Filtros</h2>
        <FilterFields />
      </div>
    </aside>
  );
}

export function FilterPanelMobile() {
  const { activeCount } = useFlightFilters();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="lg:hidden">
          <Filter className="mr-2 h-4 w-4" />
          Filtros
          {activeCount > 0 && (
            <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Filtros</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <FilterFields />
        </div>
      </SheetContent>
    </Sheet>
  );
}
