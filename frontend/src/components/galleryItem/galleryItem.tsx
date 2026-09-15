import { useState } from "react";
import "./galleryItem.css";
import { Link } from "react-router";
import IconButton from "@mui/material/IconButton";
import IosShareIcon from "@mui/icons-material/IosShare";
import Button from "@mui/material/Button";
import SaveToBoard from "../saveToBoard/saveToBoard";

interface PixabayImage {
  id: number;
  webformatURL: string;
  tags: string;
  imageWidth: number;
  imageHeight: number;
}

interface GalleryItemProps {
  image: PixabayImage;
  onImageClick: (image: PixabayImage) => void;
}

const GalleryItem = ({ image, onImageClick }: GalleryItemProps) => {
  const [showSaveModal, setShowSaveModal] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: image.tags,
        url: `${window.location.origin}/pin/${image.id}`,
      });
    } else {
      navigator.clipboard.writeText(
        `${window.location.origin}/pin/${image.id}`
      );
    }
  };

  return (
    <div className="galleryItem">
      <img src={image.webformatURL} alt={image.tags} loading="lazy" />
      <Link
        to={`/pin/${image.id}`}
        className="overlay"
        onClick={() => onImageClick(image)}
      />

      <IconButton
        onClick={handleShare}
        className="shareButton"
        sx={{
          position: "absolute",
          bottom: "9px",
          left: "10px",
          display: "none",
          borderRadius: "8px",
          backgroundColor: "white",
          "&:hover": { backgroundColor: "#e0e0e0" },
          "&:active": { backgroundColor: "#bdbdbd" },
          ".galleryItem:hover &": { display: "flex" },
        }}
      >
        <IosShareIcon />
      </IconButton>

      <Button
        variant="contained"
        className="saveButton"
        onClick={() => setShowSaveModal(true)}
        sx={{
          position: "absolute",
          top: "9px",
          fontSize: "0.9rem",
          right: "12px",
          display: "none",
          backgroundColor: "#48AAAD",
          color: "white",
          borderRadius: "10px",
          padding: "6px 12px",
          textTransform: "none",
          fontWeight: 500,
          width: "max-content",
          ".galleryItem:hover &": { display: "block" },
        }}
      >
        Save
      </Button>

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

export default GalleryItem;
