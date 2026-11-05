import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import Cookies from 'js-cookie'
import { TailSpin } from 'react-loader-spinner'
import Header from '../Header'
import Profile from '../Profile'
import FailureView from '../FailureView'

const apiStatusConstants = {
  initial: 'INITIAL',
  inProgress: 'IN_PROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

const UserDetails = () => {
  const { id } = useParams()
  const [userData, setUserData] = useState(null)
  const [apiStatus, setApiStatus] = useState(apiStatusConstants.inProgress)

  const fetchUserDetails = useCallback(async () => {
    const jwtToken = Cookies.get('jwt_token')
    const url = `https://apis.ccbp.in/insta-share/users/${id}`
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
        const user = data.user_details
        const formattedUser = {
          id: user.id,
          userId: user.user_id,
          userName: user.user_name,
          profilePic: user.profile_pic,
          followersCount: user.followers_count,
          followingCount: user.following_count,
          userBio: user.user_bio,
          postsCount: user.posts_count,
          posts: user.posts || [],
          stories: user.stories || [],
        }
        setUserData(formattedUser)
        setApiStatus(apiStatusConstants.success)
      } else {
        setApiStatus(apiStatusConstants.failure)
      }
    } catch (error) {
      console.error('Error fetching user details:', error)
      setApiStatus(apiStatusConstants.failure)
    }
  }, [id])

  const onRetry = () => {
    setApiStatus(apiStatusConstants.inProgress)
    fetchUserDetails()
  }

  useEffect(() => {
    fetchUserDetails()
  }, [fetchUserDetails])

  const renderLoadingView = () => (
    <div className="loader-container" data-testid="loader" testid="loader">
      <TailSpin color="#4094EF" height={50} width={50} />
    </div>
  )

  const renderFailureView = () => <FailureView onRetry={onRetry} />

  const renderProfileView = () => (
    <Profile profileDetails={userData} isMyProfile={false} />
  )

  return (
    <>
      <Header />
      <div className="user-details-container">
        {apiStatus === apiStatusConstants.inProgress && renderLoadingView()}
        {apiStatus === apiStatusConstants.failure && renderFailureView()}
        {apiStatus === apiStatusConstants.success &&
          userData &&
          renderProfileView()}
      </div>
    </>
  )
}

export default UserDetails
