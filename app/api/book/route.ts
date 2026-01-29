import { auth, currentUser } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/connectToDB";
import Book from "@/models/book";
import { UploadImage } from "@/lib/upload-image";
import { NextRequest } from "next/server";

// Add books to db
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure the function is called with parentheses
    await connectToDatabase(); 
    
    const user = await currentUser();
    const formData = await req.formData();

    const title = formData.get("title")?.toString() || "";
    const author = formData.get("author")?.toString() || "";
    const genre = formData.get("genre")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    const publishedYearRaw = formData.get("year")?.toString() || "";
    
    const year = publishedYearRaw ? Number(publishedYearRaw) : undefined;
    const cover = formData.get("cover") as File;

    if (!title || !author || !genre || !description) {
      return Response.json(
        { error: "Title, author, cover image, genre, and description are required" },
        { status: 400 }
      );
    }

    let uploadResult: any;
    if (cover) {
      uploadResult = await UploadImage(cover, "zbooks");
    }

    console.log("Upload Result: ", uploadResult);

    // 4. Create the Book Entry
    const book = await Book.create({
      title,
      author,
      /**
       * AUTOMATIC SLASH LOGIC:
       * If Cloudinary returns a secure_url (starts with https://), use it as is.
       * If it falls back to the filename, automatically prepend the leading "/" 
       * required by the Next.js Image component for local files.
       */
      cover: uploadResult?.secure_url || (cover?.name ? `/${cover.name}` : "/default-cover.jpg"),    
      genre,
      description,
      year,
      addedBy: { 
        id: user?.id, 
        firstName: user?.firstName || "Anonymous" 
      },
    });

    return Response.json({ book }, { status: 201 });
  } catch (error) {
    console.error("Error creating book: ", error);
    return Response.json(
      { error: "Failed to create book", details: error instanceof Error ? error.message : "Unknown error" }, 
      { status: 500 }
    );
  }
}

// Get books from db
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Fetch books and sort by newest first
    const books = await Book.find().sort({ createdAt: -1 });

    return Response.json({ books }, { status: 200 });
  } catch (error) {
    console.error("Error fetching books: ", error);
    return Response.json({ error: "Failed to fetch books" }, { status: 500 });
  }
}