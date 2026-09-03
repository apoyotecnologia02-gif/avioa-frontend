import { NextResponse } from 'next/server'

function getUserUrl(userId: string) {
  return `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params
    const body = await request.json()
    const authorization = request.headers.get('authorization')
    const response = await fetch(getUserUrl(userId), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization ? { Authorization: authorization } : {}),
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
      { error: 'No fue posible actualizar el usuario en el backend' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params
    const authorization = request.headers.get('authorization')
    const response = await fetch(getUserUrl(userId), {
      method: 'DELETE',
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
      { error: 'No fue posible eliminar el usuario en el backend' },
      { status: 500 },
    )
  }
}
