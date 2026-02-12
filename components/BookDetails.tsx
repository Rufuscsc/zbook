"use client";

import Image from "next/image";
import { Button } from "./ui/button";
import {
  BookMinus,
  BookPlus,
  Calendar,
  Dot,
  Edit,
  Loader2,
  Trash2,
  User,
} from "lucide-react";
import { Badge } from "./ui/badge";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const BookDetails = ({
  _id,
  title,
  author,
  cover,
  genre,
  description,
  year,
  addedBy,
  createdAt,
}: Book) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isInLibrary, setIsInLibrary] = useState(false);
  const [isCheckingLibrary, setIsCheckingLibrary] = useState(true);
   const [isRemoving, setIsRemoving] = useState(false);

  const formatDate = (d?: string) => {
    if (!d) return "";

    try {
      const date = new Date(d);
      if (isNaN(date.getTime())) return d;
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return d;
    }
  };
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await axios.delete(`/api/book/${_id}`);
      console.log("Book deleted successfully");
      router.push("/explore");
    } catch (error) {
      console.error("Failed to delete book:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddToLibrary = async () => {
    if (!_id) {
      console.log("Missing book id");
      return;
    }

    try {
      setIsAdding(true);
      const res = await axios.post("/api/library", { bookId: _id });
      console.log(res);

      if (res.data?.added) {
        setIsInLibrary(true);
      }
    } catch (error) {
      console.error("Failed to add to library", error);
    } finally {
      setIsAdding(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const checkLibray = async () => {
      if (!_id) {
        if (mounted) {
          setIsCheckingLibrary(false);
          return;
        }
      }

      try {
        setIsCheckingLibrary(true);

        const res = await axios.get("/api/library");
        console.log("response: ", res);
        const books = res.data?.library?.books || [];
        console.log("Books: ", books);
        const found = books.some((b: Book) => {
          if (!b) return false;
          if (b._id) {
            return b._id === _id;
          }
          return false;
        });

        console.log("Found: ", found);
        if (mounted) {
          setIsInLibrary(found);
        }
      } catch (error) {
        console.error("Failed to check library:", error);
      } finally {
        if (mounted) setIsCheckingLibrary(false);
      }
    };

    checkLibray();

    return () => {
      mounted = false;
    };
  }, [_id]);

  const handleRemoveFromLibrary = async () => {
    if (!_id) {
      return;
    }

    try {
      setIsRemoving(true);
      const res = await axios.delete("/api/library", { data: { bookId: _id } });

      if (res.data?.removed) {
        setIsInLibrary(false);
      }
    } catch (error) {
      console.error("Failed to remove from library", error);
    } finally {
      setIsRemoving(false);
    }
  };
  return (
    <div className="w-full p-4">
      <div className="flex flex-col md:flex-row items-start gap-7 lg:gap-12">
        <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col items-center md:items-start">
          <div className="relative w-full max-w-70 md:max-w-none aspect-2/3 md:max-h-screen overflow-hidden rounded-md bg-muted shadow-lg">
            {cover ? (
              <Image
                src={cover}
                alt={`${title} cover`}
                className="object-cover"
                fill
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full text-muted-foreground italic border">
                No cover available
              </div>
            )}
          </div>

          <div className="pt-4 w-full">
            {isCheckingLibrary ? (
              <Button className="w-full" disabled>
                <Loader2 className="w-4 h-4 animate-spin" />
              </Button>
            ) : isInLibrary ? (
              <>
                <Button
                  className="w-full"
                  onClick={handleRemoveFromLibrary}
                  disabled={isRemoving}
                >
                  {isRemoving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <BookMinus />
                      Remove from Library
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button className="w-full" onClick={handleAddToLibrary}>
                {isAdding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <BookPlus />
                    Add to My Library
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
        <div className="flex-1 w-full">
          <div className="flex justify-between items-start mb-4">
            {genre && (
              <Badge variant="secondary" className="px-3 py-1">
                {genre}
              </Badge>
            )}

            {/* Updated Permission Logic */}
            {isLoaded &&
            isSignedIn &&
            (user?.id === addedBy?.id ||
              user?.primaryEmailAddress?.emailAddress ===
                "rufusmfmwellens@gmail.com") ? (
              <div>
                <Button variant={"ghost"} size="icon" asChild>
                  <Link href={`/book/${_id}/edit`}>
                    <Edit className="w-4 h-4" />{" "}
                    {/* Standard Lucide Edit Icon */}
                  </Link>
                </Button>
                <Button variant={"ghost"} size="icon" onClick={handleDelete}>
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-destructive" />
                  ) : (
                    <Trash2 className="w-4 h-4 text-destructive" />
                  )}
                </Button>
              </div>
            ) : null}
          </div>

          <h1 className="font-bold text-3xl md:text-5xl lg:text-6xl tracking-tight text-foreground">
            {title}
          </h1>

          <div className="flex items-center gap-4 text-muted-foreground mt-3">
            {author && (
              <div className="flex gap-1 items-center font-medium!">
                <User className="w-4 h-4" /> {author}
              </div>
            )}

            {year && (
              <div className="flex gap-1 items-center font-medium!">
                <Calendar className="w-4 h-4" />
                {year}
              </div>
            )}
          </div>

          <hr className="my-4" />

          <h2 className="font-semibold text-2xl pt-3">About This Book</h2>
          <p className="text-muted-foreground mt-2 whitespace-pre-line">
            {description}
          </p>

          <hr className="my-4" />
          <p className="flex items-center text-sm text-muted-foreground">
            {addedBy && (
              <span>
                Added by <span className="text-black">{addedBy.firstName}</span>
              </span>
            )}

            <Dot />

            {createdAt && <span>{formatDate(createdAt)}</span>}
          </p>
          <Button
            className="mt-3 flex items-center justify-center gap-2 w-fit py-2 px-6 
             bg-[#000000] text-white font-medium rounded-full transition-colors 
             border border-transparent hover:bg-[#000000]/80"
            onClick={() => router.push(`/book/${_id}/read`)}
          >
            Read
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
