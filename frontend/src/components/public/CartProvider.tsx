"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Trash2, X, Plus, Minus } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartProduct = {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
  price?: string | number | null;
  currency?: string | null;
  quantity: number;
};
type CartApi = {
  items: CartProduct[];
  count: number;
  open: boolean;
  setOpen: (value: boolean) => void;
  add: (product: Omit<CartProduct, "quantity">) => void;
  setQuantity: (id: number, quantity: number) => void;
  remove: (id: number) => void;
  clear: () => void;
};
const STORAGE_KEY = "b2ujeans.cart.v1";
const CartContext = createContext<CartApi | null>(null);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("CartProvider es obligatorio.");
  return context;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartProduct[]>([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const saved: unknown = raw ? JSON.parse(raw) : [];
      if (Array.isArray(saved)) {
        setItems(saved.filter((item): item is CartProduct =>
          !!item && typeof item === "object" && typeof item.id === "number" &&
          typeof item.name === "string" && typeof item.slug === "string" &&
          Number.isInteger(item.quantity) && item.quantity > 0
        ).slice(0, 40));
      }
    } catch { /* carrito nuevo si los datos locales están dañados */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const add = useCallback((product: Omit<CartProduct, "quantity">) => {
    setItems(previous => {
      const found = previous.find(item => item.id === product.id);
      if (found) return previous.map(item => item.id === product.id ? { ...item, quantity: Math.min(99, item.quantity + 1) } : item);
      if (previous.length >= 40) return previous;
      return [...previous, { ...product, quantity: 1 }];
    });
    setOpen(true);
  }, []);
  const setQuantity = useCallback((id: number, quantity: number) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, Math.min(99, quantity || 1)) } : item));
  }, []);
  const remove = useCallback((id: number) => setItems(prev => prev.filter(item => item.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const value = useMemo(() => ({ items, count, open, setOpen, add, setQuantity, remove, clear }), [items, count, open, add, setQuantity, remove, clear]);
  const currencies = [...new Set(items.map(item => item.currency || "COP"))];
  const missing = items.some(item => item.price === null || item.price === undefined);
  const total = items.reduce((sum, item) => sum + Number(item.price ?? 0) * item.quantity, 0);
  const money = (amount: number, currency = currencies[0] || "COP") => {
    try { return new Intl.NumberFormat("es-VE", { style: "currency", currency }).format(amount); }
    catch { return amount.toFixed(2) + " " + currency; }
  };

  return <CartContext.Provider value={value}>
    {children}
    {open && <div className="fixed inset-0 z-[100]">
      <button className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} aria-label="Cerrar carrito" />
      <aside role="dialog" aria-modal="true" aria-label="Tu carrito" className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white text-black shadow-2xl">
        <header className="flex items-center justify-between border-b px-6 py-5">
          <h2 className="flex items-center gap-3 text-xl font-bold"><ShoppingBag size={22}/> Tu carrito ({count})</h2>
          <button onClick={() => setOpen(false)} aria-label="Cerrar"><X size={23}/></button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {items.length === 0 ? <div className="py-16 text-center">
            <ShoppingBag size={38} className="mx-auto text-neutral-400"/>
            <p className="mt-4 font-semibold">Tu carrito está vacío.</p>
            <Link href="/productos" onClick={() => setOpen(false)} className="mt-5 inline-block border-b border-black pb-1 text-sm">Descubrir colección</Link>
          </div> : <div className="space-y-5">{items.map(item => <article key={item.id} className="flex gap-4 border-b pb-5">
            {item.image ? <Image src={item.image} alt="" width={80} height={112} sizes="80px" quality={60} className="h-28 w-20 shrink-0 bg-neutral-100 object-cover" /> : <div className="h-28 w-20 shrink-0 bg-neutral-100"/>}
            <div className="min-w-0 flex-1">
              <Link href={`/productos/${item.slug}`} onClick={() => setOpen(false)} className="font-semibold">{item.name}</Link>
              <p className="mt-1 text-sm text-neutral-600">{item.price === null || item.price === undefined ? "Precio por confirmar" : money(Number(item.price), item.currency || "COP")}</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center border">
                  <button onClick={() => setQuantity(item.id, item.quantity - 1)} aria-label="Reducir cantidad" className="p-2"><Minus size={14}/></button>
                  <span className="min-w-6 text-center text-sm">{item.quantity}</span>
                  <button onClick={() => setQuantity(item.id, item.quantity + 1)} aria-label="Aumentar cantidad" className="p-2"><Plus size={14}/></button>
                </div>
                <button onClick={() => remove(item.id)} aria-label="Quitar producto" className="p-2 text-neutral-500"><Trash2 size={17}/></button>
              </div>
            </div>
          </article>)}</div>}
        </div>
        {items.length > 0 && <footer className="border-t px-6 py-5">
          <p className="flex justify-between font-semibold"><span>Subtotal estimado</span><span>{money(total)}</span></p>
          <p className="mt-2 text-xs leading-5 text-neutral-500">{missing ? "Algunos productos no tienen precio publicado. El equipo confirmará el importe." : "Envío y disponibilidad sujetos a confirmación. No se realizará ningún cobro en línea."}</p>
          {currencies.length > 1 && <p className="mt-2 text-xs text-red-600">No se pueden combinar productos con monedas distintas.</p>}
          <Link href="/carrito" onClick={() => setOpen(false)} className="mt-4 flex min-h-12 items-center justify-center bg-black px-4 text-xs font-bold uppercase tracking-widest text-white">Revisar y finalizar solicitud</Link>
          <button onClick={() => setOpen(false)} className="mt-3 w-full text-sm underline">Seguir comprando</button>
        </footer>}
      </aside>
    </div>}
  </CartContext.Provider>;
}
