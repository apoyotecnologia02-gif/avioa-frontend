"use client";

import { useUserDirectory } from "@/hooks/useUserDirectory";
import {
  useRevokeVaultPermission,
  useShareVault,
  useUpdateVaultPermission,
  useVaultShares,
} from "@/hooks/useVaultSharing";
import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Building2, ChevronsUpDown, Trash2, UserIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

interface ShareVaultDialogProps {
  vaultId: string;
  vaultTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PermissionDraft {
  canView: boolean;
  canEdit: boolean;
  canAdmin: boolean;
}

const DEFAULT_DRAFT: PermissionDraft = {
  canView: true,
  canEdit: false,
  canAdmin: false,
};

export function ShareVaultDialog({
  vaultId,
  vaultTitle,
  open,
  onOpenChange,
}: ShareVaultDialogProps) {
  const { data: users = [], isLoading: userLoading } = useUserDirectory();
  const { data: shares = [], isLoading: sharesLoading } =
    useVaultShares(vaultId);

  const shareMutation = useShareVault(vaultId);
  const updateMutation = useUpdateVaultPermission(vaultId);
  const revokeMutation = useRevokeVaultPermission(vaultId);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null,
  );
  const [userPopoverOpen, setUserPopoverOpen] = useState(false);
  const [deptPopoverOpen, setDeptPopoverOpen] = useState(false);
  const [draft, setDraft] = useState<PermissionDraft>(DEFAULT_DRAFT);

  const departments = useMemo(() => {
    const unique = new Set<string>();
    users.forEach((u: any) => u.area && unique.add(u.area));
    return Array.from(unique).sort();
  }, [users]);

  const alreadySharedUserIds = useMemo(
    () => new Set(shares?.filter((s) => s.userId).map((s) => s.userId)),
    [shares],
  );

  const alreadySharedDeparments = useMemo(
    () => new Set(shares.filter((s) => s.department).map((s) => s.department)),
    [shares],
  );

  async function handleShareWithUser() {
    if (!selectedUserId) return;
    await shareMutation.mutateAsync({
      userId: selectedUserId,
      ...draft,
    });
    setSelectedUserId(null);
    setDraft(DEFAULT_DRAFT);
  }

  async function handleShareWithDepartment() {
    if (!selectedDepartment) return;
    await shareMutation.mutateAsync({
      department: selectedDepartment,
      ...draft,
    });
    setSelectedDepartment(null);
    setDraft(DEFAULT_DRAFT);
  }

  const selectedUser = users.find((u: any) => u.userId === selectedUserId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Compartir &quot;{vaultTitle}&quot;</DialogTitle>
          <DialogDescription>
            Da acceso a una persona específica o a toda un área.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="person">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="person" className="gap-1.5">
              <UserIcon className="h-3.5 w-3.5" />
              Persona
            </TabsTrigger>
            <TabsTrigger value="department">
              <Building2 className="h-3.5 w-3.5" />
              Area
            </TabsTrigger>
          </TabsList>

          <TabsContent value="person" className="space-y-3 pt-3">
            <Popover open={userPopoverOpen} onOpenChange={setUserPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  {selectedUser ? selectedUser.name : "Buscar persona..."}
                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Buscar persona por nombre o email..." />
                  <CommandList>
                    <CommandEmpty>
                      {userLoading ? "Cargando..." : "Sin resultados"}
                    </CommandEmpty>
                    <CommandGroup>
                      {users
                        .filter((u: any) => !alreadySharedUserIds.has(u.userId))
                        .map((u: any) => (
                          <CommandItem
                            key={u.userId}
                            value={`${u.name} ${u.eamil}`}
                            onSelect={() => {
                              setSelectedUserId(u.userId);
                              setUserPopoverOpen(false);
                            }}
                          >
                            <Avatar className="mr-2 h-6 w-6">
                              <AvatarImage src={u.avatarUrl} />
                              <AvatarFallback>
                                {u.name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm">{u.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {u.email}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <PermissionCheckboxes draft={draft} onChange={setDraft} />

            <Button
              className="w-full"
              disabled={!selectedUserId || shareMutation.isPending}
              onClick={handleShareWithUser}
            >
              {shareMutation.isPending
                ? "Compartiendo..."
                : "Compartir con esta persona"}
            </Button>
          </TabsContent>

          <TabsContent value="department" className="space-y-3 pt-3">
            <Popover open={deptPopoverOpen} onOpenChange={setDeptPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  {selectedDepartment ?? "Seleccionar área..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Buscar área..." />
                  <CommandList>
                    <CommandEmpty>Sin resultados</CommandEmpty>
                    <CommandGroup>
                      {departments
                        .filter((d) => !alreadySharedDeparments.has(d))
                        .map((dept) => (
                          <CommandItem
                            key={dept}
                            value={dept}
                            onSelect={() => {
                              setSelectedDepartment(dept);
                              setDeptPopoverOpen(false);
                            }}
                          >
                            <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                            {dept}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <PermissionCheckboxes draft={draft} onChange={setDraft} />

            <Button
              className="w-full"
              disabled={!selectedDepartment || shareMutation.isPending}
              onClick={handleShareWithDepartment}
            >
              {shareMutation.isPending
                ? "Compartiendo..."
                : "Compartir con esta área"}
            </Button>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Compartido actualmente {sharesLoading && "(cargando...)"}
          </p>
          {shares.length === 0 && !sharesLoading && (
            <p className="text-xs text-muted-foreground">
              Aun no has compartido esta credencial
            </p>
          )}
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {shares.map((share) => (
              <div
                key={share.passwordPermissionId}
                className="flex items-center justify-between rounded-md border px-2.5 py-1.5"
              >
                <div className="flex items-center gap-2">
                  {share.user ? (
                    <>
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={share.user.avatarUrl} />
                        <AvatarFallback>
                          {share.user.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate text-sm">
                        {share.user.name}
                      </span>
                    </>
                  ) : (
                    <>
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate text-sm">
                        {share.department}
                      </span>
                    </>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {share.canAdmin
                      ? "Administra"
                      : share.canEdit
                        ? "Puede editar"
                        : "Puede ver"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() =>
                    revokeMutation.mutate(share.passwordPermissionId)
                  }
                  disabled={revokeMutation.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PermissionCheckboxes({
  draft,
  onChange,
}: {
  draft: PermissionDraft;
  onChange: (draft: PermissionDraft) => void;
}) {
  return (
    <div className="space-y-2 rounded-md border p-3">
      <div className="flex items-center gap-2">
        <Checkbox checked disabled id="can-view" />
        <Label
          htmlFor="can-view"
          className="text-s font-normal text-muted-foreground"
        >
          Puede ver (siempre incluido)
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="can-edit"
          checked={draft.canEdit}
          onCheckedChange={(v) =>
            onChange({
              ...draft,
              canEdit: !!v,
              canAdmin: v ? draft.canAdmin : false,
            })
          }
        />
        <Label htmlFor="can-edit" className="text-sm font-normal">
          Puede editar
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="can-admin"
          checked={draft.canAdmin}
          onCheckedChange={(v) =>
            onChange({
              ...draft,
              canAdmin: !!v,
              canEdit: v ? true : draft.canEdit,
            })
          }
        />
        <Label htmlFor="can-admin" className="text-sm font-normal">
          Puede administrar (compartir y eliminar)
        </Label>
      </div>
    </div>
  );
}
