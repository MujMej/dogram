import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

const MAX_AVATAR_SIZE_MB = 5
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export function useDog() {
  const { user } = useAuth()

  const [dogs, setDogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMyDogs = useCallback(async () => {
    if (!user?.id) {
      setDogs([])
      setError(null)
      setLoading(false)
      return { data: [], error: null }
    }

    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('dogs')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      setDogs([])
      setError(error.message || 'Greška pri učitavanju pasa.')
      setLoading(false)
      return { data: null, error }
    }

    setDogs(data || [])
    setLoading(false)
    return { data: data || [], error: null }
  }, [user])

  useEffect(() => {
    fetchMyDogs()
  }, [fetchMyDogs])

  const addDog = async (dogData) => {
    if (!user?.id) {
      const err = { message: 'Korisnik nije prijavljen.' }
      setError(err.message)
      return { data: null, error: err }
    }

    setError(null)

    const payload = {
      ...dogData,
      owner_id: user.id,
    }

    const { data, error } = await supabase
      .from('dogs')
      .insert([payload])
      .select()
      .single()

    if (error) {
      setError(error.message || 'Greška pri dodavanju psa.')
      return { data: null, error }
    }

    setDogs((prev) => [data, ...prev])
    return { data, error: null }
  }

  const updateDog = async (dogId, updates) => {
    if (!user?.id) {
      const err = { message: 'Korisnik nije prijavljen.' }
      setError(err.message)
      return { data: null, error: err }
    }

    if (!dogId) {
      const err = { message: 'Dog ID je obavezan.' }
      setError(err.message)
      return { data: null, error: err }
    }

    setError(null)

    const { data, error } = await supabase
      .from('dogs')
      .update(updates)
      .eq('id', dogId)
      .eq('owner_id', user.id)
      .select()
      .single()

    if (error) {
      setError(error.message || 'Greška pri ažuriranju psa.')
      return { data: null, error }
    }

    setDogs((prev) => prev.map((dog) => (dog.id === dogId ? data : dog)))
    return { data, error: null }
  }

  const deleteDog = async (dogId) => {
    if (!user?.id) {
      const err = { message: 'Korisnik nije prijavljen.' }
      setError(err.message)
      return { error: err }
    }

    if (!dogId) {
      const err = { message: 'Dog ID je obavezan.' }
      setError(err.message)
      return { error: err }
    }

    setError(null)

    const dogToDelete = dogs.find((d) => d.id === dogId)

    const { error: deleteError } = await supabase
      .from('dogs')
      .delete()
      .eq('id', dogId)
      .eq('owner_id', user.id)

    if (deleteError) {
      setError(deleteError.message || 'Greška pri brisanju psa.')
      return { error: deleteError }
    }

    setDogs((prev) => prev.filter((dog) => dog.id !== dogId))

    if (dogToDelete?.avatar_url) {
      try {
        const path = extractStoragePathFromPublicUrl(dogToDelete.avatar_url, 'avatars')
        if (path) {
          await supabase.storage.from('avatars').remove([path])
        }
      } catch (e) {
        console.warn('Avatar fajl nije obrisan iz storage-a:', e)
      }
    }

    return { error: null }
  }

  const uploadDogAvatar = async (dogId, file) => {
    if (!user?.id) {
      const err = { message: 'Korisnik nije prijavljen.' }
      setError(err.message)
      return { url: null, error: err }
    }

    if (!dogId) {
      const err = { message: 'Dog ID je obavezan.' }
      setError(err.message)
      return { url: null, error: err }
    }

    if (!file) {
      const err = { message: 'Fajl nije odabran.' }
      setError(err.message)
      return { url: null, error: err }
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      const err = { message: 'Dozvoljeni formati su JPG, PNG i WEBP.' }
      setError(err.message)
      return { url: null, error: err }
    }

    if (file.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
      const err = { message: `Slika ne smije biti veća od ${MAX_AVATAR_SIZE_MB} MB.` }
      setError(err.message)
      return { url: null, error: err }
    }

    setError(null)

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const filePath = `dogs/${dogId}/avatar-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      setError(uploadError.message || 'Greška pri uploadu avatara.')
      return { url: null, error: uploadError }
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(filePath)

    const { error: updateError } = await updateDog(dogId, { avatar_url: publicUrl })

    if (updateError) {
      await supabase.storage.from('avatars').remove([filePath])
      return { url: null, error: updateError }
    }

    return { url: publicUrl, error: null }
  }

  return {
    dogs,
    loading,
    error,
    addDog,
    updateDog,
    deleteDog,
    uploadDogAvatar,
    refetch: fetchMyDogs,
  }
}

function extractStoragePathFromPublicUrl(url, bucketName) {
  if (!url || !bucketName) return null

  const marker = `/storage/v1/object/public/${bucketName}/`
  const index = url.indexOf(marker)

  if (index === -1) return null

  return decodeURIComponent(url.slice(index + marker.length))
}
