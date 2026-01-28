import { auth, currentUser } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/connectToDB";
import Book from "@/models/book";

export async function POST(req: Request) {
  try {
    // 1. Corrected Clerk Auth Check
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Corrected Function Call (added parentheses)
    await connectToDatabase(); 
    
    const user = await currentUser();
    const formData = await req.formData();

    // 3. Extraction with fallback values
    const title = formData.get("title")?.toString() || "";
    const author = formData.get("author")?.toString() || "";
    const genre = formData.get("genre")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    const publishedYearRaw = formData.get("year")?.toString() || "";
    
    const year = publishedYearRaw ? Number(publishedYearRaw) : undefined;
    const coverFile = formData.get("cover") as File;

    // 4. Create the Book Entry
    const book = await Book.create({
      title,
      author,
      // Note: This currently only saves the filename string. 
      // In a full implementation, you would upload coverFile to 
      // a service like Cloudinary or S3 and save the resulting URL here.
      cover: coverFile ? coverFile.name : "default-cover.jpg",
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
    // 5. Improved Error Logging
    console.error("Error creating book: ", error);
    return Response.json(
      { error: "Failed to create book", details: error instanceof Error ? error.message : "Unknown error" }, 
      { status: 500 }
    );
  }
}