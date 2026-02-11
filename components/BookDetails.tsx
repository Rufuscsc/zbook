"use client";

import Image from "next/image";
import { Button } from "./ui/button";
import {
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
import { useState } from "react";
import { useRouter } from "next/navigation";

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

          <div className="pt-4 w-full max-w-70 md:max-w-none">
            <Button className="w-full shadow-md" size="lg">
              <BookPlus className="mr-2 h-5 w-5" /> Add to my library
            </Button>
          </div>
        </div>
        <div className="flex-1 w-full">
          <div className="flex justify-between items-start mb-4">
            {genre && (
              <Badge variant="secondary" className="px-3 py-1">
                {genre}
              </Badge>
            )}
            {isLoaded &&
            isSignedIn &&
            addedBy?.id &&
            user?.id === addedBy.id ? (
              <div>
                <Button variant={"ghost"} size="icon" asChild>
                  <Link href={`/book/${_id}/edit`}>
                    <Edit />
                  </Link>
                </Button>
                <Button variant={"ghost"} size="icon">
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
