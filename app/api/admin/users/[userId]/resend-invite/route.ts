import { NextResponse } from 'next/server'

function getResendInviteUrl(userId: string) {
  return `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/resend-invite`
}

async function parseResponseData(response: Response) {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return { message: text }
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params
    const authorization = request.headers.get('authorization')
    const response = await fetch(getResendInviteUrl(userId), {
      method: 'POST',
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
      { error: 'No fue posible reenviar la invitación' },
      { status: 500 },
    )
  }
}
