// "collaborator/:userID must come before "/id"" otherwise
// Express would match "collaborator" as if it were a board ID
import express from "express";
import { verifyToken } from "../middleware/verifyToken";
import { optionalAuth } from "../middleware/optionalAuth";
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
router.get("/user/:userId", optionalAuth, getBoardsByUser);
router.get("/collaborator/:userId", getCollaboratedBoards);
router.get("/:id", optionalAuth, getBoard);
router.patch("/:id", verifyToken, updateBoard);
router.delete("/:id", verifyToken, deleteBoard);
router.post("/:id/collaborators", verifyToken, addCollaborator);
router.delete("/:id/collaborators", verifyToken, removeCollaborator);

export default router;