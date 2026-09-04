"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface EmbeddedFormProps {
  url: string;
  title: string;
}

export function EmbeddedForm({ url, title }: EmbeddedFormProps) {
  const [isLoading, setIsLoading] = useState(true);

  console.log("EmbeddedForm - url:", url);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" asChild>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Abrir en nueva pestaña
          </a>
        </Button>
      </div>

      <div className="relative w-full overflow-hidden rounded-lg border border-border">
        {isLoading && (
          <div className="absolute inset-0 z-10 space-y-4 bg-background p-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />

            <div className="space-y-3 pt-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>

            <Skeleton className="mt-4 h-10 w-32" />
          </div>
        )}

        <iframe
          src={url}
          title={title}
          className="w-full"
          style={{
            border: 0,
            height: "1800px",
          }}
          onLoad={() => setIsLoading(false)}
          allowFullScreen
        />
      </div>
    </div>
  );
}
