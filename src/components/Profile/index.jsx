import { BsGrid3X3 } from 'react-icons/bs'
import { BiCamera } from 'react-icons/bi'
import './index.css'

const Profile = ({ profileDetails, isMyProfile = false }) => {
  const {
    userName,
    profilePic,
    followersCount,
    followingCount,
    postsCount,
    userBio,
    posts = [],
    stories = [],
  } = profileDetails

  const profileAlt = isMyProfile ? 'my profile' : 'user profile'
  const storyAlt = isMyProfile ? 'my story' : 'user story'
  const postAlt = isMyProfile ? 'my post' : 'user post'

  const renderNoPostsView = () => (
    <div className="no-posts-view-container">
      <div className="camera-icon-wrapper">
        <BiCamera className="no-posts-camera-icon" />
      </div>
      <h1 className="no-posts-heading">No Posts Yet</h1>
    </div>
  )

  const renderPostsGrid = () => (
    <ul className="profile-posts-grid">
      {posts.map(post => (
        <li key={post.id} className="profile-post-grid-item">
          <img src={post.image} alt={postAlt} className="profile-post-img" />
        </li>
      ))}
    </ul>
  )

  return (
    <div className="profile-main-container">
      {/* Profile Info Header */}
      <div className="profile-header-container">
        <div className="profile-avatar-container">
          <img
            src={profilePic}
            alt={profileAlt}
            className="profile-avatar-image"
          />
        </div>

        <div className="profile-details-info">
          <h1 className="profile-username-title">{userName}</h1>

          <div className="profile-stats-container">
            <p className="profile-stat-item">
              <span className="stat-count">{postsCount}</span> posts
            </p>
            <p className="profile-stat-item">
              <span className="stat-count">{followersCount}</span> followers
            </p>
            <p className="profile-stat-item">
              <span className="stat-count">{followingCount}</span> following
            </p>
          </div>

          <div className="profile-bio-container">
            <p className="profile-bio-username">{userName}</p>
            <p className="profile-bio-text">{userBio}</p>
          </div>
        </div>
      </div>

      {/* Stories list if any */}
      {stories && stories.length > 0 && (
        <div className="profile-stories-container">
          <ul className="profile-stories-list">
            {stories.map(story => (
              <li key={story.id} className="profile-story-item">
                <div className="profile-story-ring">
                  <img
                    src={story.image}
                    alt={storyAlt}
                    className="profile-story-image"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <hr className="profile-divider" />

      {/* Posts Section */}
      <div className="profile-posts-section">
        <div className="posts-tab-header">
          <BsGrid3X3 className="posts-tab-icon" />
          <h1 className="posts-tab-label">Posts</h1>
        </div>

        {posts.length === 0 ? renderNoPostsView() : renderPostsGrid()}
      </div>
    </div>
  )
}

export default Profile
