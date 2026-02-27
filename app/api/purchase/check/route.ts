import { connectToDatabase } from "@/lib/connectToDB";
import Purchase from "@/models/purchase";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  try {
    const { isAuthenticated } = await auth();
    if (!isAuthenticated) {
      return Response.json({ hasPurchased: false }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get("bookId");

    if (!bookId) {
      return Response.json({ error: "Missing bookId parameter" }, { status: 400 });
    }

    const user = await currentUser();
    await connectToDatabase();

    const existingPurchase = await Purchase.findOne({
      userId: user?.id,
      bookId,
    });

    return Response.json({ hasPurchased: !!existingPurchase }, { status: 200 });
  } catch (error) {
    console.error("Purchase check GET error:", error);
    return Response.json({ error: "Failed to check purchase status" }, { status: 500 });
  }
}
