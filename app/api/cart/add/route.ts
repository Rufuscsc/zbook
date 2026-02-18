// app/api/cart/add/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/connectToDB"; // your mongoose connection util
import Cart from "@/models/cart";
import Book from "@/models/book";

export async function POST(request: Request) {
  await connectToDatabase();
  const body = await request.json();
  const { userId, bookId, qty = 1 } = body;

  if (!userId || !bookId) {
    return NextResponse.json({ error: "userId and bookId required" }, { status: 400 });
  }

  const book = await Book.findById(bookId).lean();
  if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }

  const existing = cart.items.find((i: { bookId: { toString: () => any; }; }) => i.bookId.toString() === bookId);
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.items.push({
      bookId,
      title: book.title,
      price: book.price, // cents
      currency: book.currency || "USD",
      quantity: qty
    });
  }
  cart.updatedAt = new Date();
  await cart.save();
  return NextResponse.json({ success: true, cart });
}
