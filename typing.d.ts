interface Book {
  _id: string;
  title: string;
  author: string;
  cover: string;
  pdfUrl: string;
  genre?: string;
  reviewCount?: number;
  addedBy?: {
    id: string;
    firstName: string;
  };
  createdAt: string;
  updatedAt: string;
  year: number;
  description: string;
}
