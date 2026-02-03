import { connectToDatabase } from "@/lib/connectToDB";
import Book from "@/models/book";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ bookId: string }> },
) {
  try {
    const bookId = (await params).bookId;
    await connectToDatabase();
    const book = await Book.findById(bookId);

    if (!book) {
      return Response.json({ error: "Book not found" }, { status: 404 });
    }

    return Response.json(book);
  } catch (error) {
    console.error("Error fetching book", error);
    return Response.json({ error: "Failed to fetch book" }, { status: 500 });
  }
}
