
import { connectToDatabase } from "@/lib/connectToDB";
import Book from "@/models/book";
import Library from "@/models/library";
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

    let library = await Library.findOne({ userId: user?.id });
    if (!library) {
      library = await Library.create({ userId: user?.id, books: [book._id] });
      return Response.json(
        { success: true, added: true, library },
        { status: 200 }
      );
    }

    const already = library.books.some(
      (b: any) => b.toString === bookId.toString
    );

    if (already) {
      return Response.json(
        { success: true, added: false, message: "Already in library" },
        { status: 200 }
      );
    }

    library.books.push(book._id);
    await library.save();

    return Response.json(
      { success: true, added: true, library },
      { status: 200 }
    );
  } catch (error) {
    console.error("Library POST error:", error);

    return Response.json(
      { error: "Failed to add to library" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { isAuthenticated, userId } = await auth();
    if (!isAuthenticated || !userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const library = await Library.findOne({
      userId: userId,
    }).populate("books");

    return Response.json(
      { library: library || { userId: userId, books: [] } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Library GET error:", error);
    return Response.json({ error: "Failed to fetch library" }, { status: 500 });
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

    const library = await Library.findOne({ userId: user?.id });

    if (!library) {
      return Response.json(
        { success: false, message: "Library not found" },
        { status: 200 }
      );
    }

    const beforeCount = library.books.length;
    library.books = library.books.filter(
      (b: any) => b.toString() !== bookId.toString()
    );
    const afterCount = library.books.length;

    if (afterCount === beforeCount) {
      return Response.json(
        { success: false, message: "Book not in library" },
        { status: 200 }
      );
    }

    await library.save();

    return Response.json(
      { success: true, removed: true, library },
      { status: 200 }
    );
  } catch (error) {
    console.error("Library DELETE error:", error);

    return Response.json(
      { error: "Failed to remove from library" },
      { status: 500 }
    );
  }
}