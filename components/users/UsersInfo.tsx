// components/users/UsersInfo.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton"; //importante para loading
import { Search, Users, Mail, Phone, AlertCircle } from "lucide-react";
import { useGetUsers } from "@/hooks/useGetUsers";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  area?: string;
  phone?: string;
  schedule?: string;
  avatar?: string;
}

export function UsersInfo() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: users, isLoading, isError, error } = useGetUsers();

  const filteredUsers = users?.filter((user: User) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.role?.toLowerCase().includes(searchLower) ||
      user.area?.toLowerCase().includes(searchLower) ||
      false
    );
  });

  //estado de carga
  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="h-5 w-5" />
                Directorio de Colaboradores
              </CardTitle>
              <CardDescription>Cargando colaboradores...</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Users className="h-5 w-5" />
            Directorio de Colaboradores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              No se pudieron cargar los colaboradores.
              {error instanceof Error && ` Error: ${error.message}`}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  //Cuando no hay usuarios
  if (!users || users.length === 0) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="h-5 w-5" />
                Directorio de Colaboradores
              </CardTitle>
              <CardDescription>
                No hay colaboradores registrados
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No se encontraron colaboradores en el sistema</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-5 w-5" />
              Directorio de Colaboradores
            </CardTitle>
            <CardDescription>
              Consulta el perfil de cada colaborador de la organización
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="whitespace-nowrap">
              {users.length} colaboradores
            </Badge>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, cargo, área o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent>
        {/* Versión Desktop - Tabla */}
        <div className="hidden md:block rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Colaborador</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Área</TableHead>
                <TableHead className="hidden lg:table-cell">Email</TableHead>
                <TableHead className="hidden xl:table-cell">Teléfono</TableHead>
                <TableHead className="text-right">Horario</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No se encontraron colaboradores que coincidan con la
                    búsqueda
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers?.map((user: User) => (
                  <TableRow
                    key={user.name}
                    className="hover:bg-muted/50 cursor-pointer"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {(() => {
                              if (!user.name) return "U";
                              const parts = user.name.trim().split(" ");
                              if (parts.length === 1)
                                return parts[0].charAt(0).toUpperCase();
                              const first = parts[0].charAt(0);
                              const last = parts[parts.length - 1].charAt(0);
                              return (first + last).toUpperCase();
                            })()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground md:hidden">
                            {user.role}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary" className="font-normal">
                        {(()=> { 
                          if (user.role === "ADMIN") return "Administrador";
                          if (user.role === "MANAGER") return "Gerente";
                          if (user.role === "EMPLOYEE") return "Empleado";
                          if(user.role === "LEADER") return "Líder";
                          return user.role;
                        })()}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {user.area || "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{user.phone || "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="font-normal">
                        {user.schedule || "9:00 - 18:00"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Versión Mobile - Cards */}
        <div className="md:hidden space-y-4">
          {filteredUsers?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron colaboradores
            </div>
          ) : (
            filteredUsers?.map((user: User) => (
              <Card
                key={user.name}
                className="hover:bg-muted/50 cursor-pointer"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {(() => {
                          if (!user.name) return "U";
                          const parts = user.name.trim().split(" ");
                          if (parts.length === 1)
                            return parts[0].charAt(0).toUpperCase();
                          const first = parts[0].charAt(0);
                          const last = parts[parts.length - 1].charAt(0);
                          return (first + last).toUpperCase();
                        })()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{user.name}</p>
                      <Badge variant="secondary" className="font-normal mt-1">
                        {user.role}
                      </Badge>
                      <div className="mt-3 space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>{user.area || "—"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{user.phone || "—"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="text-xs">
                            {user.schedule || "9:00 - 18:00"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Contador de resultados */}
        {filteredUsers && filteredUsers.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Mostrando {filteredUsers.length} de {users.length} colaboradores
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
