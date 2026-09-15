import express from "express";
import { verifyToken } from "../middleware/verifyToken";
import {
  createBoard,
  getBoardsByUser,
  getCollaboratedBoards,
  getBoard,
  updateBoard,
  deleteBoard,
  addCollaborator,
  removeCollaborator,
} from "../controllers/board.controller";

const router = express.Router();

router.post("/", verifyToken, createBoard);
router.get("/user/:userId", getBoardsByUser);
router.get("/collaborator/:userId", getCollaboratedBoards);
router.get("/:id", getBoard);
router.patch("/:id", verifyToken, updateBoard);
router.delete("/:id", verifyToken, deleteBoard);
router.post("/:id/collaborators", verifyToken, addCollaborator);
router.delete("/:id/collaborators", verifyToken, removeCollaborator);

export default router;