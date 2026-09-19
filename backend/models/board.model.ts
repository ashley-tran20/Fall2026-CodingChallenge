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
    // Requires a userId to create a board
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Collaborators store multiple userId's in an array
    // If no collaborators are chosen, defaults to null 
    collaborators: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    // Can toggle boards to be Private
    // Boards are on default public
    isPrivate: {
      type: Boolean,
      default: false,
    },
    // URL for cover image
    coverImage: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Board", boardSchema);