import { useState } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiRequest from "../../../utils/apiRequest";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import IosShareIcon from "@mui/icons-material/IosShare";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import SaveToBoard from "../../../components/saveToBoard/saveToBoard";
import swimmersQuestion from "../../../assets/Pinny-question-mark.png";
import "./pinsGrid.css";

interface Pin {
  _id: string;
  media: string;
  title: string;
  description: string;
  width: number;
  height: number;
  tags?: string[];
}

const FALLBACK_IMAGE = "/fallback-image.png";

const PinsGrid = ({ userId }: { userId: string }) => {
  const [saveModalPin, setSaveModalPin] = useState<Pin | null>(null);
  const [confirmDeletePin, setConfirmDeletePin] = useState<Pin | null>(null);
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();

  const isOwnProfile = currentUser?._id === userId;

  const { isPending, error, data } = useQuery({
    queryKey: ["pins", userId],
    queryFn: () =>
      apiRequest.get(`/pins/user/${userId}`).then((res) => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (pinId: string) => apiRequest.delete(`/pins/${pinId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pins", userId] });
    },
  });

  const handleShare = (pin: Pin) => {
    const url = `${window.location.origin}/pin/${pin._id}`;
    if (navigator.share) {
      navigator.share({ title: pin.title, url });
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, pin: Pin) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDeletePin(pin);
  };

  const handleConfirmDelete = () => {
    if (confirmDeletePin) {
      deleteMutation.mutate(confirmDeletePin._id);
      setConfirmDeletePin(null);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (e.currentTarget.src !== window.location.origin + FALLBACK_IMAGE) {
      e.currentTarget.src = FALLBACK_IMAGE;
    }
  };

  if (isPending) return <p>Loading pins...</p>;
  if (error) return <p>Failed to load pins.</p>;
  if (!data || data.length === 0) return <p>No pins yet.</p>;

  return (
    <div className="pinsGrid">
      {data.map((pin: Pin) => (
        <div key={pin._id} className="pinCard">
          <div className="pinImageWrapper">
            <img src={pin.media} alt={pin.title} onError={handleImageError} />
            <Link to={`/pin/${pin._id}`} className="pinOverlay" />

            {isOwnProfile && (
              <IconButton
                onClick={(e) => handleDeleteClick(e, pin)}
                className="pinDeleteButton"
                sx={{
                  position: "absolute",
                  bottom: "9px",
                  left: "10px",
                  display: "none",
                  borderRadius: "8px",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.7)" },
                  ".pinImageWrapper:hover &": { display: "flex" },
                }}
              >
                <RemoveCircleIcon sx={{ color: "white" }} />
              </IconButton>
            )}

            <IconButton
              onClick={() => handleShare(pin)}
              className="pinShareButton"
              sx={{
                position: "absolute",
                bottom: "9px",
                left: "56px",
                display: "none",
                borderRadius: "8px",
                backgroundColor: "white",
                "&:hover": { backgroundColor: "#e0e0e0" },
                "&:active": { backgroundColor: "#bdbdbd" },
                ".pinImageWrapper:hover &": { display: "flex" },
              }}
            >
              <IosShareIcon />
            </IconButton>

            <Button
              variant="contained"
              className="pinSaveButton"
              onClick={() => setSaveModalPin(pin)}
              sx={{
                position: "absolute",
                top: "9px",
                fontSize: "0.9rem",
                right: "12px",
                display: "none",
                backgroundColor: "#48AAAD",
                color: "white",
                borderRadius: "10px",
                padding: "6px 12px",
                textTransform: "none",
                fontWeight: 500,
                width: "max-content",
                ".pinImageWrapper:hover &": { display: "block" },
              }}
            >
              Save
            </Button>
          </div>

          <span className="pinTitle">{pin.title}</span>
        </div>
      ))}

      {confirmDeletePin && (
        <div
          className="inviteModalOverlay"
          onClick={() => setConfirmDeletePin(null)}
        >
          <div className="inviteModal" onClick={(e) => e.stopPropagation()}>
            <img
              src={swimmersQuestion}
              alt="Pinny thinking"
              className="modalSwimmers"
            />

            <p className="inviteModalText">
              Uh oh! Are you sure you want to delete "{confirmDeletePin.title}"?
            </p>

            <div className="confirmModalActions">
              <button
                className="confirmCancelButton"
                onClick={() => setConfirmDeletePin(null)}
              >
                Cancel
              </button>
              <button
                className="confirmDeleteButton"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {saveModalPin && (
        <SaveToBoard
          pinData={{
            media: saveModalPin.media,
            width: saveModalPin.width,
            height: saveModalPin.height,
            title: saveModalPin.title,
            description: saveModalPin.description,
            tags: saveModalPin.tags,
          }}
          onClose={() => setSaveModalPin(null)}
        />
      )}
    </div>
  );
};

export default PinsGrid;