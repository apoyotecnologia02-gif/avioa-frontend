import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";


const POINT_REQUEST_URL = `${process.env.NEXT_PUBLIC_API_URL}/points/request`;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const authorization = request.headers.get("authorization");
        const response = await fetch(POINT_REQUEST_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(authorization ? { Authorization: authorization }: {}),
            },
            body: JSON.stringify(body)
        });

        const data = await parseResponseData(response);

        if (!response.ok) {
            return new NextResponse(JSON.stringify(data), {
                status: response.status
            });
        }

        return new NextResponse(JSON.stringify(data), { status: 200 });
        
    } catch {
        return NextResponse.json(
            { error: "No fue posible conectar con el backend de recompensas" },
            { status: 500 }
        )
    }
}