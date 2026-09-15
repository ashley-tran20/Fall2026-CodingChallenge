import { Request, Response } from "express";
import Board from "../models/board.model";
import Pin from "../models/pin.model";
import User from "../models/user.model";
import Notification from "../models/notification.model";

export const createBoard = async (req: Request, res: Response) => {
  try {
    const { title, description, isPrivate, coverImage } = req.body;
    const userId = req.userId;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const board = await Board.create({
      title,
      description,
      isPrivate,
      coverImage,
      user: userId,
    });

    res.status(201).json(board);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getBoardsByUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;

    const boards = await Board.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json(boards);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getCollaboratedBoards = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;

    const boards = await Board.find({
      $or: [
        { collaborators: userId },
        { user: userId, collaborators: { $ne: [] } },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json(boards);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getBoard = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const board = await Board.findById(id)
      .populate("user", "-hashedPassword")
      .populate("collaborators", "userName");

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    res.status(200).json(board);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateBoard = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.userId;
    const { title, description } = req.body as {
      title?: string;
      description?: string;
    };

    const board = await Board.findById(id);

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    if (!userId || board.user.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (title !== undefined) board.title = title;
    if (description !== undefined) board.description = description;

    await board.save();

    res.status(200).json(board);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteBoard = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.userId;

    const board = await Board.findById(id);

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    if (!userId || board.user.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // unlink pins from this board instead of deleting them
    await Pin.updateMany({ board: id }, { $unset: { board: "" } });

    await board.deleteOne();

    res.status(200).json({ message: "Board deleted, pins kept" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const addCollaborator = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.userId;
    const { username } = req.body as { username: string };

    const board = await Board.findById(id);

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    if (!userId || board.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Only the owner can add collaborators" });
    }

    const collaborator = await User.findOne({ userName: username });

    if (!collaborator) {
      return res.status(404).json({ message: "User not found" });
    }

    if (collaborator._id.toString() === board.user.toString()) {
      return res.status(400).json({ message: "Owner is already on the board" });
    }

    const alreadyAdded = board.collaborators.some(
      (c: any) => c.toString() === collaborator._id.toString(),
    );

    if (alreadyAdded) {
      return res
        .status(400)
        .json({ message: "User is already a collaborator" });
    }

    const owner = await User.findById(userId);

    await Notification.create({
      recipient: collaborator._id,
      sender: userId,
      type: "board_invite",
      message: `added you to their "${board.title}" board. Would you like to join them?`,
      board: board._id,
    });

    res.status(200).json({ message: "Invite sent" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const removeCollaborator = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.userId;
    const { collaboratorId } = req.body as { collaboratorId: string };

    const board = await Board.findById(id);

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    const isOwner = board.user.toString() === userId;
    const isSelfRemoval = userId === collaboratorId;

    if (!userId || (!isOwner && !isSelfRemoval)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    board.collaborators = board.collaborators.filter(
      (c: any) => c.toString() !== collaboratorId,
    );
    await board.save();

    res.status(200).json(board);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};
