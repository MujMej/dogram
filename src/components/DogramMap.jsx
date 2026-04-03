import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { supabase } from '../lib/supabase'
import { MAP_CATEGORIES } from '../lib/mapCategories'
import { mergePlaces } from '../lib/sponsorMerge'

const DEFAULT_CENTER = [44.7722, 17.1910]

const publicPlacesSeed = [
  {
    id: 'pub-1',
    title: 'Veterinarska stanica Banja Luka',
    category_key: 'veterinary',
    city: 'Banja Luka',
    address: 'Banja Luka, BiH',
    latitude: 44.7722,
    longitude: 17.191,
    phone: '',
    website: '',
    maps_url: '',
    opening_hours: '',
    is_sponsored: false,
    is_verified: false,
  },
  {
    id: 'pub-2',
    title: 'Park za pse Banja Luka',
    category_key: 'dog_park',
    city: 'Banja Luka',
    address: 'Banja Luka, BiH',
    latitude: 44.7685,
    longitude: 17.1855,
    phone: '',
    website: '',
    maps_url: '',
    opening_hours: '',
    is_sponsored: false,
    is_verified: false,
  },
  {
    id: 'pub-3',
    title: 'Pet friendly kafić Banja Luka',
    category_key: 'pet_friendly_cafe',
    city: 'Banja Luka',
    address: 'Banja Luka, BiH',
    latitude: 44.7742,
    longitude: 17.1928,
    phone: '',
    website: '',
    maps_url: '',
    opening_hours: '',
    is_sponsored: false,
    is_verified: false,
  },
  {
    id: 'pub-4',
    title: 'Groomer Banja Luka',
    category_key: 'groomer',
    city: 'Banja Luka',
    address: 'Banja Luka, BiH',
    latitude: 44.7708,
    longitude: 17.1877,
    phone: '',
    website: '',
    maps_url: '',
    opening_hours: '',
    is_sponsored: false,
    is_verified: false,
  },
  {
    id: 'pub-5',
    title: 'Azil za pse Banja Luka',
    category_key: 'shelter',
    city: 'Banja Luka',
    address: 'Banja Luka, BiH',
    latitude: 44.7805,
    longitude: 17.205,
    phone: '',
    website: '',
    maps_url: '',
    opening_hours: '',
    is_sponsored: false,
    is_verified: false,
  },
]

function createEmojiIcon(icon, color = '#171512') {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:40px;
        height:40px;
        border-radius:9999px;
        background:${color};
        color:white;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:18px;
        border:2px solid rgba(255,255,255,0.15);
        box-shadow:0 6px 16px rgba(0,0,0,0.25);
      ">
        ${icon}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -16],
  })
}

function RecenterMap({ center }) {
  const map = useMap()

  useEffect(() => {
    map.setView(center, 13)
  }, [center, map])

  return null
}

export default function DogramMap() {
  const [categoryKey, setCategoryKey] = useState('dog_park')
  const [city, setCity] = useState('Banja Luka')
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(false)
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER)

  const categories = useMemo(() => Object.values(MAP_CATEGORIES), [])

  useEffect(() => {
    loadPlaces()
  }, [categoryKey, city])

  function getCityCenter(cityName) {
    const cityMap = {
      'Banja Luka': [44.7722, 17.1910],
      Sarajevo: [43.8563, 18.4131],
      Tuzla: [44.5384, 18.6671],
      Mostar: [43.3438, 17.8078],
      Zenica: [44.2034, 17.9077],
      Beograd: [44.7866, 20.4489],
      Zagreb: [45.8150, 15.9819],
      Wien: [48.2082, 16.3738],
      Vienna: [48.2082, 16.3738],
      Berlin: [52.5200, 13.4050],
      Paris: [48.8566, 2.3522],
      London: [51.5072, -0.1276],
      NewYork: [40.7128, -74.0060],
      'New York': [40.7128, -74.0060],
    }

    return cityMap[cityName] || DEFAULT_CENTER
  }

  async function loadPlaces() {
    setLoading(true)
    try {
      const filteredPublic = publicPlacesSeed.filter((place) => {
        const sameCategory = place.category_key === categoryKey
        const sameCity =
          String(place.city || '').toLowerCase().includes(city.toLowerCase()) ||
          String(place.address || '').toLowerCase().includes(city.toLowerCase())

        return sameCategory && sameCity
      })

      const { data: sponsored, error } = await supabase
        .from('sponsored_places')
        .select('*')
        .eq('is_active', true)
        .eq('category_key', categoryKey)
        .ilike('city', `%${city}%`)

      if (error) throw error

      const merged = mergePlaces(filteredPublic, sponsored || [])
      setPlaces(merged)
      setMapCenter(getCityCenter(city))
    } catch (error) {
      console.error('Greška pri učitavanju lokacija:', error)
      setPlaces([])
      setMapCenter(getCityCenter(city))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-white/10 bg-[#171512] p-4">
        <h1 className="text-2xl font-black text-white">Dogram mapa</h1>
        <p className="mt-2 text-sm text-gray-400">
          Ulična mapa sa lokacijama za pse i posebnim oznakama po kategorijama.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Unesi grad, npr. Banja Luka"
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
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#171512]">
        <div className="h-[520px] w-full">
          <MapContainer
            center={mapCenter}
            zoom={13}
            scrollWheelZoom={true}
            className="h-full w-full z-0"
          >
            <RecenterMap center={mapCenter} />

            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {places.map((place) => {
              const category = MAP_CATEGORIES[place.category_key]
              const icon = createEmojiIcon(category?.icon || '📍', category?.color || '#171512')

              return (
                <Marker
                  key={place.id || `${place.title}-${place.latitude}-${place.longitude}`}
                  position={[place.latitude, place.longitude]}
                  icon={icon}
                >
                  <Popup>
                    <div className="min-w-[220px]">
                      <div className="font-bold text-sm">{place.title}</div>
                      <div className="mt-1 text-xs text-gray-600">{place.address}</div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {place.is_sponsored && (
                          <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-700">
                            Sponzorisano
                          </span>
                        )}
                        {place.is_verified && (
                          <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-semibold text-green-700">
                            Verified
                          </span>
                        )}
                      </div>

                      {place.opening_hours ? (
                        <div className="mt-3 text-xs">
                          <strong>Radno vrijeme:</strong>
                          <br />
                          {place.opening_hours}
                        </div>
                      ) : null}

                      {place.phone ? (
                        <div className="mt-2 text-xs">
                          <strong>Telefon:</strong> {place.phone}
                        </div>
                      ) : null}

                      {place.website ? (
                        <div className="mt-2">
                          <a
                            href={place.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold text-blue-600"
                          >
                            Otvori web stranicu
                          </a>
                        </div>
                      ) : null}
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </MapContainer>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#171512] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Rezultati</h2>
          <span className="text-sm text-gray-400">
            {loading ? 'Učitavanje...' : `${places.length} lokacija`}
          </span>
        </div>

        <div className="space-y-3">
          {places.map((place) => {
            const category = MAP_CATEGORIES[place.category_key]

            return (
              <div
                key={place.id || `${place.title}-${place.latitude}-${place.longitude}-card`}
                className="rounded-3xl border border-white/10 bg-[#0f0e0c] p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-white">
                    {category?.icon} {place.title}
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

                {place.opening_hours ? (
                  <p className="mt-2 text-sm text-gray-300">
                    <strong>Radno vrijeme:</strong> {place.opening_hours}
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-3">
                  {place.website ? (
                    <a
                      href={place.website}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl bg-[#e8a230] px-4 py-2 text-sm font-bold text-black"
                    >
                      Posjeti
                    </a>
                  ) : null}

                  {place.phone ? (
                    <a
                      href={`tel:${place.phone}`}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Pozovi
                    </a>
                  ) : null}
                </div>
              </div>
            )
          })}

          {!loading && places.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-[#0f0e0c] p-6 text-center text-sm text-gray-400">
              Nema rezultata za ovu kategoriju i grad.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
