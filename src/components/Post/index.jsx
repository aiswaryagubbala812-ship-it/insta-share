import { useState } from 'react'
import { Link } from 'react-router-dom'
import Cookies from 'js-cookie'
import PostActions from '../PostActions'
import CommentSection from '../CommentSection'
import './index.css'

const Post = ({ postDetails }) => {
  const {
    postId,
    userId,
    userName,
    profilePic,
    imageUrl,
    caption,
    likesCount: initialLikesCount,
    comments,
    createdAt,
  } = postDetails

  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(initialLikesCount)

  const handleToggleLike = async () => {
    const nextLikeStatus = !isLiked
    const jwtToken = Cookies.get('jwt_token')

    // Optimistic UI update
    setIsLiked(nextLikeStatus)
    setLikesCount(prev => (nextLikeStatus ? prev + 1 : prev - 1))

    try {
      const url = `https://apis.ccbp.in/insta-share/posts/${postId}/like`
      const options = {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          like_status: nextLikeStatus,
        }),
      }

      const response = await fetch(url, options)
      if (!response.ok) {
        // Rollback on failure
        setIsLiked(!nextLikeStatus)
        setLikesCount(prev => (nextLikeStatus ? prev - 1 : prev + 1))
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      // Rollback on failure
      setIsLiked(!nextLikeStatus)
      setLikesCount(prev => (nextLikeStatus ? prev - 1 : prev + 1))
    }
  }

  return (
    <li className="post-card" data-testid="postItem">
      {/* Post Author Header */}
      <div className="post-header">
        <div className="author-image-ring">
          <img
            src={profilePic}
            alt="post author profile"
            className="author-profile-image"
          />
        </div>
        <Link to={`/users/${userId}`} className="author-name-link">
          <p className="author-name">{userName}</p>
        </Link>
      </div>

      {/* Post Image */}
      <div className="post-image-container">
        <img src={imageUrl} alt="post" className="post-main-image" />
      </div>

      {/* Post Actions */}
      <PostActions isLiked={isLiked} onToggleLike={handleToggleLike} />

      {/* Likes Count */}
      <div className="post-details-section">
        <p className="post-likes-count">{likesCount} likes</p>

        {/* Caption */}
        <p className="post-caption-text">
          <span className="caption-username">{userName}</span> {caption}
        </p>

        {/* Comments Section */}
        <CommentSection comments={comments} />

        {/* Created At */}
        <p className="post-created-time">{createdAt}</p>
      </div>
    </li>
  )
}

export default Post
