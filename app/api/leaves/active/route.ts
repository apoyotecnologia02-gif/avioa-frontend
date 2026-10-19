// app/api/leaves/active/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL || "http://localhost:3001/api/v1";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  const backendRes = await fetch(`${BACKEND_URL}/leaves/active`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
    cache: "no-store",
  });

  const data = await backendRes.json().catch(() => null);

  return NextResponse.json(data, { status: backendRes.status });
}