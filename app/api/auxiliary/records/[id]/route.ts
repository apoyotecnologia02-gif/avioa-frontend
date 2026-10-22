import { auxiliaryProxy } from "@/lib/auxiliary/auxiliary-proxy";

type Context = { params: Promise<{ id: string }> };
export async function PUT(request: Request, { params }: Context) {
  return auxiliaryProxy(request, "/" + encodeURIComponent((await params).id));
}
export const PATCH = PUT;
