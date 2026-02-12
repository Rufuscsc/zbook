"use client";

import BookCard from "@/components/BookCard";
import axios from "axios";
import { Loader2, Minus, Library, Search } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
};

const LibraryPage = () => {
  const [books, setBooks] = useState<Array<Book>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchLibrary = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/library");
        const libs = res.data?.library;
        const items = libs?.books || [];
        if (mounted) setBooks(items);
      } catch (error) {
        console.error("Failed to fetch library:", error);
        if (mounted) setBooks([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchLibrary();
    return () => { mounted = false; };
  }, []);

  const handleRemove = async (bookId?: string) => {
    if (!bookId) return;
    try {
      setRemovingId(bookId);
      const res = await axios.delete("/api/library", { data: { bookId } });
      if (res.data?.removed || res.data?.success) {
        setBooks((prev) => prev.filter((b: Book) => b._id !== bookId));
      }
    } catch (error) {
      console.error("Remove error:", error);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="max-w-7xl py-4 px-6 lg:px-8 min-h-screen">
      {/* Animated Header Section */}
      <motion.header 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-12"
      >
        <div className="flex items-center gap-2 E6B81D] mb-3">
          <Library className="w-5 h-5" />
          <span className="text-sm font-bold uppercase tracking-widest">Personal Archive</span>
        </div>
        <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter mb-4">
          My <span>Library</span>
        </h2>
        <p className="text-lg text-[#847062] max-w-xl leading-relaxed">
          Your personal sanctuary of saved literary treasures.
        </p>
      </motion.header>

      <div className="mt-6">
        {loading ? (
          <div className="min-h-100 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="text-muted-foreground animate-pulse font-medium">Accessing your vaults...</p>
          </div>
        ) : books.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-100 flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-3xl p-12 text-center"
          >
            <div className="bg-muted/50 p-6 rounded-full mb-6">
              <Search className="w-12 h-12 text-muted-foreground" />
            </div>
            <p className="text-xl font-semibold text-foreground mb-2">No Saved Books Yet</p>
            <p className="text-muted-foreground mb-8 max-w-xs">
              Your library is quiet... Start exploring and save your favorite stories here.
            </p>
            <Link
              href="/explore"
              className="px-8 py-3 bg-[#28428A] hover:bg-[#28428A]/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-[#E6B81D]/20 active:scale-95"
            >
              Explore Collection
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {books.map((book) => (
                <motion.div 
                  key={book._id as string} 
                  variants={itemVariants}
                  layout
                  className="relative group"
                >
                  <div className="absolute right-3 top-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleRemove(book._id as string);
                      }}
                      className="cursor-pointer bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-xl shadow-xl transform active:scale-90 transition-transform"
                      disabled={removingId === book._id}
                      title="Remove from Library"
                    >
                      {removingId === book._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Minus className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  
                  {/* Glass-styled wrapper for the BookCard */}
                  <div className="pointer-events-auto transition-transform duration-300 group-hover:-translate-y-2">
                    <BookCard
                      _id={book._id as string}
                      title={book?.title || "Untitled"}
                      author={book?.author || "Unknown"}
                      cover={book?.cover || ""}
                      genre={book?.genre}
                      addedBy={book?.addedBy ?? undefined}
                      createdAt=""
                      description=""
                      year={0}
                      updatedAt=""
                      pdfUrl={""}
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LibraryPage;