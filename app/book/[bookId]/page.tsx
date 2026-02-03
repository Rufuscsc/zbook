"use client"

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Loader2 } from "lucide-react";
import BookDetails from "@/components/BookDetails";

function BookPage() {
  const params = useParams();
  const [bookDetails, setBookdetails] = useState<Book | null>(null);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const res = await axios.get(`/api/book/${params.bookId}`);
        setBookdetails(res.data);
      } catch (error) {
        console.error("Error fetching books: ", error);
      }
    };
    if (params?.bookId) {
      fetchBookDetails();
    }
  }, [params?.bookId]);

  return (
    <div>
      {bookDetails ? (<BookDetails {...bookDetails} />
      ): (
      <div className="py-5 px-5 min-h-32 flex items-center justify-center text-foreground">
        <Loader2 className="animate-spin mr-1" /> Loading books...
      </div>
      ) }
    </div>
  );
}

export default BookPage;
