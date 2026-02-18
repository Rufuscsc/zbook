"use client";

import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { formatPrice } from "@/lib/formatPrice"; // Import your utility
import { motion } from "framer-motion";

const BookCard = ({
  _id,
  title,
  author,
  cover,
  genre,
  price,
  currency = "NGN",
  addedBy,
}: Book) => {
  const imageSrc = cover.startsWith("http") ? cover : `${cover}`;

  return (
    <Link href={`/book/${_id}`}>
      <motion.div 
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="group bg-white rounded-sm border transition-all duration-300 ease-in-out hover:shadow-xl"
      >
        {/* Cover Image */}
        <div className="w-full h-80 relative overflow-hidden">
          <Image
            src={imageSrc}
            alt={`Cover for ${title}`}
            className="w-full h-full object-cover rounded-t-sm transition-transform duration-500 ease-in-out group-hover:scale-110"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Subtle overlay gradient on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-lg line-clamp-2 text-foreground group-hover:text-[#803939] transition-colors duration-300">
            {title}
          </h3>

          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-[#803939]/70" /> {author}
          </p>

          <div className="flex items-center justify-between pt-2">
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wide bg-[#e8dbc9] hover:bg-[#e8dbc9]/80 text-[#5a2828] border-none">
              {genre}
            </Badge>

            <div className="flex flex-col items-end">
              {price === 0 ? (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-green-100 text-green-700 rounded-full border border-green-200">
                  FREE
                </span>
              ) : (
                <span className="font-bold text-[#803939]">
                  {/* Using your formatPrice utility here */}
                  {formatPrice(price, currency)}
                </span>
              )}
            </div>
          </div>

          {addedBy && (
            <div className="pt-2 border-t mt-2">
              <p className="text-[10px] text-muted-foreground italic">
                Added by <span className="text-foreground not-italic font-medium">{addedBy.firstName}</span>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
};

export default BookCard;