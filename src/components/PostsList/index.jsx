import { TailSpin } from 'react-loader-spinner'
import Post from '../Post'
import FailureView from '../FailureView'
import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  inProgress: 'IN_PROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

const PostsList = ({ posts = [], apiStatus, onRetry, isSearch = false }) => {
  const renderLoadingView = () => (
    <div className="loader-container" data-testid="loader" testid="loader">
      <TailSpin color="#4094EF" height={50} width={50} />
    </div>
  )

  const renderFailureView = () => <FailureView onRetry={onRetry} />

  const renderSearchNotFoundView = () => (
    <div className="search-not-found-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/nxt-watch-no-search-results-img.png"
        alt="search not found"
        className="search-not-found-image"
      />
      <h1 className="search-not-found-heading">Search Not Found</h1>
      <p className="search-not-found-description">
        Try searching for something else.
      </p>
    </div>
  )

  const renderPosts = () => {
    if (isSearch && posts.length === 0) {
      return renderSearchNotFoundView()
    }

    return (
      <ul className="posts-container-list">
        {posts.map(post => (
          <Post key={post.postId} postDetails={post} />
        ))}
      </ul>
    )
  }

  return (
    <div className="posts-list-wrapper">
      {apiStatus === apiStatusConstants.inProgress && renderLoadingView()}
      {apiStatus === apiStatusConstants.failure && renderFailureView()}
      {apiStatus === apiStatusConstants.success && renderPosts()}
    </div>
  )
}

export default PostsList
