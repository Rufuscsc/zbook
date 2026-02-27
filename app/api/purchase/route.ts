import { connectToDatabase } from "@/lib/connectToDB";
import Purchase from "@/models/purchase";
import { auth, currentUser } from "@clerk/nextjs/server";
import Book from "@/models/book";

export async function POST(request: Request) {
  try {
    const { isAuthenticated } = await auth();
    if (!isAuthenticated) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    const body = await request.json();
    const { bookId, reference } = body;

    if (!bookId || !reference) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    // 1. Check if purchase already exists for this reference or user/book combo
    const existingPurchase = await Purchase.findOne({
      $or: [
        { reference },
        { userId: user?.id, bookId }
      ]
    });

    if (existingPurchase) {
      return Response.json({ success: true, message: "Purchase already recorded", purchase: existingPurchase }, { status: 200 });
    }

    // 2. Fetch the book to get expected amount
    const book = await Book.findById(bookId);
    if (!book) {
      return Response.json({ error: "Book not found" }, { status: 404 });
    }
    
    // 3. Verify the transaction with Paystack
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data.status !== "success") {
       return Response.json({ error: "Payment verification failed" }, { status: 400 });
    }

    // Check amount matches (Paystack returns amount in kobo/smallest unit)
    const paidAmount = verifyData.data.amount;
    const expectedAmount = book.price || 0;

    if (paidAmount < expectedAmount) {
      return Response.json({ error: "Partial payment detected" }, { status: 400 });
    }

    // 4. Create the purchase record
    const purchase = await Purchase.create({
      userId: user?.id,
      bookId,
      reference,
      amount: paidAmount,
    });

    return Response.json({ success: true, purchase }, { status: 201 });
  } catch (error: any) {
    // If it's a duplicate key error (concurrent requests)
    if (error.code === 11000) {
        return Response.json({ success: true, message: "Purchase already recorded" }, { status: 200 });
    }
    console.error("Purchase record POST error:", error);
    return Response.json({ error: "Failed to record purchase" }, { status: 500 });
  }
}
