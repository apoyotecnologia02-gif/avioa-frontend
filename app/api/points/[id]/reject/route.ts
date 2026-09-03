import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server"

function getUrlById(id: string) {
    return `${process.env.NEXT_PUBLIC_API_URL}/points/${id}/reject`
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }>}) {
    try {
        const { id } = await params;
        const authorization = request.headers.get("authorization")
        const body = await request.json()
        const response = await fetch(getUrlById(id), {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                ...(authorization ? { Authorization: authorization } : {})
            },
            body: JSON.stringify(body)
        })

        const data = await parseResponseData(response);

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status })
        }

        return NextResponse.json(data, { status: response.status })
    } catch {
        return NextResponse.json(
            { error: "No fue posible rechazar la solicitud de puntos" },
            { status: 500 }
        )
    }
}
