import mongoose from "mongoose";

const BookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    cover: { type: String, required: true },
    pdfUrl: { type: String, required: true },
    genre: { type: String, required: true },
    description: { type: String, required: true },
    year: { type: Number },
    price: { type: Number, required: true }, // store in cents (e.g., 1999 = $19.99)
    currency: { type: String, default: "USD" }, // ISO currency code
    addedBy: {
      id: { type: String, required: true },
      firstName: { type: String, required: true },
    },
  },
  { timestamps: true },
);

const Book = mongoose.models.Book || mongoose.model("Book", BookSchema);

export default Book;
