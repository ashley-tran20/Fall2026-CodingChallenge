import { useState } from "react";
import { useParams, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import SignInGate from "../../components/signInGate/signInGate";
import "./profilePage.css";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import IconButton from "@mui/material/IconButton";
import IosShareIcon from "@mui/icons-material/IosShare";
import PinsGrid from "./pinsGrid/pinsGrid";
import BoardsGrid from "./boardsGrid/boardsGrid";
import CollaborateBoard from "./collaborateBoard/collaborateBoard";

const ProfilePage = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "boards" ? 1 : 0;
  const [activeTab, setActiveTab] = useState(initialTab);
  const { username } = useParams();
  const { data: currentUser } = useCurrentUser();

  const { isPending, error, data } = useQuery({
    queryKey: ["profile", username],
    queryFn: () =>
      apiRequest.get(`/users/${username}`).then((res) => res.data),
  });

  const { data: collabBoards } = useQuery({
    queryKey: ["collaboratedBoards", data?._id],
    queryFn: () =>
      apiRequest
        .get(`/boards/collaborator/${data._id}`)
        .then((res) => res.data),
    enabled: !!data?._id,
  });

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: `${data.userName} on Pinny`, url });
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  if (isPending) return <p>Loading...</p>;
  if (error) return <p>An error has occurred: {error.message}</p>;
  if (!data) return <p>User not found!</p>;

  return (
    <div className="profilePage">
      <div className="profileTopIcons">
        <IconButton
          onClick={handleShare}
          sx={{
            backgroundColor: "#f1f1f1",
            "&:hover": { backgroundColor: "#e0e0e0" },
          }}
        >
          <IosShareIcon />
        </IconButton>
      </div>

      <div className="profileHeader">
        <div className="avatar">{data.userName?.[0]?.toUpperCase()}</div>
        <div className="profileInfo">
          <h1 className="profileName">{data.userName}</h1>
          <span className="username">@{data.userName}</span>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{
          marginTop: "16px",
          "& .MuiTabs-indicator": { backgroundColor: "black" },
        }}
      >
        <Tab
          label="Pins"
          sx={{ textTransform: "none", fontWeight: 600, color: "black" }}
        />
        <Tab
          label="Boards"
          sx={{ textTransform: "none", fontWeight: 600, color: "black" }}
        />
        <Tab
          label="Collabs"
          sx={{ textTransform: "none", fontWeight: 600, color: "black" }}
        />
      </Tabs>

      {activeTab === 2 ? (
        <div className="collabBoardsGrid">
          {!collabBoards || collabBoards.length === 0 ? (
            <p>No collaborated boards yet.</p>
          ) : (
            collabBoards.map(
              (board: {
                _id: string;
                title: string;
                user: string | { _id: string };
              }) => (
                <CollaborateBoard
                  key={board._id}
                  board={board}
                  userId={data._id}
                />
              ),
            )
          )}
        </div>
      ) : activeTab === 1 ? (
        currentUser ? (
          <BoardsGrid userId={data._id} />
        ) : (
          <SignInGate message="Sign up to see this Pinny's boards!" />
        )
      ) : (
        <PinsGrid userId={data._id} />
      )}
    </div>
  );
};

export default ProfilePage;