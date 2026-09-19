import { Request, Response } from "express";
import User from "../models/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const test = (req: Request, res: Response) => {
  return res.json("hello from controller!");
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, displayName, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const existingUser = await User.findOne({ userName: username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      userName: username,
      email,
      hashedPassword,
    });

    const age = 1000 * 60 * 60 * 24 * 7; // 7 days

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: age,
    });

    const { hashedPassword: _, ...detailsWithoutPassword } = user.toObject();

    res
      .cookie("token", token, {
        httpOnly: true,
        maxAge: age,
      })
      .status(201)
      .json(detailsWithoutPassword);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ userName: username });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isCorrect = await bcrypt.compare(password, user.hashedPassword);

    if (!isCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const age = 1000 * 60 * 60 * 24 * 7; // 7 days

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: age,
    });

    const { hashedPassword: _, ...detailsWithoutPassword } = user.toObject();

    res
      .cookie("token", token, {
        httpOnly: true,
        maxAge: age,
      })
      .status(200)
      .json(detailsWithoutPassword);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const logoutUser = (req: Request, res: Response) => {
  res.clearCookie("token").status(200).json({ message: "Logged out" });
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const username = req.params.username as string;

    const user = await User.findOne({ userName: username }).select(
      "-hashedPassword",
    );

    if (!user) {
      return res.status(404).json("User not found");
    }

    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json("Something went wrong");
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(userId).select("-hashedPassword");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const searchUsers = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;

    const users = await User.find({
      userName: { $regex: query, $options: "i" },
    }).select("-hashedPassword");

    res.status(200).json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json("Something went wrong");
  }
};