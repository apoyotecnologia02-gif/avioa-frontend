import { NextResponse } from 'next/server'

const VALIDATE_INVITE_URL = `${process.env.NEXT_PUBLIC_API_URL}/auth/invite/validate`

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
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 400 })
    }

    const response = await fetch(`${VALIDATE_INVITE_URL}?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await parseResponseData(response)
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json(
      { error: 'No fue posible validar la invitación' },
      { status: 500 },
    )
  }
}
