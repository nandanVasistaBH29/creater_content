import { useState, FC } from "react";
import CommentItem from "./CommentItem";
import CommentInput from "./CommentInput";

export interface Comment {
  comment_id: string;
  body: string;
  comments: Comment[];
}

const dmy: Array<Comment> = [
  {
    comment_id: "123-123sas-ada",
    body: "hello world",
    comments: [],
  },
  {
    comment_id: "123123-asd-ada",
    body: "namaskara world",
    comments: [],
  },
  {
    comment_id: "123asd-sas-ada",
    body: "namaste world",
    comments: [],
  },
];

const Comments = ({ id }) => {
  const [comments, setComments] = useState(dmy);

  const addNewComment = async (newComment: Comment) => {
    setComments((prev) => [newComment, ...prev]);
  };

  return (
    <div className="m-4 p-4 gap-4 flex flex-col w-screen">
      <span className="text-3xl text-orange-500">Comments</span>
      <CommentInput addNewComment={addNewComment} />

      <section className="p-4 my-4">
        {comments ? (
          <div className="space-y-4">
            {comments.map((c) => (
              <CommentItem key={c.comment_id} comment={c} />
            ))}
          </div>
        ) : (
          <p>loading...</p>
        )}
      </section>
    </div>
  );
};

export default Comments;
