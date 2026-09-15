import { useNavigate } from "react-router";
import UserButton from "../userButton/userButton";
import "./topBar.css";
import SearchIcon from "@mui/icons-material/Search";

const TopBar = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      0: { value: string };
    };
    const value = target[0].value;
    navigate(`/search?search=${value}`);
  };

  return (
    <div className="topBar">
      <form onSubmit={handleSubmit} className="search">
        <SearchIcon sx={{ color: "#000", fontSize: 32 }} />
        <input type="text" placeholder="Search" />
      </form>

      <UserButton />
    </div>
  );
};

export default TopBar;