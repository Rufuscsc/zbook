import Image from "next/image";

const BookDetails = ({
  _id,
  title,
  author,
  cover,
  genre,
  description,
  publishedYear,
  addedBy,
  createdAt,
  updatedAt,
}: Book) => {
  return (
    <div className="w-full p-6">
      <div className="flex flex-col md:flex-row items-start">
        <div className="w-full md:w-1/4 flex flex-col items-start">
          <div className="relative w-full h-105 overflow-hidden rounded-sm">
            {cover ? (
              <Image src={cover} alt="cover" className="w-full h-full object-contain" fill />
            ) : (
              <div>No cover available</div>
            )}
          </div>
        </div>

        <div></div>
      </div>
    </div>
  );
};

export default BookDetails;
