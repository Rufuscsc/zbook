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

    // 1. Extract standard fields
    const title = formData.get("title")?.toString() || "";
    const author = formData.get("author")?.toString() || "";
    const genre = formData.get("genre")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    const publishedYearRaw = formData.get("year")?.toString() || "";
    const publishedYear = publishedYearRaw ? Number(publishedYearRaw) : undefined;

    // 2. Extract Files
    const cover = formData.get("cover") as File;
    const pdf = formData.get("pdf") as File;

    const existingBook = await Book.findById(bookId);
    if (!existingBook) {
      return Response.json({ error: "Book not found" }, { status: 404 });
    }

    // 3. Ownership Verification
   const addedBy = (existingBook as any).addedBy;
    const requesterId = user?.id;
    const requesterEmail = user?.emailAddresses?.[0]?.emailAddress; // Get email from Clerk user object
    
    const ADMIN_EMAIL = "rufusmfmwellens@gmail.com";
    let isOwner = false;
    let isAdmin = requesterEmail === ADMIN_EMAIL;

    // Check for Ownership
    if (requesterId && addedBy && (typeof addedBy === "object" || typeof addedBy === "string")) {
      const addedById = typeof addedBy === "object" ? (addedBy as any).id : addedBy;
      if (addedById === requesterId) isOwner = true;
    }

    // Allow access if they are the owner OR the specific admin
    if (!isOwner && !isAdmin) {
      return Response.json(
        { error: "Forbidden: only the owner or admin can modify this book" },
        { status: 403 },
      );
    }

    // 4. Build the Update Object
    const update: any = {};
    if (title) update.title = title;
    if (author) update.author = author;
    if (genre) update.genre = genre;
    if (description) update.description = description;
    if (publishedYear !== undefined) update.year = publishedYear;

    // 5. Handle Cover Image Update
    const hasNewCover = !!cover && typeof (cover as any)?.size === "number" && cover.size > 0;
    if (hasNewCover) {
      // Deletion of old cover logic
      const existingCoverUrl = (existingBook as any).cover;
      if (existingCoverUrl) {
        const publicId = existingCoverUrl.split('/').pop()?.split('.')[0];
        if (publicId) await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
      }
      const uploadResult = await UploadImage(cover, "zbooks_covers") as any;
      if (uploadResult?.secure_url) update.cover = uploadResult.secure_url;
    }

    // 6. Handle PDF File Update
    const hasNewPdf = !!pdf && typeof (pdf as any)?.size === "number" && pdf.size > 0;
    if (hasNewPdf) {
      // Deletion of old PDF logic
      const existingPdfUrl = (existingBook as any).pdfUrl; // Ensure this matches your Schema
      if (existingPdfUrl) {
        // Extracting Public ID for PDFs stored as "raw" or "image"
        const publicId = existingPdfUrl.split('/').pop()?.split('.')[0];
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId, { resource_type: "raw" }); // PDFs are usually "raw"
          } catch (delErr) {
            console.warn("Failed to delete previous PDF:", delErr);
          }
        }
      }
      // Upload new PDF - Make sure UploadImage uses resource_type: "auto" or "raw"
      const pdfUpload = await UploadImage(pdf, "zbooks_pdfs") as any;
      if (pdfUpload?.secure_url) update.pdfUrl = pdfUpload.secure_url;
    }

    // 7. Execute Database Update
    const updatedBook = await Book.findByIdAndUpdate(bookId, update, {
      new: true,
    });

    return Response.json({ book: updatedBook }, { status: 200 });

  } catch (error) {
    console.error("Error updating book:", error);
    return Response.json({ error: "Failed to update book" }, { status: 500 });
  }
}

// Delete book by ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { isAuthenticated } = await auth();

    if (!isAuthenticated) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const bookId = (await params).bookId;

    const user = await currentUser();

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
        { status: 403 }
      );
    }

    // Attempt to delete the cover image from Cloudinary if present

    try {
      const existingCoverUrl = (existingBook as any).cover;

      if (existingCoverUrl && typeof existingCoverUrl === "string") {
        const idx = existingCoverUrl.indexOf("/upload/");

        if (idx !== -1) {
          let publicPart = existingCoverUrl.substring(idx + "/upload/".length);

          publicPart = publicPart.replace(/^v\d+\//, "");

          const lastDot = publicPart.lastIndexOf(".");

          if (lastDot !== -1) publicPart = publicPart.substring(0, lastDot);

          if (publicPart) {
            try {
              await cloudinary.uploader.destroy(publicPart, {
                resource_type: "image",
              });

              console.log("Deleted Cloudinary image:", publicPart);
            } catch (delErr) {
              console.warn(
                "Failed to delete Cloudinary image",
                publicPart,
                delErr
              );
            }
          }
        }
      }
    } catch (err) {
      console.warn(
        "Error while attempting to remove cover before deletion:",
        err
      );
    }

    await Book.findByIdAndDelete(bookId);

    return Response.json({message: "Book deleted"}, {status: 200})
  } catch (error) {
    console.error("Error deleting book:", error);
    return Response.json({ error: "Failed to delete book" }, { status: 500 });
  }
}