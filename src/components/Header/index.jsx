import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Cookies from 'js-cookie'
import { FaSearch } from 'react-icons/fa'
import { IoMenu, IoClose } from 'react-icons/io5'
import instaLogo from '../../assets/insta-logo.svg'
import './index.css'

const Header = ({
  searchInput = '',
  onChangeSearchInput,
  onSearch,
}) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const onClickLogout = () => {
    Cookies.remove('jwt_token')
    navigate('/login', { replace: true })
  }

  const toggleMobileMenu = () => {
    setShowMobileMenu(prev => !prev)
    setShowMobileSearch(false)
  }

  const toggleMobileSearch = () => {
    setShowMobileSearch(prev => !prev)
  }

  const handleSearchClick = () => {
    if (onSearch) {
      onSearch()
    } else {
      navigate('/')
    }
  }

  const handleKeyDown = event => {
    if (event.key === 'Enter') {
      handleSearchClick()
    }
  }

  const currentPath = location.pathname

  return (
    <nav className="header-navbar">
      <div className="header-container">
        {/* Brand Logo & Title */}
        <div className="header-logo-container">
          <Link to="/" className="header-brand-link">
            <img
              src={instaLogo}
              alt="website logo"
              className="header-website-logo"
            />
            <span className="header-brand-name">Insta Share</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="header-desktop-nav">
          <div className="header-search-box">
            <input
              type="search"
              className="header-search-input"
              placeholder="Search Caption"
              value={searchInput}
              onChange={onChangeSearchInput}
              onKeyDown={handleKeyDown}
            />
            <button
              type="button"
              className="header-search-button"
              data-testid="searchIcon"
              testid="searchIcon"
              onClick={handleSearchClick}
              aria-label="Search"
            >
              <FaSearch className="header-search-icon" />
            </button>
          </div>

          <ul className="header-nav-links">
            <li>
              <Link
                to="/"
                className={`header-nav-link ${
                  currentPath === '/' ? 'active-link' : ''
                }`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/my-profile"
                className={`header-nav-link ${
                  currentPath === '/my-profile' ? 'active-link' : ''
                }`}
              >
                Profile
              </Link>
            </li>
            <li>
              <button
                type="button"
                className="header-logout-button"
                onClick={onClickLogout}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="header-mobile-toggle">
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
          >
            {showMobileMenu ? <IoClose size={26} /> : <IoMenu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {showMobileMenu && (
        <div className="header-mobile-drawer">
          <ul className="header-mobile-nav-links">
            <li>
              <Link
                to="/"
                className={`header-mobile-link ${
                  currentPath === '/' ? 'active-mobile-link' : ''
                }`}
                onClick={() => setShowMobileMenu(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <button
                type="button"
                className="header-mobile-search-toggle"
                onClick={toggleMobileSearch}
              >
                Search
              </button>
            </li>
            <li>
              <Link
                to="/my-profile"
                className={`header-mobile-link ${
                  currentPath === '/my-profile' ? 'active-mobile-link' : ''
                }`}
                onClick={() => setShowMobileMenu(false)}
              >
                Profile
              </Link>
            </li>
            <li>
              <button
                type="button"
                className="header-logout-button mobile-logout"
                onClick={onClickLogout}
              >
                Logout
              </button>
            </li>
          </ul>

          {showMobileSearch && (
            <div className="header-mobile-search-box">
              <input
                type="search"
                className="header-search-input"
                placeholder="Search Caption"
                value={searchInput}
                onChange={onChangeSearchInput}
                onKeyDown={handleKeyDown}
              />
              <button
                type="button"
                className="header-search-button"
                data-testid="searchIcon"
                testid="searchIcon"
                onClick={() => {
                  handleSearchClick()
                  setShowMobileMenu(false)
                }}
                aria-label="Search"
              >
                <FaSearch className="header-search-icon" />
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

export default Header
