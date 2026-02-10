"use client";
import BookCard from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Funnel, Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

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

const ExplorePage = () => {
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

  return (
    <div className="py-5 px-5">
      <h2 className="text-5xl! md:text-3xl font-bold text-foreground">
        Explore Our Collection
      </h2>
      <p className="text-base text-[#847062] leading-relaxed">
        Browse through {books.length} literary treasures
      </p>

      <div className="mt-8 flex items-center text-[#847062]">
        <Funnel className="w-4 h-4 mr-1" />
        <p>Filter by Genre</p>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {popularGenres.map((genre) => (
          <Button
            key={genre}
            type="button"
            variant={selectedGenre === genre ? "default" : "outline"}
            size="sm"
            onClick={() => handleGenreClick(genre)}
            className="rounded-full"
          >
            {genre}
          </Button>
        ))}
      </div>
      <p className="text-[#847062] mt-5 mb-2 mx-2">
        Showing {books.length} books
      </p>

      {isLoading ? (
        <div className="py-5 px-5 min-h-32 flex items-center justify-center text-foreground">
          <Loader2 className="animate-spin mr-1" /> Loading books...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {books.map((book) => (
            <BookCard key={book._id} {...book} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
