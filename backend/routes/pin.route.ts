import express from "express";
import { verifyToken } from "../middleware/verifyToken";
import upload from "../middleware/upload";
import {
  getPins,
  getPin,
  createPin,
  createPinWithUpload,
  getPinsByUser,
  getPinsByBoard,
  deletePin,
} from "../controllers/pin.controller";

const router = express.Router();

router.get("/", getPins);
router.post("/", verifyToken, createPin);
router.post("/upload", verifyToken, upload.single("media"), createPinWithUpload);
router.get("/user/:userId", getPinsByUser);
router.get("/board/:boardId", getPinsByBoard);
router.get("/:id", getPin);
router.delete("/:id", verifyToken, deletePin);

export default router;