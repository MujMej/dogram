import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useDog() {
  const { user } = useAuth()
  const [dogs, setDogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      setDogs([])
      setLoading(false)
      return
    }
    fetchMyDogs()
  }, [user])

  const fetchMyDogs = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('dogs')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setDogs(data || [])

    setLoading(false)
  }

  const addDog = async (dogData) => {
    const { data, error } = await supabase
      .from('dogs')
      .insert([{ ...dogData, owner_id: user.id }])
      .select()
      .single()

    if (error) return { error }

    setDogs(prev => [data, ...prev])
    return { data }
  }

  const updateDog = async (dogId, updates) => {
    const { data, error } = await supabase
      .from('dogs')
      .update(updates)
      .eq('id', dogId)
      .eq('owner_id', user.id)
      .select()
      .single()

    if (error) return { error }

    setDogs(prev => prev.map(d => (d.id === dogId ? data : d)))
    return { data }
  }

  const uploadDogAvatar = async (dogId, file) => {
    const fileExt = file.name.split('.').pop()
    const filePath = `dogs/${dogId}/avatar.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) return { error: uploadError }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    await updateDog(dogId, { avatar_url: publicUrl })
    return { url: publicUrl }
  }

  return {
    dogs,
    loading,
    error,
    addDog,
    updateDog,
    uploadDogAvatar,
    refetch: fetchMyDogs
  }
}
