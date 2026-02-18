"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const CartPage = () => {
  const [cartItems, setCartItems] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const res = await axios.get("/api/cart");
      setCartItems(res.data?.cart?.books || []);
    } catch (error) {
      console.error("Failed to fetch cart items", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (bookId: string) => {
    try {
      await axios.delete("/api/cart", { data: { bookId } });
      setCartItems(cartItems.filter((b) => b._id !== bookId));
    } catch (error) {
      console.error("Failed to remove from cart", error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">My Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div className="flex flex-col gap-4">
          {cartItems.map((book) => (
            <div
              key={book._id}
              className="flex items-center justify-between border p-4 rounded"
            >
              <div>
                <p className="font-semibold">{book.title}</p>
                <p className="text-muted-foreground">${book.price}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/book/${book._id}/read`}>
                  <Button>Read</Button>
                </Link>
                <Button
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={() => handleRemove(book._id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CartPage;
