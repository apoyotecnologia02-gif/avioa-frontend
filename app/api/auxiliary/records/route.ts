import { auxiliaryProxy } from "@/lib/auxiliary/auxiliary-proxy";

export async function GET(request: Request) {
  return auxiliaryProxy(request);
}
export const POST = GET;
