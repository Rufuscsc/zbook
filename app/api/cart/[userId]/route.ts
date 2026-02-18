// app/api/cart/[userId]/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/connectToDB";
import Cart from "@/models/cart";

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  await connectToDatabase();
  const cart = await Cart.findOne({ userId: params.userId }).lean();
  return NextResponse.json({ cart });
}
