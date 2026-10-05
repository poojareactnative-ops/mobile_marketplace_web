import { createClient, SupabaseClient } from '@supabase/supabase-js'

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
export const SUPABASE_DEFAULT_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'marketplace'

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes('your-project') &&
    !SUPABASE_ANON_KEY.includes('your-anon-key')
  )
}

let supabaseInstance: SupabaseClient | null = null

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  return supabaseInstance
}

export interface UploadImageOptions {
  bucket?: string
  folder?: string
  filename?: string
  contentType?: string
}

export interface UploadImageResult {
  publicUrl: string
  path: string
}

/**
 * Upload an image (File or Blob or base64 DataURL) directly to Supabase Storage.
 *
 * @param fileInput - File, Blob, or base64 data URL string
 * @param options - bucket, folder, filename, and contentType options
 * @returns Object with publicUrl and storage path
 */
export async function uploadImageToSupabase(
  fileInput: File | Blob | string,
  options: UploadImageOptions = {}
): Promise<UploadImageResult> {
  const supabase = getSupabaseClient()

  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.'
    )
  }

  const bucket = options.bucket || SUPABASE_DEFAULT_BUCKET
  const folder = (options.folder || 'products').replace(/^\/+|\/+$/g, '')

  let blob: Blob
  let originalName = 'image.jpg'
  let mimeType = options.contentType || 'image/jpeg'

  if (typeof fileInput === 'string') {
    // If it's a data URL or remote URL
    const res = await fetch(fileInput)
    blob = await res.blob()
    mimeType = blob.type || mimeType
    originalName = options.filename || 'image.jpg'
  } else if (fileInput instanceof File) {
    blob = fileInput
    originalName = fileInput.name
    mimeType = fileInput.type || mimeType
  } else {
    blob = fileInput
    originalName = options.filename || 'image.jpg'
    mimeType = blob.type || mimeType
  }

  // Sanitize filename and create unique timestamped path
  const extension = originalName.includes('.')
    ? originalName.split('.').pop()?.toLowerCase()
    : 'jpg'
  const cleanBaseName = originalName
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 30)

  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
  const fileName = `${uniqueId}-${cleanBaseName || 'upload'}.${extension}`
  const filePath = folder ? `${folder}/${fileName}` : fileName

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, blob, {
      contentType: mimeType,
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    // Provide user-friendly troubleshooting if bucket doesn't exist
    if (error.message?.includes('bucket not found') || error.message?.includes('The resource was not found')) {
      throw new Error(
        `Supabase Storage bucket "${bucket}" was not found. Please create a public bucket named "${bucket}" in your Supabase dashboard under Storage.`
      )
    }
    throw new Error(`Supabase storage error: ${error.message}`)
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  if (!urlData?.publicUrl) {
    throw new Error('Failed to retrieve public URL from Supabase storage.')
  }

  return {
    publicUrl: urlData.publicUrl,
    path: data.path,
  }
}
