"use client";

import Image from "next/image";
import { Button } from "./ui/button";
import {
  BookMinus,
  BookPlus,
  Calendar,
  Dot,
  Edit,
  Loader2,
  Trash2,
  User,
  ShoppingCart,
  BookOpen,
  CreditCard,
} from "lucide-react";
import { Badge } from "./ui/badge";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { formatPrice } from "@/lib/formatPrice";
import { motion, AnimatePresence } from "framer-motion";
import { initializePayment } from "@/utils/paystack";

interface BookDetailsProps extends Book {
  price: number;
  currency?: string;
}

const BookDetails = ({
  _id,
  title,
  author,
  cover,
  genre,
  description,
  year,
  addedBy,
  createdAt,
  price,
  currency,
}: BookDetailsProps) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  // States
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isInLibrary, setIsInLibrary] = useState(false);
  const [isCheckingLibrary, setIsCheckingLibrary] = useState(true);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isInCart, setIsInCart] = useState(false);

  const [isBought, setIsBought] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Logic to check if the user already owns the book
  useEffect(() => {
    if (!_id) {
      setIsBought(true);
    }
  });
  // Animation Variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } },
  };

  const formatDate = (d?: string) => {
    if (!d) return "";
    try {
      const date = new Date(d);
      if (isNaN(date.getTime())) return d;
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return d;
    }
  };

  // --- Handlers ---
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await axios.delete(`/api/book/${_id}`);
      router.push("/explore");
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddToLibrary = async () => {
    if (!_id) {
      console.log("Missing book id");
      return;
    }

    try {
      setIsAdding(true);
      const res = await axios.post("/api/library", { bookId: _id });
      console.log(res);

      if (res.data?.added) {
        setIsInLibrary(true);
      }
    } catch (error) {
      console.error("Failed to add to library", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveFromLibrary = async () => {
    if (!_id) return;
    try {
      setIsRemoving(true);
      const res = await axios.delete("/api/library", { data: { bookId: _id } });
      if (res.data?.removed) setIsInLibrary(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleAddToCart = async () => {
    if (!_id) return;
    try {
      setIsAddingToCart(true);
      const res = await axios.post("/api/cart", { bookId: _id });
      if (res.data?.added) setIsInCart(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleRemoveFromCart = async () => {
    if (!_id) return;
    try {
      setIsAddingToCart(true);
      const res = await axios.delete("/api/cart", { data: { bookId: _id } });
      if (res.data?.removed) setIsInCart(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const checkLibrary = async () => {
      if (!_id) {
        if (mounted) setIsCheckingLibrary(false);
        return;
      }
      try {
        setIsCheckingLibrary(true);
        const res = await axios.get("/api/library");
        const books = res.data?.library?.books || [];
        const found = books.some((b: any) => b?._id === _id);
        if (mounted) setIsInLibrary(found);
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) setIsCheckingLibrary(false);
      }
    };
    checkLibrary();
    return () => {
      mounted = false;
    };
  }, [_id]);

  
 
  const handleCheckout = async () => {
    const amountInSmallestUnit = price / 100;
    const paymentData = {
      email: user?.emailAddresses?.[0]?.emailAddress || "",
      amount: amountInSmallestUnit,
      bookId: _id,
    };
    // try {
    //   const paymentData = {
    //     email: user?.emailAddresses?.[0]?.emailAddress || "",
    //     amount: amountInSmallestUnit,
    //     onSuccess: (reference: any) => {
    //       console.log("Payment successful:", reference);

    //       // 🚨 IMPORTANT: verify on backend
    //       // verifyPayment(reference);
    //     },
    //     onClose: () => {
    //       console.log("Payment popup closed");
    //     },
    //   };

    //   const response = initializePayment(paymentData);
    //   // const orderSummaryData = {
    //   //   ...orderSummary,
    //   //   total: newTotal ? newTotal : orderSummary.total,
    //   // };
    // } catch (error) {
    //   console.error("Failed to initialize payment:", error);
    // }

    // const res = await axios.get("/api/cart");
    
    const res = await axios.post(`/api/book/${_id}`, { ...paymentData });
    window.location.href = res?.data.data.authorization_url;
    console.log(res);
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="w-full max-w-7xl mx-auto p-4 md:p-8"
    >
      <div className="flex flex-col md:flex-row items-start gap-8 lg:gap-16">
        {/* LEFT COLUMN: Cover + Buttons */}
        <motion.div
          variants={fadeIn}
          className="w-full md:w-1/3 lg:w-1/4 flex flex-col items-center md:items-start"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative w-full max-w-75 md:max-w-none aspect-2/3 overflow-hidden rounded-xl bg-muted shadow-2xl ring-1 ring-black/5"
          >
            {cover ? (
              <Image
                src={cover}
                alt={`${title} cover`}
                className="object-cover"
                fill
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full text-muted-foreground italic border">
                No cover available
              </div>
            )}
          </motion.div>

          {/* Action Buttons */}
          <div className="pt-6 w-full flex flex-col gap-3">
            <AnimatePresence mode="wait">
              {isCheckingLibrary ? (
                <Button key="loading" className="w-full" disabled>
                  <Loader2 className="w-4 h-4 animate-spin" />
                </Button>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-3"
                >
                  <Button
                    className="w-full text-white transition-colors bg-green-600 hover:bg-green-700$"
                    onClick={() =>
                      isBought
                        ? console.log("I have been bought")
                        : handleCheckout()
                    }
                  >
                    {isAddingToCart ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isBought ? (
                      "Remove from Cart"
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" /> Buy now
                      </>
                    )}
                  </Button>
                  <Button
                    variant={isInLibrary ? "outline" : "default"}
                    className="w-full transition-all duration-300"
                    onClick={
                      isInLibrary ? handleRemoveFromLibrary : handleAddToLibrary
                    }
                    disabled={isRemoving || isAdding}
                  >
                    {isRemoving || isAdding ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isInLibrary ? (
                      <>
                        <BookMinus className="w-4 h-4 mr-2" /> Remove Library
                      </>
                    ) : (
                      <>
                        <BookPlus className="w-4 h-4 mr-2" /> Add to Library
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={isInCart ? handleRemoveFromCart : handleAddToCart}
                    disabled={isAddingToCart}
                    variant={isInCart ? "destructive" : "secondary"}
                    className="w-full"
                  >
                    {isAddingToCart ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isInCart ? (
                      "Remove from Cart"
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Info */}
        <div className="flex-1 w-full space-y-6">
          <motion.div
            variants={fadeIn}
            className="flex justify-between items-start"
          >
            {genre && (
              <Badge
                variant="outline"
                className="px-4 py-1.5 uppercase tracking-wider text-[10px] font-bold"
              >
                {genre}
              </Badge>
            )}

            {/* Admin/Owner Controls */}
            {isLoaded &&
              isSignedIn &&
              (user?.id === addedBy?.id ||
                user?.primaryEmailAddress?.emailAddress ===
                  "rufusmfmwellens@gmail.com") && (
                <div className="flex gap-1 bg-muted rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    asChild
                  >
                    <Link href={`/book/${_id}/edit`}>
                      <Edit className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={handleDelete}
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              )}
          </motion.div>

          <motion.div variants={fadeIn} className="space-y-2">
            <h1 className="font-extrabold text-4xl md:text-6xl tracking-tighter text-foreground leading-[1.1]">
              {title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground">
              {author && (
                <div className="flex gap-2 items-center font-medium">
                  <User className="w-4 h-4 text-primary" /> {author}
                </div>
              )}
              {year && (
                <div className="flex gap-2 items-center font-medium">
                  <Calendar className="w-4 h-4 text-primary" /> {year}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div variants={fadeIn} className="space-y-4">
            <div className="h-px bg-border w-full" />
            <h2 className="font-bold text-xl uppercase tracking-tight">
              About This Book
            </h2>
            <p className="text-muted-foreground leading-relaxed text-[15px] whitespace-pre-line max-w-3xl">
              {description}
            </p>
            <div className="h-px bg-border w-full" />
          </motion.div>

          <motion.div
            variants={fadeIn}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-6"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center text-xs text-muted-foreground uppercase font-semibold">
                {addedBy && (
                  <>
                    Added by{" "}
                    <span className="text-foreground ml-1">
                      {addedBy.firstName}
                    </span>
                  </>
                )}
                <Dot />
                {createdAt && <span>{formatDate(createdAt)}</span>}
              </div>
              {price != null && (
                <div className="text-3xl font-black text-foreground">
                  {formatPrice(price, currency)}
                </div>
              )}
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="w-full bg-black sm:w-auto px-9 py-4 text-[15px] rounded-full shadow-xl hover:bg-black/90 hover:shadow-2xl transition-all"
                onClick={() => router.push(`/book/${_id}/read`)}
              >
                <BookOpen className="w-3 h-3 mr-2" /> Read Now
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default BookDetails;
