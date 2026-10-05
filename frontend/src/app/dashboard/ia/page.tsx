"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  CheckCircle2,
  CircleAlert,
  Cpu,
  Edit2,
  Plus,
  RefreshCw,
  Server,
  Trash2,
  X,
} from "lucide-react";

type Provider = {
  id:number;
  code:string;
  name:string;
  driver:"openai_compatible"|"gemini"|"anthropic";
  base_url:string;
  timeout_seconds:number;
  max_retries:number;
  verify_tls:boolean;
  allow_private_network:boolean;
  is_active:boolean;
  health_status:"unknown"|"healthy"|"unhealthy";
  health_checked_at?:string|null;
  health_message?:string|null;
  has_credentials:boolean;
  credential_keys:string[];
  models_count?:number|null;
};

type Model = {
  id:number;
  ai_provider_id:number;
  code:string;
  name:string;
  model_identifier:string;
  priority:number;
  capabilities:string[];
  is_active:boolean;
  provider?:{id:number;name:string;code:string;driver:string}|null;
};

type Tab="providers"|"models";

type ProviderForm = {
  id?: number;
  has_credentials?: boolean;
  code: string;
  name: string;
  driver: Provider["driver"];
  base_url: string;
  api_key: string;
  timeout_seconds: number;
  max_retries: number;
  verify_tls: boolean;
  allow_private_network: boolean;
  is_active: boolean;
};

const emptyProvider: ProviderForm = {
  code:"",
  name:"",
  driver:"openai_compatible",
  base_url:"",
  api_key:"",
  timeout_seconds:30,
  max_retries:1,
  verify_tls:true,
  allow_private_network:false,
  is_active:true,
};

const emptyModel={
  ai_provider_id:"",
  code:"",
  name:"",
  model_identifier:"",
  priority:100,
  capabilities:"",
  is_active:true,
};

export default function AiPage(){
  const [tab,setTab]=useState<Tab>("providers");
  const [providers,setProviders]=useState<Provider[]>([]);
  const [models,setModels]=useState<Model[]>([]);
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState("");
  const [providerForm,setProviderForm]=useState<ProviderForm | null>(null);
  const [modelForm,setModelForm]=useState<typeof emptyModel & {id?:number} | null>(null);
  const [saving,setSaving]=useState(false);

  async function load(){
    setLoading(true);
    setMessage("");
    const [providersResponse,modelsResponse]=await Promise.all([
      fetch("/api/admin/ai/providers",{cache:"no-store"}),
      fetch("/api/admin/ai/models",{cache:"no-store"}),
    ]);

    const providersJson=await providersResponse.json().catch(()=>({}));
    const modelsJson=await modelsResponse.json().catch(()=>({}));
    setLoading(false);

    if(!providersResponse.ok||!modelsResponse.ok){
      setMessage(providersJson.message??modelsJson.message??"No fue posible cargar la configuración de IA.");
      return;
    }

    setProviders(providersJson.data??[]);
    setModels(modelsJson.data??[]);
  }

  useEffect(()=>{void load();},[]);

  const summary=useMemo(()=>({
    providers:providers.filter(item=>item.is_active).length,
    healthy:providers.filter(item=>item.health_status==="healthy").length,
    models:models.filter(item=>item.is_active).length,
  }),[providers,models]);

  async function testProvider(id:number){
    setMessage("");
    const response=await fetch(`/api/admin/ai/providers/${id}/test`,{method:"POST"});
    const json=await response.json().catch(()=>({}));
    if(!response.ok){
      setMessage(json.message??"No fue posible probar el proveedor.");
      return;
    }
    setMessage(json.data?.test?.message??"Prueba finalizada.");
    await load();
  }

  async function removeProvider(id:number){
    if(!confirm("¿Eliminar este proveedor de IA?"))return;
    const response=await fetch(`/api/admin/ai/providers/${id}`,{method:"DELETE"});
    const json=await response.json().catch(()=>({}));
    if(!response.ok){setMessage(json.message??"No fue posible eliminar el proveedor.");return;}
    await load();
  }

  async function removeModel(id:number){
    if(!confirm("¿Eliminar este modelo?"))return;
    const response=await fetch(`/api/admin/ai/models/${id}`,{method:"DELETE"});
    const json=await response.json().catch(()=>({}));
    if(!response.ok){setMessage(json.message??"No fue posible eliminar el modelo.");return;}
    await load();
  }

  async function saveProvider(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!providerForm)return;
    setSaving(true);
    setMessage("");

    const payload:Record<string,unknown>={
      code:providerForm.code.trim(),
      name:providerForm.name.trim(),
      driver:providerForm.driver,
      base_url:providerForm.base_url.trim(),
      timeout_seconds:Number(providerForm.timeout_seconds),
      max_retries:Number(providerForm.max_retries),
      verify_tls:providerForm.verify_tls,
      allow_private_network:providerForm.allow_private_network,
      is_active:providerForm.is_active,
    };
    if(providerForm.api_key.trim())payload.api_key=providerForm.api_key.trim();

    const response=await fetch(
      providerForm.id?`/api/admin/ai/providers/${providerForm.id}`:"/api/admin/ai/providers",
      {
        method:providerForm.id?"PUT":"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(payload),
      }
    );
    const json=await response.json().catch(()=>({}));
    setSaving(false);

    if(!response.ok){
      setMessage(json.message??"No fue posible guardar el proveedor.");
      return;
    }

    setProviderForm(null);
    await load();
  }

  async function saveModel(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!modelForm)return;
    setSaving(true);
    setMessage("");

    const payload={
      ai_provider_id:Number(modelForm.ai_provider_id),
      code:modelForm.code.trim(),
      name:modelForm.name.trim(),
      model_identifier:modelForm.model_identifier.trim(),
      priority:Number(modelForm.priority),
      capabilities:modelForm.capabilities.split(",").map(item=>item.trim()).filter(Boolean),
      is_active:modelForm.is_active,
    };

    const response=await fetch(
      modelForm.id?`/api/admin/ai/models/${modelForm.id}`:"/api/admin/ai/models",
      {
        method:modelForm.id?"PUT":"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(payload),
      }
    );
    const json=await response.json().catch(()=>({}));
    setSaving(false);

    if(!response.ok){
      setMessage(json.message??"No fue posible guardar el modelo.");
      return;
    }

    setModelForm(null);
    await load();
  }

  return <div className="w-full max-w-none space-y-6">
    <header className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand)]">Infraestructura de IA</span>
        <h1 className="mt-2 flex items-center gap-3 text-3xl font-bold">
          <Bot className="text-[var(--brand)]" aria-hidden="true"/>
          Proveedores y modelos
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          Configura proveedores compatibles con OpenAI, Gemini o Anthropic. Las credenciales se cifran en Laravel y nunca se devuelven al navegador.
        </p>
      </div>

      <button
        type="button"
        onClick={()=>tab==="providers"?setProviderForm({...emptyProvider}):setModelForm({...emptyModel})}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 text-sm font-semibold text-white"
      >
        <Plus size={17}/>
        {tab==="providers"?"Nuevo proveedor":"Nuevo modelo"}
      </button>
    </header>

    <section className="grid gap-4 sm:grid-cols-3">
      <Metric icon={Server} label="Proveedores activos" value={summary.providers} detail={`${summary.healthy} saludables`}/>
      <Metric icon={CheckCircle2} label="Conexiones saludables" value={summary.healthy} detail="Última prueba registrada"/>
      <Metric icon={Cpu} label="Modelos activos" value={summary.models} detail={`${models.length} configurados`}/>
    </section>

    <div className="flex gap-2 border-b border-[var(--border)]">
      <TabButton active={tab==="providers"} onClick={()=>setTab("providers")}>Proveedores</TabButton>
      <TabButton active={tab==="models"} onClick={()=>setTab("models")}>Modelos</TabButton>
    </div>

    {message&&(
      <div className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
        <CircleAlert size={18} className="mt-0.5 shrink-0 text-[var(--accent)]"/>
        <span>{message}</span>
      </div>
    )}

    {loading?(
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center text-sm text-[var(--muted)]">Cargando configuración…</div>
    ):tab==="providers"?(
      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead className="border-b border-[var(--border)] bg-[var(--app-bg)]">
              <tr className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                <th className="px-5 py-4">Proveedor</th>
                <th className="px-5 py-4">Driver</th>
                <th className="px-5 py-4">Salud</th>
                <th className="px-5 py-4">Modelos</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {providers.map(item=><tr key={item.id} className="hover:bg-[var(--app-bg)]">
                <td className="px-5 py-4">
                  <strong className="block text-sm">{item.name}</strong>
                  <span className="mt-1 block text-xs text-[var(--muted)]">{item.code} · {item.base_url}</span>
                </td>
                <td className="px-5 py-4"><code className="text-xs">{item.driver}</code></td>
                <td className="px-5 py-4"><Health status={item.health_status}/></td>
                <td className="px-5 py-4 text-sm">{item.models_count??0}</td>
                <td className="px-5 py-4 text-sm font-medium">{item.is_active?"Activo":"Inactivo"}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button onClick={()=>void testProvider(item.id)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-xs font-semibold hover:border-[var(--brand)] hover:text-[var(--brand)]"><RefreshCw size={14}/>Probar</button>
                    <button onClick={()=>setProviderForm({
                      id:item.id,code:item.code,name:item.name,driver:item.driver,base_url:item.base_url,api_key:"",
                      timeout_seconds:item.timeout_seconds,max_retries:item.max_retries,verify_tls:item.verify_tls,
                      allow_private_network:item.allow_private_network,is_active:item.is_active,has_credentials:item.has_credentials,
                    })} className="grid size-10 place-items-center rounded-xl border border-[var(--border)] hover:border-[var(--brand)] hover:text-[var(--brand)]" aria-label="Editar"><Edit2 size={16}/></button>
                    <button onClick={()=>void removeProvider(item.id)} className="grid size-10 place-items-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50" aria-label="Eliminar"><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>)}
              {providers.length===0&&<tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-[var(--muted)]">No hay proveedores configurados.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    ):(
      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead className="border-b border-[var(--border)] bg-[var(--app-bg)]">
              <tr className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                <th className="px-5 py-4">Modelo</th><th className="px-5 py-4">Proveedor</th><th className="px-5 py-4">Prioridad</th><th className="px-5 py-4">Capacidades</th><th className="px-5 py-4">Estado</th><th className="px-5 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {models.map(item=><tr key={item.id} className="hover:bg-[var(--app-bg)]">
                <td className="px-5 py-4"><strong className="block text-sm">{item.name}</strong><span className="mt-1 block text-xs text-[var(--muted)]">{item.code} · {item.model_identifier}</span></td>
                <td className="px-5 py-4 text-sm">{item.provider?.name??"—"}</td>
                <td className="px-5 py-4 text-sm">{item.priority}</td>
                <td className="px-5 py-4 text-xs">{item.capabilities?.length?item.capabilities.join(", "):"—"}</td>
                <td className="px-5 py-4 text-sm font-medium">{item.is_active?"Activo":"Inactivo"}</td>
                <td className="px-5 py-4"><div className="flex justify-end gap-2">
                  <button onClick={()=>setModelForm({
                    id:item.id,ai_provider_id:String(item.ai_provider_id),code:item.code,name:item.name,model_identifier:item.model_identifier,
                    priority:item.priority,capabilities:(item.capabilities??[]).join(", "),is_active:item.is_active,
                  })} className="grid size-10 place-items-center rounded-xl border border-[var(--border)] hover:border-[var(--brand)] hover:text-[var(--brand)]" aria-label="Editar"><Edit2 size={16}/></button>
                  <button onClick={()=>void removeModel(item.id)} className="grid size-10 place-items-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50" aria-label="Eliminar"><Trash2 size={16}/></button>
                </div></td>
              </tr>)}
              {models.length===0&&<tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-[var(--muted)]">No hay modelos configurados.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    )}

    {providerForm&&<Drawer title={providerForm.id?"Editar proveedor":"Nuevo proveedor"} onClose={()=>setProviderForm(null)}>
      <form onSubmit={saveProvider} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Código"><input required value={providerForm.code} onChange={e=>setProviderForm({...providerForm,code:e.target.value})}/></Field>
          <Field label="Nombre"><input required value={providerForm.name} onChange={e=>setProviderForm({...providerForm,name:e.target.value})}/></Field>
        </div>
        <Field label="Driver"><select value={providerForm.driver} onChange={e=>setProviderForm({...providerForm,driver:e.target.value as Provider["driver"]})}><option value="openai_compatible">OpenAI compatible</option><option value="gemini">Gemini</option><option value="anthropic">Anthropic</option></select></Field>
        <Field label="URL base"><input required type="url" placeholder="http://host.docker.internal:1234/v1" value={providerForm.base_url} onChange={e=>setProviderForm({...providerForm,base_url:e.target.value})}/></Field>
        <Field label={providerForm.has_credentials?"Nueva API key (opcional)":"API key (opcional)"}><input type="password" autoComplete="new-password" value={providerForm.api_key} onChange={e=>setProviderForm({...providerForm,api_key:e.target.value})}/></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Timeout"><input type="number" min={1} max={300} value={providerForm.timeout_seconds} onChange={e=>setProviderForm({...providerForm,timeout_seconds:Number(e.target.value)})}/></Field>
          <Field label="Reintentos"><input type="number" min={0} max={5} value={providerForm.max_retries} onChange={e=>setProviderForm({...providerForm,max_retries:Number(e.target.value)})}/></Field>
        </div>
        <Check checked={providerForm.verify_tls} onChange={value=>setProviderForm({...providerForm,verify_tls:value})} label="Verificar TLS"/>
        <Check checked={providerForm.allow_private_network} onChange={value=>setProviderForm({...providerForm,allow_private_network:value})} label="Permitir red privada / HTTP"/>
        <Check checked={providerForm.is_active} onChange={value=>setProviderForm({...providerForm,is_active:value})} label="Proveedor activo"/>
        <Actions saving={saving} onCancel={()=>setProviderForm(null)} label={providerForm.id?"Guardar cambios":"Crear proveedor"}/>
      </form>
    </Drawer>}

    {modelForm&&<Drawer title={modelForm.id?"Editar modelo":"Nuevo modelo"} onClose={()=>setModelForm(null)}>
      <form onSubmit={saveModel} className="space-y-5">
        <Field label="Proveedor"><select required value={modelForm.ai_provider_id} onChange={e=>setModelForm({...modelForm,ai_provider_id:e.target.value})}><option value="">Selecciona proveedor</option>{providers.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Código"><input required value={modelForm.code} onChange={e=>setModelForm({...modelForm,code:e.target.value})}/></Field>
          <Field label="Nombre"><input required value={modelForm.name} onChange={e=>setModelForm({...modelForm,name:e.target.value})}/></Field>
        </div>
        <Field label="Identificador del modelo"><input required placeholder="qwen/qwen3-8b" value={modelForm.model_identifier} onChange={e=>setModelForm({...modelForm,model_identifier:e.target.value})}/></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Prioridad"><input type="number" min={1} value={modelForm.priority} onChange={e=>setModelForm({...modelForm,priority:Number(e.target.value)})}/></Field>
          <Field label="Capacidades"><input placeholder="text, json, tools" value={modelForm.capabilities} onChange={e=>setModelForm({...modelForm,capabilities:e.target.value})}/></Field>
        </div>
        <Check checked={modelForm.is_active} onChange={value=>setModelForm({...modelForm,is_active:value})} label="Modelo activo"/>
        <Actions saving={saving} onCancel={()=>setModelForm(null)} label={modelForm.id?"Guardar cambios":"Crear modelo"}/>
      </form>
    </Drawer>}
  </div>;
}

function Metric({icon:Icon,label,value,detail}:{icon:React.ComponentType<{size?:number}>;label:string;value:number;detail:string}){
  return <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
    <div className="flex items-center gap-3 text-[var(--muted)]"><Icon size={18}/><span className="text-sm font-semibold">{label}</span></div>
    <strong className="mt-4 block text-3xl">{value}</strong><span className="mt-1 block text-xs text-[var(--muted)]">{detail}</span>
  </article>;
}
function TabButton({active,onClick,children}:{active:boolean;onClick:()=>void;children:React.ReactNode}){
  return <button type="button" onClick={onClick} className={`border-b-2 px-4 py-3 text-sm font-semibold ${active?"border-[var(--brand)] text-[var(--brand)]":"border-transparent text-[var(--muted)]"}`}>{children}</button>;
}
function Health({status}:{status:Provider["health_status"]}){
  const cls=status==="healthy"?"bg-green-50 text-green-700":status==="unhealthy"?"bg-red-50 text-red-700":"bg-slate-100 text-slate-600";
  const label=status==="healthy"?"Saludable":status==="unhealthy"?"Con error":"Sin probar";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>{label}</span>;
}
function Drawer({title,onClose,children}:{title:string;onClose:()=>void;children:React.ReactNode}){
  return <div className="fixed inset-0 z-[80]">
    <button className="absolute inset-0 bg-black/45" onClick={onClose} aria-label="Cerrar"/>
    <aside className="absolute inset-y-0 right-0 w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl sm:p-8">
      <div className="mb-7 flex items-center justify-between gap-4"><h2 className="text-2xl font-bold">{title}</h2><button onClick={onClose} className="grid size-10 place-items-center rounded-xl border border-[var(--border)]"><X size={19}/></button></div>
      {children}
    </aside>
  </div>;
}
function Field({label,children}:{label:string;children:React.ReactElement}){
  return <label className="block space-y-2"><span className="text-sm font-semibold">{label}</span><div className="[&_input]:min-h-11 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-[var(--border)] [&_input]:px-3 [&_select]:min-h-11 [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-[var(--border)] [&_select]:bg-white [&_select]:px-3">{children}</div></label>;
}
function Check({checked,onChange,label}:{checked:boolean;onChange:(value:boolean)=>void;label:string}){
  return <label className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-4"><input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)}/><span className="text-sm font-semibold">{label}</span></label>;
}
function Actions({saving,onCancel,label}:{saving:boolean;onCancel:()=>void;label:string}){
  return <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={onCancel} className="min-h-11 rounded-xl border border-[var(--border)] px-4 text-sm font-semibold">Cancelar</button><button disabled={saving} className="min-h-11 rounded-xl bg-[var(--brand)] px-5 text-sm font-semibold text-white disabled:opacity-60">{saving?"Guardando…":label}</button></div>;
}
