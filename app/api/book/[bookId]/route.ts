import cloudinary from "@/lib/cloudinary";
import { UploadImage } from "@/lib/upload-image";
import { connectToDatabase } from "@/lib/connectToDB";
import Book from "@/models/book";
import { auth, currentUser } from "@clerk/nextjs/server";

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

// Update book by ID
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ bookId: string }> },
) {
  try {
    const { isAuthenticated } = await auth();

    if (!isAuthenticated) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const bookId = (await params).bookId;

    const user = await currentUser();

    const formData = await request.formData();

    const title = formData.get("title")?.toString() || "";
    const author = formData.get("author")?.toString() || "";
    const genre = formData.get("genre")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    const publishedYearRaw = formData.get("year")?.toString() || "";
    const publishedYear = publishedYearRaw
      ? Number(publishedYearRaw)
      : undefined;
    const cover = formData.get("cover") as File;

    if (!title || !author || !cover || !genre || !description) {
      return Response.json(
        {
          error:
            "Title, author, cover image, genre, and description are required",
        },
        { status: 400 },
      );
    }

    const existingBook = await Book.findById(bookId);
    if (!existingBook) {
      return Response.json({ error: "Book not found" }, { status: 404 });
    }

    const addedBy = (existingBook as any).addedBy;
    const requesterId = user?.id;

    let isOwner = false;

    if (requesterId && addedBy && typeof addedBy === "object") {
      const addedById = (addedBy as any).id;
      if (addedById === requesterId) {
        isOwner = true;
      }
    }

    if (!isOwner) {
      return Response.json(
        { error: "Forbidden: only the user who added this book can update it" },
        { status: 403 },
      );
    }

    const update: any = {};
    if (title) update.title = title;
    if (author) update.author = author;
    if (genre) update.genre = genre;
    if (description) update.description = description;
    if (publishedYear !== undefined) update.publishedYear = publishedYear;

    let uploadResult: any;

    const hasNewCover =
      !!cover &&
      typeof (cover as any)?.size === "number" &&
      (cover as any).size > 0;

    if (hasNewCover) {
      const coverFile = cover as File;

      try {
        const existingCoverUrl = (existingBook as any).cover;
        if (existingCoverUrl) {
          const idx = existingCoverUrl.indexOf("/upload/");
          if (idx !== -1) {
            let publicPart = existingCoverUrl.substring(
              idx + "/upload/".length,
            );
            publicPart = publicPart.replace(/^v\d+\//, "");

            const lastDot = publicPart.lastIndexOf(".");
            if (lastDot !== -1) publicPart = publicPart.substring(0, lastDot);

            if (publicPart) {
              try {
                await cloudinary.uploader.destroy(publicPart, {
                  resource_type: "image",
                });

                console.log("Deleted previous Cloudinary image:", publicPart);
              } catch (delErr) {
                console.warn(
                  "Failed to delete previous Cloudinary image",
                  publicPart,
                  delErr,
                );
              }
            }
          }
        }
      } catch (error) {
        console.warn("Error while attempting to remove previous cover:", error);
      }

      uploadResult = await UploadImage(coverFile, "zbooks");
      if (uploadResult?.secure_url) update.cover = uploadResult.secure_url;
    }

    const updatedBook = await Book.findByIdAndUpdate(bookId, update, {
      new: true,
    });

    return Response.json({ book: updatedBook }, { status: 200 });
  } catch (error) {
    console.error("Error updating book:", error);
    return Response.json({ error: "Failed to update book" }, { status: 500 });
  }
}
