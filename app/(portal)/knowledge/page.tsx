"use client";

import { AddFileModal } from "@/components/knowledge/AddFileModal";
import { CreateFolderModal } from "@/components/knowledge/CreateFolderModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import {
  useDeleteFile,
  useDeleteFolder,
  useKnowledgeContents,
} from "@/hooks/useKnowledge";
import { isLeaderOrManagerOrAdminRole } from "@/lib/roles";
import {
  ChevronRight,
  ExternalLink,
  FileText,
  Folder,
  Plus,
  Trash2,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
// import { useRouter } from "next/router";
import { Suspense, useState } from "react";

function KnowledgeLibraryContent() {
  const { user } = useAuth();
  const canManage = isLeaderOrManagerOrAdminRole(user?.role);

  const router = useRouter();
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folderId") ?? undefined;

  const { data, isLoading } = useKnowledgeContents(folderId);
  const { mutate: deleteFolder } = useDeleteFolder();
  const { mutate: deleteFile } = useDeleteFile();

  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [addFileOpen, setAddFileOpen] = useState(false);

  const navigateTo = (id?: string) => {
    if (id) {
      router.push(`/knowledge?folderId=${id}`);
    } else {
      router.push("/knowledge");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Biblioteca de Conocimiento
          </h1>
          <p className="text-muted-foreground">
            Documentos y políticas de la empresa organizados por carpetas
          </p>
        </div>

        {canManage && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCreateFolderOpen(true)}>
              <Folder className="mr-2 h-4 w-4" />
              Nueva carpeta
            </Button>
            <Button onClick={() => setAddFileOpen(true)} disabled={!folderId}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar archivo
            </Button>
          </div>
        )}
      </div>

      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <button
          onClick={() => navigateTo()}
          className="hover:text-foreground hover:underline"
        >
          Biblioteca
        </button>
        {data?.breadcrumb.map((item) => (
          <span
            key={item.knowledgeFolderId}
            className="flex items-center gap-1"
          >
            <ChevronRight className="h-3.5 w-3.5" />
            <button
              onClick={() => navigateTo(item.knowledgeFolderId)}
              className="hover:text-foreground hover:underline"
            >
              {item.name}
            </button>
          </span>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      )}

      {/* Contenido */}
      {!isLoading && data && (
        <>
          {data.subfolders.length === 0 && data.files.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Folder className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">
                  Esta carpeta está vacía
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {canManage
                    ? "Crea una subcarpeta o agrega un archivo para empezar."
                    : "Aún no hay documentos en esta sección."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.subfolders.map((folder) => (
                <Card
                  key={folder.knowledgeFolderId}
                  className="group cursor-pointer transition-colors hover:border-primary/50 hover:bg-accent/30"
                  onClick={() => navigateTo(folder.knowledgeFolderId)}
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                      <Folder className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {folder.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {folder._count?.children ?? 0} carpetas ·{" "}
                        {folder._count?.files ?? 0} archivos
                      </p>
                    </div>
                    {canManage && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFolder(folder.knowledgeFolderId);
                        }}
                        aria-label={`Eliminar carpeta ${folder.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}

              {data.files.map((file) => (
                <Card key={file.knowledgeFileId} className="group">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {file.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Google Drive
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        asChild
                      >
                        <a
                          href={file.driveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Abrir ${file.title}`}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                      {canManage && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10"
                          onClick={() => deleteFile(file.knowledgeFileId)}
                          aria-label={`Eliminar ${file.title}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <CreateFolderModal
        isOpen={createFolderOpen}
        onClose={() => setCreateFolderOpen(false)}
        parentId={folderId}
      />
      <AddFileModal
        isOpen={addFileOpen}
        onClose={() => setAddFileOpen(false)}
        folderId={folderId}
      />
    </div>
  );
}

export default function KnowledgeLibraryPage() {
  return (
    <Suspense fallback={<Skeleton className="h-40 w-full rounded-xl" />}>
      <KnowledgeLibraryContent />
    </Suspense>
  );
}
