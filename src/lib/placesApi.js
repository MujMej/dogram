import { supabase } from './supabase'

export async function searchGooglePlaces({
  categoryKey,
  city,
  latitude,
  longitude,
  radius = 7000,
  maxResultCount = 20,
}) {
  const payload = {
    categoryKey,
    city: city?.trim() || '',
    latitude: typeof latitude === 'number' ? latitude : null,
    longitude: typeof longitude === 'number' ? longitude : null,
    radius: Number(radius) || 7000,
    maxResultCount: Math.min(Number(maxResultCount) || 20, 20),
  }

  const { data, error } = await supabase.functions.invoke('google-places-search', {
    body: payload,
  })

  if (error) {
    throw new Error(error.message || 'Greška pri pozivu Google Places funkcije.')
  }

  if (data?.error) {
    throw new Error(data.error)
  }

  return Array.isArray(data?.places) ? data.places : []
}
