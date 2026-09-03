import { NextResponse } from 'next/server'

const ACCEPT_INVITE_URL = `${process.env.NEXT_PUBLIC_API_URL}/auth/invite/accept`

async function parseResponseData(response: Response) {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return { message: text }
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const response = await fetch(ACCEPT_INVITE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await parseResponseData(response)
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json(
      { error: 'No fue posible aceptar la invitación' },
      { status: 500 },
    )
  }
}
