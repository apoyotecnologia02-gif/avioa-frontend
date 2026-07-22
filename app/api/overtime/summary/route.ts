import { parseResponseData } from '@/utils/parse-response-data.util'
import { NextResponse } from 'next/server'

const BACKEND = process.env.NEXT_PUBLIC_API_URL

/** GET /api/overtime/summary?year=YYYY&month=MM */
export async function GET(request: Request) {
  try {
    const authorization = request.headers.get('authorization')
    const { searchParams } = new URL(request.url)
    const query = searchParams.toString()

    const response = await fetch(`${BACKEND}/overtime/summary${query ? `?${query}` : ''}`, {
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
      { error: 'No fue posible obtener el resumen de horas extra' },
      { status: 500 },
    )
  }
}
