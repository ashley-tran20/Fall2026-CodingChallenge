import { useState } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import "./userButton.css";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import apiRequest from "../../utils/apiRequest";

const UserButton = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<Element>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const goToProfile = () => {
    if (currentUser?.userName) {
      navigate(`/${currentUser.userName}`);
    }
  };

  const handleLogout = async () => {
    handleClose();
    await apiRequest.post("/users/auth/logout");
    queryClient.setQueryData(["currentUser"], null);
    navigate("/auth");
  };

  const handleLogin = () => {
    handleClose();
    navigate("/auth");
  };

  const handleSignUp = () => {
    handleClose();
    navigate("/auth?mode=register");
  };

  return (
    <div className="userButton">
      {currentUser ? (
        <div className="avatarCircle" onClick={goToProfile}>
          {currentUser.userName?.[0]?.toUpperCase()}
        </div>
      ) : (
        <div className="avatarCircle placeholder" onClick={handleClick} />
      )}

      <ArrowDropDownIcon
        onClick={handleClick}
        className="arrow"
        sx={{ color: "#000", fontSize: 24, cursor: "pointer" }}
      />

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {currentUser
          ? [
              <MenuItem key="logout" onClick={handleLogout}>
                Logout
              </MenuItem>,
            ]
          : [
              <MenuItem key="login" onClick={handleLogin}>
                Login
              </MenuItem>,
              <MenuItem key="signup" onClick={handleSignUp}>
                Sign Up
              </MenuItem>,
            ]}
      </Menu>
    </div>
  );
};

export default UserButton;