import './index.css'

const CommentSection = ({ comments = [] }) => {
  if (!comments || comments.length === 0) return null

  return (
    <ul className="comments-list">
      {comments.map((eachComment, index) => (
        <li
          key={`${eachComment.userId || eachComment.user_id || index}-${index}`}
          className="comment-item"
        >
          <span className="comment-username">
            {eachComment.userName || eachComment.user_name}
          </span>{' '}
          <span className="comment-text">
            {eachComment.comment}
          </span>
        </li>
      ))}
    </ul>
  )
}

export default CommentSection
