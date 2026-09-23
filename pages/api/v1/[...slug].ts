import type { NextApiRequest, NextApiResponse } from 'next'
import { handleApiV1 } from '../../../src/server/apiRouter'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return handleApiV1(req, res)
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}
