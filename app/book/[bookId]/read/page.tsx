"use client";

import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PdfViewer from "@/components/Pdfviewer";

const ReadBook = () => {
  const params = useParams();
  const bookId = params?.bookId as string;

  const [bookDetails, setBookDetails] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookId) return;

    const fetchBookDetails = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`/api/book/${bookId}`);
        setBookDetails(res.data.book ?? res.data);
      } catch (err) {
        console.error("Error fetching book:", err);
        setError("Failed to load book.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [bookId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-70px)]">
        <p className="text-muted-foreground">Loading book...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-70px)]">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!bookDetails?.pdfUrl) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-70px)]">
        <p className="text-muted-foreground">No PDF available.</p>
      </div>
    );
  }

  return (
    <div className="bg-background h-[calc(100vh-70px)] overflow-hidden">
      <div className="w-full h-full border border-[#DAD3C8] shadow-lg bg-white">
        <PdfViewer fileUrl={`${bookDetails.pdfUrl}`} />

      </div>
    </div>
  );
};

export default ReadBook;