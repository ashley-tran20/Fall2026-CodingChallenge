import { Request, Response } from "express";
import Comment from "../models/comment.model";

export const getCommentsByPin = async (req: Request, res: Response) => {
  try {
    const pinId = req.params.pinId as string;

    const comments = await Comment.find({ pin: pinId })
      .sort({ createdAt: 1 })
      .populate("user", "userName img");

    res.status(200).json(comments);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const createComment = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { pinId, text } = req.body as { pinId: string; text: string };

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!pinId || !text?.trim()) {
      return res.status(400).json({ message: "pinId and text are required" });
    }

    const comment = await Comment.create({
      pin: pinId,
      user: userId,
      text: text.trim(),
    });

    const populated = await comment.populate("user", "userName img");

    res.status(201).json(populated);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.userId;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (!userId || comment.user.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await comment.deleteOne();

    res.status(200).json({ message: "Comment deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};