import { Link } from 'react-router-dom'
import './index.css'

const NotFound = () => {
  return (
    <div className="not-found-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/not-found-img.png"
        alt="page not found"
        className="not-found-image"
      />
      <h1 className="not-found-heading">PAGE NOT FOUND</h1>
      <p className="not-found-description">
        we are sorry, the page you requested could not be found
      </p>
      <Link to="/" className="not-found-link">
        <button type="button" className="not-found-home-button">
          Home Page
        </button>
      </Link>
    </div>
  )
}

export default NotFound
