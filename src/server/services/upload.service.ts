import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

export interface PresignUploadRequest {
  filename: string
  contentType: string
  fileSize?: number
}

export interface SaveUploadRequest {
  filename: string
  base64Data: string
  contentType?: string
}

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

export async function saveUploadedFile(params: SaveUploadRequest): Promise<{ url: string; filename: string; publicUrl: string }> {
  if (!params.base64Data) {
    throw new Error('FILE_DATA_REQUIRED')
  }

  // Extract content type and base64 payload
  let base64Clean = params.base64Data
  let mimeType = params.contentType || 'image/jpeg'

  const dataUrlMatch = params.base64Data.match(/^data:([a-zA-Z0-9\/+.-]+);base64,(.+)$/)
  if (dataUrlMatch) {
    mimeType = dataUrlMatch[1]
    base64Clean = dataUrlMatch[2]
  }

  if (mimeType && !ALLOWED_TYPES.includes(mimeType.toLowerCase())) {
    throw new Error('INVALID_CONTENT_TYPE')
  }

  const buffer = Buffer.from(base64Clean, 'base64')
  if (buffer.length > MAX_SIZE_BYTES) {
    throw new Error('FILE_TOO_LARGE')
  }

  // Determine file extension
  let fileExt = (params.filename ? params.filename.split('.').pop() : '') || ''
  fileExt = fileExt.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (!fileExt) {
    if (mimeType.includes('png')) fileExt = 'png'
    else if (mimeType.includes('webp')) fileExt = 'webp'
    else if (mimeType.includes('gif')) fileExt = 'gif'
    else if (mimeType.includes('svg')) fileExt = 'svg'
    else fileExt = 'jpg'
  }

  const uniqueFilename = `${Date.now()}_${crypto.randomBytes(6).toString('hex')}.${fileExt}`
  const targetDir = path.join(process.cwd(), 'public', 'uploads', 'products')

  // Ensure directory exists
  await fs.promises.mkdir(targetDir, { recursive: true })
  const targetFilePath = path.join(targetDir, uniqueFilename)

  // Write original file to disk
  await fs.promises.writeFile(targetFilePath, buffer)

  const publicUrl = `/uploads/products/${uniqueFilename}`
  return {
    url: publicUrl,
    publicUrl,
    filename: uniqueFilename,
  }
}

export async function createPresignedUploadUrl(params: PresignUploadRequest) {
  if (!ALLOWED_TYPES.includes(params.contentType)) {
    throw new Error('INVALID_CONTENT_TYPE')
  }

  if (params.fileSize && params.fileSize > MAX_SIZE_BYTES) {
    throw new Error('FILE_TOO_LARGE')
  }

  const fileExt = params.filename.split('.').pop() || 'jpg'
  const fileKey = `uploads/products/${Date.now()}_${crypto.randomBytes(8).toString('hex')}.${fileExt}`

  const uploadUrl = `/api/v1/uploads`
  const publicUrl = `/${fileKey}`

  return {
    uploadUrl,
    fileKey,
    publicUrl,
    expiresInSeconds: 900,
    headers: {
      'Content-Type': params.contentType,
    },
  }
}

