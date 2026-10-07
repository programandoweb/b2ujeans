"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { ManagedHeroSlide } from "@/lib/public-hero";

function Action({ href, label, primary=false }:{href:string;label:string;primary?:boolean}) {
  const external=/^https?:\/\//i.test(href);
  return <a
    href={href}
    target={external?"_blank":undefined}
    rel={external?"noreferrer":undefined}
    className={
      primary
        ?"inline-flex min-h-12 items-center justify-center gap-2 bg-white px-6 text-[11px] font-bold uppercase tracking-[.14em] text-black transition hover:bg-neutral-200"
        :"inline-flex min-h-12 items-center justify-center border border-white/40 px-6 text-[11px] font-bold uppercase tracking-[.14em] text-white transition hover:bg-white hover:text-black"
    }
  >
    {label}{primary&&<ArrowRight size={15}/>}
  </a>;
}

export default function ManagedHero({slides}:{slides:ManagedHeroSlide[]}) {
  const [active,setActive]=useState(0);
  const reduceMotion=useReducedMotion();

  useEffect(()=>{
    if(reduceMotion||slides.length<2)return;
    const current=slides[active]??slides[0];
    const timer=window.setTimeout(()=>setActive(value=>(value+1)%slides.length),current.interval_ms||3000);
    return()=>window.clearTimeout(timer);
  },[active,reduceMotion,slides]);

  if(!slides.length)return null;
  const slide=slides[Math.min(active,slides.length-1)]??slides[0];

  return <section className="relative min-h-[68vh] overflow-hidden bg-neutral-950 text-white lg:min-h-[76vh]">
    <AnimatePresence mode="sync" initial={false}>
      <motion.img
        key={slide.id}
        src={slide.image_url}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{objectPosition:slide.background_position||"center"}}
        initial={reduceMotion?false:{opacity:0,scale:1.03}}
        animate={{opacity:.82,scale:1}}
        exit={{opacity:0}}
        transition={{duration:reduceMotion?0:.65}}
      />
    </AnimatePresence>
    <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/10"/>
    <div className="relative mx-auto flex min-h-[68vh] max-w-[1480px] items-end px-5 pb-14 pt-28 sm:px-8 lg:min-h-[76vh] lg:px-12 lg:pb-20">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={"content-"+slide.id}
          className="max-w-3xl"
          initial={reduceMotion?false:{opacity:0,y:18}}
          animate={{opacity:1,y:0}}
          exit={{opacity:0,y:-10}}
          transition={{duration:reduceMotion?0:.45}}
        >
          {slide.eyebrow&&<p className="mb-4 text-[11px] font-semibold uppercase tracking-[.26em] text-white/75">{slide.eyebrow}</p>}
          <h1 className="b2u-serif text-5xl leading-[.94] tracking-[-.045em] sm:text-7xl lg:text-[92px]">
            {slide.title}{slide.accent&&<> <span className="text-white/75">{slide.accent}</span></>}
          </h1>
          {slide.description&&<p className="mt-6 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">{slide.description}</p>}
          {(slide.primary_label||slide.secondary_label)&&<div className="mt-8 flex flex-wrap gap-3">
            {slide.primary_label&&slide.primary_href&&<Action href={slide.primary_href} label={slide.primary_label} primary/>}
            {slide.secondary_label&&slide.secondary_href&&<Action href={slide.secondary_href} label={slide.secondary_label}/>}
          </div>}
          {!!slide.cards?.length&&<div className="mt-8 grid max-w-3xl gap-2 sm:grid-cols-3">
            {slide.cards.map((card,index)=><div key={index} className="border border-white/20 bg-black/20 p-4 backdrop-blur-sm">
              <strong className="block text-sm">{card.title}</strong>
              <span className="mt-1 block text-xs leading-5 text-white/65">{card.text}</span>
            </div>)}
          </div>}
        </motion.div>
      </AnimatePresence>
    </div>
    {slides.length>1&&<div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
      {slides.map((item,index)=><button key={item.id} type="button" onClick={()=>setActive(index)} aria-label={`Slide ${index+1}`} className={`h-1.5 transition-all ${index===active?"w-8 bg-white":"w-3 bg-white/45"}`}/>)}
    </div>}
  </section>;
}
