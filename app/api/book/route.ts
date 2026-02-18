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

    // ============================
    // Extract Text Fields
    // ============================

    const title = formData.get("title")?.toString().trim() ?? "";
    const author = formData.get("author")?.toString().trim() ?? "";
    const genre = formData.get("genre")?.toString().trim() ?? "";
    const description = formData.get("description")?.toString().trim() ?? "";
    const publishedYearRaw = formData.get("year")?.toString() ?? "";

    // 🔥 NEW FIELDS
    const priceRaw = formData.get("price")?.toString() ?? "";
    const currency = formData.get("currency")?.toString() ?? "USD";

    const year = publishedYearRaw ? Number(publishedYearRaw) : undefined;
    const price = priceRaw ? Number(priceRaw) : NaN;

    const cover = formData.get("cover");
    const pdf = formData.get("pdf");

    // ============================
    // Validation
    // ============================

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

    if (isNaN(price) || price < 0) {
      return NextResponse.json(
        { error: "Invalid price value" },
        { status: 400 }
      );
    }

    // ============================
    // Upload to Cloudinary
    // ============================

    const [coverUpload, pdfUpload] = await Promise.all([
      UploadImage(cover, "zbooks") as Promise<CloudinaryResponse>,
      UploadImage(pdf, "zbooks-file") as Promise<CloudinaryResponse>,
    ]);

    if (!coverUpload?.secure_url || !pdfUpload?.secure_url) {
      return NextResponse.json(
        { error: "Cloudinary upload failed" },
        { status: 500 }
      );
    }

    // ============================
    // Create Book in Database
    // ============================

    const book = await Book.create({
      title,
      author,
      cover: coverUpload.secure_url,
      pdfUrl: pdfUpload.secure_url,
      genre,
      description,
      year,
      price,        // stored in minor units (kobo/cents)
      currency,     // stored currency
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
