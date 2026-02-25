"use client";
import axios from "axios";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import BookCard from "../BookCard";
import { motion, Variants } from "framer-motion";

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

  if (recentBooks?.length === 0) {
    return (
      <div className="py-5 px-5 min-h-screen flex items-center justify-center text-foreground">
        <Loader2 className="animate-spin mr-1" /> Loading books...
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Delays each card by 0.1s for a sequential effect
      },
    },
  };

  // Variants for individual items (header and cards)
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.section
      className="py-8 px-10"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.div
        className="flex items-center justify-between mb-6"
        variants={itemVariants}
      >
        <h2 className="text-3xl font-bold text-foreground">Recently Added</h2>
        <Button variant="outline" asChild>
          <Link href="/explore" className="flex items-center gap-2">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
        variants={containerVariants}
      >
        {recentBooks.map((book) => (
          <motion.div key={book._id} variants={itemVariants}>
            <BookCard {...book} />
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
};

export default Recent;
