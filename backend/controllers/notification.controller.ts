import { Request, Response } from "express";
import Notification from "../models/notification.model";
import Board from "../models/board.model";

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate("board", "title")
      .populate("sender", "userName img");

    res.status(200).json(notifications);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.userId;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.recipient.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json(notification);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const acceptInvite = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.userId;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.recipient.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (notification.type === "board_invite" && notification.board) {
      await Board.findByIdAndUpdate(notification.board, {
        $addToSet: { collaborators: userId },
      });
    }

    notification.status = "accepted";
    notification.isRead = true;
    await notification.save();

    res.status(200).json(notification);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const rejectInvite = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.userId;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.recipient.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    notification.status = "rejected";
    notification.isRead = true;
    await notification.save();

    res.status(200).json(notification);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};