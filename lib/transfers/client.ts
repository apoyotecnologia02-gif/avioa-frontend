import { api } from "@/lib/axios";
import type {
  Provider,
  Transfer,
  TransferEvent,
  TransferInput,
  TransferStatus,
} from "./domain";

const destinations: Record<string, Provider["destination"]> = {
  CARTAGENA: "Cartagena",
  SANTA_MARTA: "Santa Marta",
  SAN_ANDRES: "San Andrés",
  PALOMINO: "Palomino",
  BARU: "Barú",
};
const statuses: Record<string, TransferStatus> = {
  PENDING: "Pendiente",
  IN_PROGRESS: "En gestión",
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
};
function mapRequest(row: any): Transfer {
  return {
    ...row.payload,
    id: row.transferRequestId,
    status: statuses[row.status] || "Pendiente",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    version: row.version ?? 1,
  };
}
function mapProvider(
  row: any,
): Provider & { providerId?: string; isActive?: boolean } {
  return {
    providerId: row.providerId,
    destination: destinations[row.destination] || row.destination,
    name: row.name,
    channel: String(row.channel).toLowerCase() as Provider["channel"],
    contact: row.contact || "",
    isActive: row.isActive,
  };
}
function statusCode(status: TransferStatus) {
  return (
    Object.entries(statuses).find(([, value]) => value === status)?.[0] ||
    "PENDING"
  );
}
export const transferService = {
  async list() {
    const rows = (await api.get<any[]>("/transfers/requests/my")).data;
    return { data: rows.map(mapRequest) };
  },
  async detail(id: string) {
    const row = (await api.get<any>(`/transfers/requests/${id}`)).data;
    return {
      data: mapRequest(row),
      events: (row.events || []).map(
        (e: any): TransferEvent => ({
          id: e.eventId,
          action: e.action,
          createdAt: e.createdAt,
        }),
      ),
    };
  },
  async create(input: TransferInput) {
    return {
      data: mapRequest(
        (await api.post<any>("/transfers/requests", { payload: input })).data,
      ),
    };
  },
  async update(t: Transfer, input: TransferInput, status: TransferStatus) {
    return {
      data: mapRequest(
        (
          await api.patch<any>(`/transfers/requests/${t.id}`, {
            payload: input,
            status: statusCode(status),
            version: t.version,
          })
        ).data,
      ),
    };
  },
  async providers(manage = false) {
    const rows = (
      await api.get<any[]>(
        manage ? "/transfers/admin/providers" : "/transfers/providers",
      )
    ).data;
    return { data: rows.map(mapProvider) };
  },
  async saveProvider(provider: Provider) {
    const rows = (await api.get<any[]>("/transfers/admin/providers")).data;
    const existing = rows.find(
      (row: any) => destinations[row.destination] === provider.destination,
    );
    const body = {
      name: provider.name,
      destination: Object.entries(destinations).find(
        ([, label]) => label === provider.destination,
      )?.[0],
      channel: provider.channel.toUpperCase(),
      contact: provider.contact,
      isActive: true,
    };
    const result = existing
      ? await api.put<any>(
          `/transfers/admin/providers/${existing.providerId}`,
          body,
        )
      : await api.post<any>("/transfers/admin/providers", body);
    return { data: mapProvider(result.data) };
  },
  async gmailStatus() {
    return (await api.get<any>("/transfers/gmail/connection")).data;
  },
  async connectGmail() {
    return (
      await api.get<{ authorizationUrl: string }>("/transfers/gmail/connect")
    ).data;
  },
  async disconnectGmail() {
    return (await api.delete("/transfers/gmail/connection")).data;
  },
  async evolutionStatus() {
    return (await api.get<any>("/transfers/evolution/connection")).data;
  },
  async emailPreview(id: string) {
    return (await api.get<any>("/transfers/requests/" + id + "/email")).data;
  },
  async sendEmail(
    id: string,
    version: number,
    previewHash: string,
    retry: boolean,
  ) {
    return (
      await api.post<any>("/transfers/requests/" + id + "/email", {
        version,
        previewHash,
        retry,
      })
    ).data;
  },
  async whatsappPreview(id: string) {
    return (await api.get<any>("/transfers/requests/" + id + "/whatsapp")).data;
  },
  async sendWhatsApp(
    id: string,
    version: number,
    previewHash: string,
    retry: boolean,
  ) {
    return (
      await api.post<any>("/transfers/requests/" + id + "/whatsapp", {
        version,
        previewHash,
        retry,
      })
    ).data;
  },
};
