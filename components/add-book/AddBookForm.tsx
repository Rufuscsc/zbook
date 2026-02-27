"use client";

import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useRef, useState } from "react";
import { Textarea } from "../ui/textarea";
import { BookPlus, FileText, AlertCircle } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

const popularGenre = [
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

const AddBookform = () => {
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [isFree, setIsFree] = useState(false);
  const [genreError, setGenreError] = useState(false);
  const [pdfSizeError, setPdfSizeError] = useState(false);

  const router = useRouter();
  const uploadFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!selectedGenre) {
      setGenreError(true);
      setIsLoading(false);
      return;
    }

    if (pdfFile && pdfFile.size > 10 * 1024 * 1024) {
      setPdfSizeError(true);
      setIsLoading(false);
      return;
    }

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    if (coverFile) formData.set("cover", coverFile);
    if (pdfFile) formData.set("pdf", pdfFile);

    if (!isFree) {
      const parsedPrice = parseFloat(price);

      if (isNaN(parsedPrice) || parsedPrice < 0) {
        alert("Enter a valid price (e.g. 1500 or 1500.50)");
        setIsLoading(false);
        return;
      }

      const priceInMinorUnits = Math.round(parsedPrice * 100);
      formData.set("price", priceInMinorUnits.toString());
      formData.set("currency", currency);
    } else {
      formData.set("price", "0");
      formData.set("currency", currency);
    }

    try {
      await axios.post("/api/book", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      router.push("/explore");
    } catch (error) {
      console.log("Error adding book: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 md:border p-8 max-w-3xl mx-auto my-3 shadow-none md:shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <input type="hidden" name="genre" value={selectedGenre} />

        {/* TITLE */}
        <div className="space-y-2">
          <Label className="font-semibold text-lg">Book Title *</Label>
          <Input name="title" required className="h-12" />
        </div>

        {/* AUTHOR */}
        <div className="space-y-2">
          <Label className="font-semibold text-lg">Author *</Label>
          <Input name="author" required className="h-12" />
        </div>

        
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
              type="text"
              inputMode="decimal"
              placeholder="1500.00"
              value={price}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*\.?\d*$/.test(val)) {
                  setPrice(val);
                }
              }}
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
              This book will be available for free download.
            </p>
          )}
        </div>

        {/* COVER */}
        <div className="space-y-2 my-7">
          <Label htmlFor="cover" className="font-semibold text-lg">
            Cover image *
          </Label>
          <div className="flex sm:flew-row items-start sm:items-center gap-4">
            <div className="w-32 h-48 bg-muted rounded overflow-hidden flex items-center justify-center">
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
                ref={uploadFileInputRef}
                id="cover"
                name="cover"
                type="file"
                accept="image/* "
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
                className="hidden w-full cursor-pointer text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#E6B81D] file:text-white"
              />
              <button
                type="button"
                onClick={() => uploadFileInputRef?.current?.click()}
                className="w-fit cursor-pointer text-sm mr-4 py-2 px-4 rounded-full border-0 bg-[#E6B81D] text-white"
              >
                Upload file
              </button>

              <p className="text-sm! text-muted-foreground mt-1">
                upload a cover image (JPEG/PNG). Recommended size: ~300x450px.
                Max 5MB
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-2 my-7">
          <div className="flex items-center gap-2">
            <Label htmlFor="pdf" className="font-semibold text-lg">
              Book PDF *
            </Label>
            {pdfSizeError && (
              <span className="flex items-center text-sm font-medium text-destructive">
                <AlertCircle className="w-4 h-4 mr-1" /> File exceeds 10MB
              </span>
            )}
          </div>
          <div
            className={`flex items-center gap-4 border-2 border-dashed rounded-lg p-3 ${
              pdfSizeError ? "border-destructive/50 bg-destructive/10" : "bg-muted/30"
            }`}
          >
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
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setPdfFile(file);
                  if (file && file.size > 10 * 1024 * 1024) {
                    setPdfSizeError(true);
                  } else {
                    setPdfSizeError(false);
                  }
                }}
                className={`block w-full cursor-pointer text-sm ${pdfSizeError ? "text-destructive" : "text-muted-foreground"} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#E6B81D] file:text-white`}
              />
              <p
                className={`text-sm! mt-1 ${
                  pdfSizeError ? "text-destructive font-semibold" : "text-muted-foreground"
                }`}
              >
                {pdfFile
                  ? `Selected: ${pdfFile.name} (${(pdfFile.size / (1024 * 1024)).toFixed(2)}MB)`
                  : "Upload the book PDF file (Max 10MB)"}
              </p>
            </div>
          </div>
        </div>

        {/* GENRE */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="font-semibold text-lg">Genre *</Label>
            {genreError && (
              <span className="flex items-center text-sm font-medium text-destructive">
                <AlertCircle className="w-4 h-4 mr-1" /> Please select a genre
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {popularGenre.map((genre) => (
              <Button
                variant={selectedGenre === genre ? "default" : "outline"}
                key={genre}
                size="sm"
                type="button"
                onClick={() => {
                  setSelectedGenre(genre);
                  setGenreError(false);
                }}
                className={`rounded-full ${genreError ? "border-destructive text-destructive" : ""}`}
              >
                {" "}
                {genre}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-2 my-7">
          <Label htmlFor="title" className="font-semibold text-lg">
            Description *
          </Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Tell us more about this book..."
            rows={6}
            required
            className="resize-none text-base! h-30"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title" className="font-semibold text-lg">
            Published Year *
          </Label>
          <Input
            id="year"
            name="year"
            type="number"
            placeholder="1813"
            min="1800"
            max={new Date().getFullYear()}
            className="h-12 text-base!"
          />
        </div>

        {/* SUBMIT */}
        <Button
          type="submit"
          className="w-full mt-6"
          size="lg"
          disabled={isLoading}
        >
          <BookPlus className={`w-5 h-5 ${isLoading && "animate-spin"}`} />
          {isLoading ? "Adding..." : "Add Book"}
        </Button>
      </form>
    </Card>
  );
};

export default AddBookform;
