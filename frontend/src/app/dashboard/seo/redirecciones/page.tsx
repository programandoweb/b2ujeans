"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiGitCommit,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";

type Redirect={
  id:number;
  source_path:string;
  target_path:string;
  status_code:number;
  reason?:string|null;
  is_active?:boolean;
};

type PaginationMeta={
  current_page:number;
  last_page:number;
  per_page:number;
  total:number;
  from:number|null;
  to:number|null;
};

export default function RedirectsPage(){
  const [items,setItems]=useState<Redirect[]>([]);
  const [search,setSearch]=useState("");
  const [appliedSearch,setAppliedSearch]=useState("");
  const [page,setPage]=useState(1);
  const [perPage,setPerPage]=useState(10);
  const [meta,setMeta]=useState<PaginationMeta>({
    current_page:1,last_page:1,per_page:10,total:0,from:null,to:null,
  });
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState("");

  async function load(targetPage=page){
    setLoading(true);
    setMessage("");

    const params=new URLSearchParams({
      page:String(targetPage),
      per_page:String(perPage),
    });
    if(appliedSearch.trim())params.set("search",appliedSearch.trim());

    const response=await fetch(`/api/admin/seo/redirects?${params.toString()}`,{cache:"no-store"});
    const json=await response.json().catch(()=>({}));
    setLoading(false);

    if(!response.ok){
      setMessage(json.message??"No fue posible cargar las redirecciones.");
      return;
    }

    setItems(json.data??[]);
    setMeta({
      current_page:Number(json.current_page??targetPage),
      last_page:Number(json.last_page??1),
      per_page:Number(json.per_page??perPage),
      total:Number(json.total??0),
      from:json.from??null,
      to:json.to??null,
    });
    setPage(Number(json.current_page??targetPage));
  }

  useEffect(()=>{void load(1);},[appliedSearch,perPage]);

  function submitSearch(e:React.FormEvent){
    e.preventDefault();
    setAppliedSearch(search.trim());
  }

  function clearSearch(){
    setSearch("");
    setAppliedSearch("");
  }

  async function remove(item:Redirect){
    if(!confirm(`¿Eliminar la redirección "${item.source_path}"?`))return;

    const response=await fetch(`/api/admin/seo/redirects/${item.id}`,{method:"DELETE"});
    const json=await response.json().catch(()=>({}));

    if(!response.ok){
      setMessage(json.message??"No fue posible eliminar la redirección.");
      return;
    }

    const targetPage=items.length===1&&page>1?page-1:page;
    await load(targetPage);
  }

  function goToPage(nextPage:number){
    if(nextPage<1||nextPage>meta.last_page||nextPage===page)return;
    void load(nextPage);
  }

  const pageNumbers=Array.from(
    {length:Math.min(5,meta.last_page)},
    (_,index)=>{
      if(meta.last_page<=5)return index+1;
      const start=Math.min(Math.max(page-2,1),meta.last_page-4);
      return start+index;
    }
  );

  return <div className="w-full max-w-none space-y-6">
    <header className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand)]">SEO</span>
        <h1 className="mt-2 flex items-center gap-3 text-3xl font-bold">
          <FiGitCommit className="text-[var(--brand)]"/>
          Redirecciones
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Gestiona redirecciones 301, 302, 307 y 308 para conservar tráfico y autoridad SEO.
        </p>
      </div>

      <Link
        href="/dashboard/seo/redirecciones/nuevo"
        className="inline-flex min-h-11 items-center gap-2 self-start rounded-xl bg-[var(--brand)] px-4 text-sm font-semibold text-white"
      >
        <FiPlus/>Nueva redirección
      </Link>
    </header>

    <form onSubmit={submitSearch} className="flex flex-col gap-2 lg:flex-row">
      <div className="relative min-w-0 flex-1">
        <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"/>
        <input
          value={search}
          onChange={e=>setSearch(e.target.value)}
          placeholder="Buscar por URL origen, destino o motivo..."
          className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-10 pr-10 text-sm outline-none transition focus:border-[var(--brand)]"
        />
        {search&&(
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)]"
            aria-label="Limpiar búsqueda"
            title="Limpiar búsqueda"
          >
            <FiX/>
          </button>
        )}
      </div>

      <button
        type="submit"
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-5 text-sm font-semibold text-white"
      >
        <FiSearch/>Buscar
      </button>
    </form>

    <div className="flex flex-wrap items-center justify-between gap-3">
      <label className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)]">
        Mostrar
        <select
          value={perPage}
          onChange={e=>setPerPage(Number(e.target.value))}
          className="min-h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--app-fg)] outline-none focus:border-[var(--brand)]"
          aria-label="Registros por página"
        >
          {[10,20,30,40,50].map(value=><option key={value} value={value}>{value}</option>)}
        </select>
        por página
      </label>

      <p className="text-sm text-[var(--muted)]">
        {meta.total>0?`Mostrando ${meta.from}–${meta.to} de ${meta.total}`:"0 registros"}
      </p>
    </div>

    <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead className="border-b border-[var(--border)] bg-[var(--app-bg)]">
            <tr className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
              <th className="px-5 py-4">Origen</th>
              <th className="px-5 py-4">Destino</th>
              <th className="px-5 py-4">Código</th>
              <th className="px-5 py-4">Motivo</th>
              <th className="px-5 py-4">Estado</th>
              <th className="px-5 py-4 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--border)]">
            {loading&&(
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-[var(--muted)]">
                  Cargando redirecciones…
                </td>
              </tr>
            )}

            {!loading&&items.map(item=>(
              <tr key={item.id} className="transition hover:bg-[var(--app-bg)]">
                <td className="px-5 py-4">
                  <strong className="block max-w-sm truncate text-sm">{item.source_path}</strong>
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex max-w-sm items-center gap-2 text-sm text-[var(--muted)]">
                    <FiArrowRight className="shrink-0"/>
                    <span className="truncate">{item.target_path}</span>
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-xs font-bold text-[var(--brand)]">{item.status_code}</span>
                </td>
                <td className="px-5 py-4">
                  <span className="block max-w-md truncate text-sm text-[var(--muted)]">{item.reason||"—"}</span>
                </td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    item.is_active===false
                      ?"bg-[var(--surface-muted)] text-[var(--muted)]"
                      :"bg-emerald-50 text-emerald-700"
                  }`}>
                    {item.is_active===false?"Inactiva":"Activa"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/dashboard/seo/redirecciones/${item.id}/editar`}
                      className="grid size-10 place-items-center rounded-xl border border-[var(--border)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
                      title="Editar redirección"
                      aria-label="Editar redirección"
                    >
                      <FiEdit2/>
                    </Link>
                    <button
                      type="button"
                      onClick={()=>void remove(item)}
                      className="grid size-10 place-items-center rounded-xl border border-red-200 text-red-600 transition hover:bg-red-50"
                      title="Eliminar redirección"
                      aria-label="Eliminar redirección"
                    >
                      <FiTrash2/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!loading&&items.length===0&&(
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm text-[var(--muted)]">
                  No hay redirecciones para esta búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!loading&&meta.last_page>1&&(
        <div className="flex flex-col gap-3 border-t border-[var(--border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--muted)]">Página {meta.current_page} de {meta.last_page}</p>

          <nav className="flex flex-wrap items-center gap-2" aria-label="Paginación de redirecciones">
            <button
              type="button"
              onClick={()=>goToPage(page-1)}
              disabled={page<=1}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-sm font-semibold disabled:opacity-40"
            >
              <FiChevronLeft/>Anterior
            </button>

            {pageNumbers.map(number=>(
              <button
                key={number}
                type="button"
                onClick={()=>goToPage(number)}
                aria-current={number===page?"page":undefined}
                className={`grid size-10 place-items-center rounded-xl border text-sm font-semibold ${
                  number===page
                    ?"border-[var(--brand)] bg-[var(--brand)] text-white"
                    :"border-[var(--border)] bg-[var(--surface)]"
                }`}
              >
                {number}
              </button>
            ))}

            <button
              type="button"
              onClick={()=>goToPage(page+1)}
              disabled={page>=meta.last_page}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-sm font-semibold disabled:opacity-40"
            >
              Siguiente<FiChevronRight/>
            </button>
          </nav>
        </div>
      )}
    </section>

    {message&&<p className="text-sm font-medium text-red-700">{message}</p>}
  </div>;
}
