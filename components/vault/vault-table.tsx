"use client";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { api } from "@/lib/axios";
import { VaultItem } from "@/types/password-vault.types";
import { Eye, Pencil, Star, Table, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { StrengthBadge } from "./strength-badge";
import { Button } from "../ui/button";

interface VaultTableProps {
  items: VaultItem[];
  isLoading: boolean;
  onEdit: (item: VaultItem) => void;
  onDelete: (item: VaultItem) => Promise<void>;
  onToggleFavorite: (id: string) => Promise<VaultItem>;
  onReveal: (item: VaultItem) => void;
  onCopyUsername: (item: VaultItem) => void;
}

export function VaultTable({
  items,
  onEdit,
  isLoading,
  onDelete,
  onToggleFavorite,
  onReveal,
  onCopyUsername,
}: VaultTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8" />
          <TableHead>Nombre</TableHead>
          <TableHead>Usuario</TableHead>
          <TableHead>Categoría</TableHead>
          <TableHead>Fortaleza</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading && (
          <TableRow>
            <TableCell
              colSpan={6}
              className="text-center text-muted-foreground"
            >
              Cargando...
            </TableCell>
          </TableRow>
        )}
        {!isLoading && items.length === 0 && (
          <TableRow>
            <TableCell>Sin resultados</TableCell>
          </TableRow>
        )}
        {items.map((item) => (
          <TableRow key={item.passwordVaultId}>
            <TableCell>
              <button onClick={() => onToggleFavorite(item.passwordVaultId)}>
                <Star
                  className={`h-4 w-4 ${
                    item.favorite
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            </TableCell>
            <TableCell className="font-medium">{item.title}</TableCell>
            <TableCell className="flex items-center gap-2 text-muted-foreground">
              {item.username ?? item.email ?? "-"}
              {(item.username || item.email) && (
                <button
                  className="text-xs underline"
                  onClick={() => onCopyUsername(item)}
                >
                  copiar
                </button>
              )}
            </TableCell>
            <TableCell>
              {item.category ? (
                <Badge variant="outline">{item.category.name}</Badge>
              ) : (
                "-"
              )}
            </TableCell>
            <TableCell>
              <StrengthBadge level={item.strengthLevel} />
            </TableCell>
            <TableCell className="text-right space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onReveal(item)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(item)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
