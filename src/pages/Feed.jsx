// src/pages/Feed.jsx
import { useState } from 'react'
import { useFeed } from '../features/useFeed'
import { useDog } from '../features/useDog'
import PostCard from '../components/PostCard'
import NewPost from '../components/NewPost'

function Stories({ dogs }) {
  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 mb-4">
      {/* Moj pas — uvijek prvi */}
      {dogs.map(dog => (
        <div key={dog.id} className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer">
          <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-br from-[#e8a230] to-[#d46b2f]">
            <div className="w-full h-full rounded-full bg-[#1a1916] border-2 border-[#1a1916] flex items-center justify-center text-2xl overflow-hidden">
              {dog.avatar_url
                ? <img src={dog.avatar_url} alt={dog.name} className="w-full h-full object-cover rounded-full" />
                : '🐾'
              }
            </div>
          </div>
          <span className="text-xs text-gray-400 max-w-[56px] truncate">{dog.name}</span>
        </div>
      ))}
    </div>
  )
}

export default function Feed() {
  const { posts, loading, fetchFeed } = useFeed()
  const { dogs } = useDog()
  const [showNewPost, setShowNewPost] = useState(false)

  if (showNewPost) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setShowNewPost(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Nazad
          </button>
          <h1 className="text-lg font-bold">Novi post</h1>
        </div>
        <NewPost
          onSuccess={() => {
            setShowNewPost(false)
            fetchFeed()
          }}
          onCancel={() => setShowNewPost(false)}
        />
      </div>
    )
  }

  return (
    <div>
      {/* Stories */}
      {dogs.length > 0 && <Stories dogs={dogs} />}

      {/* Novi post dugme */}
      <button
        onClick={() => setShowNewPost(true)}
        className="w-full flex items-center gap-3 bg-[#1a1916] border border-white/10 rounded-2xl px-4 py-3 mb-5 hover:border-[#e8a230]/40 transition-colors group"
      >
        <div className="w-9 h-9 rounded-full bg-[#222120] flex items-center justify-center text-lg flex-shrink-0">
          🐾
        </div>
        <span className="text-gray-500 text-sm group-hover:text-gray-400 transition-colors">
          Podijeli trenutak sa svojim psom...
        </span>
        <span className="ml-auto text-xl">📸</span>
      </button>

      {/* Feed */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-4xl animate-bounce mb-3">🐾</div>
          <p className="text-gray-500 text-sm">Učitavanje feedа...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-5xl mb-4">🐶</div>
          <h2 className="text-lg font-bold mb-2">Feed je prazan</h2>
          <p className="text-gray-500 text-sm mb-5">
            Budi prvi koji objavljuje! Dodaj svog psa i podijeli trenutak.
          </p>
          <button
            onClick={() => setShowNewPost(true)}
            className="bg-[#e8a230] text-black font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            Napravi prvi post
          </button>
        </div>
      ) : (
        <>
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}

          {/* Pull to refresh (jednostavan) */}
          <button
            onClick={fetchFeed}
            className="w-full py-4 text-gray-600 text-sm hover:text-gray-400 transition-colors"
          >
            Osvježi feed ↻
          </button>
        </>
      )}
    </div>
  )
}
