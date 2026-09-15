import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route";
import pinRouter from "./routes/pin.route";
import commentRouter from "./routes/comment.route";
import boardRouter from "./routes/board.route";
import notificationRouter from "./routes/notification.route";
import connectDB from "./utils/connectDB";

connectDB();
const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/users", userRouter);
app.use("/pins", pinRouter);
app.use("/comments", commentRouter);
app.use("/boards", boardRouter);
app.use("/notifications", notificationRouter);
app.use("/uploads", express.static("uploads"));

app.listen(3000, () => {
  console.log("Server is running!");
});