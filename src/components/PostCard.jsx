// src/components/PostCard.jsx
import { useState } from 'react'
import { useFeed } from '../hooks/useFeed'
import { useAuth } from '../hooks/useAuth'

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60) return 'upravo'
  if (diff < 3600) return `${Math.floor(diff / 60)}min`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`
  return new Date(dateStr).toLocaleDateString('bs-BA')
}

export default function PostCard({ post }) {
  const { user } = useAuth()
  const { toggleLike, fetchComments, addComment } = useFeed()
  const [liked, setLiked] = useState(post.liked_by_me || false)
  const [likesCount, setLikesCount] = useState(Number(post.likes_count) || 0)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)

  const handleLike = async () => {
    // Optimistic update
    setLiked(prev => !prev)
    setLikesCount(prev => liked ? prev - 1 : prev + 1)
    await toggleLike(post.id)
  }

  const handleComments = async () => {
    if (!showComments) {
      setLoadingComments(true)
      const data = await fetchComments(post.id)
      setComments(data)
      setLoadingComments(false)
    }
    setShowComments(prev => !prev)
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    const { data } = await addComment(post.id, newComment)
    if (data) {
      setComments(prev => [...prev, data])
      setNewComment('')
    }
  }

  return (
    <div className="bg-[#1a1916] rounded-2xl border border-white/10 overflow-hidden mb-4">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-10 h-10 rounded-full bg-[#2a2520] flex items-center justify-center text-xl overflow-hidden flex-shrink-0">
          {post.dog_avatar
            ? <img src={post.dog_avatar} alt={post.dog_name} className="w-full h-full object-cover" />
            : '🐾'
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{post.dog_name}</p>
          <p className="text-xs text-gray-500">
            {post.dog_breed && `${post.dog_breed} · `}
            {post.location_name && `📍 ${post.location_name} · `}
            {timeAgo(post.created_at)}
          </p>
        </div>
        <button className="text-gray-600 hover:text-gray-400 transition-colors px-1">···</button>
      </div>

      {/* Slika */}
      <div className="w-full aspect-square bg-[#222120] overflow-hidden">
        <img
          src={post.image_url}
          alt="post"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Akcije */}
      <div className="px-4 pt-3 pb-1 flex items-center gap-4">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm font-medium transition-all active:scale-90 ${
            liked ? 'text-red-400' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <span className="text-xl">{liked ? '❤️' : '🤍'}</span>
          {likesCount > 0 && <span>{likesCount}</span>}
        </button>

        <button
          onClick={handleComments}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-300 transition-colors"
        >
          <span className="text-xl">💬</span>
          {post.comments_count > 0 && <span>{post.comments_count}</span>}
        </button>

        <button className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-300 transition-colors">
          <span className="text-xl">📤</span>
        </button>
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="px-4 pb-3">
          <p className="text-sm leading-relaxed">
            <span className="font-semibold text-[#e8a230] mr-1">{post.owner_username}</span>
            {post.caption}
          </p>
        </div>
      )}

      {/* Komentari */}
      {showComments && (
        <div className="border-t border-white/10 px-4 py-3">
          {loadingComments ? (
            <p className="text-gray-600 text-sm text-center py-2">Učitavanje...</p>
          ) : (
            <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
              {comments.length === 0 && (
                <p className="text-gray-600 text-sm text-center py-2">Nema komentara. Budi prvi!</p>
              )}
              {comments.map(c => (
                <div key={c.id} className="flex gap-2">
                  <span className="text-xs font-semibold text-[#e8a230] shrink-0">
                    {c.profiles?.username || 'korisnik'}
                  </span>
                  <span className="text-xs text-gray-300 leading-relaxed">{c.content}</span>
                </div>
              ))}
            </div>
          )}

          {/* Input za komentar */}
          {user && (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Dodaj komentar..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                className="flex-1 bg-[#222120] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 outline-none border border-white/10 focus:border-[#e8a230] transition-colors"
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-[#e8a230] text-black text-xs font-bold rounded-xl disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                Pošalji
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
