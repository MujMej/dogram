// src/components/NewPost.jsx
import { useState } from 'react'
import { useFeed } from '../hooks/useFeed'
import { useDog } from '../hooks/useDog'

export default function NewPost({ onSuccess, onCancel }) {
  const { createPost, uploading } = useFeed()
  const { dogs } = useDog()

  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [caption, setCaption] = useState('')
  const [locationName, setLocationName] = useState('')
  const [selectedDog, setSelectedDog] = useState(dogs[0]?.id || '')
  const [error, setError] = useState('')

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setError('Slika je prevelika. Max 10MB.')
      return
    }
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
    setError('')
  }

  const handleSubmit = async () => {
    if (!imageFile) { setError('Dodaj sliku.'); return }
    if (!selectedDog) { setError('Odaberi psa.'); return }

    const { error } = await createPost({
      dogId: selectedDog,
      caption,
      locationName,
      imageFile,
    })

    if (error) { setError(error); return }
    onSuccess?.()
  }

  return (
    <div className="bg-[#1a1916] rounded-2xl border border-white/10 overflow-hidden">

      {/* Image picker */}
      <label className="cursor-pointer block">
        <div className={`relative w-full aspect-square bg-[#222120] flex items-center justify-center overflow-hidden ${!preview ? 'border-b border-white/10' : ''}`}>
          {preview
            ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
            : (
              <div className="text-center">
                <div className="text-5xl mb-3">📸</div>
                <p className="text-gray-400 text-sm font-medium">Dodaj sliku</p>
                <p className="text-gray-600 text-xs mt-1">Max 10MB</p>
              </div>
            )
          }
          {preview && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-full">Zamijeni</span>
            </div>
          )}
        </div>
        <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
      </label>

      <div className="p-5 space-y-4">

        {/* Odabir psa */}
        {dogs.length > 1 && (
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Koji pas?</label>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {dogs.map(dog => (
                <button
                  key={dog.id}
                  onClick={() => setSelectedDog(dog.id)}
                  className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
                    selectedDog === dog.id
                      ? 'bg-[#e8a230] border-[#e8a230] text-black font-semibold'
                      : 'bg-[#222120] border-white/10 text-gray-400'
                  }`}
                >
                  <span>🐾</span> {dog.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Caption */}
        <div>
          <textarea
            placeholder="Napiši nešto o ovom trenutku..."
            value={caption}
            onChange={e => setCaption(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full bg-[#222120] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-[#e8a230] transition-colors resize-none text-sm"
          />
          <p className="text-xs text-gray-600 text-right mt-1">{caption.length}/500</p>
        </div>

        {/* Lokacija */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">📍</span>
          <input
            type="text"
            placeholder="Dodaj lokaciju (opcionalno)"
            value={locationName}
            onChange={e => setLocationName(e.target.value)}
            className="w-full bg-[#222120] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 outline-none focus:border-[#e8a230] transition-colors text-sm"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition-colors"
            >
              Otkaži
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={uploading || !imageFile}
            className="flex-1 py-3 rounded-xl bg-[#e8a230] text-black font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {uploading ? 'Objavljujem...' : '📤 Objavi'}
          </button>
        </div>
      </div>
    </div>
  )
}
