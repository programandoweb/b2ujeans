"use client";

import Link from "next/link";
import { ArrowLeft, Bot, KeyRound, LoaderCircle, PlugZap, Save, Send, ShieldCheck, Trash2 } from "lucide-react";
import { use, useEffect, useRef, useState } from "react";
import { connectAgentSocket, type AgentSocket } from "@/lib/agent-socket";

type Agent = { id:string; name:string; role:string };
type Settings = { agent_id:string; provider:string; model:string; has_api_key:boolean };
type ChatMessage = { id:string; role:"user"|"assistant"; content:string; error?:boolean };
type AgentResponse = {
  requestId:string;
  agent:Agent;
  message:string;
  status:"completed"|"configuration_required";
};

export default function AgentChatPage({ params }:{ params:Promise<{id:string}> }) {
  const { id } = use(params);
  const [agent,setAgent]=useState<Agent|null>(null);
  const [settings,setSettings]=useState<Settings|null>(null);
  const [model,setModel]=useState("gemini-2.5-flash");
  const [apiKey,setApiKey]=useState("");
  const [saving,setSaving]=useState(false);
  const [settingsMessage,setSettingsMessage]=useState("");
  const [messages,setMessages]=useState<ChatMessage[]>([]);
  const [draft,setDraft]=useState("");
  const [sending,setSending]=useState(false);
  const [transport,setTransport]=useState<"connecting"|"socket.io"|"rest">("connecting");
  const [socketMessage,setSocketMessage]=useState("");
  const socketRef=useRef<AgentSocket|null>(null);
  const bottomRef=useRef<HTMLDivElement|null>(null);

  useEffect(()=>{
    async function load(){
      const [agentsResponse,settingsResponse]=await Promise.all([
        fetch("/api/agents",{cache:"no-store"}),
        fetch(`/api/agents/${id}/settings`,{cache:"no-store"}),
      ]);
      const agentsJson=await agentsResponse.json().catch(()=>({}));
      const settingsJson=await settingsResponse.json().catch(()=>({}));

      const found=(agentsJson.data??[]).find((item:Agent)=>item.id===id)??null;
      setAgent(found);

      if(settingsResponse.ok&&settingsJson.data){
        setSettings(settingsJson.data);
        setModel(settingsJson.data.model??"gemini-2.5-flash");
      }
    }
    void load();
  },[id]);

  useEffect(()=>{
    let active=true;

    async function connect(){
      try{
        const tokenResponse=await fetch("/api/agents/socket-token",{cache:"no-store"});
        const tokenJson=await tokenResponse.json().catch(()=>({}));
        if(!tokenResponse.ok||!tokenJson.realtime_url){
          if(active){
            setTransport("rest");
            setSocketMessage(tokenJson.realtime_url?"No fue posible autenticar Socket.IO.":"Socket.IO público no configurado; usando REST.");
          }
          return;
        }

        const socket=await connectAgentSocket(tokenJson.realtime_url,tokenJson.token);
        if(!active){socket.disconnect();return;}
        socketRef.current=socket;

        socket.on("connect",()=>{
          if(!active)return;
          setTransport("socket.io");
          setSocketMessage("Conectado en tiempo real.");
        });
        socket.on("disconnect",()=>{
          if(!active)return;
          setTransport("rest");
          setSocketMessage("Socket.IO desconectado; REST fallback activo.");
        });
        socket.on("connect_error",()=>{
          if(!active)return;
          setTransport("rest");
          setSocketMessage("Socket.IO no disponible; REST fallback activo.");
        });
        socket.on("agent:response",(response:AgentResponse)=>{
          if(!active)return;
          setMessages(current=>[...current,{id:crypto.randomUUID(),role:"assistant",content:response.message}]);
          setSending(false);
        });
        socket.on("agent:error",(payload:{message?:string})=>{
          if(!active)return;
          setMessages(current=>[...current,{id:crypto.randomUUID(),role:"assistant",content:payload?.message??"Error del agente.",error:true}]);
          setSending(false);
        });
      }catch{
        if(active){
          setTransport("rest");
          setSocketMessage("Socket.IO no disponible; REST fallback activo.");
        }
      }
    }

    void connect();
    return ()=>{
      active=false;
      socketRef.current?.disconnect();
      socketRef.current=null;
    };
  },[id]);

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages,sending]);

  async function saveSettings(e:React.FormEvent){
    e.preventDefault();
    setSaving(true);
    setSettingsMessage("");

    const payload:Record<string,unknown>={provider:"gemini",model};
    if(apiKey.trim())payload.api_key=apiKey.trim();

    const response=await fetch(`/api/agents/${id}/settings`,{
      method:"PUT",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(payload),
    });
    const json=await response.json().catch(()=>({}));
    setSaving(false);

    if(!response.ok){
      setSettingsMessage(json.message??"No fue posible guardar la configuración.");
      return;
    }

    setSettings(json.data);
    setApiKey("");
    setSettingsMessage("Configuración guardada. La API key quedó cifrada en Laravel.");
  }

  async function removeApiKey(){
    if(!confirm("¿Eliminar la API key de Gemini de este agente?"))return;
    const response=await fetch(`/api/agents/${id}/settings`,{
      method:"PUT",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({api_key:null,model,provider:"gemini"}),
    });
    const json=await response.json().catch(()=>({}));
    if(response.ok){
      setSettings(json.data);
      setApiKey("");
      setSettingsMessage("API key eliminada.");
    }else{
      setSettingsMessage(json.message??"No fue posible eliminar la API key.");
    }
  }

  async function send(e:React.FormEvent){
    e.preventDefault();
    const message=draft.trim();
    if(!message||sending)return;

    const requestId=crypto.randomUUID();
    setMessages(current=>[...current,{id:requestId,role:"user",content:message}]);
    setDraft("");
    setSending(true);

    const socket=socketRef.current;
    if(transport==="socket.io"&&socket?.connected){
      socket.emit("agent:message",{agentId:id,message,requestId});
      return;
    }

    try{
      const response=await fetch(`/api/agents/${id}/messages`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({message,requestId}),
      });
      const json=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(json.message??"No fue posible consultar el agente.");
      const result:AgentResponse=json.data;
      setMessages(current=>[...current,{id:crypto.randomUUID(),role:"assistant",content:result.message}]);
    }catch(error){
      setMessages(current=>[...current,{id:crypto.randomUUID(),role:"assistant",content:error instanceof Error?error.message:"Error consultando el agente.",error:true}]);
    }finally{
      setSending(false);
    }
  }

  const name=agent?.name??id.charAt(0).toUpperCase()+id.slice(1);

  return <div className="mx-auto w-full max-w-7xl space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link href="/dashboard/agentes" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-medium">
        <ArrowLeft size={16}/>Agentes
      </Link>
      <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${transport==="socket.io"?"border-emerald-200 bg-emerald-50 text-emerald-700":"border-amber-200 bg-amber-50 text-amber-800"}`}>
        <PlugZap size={14}/>{transport==="connecting"?"Conectando…":transport==="socket.io"?"Socket.IO":"REST fallback"}
      </span>
    </div>

    <header>
      <div className="flex items-center gap-3">
        <div className="grid size-12 place-items-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)]"><Bot size={24}/></div>
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand)]">Agente Gaspronal</span>
          <h1 className="text-3xl font-bold">{name}</h1>
        </div>
      </div>
      {agent?.role&&<p className="mt-3 text-sm text-[var(--muted)]">{agent.role}</p>}
      {socketMessage&&<p className="mt-2 text-xs text-[var(--muted)]">{socketMessage}</p>}
    </header>

    <section className="grid gap-6 xl:grid-cols-[1.55fr_.75fr]">
      <div className="flex min-h-[640px] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <div className="border-b border-[var(--border)] px-5 py-4">
          <h2 className="font-bold">Chat con {name}</h2>
          <p className="mt-1 text-xs text-[var(--muted)]">La conversación usa Socket.IO cuando está disponible y cambia automáticamente a REST si falla.</p>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {!messages.length&&<div className="mx-auto max-w-md py-16 text-center">
            <Bot size={34} className="mx-auto text-[var(--brand)]"/>
            <h3 className="mt-3 font-bold">Inicia una conversación</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{settings?.has_api_key?"Gemini está configurado para este agente.":"Configura primero una API key de Gemini en el panel lateral."}</p>
          </div>}
          {messages.map(message=><div key={message.id} className={`flex ${message.role==="user"?"justify-end":"justify-start"}`}>
            <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 whitespace-pre-wrap ${message.role==="user"?"bg-[var(--brand)] text-white":message.error?"border border-red-200 bg-red-50 text-red-800":"bg-[var(--app-bg)] text-[var(--app-fg)]"}`}>{message.content}</div>
          </div>)}
          {sending&&<div className="flex justify-start"><div className="inline-flex items-center gap-2 rounded-2xl bg-[var(--app-bg)] px-4 py-3 text-sm text-[var(--muted)]"><LoaderCircle size={16} className="animate-spin"/>{name} está respondiendo…</div></div>}
          <div ref={bottomRef}/>
        </div>

        <form onSubmit={send} className="border-t border-[var(--border)] p-4">
          <div className="flex gap-2">
            <textarea value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();e.currentTarget.form?.requestSubmit();}}} placeholder={`Escribe a ${name}…`} rows={2} className="min-h-12 min-w-0 flex-1 resize-none rounded-xl border border-[var(--border)] bg-transparent p-3 text-sm"/>
            <button disabled={sending||!draft.trim()} className="inline-flex min-h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--brand)] text-white disabled:opacity-45" aria-label="Enviar mensaje"><Send size={18}/></button>
          </div>
        </form>
      </div>

      <aside className="space-y-5">
        <form onSubmit={saveSettings} className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <div className="flex items-center gap-2"><KeyRound size={18} className="text-[var(--brand)]"/><h2 className="font-bold">Gemini</h2></div>
          <p className="text-sm leading-6 text-[var(--muted)]">La API key se guarda cifrada en Laravel y nunca vuelve a mostrarse en el navegador.</p>

          <div className={`flex items-center gap-2 rounded-xl border p-3 text-xs font-semibold ${settings?.has_api_key?"border-emerald-200 bg-emerald-50 text-emerald-700":"border-amber-200 bg-amber-50 text-amber-800"}`}>
            <ShieldCheck size={16}/>{settings?.has_api_key?"API key configurada":"API key pendiente"}
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium">API key de Gemini</span>
            <input type="password" autoComplete="off" value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder={settings?.has_api_key?"•••••••••••••••• (guardada)":"Pega aquí tu API key"} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"/>
            {settings?.has_api_key&&<span className="block text-xs text-[var(--muted)]">Déjala vacía para conservar la clave actual.</span>}
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Modelo</span>
            <input value={model} onChange={e=>setModel(e.target.value)} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"/>
          </label>

          <button disabled={saving} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 font-semibold text-white disabled:opacity-50"><Save size={17}/>{saving?"Guardando…":"Guardar configuración"}</button>

          {settings?.has_api_key&&<button type="button" onClick={removeApiKey} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-700"><Trash2 size={16}/>Eliminar API key</button>}

          {settingsMessage&&<p className="text-xs leading-5 text-[var(--muted)]">{settingsMessage}</p>}
        </form>
      </aside>
    </section>
  </div>;
}
