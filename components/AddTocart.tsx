// components/AddToCartButton.tsx
"use client";
import React from "react";

export default function AddToCartButton({ bookId, userId }: { bookId: string; userId: string }) {
  const add = async () => {
    await fetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, bookId, qty: 1 })
    });
    // show toast / update UI
  };
  return <button onClick={add} className="btn">Add to cart</button>;
}
