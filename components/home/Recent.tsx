"use client";
import axios from "axios";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import BookCard from "../BookCard";

const Recent = () => {
  const [recentBooks, setRecentBooks] = useState<Array<Book>>([]);

  useEffect(() => {
    const fetchRecentBooks = async () => {
      try {
        const response = await axios.get("/api/book");
        const data = response.data;
        setRecentBooks(data.books);
      } catch (error) {
        console.error("Error fetching books: ", error);
      }
    };

    fetchRecentBooks();
  }, []);

  if (recentBooks.length === 0) {
    return (
      <div className="py-5 px-5 min-h-screen flex items-center justify-center text-foreground">
        <Loader2 className="animate-spin mr-1" /> Loading books...
      </div>
    );
  }

  return (
    <section className="py-8 px-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-foreground">Recently Added</h2>
        <Button variant="outline" asChild>
          <Link href="/explore">
            {" "}
            View all <ArrowRight />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {recentBooks.map((book) => (
          <BookCard key={book._id} {...book} />
        ))}
      </div>
    </section>
  );
};

export default Recent;
