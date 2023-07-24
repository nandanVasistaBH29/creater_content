import { useState, FC } from "react";
import CommentInput from "./CommentInput";
import { Comment } from "./Comments";

interface CommentProps {
  comment: Comment;
}

const CommentItem: FC<CommentProps> = ({ comment }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [comments, setComments] = useState<Comment[]>(comment.comments);

  const addNewComment = async (newComment: Comment) => {
    setComments((prev) => [newComment, ...prev]);
  };

  return (
    <div className="border border-gray-300 rounded-md p-4 my-2">
      <h3 className="text-lg font-semibold">{comment.body}</h3>
      {!isReplying ? (
        <button
          onClick={() => setIsReplying(true)}
          className="border rounded-full border-orange-500 text-orange-500 px-4 py-1 mt-2"
        >
          Reply
        </button>
      ) : (
        <div className="mt-2">
          <CommentInput addNewComment={addNewComment} />
          <button
            onClick={() => setIsReplying(false)}
            className="border rounded-full border-red-500 text-red-500 px-4 py-1 mt-2"
          >
            Cancel
          </button>
        </div>
      )}
      {comments.length > 0 && (
        <div className="pl-4 mt-4 space-y-4 border-l border-gray-300">
          {comments.map((c) => (
            <CommentItem key={c.comment_id} comment={c} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
