"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Search, ShoppingBag, UserRound } from "lucide-react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { useCart } from "@/components/public/CartProvider";

type PublicHeaderProps = { whatsappHref: string };

const navigation = [
  { label: "Inicio", href: "/" },
  { label: "Categorías", href: "/productos" },
  { label: "Nueva Colección", href: "/productos?coleccion=nueva" },
  { label: "B2U", href: "/#b2u" },
  { label: "Contacto", href: "/#contacto" },
  { label: "Mis pedidos", href: "/pedido" },
];

export default function PublicHeader({ whatsappHref }: PublicHeaderProps) {
  const { count, setOpen } = useCart();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (value) => setScrolled(value > 24));

  return (
    <div className="h-[96px]">
      <motion.header
        initial={false}
        animate={{
          boxShadow: scrolled ? "0 12px 28px rgba(0,0,0,.08)" : "0 0 0 rgba(0,0,0,0)",
          backgroundColor: scrolled ? "rgba(255,255,255,.97)" : "rgba(255,255,255,1)",
        }}
        transition={{ duration: .22 }}
        className={`${scrolled ? "fixed inset-x-0 top-0" : "relative"} z-50 border-b border-black/10 backdrop-blur-xl`}
      >
        <div className="mx-auto flex h-[96px] max-w-[1480px] items-center justify-between gap-5 px-4 sm:px-6 lg:px-10">
          <details className="relative lg:hidden">
            <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center [&::-webkit-details-marker]:hidden">
              <Menu size={25} />
              <span className="sr-only">Abrir navegación</span>
            </summary>
            <div className="absolute left-0 top-14 w-[280px] border border-black/10 bg-white p-4 shadow-2xl">
              <nav className="grid gap-1 text-sm font-semibold uppercase tracking-[.08em]">
                {navigation.map((item) => (
                  <Link key={item.label} href={item.href} className="px-3 py-3 hover:bg-neutral-100">
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </details>

          <nav className="hidden items-center gap-7 text-[12px] font-semibold uppercase tracking-[.12em] lg:flex">
            {navigation.slice(0,3).map((item) => (
              <Link key={item.label} href={item.href} className="transition hover:opacity-55">{item.label}</Link>
            ))}
          </nav>

          <Link href="/" aria-label="B2U Jeans - Inicio" className="absolute left-1/2 -translate-x-1/2">
            <Image src="/b2u/logo-b2u.svg" alt="B2U Jeans" width={170} height={61} priority className="h-auto w-[132px] sm:w-[155px]" />
          </Link>

          <div className="ml-auto flex items-center gap-1 sm:gap-3">
            <Link href="/productos" aria-label="Buscar productos" className="flex h-11 w-11 items-center justify-center"><Search size={20} /></Link>
            <Link href="/login" aria-label="Mi cuenta" className="hidden h-11 w-11 items-center justify-center sm:flex"><UserRound size={20} /></Link>
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="hidden text-[11px] font-semibold uppercase tracking-[.1em] lg:block">
              WhatsApp
            </a>
            <button type="button" aria-label={`Abrir carrito, ${count} productos`} onClick={() => setOpen(true)} className="relative flex h-11 w-11 items-center justify-center">
              <ShoppingBag size={20} />
              <span className="absolute right-0 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[9px] font-bold text-white">{count}</span>
            </button>
          </div>
        </div>
      </motion.header>
    </div>
  );
}
