import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import apiRequest from "../../utils/apiRequest";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import "./saveToBoard.css";

interface Board {
  _id: string;
  title: string;
}

interface PinData {
  media: string;
  width: number;
  height: number;
  title: string;
  description: string;
  tags?: string[];
}

interface SaveToBoardProps {
  pinData: PinData;
  onClose: () => void;
}

const SaveToBoard = ({ pinData, onClose }: SaveToBoardProps) => {
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [showNewBoardInput, setShowNewBoardInput] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: currentUser, isLoading: userLoading } = useCurrentUser();

  const { data: ownedBoards, isPending: ownedPending } = useQuery({
    queryKey: ["boards", currentUser?._id],
    queryFn: () =>
      apiRequest.get(`/boards/user/${currentUser._id}`).then((res) => res.data),
    enabled: !!currentUser?._id,
  });

  const { data: collabBoards, isPending: collabPending } = useQuery({
    queryKey: ["collaboratedBoards", currentUser?._id],
    queryFn: () =>
      apiRequest
        .get(`/boards/collaborator/${currentUser._id}`)
        .then((res) => res.data),
    enabled: !!currentUser?._id,
  });

  const isPending = ownedPending || collabPending;

  const allBoardsMap = new Map<string, Board>();
  ownedBoards?.forEach((b: Board) => allBoardsMap.set(b._id, b));
  collabBoards?.forEach((b: Board) => allBoardsMap.set(b._id, b));
  const boards = Array.from(allBoardsMap.values());

  const goToProfile = () => {
    onClose();
    if (currentUser?.userName) {
      navigate(`/${currentUser.userName}`);
    }
  };

  const createPinMutation = useMutation({
    mutationFn: (boardId: string | undefined) =>
      apiRequest.post("/pins", {
        ...pinData,
        board: boardId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pins"] });
      goToProfile();
    },
  });

  const createBoardMutation = useMutation({
    mutationFn: (title: string) =>
      apiRequest.post("/boards", { title }).then((res) => res.data),
    onSuccess: (newBoard) => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      createPinMutation.mutate(newBoard._id);
    },
  });

  const handleCreateBoard = () => {
    if (!newBoardTitle.trim()) return;
    createBoardMutation.mutate(newBoardTitle.trim());
  };

  if (userLoading) {
    return (
      <div className="saveToBoardOverlay" onClick={onClose}>
        <div className="saveToBoardPopover" onClick={(e) => e.stopPropagation()}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="inviteModalOverlay" onClick={onClose}>
        <div className="inviteModal" onClick={(e) => e.stopPropagation()}>
          <p className="inviteModalText">
            You aren't signed in so you can't use this feature!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="saveToBoardOverlay" onClick={onClose}>
      <div className="saveToBoardPopover" onClick={(e) => e.stopPropagation()}>
        <h3>Save to board</h3>

        {isPending && <p>Loading boards...</p>}

        <div className="boardList">
          {boards.map((board: Board) => (
            <button
              key={board._id}
              className="boardOption"
              onClick={() => createPinMutation.mutate(board._id)}
            >
              {board.title}
            </button>
          ))}
        </div>

        {showNewBoardInput ? (
          <div className="newBoardForm">
            <input
              type="text"
              placeholder="Board name"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              autoFocus
            />
            <button onClick={handleCreateBoard}>Create & Save</button>
          </div>
        ) : (
          <button
            className="createBoardTrigger"
            onClick={() => setShowNewBoardInput(true)}
          >
            + Create new board
          </button>
        )}

        <button
          className="saveWithoutBoard"
          onClick={() => createPinMutation.mutate(undefined)}
        >
          Save without a board
        </button>
      </div>
    </div>
  );
};

export default SaveToBoard;