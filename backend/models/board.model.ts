import { Schema } from "mongoose";
import mongoose from "mongoose";

const boardSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collaborators: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    coverImage: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Board", boardSchema);