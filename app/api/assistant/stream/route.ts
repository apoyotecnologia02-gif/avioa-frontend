const ASSISTANT_STREAM_URL = `${process.env.NEXT_PUBLIC_API_URL}/assistant/stream`;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization");
    const body = await request.text();

    const response = await fetch(ASSISTANT_STREAM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body,

      // @ts-expect-error
      duplex: "half",
    });

    if (!response.ok || !response.body) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({
          error: "No fue posible iniciar el asistente",
          detail: errorText,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(response.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "No fue posible conectar con el backend",
        detail: (err as Error).message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
