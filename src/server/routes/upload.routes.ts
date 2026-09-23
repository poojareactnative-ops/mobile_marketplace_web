import type { NextApiRequest, NextApiResponse } from 'next'
import { authenticateRequest } from '../auth'
import { checkRateLimit } from '../rateLimiter'
import { createPresignedUploadUrl, saveUploadedFile } from '../services/upload.service'

export async function handleUploadRoutes(req: NextApiRequest, res: NextApiResponse, path: string) {
  const method = req.method

  if (path === 'uploads' && method === 'POST') {
    const auth = await authenticateRequest(req)
    const clientId = auth?.user?.id
      ? `upload:${auth.user.id}`
      : `upload:${(req.headers['x-forwarded-for'] as string) || 'guest'}`
    const rateCheck = checkRateLimit(clientId, 120, 60000)
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: { code: 'TOO_MANY_REQUESTS', message: 'Upload rate limit reached.' },
      })
    }

    const { file, filename, contentType } = req.body || {}
    if (!file) {
      return res.status(422).json({
        error: { code: 'VALIDATION_ERROR', message: 'file payload required' },
      })
    }

    try {
      const saved = await saveUploadedFile({
        filename: filename || 'product.jpg',
        base64Data: file,
        contentType: contentType || 'image/jpeg',
      })
      return res.status(201).json({ data: saved })
    } catch (err: any) {
      return res.status(400).json({
        error: { code: 'UPLOAD_FAILED', message: err.message || 'Failed to save uploaded file' },
      })
    }
  }

  if (path === 'uploads/presign' && method === 'POST') {
    const auth = await authenticateRequest(req)
    if (!auth) {
      return res
        .status(401)
        .json({ error: { code: 'UNAUTHENTICATED', message: 'Authentication required' } })
    }

    const rateCheck = checkRateLimit(`upload:${auth.user.id}`, 60, 60000)
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: { code: 'TOO_MANY_REQUESTS', message: 'Upload rate limit reached.' },
      })
    }

    const { file, filename, contentType, fileSize } = req.body || {}
    if (file) {
      try {
        const saved = await saveUploadedFile({
          filename: filename || 'product.jpg',
          base64Data: file,
          contentType: contentType || 'image/jpeg',
        })
        return res.status(200).json({ data: saved })
      } catch (err: any) {
        return res.status(400).json({
          error: { code: 'UPLOAD_FAILED', message: err.message || 'Failed to save uploaded file' },
        })
      }
    }

    if (!filename || !contentType) {
      return res.status(422).json({
        error: { code: 'VALIDATION_ERROR', message: 'filename and contentType required' },
      })
    }

    const presigned = await createPresignedUploadUrl({ filename, contentType, fileSize })
    return res.status(200).json({ data: presigned })
  }

  return null
}
