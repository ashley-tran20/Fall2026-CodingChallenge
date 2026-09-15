import express from "express";
import {
  test,
  getUser,
  searchUsers,
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser
} from "../controllers/user.controller";
import User from "../models/user.model";
import { verifyToken } from "../middleware/verifyToken";


const router = express.Router();
router.get("/auth/me", verifyToken, getCurrentUser);
router.post("/auth/register", registerUser);
router.post("/auth/login", loginUser);
router.post("/auth/logout", logoutUser);

router.get("/fetch", async (req, res) => {
  try {
    const users = await User.find().select("-hashedPassword");
    res.json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json("Something went wrong");
  }
});

router.get("/test", test);
router.get("/search", searchUsers);
router.get("/:username", getUser);


export default router;
