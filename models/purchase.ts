import mongoose from "mongoose";

const PurchaseSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    reference: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

// To prevent a user from buying the same book multiple times, we can add a compound index
PurchaseSchema.index({ userId: 1, bookId: 1 }, { unique: true });

const Purchase =
  mongoose.models.Purchase || mongoose.model("Purchase", PurchaseSchema);

export default Purchase;
