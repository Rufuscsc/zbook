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
import { usePaystackPayment } from "react-paystack";

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
}: Book & { price?: number; currency?: string }) => {
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

  // --- Paystack Setup ---
  const config = {
    reference: `REF_${Math.floor(Math.random() * 1000000000 + 1)}`,
    email: user?.primaryEmailAddress?.emailAddress || "",
    amount: (price || 0), // Paystack expects cents for USD (e.g. 1000 = $10.00)
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string,
    currency: "USD", // Set to USD as requested
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = async (reference: any) => {
    // 1. Add to library database
    await handleAddToLibrary();
    // 2. Redirect to reader page immediately
    router.push(`/book/${_id}/read`);
  };

  const onClose = () => {
    console.log("Payment window closed");
  };

  // Logic Helpers
  const isFree = price === 0 || !price;
  const canRead = isInLibrary || isFree;

  // Animation Variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
  };

  // --- Handlers ---
  const handleAddToLibrary = async () => {
    if (!_id) return;
    try {
      setIsAdding(true);
      const res = await axios.post("/api/library", { bookId: _id });
      if (res.data?.added) setIsInLibrary(true);
    } catch (error) { 
      console.error(error); 
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
    return () => { mounted = false; };
  }, [_id]);

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="w-full max-w-7xl mx-auto p-4 md:p-8"
    >
      <div className="flex flex-col md:flex-row items-start gap-8 lg:gap-16">
        
        {/* LEFT COLUMN: Cover & Actions */}
        <motion.div variants={fadeIn} className="w-full md:w-1/3 lg:w-1/4 flex flex-col items-center md:items-start">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative w-full aspect-2/3 overflow-hidden rounded-xl bg-muted shadow-2xl ring-1 ring-black/5"
          >
            {cover ? (
              <Image src={cover} alt={`${title} cover`} className="object-cover" fill priority />
            ) : (
              <div className="flex items-center justify-center h-full w-full italic border text-muted-foreground">No cover available</div>
            )}
          </motion.div>

          <div className="pt-6 w-full flex flex-col gap-3">
            <AnimatePresence mode="wait">
              {isCheckingLibrary ? (
                <Button key="loading" className="w-full" disabled>
                  <Loader2 className="w-4 h-4 animate-spin" />
                </Button>
              ) : (
                <motion.div
                  key="actions"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-3"
                >
                  {isInLibrary ? (
                    <Button variant="outline" className="w-full" onClick={handleRemoveFromLibrary} disabled={isRemoving}>
                      {isRemoving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><BookMinus className="w-4 h-4 mr-2" /> Remove Library</>}
                    </Button>
                  ) : (
                    <>
                      {!isFree && (
                        <Button
                          onClick={() => {
                            if (!isSignedIn) return router.push("/sign-in");
                            // FIX: Passing callbacks as an object
                            initializePayment({ onSuccess, onClose });
                          }}
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CreditCard className="w-4 h-4 mr-2" /> Buy Now
                        </Button>
                      )}
                      <Button variant="default" className="w-full" onClick={handleAddToLibrary} disabled={isAdding}>
                        {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <><BookPlus className="w-4 h-4 mr-2" /> Add to Library</>}
                      </Button>
                    </>
                  )}
                  {!isFree && (
                    <Button
                      onClick={isInCart ? handleRemoveFromCart : handleAddToCart}
                      disabled={isAddingToCart}
                      variant={isInCart ? "destructive" : "secondary"}
                      className="w-full"
                    >
                      {isAddingToCart ? <Loader2 className="w-4 h-4 animate-spin" /> : isInCart ? "Remove from Cart" : <><ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart</>}
                    </Button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Info */}
        <div className="flex-1 w-full space-y-6">
          <motion.div variants={fadeIn} className="flex justify-between items-start">
            {genre && <Badge variant="outline" className="uppercase tracking-widest">{genre}</Badge>}
            {isLoaded && isSignedIn && (user?.id === addedBy?.id || user?.primaryEmailAddress?.emailAddress === "rufusmfmwellens@gmail.com") && (
              <div className="flex gap-1 bg-muted rounded-lg p-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <Link href={`/book/${_id}/edit`}><Edit className="w-4 h-4" /></Link>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleDelete}>
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </Button>
              </div>
            )}
          </motion.div>

          <motion.h1 variants={fadeIn} className="font-extrabold text-4xl md:text-6xl tracking-tighter leading-tight">
            {title}
          </motion.h1>
          
          <motion.div variants={fadeIn} className="flex items-center gap-4 text-muted-foreground font-medium">
             {author && <div className="flex items-center gap-1"><User className="w-4 h-4 text-primary" /> {author}</div>}
             {year && <div className="flex items-center gap-1"><Calendar className="w-4 h-4 text-primary" /> {year}</div>}
          </motion.div>

          <motion.p variants={fadeIn} className="text-muted-foreground leading-relaxed whitespace-pre-line text-lg">
            {description}
          </motion.p>

          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-t pt-6">
            <div className="text-3xl font-black">{isFree ? "FREE" : formatPrice(price!, currency || "USD")}</div>
            {canRead && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="rounded-full px-9" onClick={() => router.push(`/book/${_id}/read`)}>
                  <BookOpen className="w-4 h-4 mr-2" /> Read Now
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default BookDetails;