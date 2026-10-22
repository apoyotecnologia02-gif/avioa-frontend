import { auxiliaryProxy } from "@/lib/auxiliary/auxiliary-proxy";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; fileId: string }> },
) {
  const { id, fileId } = await params;

  return auxiliaryProxy(
    request,
    "/" + encodeURIComponent(id) + "/files/" + encodeURIComponent(fileId),
  );
}
