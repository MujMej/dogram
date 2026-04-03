import { useMemo, useState } from 'react'

const sheltersData = [
  {
    id: 1,
    name: 'Azil Banja Luka',
    city: 'Banja Luka',
    type: 'Azil',
    phone: '+387 65 000 111',
    email: 'azilbl@example.com',
    address: 'Banja Luka, BiH',
    dogs: 34,
    urgent: true,
    description: 'Azil sa velikim brojem pasa koji čekaju dom. Posebno traže privremeni smještaj za štence.',
  },
  {
    id: 2,
    name: 'Happy Paws Rescue',
    city: 'Prijedor',
    type: 'Rescue',
    phone: '+387 65 000 222',
    email: 'happypaws@example.com',
    address: 'Prijedor, BiH',
    dogs: 18,
    urgent: false,
    description: 'Manji rescue tim fokusiran na spašavanje napuštenih pasa i udomljavanje.',
  },
  {
    id: 3,
    name: 'Dom za pse “Njuškice”',
    city: 'Sarajevo',
    type: 'Azil',
    phone: '+387 65 000 333',
    email: 'njuskice@example.com',
    address: 'Sarajevo, BiH',
    dogs: 41,
    urgent: true,
    description: 'Azil sa hitnom potrebom za hranom, dekama i udomiteljima za starije pse.',
  },
]

const adoptableDogs = [
  {
    id: 1,
    name: 'Luna',
    age: '2 godine',
    size: 'Srednja',
    temperament: 'Nježna i mirna',
    vaccinated: true,
  },
  {
    id: 2,
    name: 'Rex',
    age: '1 godina',
    size: 'Veliki',
    temperament: 'Aktivan i razigran',
    vaccinated: true,
  },
  {
    id: 3,
    name: 'Maza',
    age: '8 mjeseci',
    size: 'Mala',
    temperament: 'Privržena i vesela',
    vaccinated: false,
  },
]

export default function Shelters() {
  const [cityFilter, setCityFilter] = useState('Sve')
  const [showUrgentOnly, setShowUrgentOnly] = useState(false)

  const cities = useMemo(() => {
    const unique = [...new Set(sheltersData.map((item) => item.city))]
    return ['Sve', ...unique]
  }, [])

  const filteredShelters = useMemo(() => {
    return sheltersData.filter((item) => {
      const cityMatch = cityFilter === 'Sve' || item.city === cityFilter
      const urgentMatch = !showUrgentOnly || item.urgent
      return cityMatch && urgentMatch
    })
  }, [cityFilter, showUrgentOnly])

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-[#171512] p-5 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">Azili & adopcija</h1>
            <p className="mt-2 text-sm text-gray-400">
              Pronađi azile, podrži spašavanje i upoznaj pse koji traže dom.
            </p>
          </div>
          <div className="rounded-2xl bg-[#e8a230]/15 px-3 py-2 text-xs font-semibold text-[#e8a230]">
            ❤️ Udomi, ne kupuj
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#171512] p-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold">Filteri</h2>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="rounded-2xl border border-white/10 bg-[#0f0e0c] px-4 py-3 text-sm text-white outline-none"
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowUrgentOnly((prev) => !prev)}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                showUrgentOnly
                  ? 'bg-[#e8a230] text-black'
                  : 'border border-white/10 bg-[#0f0e0c] text-white'
              }`}
            >
              {showUrgentOnly ? 'Prikaz: hitni slučajevi' : 'Prikaži samo hitne'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredShelters.length > 0 ? (
            filteredShelters.map((shelter) => (
              <div
                key={shelter.id}
                className="rounded-3xl border border-white/10 bg-[#0f0e0c] p-4"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{shelter.name}</h3>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-300">
                    {shelter.type}
                  </span>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-300">
                    {shelter.city}
                  </span>
                  {shelter.urgent && (
                    <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-300">
                      Hitno
                    </span>
                  )}
                </div>

                <p className="mb-4 text-sm leading-6 text-gray-400">{shelter.description}</p>

                <div className="grid grid-cols-1 gap-3 text-sm text-gray-300 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/5 p-3">
                    <span className="block text-xs uppercase tracking-wide text-gray-500">Adresa</span>
                    <span>{shelter.address}</span>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3">
                    <span className="block text-xs uppercase tracking-wide text-gray-500">Broj pasa</span>
                    <span>{shelter.dogs}</span>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3">
                    <span className="block text-xs uppercase tracking-wide text-gray-500">Telefon</span>
                    <span>{shelter.phone}</span>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3">
                    <span className="block text-xs uppercase tracking-wide text-gray-500">Email</span>
                    <span>{shelter.email}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href={`tel:${shelter.phone.replace(/\s+/g, '')}`}
                    className="rounded-2xl bg-[#e8a230] px-4 py-3 text-sm font-bold text-black transition hover:scale-[1.01]"
                  >
                    Pozovi
                  </a>
                  <a
                    href={`mailto:${shelter.email}?subject=Upit za udomljavanje`}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white"
                  >
                    Pošalji email
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 bg-[#0f0e0c] p-6 text-center text-sm text-gray-400">
              Nema rezultata za izabrani filter.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#171512] p-4">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-white">Psi za udomljavanje</h2>
          <p className="mt-1 text-sm text-gray-400">
            Primjer prikaza pasa koji mogu biti istaknuti u aplikaciji.
          </p>
        </div>

        <div className="space-y-3">
          {adoptableDogs.map((dog) => (
            <div
              key={dog.id}
              className="rounded-3xl border border-white/10 bg-[#0f0e0c] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold">{dog.name}</h3>
                  <p className="mt-1 text-sm text-gray-400">
                    {dog.age} • {dog.size}
                  </p>
                </div>
                <span className="rounded-full bg-[#e8a230]/15 px-3 py-1 text-xs font-semibold text-[#e8a230]">
                  {dog.vaccinated ? 'Vakcinisan' : 'Provjeriti vakcinaciju'}
                </span>
              </div>

              <p className="mt-3 text-sm text-gray-300">{dog.temperament}</p>

              <button className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white">
                Zatraži više informacija
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
