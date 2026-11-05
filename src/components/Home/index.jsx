import { useState, useEffect, useCallback } from 'react'
import Cookies from 'js-cookie'
import Header from '../Header'
import UserStories from '../UserStories'
import PostsList from '../PostsList'
import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  inProgress: 'IN_PROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

const Home = () => {
  const [searchInput, setSearchInput] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // Posts Feed State
  const [postsList, setPostsList] = useState([])
  const [postsApiStatus, setPostsApiStatus] = useState(
    apiStatusConstants.inProgress,
  )

  // Search Results State
  const [searchResults, setSearchResults] = useState([])
  const [searchApiStatus, setSearchApiStatus] = useState(
    apiStatusConstants.initial,
  )

  const formatPostData = useCallback(rawPost => ({
    postId: rawPost.post_id,
    userId: rawPost.user_id,
    userName: rawPost.user_name,
    profilePic: rawPost.profile_pic,
    imageUrl: rawPost.post_details ? rawPost.post_details.image_url : '',
    caption: rawPost.post_details ? rawPost.post_details.caption : '',
    likesCount: rawPost.likes_count,
    comments: (rawPost.comments || []).map(c => ({
      userId: c.user_id,
      userName: c.user_name,
      comment: c.comment,
    })),
    createdAt: rawPost.created_at,
  }), [])

  // Fetch Home Feed Posts
  const fetchPosts = useCallback(async () => {
    const jwtToken = Cookies.get('jwt_token')
    const url = 'https://apis.ccbp.in/insta-share/posts'
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    }

    try {
      const response = await fetch(url, options)
      if (response.ok) {
        const data = await response.json()
        const formattedPosts = (data.posts || []).map(formatPostData)
        setPostsList(formattedPosts)
        setPostsApiStatus(apiStatusConstants.success)
      } else {
        setPostsApiStatus(apiStatusConstants.failure)
      }
    } catch (error) {
      console.error('Error fetching home posts:', error)
      setPostsApiStatus(apiStatusConstants.failure)
    }
  }, [formatPostData])

  const onRetryPosts = () => {
    setPostsApiStatus(apiStatusConstants.inProgress)
    fetchPosts()
  }

  // Fetch Search Posts
  const fetchSearchResults = async (queryToSearch = searchInput.trim()) => {
    if (!queryToSearch) {
      setIsSearching(false)
      setActiveSearch('')
      return
    }

    setIsSearching(true)
    setActiveSearch(queryToSearch)
    setSearchApiStatus(apiStatusConstants.inProgress)

    const jwtToken = Cookies.get('jwt_token')
    const url = `https://apis.ccbp.in/insta-share/posts?search=${encodeURIComponent(
      queryToSearch,
    )}`
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    }

    try {
      const response = await fetch(url, options)
      if (response.ok) {
        const data = await response.json()
        const formattedPosts = (data.posts || []).map(formatPostData)
        setSearchResults(formattedPosts)
        setSearchApiStatus(apiStatusConstants.success)
      } else {
        setSearchApiStatus(apiStatusConstants.failure)
      }
    } catch (error) {
      console.error('Error searching posts:', error)
      setSearchApiStatus(apiStatusConstants.failure)
    }
  }

  const onRetrySearch = () => {
    fetchSearchResults(activeSearch)
  }

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  return (
    <div className="home-route-container">
      <Header
        searchInput={searchInput}
        onChangeSearchInput={e => {
          setSearchInput(e.target.value)
          if (e.target.value === '' && isSearching) {
            setIsSearching(false)
            setActiveSearch('')
          }
        }}
        onSearch={() => fetchSearchResults(searchInput.trim())}
      />

      <main className="home-main-content">
        {!isSearching ? (
          <>
            <UserStories />
            <PostsList
              posts={postsList}
              apiStatus={postsApiStatus}
              onRetry={onRetryPosts}
              isSearch={false}
            />
          </>
        ) : (
          <div className="search-results-section">
            <h1 className="search-results-title">
              Search Results for &ldquo;{activeSearch}&rdquo;
            </h1>
            <PostsList
              posts={searchResults}
              apiStatus={searchApiStatus}
              onRetry={onRetrySearch}
              isSearch={true}
            />
          </div>
        )}
      </main>
    </div>
  )
}

export default Home
