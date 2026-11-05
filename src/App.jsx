import { useEffect, useState } from 'react'
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import Cookies from 'js-cookie'
import LoginForm from './components/LoginForm'
import './App.css'

const API_URL = 'https://apis.ccbp.in/insta-share'
const COMMENTS_STORAGE_KEY = 'insta-share-local-comments'
const SAVED_POSTS_KEY = 'insta-share-saved-posts'

const CURRENT_USER = {
  username: 'rahul',
  fullName: 'Rahul Sharma',
  avatar: 'https://i.pravatar.cc/150?img=12',
  bio: 'Collecting moments, not things ✨',
}

const USERS = [
  CURRENT_USER,
  {
    username: 'ananya',
    fullName: 'Ananya Rao',
    avatar: 'https://i.pravatar.cc/150?img=47',
    bio: 'A little bit of everything 🌻',
  },
  {
    username: 'arjun',
    fullName: 'Arjun Kumar',
    avatar: 'https://i.pravatar.cc/150?img=13',
    bio: 'Outdoors, coffee and cameras.',
  },
  {
    username: 'meera',
    fullName: 'Meera Iyer',
    avatar: 'https://i.pravatar.cc/150?img=44',
    bio: 'Finding beauty in everyday things.',
  },
  {
    username: 'priya',
    fullName: 'Priya Reddy',
    avatar: 'https://i.pravatar.cc/150?img=49',
    bio: 'Making memories every day.',
  },
  {
    username: 'karthik',
    fullName: 'Karthik Varma',
    avatar: 'https://i.pravatar.cc/150?img=11',
    bio: 'Travel, food and photography.',
  },
  {
    username: 'rohan',
    fullName: 'Rohan Das',
    avatar: 'https://i.pravatar.cc/150?img=14',
    bio: 'One day at a time.',
  },
]

// =========================
// UNIQUE LOCAL COMMENT ID
// =========================

function createLocalCommentId() {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return `local-${crypto.randomUUID()}`
  }

  return `local-${Math.random().toString(36).slice(2)}-${Math.random()
    .toString(36)
    .slice(2)}`
}

// =========================
// LOCAL STORAGE HELPERS
// =========================

function getSavedComments(postId) {
  try {
    const savedComments = JSON.parse(
      localStorage.getItem(COMMENTS_STORAGE_KEY) || '{}'
    )

    const comments = savedComments[String(postId)]

    return Array.isArray(comments) ? comments : []
  } catch (error) {
    console.error('Unable to read saved comments:', error)
    return []
  }
}

function saveComment(postId, comment) {
  try {
    const savedComments = JSON.parse(
      localStorage.getItem(COMMENTS_STORAGE_KEY) || '{}'
    )

    const currentComments = Array.isArray(
      savedComments[String(postId)]
    )
      ? savedComments[String(postId)]
      : []

    savedComments[String(postId)] = [
      ...currentComments,
      comment,
    ]

    localStorage.setItem(
      COMMENTS_STORAGE_KEY,
      JSON.stringify(savedComments)
    )

    return true
  } catch (error) {
    console.error('Unable to save comment:', error)
    return false
  }
}

function getSavedPostIds() {
  try {
    const savedIds = JSON.parse(
      localStorage.getItem(SAVED_POSTS_KEY) || '[]'
    )

    return Array.isArray(savedIds)
      ? savedIds.map(String)
      : []
  } catch (error) {
    console.error('Unable to read saved posts:', error)
    return []
  }
}

function persistSavedPost(postId, shouldSave) {
  try {
    const savedIds = getSavedPostIds()
    const id = String(postId)

    const updatedIds = shouldSave
      ? [...new Set([...savedIds, id])]
      : savedIds.filter((savedId) => savedId !== id)

    localStorage.setItem(
      SAVED_POSTS_KEY,
      JSON.stringify(updatedIds)
    )

    return true
  } catch (error) {
    console.error('Unable to save post bookmark:', error)
    return false
  }
}

// =========================
// API HELPERS
// =========================

function normalizePost(post) {
  const apiComments = Array.isArray(post.comments)
    ? post.comments.map((comment, index) => ({
        id: `${post.post_id}-api-${index}`,
        username:
          comment.user_name || comment.user_id || 'User',
        text: comment.comment || '',
      }))
    : []

  return {
    id: post.post_id,
    username: post.user_id,
    userName: post.user_name,
    location: '',
    avatar: post.profile_pic,
    image: post.post_details?.image_url || '',
    caption: post.post_details?.caption || '',
    likes: Number(post.likes_count) || 0,
    liked: false,
    saved: getSavedPostIds().includes(String(post.post_id)),
    time: post.created_at || '',
    comments: [
      ...apiComments,
      ...getSavedComments(post.post_id),
    ],
  }
}

async function fetchProtectedJson(
  url,
  token,
  signal,
  fallbackMessage
) {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(
      data.error_msg || fallbackMessage
    )

    error.status = response.status
    throw error
  }

  return data
}

// =========================
// APPLICATION ROUTES
// =========================

function App() {
  useLocation()

  const token = Cookies.get('jwt_token')

  return (
    <Routes>
      <Route
        path="/login"
        element={token ? <Navigate to="/" replace /> : <LoginForm />}
      />

      <Route
        path="/"
        element={token ? <HomePage /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/search"
        element={token ? <SearchPage /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/my-profile"
        element={
          token ? (
            <ProfilePage isCurrentUser />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/users/:id"
        element={token ? <ProfilePage /> : <Navigate to="/login" replace />}
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

// =========================
// SHARED LAYOUT
// =========================

function AppLayout({ children, active = 'home' }) {
  const navigate = useNavigate()

  const logout = () => {
    Cookies.remove('jwt_token', { path: '/' })
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="wordmark" aria-label="Insta Share home">
          <span className="wordmark-icon">◎</span>
          <span>Insta Share</span>
        </Link>

        <div className="topbar-actions">
          <Link
            to="/search"
            className={`top-search ${
              active === 'search' ? 'selected' : ''
            }`}
          >
            <span aria-hidden="true">⌕</span>
            <span>Search</span>
          </Link>

          <button className="text-button" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <div className="app-body">
        <aside className="sidebar">
          <nav className="side-nav" aria-label="Main navigation">
            <NavItem
              to="/"
              icon="⌂"
              label="Home"
              active={active === 'home'}
            />

            <NavItem
              to="/search"
              icon="⌕"
              label="Search"
              active={active === 'search'}
            />

            <NavItem
              to="/my-profile"
              icon="◉"
              label="My Profile"
              active={active === 'profile'}
            />
          </nav>

          <div className="sidebar-user">
            <img src={CURRENT_USER.avatar} alt="" />

            <div>
              <strong>{CURRENT_USER.username}</strong>
              <span>{CURRENT_USER.fullName}</span>
            </div>
          </div>
        </aside>

        <main className="main-content">{children}</main>
      </div>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        <NavItem
          to="/"
          icon="⌂"
          label="Home"
          active={active === 'home'}
        />

        <NavItem
          to="/search"
          icon="⌕"
          label="Search"
          active={active === 'search'}
        />

        <NavItem
          to="/my-profile"
          icon="◉"
          label="Profile"
          active={active === 'profile'}
        />

        <button
          className="mobile-logout"
          onClick={logout}
          aria-label="Log out"
        >
          ↪
        </button>
      </nav>
    </div>
  )
}

function NavItem({ to, icon, label, active }) {
  return (
    <Link to={to} className={`nav-item ${active ? 'active' : ''}`}>
      <span className="nav-icon" aria-hidden="true">
        {icon}
      </span>

      <span>{label}</span>
    </Link>
  )
}

// =========================
// HOME FEED AND STORIES
// =========================

function HomePage() {
  const [posts, setPosts] = useState([])
  const [stories, setStories] = useState([])
  const [postsStatus, setPostsStatus] = useState('loading')
  const [storiesStatus, setStoriesStatus] = useState('loading')
  const [postsError, setPostsError] = useState('')
  const [storiesError, setStoriesError] = useState('')
  const [activeStory, setActiveStory] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let isActive = true

    const controller = new AbortController()
    const token = Cookies.get('jwt_token')

    const loadPosts = async () => {
      setPostsStatus('loading')
      setPostsError('')

      try {
        const data = await fetchProtectedJson(
          `${API_URL}/posts`,
          token,
          controller.signal,
          'Unable to load posts.'
        )

        const formattedPosts = (
          Array.isArray(data.posts) ? data.posts : []
        )
          .map(normalizePost)
          .filter((post) => post.id && post.image)

        if (isActive) {
          setPosts(formattedPosts)
          setPostsStatus('success')
        }
      } catch (error) {
        if (error.name === 'AbortError') return

        console.error('Home Feed API error:', error)

        if (isActive) {
          setPostsError(
            error.status === 401 || error.status === 403
              ? 'Your session has expired. Please log in again.'
              : 'Unable to load posts. Check your connection and try again.'
          )

          setPostsStatus('error')
        }
      }
    }

    const loadStories = async () => {
      setStoriesStatus('loading')
      setStoriesError('')

      try {
        const data = await fetchProtectedJson(
          `${API_URL}/stories`,
          token,
          controller.signal,
          'Unable to load stories.'
        )

        const apiStories = Array.isArray(data.users_stories)
          ? data.users_stories
          : []

        const formattedStories = apiStories.map((story, index) => ({
          id: story.user_id || `story-${index}`,
          username: story.user_name || story.user_id || 'User',
          avatar: story.story_url,
          storyUrl: story.story_url,
          isOwn: false,
        }))

        if (isActive) {
          setStories([
            {
              id: 'your-story',
              username: 'your_story',
              avatar: CURRENT_USER.avatar,
              storyUrl: CURRENT_USER.avatar,
              isOwn: true,
            },
            ...formattedStories,
          ])

          setStoriesStatus('success')
        }
      } catch (error) {
        if (error.name === 'AbortError') return

        console.error('Stories API error:', error)

        if (isActive) {
          setStoriesError(
            error.status === 401 || error.status === 403
              ? 'Your session has expired. Please log in again.'
              : 'Unable to load stories. Please try again.'
          )

          setStoriesStatus('error')

          setStories([
            {
              id: 'your-story',
              username: 'your_story',
              avatar: CURRENT_USER.avatar,
              storyUrl: CURRENT_USER.avatar,
              isOwn: true,
            },
          ])
        }
      }
    }

    if (!token) {
      setPostsStatus('error')
      setPostsError('Your session has expired. Please log in again.')

      setStoriesStatus('error')
      setStoriesError('Your session has expired. Please log in again.')

      return () => {
        isActive = false
        controller.abort()
      }
    }

    loadPosts()
    loadStories()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [retryCount])

  const updatePost = (postId, update) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId ? update(post) : post
      )
    )
  }

  const toggleLike = (postId) => {
    updatePost(postId, (post) => ({
      ...post,
      liked: !post.liked,
      likes: post.likes + (post.liked ? -1 : 1),
    }))
  }

  const toggleSave = (postId) => {
    const post = posts.find(
      (item) => String(item.id) === String(postId)
    )

    if (!post) return false

    const nextSaved = !post.saved

    if (!persistSavedPost(postId, nextSaved)) {
      return false
    }

    updatePost(postId, (currentPost) => ({
      ...currentPost,
      saved: nextSaved,
    }))

    return true
  }

  const addComment = (postId, text) => {
    const newComment = {
      id: createLocalCommentId(),
      username: CURRENT_USER.username,
      text,
    }

    const wasSaved = saveComment(postId, newComment)

    updatePost(postId, (post) => ({
      ...post,
      comments: [...post.comments, newComment],
    }))

    return wasSaved
  }

  const retryLoading = () => {
    setRetryCount((count) => count + 1)
  }

  return (
    <AppLayout active="home">
      <div className="feed-layout">
        <section className="feed-column">
          <div className="stories-panel">
            <div className="stories-list">
              {stories.map((story) => (
                <button
                  key={story.id}
                  className="story-button"
                  onClick={() => setActiveStory(story)}
                  aria-label={`Open ${story.username} story`}
                >
                  <span
                    className={`story-ring ${
                      story.isOwn ? 'own-story' : ''
                    }`}
                  >
                    <img src={story.avatar} alt="User story" />

                    {story.isOwn && (
                      <span className="story-plus">+</span>
                    )}
                  </span>

                  <span>{story.username}</span>
                </button>
              ))}
            </div>

            {storiesStatus === 'loading' && (
              <p className="rail-note">Loading stories...</p>
            )}

            {storiesStatus === 'error' && (
              <div>
                <p className="error-message" role="alert">
                  {storiesError}
                </p>

                <button
                  className="small-link"
                  type="button"
                  onClick={retryLoading}
                >
                  Retry loading stories
                </button>
              </div>
            )}
          </div>

          {activeStory && (
            <div
              className="modal-backdrop"
              onClick={() => setActiveStory(null)}
            >
              <div
                className="story-modal"
                role="dialog"
                aria-modal="true"
                aria-label={`${activeStory.username} story`}
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  className="modal-close"
                  onClick={() => setActiveStory(null)}
                  aria-label="Close story"
                >
                  ×
                </button>

                <img
                  src={activeStory.storyUrl || activeStory.avatar}
                  alt="User story"
                />

                <strong>{activeStory.username}</strong>

                <p>
                  {activeStory.isOwn
                    ? 'Your profile image is shown as a demo story.'
                    : 'You are viewing a user story.'}
                </p>
              </div>
            </div>
          )}

          <div className="feed-heading">
            <div>
              <p className="eyebrow">YOUR COMMUNITY</p>
              <h1>Home Feed</h1>
            </div>

            <span className="demo-pill">Live API posts</span>
          </div>

          {postsStatus === 'loading' && (
            <div className="empty-state" role="status">
              <span className="empty-icon">⌕</span>
              <h2>Loading your feed...</h2>
              <p>Fetching the latest posts.</p>
            </div>
          )}

          {postsStatus === 'error' && (
            <div className="empty-state">
              <span className="empty-icon">!</span>
              <h2>Couldn't load your feed</h2>

              <p className="error-message" role="alert">
                {postsError}
              </p>

              {postsError.includes('session has expired') ? (
                <Link to="/login" className="primary-link">
                  Log in again
                </Link>
              ) : (
                <button
                  type="button"
                  className="primary-link"
                  onClick={retryLoading}
                  style={{ border: 0, cursor: 'pointer' }}
                >
                  Try again
                </button>
              )}
            </div>
          )}

          {postsStatus === 'success' && posts.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">▦</span>
              <h2>No posts available</h2>
              <p>There are currently no posts to display.</p>

              <button
                type="button"
                className="primary-link"
                onClick={retryLoading}
                style={{ border: 0, cursor: 'pointer' }}
              >
                Refresh feed
              </button>
            </div>
          )}

          {postsStatus === 'success' &&
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={() => toggleLike(post.id)}
                onSave={() => toggleSave(post.id)}
                onAddComment={(text) => addComment(post.id, text)}
              />
            ))}
        </section>

        <aside className="right-rail">
          <div className="current-user-card">
            <img
              src={CURRENT_USER.avatar}
              alt=""
              className="avatar avatar-lg"
            />

            <div className="user-copy">
              <strong>{CURRENT_USER.username}</strong>
              <span>{CURRENT_USER.fullName}</span>
            </div>

            <Link to="/my-profile" className="small-link">
              View
            </Link>
          </div>

          <div className="suggestion-card">
            <div className="section-row">
              <h2>Suggestions for you</h2>
              <Link to="/search">See all</Link>
            </div>

            {USERS.filter(
              (user) => user.username !== CURRENT_USER.username
            )
              .slice(0, 3)
              .map((user) => (
                <div className="suggestion-row" key={user.username}>
                  <img src={user.avatar} alt="" className="avatar" />

                  <div className="user-copy">
                    <Link
                      to={`/users/${user.username}`}
                      className="user-link"
                    >
                      {user.username}
                    </Link>

                    <span>{user.fullName}</span>
                  </div>

                  <Link
                    to={`/users/${user.username}`}
                    className="small-link"
                  >
                    View
                  </Link>
                </div>
              ))}
          </div>

          <p className="rail-note">
            Posts and stories load from the API. Comments and saved
            posts persist in this browser.
          </p>
        </aside>
      </div>
    </AppLayout>
  )
}

// =========================
// REUSABLE POST CARD
// =========================

function PostCard({ post, onLike, onSave, onAddComment }) {
  const [comment, setComment] = useState('')
  const [showComments, setShowComments] = useState(false)
  const [notice, setNotice] = useState('')
  const [isLiking, setIsLiking] = useState(false)

  const displayName = post.userName || post.username || 'User'

  const handleLike = async () => {
    if (isLiking) return

    const token = Cookies.get('jwt_token')

    if (!token) {
      setNotice('Please log in again to like posts.')
      return
    }

    const nextLikeStatus = !post.liked

    setIsLiking(true)
    setNotice('')

    try {
      const response = await fetch(
        `${API_URL}/posts/${encodeURIComponent(post.id)}/like`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            like_status: nextLikeStatus,
          }),
        }
      )

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error_msg || 'Unable to update like.')
      }

      onLike()

      setNotice(
        data.message ||
          (nextLikeStatus ? 'Post liked!' : 'Post unliked.')
      )
    } catch (error) {
      console.error('Like API error:', error)
      setNotice('Unable to update like. Please try again.')
    } finally {
      setIsLiking(false)
    }
  }

  const handleSave = () => {
    const success = onSave()

    if (success === false) {
      setNotice('Unable to save this post in your browser.')
      return
    }

    setNotice(
      post.saved
        ? 'Post removed from saved posts.'
        : 'Post saved in this browser.'
    )
  }

  const submitComment = (event) => {
    event.preventDefault()

    const text = comment.trim()

    if (!text) return

    const savedSuccessfully = onAddComment(text)

    setComment('')
    setShowComments(true)

    setNotice(
      savedSuccessfully === false
        ? 'Comment added, but browser storage failed.'
        : 'Comment added and saved in this browser.'
    )
  }

  const sharePost = async () => {
    const shareText = `Check out ${displayName}'s post on Insta Share`

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText)
        setNotice('Share text copied to clipboard.')
      } else {
        setNotice(shareText)
      }
    } catch {
      setNotice(shareText)
    }
  }

  return (
    <article className="post-card">
      <div className="post-header">
        <img src={post.avatar} alt="" className="avatar" />

        <div className="user-copy">
          <Link to={`/users/${post.username}`} className="user-link">
            {displayName}
          </Link>

          <span>{post.location || post.time || 'Insta Share'}</span>
        </div>

        <button
          className="icon-button more-button"
          aria-label="Post options"
          onClick={() => setNotice('Post options are demo-only.')}
        >
          •••
        </button>
      </div>

      <img
        className="post-image"
        src={post.image}
        alt={`Post by ${displayName}`}
        loading="lazy"
      />

      <div className="post-actions">
        <div className="action-group">
          <button
            className={`icon-button ${post.liked ? 'liked' : ''}`}
            onClick={handleLike}
            disabled={isLiking}
            aria-label={post.liked ? 'Unlike post' : 'Like post'}
          >
            {isLiking ? '…' : post.liked ? '♥' : '♡'}
          </button>

          <button
            className="icon-button"
            onClick={() => setShowComments((value) => !value)}
            aria-label="Toggle comments"
          >
            ▢
          </button>

          <button
            className="icon-button"
            onClick={sharePost}
            aria-label="Share post"
          >
            ➤
          </button>
        </div>

        <button
          className={`icon-button save-button ${
            post.saved ? 'saved' : ''
          }`}
          onClick={handleSave}
          aria-label={post.saved ? 'Unsave post' : 'Save post'}
        >
          {post.saved ? '▣' : '▢'}
        </button>
      </div>

      <div className="post-details">
        <strong>{post.likes.toLocaleString('en-IN')} likes</strong>

        <p className="caption">
          <Link to={`/users/${post.username}`} className="user-link">
            {displayName}
          </Link>{' '}
          {post.caption}
        </p>

        <button
          className="view-comments"
          onClick={() => setShowComments((value) => !value)}
        >
          {showComments
            ? 'Hide comments'
            : `View all ${post.comments.length} comments`}
        </button>

        {showComments && (
          <div className="comments-list">
            {post.comments.map((item) => (
              <p key={item.id}>
                <strong>{item.username}</strong> {item.text}
              </p>
            ))}

            {post.comments.length === 0 && (
              <p className="empty-comments">
                No comments yet. Start the conversation.
              </p>
            )}
          </div>
        )}

        <form className="comment-form" onSubmit={submitComment}>
          <input
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Add a comment..."
            aria-label={`Comment on ${displayName}'s post`}
          />

          <button type="submit" disabled={!comment.trim()}>
            Post
          </button>
        </form>

        {notice && (
          <p className="inline-notice" role="status">
            {notice}
          </p>
        )}

        <p className="post-time">{post.time}</p>
      </div>
    </article>
  )
}

// =========================
// SEARCH POSTS
// =========================

function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [searchedQuery, setSearchedQuery] = useState('')

  const searchPosts = async (searchValue = query) => {
    const searchText = searchValue.trim()

    if (!searchText) {
      setResults([])
      setStatus('idle')
      setErrorMsg('Enter a caption keyword to search.')
      return
    }

    const token = Cookies.get('jwt_token')

    if (!token) {
      setErrorMsg('Your session has expired. Please log in again.')
      setStatus('error')
      return
    }

    setSearchedQuery(searchText)
    setStatus('loading')
    setErrorMsg('')
    setResults([])

    try {
      const data = await fetchProtectedJson(
        `${API_URL}/posts?search=${encodeURIComponent(searchText)}`,
        token,
        undefined,
        'Unable to search posts.'
      )

      const formattedPosts = (
        Array.isArray(data.posts) ? data.posts : []
      )
        .map(normalizePost)
        .filter((post) => post.id && post.image)

      setResults(formattedPosts)
      setStatus('success')
    } catch (error) {
      console.error('Search API error:', error)

      if (error.status === 401 || error.status === 403) {
        Cookies.remove('jwt_token', { path: '/' })
        setErrorMsg('Your session has expired. Please log in again.')
      } else {
        setErrorMsg(
          'Unable to load search results. Check your connection and try again.'
        )
      }

      setStatus('error')
    }
  }

  const handleSearch = (event) => {
    event.preventDefault()
    searchPosts()
  }

  const updateSearchPost = (postId, update) => {
    setResults((currentResults) =>
      currentResults.map((post) =>
        post.id === postId ? update(post) : post
      )
    )
  }

  const toggleSearchSave = (postId) => {
    const post = results.find(
      (item) => String(item.id) === String(postId)
    )

    if (!post) return false

    const nextSaved = !post.saved

    if (!persistSavedPost(postId, nextSaved)) {
      return false
    }

    updateSearchPost(postId, (currentPost) => ({
      ...currentPost,
      saved: nextSaved,
    }))

    return true
  }

  const addSearchComment = (postId, text) => {
    const newComment = {
      id: createLocalCommentId(),
      username: CURRENT_USER.username,
      text,
    }

    const wasSaved = saveComment(postId, newComment)

    updateSearchPost(postId, (post) => ({
      ...post,
      comments: [...post.comments, newComment],
    }))

    return wasSaved
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setStatus('idle')
    setErrorMsg('')
    setSearchedQuery('')
  }

  return (
    <AppLayout active="search">
      <section className="page-panel">
        <p className="eyebrow">DISCOVER POSTS</p>
        <h1>Search</h1>

        <form className="search-field" onSubmit={handleSearch}>
          <span aria-hidden="true">⌕</span>

          <input
            type="search"
            placeholder="Search posts by caption"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setErrorMsg('')
            }}
            aria-label="Search posts by caption"
          />

          {query && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              ×
            </button>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            style={{
              padding: '9px 14px',
              border: '1px solid #c026d3',
              borderRadius: '7px',
              background: '#c026d3',
              color: '#fff',
              cursor: status === 'loading' ? 'wait' : 'pointer',
            }}
          >
            {status === 'loading' ? 'Searching...' : 'Search'}
          </button>
        </form>

        {errorMsg && (
          <p className="error-message" role="alert">
            {errorMsg}
          </p>
        )}

        {status === 'idle' && (
          <div className="empty-state">
            <span className="empty-icon">⌕</span>
            <h2>Search posts</h2>
            <p>Enter a caption keyword, then click Search.</p>
          </div>
        )}

        {status === 'loading' && (
          <div className="empty-state" role="status">
            <h2>Searching posts...</h2>
            <p>Please wait while matching posts load.</p>
          </div>
        )}

        {status === 'error' && (
          <div className="empty-state">
            <h2>Couldn't load search results</h2>

            {errorMsg.includes('session has expired') ? (
              <Link to="/login" className="primary-link">
                Log in again
              </Link>
            ) : (
              <button
                type="button"
                className="primary-link"
                onClick={() => searchPosts(searchedQuery)}
                style={{ border: 0, cursor: 'pointer' }}
              >
                Try again
              </button>
            )}
          </div>
        )}

        {status === 'success' && results.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">⌕</span>
            <h2>No posts found</h2>
            <p>
              No posts matched "{searchedQuery}". Try another keyword.
            </p>
          </div>
        )}

        {status === 'success' &&
          results.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={() =>
                updateSearchPost(post.id, (currentPost) => ({
                  ...currentPost,
                  liked: !currentPost.liked,
                  likes:
                    currentPost.likes + (currentPost.liked ? -1 : 1),
                }))
              }
              onSave={() => toggleSearchSave(post.id)}
              onAddComment={(text) => addSearchComment(post.id, text)}
            />
          ))}
      </section>
    </AppLayout>
  )
}

// =========================
// MY PROFILE AND USER PROFILE
// =========================

function ProfilePage({ isCurrentUser = false }) {
  const { id } = useParams()

  const [profile, setProfile] = useState(null)
  const [status, setStatus] = useState('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let isActive = true
    const controller = new AbortController()
    const token = Cookies.get('jwt_token')

    const loadProfile = async () => {
      setStatus('loading')
      setProfile(null)
      setErrorMsg('')

      if (!token) {
        setErrorMsg('Your session has expired. Please log in again.')
        setStatus('error')
        return
      }

      const url = isCurrentUser
        ? `${API_URL}/my-profile`
        : `${API_URL}/users/${encodeURIComponent(id)}`

      try {
        const data = await fetchProtectedJson(
          url,
          token,
          controller.signal,
          'Unable to load profile.'
        )

        const profileData = isCurrentUser
          ? data.profile
          : data.user_details

        if (!profileData) {
          throw new Error('Profile data was not returned by the API.')
        }

        if (isActive) {
          setProfile(profileData)
          setStatus('success')
        }
      } catch (error) {
        if (error.name === 'AbortError') return

        console.error('Profile API error:', error)

        if (isActive) {
          setErrorMsg(
            error.status === 401 || error.status === 403
              ? 'Your session has expired. Please log in again.'
              : 'Unable to load profile. Please check your connection and try again.'
          )

          setStatus('error')
        }
      }
    }

    loadProfile()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [isCurrentUser, id, retryCount])

  if (status === 'loading') {
    return (
      <AppLayout active={isCurrentUser ? 'profile' : ''}>
        <section className="profile-page">
          <div className="empty-state" role="status">
            <span className="empty-icon">◎</span>
            <h2>Loading profile...</h2>
            <p>Please wait while we fetch profile details.</p>
          </div>
        </section>
      </AppLayout>
    )
  }

  if (status === 'error' || !profile) {
    return (
      <AppLayout active={isCurrentUser ? 'profile' : ''}>
        <section className="profile-page">
          <div className="empty-state profile-not-found">
            <span className="empty-icon">!</span>
            <h2>Couldn't load profile</h2>

            <p className="error-message" role="alert">
              {errorMsg}
            </p>

            {errorMsg.includes('session has expired') ? (
              <Link to="/login" className="primary-link">
                Log in again
              </Link>
            ) : (
              <button
                type="button"
                className="primary-link"
                style={{ border: 0, cursor: 'pointer' }}
                onClick={() => setRetryCount((count) => count + 1)}
              >
                Try again
              </button>
            )}
          </div>
        </section>
      </AppLayout>
    )
  }

  const username = profile.user_id || id || CURRENT_USER.username
  const fullName = profile.user_name || username
  const profileImage = profile.profile_pic || CURRENT_USER.avatar
  const bio = profile.user_bio || ''
  const followers = Number(profile.followers_count) || 0
  const following = Number(profile.following_count) || 0

  const profilePosts = Array.isArray(profile.posts)
    ? profile.posts
    : []

  const profileStories = Array.isArray(profile.stories)
    ? profile.stories
    : []

  const postsCount = profile.posts_count ?? profilePosts.length

  return (
    <AppLayout active={isCurrentUser ? 'profile' : ''}>
      <section className="profile-page">
        <div className="profile-header">
          <img
            src={profileImage}
            alt={isCurrentUser ? 'My profile' : 'User profile'}
            className="profile-avatar"
          />

          <div className="profile-info">
            <div className="profile-title-row">
              <h1>{username}</h1>

              {isCurrentUser && (
                <span className="profile-tag">Your profile</span>
              )}
            </div>

            <div className="profile-stats">
              <span>
                <strong>{postsCount}</strong> posts
              </span>

              <span>
                <strong>{followers.toLocaleString('en-IN')}</strong>{' '}
                followers
              </span>

              <span>
                <strong>{following.toLocaleString('en-IN')}</strong>{' '}
                following
              </span>
            </div>

            <strong className="profile-fullname">{fullName}</strong>
            <p>{bio || 'No bio available.'}</p>
          </div>
        </div>

        {profileStories.length > 0 && (
          <div className="stories-panel profile-stories">
            <div className="stories-list">
              {profileStories.map((story, index) => (
                <div
                  className="story-button"
                  key={story.id || `story-${index}`}
                >
                  <span className="story-ring">
                    <img
                      src={story.image || story.story_url}
                      alt="User story"
                    />
                  </span>

                  <span>Story {index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="profile-tabs">
          <span>▦</span> POSTS
        </div>

        {profilePosts.length > 0 ? (
          <div className="profile-grid">
            {profilePosts.map((post, index) => (
              <Link
                to="/"
                key={post.id || post.post_id || `post-${index}`}
                className="profile-grid-item"
                aria-label={`Open post ${index + 1}`}
              >
                <img
                  src={post.image || post.post_details?.image_url}
                  alt="User post"
                  loading="lazy"
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">▦</span>
            <h2>No posts yet</h2>
            <p>This profile does not have any posts to show.</p>
          </div>
        )}
      </section>
    </AppLayout>
  )
}

// =========================
// NOT FOUND PAGE
// =========================

function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found-mark">◎</div>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>

      <Link to="/" className="primary-link">
        Go to home
      </Link>
    </div>
  )
}

export default App