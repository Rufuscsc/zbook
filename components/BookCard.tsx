import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "./ui/badge";

const BookCard = ({ _id, title, author, cover, genre, addedBy }: Book) => {
  // 1. Ensure local paths have a leading slash and remote paths remain absolute
  const imageSrc = cover.startsWith("http") ? cover : `${cover}`;

  return (
    <Link href={`/book/${_id}`}>
      <div className="group bg-white rounded-sm border hover:border transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
        <div className="w-full h-80 relative overflow-hidden">
          <Image 
            src={imageSrc} 
            alt={`Cover for ${title}`} 
            className="w-full h-full object-cover rounded-t-sm transition-transform duration-300 ease-in-out group-hover:scale-105" 
            fill
          />
        </div>
        <div className="p-4 space-y-2">
           <h3 className="font-semibold text-lg line-clamp-2 text-foreground group-hover:text-[#803939] transition-colors duration-300 ease-in-out">{title}</h3>
           <p className="text-sm text-muted-foreground flex items-center gap-1"><User className="w-3 h-3"/> {author}</p>
           <div>
            <Badge variant={"secondary"} className="text-xs bg-[#e8dbc9]">{genre}</Badge>
           </div>
           {addedBy && <p className="text-xs text-muted-foreground italic pt-1">Added by {addedBy.firstName}</p>}
        </div>
      </div>
    </Link>
  );
};

export default BookCard;