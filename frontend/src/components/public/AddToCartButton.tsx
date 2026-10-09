"use client";
import { ShoppingBag } from "lucide-react";
import { useCart, type CartProduct } from "./CartProvider";

export default function AddToCartButton({ product }: { product: Omit<CartProduct, "quantity"> }) {
  const { add } = useCart();
  return <button type="button" onClick={() => add(product)} className="flex min-h-13 w-full items-center justify-center gap-3 bg-black px-6 text-[11px] font-bold uppercase tracking-[.14em] text-white transition hover:bg-neutral-800">
    <ShoppingBag size={18} /> Agregar al carrito
  </button>;
}
