import { useState } from "react";
import "./postInteractions.css";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import IosShareIcon from "@mui/icons-material/IosShare";
import SaveToBoard from "../saveToBoard/saveToBoard";

interface PixabayImage {
  id: number | string;
  webformatURL: string;
  tags: string;
  imageWidth: number;
  imageHeight: number;
}

interface PostInteractionsProps {
  image: PixabayImage;
}

const PostInteractions = ({ image }: PostInteractionsProps) => {
  const [showSaveModal, setShowSaveModal] = useState(false);

  const handleShare = () => {
    const url = `${window.location.origin}/pin/${image.id}`;
    if (navigator.share) {
      navigator.share({ title: image.tags, url });
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="postInteractions">
      <div className="topRow">
        <div className="leftIcons">
          <IconButton
            onClick={handleShare}
            sx={{
              borderRadius: "8px",
              backgroundColor: "white",
              "&:hover": { backgroundColor: "#e0e0e0" },
              "&:active": { backgroundColor: "#bdbdbd" },
            }}
          >
            <IosShareIcon sx={{ color: "black" }} />
          </IconButton>
        </div>

        <Button
          variant="contained"
          className="saveButton"
          onClick={() => setShowSaveModal(true)}
          sx={{
            backgroundColor: "#48AAAD",
            color: "white",
            borderRadius: "10px",
            padding: "6px 16px",
            textTransform: "none",
            fontWeight: 500,
          }}
        >
          Save
        </Button>
      </div>

      {showSaveModal && (
        <SaveToBoard
          pinData={{
            media: image.webformatURL,
            width: image.imageWidth,
            height: image.imageHeight,
            title: image.tags.split(",")[0]?.trim() || "Untitled",
            description: image.tags,
          }}
          onClose={() => setShowSaveModal(false)}
        />
      )}
    </div>
  );
};

export default PostInteractions;