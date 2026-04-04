import { useEffect, useRef, useState } from 'react'
import { useDog } from '../hooks/useDog'

const BREEDS = [
  'Mješanac', 'Zlatni Retriver', 'Labrador', 'Njemački Ovčar',
  'Francuski Buldog', 'Buldog', 'Pudlica', 'Beagle', 'Rottweiler',
  'Doberman', 'Boxer', 'Husky', 'Maltezer', 'Yorkšir Terijer',
  'Dalmatinac', 'Cocker Španijel', 'Border Koli', 'Ših Cu', 'Ostalo',
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
  const fileInputRef = useRef(null)

  const [form, setForm] = useState(INITIAL)
  const [avatarFile, setAvatarFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  useEffect(() => {
    if (error) {
      setError('')
    }
  }, [form])

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }))

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

    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview)
    }

    setError('')
    setAvatarFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const goToStepTwo = () => {
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

    if (form.weight_kg && Number.isNaN(parseFloat(form.weight_kg))) {
      setError('Težina mora biti broj.')
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

      if (error || !data) {
        throw new Error(error?.message || 'Dodavanje nije uspjelo.')
      }

      if (avatarFile && data.id) {
        const { error: avatarError } = await uploadDogAvatar(data.id, avatarFile)

        if (avatarError) {
          throw new Error(
            avatarError.message || 'Pas je dodat, ali upload slike nije uspio.'
          )
        }
      }

      setForm(INITIAL)
      setAvatarFile(null)

      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview)
      }

      setPreview(null)
      setStep(1)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      onSuccess?.(data)
    } catch (err) {
      setError(err.message || 'Greška pri dodavanju. Pokušaj ponovo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#1a1916] p-6">
      <div className="mb-6 flex gap-2">
        {[1, 2].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-all ${
              step >= s ? 'bg-[#e8a230]' : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="mb-4 text-xl font-bold">🐶 Osnovni podaci</h2>

          <div className="mb-2 flex justify-center">
            <label className="cursor-pointer">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-white/20 bg-[#222120] transition-colors hover:border-[#e8a230]">
                {preview ? (
                  <img
                    src={preview}
                    alt="Pregled slike psa"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-4xl">🐾</span>
                )}
              </div>

              <p className="mt-2 text-center text-xs text-gray-500">Dodaj sliku</p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatar}
              />
            </label>
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-400">Ime psa *</label>
            <input
              type="text"
              placeholder="npr. Loki"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#222120] px-4 py-3 text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[#e8a230]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-400">Rasa</label>
            <select
              value={form.breed}
              onChange={(e) => set('breed', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#222120] px-4 py-3 text-white outline-none transition-colors focus:border-[#e8a230]"
            >
              <option value="">Odaberi rasu</option>
              {BREEDS.map((breed) => (
                <option key={breed} value={breed}>
                  {breed}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">Spol *</label>
            <div className="flex gap-3">
              {[
                { val: 'male', label: '♂ Mužjak' },
                { val: 'female', label: '♀ Ženka' },
              ].map(({ val, label }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => set('gender', val)}
                  className={`flex-1 rounded-xl border py-3 text-sm font-medium transition-all ${
                    form.gender === val
                      ? 'border-[#e8a230] bg-[#e8a230] text-black'
                      : 'border-white/10 bg-[#222120] text-gray-400 hover:border-white/30'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-400">Datum rođenja</label>
            <input
              type="date"
              value={form.birth_date}
              onChange={(e) => set('birth_date', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full rounded-xl border border-white/10 bg-[#222120] px-4 py-3 text-white outline-none transition-colors focus:border-[#e8a230]"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="button"
            onClick={goToStepTwo}
            className="w-full rounded-xl bg-[#e8a230] py-3 font-bold text-black transition-opacity hover:opacity-90"
          >
            Dalje →
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2 text-sm text-gray-500"
            >
              Otkaži
            </button>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="mb-4 text-xl font-bold">🏃 Detalji</h2>

          <div>
            <label className="mb-1 block text-sm text-gray-400">Težina (kg)</label>
            <input
              type="number"
              placeholder="npr. 28"
              value={form.weight_kg}
              onChange={(e) => set('weight_kg', e.target.value)}
              min="0.5"
              max="120"
              step="0.5"
              className="w-full rounded-xl border border-white/10 bg-[#222120] px-4 py-3 text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[#e8a230]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">Nivo aktivnosti</label>
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
                  className={`flex-1 rounded-xl border py-2 text-xs font-medium transition-all ${
                    form.activity_level === val
                      ? 'border-[#e8a230] bg-[#e8a230] text-black'
                      : 'border-white/10 bg-[#222120] text-gray-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div
            className="flex cursor-pointer items-center justify-between rounded-xl bg-[#222120] px-4 py-3"
            onClick={() => set('is_neutered', !form.is_neutered)}
          >
            <span className="text-sm">Sterilizovan/a</span>
            <div
              className={`h-6 w-11 rounded-full transition-colors ${
                form.is_neutered ? 'bg-[#e8a230]' : 'bg-white/10'
              }`}
            >
              <div
                className={`m-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  form.is_neutered ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          <div
            className="flex cursor-pointer items-center justify-between rounded-xl bg-[#222120] px-4 py-3"
            onClick={() => set('is_public', !form.is_public)}
          >
            <div>
              <span className="block text-sm">Javni profil</span>
              <span className="text-xs text-gray-500">Vidljiv u feedu</span>
            </div>
            <div
              className={`h-6 w-11 rounded-full transition-colors ${
                form.is_public ? 'bg-[#e8a230]' : 'bg-white/10'
              }`}
            >
              <div
                className={`m-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  form.is_public ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-400">Bio</label>
            <textarea
              placeholder="Nešto o tvom psu..."
              value={form.bio}
              onChange={(e) => set('bio', e.target.value)}
              rows={3}
              maxLength={200}
              className="w-full resize-none rounded-xl border border-white/10 bg-[#222120] px-4 py-3 text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[#e8a230]"
            />
            <p className="mt-1 text-right text-xs text-gray-600">{form.bio.length}/200</p>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-xl bg-[#e8a230] py-3 font-bold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Čuvanje...' : '🐾 Dodaj psa'}
          </button>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full py-2 text-sm text-gray-500"
          >
            ← Nazad
          </button>
        </div>
      )}
    </div>
  )
}
