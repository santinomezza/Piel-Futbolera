import { NextResponse } from 'next/server'
import { saveUploadedFile } from '@/lib/storage'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No se enviaron archivos de imagen' }, { status: 400 })
    }

    const urls: string[] = []
    for (const file of files) {
      if (typeof file === 'object' && 'arrayBuffer' in file) {
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { error: `El archivo ${file.name} supera el tamaño máximo permitido (5MB)` },
            { status: 400 }
          )
        }
        const url = await saveUploadedFile(file)
        urls.push(url)
      }
    }

    return NextResponse.json({ success: true, urls })
  } catch (error) {
    console.error('❌ Upload error:', error)
    return NextResponse.json({ error: 'Error al subir las imágenes' }, { status: 500 })
  }
}
