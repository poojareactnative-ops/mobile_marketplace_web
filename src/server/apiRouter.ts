import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import fs from 'fs'
import nodePath from 'path'
import prisma from './db'
import { handleAuthRoutes } from './routes/auth.routes'
import { handlePublicRoutes } from './routes/public.routes'
import { handleUploadRoutes } from './routes/upload.routes'
import { handleSellerRoutes } from './routes/seller.routes'
import { handleAdminRoutes } from './routes/admin.routes'
import { handleEnquiryRoutes } from './routes/enquiry.routes'
import { handleTeamRoutes } from './routes/team.routes'

export async function handleApiV1(req: NextApiRequest, res: NextApiResponse) {
  const requestId = crypto.randomUUID()

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type,Authorization,X-Shop-Id,X-Client-Version'
  )
  res.setHeader('X-Request-Id', requestId)

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  // Parse path
  const slug = req.query.slug
  const parts = Array.isArray(slug) ? slug : [slug].filter(Boolean)
  const path = parts.join('/')
  const method = req.method

  try {
    // ----------------------------------------------------
    // OpenAPI / Swagger Docs
    // ----------------------------------------------------
    if ((path === 'openapi.json' || path === 'docs') && method === 'GET') {
      const openapiPath = nodePath.resolve(process.cwd(), 'docs/openapi.json')
      if (fs.existsSync(openapiPath)) {
        const spec = JSON.parse(fs.readFileSync(openapiPath, 'utf8'))
        return res.status(200).json(spec)
      }
    }

    // ----------------------------------------------------
    // Health & Readiness
    // ----------------------------------------------------
    if (path === 'health' && method === 'GET') {
      return res.status(200).json({ data: { status: 'ok', timestamp: new Date().toISOString() } })
    }

    if (path === 'ready' && method === 'GET') {
      await prisma.$queryRaw`SELECT 1`
      return res.status(200).json({ data: { status: 'ready', database: 'connected' } })
    }

    // ----------------------------------------------------
    // Route Dispatchers
    // ----------------------------------------------------
    if (path.startsWith('auth/')) {
      const handled = await handleAuthRoutes(req, res, path)
      if (handled !== null) return handled
    }

    if (path.startsWith('uploads')) {
      const handled = await handleUploadRoutes(req, res, path)
      if (handled !== null) return handled
    }

    if (path.startsWith('seller/')) {
      const handled = await handleSellerRoutes(req, res, path, parts)
      if (handled !== null) return handled
    }

    if (path.startsWith('admin/')) {
      const handled = await handleAdminRoutes(req, res, path, parts)
      if (handled !== null) return handled
    }

    if (path.startsWith('enquiries')) {
      const handled = await handleEnquiryRoutes(req, res, path)
      if (handled !== null) return handled
    }

    if (path.startsWith('super-seller/sellers')) {
      const handled = await handleTeamRoutes(req, res, path)
      if (handled !== null) return handled
    }

    // Public / Common Routes
    const publicHandled = await handlePublicRoutes(req, res, path, parts)
    if (publicHandled !== null) return publicHandled

    return res.status(404).json({
      error: { code: 'ROUTE_NOT_FOUND', message: `Route /api/v1/${path} [${method}] not found` },
    })
  } catch (err: any) {
    console.error(`[${requestId}] API Error on ${method} /api/v1/${path}:`, err)
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: err.message || 'An unexpected error occurred',
        requestId,
      },
    })
  }
}

export default handleApiV1
