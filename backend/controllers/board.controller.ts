import { Request, Response } from "express";
import Board from "../models/board.model";
import Pin from "../models/pin.model";
import User from "../models/user.model";
import Notification from "../models/notification.model";

//Determines who can or cannot manage the board
const canManageBoard = (board: any, userId: string) => {
  //Grabs the users id to determine whether ot not it matches the userID
  const isOwner = board.user.toString() === userId;
  //?. function checks for undefined list and stops safely
  const isCollaborator = board.collaborators?.some(
    (c: any) => c.toString() === userId,
  );
  return isOwner || isCollaborator;
};

export const createBoard = async (req: Request, res: Response) => {
  try {
    //takes the values in the frontend and creates seperate variables for them
    const { title, description, isPrivate, coverImage } = req.body;
    const userId = req.userId;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Creates board document that follows our board model/board Schema
    const board = await Board.create({
      title,
      description,
      isPrivate,
      coverImage,
      user: userId,
    });

    // .json(board) sends data back to MongoDB
    res.status(201).json(board);
  } catch (err) {
    //Catches an error
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Shows user's their own boards (public & private)
// Only shows public boards if not owner
export const getBoardsByUser = async (req: Request, res: Response) => {
  try {
    // Explicitly casts userId into a string with "as"
    const userId = req.params.userId as string;
    const viewerId = req.userId;
    //Checks to see if viewer is the same as the person their viewing
    const isSelf = viewerId === userId;
    // Checks if the userId's
    const filter: any = { user: userId };
    // if isPrivate is false include it
    // else don't include it
    if (!isSelf) {
      filter.isPrivate = { $ne: true };
    }
    // Finds boards that match filter and sort through the newest first 
    const boards = await Board.find(filter).sort({ createdAt: -1 });

    res.status(200).json(boards);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Find the boards the user is collaborating on
export const getCollaboratedBoards = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    // Finds the board where they have been added as a collaborator
    // Find the board if they are an owner and is not null 
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
    const viewerId = req.userId;

    const board = await Board.findById(id)
    // Swaps all the collaborators for a real user and includes user
      .populate("user", "-hashedPassword")
      .populate("collaborators", "userName");

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }
    // Checks if their is anyone logged in
    // Compares board ID with the owner's id 
    const isOwner = viewerId && board.user._id.toString() === viewerId;
    // Checks if logged in ID matches collaborators 
    const isCollaborator =
      viewerId &&
      board.collaborators?.some((c: any) => c._id.toString() === viewerId);

    if (board.isPrivate && !isOwner && !isCollaborator) {
      return res.status(403).json({ message: "This board is private" });
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
    const { title, description, isPrivate } = req.body as {
      title?: string;
      description?: string;
      isPrivate?: boolean;
    };

    const board = await Board.findById(id);

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    if (!userId || !canManageBoard(board, userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }
    // Overwrite title,description and isPrivate if new information has been sent
    if (title !== undefined) board.title = title;
    if (description !== undefined) board.description = description;
    if (isPrivate !== undefined) board.isPrivate = isPrivate;

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

    // Doesn't allow non logged in/non owners of the board delete the board 
    if (!userId || board.user.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Finds every pin that belongs to the board that is about to be deleted 
    // sets the board value to null
    await Pin.updateMany({ board: id }, { $unset: { board: "" } });

    // Deletes entirely from the MongoDB
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

    if (!userId || !canManageBoard(board, userId)) {
      return res.status(403).json({
        message: "Only the owner or a collaborator can add collaborators",
      });
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

    const inviter = await User.findById(userId);

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
