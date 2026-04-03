import { supabase } from './supabase'

export async function searchGooglePlaces({
  categoryKey,
  city,
  latitude,
  longitude,
  radius = 7000,
  maxResultCount = 20,
}) {
  const { data, error } = await supabase.functions.invoke('google-places-search', {
    body: {
      categoryKey,
      city,
      latitude,
      longitude,
      radius,
      maxResultCount,
    },
  })

  if (error) {
    throw error
  }

  return data?.places || []
}
