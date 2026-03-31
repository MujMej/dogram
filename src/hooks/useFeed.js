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

  const fetchFeed = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('feed_posts')
      .select('*')
      .limit(30)

    if (!error) setPosts(data || [])
    setLoading(false)
  }

  const createPost = async ({ dogId, caption, locationName, imageFile }) => {
    if (!user) return { error: 'Korisnik nije prijavljen.' }
    if (!imageFile || !dogId) return { error: 'Nedostaju podaci.' }

    setUploading(true)

    const ext = imageFile.name.split('.').pop()
    const fileName = `${Date.now()}.${ext}`
    const filePath = `posts/${user.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('posts')
      .upload(filePath, imageFile)

    if (uploadError) {
      setUploading(false)
      return { error: uploadError.message }
    }

    const { data: { publicUrl } } = supabase.storage
      .from('posts')
      .getPublicUrl(filePath)

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

    fetchFeed()
    return { data }
  }

  const toggleLike = async (postId) => {
    if (!user) return

    const { data: existing } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      await supabase.from('post_likes').delete().eq('id', existing.id)
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, likes_count: p.likes_count - 1, liked_by_me: false }
          : p
      ))
    } else {
      await supabase.from('post_likes').insert([{ post_id: postId, user_id: user.id }])
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, likes_count: Number(p.likes_count) + 1, liked_by_me: true }
          : p
      ))
    }
  }

  const fetchComments = async (postId) => {
    const { data } = await supabase
      .from('post_comments')
      .select('*, profiles(username, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    return data || []
  }

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
