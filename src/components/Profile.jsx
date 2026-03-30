// src/pages/Profile.jsx
import { useState } from 'react'
import { useDog } from '../hooks/useDog'
import { useAuth } from '../hooks/useAuth'
import AddDogForm from '../components/AddDogForm'

function getAge(birthDate) {
  if (!birthDate) return null
  const birth = new Date(birthDate)
  const now = new Date()
  const years = now.getFullYear() - birth.getFullYear()
  const months = now.getMonth() - birth.getMonth()
  if (years === 0) return `${months} mj.`
  if (years === 1) return '1 god.'
  return `${years} god.`
}

function DogProfile({ dog }) {
  const activityLabel = {
    low: '🐌 Mirna',
    medium: '🚶 Srednja',
    high: '🏃 Visoka'
  }

  return (
    <div className="bg-[#1a1916] rounded-2xl border border-white/10 overflow-hidden">
      {/* Hero */}
      <div className="relative h-32 bg-gradient-to-br from-[#2a2520] to-[#1a1510] flex items-end px-5 pb-0">
        <div className="absolute inset-0 flex items-center justify-end pr-6 opacity-10 text-8xl pointer-events-none">
          🐾
        </div>
        <div className="relative mb-[-40px]">
          <div className="w-20 h-20 rounded-full bg-[#2a2520] border-4 border-[#1a1916] flex items-center justify-center text-4xl overflow-hidden">
            {dog.avatar_url
              ? <img src={dog.avatar_url} alt={dog.name} className="w-full h-full object-cover" />
              : '🐕'
            }
          </div>
        </div>
      </div>

      <div className="pt-12 px-5 pb-5">
        {/* Ime i rasa */}
        <div className="mb-4">
          <h2 className="text-2xl font-black">{dog.name}</h2>
          <p className="text-[#e8a230] text-sm font-medium">
            {dog.breed || 'Rasa nepoznata'}
            {dog.birth_date && ` · ${getAge(dog.birth_date)}`}
            {dog.gender && ` · ${dog.gender === 'male' ? '♂' : '♀'}`}
          </p>
        </div>

        {/* Statistike */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-[#222120] rounded-xl p-3 text-center">
            <div className="text-lg font-black text-[#e8a230]">
              {dog.weight_kg ? `${dog.weight_kg}kg` : '—'}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Težina</div>
          </div>
          <div className="bg-[#222120] rounded-xl p-3 text-center">
            <div className="text-lg font-black text-[#e8a230]">
              {dog.birth_date ? getAge(dog.birth_date) : '—'}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Starost</div>
          </div>
          <div className="bg-[#222120] rounded-xl p-3 text-center">
            <div className="text-sm font-bold text-[#e8a230]">
              {activityLabel[dog.activity_level] || '—'}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Aktivnost</div>
          </div>
        </div>

        {/* Bedževi */}
        <div className="flex flex-wrap gap-2 mb-4">
          {dog.is_neutered && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/15 text-green-400 border border-green-500/20">
              ✓ Sterilizovan/a
            </span>
          )}
          {dog.is_public && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#e8a230]/15 text-[#e8a230] border border-[#e8a230]/20">
              🌍 Javni profil
            </span>
          )}
        </div>

        {/* Bio */}
        {dog.bio && (
          <p className="text-sm text-gray-400 leading-relaxed mb-4">{dog.bio}</p>
        )}

        {/* Edit dugme */}
        <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-gray-300 hover:bg-white/10 transition-colors">
          ✏️ Uredi profil psa
        </button>
      </div>
    </div>
  )
}

export default function Profile() {
  const { user, logout } = useAuth()
  const { dogs, loading } = useDog()
  const [showForm, setShowForm] = useState(false)
  const [activeDog, setActiveDog] = useState(0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce">🐾</div>
          <p className="text-gray-500">Učitavanje...</p>
        </div>
      </div>
    )
  }

  // Nema pasa → pokaži formu za dodavanje
  if (dogs.length === 0 && !showForm) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-6xl mb-4">🐶</div>
        <h2 className="text-xl font-bold mb-2">Dodaj svog prvog psa!</h2>
        <p className="text-gray-500 text-sm mb-6">Kreiraj profil i pridruži se Dogram zajednici.</p>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#e8a230] text-black font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
        >
          + Dodaj psa
        </button>
      </div>
    )
  }

  if (showForm) {
    return (
      <div>
        <h1 className="text-xl font-bold mb-4">Novi pas</h1>
        <AddDogForm
          onSuccess={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Ako ima više pasa — tab switcher */}
      {dogs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {dogs.map((dog, i) => (
            <button
              key={dog.id}
              onClick={() => setActiveDog(i)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeDog === i
                  ? 'bg-[#e8a230] text-black'
                  : 'bg-[#1a1916] border border-white/10 text-gray-400'
              }`}
            >
              {dog.name}
            </button>
          ))}
        </div>
      )}

      {/* Profil aktivnog psa */}
      <DogProfile dog={dogs[activeDog]} />

      {/* Dodaj još jednog psa */}
      <button
        onClick={() => setShowForm(true)}
        className="w-full py-3 rounded-xl border border-dashed border-white/20 text-gray-500 text-sm hover:border-[#e8a230] hover:text-[#e8a230] transition-colors"
      >
        + Dodaj još jednog psa
      </button>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full py-3 rounded-xl text-red-400 text-sm hover:bg-red-400/10 transition-colors"
      >
        Odjavi se
      </button>
    </div>
  )
}
