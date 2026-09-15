import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import SignInGate from "../../components/signInGate/signInGate";
import "./createPage.css";
import AddCircleIcon from "@mui/icons-material/AddCircle";

interface Board {
  _id: string;
  title: string;
}

const CreatePage = () => {
  const navigate = useNavigate();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dims, setDims] = useState<{ width: number; height: number } | null>(
    null,
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [board, setBoard] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const { data: boards } = useQuery({
    queryKey: ["boards", currentUser?._id],
    queryFn: () =>
      apiRequest
        .get(`/boards/user/${currentUser?._id}`)
        .then((res) => res.data),
    enabled: !!currentUser?._id,
  });

  const createMutation = useMutation({
    mutationFn: (formData: FormData) =>
      apiRequest.post("/pins/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    onSuccess: (res) => {
      navigate(`/pin/${res.data._id}`);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    const objectUrl = URL.createObjectURL(selected);
    setPreviewUrl(objectUrl);

    const img = new Image();
    img.onload = () => {
      setDims({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = objectUrl;
  };

  const handlePublish = () => {
    if (!file || !dims || !title.trim() || !description.trim()) return;

    const formData = new FormData();
    formData.append("media", file);
    formData.append("width", String(dims.width));
    formData.append("height", String(dims.height));
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    if (board) formData.append("board", board);
    if (tagsInput.trim()) formData.append("tags", tagsInput.trim());

    createMutation.mutate(formData);
  };

  if (userLoading) return <p>Loading...</p>;

  if (!currentUser) {
    return (
      <SignInGate message="Welcome fellow Pinny! Sign up to start creating pins!" />
    );
  }

  return (
    <div className="createPage">
      <div className="createTop">
        <h1>Create Pin</h1>
        <button onClick={handlePublish} disabled={createMutation.isPending}>
          {createMutation.isPending ? "Publishing..." : "Publish"}
        </button>
      </div>

      <div className="createBottom">
        <div className="upload" onClick={() => fileInputRef.current?.click()}>
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="uploadPreview" />
          ) : (
            <>
              <AddCircleIcon sx={{ color: "#000", fontSize: 32 }} />
              <div className="uploadTitle">Choose a file</div>
              <div className="uploadInfo">
                We recommend using high quality .jpg files less than 20MB.
              </div>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>

        <form
          className="createForm"
          onSubmit={(e) => {
            e.preventDefault();
            handlePublish();
          }}
        >
          <div className="createFormItem">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              placeholder="Add a title"
              name="title"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="createFormItem">
            <label htmlFor="description">Description</label>
            <textarea
              rows={6}
              placeholder="Add a detailed description"
              name="description"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="createFormItem">
            <label htmlFor="board">Board</label>
            <select
              name="board"
              id="board"
              value={board}
              onChange={(e) => setBoard(e.target.value)}
            >
              <option value="">No board</option>
              {boards?.map((b: Board) => (
                <option key={b._id} value={b._id}>
                  {b.title}
                </option>
              ))}
            </select>
          </div>

          <div className="createFormItem">
            <label htmlFor="tags">Tagged topics</label>
            <input
              type="text"
              placeholder="Add tags, separated by commas"
              name="tags"
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
            <small>Don't worry, people won't ever see your tags</small>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePage;