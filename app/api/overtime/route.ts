import { parseResponseData } from '@/utils/parse-response-data.util'
import { NextResponse } from 'next/server'

const BACKEND = process.env.NEXT_PUBLIC_API_URL

/** GET /api/overtime  → my overtime records */
export async function GET(request: Request) {
  try {
    const authorization = request.headers.get('authorization')
    const { searchParams } = new URL(request.url)
    const query = searchParams.toString()

    const response = await fetch(`${BACKEND}/overtime/my${query ? `?${query}` : ''}`, {
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
      { error: 'No fue posible obtener los registros de horas extra' },
      { status: 500 },
    )
  }
}

/** POST /api/overtime  → create overtime request */
export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('authorization')
    const body = await request.json()

    const response = await fetch(`${BACKEND}/overtime`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: JSON.stringify(body),
    })

    const data = await parseResponseData(response)
    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json(
      { error: 'No fue posible registrar las horas extra' },
      { status: 500 },
    )
  }
}
