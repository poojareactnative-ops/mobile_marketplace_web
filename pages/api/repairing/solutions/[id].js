import apiStore from '../../../../../lib/apiStore'

export default function handler(req, res) {
  const { id } = req.query
  if (req.method === 'GET') {
    const item = apiStore.get('solutions', id)
    if (!item) return res.status(404).json({ error: 'Not found' })
    return res.status(200).json(item)
  }
  if (req.method === 'PUT' || req.method === 'PATCH') {
    const updated = apiStore.update('solutions', id, req.body || {})
    if (!updated) return res.status(404).json({ error: 'Not found' })
    return res.status(200).json(updated)
  }
  if (req.method === 'DELETE') {
    apiStore.remove('solutions', id)
    return res.status(204).end()
  }
  res.setHeader('Allow', 'GET,PUT,PATCH,DELETE')
  res.status(405).end('Method Not Allowed')
}
