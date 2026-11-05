import { useState } from 'react'
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom'

function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

  const handleLogin = async (event) => {
    event.preventDefault()
    setErrorMsg('')
    setIsLoading(true)

    try {
      const response = await fetch('https://apis.ccbp.in/login', {
        method: 'POST',
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.jwt_token) {
        setErrorMsg(
          data.error_msg || 'Username or password is incorrect.'
        )
        return
      }

      // Store the actual JWT returned by the login API.
      Cookies.remove('jwt_token', { path: '/' })

      Cookies.set('jwt_token', data.jwt_token.trim(), {
        expires: 30,
        path: '/',
      })

      navigate('/', { replace: true })
    } catch (error) {
      console.error('Login request failed:', error)
      setErrorMsg('Unable to connect to the login service.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleLogin}>
        <div className="login-brand">
          <span className="brand-icon">◎</span>
          <h1>Insta Share</h1>
        </div>

        <h2>Login</h2>

        <p className="login-description">
          Welcome back! Sign in to continue.
        </p>

        <div className="form-group">
          <label htmlFor="username">USERNAME</label>
          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">PASSWORD</label>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <label className="show-password">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={(event) =>
              setShowPassword(event.target.checked)
            }
          />
          <span>Show password</span>
        </label>

        {errorMsg && (
          <p className="error-message" role="alert">
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          className="login-button"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        <div className="demo-credentials">
          <strong>Demo login</strong>
          <span>Username: rahul</span>
          <span>Password: rahul@2021</span>
        </div>
      </form>
    </div>
  )
}

export default LoginForm
