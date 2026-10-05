"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, Bot, CheckCircle2, HelpCircle, KeyRound, LoaderCircle, Pause, Play, PlugZap, Save, Search, Send, ShieldCheck, Square, Trash2, XCircle } from "lucide-react";
import { use, useEffect, useRef, useState } from "react";
import { connectAgentSocket, type AgentSocket } from "@/lib/agent-socket";

type Agent = { id:string; name:string; role:string };
type Settings = {
  agent_id:string;
  provider:string;
  model:string;
  has_api_key:boolean;
  primary_ai_model_id?:number|null;
  fallback_ai_model_id?:number|null;
};
type AiModelOption = {
  id:number;
  name:string;
  model_identifier:string;
  is_active:boolean;
  provider?:{id:number;name:string;code:string;driver:string;is_active?:boolean}|null;
};
type ChatMessage = { id:string; role:"user"|"assistant"; content:string; error?:boolean };
type AgentResponse = {
  requestId:string;
  agent:Agent;
  message:string;
  status:"completed"|"configuration_required";
};
type ResearchState = {
  run:{
    status:"idle"|"running"|"paused"|"stopped"|"completed";
    total_items:number;
    processed_items:number;
    successful_items:number;
    failed_items:number;
    last_error?:string|null;
    current_item?:{id:number;name:string;reference?:string|null}|null;
  };
  pending_items:number;
  completed_items:number;
};
type UnansweredQuestion = {
  id:number;
  question:string;
  times_asked:number;
  status:"pending"|"answered"|"discarded";
  last_asked_at?:string|null;
  created_at:string;
};

export default function AgentChatPage({ params }:{ params:Promise<{id:string}> }) {
  const { id } = use(params);
  const [agent,setAgent]=useState<Agent|null>(null);
  const [settings,setSettings]=useState<Settings|null>(null);
  const [model,setModel]=useState("gemini-2.5-flash");
  const [apiKey,setApiKey]=useState("");
  const [aiModels,setAiModels]=useState<AiModelOption[]>([]);
  const [primaryAiModelId,setPrimaryAiModelId]=useState("");
  const [fallbackAiModelId,setFallbackAiModelId]=useState("");
  const [saving,setSaving]=useState(false);
  const [settingsMessage,setSettingsMessage]=useState("");
  const [messages,setMessages]=useState<ChatMessage[]>([]);
  const [draft,setDraft]=useState("");
  const [sending,setSending]=useState(false);
  const [transport,setTransport]=useState<"connecting"|"socket.io"|"rest">("connecting");
  const [socketMessage,setSocketMessage]=useState("");
  const [research,setResearch]=useState<ResearchState|null>(null);
  const [researchBusy,setResearchBusy]=useState(false);
  const [researchMessage,setResearchMessage]=useState("");
  const [unanswered,setUnanswered]=useState<UnansweredQuestion[]>([]);
  const [unansweredLoading,setUnansweredLoading]=useState(false);
  const [unansweredMessage,setUnansweredMessage]=useState("");
  const [answers,setAnswers]=useState<Record<number,string>>({});
  const socketRef=useRef<AgentSocket|null>(null);
  const bottomRef=useRef<HTMLDivElement|null>(null);

  useEffect(()=>{
    async function load(){
      const [agentsResponse,settingsResponse,modelsResponse]=await Promise.all([
        fetch("/api/agents",{cache:"no-store"}),
        fetch(`/api/agents/${id}/settings`,{cache:"no-store"}),
        fetch("/api/admin/ai/models",{cache:"no-store"}),
      ]);
      const agentsJson=await agentsResponse.json().catch(()=>({}));
      const settingsJson=await settingsResponse.json().catch(()=>({}));
      const modelsJson=await modelsResponse.json().catch(()=>({}));

      const found=(agentsJson.data??[]).find((item:Agent)=>item.id===id)??null;
      setAgent(found);

      if(modelsResponse.ok){
        setAiModels((modelsJson.data??[]).filter(
          (item:AiModelOption)=>item.is_active&&item.provider?.is_active!==false
        ));
      }

      if(settingsResponse.ok&&settingsJson.data){
        setSettings(settingsJson.data);
        setModel(settingsJson.data.model??"gemini-2.5-flash");
        setPrimaryAiModelId(settingsJson.data.primary_ai_model_id?String(settingsJson.data.primary_ai_model_id):"");
        setFallbackAiModelId(settingsJson.data.fallback_ai_model_id?String(settingsJson.data.fallback_ai_model_id):"");
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

  useEffect(()=>{
    if(id!=="jorge")return;
    let active=true;

    async function loadResearch(){
      const response=await fetch("/api/admin/agents/jorge/research",{cache:"no-store"});
      const json=await response.json().catch(()=>({}));
      if(active&&response.ok)setResearch(json.data);
    }

    void loadResearch();
    const timer=window.setInterval(()=>void loadResearch(),5000);
    return ()=>{active=false;window.clearInterval(timer);};
  },[id]);

  useEffect(()=>{
    if(id!=="claudio")return;
    let active=true;

    async function loadUnanswered(){
      setUnansweredLoading(true);
      const response=await fetch("/api/admin/agents/claudio/unanswered-questions?status=pending&per_page=50",{cache:"no-store"});
      const json=await response.json().catch(()=>({}));
      if(!active)return;
      setUnansweredLoading(false);
      if(response.ok){
        setUnanswered(json.data??[]);
      }else{
        setUnansweredMessage(json.message??"No fue posible cargar las preguntas pendientes.");
      }
    }

    void loadUnanswered();
    return ()=>{active=false;};
  },[id]);

  async function researchAction(action:"play"|"pause"|"stop"){
    setResearchBusy(true);
    setResearchMessage("");
    const response=await fetch(`/api/admin/agents/jorge/research/${action}`,{method:"POST"});
    const json=await response.json().catch(()=>({}));
    setResearchBusy(false);
    if(!response.ok){
      setResearchMessage(json.message??"No fue posible cambiar el estado de Jorge.");
      return;
    }
    setResearch(json.data);
    setResearchMessage(action==="play"?"Investigación iniciada.":action==="pause"?"Investigación pausada.":"Investigación detenida.");
  }

  async function refreshUnanswered(){
    const response=await fetch("/api/admin/agents/claudio/unanswered-questions?status=pending&per_page=50",{cache:"no-store"});
    const json=await response.json().catch(()=>({}));
    if(response.ok)setUnanswered(json.data??[]);
  }

  async function answerQuestion(question:UnansweredQuestion){
    const answer=(answers[question.id]??"").trim();
    if(!answer)return;

    setUnansweredMessage("");
    const response=await fetch(`/api/admin/agents/claudio/unanswered-questions/${question.id}/answer`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({answer,category:"preguntas frecuentes"}),
    });
    const json=await response.json().catch(()=>({}));

    if(!response.ok){
      setUnansweredMessage(json.message??"No fue posible guardar la respuesta.");
      return;
    }

    setAnswers(current=>{
      const next={...current};
      delete next[question.id];
      return next;
    });
    setUnansweredMessage("Respuesta incorporada al RAG de Claudio.");
    await refreshUnanswered();
  }

  async function discardQuestion(question:UnansweredQuestion){
    if(!confirm("¿Descartar esta pregunta del aprendizaje de Claudio?"))return;

    setUnansweredMessage("");
    const response=await fetch(`/api/admin/agents/claudio/unanswered-questions/${question.id}/discard`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({reason:"Descartada desde el perfil de Claudio."}),
    });
    const json=await response.json().catch(()=>({}));

    if(!response.ok){
      setUnansweredMessage(json.message??"No fue posible descartar la pregunta.");
      return;
    }

    setUnansweredMessage("Pregunta descartada.");
    await refreshUnanswered();
  }

  async function saveSettings(e:React.FormEvent){
    e.preventDefault();
    setSaving(true);
    setSettingsMessage("");

    const usesCentralModels=!["claudio","sofia"].includes(id);
    const payload:Record<string,unknown>=usesCentralModels
      ? {
          primary_ai_model_id:primaryAiModelId?Number(primaryAiModelId):null,
          fallback_ai_model_id:fallbackAiModelId?Number(fallbackAiModelId):null,
        }
      : {provider:"gemini",model};

    if(!usesCentralModels&&apiKey.trim())payload.api_key=apiKey.trim();

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
    setSettingsMessage(!["claudio","sofia"].includes(id)
      ?"Modelos del agente actualizados."
      :"Configuración guardada. La API key quedó cifrada en Laravel.");
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
      socket.emit("agent:message",{agentId:id,message,requestId,history:messages.map(({role,content})=>({role,content}))});
      return;
    }

    try{
      const response=await fetch(`/api/agents/${id}/messages`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({message,requestId,history:messages.map(({role,content})=>({role,content}))}),
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

  return <div className="w-full max-w-none space-y-6">
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
        {id==="claudio"&&<section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2"><HelpCircle size={18} className="text-[var(--brand)]"/><h2 className="font-bold">Preguntas pendientes del RAG</h2></div>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Preguntas reales que Claudio no respondió por falta de evidencia. Respóndelas para entrenar su base de conocimiento o descártalas.</p>
            </div>
            <span className="rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-xs font-bold text-[var(--brand)]">{unanswered.length}</span>
          </div>

          {unansweredLoading&&<p className="text-sm text-[var(--muted)]">Cargando preguntas…</p>}
          {!unansweredLoading&&unanswered.length===0&&<div className="rounded-xl border border-dashed border-[var(--border)] p-5 text-center">
            <BookOpen size={24} className="mx-auto text-[var(--brand)]"/>
            <p className="mt-2 text-sm font-medium">No hay preguntas pendientes.</p>
          </div>}

          <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
            {unanswered.map(question=><article key={question.id} className="space-y-3 rounded-xl border border-[var(--border)] p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold leading-6">{question.question}</p>
                <span className="shrink-0 rounded-full bg-[var(--app-bg)] px-2 py-1 text-[11px] font-bold text-[var(--muted)]">{question.times_asked}×</span>
              </div>

              <textarea
                value={answers[question.id]??""}
                onChange={e=>setAnswers(current=>({...current,[question.id]:e.target.value}))}
                placeholder="Escribe la respuesta verificada que Claudio podrá utilizar…"
                rows={4}
                className="w-full rounded-xl border border-[var(--border)] bg-transparent p-3 text-sm"
              />

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!(answers[question.id]??"").trim()}
                  onClick={()=>void answerQuestion(question)}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[var(--brand)] px-3 text-sm font-semibold text-white disabled:opacity-45"
                >
                  <CheckCircle2 size={16}/>Guardar en RAG
                </button>
                <button
                  type="button"
                  onClick={()=>void discardQuestion(question)}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-sm font-semibold text-[var(--muted)]"
                >
                  <XCircle size={16}/>Descartar
                </button>
              </div>
            </article>)}
          </div>

          {unansweredMessage&&<p className="text-xs font-medium text-[var(--brand)]">{unansweredMessage}</p>}
        </section>}

        {id==="jorge"&&<section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <div className="flex items-center gap-2"><Search size={18} className="text-[var(--brand)]"/><h2 className="font-bold">Investigación del catálogo</h2></div>
          <p className="text-sm leading-6 text-[var(--muted)]">Jorge recorre uno a uno los productos de la web oficial de Gaspronal, recupera contenido, SEO, metatags e imágenes y los guarda localmente.</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[var(--app-bg)] p-3"><span className="block text-xs text-[var(--muted)]">Estado</span><strong className="mt-1 block capitalize">{research?.run.status??"cargando"}</strong></div>
            <div className="rounded-xl bg-[var(--app-bg)] p-3"><span className="block text-xs text-[var(--muted)]">Progreso</span><strong className="mt-1 block">{research?.run.processed_items??0} / {research?.run.total_items??0}</strong></div>
            <div className="rounded-xl bg-[var(--app-bg)] p-3"><span className="block text-xs text-[var(--muted)]">Completados</span><strong className="mt-1 block">{research?.run.successful_items??0}</strong></div>
            <div className="rounded-xl bg-[var(--app-bg)] p-3"><span className="block text-xs text-[var(--muted)]">Fallidos</span><strong className="mt-1 block">{research?.run.failed_items??0}</strong></div>
          </div>

          {research&&research.run.total_items>0&&<div className="h-2 overflow-hidden rounded-full bg-[var(--app-bg)]"><div className="h-full bg-[var(--brand)] transition-all" style={{width:`${Math.min(100,Math.round((research.run.processed_items/research.run.total_items)*100))}%`}}/></div>}

          {research?.run.current_item&&<div className="rounded-xl border border-[var(--border)] p-3 text-sm">
            <span className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Producto actual</span>
            <strong className="mt-1 block">{research.run.current_item.name}</strong>
          </div>}

          <div className="grid grid-cols-3 gap-2">
            <button type="button" disabled={researchBusy||research?.run.status==="running"} onClick={()=>void researchAction("play")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-3 text-sm font-semibold text-white disabled:opacity-45"><Play size={16}/>Play</button>
            <button type="button" disabled={researchBusy||research?.run.status!=="running"} onClick={()=>void researchAction("pause")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-3 text-sm font-semibold disabled:opacity-45"><Pause size={16}/>Pausa</button>
            <button type="button" disabled={researchBusy||!["running","paused"].includes(research?.run.status??"")} onClick={()=>void researchAction("stop")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 px-3 text-sm font-semibold text-red-700 disabled:opacity-45"><Square size={16}/>Stop</button>
          </div>

          {research?.run.last_error&&<p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">{research.run.last_error}</p>}
          {researchMessage&&<p className="text-xs font-medium text-[var(--brand)]">{researchMessage}</p>}
        </section>}

        {!["claudio","sofia"].includes(id)?(
          <form onSubmit={saveSettings} className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
            <div className="flex items-center gap-2"><KeyRound size={18} className="text-[var(--brand)]"/><h2 className="font-bold">Modelo de IA</h2></div>
            <p className="text-sm leading-6 text-[var(--muted)]">
              El agente intenta primero el modelo principal. Si el proveedor o el modelo falla, utiliza automáticamente el fallback.
            </p>

            <label className="block space-y-2">
              <span className="text-sm font-medium">Modelo principal</span>
              <select
                value={primaryAiModelId}
                onChange={e=>{
                  setPrimaryAiModelId(e.target.value);
                  if(e.target.value===fallbackAiModelId)setFallbackAiModelId("");
                }}
                className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"
              >
                <option value="">Selecciona un modelo</option>
                {aiModels.map(item=><option key={item.id} value={item.id}>
                  {item.name} · {item.provider?.name??"Sin proveedor"} · {item.model_identifier}
                </option>)}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium">Modelo fallback</span>
              <select
                value={fallbackAiModelId}
                onChange={e=>setFallbackAiModelId(e.target.value)}
                className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"
              >
                <option value="">Sin fallback</option>
                {aiModels.filter(item=>String(item.id)!==primaryAiModelId).map(item=><option key={item.id} value={item.id}>
                  {item.name} · {item.provider?.name??"Sin proveedor"} · {item.model_identifier}
                </option>)}
              </select>
            </label>

            <div className="flex items-start gap-2 rounded-xl border border-[var(--border)] bg-[var(--app-bg)] p-3 text-xs leading-5 text-[var(--muted)]">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[var(--brand)]"/>
              Las API keys se administran centralmente en Proveedores IA y no se almacenan nuevamente en este agente.
            </div>

            <Link href="/dashboard/ia" className="inline-flex text-sm font-semibold text-[var(--brand)] hover:underline">
              Administrar proveedores y modelos
            </Link>

            <button disabled={saving} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 font-semibold text-white disabled:opacity-50"><Save size={17}/>{saving?"Guardando…":"Guardar modelos"}</button>

            {settingsMessage&&<p className="text-xs leading-5 text-[var(--muted)]">{settingsMessage}</p>}
          </form>
        ):(
          <form onSubmit={saveSettings} className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
            <div className="flex items-center gap-2"><KeyRound size={18} className="text-[var(--brand)]"/><h2 className="font-bold">Gemini</h2></div>
            <p className="text-sm leading-6 text-[var(--muted)]">La API key se guarda cifrada en Laravel y nunca vuelve a mostrarse en el navegador.</p>

            <div className={`flex items-center gap-2 rounded-xl border p-3 text-xs font-semibold ${settings?.has_api_key?"border-emerald-200 bg-emerald-50 text-emerald-700":"border-amber-200 bg-amber-50 text-amber-800"}`}>
              <ShieldCheck size={16}/>{settings?.has_api_key?"API key configurada":"API key pendiente"}
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium">API key de Gemini</span>
              <input type="password" autoComplete="off" value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder={settings?.has_api_key?"•••••••••••••••• (guardada)":"Pega aquí tu API key"} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"/>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium">Modelo</span>
              <input value={model} onChange={e=>setModel(e.target.value)} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"/>
            </label>

            <button disabled={saving} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 font-semibold text-white disabled:opacity-50"><Save size={17}/>{saving?"Guardando…":"Guardar configuración"}</button>

            {settings?.has_api_key&&<button type="button" onClick={removeApiKey} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-700"><Trash2 size={16}/>Eliminar API key</button>}
            {settingsMessage&&<p className="text-xs leading-5 text-[var(--muted)]">{settingsMessage}</p>}
          </form>
        )}
      </aside>
    </section>
  </div>;
}
