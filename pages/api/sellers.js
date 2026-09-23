import { getNearbyShops } from '../../src/server/services/landing.service'

export default async function handler(req, res) {
  const { lat, lng, radius } = req.query
  const userLat = parseFloat(lat)
  const userLng = parseFloat(lng)
  const parsedRadius = radius ? parseFloat(radius) : 2500
  const clampedRadius = Math.max(500, Math.min(20000, isNaN(parsedRadius) ? 2500 : parsedRadius))

  if (isNaN(userLat) || isNaN(userLng)) {
    // Return default central coordinates
    const shops = await getNearbyShops({ lat: 12.9716, lng: 77.5946, radiusMeters: clampedRadius })
    return res.status(200).json(shops)
  }

  const shops = await getNearbyShops({ lat: userLat, lng: userLng, radiusMeters: clampedRadius })
  return res.status(200).json(shops)
}
