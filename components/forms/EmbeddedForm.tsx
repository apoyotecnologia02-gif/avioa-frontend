'use client'

import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface EmbeddedFormProps {
  url: string
  title: string
}

export function EmbeddedForm({ url, title }: EmbeddedFormProps) {
  const [isLoading, setIsLoading] = useState(true)

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

      <div className="relative min-h-[700px] overflow-hidden rounded-lg border border-border">
        {isLoading && (
          <div className="absolute inset-0 space-y-4 p-6">
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
          className="h-full min-h-[700px] w-full"
          onLoad={() => setIsLoading(false)}
          style={{ border: 0 }}
          allowFullScreen
        />
      </div>
    </div>
  )
}
