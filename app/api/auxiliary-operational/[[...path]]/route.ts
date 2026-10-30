import { operationalProxy } from "@/lib/auxiliary-operational/proxy";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;
async function route(
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
) {
  return operationalProxy(request, (await context.params).path);
}
export { route as GET, route as POST, route as DELETE };
