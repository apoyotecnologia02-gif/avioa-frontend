'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, FileText, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useForms } from '@/hooks/useForms'
import type { FormCategory } from '@/types/form.types'

const categories: (FormCategory | 'Todos')[] = ['Todos', 'RRHH', 'Operaciones', 'Finanzas', 'General']

const categoryColors: Record<FormCategory, string> = {
  RRHH: 'bg-blue-100 text-blue-700',
  Operaciones: 'bg-amber-100 text-amber-700',
  Finanzas: 'bg-green-100 text-green-700',
  General: 'bg-gray-100 text-gray-700',
}

export default function FormsPage() {
  const { data: forms, isLoading, error } = useForms()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<FormCategory | 'Todos'>('Todos')

  const filteredForms = useMemo(() => {
    if (!forms) return []
    
    return forms.filter((form) => {
      const matchesSearch = form.title.toLowerCase().includes(search.toLowerCase()) ||
        form.description.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = activeCategory === 'Todos' || form.category === activeCategory
      return matchesSearch && matchesCategory
    })
  }, [forms, search, activeCategory])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Formularios</h1>
        <p className="text-muted-foreground">
          Selecciona un formulario para completar o visualizar
        </p>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar formularios..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs
          value={activeCategory}
          onValueChange={(value) => setActiveCategory(value as FormCategory | 'Todos')}
        >
          <TabsList>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="text-xs sm:text-sm">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-20" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="py-8 text-center">
            <p className="text-destructive">Error al cargar los formularios.</p>
            <p className="text-sm text-muted-foreground">
              Por favor, intenta de nuevo más tarde.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Forms grid */}
      {!isLoading && !error && (
        <>
          {filteredForms.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">No se encontraron formularios</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {search
                    ? 'Intenta con otros términos de búsqueda'
                    : 'No hay formularios disponibles en esta categoría'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredForms.map((form) => (
                <Card key={form.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          categoryColors[form.category]
                        }`}
                      >
                        {form.category}
                      </span>
                    </div>
                    <CardTitle className="mt-3 text-base">{form.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {form.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="mt-auto pt-0">
                    <Button asChild className="w-full">
                      <Link href={`/forms/${form.id}`}>
                        {form.type === 'embedded' && (
                          <ExternalLink className="mr-2 h-4 w-4" />
                        )}
                        Abrir
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
