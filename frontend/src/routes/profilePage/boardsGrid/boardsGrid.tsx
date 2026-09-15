import { useQuery } from "@tanstack/react-query";
import apiRequest from "../../../utils/apiRequest";
import BoardsCard from "./boardsCard/boardsCard";
import "./boardsGrid.css";

interface Board {
  _id: string;
  title: string;
}

const BoardsGrid = ({ userId }: { userId: string }) => {
  const { isPending, error, data } = useQuery({
    queryKey: ["boards", userId],
    queryFn: () =>
      apiRequest.get(`/boards/user/${userId}`).then((res) => res.data),
  });

  if (isPending) return <p>Loading boards...</p>;
  if (error) return <p>Failed to load boards.</p>;
  if (!data || data.length === 0) return <p>No boards yet.</p>;

  return (
    <div className="boardsGrid">
      {data.map((board: Board) => (
        <BoardsCard key={board._id} board={board} userId={userId} />
      ))}
    </div>
  );
};

export default BoardsGrid;