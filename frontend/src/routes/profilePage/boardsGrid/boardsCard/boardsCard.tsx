import { useState } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiRequest from "../../../../utils/apiRequest";
import IconButton from "@mui/material/IconButton";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import logo from "../../../../assets/PinnytheWhaleLogo.png";
import "./boardsCard.css";

interface Board {
  _id: string;
  title: string;
}

interface BoardsCardProps {
  board: Board;
  userId: string;
}

const BoardsCard = ({ board, userId }: BoardsCardProps) => {
  const queryClient = useQueryClient();
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: pins } = useQuery({
    queryKey: ["pins", "board", board._id],
    queryFn: () =>
      apiRequest.get(`/pins/board/${board._id}`).then((res) => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest.delete(`/boards/${board._id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards", userId] });
    },
  });

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(true);
  };

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteMutation.mutate();
    setShowConfirm(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(false);
  };

  const images = pins?.slice(0, 3) ?? [];

  return (
    <Link to={`/board/${board._id}`} className="boardsCard">
      <div className="boardCover">
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

        <IconButton
          onClick={handleDeleteClick}
          className="boardDeleteButton"
          sx={{
            position: "absolute",
            top: "9px",
            left: "9px",
            display: "none",
            borderRadius: "8px",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.7)" },
            ".boardsCard:hover &": { display: "flex" },
          }}
        >
          <RemoveCircleIcon sx={{ color: "white" }} />
        </IconButton>
      </div>
      <span className="boardName">{board.title}</span>
      <span className="boardMeta">{pins?.length ?? 0} Pins</span>

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
            <div className="inviteModalSwimmers">
              <img src={logo} alt="Pinny" className="inviteModalLogo" />

              <div className="pixelQuestionMark">
                <div style={{ left: 4, top: 0 }} />
                <div style={{ left: 6, top: 0 }} />
                <div style={{ left: 2, top: 2 }} />
                <div style={{ left: 8, top: 2 }} />
                <div style={{ left: 8, top: 4 }} />
                <div style={{ left: 6, top: 6 }} />
                <div style={{ left: 4, top: 8 }} />
                <div style={{ left: 4, top: 12 }} />
              </div>

              <img src={logo} alt="Pinny" className="inviteModalLogo" />
            </div>

            <p className="inviteModalText">
              Uh oh! Are you sure you want to delete this board?
            </p>

            <div className="confirmModalActions">
              <button className="confirmCancelButton" onClick={handleCancel}>
                Cancel
              </button>
              <button className="confirmDeleteButton" onClick={handleConfirm}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Link>
  );
};

export default BoardsCard;