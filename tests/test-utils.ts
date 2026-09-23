import { PrismaClient } from '@prisma/client'
import handleApiV1 from '../src/server/apiRouter'

export const prisma = new PrismaClient()

export function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`)
    process.exit(1)
  }
  console.log(`✅ ${message}`)
}

export async function mockReq(
  path: string,
  method: string,
  body: any,
  customHeaders: any = {},
  queryParams: any = {}
) {
  let statusCode = 200
  let responseData: any = null
  const res: any = {
    status(code: number) {
      statusCode = code
      return this
    },
    json(data: any) {
      responseData = data
      return this
    },
    setHeader() {
      return this
    },
    end() {
      return this
    },
  }
  const req: any = {
    method,
    headers: { 'x-forwarded-for': '127.0.0.1', ...customHeaders },
    query: { slug: path.split('/'), ...queryParams },
    body,
  }
  await handleApiV1(req, res)
  return { status: statusCode, body: responseData }
}
