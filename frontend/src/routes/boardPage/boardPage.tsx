import { useState } from "react";
import { useParams, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import IosShareIcon from "@mui/icons-material/IosShare";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import SaveToBoard from "../../components/saveToBoard/saveToBoard";
import swimmersHeart from "../../assets/Pinny-heart.png";
import swimmersQuestion from "../../assets/Pinny-question-mark.png";
import "./boardPage.css";

interface Pin {
  _id: string;
  media: string;
  title: string;
  description: string;
  width: number;
  height: number;
  tags?: string[];
}

interface Collaborator {
  _id: string;
  userName: string;
}

const FALLBACK_IMAGE = "/fallback-image.png";

const BoardPage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const [saveModalPin, setSaveModalPin] = useState<Pin | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteError, setInviteError] = useState("");

  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editIsPrivate, setEditIsPrivate] = useState(false);

  const [confirmDeletePin, setConfirmDeletePin] = useState<Pin | null>(null);

  const {
    data: board,
    isPending: boardPending,
    error: boardError,
  } = useQuery({
    queryKey: ["board", id],
    queryFn: () => apiRequest.get(`/boards/${id}`).then((res) => res.data),
    retry: false,
  });
  const { data: pins, isPending: pinsPending } = useQuery({
    queryKey: ["pins", "board", id],
    queryFn: () => apiRequest.get(`/pins/board/${id}`).then((res) => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (pinId: string) => apiRequest.delete(`/pins/${pinId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pins", "board", id] });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: (username: string) =>
      apiRequest.post(`/boards/${id}/collaborators`, { username }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", id] });
      setInviteUsername("");
      setInviteError("");
      setShowInviteModal(false);
    },
    onError: (err: any) => {
      setInviteError(err.response?.data?.message || "Failed to add collaborator");
    },
  });

  const removeCollaboratorMutation = useMutation({
    mutationFn: (collaboratorId: string) =>
      apiRequest.delete(`/boards/${id}/collaborators`, {
        data: { collaboratorId },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", id] });
    },
  });

  const editBoardMutation = useMutation({
    mutationFn: (payload: { title: string; isPrivate: boolean }) =>
      apiRequest.patch(`/boards/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", id] });
      setShowEditModal(false);
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

  const handleDeleteClick = (pin: Pin) => {
    setConfirmDeletePin(pin);
  };

  const handleConfirmDelete = () => {
    if (confirmDeletePin) {
      deleteMutation.mutate(confirmDeletePin._id);
      setConfirmDeletePin(null);
    }
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteUsername.trim()) return;
    inviteMutation.mutate(inviteUsername.trim());
  };

  const handleOpenEdit = () => {
    setEditTitle(board.title);
    setEditIsPrivate(!!board.isPrivate);
    setShowMenu(false);
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    editBoardMutation.mutate({
      title: editTitle.trim(),
      isPrivate: editIsPrivate,
    });
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (e.currentTarget.src !== window.location.origin + FALLBACK_IMAGE) {
      e.currentTarget.src = FALLBACK_IMAGE;
    }
  };

  if (boardPending || pinsPending) return <p>Loading...</p>;

  if (boardError) {
    const status = (boardError as any)?.response?.status;
    if (status === 403) {
      return <p>This board is private.</p>;
    }
    return <p>Something went wrong loading this board.</p>;
  }

  if (!board) return <p>Board not found.</p>;

  const isOwner = currentUser?._id === board.user._id;
  const isCollaborator = board.collaborators?.some(
    (c: Collaborator) => c._id === currentUser?._id,
  );
  const canManage = isOwner || isCollaborator;
  const canDeletePins = isOwner || isCollaborator;

  return (
    <div className="boardPage">
      <div className="boardPageHeader">
        <div className="boardPageTitleRow">
          <h1>{board.title}</h1>
        </div>
        {board.description && <p>{board.description}</p>}
        <span>{pins?.length ?? 0} Pins</span>
        {board.isPrivate && <span className="privateBadge">Private</span>}
      </div>

      {canManage && (
        <div className="collaboratorsSection">
          <div className="collaboratorsHeader">
            <div className="boardMenuWrapper">
              <IconButton onClick={() => setShowMenu((prev) => !prev)}>
                <MoreHorizIcon />
              </IconButton>
              {showMenu && (
                <div className="boardMenuDropdown">
                  <button onClick={handleOpenEdit}>Edit board</button>
                </div>
              )}
            </div>
            <button
              className="addCollaboratorsButton"
              onClick={() => setShowInviteModal(true)}
            >
              Add Collaborators
            </button>
          </div>

          <div className="collaboratorsList">
            {board.collaborators?.map((c: Collaborator) => (
              <div key={c._id} className="collaboratorChip">
                <span>@{c.userName}</span>
                {isOwner && (
                  <button
                    onClick={() => removeCollaboratorMutation.mutate(c._id)}
                    className="removeCollaboratorButton"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showEditModal && (
        <div
          className="inviteModalOverlay"
          onClick={() => setShowEditModal(false)}
        >
          <div className="inviteModal" onClick={(e) => e.stopPropagation()}>
            <p className="inviteModalText">Edit board</p>

            <form onSubmit={handleSaveEdit} className="editBoardForm">
              <input
                type="text"
                placeholder="Board name"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                autoFocus
              />

              <label className="privacyToggleRow">
                <span>Private board</span>
                <input
                  type="checkbox"
                  checked={editIsPrivate}
                  onChange={(e) => setEditIsPrivate(e.target.checked)}
                />
              </label>

              <button type="submit">Save changes</button>
            </form>
          </div>
        </div>
      )}

      {showInviteModal && (
        <div
          className="inviteModalOverlay"
          onClick={() => setShowInviteModal(false)}
        >
          <div className="inviteModal" onClick={(e) => e.stopPropagation()}>
            <img
              src={swimmersHeart}
              alt="Pinny inviting a friend"
              className="modalSwimmers"
            />

            <p className="inviteModalText">Add a fellow Pinny!</p>

            <form onSubmit={handleInvite} className="inviteForm">
              <input
                type="text"
                placeholder="Add by username"
                value={inviteUsername}
                onChange={(e) => setInviteUsername(e.target.value)}
                autoFocus
              />
              <button type="submit">Invite</button>
            </form>

            {inviteError && <p className="inviteError">{inviteError}</p>}
          </div>
        </div>
      )}

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

      <div className="boardPinsGrid">
        {pins?.map((pin: Pin) => (
          <div key={pin._id} className="boardPinCard">
            <div className="boardPinImageWrapper">
              <img
                src={pin.media}
                alt={pin.title}
                onError={handleImageError}
              />
              <Link to={`/pin/${pin._id}`} className="boardPinOverlay" />

              {canDeletePins && (
                <IconButton
                  onClick={() => handleDeleteClick(pin)}
                  className="boardPinDeleteButton"
                  sx={{
                    position: "absolute",
                    bottom: "9px",
                    left: "10px",
                    display: "none",
                    borderRadius: "8px",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.7)" },
                    ".boardPinImageWrapper:hover &": { display: "flex" },
                  }}
                >
                  <RemoveCircleIcon sx={{ color: "white" }} />
                </IconButton>
              )}

              <IconButton
                onClick={() => handleShare(pin)}
                className="boardPinShareButton"
                sx={{
                  position: "absolute",
                  bottom: "9px",
                  left: "56px",
                  display: "none",
                  borderRadius: "8px",
                  backgroundColor: "white",
                  "&:hover": { backgroundColor: "#e0e0e0" },
                  "&:active": { backgroundColor: "#bdbdbd" },
                  ".boardPinImageWrapper:hover &": { display: "flex" },
                }}
              >
                <IosShareIcon />
              </IconButton>

              <Button
                variant="contained"
                className="boardPinSaveButton"
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
                  ".boardPinImageWrapper:hover &": { display: "block" },
                }}
              >
                Save
              </Button>
            </div>

            <span className="boardPinTitle">{pin.title}</span>
          </div>
        ))}
      </div>

      {pins?.length === 0 && <p>No pins in this board yet.</p>}

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

export default BoardPage;