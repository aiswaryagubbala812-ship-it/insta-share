import './index.css'

const UserStory = ({ storyDetails, onClickStory }) => {
  const { userName, storyUrl } = storyDetails

  return (
    <div
      className="user-story-item"
      onClick={() => onClickStory && onClickStory(storyDetails)}
    >
      <div className="user-story-ring">
        <img
          src={storyUrl}
          alt="user story"
          className="user-story-image"
        />
      </div>
      <p className="user-story-username">{userName}</p>
    </div>
  )
}

export default UserStory
