import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";
import "./comments.css";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

interface CommentUser {
  _id: string;
  userName: string;
  img?: string;
}

interface CommentType {
  _id: string;
  pin: string;
  user: CommentUser;
  text: string;
  createdAt: string;
}

const formatTime = (dateString: string) => {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo`;
};

const Comments = ({ pinId }: { pinId: string }) => {
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");

  const { data: comments } = useQuery({
    queryKey: ["comments", pinId],
    queryFn: () =>
      apiRequest.get(`/comments/pin/${pinId}`).then((res) => res.data),
    enabled: !!pinId,
  });

  const addCommentMutation = useMutation({
    mutationFn: (text: string) => apiRequest.post("/comments", { pinId, text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", pinId] });
    },
  });

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addCommentMutation.mutate(commentText.trim());
    setCommentText("");
  };

  return (
    <div className="comments">
      <span className="commentCount">{comments?.length ?? 0} Comments</span>

      <div className="commentList">
        {comments?.map((comment: CommentType) => (
          <div className="comment" key={comment._id}>
            <AccountCircleIcon sx={{ fontSize: 32, color: "#888" }} />
            <div className="commentContent">
              <span className="commentUsername">
                {comment.user?.userName ?? "Unknown"}
              </span>
              <p className="commentText">{comment.text}</p>
              <span className="commentTime">
                {formatTime(comment.createdAt)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <form className="commentForm" onSubmit={handlePostComment}>
        <input
          id="commentInput"
          type="text"
          placeholder="Add a comment"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
      </form>
    </div>
  );
};

export default Comments;