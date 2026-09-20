import api from './api'

/**
 * Send farm polygon + metadata to backend for full analysis.
 * Returns the complete analysis object.
 */
export async function analyzeFarm({ polygon, farmName, locationName, crop, center }) {
  return api.post('/api/farms/analyze', {
    farm_name: farmName || 'My Farm',
    location_name: locationName || '',
    crop: crop || 'Rice',
    polygon,
    center,
  })
}

/**
 * Calculate farm area from a polygon.
 */
export async function calculateArea(polygon) {
  return api.post('/api/farms/area', { polygon })
}

/**
 * Health check
 */
export async function checkHealth() {
  return api.get('/api/health')
}
