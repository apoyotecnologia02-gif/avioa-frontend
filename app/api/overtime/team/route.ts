import { parseResponseData } from '@/utils/parse-response-data.util'
import { NextResponse } from 'next/server'

const BACKEND = process.env.NEXT_PUBLIC_API_URL

/** GET /api/overtime/team  → all team records (leader/manager only) */
export async function GET(request: Request) {
  try {
    const authorization = request.headers.get('authorization')

    const response = await fetch(`${BACKEND}/overtime/team`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization ? { Authorization: authorization } : {}),
      },
    })

    const data = await parseResponseData(response)
    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json(
      { error: 'No fue posible obtener las solicitudes del equipo' },
      { status: 500 },
    )
  }
}
