import { connectToDatabase } from "@/lib/connectToDB";
import Book from "@/models/book";
import Cart from "@/models/cart";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const { isAuthenticated } = await auth();

    if (!isAuthenticated) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await currentUser();
    const body = await request.json();
    const { bookId } = body;

    if (!bookId) {
      return Response.json({ error: "Missing bookId" }, { status: 400 });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return Response.json({ error: "Book not found" }, { status: 404 });
    }

    let cart = await Cart.findOne({ userId: user?.id });
    
    if (!cart) {
      cart = await Cart.create({ userId: user?.id, books: [book._id] });
      return Response.json(
        { success: true, added: true, cart },
        { status: 200 }
      );
    }

    // Check if book is already in cart
    const already = cart.books.some(
      (b: any) => b.toString() === bookId.toString()
    );

    if (already) {
      return Response.json(
        { success: true, added: false, message: "Already in cart" },
        { status: 200 }
      );
    }

    cart.books.push(book._id);
    await cart.save();

    return Response.json(
      { success: true, added: true, cart },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cart POST error:", error);

    return Response.json(
      { error: "Failed to add to cart" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { isAuthenticated } = await auth();
    if (!isAuthenticated) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await currentUser();

    const cart = await Cart.findOne({
      userId: user?.id,
    }).populate("books");

    return Response.json(
      { cart: cart || { userId: user?.id, books: [] } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cart GET error:", error);
    return Response.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { isAuthenticated } = await auth();
    if (!isAuthenticated) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await currentUser();

    const body = await request.json();
    const { bookId } = body;

    if (!bookId) {
      return Response.json({ error: "Missing bookId" }, { status: 400 });
    }

    const cart = await Cart.findOne({ userId: user?.id });

    if (!cart) {
      return Response.json(
        { success: false, message: "Cart not found" },
        { status: 200 }
      );
    }

    const beforeCount = cart.books.length;
    cart.books = cart.books.filter(
      (b: any) => b.toString() !== bookId.toString()
    );
    const afterCount = cart.books.length;

    if (afterCount === beforeCount) {
      return Response.json(
        { success: false, message: "Book not in cart" },
        { status: 200 }
      );
    }

    await cart.save();

    return Response.json(
      { success: true, removed: true, cart },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cart DELETE error:", error);

    return Response.json(
      { error: "Failed to remove from cart" },
      { status: 500 }
    );
  }
}