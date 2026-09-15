import { useState } from "react";
import "./authPage.css";
import logo from "../../assets/PinnytheWhaleLogo.png";
import { Link, useSearchParams } from "react-router";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router";
import apiRequest from "../../utils/apiRequest";

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const [isRegister, setIsRegister] = useState(
    searchParams.get("mode") === "register",
  );
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    try {
      await apiRequest.post(
        `/users/auth/${isRegister ? "register" : "login"}`,
        data,
      );
      navigate("/");
    } catch (err: any) {
      setError(err.response.data.message);
    }
  };

  return (
    <div className="authPage">
      <div className="authContainer">
        <Link to="/">
          <img src={logo} alt="Logo" className="logo" width={36} height={36} />
        </Link>

        <h1>{isRegister ? "Create an Account" : "Login to your account"}</h1>

        <form onSubmit={handleSubmit}>
          <div className="formGroup">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              placeholder="Username"
              required
              name="username"
              id="username"
            />
          </div>

          {isRegister && (
            <div className="formGroup">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                placeholder="Email"
                required
                name="email"
                id="email"
              />
            </div>
          )}

          <div className="formGroup">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              placeholder="Password"
              required
              name="password"
              id="password"
            />
          </div>

          <Button
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: "#48AAAD",
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "20px",
              padding: "6px 20px",
              fontSize: "13px",
              marginTop: "8px",
              minWidth: "auto",
            }}
          >
            {isRegister ? "Register" : "Login"}
          </Button>
        </form>

        <p onClick={() => setIsRegister((prev) => !prev)}>
          {isRegister ? "Already have an account? " : "Don't have an account? "}
          <b>{isRegister ? "Login" : "Register"}</b>
        </p>

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default AuthPage;