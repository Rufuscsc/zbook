
"use client";

import React, { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { BookPlus, FileText } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

const popularGenres = [
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

const EditBookForm = ({ bookId }: { bookId: string }) => {
  const [selectedGenre, setSelectedGenre] = useState("");
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null); // New State for PDF
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [publishedYear, setPublishedYear] = useState<number | string>("");

  useEffect(() => {
    const fetchBook = async () => {
      if (!bookId) return;

      try {
        const res = await axios.get(`/api/book/${bookId}`);
        const data = res.data;

        const book = data.book || data;
        setTitle(book.title || "");
        setAuthor(book.author || "");
        setSelectedGenre(book.genre || "");
        setDescription(book.description || "");
        setPublishedYear(book.year ? String(book.year) : "");
        if (book.cover) setCoverPreview(book.cover);
      } catch (error) {
        console.error("Failed to fetch book for editing", error);
      }
    };

    fetchBook();
  }, [bookId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    if (coverFile) {
      formData.set("cover", coverFile);
    }
    // Append the PDF file to formData
    if (pdfFile) {
      formData.set("pdf", pdfFile);
    }

    try {
      if (!bookId) {
        setIsLoading(false);
        return;
      }

      await axios.patch(`/api/book/${bookId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Book Updated Successfully");
      router.push(`/book/${bookId}`)
    } catch (error) {
      console.log("Error updating book:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="max-w-3xl mx-auto py-6">
      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Include genre in form data */}

          <input type="hidden" name="genre" value={selectedGenre} />

          <div className="space-y-2">
            <Label htmlFor="title" className="font-semibold text-lg">
              Book Title *
            </Label>

            <Input
              id="title"
              name="title"
              placeholder="Enter the book title"
              required
              className="h-12 text-base!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="author" className="font-semibold text-lg">
              Author *
            </Label>

            <Input
              id="author"
              name="author"
              placeholder="Enter the author's name"
              required
              className="h-12 text-base!"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover" className="font-semibold text-lg">
              Cover Image *
            </Label>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-32 h-48 bg-muted rounded overflow-hidden border flex items-center justify-center">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="cover preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div>No cover selected</div>
                )}
              </div>

              <div className="flex-1">
                <input
                  id="cover"
                  name="cover"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    if (!file) {
                      setCoverFile(null);
                      setCoverPreview(null);
                      return;
                    }

                    if (coverPreview) URL.revokeObjectURL(coverPreview);
                    const url = URL.createObjectURL(file);
                    setCoverFile(file);
                    setCoverPreview(url);
                  }}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#E6B81D] file:text-white"
                />

                <p className="text-sm! text-muted-foreground mt-1">
                  Upload a cover image (JPEG/PNG). Recommended size: ~300x450px.
                  Max 5MB.
                </p>
              </div>
            </div>
            <div className="space-y-2 my-7">
                      <Label htmlFor="pdf" className="font-semibold text-lg">
                        Book PDF *
                      </Label>
                      <div className="flex items-center gap-4 border-2 border-dashed rounded-lg p-3 bg-muted/30">
                        <div className="bg-[#E6B81D]/10 p-3 rounded-full">
                          <FileText className="w-6 h-6 text-[#E6B81D]" />
                        </div>
                        <div className="flex-1">
                          <input
                            id="pdf"
                            name="pdf"
                            type="file"
                            accept=".pdf"
                            required
                            onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                            className="block w-full cursor-pointer text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#E6B81D] file:text-white"
                          />
                          <p className="text-sm! text-muted-foreground mt-1">
                            {pdfFile
                              ? `Selected: ${pdfFile.name}`
                              : "Upload the book PDF file (Max 20MB)"}
                          </p>
                        </div>
                      </div>
                    </div>

            
            <div className="space-y-3">
              <Label className="font-semibold text-lg">Genre *</Label>
              <div className="flex flex-wrap gap-2">
                {popularGenres.map((genre) => (
                  <Button
                    key={genre}
                    type="button"
                    variant={selectedGenre === genre ? "default" : "outline"}
                    size="sm"
                    className="rounded-full"
                    onClick={() => setSelectedGenre(genre)}
                  >
                    {genre}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-semibold text-lg">
                Description *
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Tell us about this book..."
                rows={6}
                required
                className="resize-none text-base!"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year" className="font-semibold text-lg">
                Publication Year
              </Label>

              <Input
                id="year"
                name="year"
                type="number"
                placeholder="1813"
                min="1000"
                max={new Date().getFullYear()}
                className="h-12 text-base!"
                value={publishedYear}
                onChange={(e) => setPublishedYear(e.target.value)}
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                size={"lg"}
                className="w-full"
                disabled={isLoading}
              >
                <BookPlus
                  className={`w-5 h-5 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                {isLoading ? "Updating..." : "Update Book"}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditBookForm;