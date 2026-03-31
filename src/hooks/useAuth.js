import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Provjeri trenutnu sesiju
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Slušaj promjene (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
  }

  return { user, loading, logout }
}

// src/hooks/useDog.js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useDog() {
  const { user } = useAuth()
  const [dogs, setDogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Dohvati sve pse trenutnog korisnika
  useEffect(() => {
    if (!user) return
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
    else setDogs(data)
    setLoading(false)
  }

  // Dodaj novog psa
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

  // Ažuriraj psa
  const updateDog = async (dogId, updates) => {
    const { data, error } = await supabase
      .from('dogs')
      .update(updates)
      .eq('id', dogId)
      .eq('owner_id', user.id)
      .select()
      .single()

    if (error) return { error }
    setDogs(prev => prev.map(d => d.id === dogId ? data : d))
    return { data }
  }

  // Upload slike psa
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

    // Sačuvaj URL u bazu
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

// src/hooks/useFeed.js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useFeed() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchFeed()
  }, [])

  // Dohvati feed (svi javni postovi, najnoviji prvi)
  const fetchFeed = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('feed_posts')   // view koji smo napravili u schema.sql
      .select('*')
      .limit(30)

    if (!error) setPosts(data || [])
    setLoading(false)
  }

  // Napravi novi post
  const createPost = async ({ dogId, caption, locationName, imageFile }) => {
    if (!imageFile || !dogId) return { error: 'Nedostaju podaci.' }
    setUploading(true)

    // 1. Upload slike
    const ext = imageFile.name.split('.').pop()
    const fileName = `${Date.now()}.${ext}`
    const filePath = `posts/${user.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('posts')
      .upload(filePath, imageFile)

    if (uploadError) { setUploading(false); return { error: uploadError.message } }

    const { data: { publicUrl } } = supabase.storage
      .from('posts')
      .getPublicUrl(filePath)

    // 2. Sačuvaj post u bazu
    const { data, error } = await supabase
      .from('posts')
      .insert([{
        dog_id: dogId,
        owner_id: user.id,
        caption,
        image_url: publicUrl,
        location_name: locationName || null,
      }])
      .select()
      .single()

    setUploading(false)
    if (error) return { error: error.message }

    // Dodaj na vrh feeda odmah (optimistic update)
    fetchFeed()
    return { data }
  }

  // Lajkaj / unlajkaj
  const toggleLike = async (postId) => {
    if (!user) return

    // Provjeri da li već postoji lajk
    const { data: existing } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      // Ukloni lajk
      await supabase.from('post_likes').delete().eq('id', existing.id)
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, likes_count: p.likes_count - 1, liked_by_me: false }
          : p
      ))
    } else {
      // Dodaj lajk
      await supabase.from('post_likes').insert([{ post_id: postId, user_id: user.id }])
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, likes_count: Number(p.likes_count) + 1, liked_by_me: true }
          : p
      ))
    }
  }

  // Dohvati komentare za post
  const fetchComments = async (postId) => {
    const { data } = await supabase
      .from('post_comments')
      .select('*, profiles(username, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    return data || []
  }

  // Dodaj komentar
  const addComment = async (postId, content) => {
    if (!content.trim()) return
    const { data, error } = await supabase
      .from('post_comments')
      .insert([{ post_id: postId, user_id: user.id, content }])
      .select('*, profiles(username)')
      .single()

    if (!error) {
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, comments_count: Number(p.comments_count) + 1 }
          : p
      ))
    }
    return { data, error }
  }

  return {
    posts,
    loading,
    uploading,
    fetchFeed,
    createPost,
    toggleLike,
    fetchComments,
    addComment,
  }
}
