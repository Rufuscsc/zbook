import { auth, currentUser } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/connectToDB";
import Book from "@/models/book";
import { UploadImage } from "@/lib/upload-image";
import { NextRequest, NextResponse } from "next/server";

// ============================
// Types
// ============================

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
}

// ============================
// POST: Add Book
// ============================

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await currentUser();
    const formData = await req.formData();

    const title = formData.get("title")?.toString() ?? "";
    const author = formData.get("author")?.toString() ?? "";
    const genre = formData.get("genre")?.toString() ?? "";
    const description = formData.get("description")?.toString() ?? "";
    const publishedYearRaw = formData.get("year")?.toString() ?? "";

    const year = publishedYearRaw ? Number(publishedYearRaw) : undefined;

    const cover = formData.get("cover");
    const pdf = formData.get("pdf");

    // Proper file validation
    if (
      !title ||
      !author ||
      !genre ||
      !description ||
      !cover ||
      !pdf ||
      !(cover instanceof File) ||
      !(pdf instanceof File)
    ) {
      return NextResponse.json(
        { error: "All fields including valid files are required" },
        { status: 400 }
      );
    }

    // Correct Promise typing using type assertion
    const [coverUpload, pdfUpload] = await Promise.all([
      UploadImage(cover, "zbooks") as Promise<CloudinaryResponse>,
      UploadImage(pdf, "zbooks-file") as Promise<CloudinaryResponse>,
    ]);

    // Optional: Defensive check if secure_url exists
    if (!coverUpload?.secure_url || !pdfUpload?.secure_url) {
      return NextResponse.json(
        { error: "Cloudinary upload failed to return a secure URL" },
        { status: 500 }
      );
    }

    console.log('PDF SECURE URL: ', pdfUpload?.secure_url)

    const book = await Book.create({
      title,
      author,
      cover: coverUpload.secure_url,
      pdfUrl: pdfUpload.secure_url,
      genre,
      description,
      year,
      addedBy: {
        id: userId,
        firstName: user?.firstName ?? "Anonymous",
      },
    });

    return NextResponse.json({ book }, { status: 201 });
  } catch (error) {
    console.error("Error creating book:", error);

    return NextResponse.json(
      {
        error: "Failed to create book",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ============================
// GET: Fetch Books
// ============================

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const genreParam = request.nextUrl.searchParams.get("genre");

    const query: Record<string, string> = {};

    if (genreParam) {
      const genreUnquoted = genreParam.replace(/^"(.*)"$/, "$1");

      if (genreUnquoted && genreUnquoted !== "All") {
        query.genre = genreUnquoted;
      }
    }

    const books = await Book.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ books }, { status: 200 });
  } catch (error) {
    console.error("Error fetching books:", error);

    return NextResponse.json(
      { error: "Failed to fetch books" },
      { status: 500 }
    );
  }
}
