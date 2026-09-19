import { Schema } from "mongoose";
import mongoose from "mongoose";

//Blueprint for every Pin Document in our database
const pinSchema = new Schema(
  {
    // Requires for a URL in order to allow the save feature
    media: {
      type: String,
      required: true,
    },
    // Require width and height in order to 
    // incorporate in our masonary grid layout
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    // References the board the pin belongs to with Mongo ObjectId
    // Optional can save pin without an existing board
    board: {
      type: Schema.Types.ObjectId,
      ref: "Board",
    },
    link: {
      type: String,
    },
    // Tags are used to allow for images to appear on the
    // "More Like This" section in our web application 
    tags: {
      type: [String],
    },
    // Store a pointer to the user information
    // UserId is required in order to save a pin
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Pin", pinSchema);