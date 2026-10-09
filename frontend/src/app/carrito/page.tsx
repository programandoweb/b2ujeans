"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, CheckCircle2, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/public/CartProvider";
import { B2UJEANS_WHATSAPP_NUMBER } from "@/lib/public-contact";

export default function CartCheckoutPage() {
  const { items, count, setQuantity, remove, clear } = useCart();
  const [customer, setCustomer] = useState({ name: "", email: "", whatsapp: "", alternate_phone: "", address: "", address_reference: "", city: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [whatsappLink, setWhatsappLink] = useState("");
  const currencies = [...new Set(items.map(item => item.currency || "COP"))];
  const currency = currencies[0] || "COP";
  const amount = items.reduce((sum, item) => sum + Number(item.price ?? 0) * item.quantity, 0);
  const missing = items.some(item => item.price === undefined || item.price === null);
  const format = (value: number) => {
    try { return new Intl.NumberFormat("es-VE", { style: "currency", currency }).format(value); }
    catch { return value.toFixed(2) + " " + currency; }
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length || currencies.length > 1) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/cart/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...customer, items: items.map(item => ({ id: item.id, quantity: item.quantity })) }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        const validation = Object.values(body.errors || {}).flat().join(" ");
        setError(validation || body.message || "No fue posible registrar el pedido.");
        return;
      }
      const reference = String(body.data?.number || "");
      const message = typeof body.data?.whatsapp_message === "string" ? body.data.whatsapp_message : "";
      if (!reference || !message) {
        setError("El pedido se registró, pero no pudimos preparar el mensaje. Contacta a B2U Jeans para confirmar.");
        return;
      }
      const link = `https://wa.me/${B2UJEANS_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      setConfirmation(reference);
      setWhatsappLink(link);
      clear();
      window.location.assign(link);
    } catch {
      setError("Problema de conexión. El carrito permanece guardado; vuelve a intentarlo.");
    } finally { setSubmitting(false); }
  }

  return <main className="min-h-screen bg-[#faf7f4] text-[#302725]">
    <header className="border-b bg-white px-5 py-5"><div className="mx-auto flex max-w-6xl items-center justify-between">
      <Link href="/" className="text-2xl font-black tracking-[.12em]">B2U JEANS</Link>
      <Link href="/productos" className="flex items-center gap-2 text-sm"><ArrowLeft size={16}/> Seguir comprando</Link>
    </div></header>
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {confirmation ? <section className="mx-auto max-w-xl rounded-2xl bg-white p-10 text-center shadow-sm">
        <CheckCircle2 className="mx-auto text-emerald-600" size={48}/>
        <h1 className="mt-5 text-3xl font-bold">¡Tu pedido está registrado!</h1>
        <p className="mt-3">Tu número de referencia es <strong>{confirmation}</strong>.</p>
        <p className="mt-3 text-sm text-neutral-600">Se abrirá WhatsApp con el resumen de compra y los datos de envío. Presiona Enviar en WhatsApp para completar la comunicación con la tienda. No se ha realizado ningún cargo.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-4">{whatsappLink && <a href={whatsappLink} className="inline-flex bg-[#157a4a] px-6 py-3 font-semibold text-white">Continuar en WhatsApp</a>}<Link href="/pedido" className="inline-flex bg-black px-6 py-3 text-white">Consultar estado</Link><Link href="/productos" className="inline-flex border px-6 py-3">Seguir explorando</Link></div>
      </section> : <>
        <span className="text-xs font-bold uppercase tracking-[.2em] text-[#997765]">B2U · Tienda en línea</span>
        <h1 className="mt-3 text-4xl font-semibold">Tu carrito ({count})</h1>
        {!items.length ? <section className="mt-8 bg-white p-12 text-center">
          <ShoppingBag size={40} className="mx-auto text-neutral-400"/>
          <p className="mt-4">Aún no has agregado prendas.</p>
          <Link href="/productos" className="mt-5 inline-block bg-black px-6 py-3 text-white">Explorar colección</Link>
        </section> : <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1.15fr_.85fr]">
          <section className="space-y-4">
            {items.map(item => <div key={item.id} className="flex gap-4 bg-white p-4 sm:p-5">
              {item.image ? <img src={item.image} alt="" className="h-32 w-24 shrink-0 object-cover"/> : <div className="h-32 w-24 shrink-0 bg-neutral-100"/>}
              <div className="flex-1">
                <Link href={`/productos/${item.slug}`} className="font-semibold">{item.name}</Link>
                <p className="mt-2 text-sm text-neutral-500">{item.price === null || item.price === undefined ? "Precio por confirmar" : format(Number(item.price))}</p>
                <label className="mt-4 flex items-center gap-3 text-sm">Cantidad
                  <input aria-label={`Cantidad de ${item.name}`} type="number" min={1} max={99} step={1} value={item.quantity} onChange={e => setQuantity(item.id, Number(e.target.value))} className="w-20 border px-3 py-2"/>
                </label>
              </div>
              <button onClick={() => remove(item.id)} className="self-start p-2" aria-label={`Eliminar ${item.name}`}><Trash2 size={19}/></button>
            </div>)}
          </section>
          <form onSubmit={submit} className="space-y-4 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-xl font-bold">Datos de entrega</h2>
            <p className="text-sm text-neutral-600">Antes de abrir WhatsApp, completa los datos de envío. Guardaremos tu pedido en B2U Jeans y prepararemos el mensaje para enviarlo a la tienda.</p>
            {([
              ["name", "Nombre y apellido", "text"],
              ["email", "Correo electrónico", "email"],
              ["whatsapp", "Teléfono principal / WhatsApp", "tel"],
              ["city", "Ciudad", "text"],
              ["address", "Dirección de entrega", "text"],
              ["address_reference", "Referencia de ubicación", "text"],
            ] as const).map(([key, label, type]) => <label key={key} className="block text-sm font-medium">{label}
              <input required type={type} value={customer[key]} onChange={e => setCustomer(prev => ({ ...prev, [key]: e.target.value }))} placeholder={key === "address_reference" ? "Ej.: casa azul frente al árbol, portón negro" : undefined} minLength={key === "address_reference" ? 5 : undefined} maxLength={key === "address" || key === "address_reference" ? 500 : 190} className="mt-1 block min-h-11 w-full rounded border border-neutral-300 bg-white px-3 outline-offset-2"/>
            </label>)}
            <label className="block text-sm font-medium">Teléfono alternativo (opcional)
              <input type="tel" maxLength={40} value={customer.alternate_phone} onChange={e => setCustomer(prev => ({...prev, alternate_phone:e.target.value}))} placeholder="Otro número para coordinar la entrega" className="mt-1 block min-h-11 w-full rounded border border-neutral-300 bg-white px-3"/>
            </label>
            <label className="block text-sm font-medium">Notas adicionales (opcional)
              <textarea rows={3} maxLength={1500} value={customer.notes} onChange={e => setCustomer(prev => ({...prev, notes:e.target.value}))} className="mt-1 block w-full rounded border border-neutral-300 p-3"/>
            </label>
            <div className="border-t pt-5">
              <p className="flex justify-between text-lg font-bold"><span>Subtotal estimado</span><span>{format(amount)}</span></p>
              <p className="mt-2 text-xs leading-5 text-neutral-500">{missing ? "Hay artículos cuyo precio debe ser confirmado." : "Envío y disponibilidad por confirmar."} El siguiente paso abrirá WhatsApp; debes enviar el mensaje desde tu teléfono o navegador.</p>
            </div>
            {currencies.length > 1 && <p className="text-sm text-red-700">El carrito contiene monedas distintas. Separa los productos para continuar.</p>}
            {error && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button disabled={submitting || currencies.length > 1} type="submit" className="min-h-12 w-full bg-black px-4 font-bold uppercase tracking-[.1em] text-white disabled:opacity-50">{submitting ? "Preparando WhatsApp..." : "Continuar a WhatsApp"}</button>
          </form>
        </div>}
      </>}
    </div>
  </main>;
}
