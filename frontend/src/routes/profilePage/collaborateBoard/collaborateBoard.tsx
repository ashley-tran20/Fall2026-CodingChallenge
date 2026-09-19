import { useState } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiRequest from "../../../utils/apiRequest";
import IconButton from "@mui/material/IconButton";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import swimmersQuestion from "../../../assets/Pinny-question-mark.png";
import swimmersBrokenHeart from "../../../assets/Pinny-broken-heart.png";
import "./collaborateBoard.css";

interface Board {
  _id: string;
  title: string;
  user: string | { _id: string };
  isPrivate?: boolean;
}

interface CollaborateBoardProps {
  board: Board;
  userId: string;
}

const CollaborateBoard = ({ board, userId }: CollaborateBoardProps) => {
  const queryClient = useQueryClient();
  const [showConfirm, setShowConfirm] = useState(false);

  const ownerId =
    typeof board.user === "string" ? board.user : board.user?._id;
  const isOwner = ownerId === userId;

  const { data: pins } = useQuery({
    queryKey: ["pins", "board", board._id],
    queryFn: () =>
      apiRequest.get(`/pins/board/${board._id}`).then((res) => res.data),
  });

  const removeMutation = useMutation({
    mutationFn: () =>
      apiRequest.delete(`/boards/${board._id}/collaborators`, {
        data: { collaboratorId: userId },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collaboratedBoards", userId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest.delete(`/boards/${board._id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collaboratedBoards", userId] });
    },
  });

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(true);
  };

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOwner) {
      deleteMutation.mutate();
    } else {
      removeMutation.mutate();
    }
    setShowConfirm(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(false);
  };

  const images = pins?.slice(0, 3) ?? [];

  return (
    <Link to={`/board/${board._id}`} className="collabBoardsCard">
      <div className="collabBoardCover">
        {images[0] ? (
          <img src={images[0].media} alt={board.title} className="mainCover" />
        ) : (
          <div className="emptyCover" />
        )}
        <div className="smallCovers">
          <div className="smallCoverSlot">
            {images[1] && <img src={images[1].media} alt="" />}
          </div>
          <div className="smallCoverSlot">
            {images[2] && <img src={images[2].media} alt="" />}
          </div>
        </div>

        <div className="collabHoverOverlay" />

        <IconButton
          onClick={handleRemoveClick}
          className="collabRemoveButton"
          sx={{
            position: "absolute",
            top: "9px",
            left: "9px",
            display: "none",
            borderRadius: "8px",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.7)" },
            ".collabBoardsCard:hover &": { display: "flex" },
          }}
        >
          <RemoveCircleIcon sx={{ color: "white" }} />
        </IconButton>
      </div>
      <span className="boardName">{board.title}</span>
      <span className="boardMeta">{pins?.length ?? 0} Pins</span>
      {board.isPrivate && <span className="privateBadge">Private</span>}

      {showConfirm && (
        <div
          className="inviteModalOverlay"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowConfirm(false);
          }}
        >
          <div className="inviteModal" onClick={(e) => e.stopPropagation()}>
            <img
              src={isOwner ? swimmersQuestion : swimmersBrokenHeart}
              alt={isOwner ? "Pinny thinking" : "Pinny sad"}
              className="modalSwimmers"
            />

            <p className="inviteModalText">
              {isOwner
                ? "Delete this board? Your fellow Pinnys won't be able to see it."
                : `Remove yourself from "${board.title}"?`}
            </p>

            <div className="confirmModalActions">
              <button className="confirmCancelButton" onClick={handleCancel}>
                Cancel
              </button>
              <button className="confirmDeleteButton" onClick={handleConfirm}>
                {isOwner ? "Delete" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Link>
  );
};

export default CollaborateBoard;