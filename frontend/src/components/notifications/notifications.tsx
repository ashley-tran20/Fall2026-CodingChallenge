import "./notifications.css";
import Button from "@mui/material/Button";
import { useNotifications } from "../../hooks/useNotifications";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import apiRequest from "../../utils/apiRequest";
import SignInGate from "../signInGate/signInGate";

interface Notification {
  _id: string;
  isRead: boolean;
  status: "pending" | "accepted" | "rejected";
  message: string;
  type: "board_invite";
  createdAt: string;
  sender?: {
    userName: string;
    img?: string;
  };
  board?: {
    title: string;
  };
}

const Notifications = () => {
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();

  const {
    data: notifications,
    isLoading: notificationsLoading,
    refetch,
  } = useNotifications(!!currentUser);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleAccept = async (notificationId: string) => {
    try {
      await apiRequest.patch(`/notifications/${notificationId}/accept`);
      refetch();
    } catch (err) {
      console.error("Failed to accept invite:", err);
    }
  };

  const handleReject = async (notificationId: string) => {
    try {
      await apiRequest.patch(`/notifications/${notificationId}/reject`);
      refetch();
    } catch (err) {
      console.error("Failed to reject invite:", err);
    }
  };

  if (userLoading) {
    return <div className="notificationsPage">Loading...</div>;
  }

  if (!currentUser) {
    return (
      <SignInGate message="Welcome fellow Pinny! You haven't signed in so there's no notifications yet!" />
    );
  }

  if (notificationsLoading) {
    return <div className="notificationsPage">Loading...</div>;
  }

  return (
    <div className="notificationsPage">
      <h2 className="notificationsTitle">Notifications</h2>
      {notifications?.length === 0 && (
        <p className="noNotifications">No notifications yet.</p>
      )}
      {notifications?.map((n: Notification) => (
        <div key={n._id} className="notificationPill">
          <div className="notificationPillHeader">
            {n.sender?.img ? (
              <img
                src={n.sender.img}
                alt={n.sender.userName}
                className="notificationAvatar"
              />
            ) : (
              <div className="notificationAvatarFallback">
                {n.sender?.userName?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}

            <div className="notificationPillContent">
              <p className="notificationText">
                {n.sender?.userName && <strong>@{n.sender.userName}</strong>}{" "}
                {n.message}
              </p>

              {n.status === "accepted" && (
                <p className="notificationResponseText">
                  You <strong>accepted</strong> to join the{" "}
                  <strong>"{n.board?.title ?? "board"}"</strong> board.
                </p>
              )}

              {n.status === "rejected" && (
                <p className="notificationResponseText">
                  You <strong>rejected</strong> to join the{" "}
                  <strong>"{n.board?.title ?? "board"}"</strong> board.
                </p>
              )}

              <span className="notificationTimestamp">
                {formatDateTime(n.createdAt)}
              </span>
            </div>
          </div>

          {n.status === "pending" && (
            <div className="notificationActions">
              <Button
                onClick={() => handleAccept(n._id)}
                sx={{
                  backgroundColor: "#008080",
                  color: "#fff",
                  borderRadius: "999px",
                  textTransform: "none",
                  px: 3,
                  mr: 1,
                  "&:hover": { backgroundColor: "#006666" },
                }}
              >
                Accept
              </Button>
              <Button
                onClick={() => handleReject(n._id)}
                sx={{
                  backgroundColor: "#008080",
                  color: "#fff",
                  borderRadius: "999px",
                  textTransform: "none",
                  px: 3,
                  "&:hover": { backgroundColor: "#006666" },
                }}
              >
                Reject
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Notifications;