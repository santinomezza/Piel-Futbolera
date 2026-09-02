import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

/**
 * Saves a file buffer to local storage (or cloud storage if configured)
 * and returns the relative/public URL.
 */
export async function saveUploadedFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Ensure file extension
  const originalName = file.name || 'image.jpg'
  const ext = path.extname(originalName) || '.jpg'
  const cleanExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext.toLowerCase())
    ? ext.toLowerCase()
    : '.jpg'

  const fileName = `${randomUUID()}${cleanExt}`
  
  // Save to public/uploads
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }

  const filePath = path.join(uploadsDir, fileName)
  await fs.promises.writeFile(filePath, buffer)

  return `/uploads/${fileName}`
}
