import { useEffect, useState } from 'react'
import { useDog } from '../hooks/useDog'

const BREEDS = [
  'Mješanac', 'Zlatni Retriver', 'Labrador', 'Njemački Ovčar',
  'Francuski Buldog', 'Buldog', 'Pudlica', 'Beagle', 'Rottweiler',
  'Doberman', 'Boxer', 'Husky', 'Maltezer', 'Yorkšir Terijer',
  'Dalmatinac', 'Cocker Španijel', 'Border Koli', 'Ših Cu', 'Ostalo'
]

const INITIAL = {
  name: '',
  breed: '',
  is_mix: false,
  birth_date: '',
  weight_kg: '',
  gender: '',
  is_neutered: false,
  activity_level: 'medium',
  bio: '',
  is_public: true,
}

export default function AddDogForm({ onSuccess, onCancel }) {
  const { addDog, uploadDogAvatar } = useDog()
  const [form, setForm] = useState(INITIAL)
  const [avatarFile, setAvatarFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const handleAvatar = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Dozvoljene su samo slike.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Slika ne smije biti veća od 5 MB.')
      return
    }

    if (preview) URL.revokeObjectURL(preview)

    setError('')
    setAvatarFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError('Ime psa je obavezno.')
      return
    }

    if (!form.gender) {
      setError('Odaberi spol.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const dogData = {
        ...form,
        name: form.name.trim(),
        breed: form.breed || null,
        bio: form.bio?.trim() || null,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
        birth_date: form.birth_date || null,
      }

      const { data, error } = await addDog(dogData)

      if (error) {
        throw new Error(error.message || 'Greška pri dodavanju psa.')
      }

      if (avatarFile && data?.id) {
        const { error: avatarError } = await uploadDogAvatar(data.id, avatarFile)
        if (avatarError) {
          throw new Error(avatarError.message || 'Pas je dodat, ali upload slike nije uspio.')
        }
      }

      setForm(INITIAL)
      setAvatarFile(null)
      if (preview) URL.revokeObjectURL(preview)
      setPreview(null)
      setStep(1)

      onSuccess?.(data)
    } catch (err) {
      setError(err.message || 'Greška pri dodavanju. Pokušaj ponovo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#1a1916] rounded-2xl p-6 border border-white/10">
      <div className="flex gap-2 mb-6">
        {[1, 2].map(s => (
          <div
            key={s}
            className={`flex-1 h-1 rounded-full transition-all ${
              step >= s ? 'bg-[#e8a230]' : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4">🐶 Osnovni podaci</h2>

          <div className="flex justify-center mb-2">
            <label className="cursor-pointer">
              <div className="w-24 h-24 rounded-full bg-[#222120] border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden hover:border-[#e8a230] transition-colors">
                {preview
                  ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  : <span className="text-4xl">🐾</span>}
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">Dodaj sliku</p>
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
            </label>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Ime psa *</label>
            <input
              type="text"
              placeholder="npr. Loki"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              className="w-full bg-[#222120] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-[#e8a230] transition-colors"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Rasa</label>
            <select
              value={form.breed}
              onChange={e => set('breed', e.target.value)}
              className="w-full bg-[#222120] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#e8a230] transition-colors"
            >
              <option value="">Odaberi rasu</option>
              {BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Spol *</label>
            <div className="flex gap-3">
              {[
                { val: 'male', label: '♂ Mužjak' },
                { val: 'female', label: '♀ Ženka' }
              ].map(({ val, label }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => set('gender', val)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                    form.gender === val
                      ? 'bg-[#e8a230] border-[#e8a230] text-black'
                      : 'bg-[#222120] border-white/10 text-gray-400 hover:border-white/30'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Datum rođenja</label>
            <input
              type="date"
              value={form.birth_date}
              onChange={e => set('birth_date', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full bg-[#222120] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#e8a230] transition-colors"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="button"
            onClick={() => {
              if (!form.name.trim()) {
                setError('Ime je obavezno.')
                return
              }
              if (!form.gender) {
                setError('Odaberi spol.')
                return
              }
              setError('')
              setStep(2)
            }}
            className="w-full bg-[#e8a230] text-black font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            Dalje →
          </button>

          {onCancel && (
            <button type="button" onClick={onCancel} className="w-full text-gray-500 text-sm py-2">
              Otkaži
            </button>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4">🏃 Detalji</h2>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Težina (kg)</label>
            <input
              type="number"
              placeholder="npr. 28"
              value={form.weight_kg}
              onChange={e => set('weight_kg', e.target.value)}
              min="0.5"
              max="120"
              step="0.5"
              className="w-full bg-[#222120] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-[#e8a230] transition-colors"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Nivo aktivnosti</label>
            <div className="flex gap-2">
              {[
                { val: 'low', label: '🐌 Mirna' },
                { val: 'medium', label: '🚶 Srednja' },
                { val: 'high', label: '🏃 Visoka' },
              ].map(({ val, label }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => set('activity_level', val)}
                  className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-all ${
                    form.activity_level === val
                      ? 'bg-[#e8a230] border-[#e8a230] text-black'
                      : 'bg-[#222120] border-white/10 text-gray-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div
            className="flex items-center justify-between bg-[#222120] rounded-xl px-4 py-3 cursor-pointer"
            onClick={() => set('is_neutered', !form.is_neutered)}
          >
            <span className="text-sm">Sterilizovan/a</span>
            <div className={`w-11 h-6 rounded-full transition-colors ${form.is_neutered ? 'bg-[#e8a230]' : 'bg-white/10'}`}>
              <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition-transform ${form.is_neutered ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </div>

          <div
            className="flex items-center justify-between bg-[#222120] rounded-xl px-4 py-3 cursor-pointer"
            onClick={() => set('is_public', !form.is_public)}
          >
            <div>
              <span className="text-sm block">Javni profil</span>
              <span className="text-xs text-gray-500">Vidljiv u feedu</span>
            </div>
            <div className={`w-11 h-6 rounded-full transition-colors ${form.is_public ? 'bg-[#e8a230]' : 'bg-white/10'}`}>
              <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition-transform ${form.is_public ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Bio</label>
            <textarea
              placeholder="Nešto o tvom psu..."
              value={form.bio}
              onChange={e => set('bio', e.target.value)}
              rows={3}
              maxLength={200}
              className="w-full bg-[#222120] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-[#e8a230] transition-colors resize-none"
            />
            <p className="text-xs text-gray-600 text-right mt-1">{form.bio.length}/200</p>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#e8a230] text-black font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Čuvanje...' : '🐾 Dodaj psa'}
          </button>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full text-gray-500 text-sm py-2"
          >
            ← Nazad
          </button>
        </div>
      )}
    </div>
  )
}
