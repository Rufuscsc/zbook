"use client";

import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useRef, useState } from "react";
import { Textarea } from "../ui/textarea";
import { BookPlus, FileText } from "lucide-react"; // Added FileText icon
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
  const [pdfFile, setPdfFile] = useState<File | null>(null); // New State for PDF
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const uploadFileInputRef = useRef<HTMLInputElement | null>(null);

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
      await axios.post("/api/book", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Book added successfully ");
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
        <div className="space-y-2">
          <Label htmlFor="title" className="font-semibold text-lg">
            Book Title *
          </Label>
          <Input
            id="title"
            name="title"
            placeholder="Enter the book title"
            required
            className="h-12 textbase!"
          />
        </div>

        <div className="space-y-2 my-7">
          <Label htmlFor="author" className="font-semibold text-lg">
            Author *
          </Label>
          <Input
            id="author"
            name="author"
            placeholder="Enter Author name"
            required
            className="h-12 textbase!"
          />
        </div>

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
              <button type='button' onClick={() => uploadFileInputRef?.current?.click()} className="w-fit cursor-pointer text-sm mr-4 py-2 px-4 rounded-full border-0 bg-[#E6B81D] text-white">
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

        <div className="space-y-2">
          <Label htmlFor="title" className="font-semibold text-lg">
            Gener *
          </Label>
          <div className="flex flex-wrap gap-2">
            {popularGenre.map((genre) => (
              <Button
                variant={selectedGenre === genre ? "default" : "outline"}
                key={genre}
                size="sm"
                type="button"
                onClick={() => setSelectedGenre(genre)}
                className="rounded-full"
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
        <div className="my-7 pt-4">
          <Button
            type="submit"
            className="w-full"
            size={"lg"}
            disabled={isLoading}
          >
            {" "}
            <BookPlus
              className={`w-5 h-6 ${isLoading ? "animate-spin" : ""}`}
            />
            {isLoading ? "Adding..." : "Add book to library"}{" "}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default AddBookform;
