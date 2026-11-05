import './index.css'

const FailureView = ({ onRetry }) => {
  return (
    <div className="failure-view-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/api-failure-view.png"
        alt="failure view"
        className="failure-view-image"
      />
      <p className="failure-view-message">
        Something went wrong. Please try again
      </p>
      <button
        type="button"
        className="failure-retry-button"
        onClick={onRetry}
      >
        Try Again
      </button>
    </div>
  )
}

export default FailureView
