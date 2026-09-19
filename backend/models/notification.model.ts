import { Schema } from "mongoose";
import mongoose from "mongoose";

const notificationSchema = new Schema(
  {
    // Stores a recipent's MongoDB Id
    // Must require invitee to receive a notificant for collaborate boards
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    // Type of notifications can vary
    // but currently only implemented board_invite
    type: {
      type: String,
      enum: ["board_invite"],
      required: true,
    },
    // Automated message that is displayed on notification tab
    message: {
      type: String,
      required: true,
    },
    // Notification can be linked to one specific board
    board: {
      type: Schema.Types.ObjectId,
      ref: "Board",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Notification", notificationSchema);
