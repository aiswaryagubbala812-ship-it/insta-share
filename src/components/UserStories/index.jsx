import { useState, useEffect, useCallback } from 'react'
import Cookies from 'js-cookie'
import { TailSpin } from 'react-loader-spinner'
import SlickSlider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

import UserStory from '../UserStory'
import UserStoriesModal from '../UserStoriesModal'
import FailureView from '../FailureView'
import './index.css'

const Slider = SlickSlider.default || SlickSlider

const apiStatusConstants = {
  initial: 'INITIAL',
  inProgress: 'IN_PROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

const UserStories = () => {
  const [storiesList, setStoriesList] = useState([])
  const [apiStatus, setApiStatus] = useState(apiStatusConstants.inProgress)
  const [selectedStory, setSelectedStory] = useState(null)

  const fetchStories = useCallback(async () => {
    const jwtToken = Cookies.get('jwt_token')
    const url = 'https://apis.ccbp.in/insta-share/stories'
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
        const formattedStories = (data.users_stories || []).map(eachStory => ({
          userId: eachStory.user_id,
          userName: eachStory.user_name,
          storyUrl: eachStory.story_url,
        }))
        setStoriesList(formattedStories)
        setApiStatus(apiStatusConstants.success)
      } else {
        setApiStatus(apiStatusConstants.failure)
      }
    } catch (error) {
      console.error('Failed to fetch stories:', error)
      setApiStatus(apiStatusConstants.failure)
    }
  }, [])

  const onRetry = () => {
    setApiStatus(apiStatusConstants.inProgress)
    fetchStories()
  }

  useEffect(() => {
    fetchStories()
  }, [fetchStories])

  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 7,
    slidesToScroll: 2,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 6,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
    ],
  }

  const renderLoadingView = () => (
    <div className="loader-container" data-testid="loader" testid="loader">
      <TailSpin color="#4094EF" height={40} width={40} />
    </div>
  )

  const renderFailureView = () => <FailureView onRetry={onRetry} />

  const renderStoriesSlider = () => (
    <div className="user-stories-slider-container">
      <Slider {...sliderSettings}>
        {storiesList.map(story => (
          <UserStory
            key={story.userId}
            storyDetails={story}
            onClickStory={selected => setSelectedStory(selected)}
          />
        ))}
      </Slider>

      {selectedStory && (
        <UserStoriesModal
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
        />
      )}
    </div>
  )

  return (
    <div className="user-stories-main-container">
      {apiStatus === apiStatusConstants.inProgress && renderLoadingView()}
      {apiStatus === apiStatusConstants.failure && renderFailureView()}
      {apiStatus === apiStatusConstants.success && renderStoriesSlider()}
    </div>
  )
}

export default UserStories
