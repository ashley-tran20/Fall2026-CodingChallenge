import { Request, Response } from "express";
import Pin from "../models/pin.model";
import Board from "../models/board.model";

export const getPins = async (req: Request, res: Response) => {
  const pins = await Pin.find();
  res.status(200).json(pins);
};

export const getPin = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const pin = await Pin.findById(id).populate("user", "-hashedPassword");

    if (!pin) {
      return res.status(404).json({ message: "Pin not found" });
    }

    res.status(200).json(pin);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const canEditBoard = (board: any, userId: string) => {
  const isOwner = board.user.toString() === userId;
  const isCollaborator = board.collaborators?.some(
    (c: any) => c.toString() === userId,
  );
  return isOwner || isCollaborator;
};

export const createPin = async (req: Request, res: Response) => {
  try {
    const { media, width, height, title, description, board, link, tags } =
      req.body as {
        media: string;
        width: number;
        height: number;
        title: string;
        description: string;
        board?: string;
        link?: string;
        tags?: string[];
      };
    const userId = req.userId;

    if (!media || !width || !height || !title || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (board) {
      const boardDoc = await Board.findById(board);
      if (!boardDoc) {
        return res.status(404).json({ message: "Board not found" });
      }
      if (!canEditBoard(boardDoc, userId)) {
        return res.status(403).json({ message: "Not authorized to add to this board" });
      }
    }

    const pinData: Record<string, unknown> = {
      media,
      width,
      height,
      title,
      description,
      user: userId,
    };

    if (board) pinData.board = board;
    if (link) pinData.link = link;
    if (tags) pinData.tags = tags;

    const pin = await Pin.create(pinData);

    res.status(201).json(pin);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const createPinWithUpload = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const file = req.file;
    const { title, description, board, link, tags, width, height } =
      req.body as {
        title: string;
        description: string;
        board?: string;
        link?: string;
        tags?: string;
        width: string;
        height: string;
      };

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    if (!title || !description || !width || !height) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (board) {
      const boardDoc = await Board.findById(board);
      if (!boardDoc) {
        return res.status(404).json({ message: "Board not found" });
      }
      if (!canEditBoard(boardDoc, userId)) {
        return res.status(403).json({ message: "Not authorized to add to this board" });
      }
    }

    const mediaUrl = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;

    const pinData: Record<string, unknown> = {
      media: mediaUrl,
      width: Number(width),
      height: Number(height),
      title,
      description,
      user: userId,
    };

    if (board) pinData.board = board;
    if (link) pinData.link = link;
    if (tags) {
      pinData.tags = tags.split(",").map((t) => t.trim()).filter(Boolean);
    }

    const pin = await Pin.create(pinData);

    res.status(201).json(pin);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getPinsByUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;

    const pins = await Pin.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json(pins);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getPinsByBoard = async (req: Request, res: Response) => {
  try {
    const boardId = req.params.boardId as string;

    const pins = await Pin.find({ board: boardId }).sort({ createdAt: -1 });

    res.status(200).json(pins);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deletePin = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.userId;

    const pin = await Pin.findById(id);

    if (!pin) {
      return res.status(404).json({ message: "Pin not found" });
    }

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const isPinOwner = pin.user.toString() === userId;
    let isBoardAuthorized = false;

    if (pin.board) {
      const boardDoc = await Board.findById(pin.board);
      if (boardDoc) {
        isBoardAuthorized = canEditBoard(boardDoc, userId);
      }
    }

    if (!isPinOwner && !isBoardAuthorized) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await pin.deleteOne();

    res.status(200).json({ message: "Pin deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updatePin = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.userId;
    const { title, description, board } = req.body as {
      title?: string;
      description?: string;
      board?: string | null;
    };

    const pin = await Pin.findById(id);

    if (!pin) {
      return res.status(404).json({ message: "Pin not found" });
    }

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const isPinOwner = pin.user.toString() === userId;
    let isBoardAuthorized = false;

    if (pin.board) {
      const boardDoc = await Board.findById(pin.board);
      if (boardDoc) {
        isBoardAuthorized = canEditBoard(boardDoc, userId);
      }
    }

    if (!isPinOwner && !isBoardAuthorized) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (title !== undefined) pin.title = title;
    if (description !== undefined) pin.description = description;
    if (board !== undefined) pin.board = (board || undefined) as any;

    await pin.save();

    res.status(200).json(pin);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};