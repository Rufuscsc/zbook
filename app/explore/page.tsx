"use client";
import BookCard from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Funnel } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const popularGenres = [
  "All",
  "Classic",
  "Fiction",
  "Romance",
  "Drama",
  "Gothic",
  "Dystopian",
  "Adventure",
  "Poetry",
  "Mystery",
  "Fantasy",
];

const ExplorePage = () => {
  const [selectedGenre, setSelectedGenre] = useState("");
  const [books, setBooks] = useState<Array<Book>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathName = usePathname();

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("/api/book");
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
  }, []);

  const handleGenreClick = (genre: string) => {
    setSelectedGenre(genre);
    router.push(`${pathName}?genre=\"${genre}\"`)
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
      <p className="text-[#847062] mt-5 mb-2 mx-2">Showing {books.length} books</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {books.map((book) => (
          <BookCard key={book._id} {...book} />
        ))}
      </div>
    </div>
  );
};

export default ExplorePage;
