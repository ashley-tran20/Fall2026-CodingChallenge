import "./leftBar.css";
import { Link } from "react-router";
import logo from "../../assets/PinnytheWhaleLogo.png";
import HomeIcon from "@mui/icons-material/Home";
import NotificationsIcon from "@mui/icons-material/Notifications";
import GridViewIcon from "@mui/icons-material/GridView";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useNotifications } from "../../hooks/useNotifications";

interface Notification {
  isRead: boolean;
}

const LeftBar = () => {
  const { data: currentUser } = useCurrentUser();
  const { data: notifications } = useNotifications(!!currentUser);

  const hasUnread = notifications?.some((n: Notification) => !n.isRead);

  return (
    <div className="leftBar">
      <div className="menuIcons">
        <Link to="/">
          <img src={logo} alt="Logo" className="logo" />
        </Link>
        <Link to="/create" className="menuIcon"></Link>
        <Link to="/" className="menuIcon">
          <HomeIcon sx={{ color: "#777B7E", fontSize: 30 }} />
        </Link>
        <Link to="/notifications" className="menuIcon notificationIconWrapper">
          <NotificationsIcon sx={{ color: "#777B7E", fontSize: 30 }} />
          {hasUnread && <span className="notificationDot" />}
        </Link>
        <Link to="/create" className="AddIcon">
          <AddBoxIcon sx={{ color: "#777B7E", fontSize: 30 }} />
        </Link>
        <Link
          to={currentUser ? `/${currentUser.userName}` : "/auth"}
          className="menuIcon"
        >
          <GridViewIcon sx={{ color: "#777B7E", fontSize: 30 }} />
        </Link>
      </div>
    </div>
  );
};

export default LeftBar;