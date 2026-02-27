"use client";

import BookCard from "@/components/BookCard";
import axios from "axios";
import { Loader2, Minus } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const CartPage = () => {
  const [cartItems, setCartItems] = useState<Array<Book>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchCart = async () => {
      setLoading(true);

      try {
        const res = await axios.get("/api/cart");
        const cart = res.data?.cart;
        const items = cart?.books || [];
        if (mounted) {
          setCartItems(items);
        }
      } catch (error) {
        console.error("Failed to fetch cart:", error);
        if (mounted) setCartItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCart();
    return () => {
      mounted = false;
    };
  }, []);

  const handleRemove = async (bookId?: string) => {
    if (!bookId) return;

    try {
      setRemovingId(bookId);
      const res = await axios.delete("/api/cart", { data: { bookId } });
      if (res.data?.removed || res.data?.success) {
        setCartItems((prev) =>
          prev.filter(
            (b: Book) => (b._id as string).toString() !== bookId.toString()
          )
        );
      }
    } catch (error) {
      console.error("Remove error:", error);
    } finally {
      setRemovingId(null);
    }
  };
  return (
    <div className="py-5 px-5 min-h-screen">
      <h2 className="text-5xl! md:text-3xl font-bold text-foreground">
        My Cart
      </h2>
      <p className="text-base text-[#847062] leading-relaxed">
        Books you are ready to checkout.
      </p>
      <div className="mt-6">
        {loading ? (
          <div className="py-8 flex items-center justify-center">
            <Loader2 className="animate-spin mr-2" /> Loading your cart...
          </div>
        ) : cartItems.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              Your cart is empty.
            </p>
            <Link
              href="/explore"
              className="inline-block mt-4 px-4 py-2 bg-[#28428A] hover:bg-[#28428A]/90 text-white rounded-sm"
            >
              Explore Books
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {cartItems.map((book: Book) => {
              const id = book._id;
              return (
                <div key={id} className="relative">
                  <div className="absolute right-2 top-2 z-20">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleRemove(id as string);
                      }}
                      className="cursor-pointer bg-white/90 hover:bg-white text-foreground p-2 rounded-full shadow-md"
                      disabled={removingId === id}
                    >
                      {removingId === id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Minus className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="pointer-events-auto">
                    <BookCard
                      _id={id as string}
                      title={book?.title || "Untitled"}
                      author={book?.author || "Unknown"}
                      cover={book?.cover || ""}
                      pdfUrl={book?.pdfUrl || ""}
                      genre={book?.genre}
                      price={book?.price}
                      currency={book?.currency}
                      addedBy={book?.addedBy ?? undefined}
                      createdAt={book?.createdAt || ""}
                      description={book?.description || ""}
                      year={book?.year || 0}
                      updatedAt={book?.updatedAt || ""}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
