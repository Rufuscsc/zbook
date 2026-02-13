"use client";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";


const ReadBook = () => {
  const { bookId } = useParams();

  const [bookDetails, setBookdetails] = useState<Book | null>(null);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const res = await axios.get(`/api/book/${bookId}`);
        setBookdetails(res.data);
      } catch (error) {
        console.error("Error fetching books: ", error);
      }
    };
    if (bookId) {
      fetchBookDetails();
    }
  }, [bookId]);

  return (
    <div className="bg-background h-[calc(100vh-70px)] overflow-y-hidden">
      <div className="w-full h-full border border-[#DAD3C8] overflow-hidden shadow-lg bg-white">
        <iframe
          src={`${bookDetails?.pdfUrl}#toolbar=0`}
          className="w-full h-full"
          title="Book Viewer"
        />
      </div>
    </div>
  );
};

export default ReadBook;
