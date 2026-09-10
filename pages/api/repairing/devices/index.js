import apiStore from '../../../../lib/apiStore'

export default function handler(req, res) {
  if (req.method === 'GET') {
    const items = apiStore.list('devices')
    return res.status(200).json(items)
  }
  if (req.method === 'POST') {
    const item = apiStore.create('devices', req.body || {})
    return res.status(201).json(item)
  }
  res.setHeader('Allow', 'GET,POST')
  res.status(405).end('Method Not Allowed')
}
