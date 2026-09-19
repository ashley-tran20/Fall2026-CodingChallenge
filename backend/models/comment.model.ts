import { Schema } from "mongoose";
import mongoose from "mongoose";

const commentSchema = new Schema(
  {
    //Comment's are linked to a specific Pin
    pin: {
      type: Schema.Types.ObjectId,
      ref: "Pin",
      required: true,
    },
    //Requires a userID to identify who wrote the comment
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Comment", commentSchema);