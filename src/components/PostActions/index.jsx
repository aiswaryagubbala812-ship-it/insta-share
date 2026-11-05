import { BsHeart } from 'react-icons/bs'
import { FcLike } from 'react-icons/fc'
import { FaRegComment } from 'react-icons/fa'
import { BiShareAlt } from 'react-icons/bi'
import './index.css'

const PostActions = ({ isLiked, onToggleLike }) => {
  return (
    <div className="post-actions-container">
      {isLiked ? (
        <button
          type="button"
          className="post-action-button"
          data-testid="unLikeIcon"
          testid="unLikeIcon"
          onClick={onToggleLike}
          aria-label="Unlike post"
        >
          <FcLike className="post-action-icon" />
        </button>
      ) : (
        <button
          type="button"
          className="post-action-button"
          data-testid="likeIcon"
          testid="likeIcon"
          onClick={onToggleLike}
          aria-label="Like post"
        >
          <BsHeart className="post-action-icon" />
        </button>
      )}

      <button
        type="button"
        className="post-action-button"
        aria-label="Comment on post"
      >
        <FaRegComment className="post-action-icon" />
      </button>

      <button
        type="button"
        className="post-action-button"
        aria-label="Share post"
      >
        <BiShareAlt className="post-action-icon" />
      </button>
    </div>
  )
}

export default PostActions
