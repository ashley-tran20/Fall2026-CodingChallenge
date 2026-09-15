import { useNavigate } from "react-router";
import Button from "@mui/material/Button";
import logo from "../../assets/PinnytheWhaleLogo.png";
import "./signInGate.css";

interface SignInGateProps {
  message: string;
}

const SignInGate = ({ message }: SignInGateProps) => {
  const navigate = useNavigate();

  return (
    <div className="signInGate">
      <img src={logo} alt="Pinny the Whale" className="signInGateLogo" />
      <p className="signInGateText">{message}</p>
      <Button
        onClick={() => navigate("/auth?mode=register")}
        variant="contained"
        sx={{
          backgroundColor: "white",
          color: "#48aaad",
          borderRadius: "999px",
          textTransform: "none",
          fontWeight: 600,
          padding: "10px 28px",
          "&:hover": { backgroundColor: "#f1f1f1" },
        }}
      >
        Sign up
      </Button>
    </div>
  );
};

export default SignInGate;