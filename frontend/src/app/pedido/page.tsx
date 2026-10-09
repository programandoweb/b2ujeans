"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

type OrderStatus = {
  number: string;
  status: string;
  total: string;
  currency: string;
  updated_at: string;
};

const labels: Record<string,string> = {
  pending_approval: "Pendiente de revisión",
  approved: "Confirmado",
  processing: "En preparación",
  shipped: "Enviado",
  completed: "Entregado",
  cancelled: "Cancelado",
};

export default function TrackOrderPage() {
  const [number, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError(""); setOrder(null);
    try {
      const response = await fetch("/api/cart/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number, email }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setError(data.message || "No fue posible consultar el pedido."); return; }
      setOrder(data.data);
    } catch { setError("No fue posible consultar el estado. Inténtalo de nuevo."); }
    finally { setLoading(false); }
  }

  return <main className="min-h-screen bg-[#faf7f4] px-4 py-12 text-[#302725]">
    <div className="mx-auto max-w-xl">
      <Link href="/" className="text-xl font-black tracking-[.14em]">B2U JEANS</Link>
      <section className="mt-10 bg-white p-7 shadow-sm sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#997765]">Tu compra</p>
        <h1 className="mt-2 text-3xl font-semibold">Consultar mi pedido</h1>
        <p className="mt-3 text-sm leading-6 text-neutral-600">Ingresa el número de referencia y el correo utilizado al finalizar tu solicitud.</p>
        <form onSubmit={search} className="mt-7 space-y-4">
          <label className="block text-sm font-semibold">Número de referencia
            <input required maxLength={40} value={number} onChange={e => setNumber(e.target.value.toUpperCase())} placeholder="B2U-XXXXXXXX" className="mt-2 block min-h-12 w-full border px-3 font-normal"/>
          </label>
          <label className="block text-sm font-semibold">Correo electrónico
            <input required type="email" maxLength={190} value={email} onChange={e => setEmail(e.target.value)} className="mt-2 block min-h-12 w-full border px-3 font-normal"/>
          </label>
          <button disabled={loading} className="min-h-12 w-full bg-black px-4 text-sm font-bold text-white disabled:opacity-50">{loading ? "Consultando..." : "Consultar estado"}</button>
        </form>
        {error && <p role="alert" className="mt-5 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {order && <div className="mt-7 border-t pt-6">
          <p className="text-xs uppercase tracking-widest text-neutral-500">Referencia {order.number}</p>
          <h2 className="mt-2 text-2xl font-bold">{labels[order.status] || order.status}</h2>
          <p className="mt-2 text-sm text-neutral-600">Importe registrado: {new Intl.NumberFormat("es-VE", {style:"currency",currency:order.currency}).format(Number(order.total))}. El envío y los precios pendientes se confirman con el equipo.</p>
        </div>}
      </section>
      <Link href="/productos" className="mt-6 inline-block text-sm underline">Volver a la colección</Link>
    </div>
  </main>;
}
