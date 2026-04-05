import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { MAP_CATEGORIES } from '../lib/mapCategories'
import { searchGooglePlaces } from '../lib/placesApi'
import { loadGoogleMaps } from '../lib/loadGoogleMaps'

const DEFAULT_CENTER = { lat: 44.7722, lng: 17.191 }

export default function Map() {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const infoWindowRef = useRef(null)

  const [loading, setLoading] = useState(false)
  const [mapError, setMapError] = useState('')
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [places, setPlaces] = useState([])
  const [categoryKey, setCategoryKey] = useState('dog_park')
  const [city, setCity] = useState('Banja Luka')
  const [radius, setRadius] = useState(7000)
  const [userLocation, setUserLocation] = useState(DEFAULT_CENTER)

  const categories = useMemo(() => Object.values(MAP_CATEGORIES), [])

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      () => setUserLocation(DEFAULT_CENTER),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((marker) => {
      marker.map = null
    })
    markersRef.current = []
  }, [])

  useEffect(() => {
    let mounted = true

    async function initMap() {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_BROWSER_KEY
        const mapId = import.meta.env.VITE_GOOGLE_MAP_ID

        if (!apiKey) {
          throw new Error('Missing VITE_GOOGLE_MAPS_BROWSER_KEY')
        }

        await loadGoogleMaps(apiKey)

        const { Map } = await google.maps.importLibrary('maps')
        await google.maps.importLibrary('marker')

        if (!mounted || !mapRef.current) return

        const map = new Map(mapRef.current, {
          center: userLocation,
          zoom: 13,
          mapId: mapId || undefined,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        })

        mapInstanceRef.current = map
        infoWindowRef.current = new google.maps.InfoWindow()
        setMapError('')
      } catch (err) {
        console.error(err)
        setMapError('Mapa se nije mogla učitati.')
      }
    }

    initMap()

    return () => {
      mounted = false
      clearMarkers()
    }
  }, [clearMarkers, userLocation])

  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(userLocation)
    }
  }, [userLocation])

  const renderMarkers = useCallback(async () => {
    if (!mapInstanceRef.current || !window.google?.maps) return

    clearMarkers()

    const { AdvancedMarkerElement } = await google.maps.importLibrary('marker')

    for (const place of places) {
      const lat = Number(place.latitude)
      const lng = Number(place.longitude)

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue

      const markerContent = document.createElement('div')
      markerContent.style.background = place.is_sponsored ? '#e8a230' : '#171512'
      markerContent.style.color = place.is_sponsored ? '#000' : '#fff'
      markerContent.style.border = '1px solid rgba(255,255,255,0.12)'
      markerContent.style.borderRadius = '9999px'
      markerContent.style.padding = '8px 12px'
      markerContent.style.fontSize = '12px'
      markerContent.style.fontWeight = '700'
      markerContent.style.boxShadow = '0 10px 20px rgba(0,0,0,0.25)'
      markerContent.textContent = `${place.icon || '📍'} ${place.title}`

      const marker = new AdvancedMarkerElement({
        map: mapInstanceRef.current,
        position: { lat, lng },
        content: markerContent,
        title: place.title,
      })

      marker.addListener('click', () => {
        setSelectedPlace(place)

        infoWindowRef.current?.setContent(`
          <div style="min-width:220px;max-width:280px;padding:4px 2px;">
            <div style="font-weight:700;font-size:14px;margin-bottom:4px;">
              ${escapeHtml(place.title)}
            </div>
            <div style="font-size:12px;color:#555;margin-bottom:6px;">
              ${escapeHtml(place.address || '')}
            </div>
            <div style="font-size:12px;margin-bottom:6px;">
              ${place.is_sponsored ? '⭐ Sponzorisano' : '📍 Google rezultat'}
            </div>
            ${
              place.open_now === true
                ? '<div style="font-size:12px;color:green;margin-bottom:6px;">Otvoreno sada</div>'
                : place.open_now === false
                ? '<div style="font-size:12px;color:#b45309;margin-bottom:6px;">Trenutno zatvoreno</div>'
                : ''
            }
          </div>
        `)

        infoWindowRef.current?.open({
          anchor: marker,
          map: mapInstanceRef.current,
        })
      })

      markersRef.current.push(marker)
    }

    if (places.length > 0) {
      const bounds = new google.maps.LatLngBounds()

      places.forEach((place) => {
        const lat = Number(place.latitude)
        const lng = Number(place.longitude)

        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          bounds.extend({ lat, lng })
        }
      })

      if (!bounds.isEmpty()) {
        mapInstanceRef.current.fitBounds(bounds)
      }
    }
  }, [places, clearMarkers])

  useEffect(() => {
    renderMarkers()
  }, [renderMarkers])

  async function fetchSponsoredPlaces() {
    let query = supabase
      .from('sponsored_places')
      .select('*')
      .eq('is_active', true)
      .eq('category_key', categoryKey)

    if (city?.trim()) {
      query = query.ilike('city', `%${city.trim()}%`)
    }

    const { data, error } = await query
    if (error) throw error

    return (data || []).map((item) => ({
      source: 'sponsored',
      google_place_id: item.google_place_id,
      title: item.title,
      category_key: item.category_key,
      address: item.address,
      latitude: Number(item.latitude),
      longitude: Number(item.longitude),
      phone: item.phone,
      website: item.website,
      maps_url: null,
      rating: null,
      user_rating_count: null,
      opening_hours: [],
      open_now: null,
      is_sponsored: item.is_sponsored,
      is_verified: item.is_verified,
      boost_tier: item.boost_tier || 0,
      description: item.description,
      image_url: item.image_url,
      cta_label: item.cta_label,
      cta_url: item.cta_url,
      icon: getCategoryIcon(item.category_key),
    }))
  }

  async function runSearch() {
    setLoading(true)

    try {
      const googleResults = await searchGooglePlaces({
        categoryKey,
        city,
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        radius,
        maxResultCount: 20,
      })

      const sponsoredResults = await fetchSponsoredPlaces()

      const merged = mergePlaces(googleResults, sponsoredResults).map((item) => ({
        ...item,
        latitude: Number(item.latitude),
        longitude: Number(item.longitude),
        icon: getCategoryIcon(item.category_key),
      }))

      setPlaces(merged)
    } catch (error) {
      console.error(error)
      setPlaces([])
      alert(error.message || 'Greška pri učitavanju lokacija.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runSearch()
  }, [categoryKey])

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-[#171512] p-5 shadow-lg">
        <h1 className="text-2xl font-black text-white">Dogram mapa</h1>
        <p className="mt-2 text-sm text-gray-400">
          Google rezultati + tvoji sponzorisani partneri na jednoj mapi.
        </p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#171512] p-4 space-y-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Grad, npr. Banja Luka"
            className="w-full rounded-2xl border border-white/10 bg-[#0f0e0c] px-4 py-3 text-sm text-white outline-none"
          />

          <select
            value={categoryKey}
            onChange={(e) => setCategoryKey(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-[#0f0e0c] px-4 py-3 text-sm text-white outline-none"
          >
            {categories.map((category) => (
              <option key={category.key} value={category.key}>
                {category.icon} {category.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
          <input
            type="range"
            min="1000"
            max="30000"
            step="1000"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full"
          />
          <div className="rounded-2xl bg-[#0f0e0c] px-4 py-3 text-sm text-gray-300">
            Radius: {Math.round(radius / 1000)} km
          </div>
        </div>

        <button
          onClick={runSearch}
          disabled={loading}
          className="w-full rounded-2xl bg-[#e8a230] px-4 py-3 text-sm font-bold text-black transition hover:scale-[1.01] disabled:opacity-70"
        >
          {loading ? 'Učitavam...' : 'Pretraži lokacije'}
        </button>
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#171512]">
        {mapError ? (
          <div className="flex h-[480px] items-center justify-center p-6 text-sm text-red-300">
            {mapError}
          </div>
        ) : (
          <div ref={mapRef} className="h-[480px] w-full" />
        )}
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#171512] p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Rezultati</h2>
          <span className="text-sm text-gray-400">{places.length} lokacija</span>
        </div>

        <div className="space-y-3">
          {places.map((place, index) => (
            <button
              key={`${place.google_place_id || place.title}-${index}`}
              onClick={() => setSelectedPlace(place)}
              className="w-full rounded-3xl border border-white/10 bg-[#0f0e0c] p-4 text-left"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-white">
                      {place.icon} {place.title}
                    </h3>
                    {place.is_sponsored && (
                      <span className="rounded-full bg-[#e8a230]/15 px-3 py-1 text-xs font-semibold text-[#e8a230]">
                        Sponzorisano
                      </span>
                    )}
                    {place.is_verified && (
                      <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-300">
                        Verified
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-gray-400">{place.address}</p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-300">
                    {place.rating && <span>⭐ {place.rating}</span>}
                    {place.user_rating_count && <span>({place.user_rating_count} ocjena)</span>}
                    {place.open_now === true && <span>Otvoreno sada</span>}
                    {place.open_now === false && <span>Trenutno zatvoreno</span>}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {selectedPlace && (
        <section className="rounded-3xl border border-white/10 bg-[#171512] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-black text-white">
                  {selectedPlace.icon} {selectedPlace.title}
                </h2>
                {selectedPlace.is_sponsored && (
                  <span className="rounded-full bg-[#e8a230]/15 px-3 py-1 text-xs font-semibold text-[#e8a230]">
                    Sponzorisano
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm text-gray-400">{selectedPlace.address}</p>

              {selectedPlace.description && (
                <p className="mt-4 text-sm leading-6 text-gray-300">
                  {selectedPlace.description}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <InfoCard label="Telefon" value={selectedPlace.phone || 'Nije dostupno'} />
            <InfoCard label="Website" value={selectedPlace.website || 'Nije dostupno'} />
            <InfoCard
              label="Ocjena"
              value={
                selectedPlace.rating
                  ? `${selectedPlace.rating} (${selectedPlace.user_rating_count || 0} ocjena)`
                  : 'Nije dostupno'
              }
            />
            <InfoCard
              label="Status"
              value={
                selectedPlace.open_now === true
                  ? 'Otvoreno sada'
                  : selectedPlace.open_now === false
                  ? 'Trenutno zatvoreno'
                  : 'Nije dostupno'
              }
            />
          </div>

          {!!selectedPlace.opening_hours?.length && (
            <div className="mt-4 rounded-2xl bg-[#0f0e0c] p-4">
              <h3 className="text-sm font-bold text-white">Radno vrijeme</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-300">
                {selectedPlace.opening_hours.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            {selectedPlace.cta_url && (
              <a
                href={selectedPlace.cta_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl bg-[#e8a230] px-4 py-3 text-sm font-bold text-black"
              >
                {selectedPlace.cta_label || 'Kontakt'}
              </a>
            )}

            {selectedPlace.maps_url && (
              <a
                href={selectedPlace.maps_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white"
              >
                Otvori u Google Maps
              </a>
            )}

            {selectedPlace.website && (
              <a
                href={selectedPlace.website}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white"
              >
                Posjeti web stranicu
              </a>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#0f0e0c] p-4">
      <span className="block text-xs uppercase tracking-wide text-gray-500">{label}</span>
      <span className="mt-2 block break-words text-sm text-white">{value}</span>
    </div>
  )
}

function getCategoryIcon(categoryKey) {
  return MAP_CATEGORIES[categoryKey]?.icon || '📍'
}

function mergePlaces(googlePlaces, sponsoredPlaces) {
  const byPlaceId = new Map()

  for (const place of googlePlaces) {
    byPlaceId.set(place.google_place_id || `${place.title}-${place.address}`, place)
  }

  for (const sponsored of sponsoredPlaces) {
    const key = sponsored.google_place_id || `${sponsored.title}-${sponsored.address}`
    const existing = byPlaceId.get(key)

    if (existing) {
      byPlaceId.set(key, {
        ...existing,
        ...sponsored,
        source: 'merged',
        is_sponsored: sponsored.is_sponsored,
        is_verified: sponsored.is_verified,
        boost_tier: sponsored.boost_tier ?? 100,
        cta_label: sponsored.cta_label,
        cta_url: sponsored.cta_url,
        description: sponsored.description,
        image_url: sponsored.image_url,
      })
    } else {
      byPlaceId.set(key, sponsored)
    }
  }

  return [...byPlaceId.values()].sort((a, b) => {
    const sponsorDiff = Number(!!b.is_sponsored) - Number(!!a.is_sponsored)
    if (sponsorDiff !== 0) return sponsorDiff

    const boostDiff = (b.boost_tier || 0) - (a.boost_tier || 0)
    if (boostDiff !== 0) return boostDiff

    return (b.rating || 0) - (a.rating || 0)
  })
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
