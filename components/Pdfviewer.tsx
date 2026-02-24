"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "./ui/button";
import {
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
} from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface Props {
  fileUrl: string;
}

const PdfViewer = ({ fileUrl }: Props) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const nextPage = () => {
    if (pageNumber < numPages) setPageNumber((prev) => prev + 1);
  };

  const prevPage = () => {
    if (pageNumber > 1) setPageNumber((prev) => prev - 1);
  };

  const zoomIn = () => setScale((prev) => prev + 0.2);
  const zoomOut = () => setScale((prev) => (prev > 0.4 ? prev - 0.2 : prev));

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* 🔥 TOOLBAR */}
      <div className="flex items-center justify-between p-3 border-b bg-white shadow-sm">
        
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" onClick={prevPage} disabled={pageNumber <= 1}>
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <span className="text-sm font-medium">
            Page {pageNumber} of {numPages}
          </span>

          <Button size="icon" variant="outline" onClick={nextPage} disabled={pageNumber >= numPages}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" onClick={zoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>

          <Button size="icon" variant="outline" onClick={zoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>

          <Button
            size="icon"
            variant="outline"
            onClick={() => window.open(fileUrl, "_blank")}
          >
            <Download className="w-4 h-4" />
          </Button>

          <Button
            size="icon"
            variant="outline"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 📄 PDF DISPLAY */}
      <div className="flex-1 overflow-auto flex justify-center p-4">
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<p>Loading PDF...</p>}
        >
          <Page pageNumber={pageNumber} scale={scale} />
        </Document>
      </div>
    </div>
  );
};

export default PdfViewer;