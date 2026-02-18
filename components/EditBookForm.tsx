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
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // New Price States
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [isFree, setIsFree] = useState(false);

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

        // HANDLE PRICE PRE-FILL
        if (book.price === 0) {
          setIsFree(true);
          setPrice("");
        } else {
          setIsFree(false);
          // Convert cents back to main currency (e.g., 1500 -> 15.00)
          setPrice((book.price / 100).toFixed(2));
        }
        
        // Use saved currency or default to NGN
        setCurrency(book.currency || "NGN"); 

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

    if (coverFile) formData.set("cover", coverFile);
    if (pdfFile) formData.set("pdf", pdfFile);

    // PRICE LOGIC
    if (!isFree) {
      const parsedPrice = parseFloat(price);

      if (isNaN(parsedPrice) || parsedPrice < 0) {
        alert("Enter a valid price (e.g. 1500 or 1500.50)");
        setIsLoading(false);
        return;
      }

      // Convert back to minor units (cents) for DB
      const priceInMinorUnits = Math.round(parsedPrice * 100);
      formData.set("price", priceInMinorUnits.toString());
      formData.set("currency", currency);
    } else {
      formData.set("price", "0");
      formData.set("currency", currency);
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
      router.push(`/book/${bookId}`);
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
          <input type="hidden" name="genre" value={selectedGenre} />

          {/* TITLE */}
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

          {/* AUTHOR */}
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

          {/* 🔥 FREE TOGGLE */}
          <div className="flex items-center gap-3 mt-4">
            <input
              type="checkbox"
              checked={isFree}
              onChange={(e) => {
                setIsFree(e.target.checked);
                if (e.target.checked) setPrice("");
              }}
              className="h-4 w-4"
            />
            <Label className="text-base font-medium">This book is FREE</Label>
          </div>

          {/* PRICE SECTION */}
          <div className="space-y-2">
            <Label className="font-semibold text-lg">
              Price {isFree ? "(Disabled)" : "*"}
            </Label>

            <div className="flex gap-3">
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="1500.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={isFree}
                required={!isFree}
                className="h-12"
              />

              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                disabled={isFree}
                className="border rounded-md px-3 disabled:bg-gray-100"
              >
                <option value="NGN">NGN</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            {isFree && (
              <p className="text-sm text-green-600">
                This book is currently set to free.
              </p>
            )}
          </div>

          {/* COVER */}
          <div className="space-y-2">
            <Label htmlFor="cover" className="font-semibold text-lg">
              Cover Image
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
                      // Don't clear preview here if we want to keep existing cover on cancel
                      // but usually file input cancel clears selection.
                      // If you want to keep old preview if user cancels, you need more logic.
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
                  Leave empty to keep current cover. Max 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* PDF */}
          <div className="space-y-2 my-7">
            <Label htmlFor="pdf" className="font-semibold text-lg">
              Book PDF
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
                  // Not required in Edit Mode (keep existing if empty)
                  onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                  className="block w-full cursor-pointer text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#E6B81D] file:text-white"
                />
                <p className="text-sm! text-muted-foreground mt-1">
                  {pdfFile
                    ? `Selected: ${pdfFile.name}`
                    : "Upload new PDF to replace existing one (Optional)"}
                </p>
              </div>
            </div>
          </div>

          {/* GENRE */}
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

          {/* DESCRIPTION */}
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

          {/* YEAR */}
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
        </form>
      </Card>
    </div>
  );
};

export default EditBookForm;