// "use client";

// import { useMemo, useState } from "react";
// import { useModulePermission } from "@/hooks/useModulePermission";
// import {
//   useCommercialResources,
//   useCreateCommercialResource,
//   useUpdateCommercialResource,
//   useDeleteCommercialResource,
// } from "@/hooks/useCommercialResources";
// import { copyCommercialText } from "@/lib/commercial/clipboard";
// import { toast } from "sonner";
// import { KIND_META } from "../constants";
// import { CatalogToolbar } from "./CatalogToolbar";
// import { ResourceCard } from "./ResourceCard";
// import { ResourceFormModal } from "./ResourceFormModal";
// import { ResourceDetailModal } from "./ResourceDetailModal";
// import { DeleteResourceModal } from "./DeleteResourceModal";
// import { EmptyState } from "./EmptyState";
// import type {
//   CommercialResource,
//   ResourceInput,
//   ResourceKind,
// } from "@/types/commercial.types";

// interface CommercialCatalogProps {
//   kind: ResourceKind;
//   title?: string;
//   subtitle?: string;
// }

// export function CommercialCatalog({
//   kind,
//   title,
//   subtitle,
// }: CommercialCatalogProps) {
//   const permissions = useModulePermission("COMMERCIAL");
//   const meta = KIND_META[kind];

//   const [query, setQuery] = useState("");
//   const [formOpen, setFormOpen] = useState(false);
//   const [editing, setEditing] = useState<CommercialResource | null>(null);
//   const [detail, setDetail] = useState<CommercialResource | null>(null);
//   const [deleting, setDeleting] = useState<CommercialResource | null>(null);

//   const { data = [], isLoading, isError, error, refetch, isFetching } =
//     useCommercialResources(kind);
//   const createMutation = useCreateCommercialResource();
//   const updateMutation = useUpdateCommercialResource();
//   const deleteMutation = useDeleteCommercialResource();

//   if (!permissions.canAccess) {
//     return (
//       <div className="flex h-full items-center justify-center p-4">
//         <p className="text-muted-foreground">
//           No tienes acceso al módulo Comercial.
//         </p>
//       </div>
//     );
//   }

//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     if (!q) return data;
//     return data.filter((r) =>
//       `${r.title} ${r.text} ${r.category} ${r.origin}`.toLowerCase().includes(q),
//     );
//   }, [data, query]);

//   function handleCreate() {
//     setEditing(null);
//     setFormOpen(true);
//   }

//   function handleEdit(r: CommercialResource) {
//     setEditing(r);
//     setFormOpen(true);
//   }

//   async function handleSubmit(input: ResourceInput) {
//     if (editing) {
//       await updateMutation.mutateAsync({ id: editing.id, input });
//     } else {
//       await createMutation.mutateAsync(input);
//     }
//   }

//   async function handleDelete() {
//     if (!deleting) return;
//     await deleteMutation.mutateAsync(deleting.id);
//     setDeleting(null);
//   }

//   async function handleCopy(text: string) {
//     try {
//       await copyCommercialText(text);
//       toast.success("Texto copiado");
//     } catch {
//       toast.error("No se pudo copiar el texto");
//     }
//   // 

//   return (
//     <div className="flex h-full w-full flex-col gap-4">
//       <div>
//         <h1 className="text-2xl font-semibold">{title ?? meta.pluralLabel}</h1>
//         <p className="mt-1 text-sm text-muted-foreground">
//           {subtitle ?? meta.description}
//         </p>
//       </div>

//       <CatalogToolbar
//         kind={kind}
//         query={query}
//         onQueryChange={setQuery}
//         onRefresh={() => void refetch()}
//         onCreate={handleCreate}
//         canCreate={permissions.canCreate}
//         isRefreshing={isFetching && !isLoading}
//       />

//       {isLoading ? (
//         <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
//           {Array.from({ length: 6 }).map((_, i) => (
//             <div
//               key={i}
//               className="h-56 animate-pulse rounded-lg border border-border bg-muted/30"
//             />
//           ))}
//         </div>
//       ) : isError ? (
//         <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
//           Error al cargar recursos: {error?.message ?? "desconocido"}.
//           <button
//             onClick={() => void refetch()}
//             className="ml-2 underline hover:no-underline"
//           >
//             Reintentar
//           </button>
//         </div>
//       ) : filtered.length === 0 ? (
//         <EmptyState
//           title={
//             query
//               ? "Sin resultados para tu búsqueda"
//               : `Este espacio está listo para ${meta.pluralLabel.toLowerCase()}`
//           }
//           description={
//             query
//               ? "Prueba con otras palabras o limpia el filtro."
//               : `Agrega el primer recurso de tipo ${meta.label.toLowerCase()}.`
//           }
//           actionLabel={
//             !query && permissions.canCreate ? "Agregar recurso" : undefined
//           }
//           onAction={!query && permissions.canCreate ? handleCreate : undefined}
//         />
//       ) : (
//         <>
//           <p className="text-xs text-muted-foreground">
//             {filtered.length} recurso{filtered.length === 1 ? "" : "s"}
//             {query ? " (filtrados)" : ""}
//           </p>
//           <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
//             {filtered.map((r) => (
//               <ResourceCard
//                 key={r.id}
//                 resource={r}
//                 canUpdate={permissions.canUpdate}
//                 canDelete={permissions.canDelete}
//                 onView={() => setDetail(r)}
//                 onCopy={() =>
//                   void handleCopy(
//                     `${r.title}\n\n${r.text}${r.url ? `\n\n${r.url}` : ""}`,
//                   )
//                 }
//                 onEdit={() => handleEdit(r)}
//                 onDelete={() => setDeleting(r)}
//               />
//             ))}
//           </div>
//         </>
//       )}

//       <ResourceFormModal
//         open={formOpen}
//         onOpenChange={setFormOpen}
//         kind={kind}
//         editing={editing}
//         onSubmit={handleSubmit}
//         isSubmitting={createMutation.isPending || updateMutation.isPending}
//       />

//       <ResourceDetailModal
//         resource={detail}
//         onOpenChange={(open) => !open && setDetail(null)}
//         onCopy={(text) => void handleCopy(text)}
//       />

//       <DeleteResourceModal
//         resource={deleting}
//         onOpenChange={(open) => !open && setDeleting(null)}
//         onConfirm={() => void handleDelete()}
//         isDeleting={deleteMutation.isPending}
//       />
//     </div>
//   );
// }