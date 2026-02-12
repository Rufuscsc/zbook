import mongoose from "mongoose";

const LibrarySchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  books: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
});

const Library =
  mongoose.models.Library || mongoose.model("Library", LibrarySchema);

export default Library;