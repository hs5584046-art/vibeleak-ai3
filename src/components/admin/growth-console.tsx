"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Channel = "seo" | "content" | "backlink" | "social" | "ads";
type GrowthItem = { id:string; channel:Channel; title:string; objective:string; target_url:string; content:string; metadata:Record<string,unknown>; status:string; priority:number; scheduled_for:string; };
const channelLabels: Record<Channel,string> = { seo:"SEO", content:"Content", backlink:"Backlink outreach", social:"External distribution", ads:"Zero-spend promotion" };

export function GrowthConsole() {
  const [items,setItems]=useState<GrowthItem[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const load=useCallback(async()=>{ setLoading(true); setError(""); const r=await fetch("/api/admin/growth",{cache:"no-store"}); const d=await r.json(); setLoading(false); if(!r.ok){setError(d.error??"Growth plan could not be loaded.");return;} setItems(d.items??[]);},[]);
  useEffect(()=>{ const first=window.setTimeout(()=>void load(),0); const id=window.setInterval(()=>void load(),60000); return()=>{window.clearTimeout(first); window.clearInterval(id);};},[load]);
  const counts=useMemo(()=>items.reduce<Record<Channel,number>>((a,i)=>(a[i.channel]+=1,a),{seo:0,content:0,backlink:0,social:0,ads:0}),[items]);
  return <section className="growth-console">
    <div className="growth-heading"><div><p className="eyebrow">VibeLytix Autonomous Growth OS</p><h2>Monitoring-only growth pipeline.</h2><p>The daily cron creates the plan and executes publishing, distribution, outreach, follow-ups and verification without approval clicks.</p></div><span className="growth-status status-published">Automatic</span></div>
    <div className="growth-channel-summary">{(Object.keys(counts) as Channel[]).map(c=><div key={c}><strong>{counts[c]}</strong><span>{channelLabels[c]}</span></div>)}</div>
    <div className="growth-safety-note"><strong>No manual queue:</strong><span>Status values below are execution logs. They cannot be edited from this dashboard.</span></div>
    {error?<p className="admin-error" role="alert">{error}</p>:null}{loading?<p className="growth-loading">Loading today’s execution plan…</p>:null}
    <div className="growth-item-list">{items.map(item=><article key={item.id} className="growth-item-card"><div className="growth-item-top"><span className={`growth-channel growth-${item.channel}`}>{channelLabels[item.channel]}</span><span className={`growth-status status-${item.status}`}>{item.status}</span><span className="growth-priority">Priority {item.priority}</span></div><h3>{item.title}</h3><p className="growth-objective">{item.objective}</p><a href={item.target_url} target="_blank" rel="noreferrer">{item.target_url}</a><pre>{item.content}</pre></article>)}</div>
    {!loading&&items.length===0?<div className="dashboard-empty"><h3>Waiting for the scheduled pipeline</h3><p>The autonomous cron will create and execute today’s plan. No approval or generation button is required.</p></div>:null}
  </section>;
}
