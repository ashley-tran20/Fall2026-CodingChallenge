
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import "./postPage.css";
import PostInteractions from "../../components/postInteractions/postInteractions";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import IosShareIcon from "@mui/icons-material/IosShare";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Comments from "../../components/comments/comments";
import SaveToBoard from "../../components/saveToBoard/saveToBoard";
import apiRequest from "../../utils/apiRequest";

interface PixabayImage {
  id: number | string;
  webformatURL: string;
  tags: string;
  imageWidth: number;
  imageHeight: number;
  user: string;
  description?: string;
  isMongoUser?: boolean;
}

const isMongoId = (value: string) => /^[a-f\d]{24}$/i.test(value);

const FALLBACK_IMAGE = "/fallback-image.png";
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

const PostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [image, setImage] = useState<PixabayImage | null>(null);
  const [relatedImages, setRelatedImages] = useState<PixabayImage[]>([]);
  const [saveModalImage, setSaveModalImage] =
    useState<PixabayImage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let active = true;

    setImage(null);
    setRelatedImages([]);
    setError(null);

    const fetchImage = async () => {
      try {
        if (isMongoId(id)) {
          const pin = await apiRequest
            .get(`/pins/${id}`)
            .then((res) => res.data);

          if (!active) return;

          setImage({
            id: pin._id,
            webformatURL: pin.media,
            tags:
              pin.tags && pin.tags.length
                ? pin.tags.join(", ")
                : pin.title,
            imageWidth: pin.width,
            imageHeight: pin.height,
            user: pin.user?.userName || "Unknown",
            description: pin.description,
            isMongoUser: true,
          });
        } else {
          const response = await fetch(
            `${API_ENDPOINT}/pixabay?id=${encodeURIComponent(id)}`
          );

          if (!response.ok) {
            throw new Error("Unable to load image");
          }

          const data = await response.json();

          if (!data.hits?.length) {
            throw new Error("Image not found");
          }

          if (!active) return;

          setImage({
            ...data.hits[0],
            isMongoUser: false,
          });
        }
      } catch (error) {
        console.error("Image loading failed:", error);

        if (active) {
          setError("Unable to load this image. Please try again.");
        }
      }
    };

    fetchImage();

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!image) return;

    let active = true;

    const fetchRelated = async () => {
      try {
        const allTags = image.tags
          .split(",")
          .map((t) => t.trim());

        const preciseQuery = allTags.slice(0, 3).join(" ");
        const broadQuery = allTags[0];

        const [preciseRes, broadRes] = await Promise.all([
          fetch(
            `${API_ENDPOINT}/pixabay?q=${encodeURIComponent(
              preciseQuery
            )}&per_page=5`
          ).then((r) => {
            if (!r.ok) {
              throw new Error("Unable to load related images");
            }
            return r.json();
          }),

          fetch(
            `${API_ENDPOINT}/pixabay?q=${encodeURIComponent(
              broadQuery
            )}&per_page=20`
          ).then((r) => {
            if (!r.ok) {
              throw new Error("Unable to load related images");
            }
            return r.json();
          }),
        ]);

        const preciseHits: PixabayImage[] =
          preciseRes.hits.filter(
            (hit: PixabayImage) => hit.id !== image.id
          );

        const preciseIds = new Set(
          preciseHits.map((hit) => hit.id)
        );

        const broadHits: PixabayImage[] =
          broadRes.hits.filter(
            (hit: PixabayImage) =>
              hit.id !== image.id &&
              !preciseIds.has(hit.id)
          );

        if (active) {
          setRelatedImages([
            ...preciseHits.slice(0, 5),
            ...broadHits,
          ]);
        }
      } catch (error) {
        console.error("Related image loading failed:", error);
      }
    };

    fetchRelated();

    return () => {
      active = false;
    };
  }, [image]);

  const handleShare = (img: PixabayImage) => {
    const url = `${window.location.origin}/pin/${img.id}`;

    if (navigator.share) {
      navigator.share({
        title: img.tags,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement>
  ) => {
    if (
      e.currentTarget.src !==
      window.location.origin + FALLBACK_IMAGE
    ) {
      e.currentTarget.src = FALLBACK_IMAGE;
    }
  };

  if (error) {
    return (
      <div className="postPage">
        <IconButton
          onClick={() => navigate(-1)}
          className="backButton"
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <p>{error}</p>
      </div>
    );
  }

  if (!image) return <div>Loading...</div>;

  return (
    <div className="postPage">
      <IconButton
        onClick={() => navigate(-1)}
        className="backButton"
      >
        <ArrowBackIcon fontSize="small" />
      </IconButton>

      <div className="postContainer">
        <div className="postImg">
          <img
            src={image.webformatURL}
            alt={image.tags}
            onError={handleImageError}
          />
        </div>

        <div className="postDetails">
          <PostInteractions image={image} />

          {image.isMongoUser ? (
            <Link
              to={`/${image.user}`}
              className="postUser"
            >
              <div className="pixabayAvatar">
                {image.user?.[0]?.toUpperCase()}
              </div>
              <span>{image.user}</span>
            </Link>
          ) : (
            <div className="postUser">
              <div className="pixabayAvatar">
                {image.user?.[0]?.toUpperCase()}
              </div>
              <span>{image.user}</span>
              <span className="externalCreatorTag">
                External creator
              </span>
            </div>
          )}

          {image.description && (
            <p className="postDescription">
              {image.description}
            </p>
          )}

          <div className="commentsSection">
            {isMongoId(String(image.id)) && (
              <Comments pinId={String(image.id)} />
            )}
          </div>
        </div>
      </div>

      {relatedImages.length > 0 && (
        <div className="moreLikeThis">
          <h2>More like this</h2>

          <div className="relatedGrid">
            {relatedImages.map((img) => (
              <div
                key={img.id}
                className="relatedCard"
              >
                <img
                  src={img.webformatURL}
                  alt={img.tags}
                  loading="lazy"
                  onError={handleImageError}
                />

                <Link
                  to={`/pin/${img.id}`}
                  className="relatedOverlay"
                />

                <IconButton
                  onClick={() => handleShare(img)}
                  className="relatedShareButton"
                  sx={{
                    position: "absolute",
                    bottom: "9px",
                    left: "10px",
                    display: "none",
                    borderRadius: "8px",
                    backgroundColor: "white",
                    "&:hover": {
                      backgroundColor: "#e0e0e0",
                    },
                    "&:active": {
                      backgroundColor: "#bdbdbd",
                    },
                    ".relatedCard:hover &": {
                      display: "flex",
                    },
                  }}
                >
                  <IosShareIcon />
                </IconButton>

                <Button
                  variant="contained"
                  className="relatedSaveButton"
                  onClick={() => setSaveModalImage(img)}
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
                    ".relatedCard:hover &": {
                      display: "block",
                    },
                  }}
                >
                  Save
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {saveModalImage && (
        <SaveToBoard
          pinData={{
            media: saveModalImage.webformatURL,
            width: saveModalImage.imageWidth,
            height: saveModalImage.imageHeight,
            title:
              saveModalImage.tags.split(",")[0]?.trim() ||
              "Untitled",
            description: saveModalImage.tags,
          }}
          onClose={() => setSaveModalImage(null)}
        />
      )}
    </div>
  );
};

export default PostPage;
