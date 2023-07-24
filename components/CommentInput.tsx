import { useState, FC } from "react";
import { v4 as uuid } from "uuid";
import { Comment } from "./Comments";

interface CommentInputProps {
  addNewComment: (newComment: Comment) => void;
}

const CommentInput: FC<CommentInputProps> = ({ addNewComment }) => {
  const [newCommentBody, setNewCommentBody] = useState("");

  const handleSubmit = () => {
    if (newCommentBody.trim() !== "") {
      addNewComment({
        comment_id: uuid(),
        body: newCommentBody,
        comments: [],
      });
      setNewCommentBody("");
    }
  };

  return (
    <div className="flex flex-col p-2 m-2">
      <input
        placeholder="What are your thoughts..."
        value={newCommentBody}
        onChange={(e) => setNewCommentBody(e.target.value)}
        className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:border-orange-500 w-1/2"
      />
      <button
        onClick={handleSubmit}
        className="border rounded-full border-orange-500 text-orange-500 px-4 py-2 mt-2 bg-transparent hover:bg-orange-500 hover:text-white transition-all duration-200 ease-in-out w-24"
      >
        Comment
      </button>
    </div>
  );
};

export default CommentInput;
