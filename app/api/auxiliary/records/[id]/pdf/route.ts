import { auxiliaryProxy } from "@/lib/auxiliary/auxiliary-proxy";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return auxiliaryProxy(
    request,
    "/" + encodeURIComponent((await params).id) + "/pdf",
  );
}
