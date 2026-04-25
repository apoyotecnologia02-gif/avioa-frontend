import { NextResponse } from 'next/server'

const REWARDS_URL = `${process.env.NEXT_PUBLIC_API_URL}/points/rewards`

async function parseResponseData(response: Response) {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return { message: text }
  }
}

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get('authorization')
    const response = await fetch(REWARDS_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization ? { Authorization: authorization } : {}),
      },
    })

    const data = await parseResponseData(response)

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json(
      { error: 'No fue posible conectar con el backend de recompensas' },
      { status: 500 },
    )
  }
}
