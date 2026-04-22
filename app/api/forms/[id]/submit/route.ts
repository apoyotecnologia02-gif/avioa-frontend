import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const body = await request.json()
    
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    // In a real app, you would save this to a database
    console.log(`Form ${id} submitted with data:`, body)
    
    return NextResponse.json({
      success: true,
      message: 'Formulario enviado correctamente',
      submissionId: `sub_${Date.now()}`,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al procesar el formulario' },
      { status: 500 }
    )
  }
}
