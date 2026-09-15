import express from "express";
import { verifyToken } from "../middleware/verifyToken";
import {
  getNotifications,
  markAsRead,
  acceptInvite,
  rejectInvite,
} from "../controllers/notification.controller";

const router = express.Router();

router.get("/", verifyToken, getNotifications);
router.patch("/:id/read", verifyToken, markAsRead);
router.patch("/:id/accept", verifyToken, acceptInvite);
router.patch("/:id/reject", verifyToken, rejectInvite);

export default router;