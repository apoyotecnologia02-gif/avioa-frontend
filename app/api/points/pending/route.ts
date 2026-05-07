import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

const POINTS_PENDING_URL = `${process.env.NEXT_PUBLIC_API_URL}/points/pending`;

export async function GET(request: Request) {
    try {
        const authorization = request.headers.get("authorization");
        const response = await fetch(POINTS_PENDING_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(authorization ? { Authorization: authorization } : {}),
            }
        })

        const data = await parseResponseData(response);

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status })
        }
        
        return NextResponse.json(data, { status: response.status })
    } catch {
        return NextResponse.json(
            { error: "No fue posible conectar con el backend" },
            { status: 500 }
        )
    }
}