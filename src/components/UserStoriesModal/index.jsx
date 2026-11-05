import { IoClose } from 'react-icons/io5'
import './index.css'

const UserStoriesModal = ({ story, onClose }) => {
  if (!story) return null

  return (
    <div className="stories-modal-overlay" onClick={onClose}>
      <div
        className="stories-modal-content"
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          className="stories-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <IoClose size={24} />
        </button>
        <div className="stories-modal-header">
          <p className="stories-modal-username">{story.userName}</p>
        </div>
        <div className="stories-modal-body">
          <img
            src={story.storyUrl}
            alt="user story"
            className="stories-modal-image"
          />
        </div>
      </div>
    </div>
  )
}

export default UserStoriesModal
