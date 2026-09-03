import { NextResponse } from 'next/server'

const CREATE_USER_URL =
  `${process.env.NEXT_PUBLIC_API_URL}/admin/users`

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
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const department = searchParams.get('department')
    const backendParams = new URLSearchParams()
    if (role) backendParams.set('role', role)
    if (status) backendParams.set('status', status)
    if (department) backendParams.set('department', department)

    const authorization = request.headers.get('authorization')
    const response = await fetch(
      backendParams.toString()
        ? `${CREATE_USER_URL}?${backendParams.toString()}`
        : CREATE_USER_URL,
      {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization ? { Authorization: authorization } : {}),
      },
      },
    )

    const data = await parseResponseData(response)

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json(
      { error: 'No fue posible conectar con el backend de usuarios' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const authorization = request.headers.get('authorization')
    const response = await fetch(CREATE_USER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: JSON.stringify(body),
    })

    const data = await parseResponseData(response)

    if (!response.ok) {
      return NextResponse.json(
        data,
        { status: response.status },
      )
    }

    return NextResponse.json(data, { status: response.status })

  } catch {
    return NextResponse.json(
      { error: 'No fue posible conectar con el backend de usuarios' },
      { status: 500 },
    )
  }
}
