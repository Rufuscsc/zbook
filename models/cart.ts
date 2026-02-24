import mongoose from "mongoose";

const CartSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  books: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
});

const Cart =
  mongoose.models.Cart || mongoose.model("Library", CartSchema);

export default Cart;