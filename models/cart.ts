// models/cart.ts
import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  title: String,
  price: { type: Number, required: true }, // snapshot price in cents
  currency: { type: String, default: "USD" },
  quantity: { type: Number, default: 1 }
});

const CartSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // or ObjectId if you have user collection
  items: [CartItemSchema],
  updatedAt: { type: Date, default: Date.now }
});

const Cart = mongoose.models.Cart || mongoose.model("Cart", CartSchema);
export default Cart;
