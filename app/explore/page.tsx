"use client";
import BookCard from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { Funnel, Loader2, Sparkles } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

const popularGenres = [
  "All",
  "Classics",
  "Fiction",
  "Adventure",
  "Fantasy",
  "Sci-Fi",
  "Mystery",
  "Romance",
  "Drama",
  "Poetry",
  "Gothic",
];

const ExploreContent = () => {
  const searchParams = useSearchParams();
  const [selectedGenre, setSelectedGenre] = useState(() => {
    const gp = searchParams.get("genre");
    if (gp) {
      return gp.replace(/^\"(.*)\"$/, "$1");
    }
    return "All";
  });

  const [books, setBooks] = useState<Array<Book>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathName = usePathname();

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        const genreQuery =
          selectedGenre && selectedGenre !== "All"
            ? `?genre=${encodeURIComponent(selectedGenre)}`
            : "";
        const response = await axios.get(`/api/book${genreQuery}`);
        const data = response.data;
        setBooks(data.books);
      } catch (error) {
        console.error("Error fetching books: ", error);
        setBooks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [selectedGenre]);

  const handleGenreClick = (genre: string) => {
    setSelectedGenre(genre);
    router.push(`${pathName}?genre=\"${genre}\"`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="py-5 px-5">
      <motion.header
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }} // Smooth entrance for a premium feel
        className="relative mb-12"
      >
        {/* Subtle decorative glow to enhance visual hierarchy */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#E6B81D]/10 rounded-full blur-3xl -z-10" />

        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-bold uppercase tracking-widest">
            Curated Collection
          </span>
        </div>

        <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter mb-4">
          Explore Our <span className="">Collection</span>
        </h2>

        <p className="text-lg text-[#847062] max-w-xl leading-relaxed">
          Discover a world of{" "}
          <span className="font-semibold text-[#847062]">{books?.length}</span>{" "}
          literary treasures handpicked for your next journey.
        </p>
      </motion.header>

      {/* Genre Buttons Animation */}
      <div className="flex flex-wrap gap-2 mt-4">
        {popularGenres.map((genre, index) => (
          <motion.div
            key={genre}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }} // Subtle pop on hover
            whileTap={{ scale: 0.95 }}
          >
            <Button
              type="button"
              variant={selectedGenre === genre ? "default" : "outline"}
              size="sm"
              onClick={() => handleGenreClick(genre)}
              className="rounded-full"
            >
              {genre}
            </Button>
          </motion.div>
        ))}
      </div>

      <p className="text-[#847062] mt-5 mb-2 mx-2">
        Showing {books?.length} books
      </p>

      {isLoading ? (
        <div className="py-5 px-5 min-h-32 flex items-center justify-center text-foreground">
          <Loader2 className="animate-spin mr-1" /> Loading books...
        </div>
      ) : (
        /* Grid Animation: Staggers the appearance of BookCards */
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {books?.map((book) => (
              <motion.div key={book?._id} variants={itemVariants} layout>
                <BookCard {...book} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="py-5 px-5 min-h-32 flex items-center justify-center text-foreground">
        <Loader2 className="animate-spin mr-1" /> Loading explore page...
      </div>
    }>
      <ExploreContent />
    </Suspense>
  );
}
