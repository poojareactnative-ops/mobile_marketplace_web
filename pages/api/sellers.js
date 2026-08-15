// Simple mock API that returns sellers filtered by distance from provided lat/lng

function haversine(lat1, lon1, lat2, lon2) {
	const toRad = (v) => (v * Math.PI) / 180
	const R = 6371000 // meters
	const dLat = toRad(lat2 - lat1)
	const dLon = toRad(lon2 - lon1)
	const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
	return R * c
}

const MOCK_SELLERS = [
	{
		id: 's1',
		name: 'Rapid Repairs & Accessories',
		type: 'super',
		lat: 12.9716,
		lng: 77.5946,
		phone: '+911234567890',
		items: ['Screen protector', 'Charger', 'Battery replacement'],
		services: ['Screen repair', 'Battery replacement']
	},
	{
		id: 's2',
		name: 'Accessory Hub',
		type: 'accessory',
		lat: 12.9720,
		lng: 77.5900,
		phone: '+919876543210',
		items: ['Cases', 'Headphones']
	},
	{
		id: 's3',
		name: 'Mobile Care Center',
		type: 'super',
		lat: 12.9700,
		lng: 77.5970,
		phone: '+919112223334',
		items: ['Tempered glass', 'Cables'],
		services: ['Water damage', 'Board repair']
	}
]

export default function handler(req, res) {
	const { lat, lng, radius } = req.query
	const userLat = parseFloat(lat)
	const userLng = parseFloat(lng)
	const r = radius ? parseFloat(radius) : 2000

	if (isNaN(userLat) || isNaN(userLng)) {
		// If no location provided, return all sellers (useful for demo)
		return res.status(200).json(MOCK_SELLERS.map((s) => ({ ...s, distance: null })))
	}

	const filtered = MOCK_SELLERS.map((s) => {
		const d = haversine(userLat, userLng, s.lat, s.lng)
		return { ...s, distance: Math.round(d) }
	}).filter((s) => s.distance <= r)

	// Sort by distance
	filtered.sort((a, b) => a.distance - b.distance)

	res.status(200).json(filtered)
}
