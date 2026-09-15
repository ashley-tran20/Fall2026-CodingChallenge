import express from "express";
import { verifyToken } from "../middleware/verifyToken";
import {
  getCommentsByPin,
  createComment,
  deleteComment,
} from "../controllers/comment.controller";

const router = express.Router();

router.get("/pin/:pinId", getCommentsByPin);
router.post("/", verifyToken, createComment);
router.delete("/:id", verifyToken, deleteComment);

export default router;
