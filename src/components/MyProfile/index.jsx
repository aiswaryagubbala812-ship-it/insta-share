import { useState, useEffect, useCallback } from 'react'
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

const MyProfile = () => {
  const [profileData, setProfileData] = useState(null)
  const [apiStatus, setApiStatus] = useState(apiStatusConstants.inProgress)

  const fetchMyProfile = useCallback(async () => {
    const jwtToken = Cookies.get('jwt_token')
    const url = 'https://apis.ccbp.in/insta-share/my-profile'
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
        const profile = data.profile
        const formattedProfile = {
          id: profile.id,
          userId: profile.user_id,
          userName: profile.user_name,
          profilePic: profile.profile_pic,
          followersCount: profile.followers_count,
          followingCount: profile.following_count,
          userBio: profile.user_bio,
          postsCount: profile.posts_count,
          posts: profile.posts || [],
          stories: profile.stories || [],
        }
        setProfileData(formattedProfile)
        setApiStatus(apiStatusConstants.success)
      } else {
        setApiStatus(apiStatusConstants.failure)
      }
    } catch (error) {
      console.error('Error fetching my profile:', error)
      setApiStatus(apiStatusConstants.failure)
    }
  }, [])

  const onRetry = () => {
    setApiStatus(apiStatusConstants.inProgress)
    fetchMyProfile()
  }

  useEffect(() => {
    fetchMyProfile()
  }, [fetchMyProfile])

  const renderLoadingView = () => (
    <div className="loader-container" data-testid="loader" testid="loader">
      <TailSpin color="#4094EF" height={50} width={50} />
    </div>
  )

  const renderFailureView = () => <FailureView onRetry={onRetry} />

  const renderProfileView = () => (
    <Profile profileDetails={profileData} isMyProfile={true} />
  )

  return (
    <>
      <Header />
      <div className="my-profile-container">
        {apiStatus === apiStatusConstants.inProgress && renderLoadingView()}
        {apiStatus === apiStatusConstants.failure && renderFailureView()}
        {apiStatus === apiStatusConstants.success &&
          profileData &&
          renderProfileView()}
      </div>
    </>
  )
}

export default MyProfile
