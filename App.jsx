import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabaseClient'

// ─── DATOS DEL ÁLBUM ───────────────────────────────────────────────────────────
const TEAMS = [
  { code:"MEX", name:"Mexico",             group:"A", flag:"🇲🇽" },
  { code:"RSA", name:"South Africa",       group:"A", flag:"🇿🇦" },
  { code:"KOR", name:"Korea Republic",     group:"A", flag:"🇰🇷" },
  { code:"CZE", name:"Czechia",            group:"A", flag:"🇨🇿" },
  { code:"CAN", name:"Canada",             group:"B", flag:"🇨🇦" },
  { code:"BIH", name:"Bosnia-Herzegovina", group:"B", flag:"🇧🇦" },
  { code:"QAT", name:"Qatar",              group:"B", flag:"🇶🇦" },
  { code:"SUI", name:"Switzerland",        group:"B", flag:"🇨🇭" },
  { code:"BRA", name:"Brazil",             group:"C", flag:"🇧🇷" },
  { code:"MAR", name:"Morocco",            group:"C", flag:"🇲🇦" },
  { code:"HAI", name:"Haiti",              group:"C", flag:"🇭🇹" },
  { code:"SCO", name:"Scotland",           group:"C", flag:"🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  { code:"USA", name:"USA",                group:"D", flag:"🇺🇸" },
  { code:"PAR", name:"Paraguay",           group:"D", flag:"🇵🇾" },
  { code:"AUS", name:"Australia",          group:"D", flag:"🇦🇺" },
  { code:"TUR", name:"Türkiye",            group:"D", flag:"🇹🇷" },
  { code:"GER", name:"Germany",            group:"E", flag:"🇩🇪" },
  { code:"CUW", name:"Curaçao",            group:"E", flag:"🇨🇼" },
  { code:"CIV", name:"Côte d'Ivoire",      group:"E", flag:"🇨🇮" },
  { code:"ECU", name:"Ecuador",            group:"E", flag:"🇪🇨" },
  { code:"NED", name:"Netherlands",        group:"F", flag:"🇳🇱" },
  { code:"JPN", name:"Japan",              group:"F", flag:"🇯🇵" },
  { code:"SWE", name:"Sweden",             group:"F", flag:"🇸🇪" },
  { code:"TUN", name:"Tunisia",            group:"F", flag:"🇹🇳" },
  { code:"BEL", name:"Belgium",            group:"G", flag:"🇧🇪" },
  { code:"EGY", name:"Egypt",              group:"G", flag:"🇪🇬" },
  { code:"IRN", name:"IR Iran",            group:"G", flag:"🇮🇷" },
  { code:"NZL", name:"New Zealand",        group:"G", flag:"🇳🇿" },
  { code:"ESP", name:"Spain",              group:"H", flag:"🇪🇸" },
  { code:"CPV", name:"Cabo Verde",         group:"H", flag:"🇨🇻" },
  { code:"KSA", name:"Saudi Arabia",       group:"H", flag:"🇸🇦" },
  { code:"URU", name:"Uruguay",            group:"H", flag:"🇺🇾" },
  { code:"FRA", name:"France",             group:"I", flag:"🇫🇷" },
  { code:"SEN", name:"Senegal",            group:"I", flag:"🇸🇳" },
  { code:"IRQ", name:"Iraq",               group:"I", flag:"🇮🇶" },
  { code:"NOR", name:"Norway",             group:"I", flag:"🇳🇴" },
  { code:"ARG", name:"Argentina",          group:"J", flag:"🇦🇷" },
  { code:"ALG", name:"Algeria",            group:"J", flag:"🇩🇿" },
  { code:"AUT", name:"Austria",            group:"J", flag:"🇦🇹" },
  { code:"JOR", name:"Jordan",             group:"J", flag:"🇯🇴" },
  { code:"POR", name:"Portugal",           group:"K", flag:"🇵🇹" },
  { code:"COD", name:"Congo DR",           group:"K", flag:"🇨🇩" },
  { code:"UZB", name:"Uzbekistan",         group:"K", flag:"🇺🇿" },
  { code:"COL", name:"Colombia",           group:"K", flag:"🇨🇴" },
  { code:"ENG", name:"England",            group:"L", flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { code:"CRO", name:"Croatia",            group:"L", flag:"🇭🇷" },
  { code:"GHA", name:"Ghana",              group:"L", flag:"🇬🇭" },
  { code:"PAN", name:"Panama",             group:"L", flag:"🇵🇦" },
]

const SECTIONS = [
  { code:"FWC", name:"FIFA World Cup", total:20, group:null, flag:"🏆" },
  ...TEAMS.map(t => ({ code:t.code, name:t.name, total:20, group:t.group, flag:t.flag })),
  { code:"CC",  name:"Coca-Cola",      total:14, group:null, flag:"🥤" },
]

function buildStickers() {
  const list = []
  Array.from({length:20},(_,i)=>i).forEach(n => list.push({id:`FWC-${n}`,section:"FWC",num:n}))
  TEAMS.forEach(t => Array.from({length:20},(_,i)=>i+1).forEach(n => list.push({id:`${t.code}-${n}`,section:t.code,num:n})))
  Array.from({length:14},(_,i)=>i+1).forEach(n => list.push({id:`CC-${n}`,section:"CC",num:n}))
  return list
}

const ALL    = buildStickers()
const GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"]

// ─── HELPERS ───────────────────────────────────────────────────────────────────
function stickerCfg(st) {
  if (st===0) return { bg:"#f1f5f9", text:"#94a3b8", sub:"#cbd5e1", label:null }
  if (st===1) return { bg:"#166534", text:"#ffffff", sub:"#86efac", label:null }
  if (st===2) return { bg:"#E8A020", text:"#ffffff", sub:"#fef3c7", label:"×2"  }
  if (st===3) return { bg:"#E8572A", text:"#ffffff", sub:"#ffedd5", label:"×3"  }
  return             { bg:"#C0392B", text:"#ffffff", sub:"#ffe4e6", label:"×4"  }
}

function buildShareText(type, states) {
  const secList = [
    { code:"FWC", flag:"🏆", nums:Array.from({length:20},(_,i)=>i) },
    ...TEAMS.map(t=>({ code:t.code, flag:t.flag, nums:Array.from({length:20},(_,i)=>i+1) })),
    { code:"CC",  flag:"🥤", nums:Array.from({length:14},(_,i)=>i+1) },
  ]
  if (type==="missing") {
    const rows = secList.map(s=>({...s,miss:s.nums.filter(n=>!(states[`${s.code}-${n}`]>=1))})).filter(s=>s.miss.length>0).map(s=>`${s.flag} *${s.code}* (${s.miss.length}): ${s.miss.join(", ")}`)
    const total = secList.flatMap(s=>s.nums.filter(n=>!(states[`${s.code}-${n}`]>=1))).length
    return `⚽ *FIFA World Cup 2026 – Faltantes*\n📋 Total: ${total}\n\n${rows.join("\n")}`
  } else {
    const rows = secList.map(s=>({...s,reps:s.nums.filter(n=>(states[`${s.code}-${n}`]??0)>=2).map(n=>`${n}×${states[`${s.code}-${n}`]}`)})).filter(s=>s.reps.length>0).map(s=>`${s.flag} *${s.code}* (${s.reps.length}): ${s.reps.join(", ")}`)
    const total = secList.flatMap(s=>s.nums.filter(n=>(states[`${s.code}-${n}`]??0)>=2)).length
    return `⚽ *FIFA World Cup 2026 – Repetidas*\n🔁 Total: ${total}\n\n${rows.join("\n")}`
  }
}

// ─── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [loading,          setLoading]          = useState(true)
  const [session,          setSession]          = useState(null)
  const [emailInput,       setEmailInput]       = useState('')
  const [albums,           setAlbums]           = useState([])
  const [activeAlbumId,    setActiveAlbumId]    = useState('')
  const [newAlbumName,     setNewAlbumName]     = useState('')
  const [showAlbumMgr,     setShowAlbumMgr]     = useState(false)
  const [showImport,       setShowImport]       = useState(false)
  const [importTarget,     setImportTarget]     = useState('')
  const [importCode,       setImportCode]       = useState('')
  const [states,           setStates]           = useState({})
  const [filter,           setFilter]           = useState("all")
  const [activeSection,    setActiveSection]    = useState(null)
  const [search,           setSearch]           = useState("")
  const [showShare,        setShowShare]        = useState(false)
  const [showStats,        setShowStats]        = useState(false)

  // ── AUTH ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem('panini_email')
    if (saved) {
      setSession({ email: saved })
      fetchAlbums(saved)
    } else {
      setLoading(false)
    }
  }, [])

  // ── SUPABASE ────────────────────────────────────────────────────────────────
  const fetchAlbums = async (userId) => {
    setLoading(true)
    try {
      let { data } = await supabase.from('albums').select('*').eq('user_id', userId).order('created_at')
      if (!data?.length) {
        const { data: created } = await supabase.from('albums').insert([{ user_id:userId, name:'Mi Álbum' }]).select()
        data = created
      }
      setAlbums(data)
      setActiveAlbumId(data[0].id)
      await loadStickers(data[0].id)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  const loadStickers = async (albumId) => {
    const { data } = await supabase.from('stickers').select('sticker_id,state').eq('album_id', albumId)
    if (data) {
      const dict = {}
      data.forEach(r => { if (r.state > 0) dict[r.sticker_id] = r.state })
      setStates(dict)
    }
  }

  useEffect(() => { if (activeAlbumId) loadStickers(activeAlbumId) }, [activeAlbumId])

  const handleLogin = async (e) => {
    e.preventDefault()
    const email = emailInput.trim().toLowerCase()
    if (!email) return
    setLoading(true)
    try {
      let { data } = await supabase.from('albums').select('*').eq('user_id', email).order('created_at')
      if (!data?.length) {
        const { data: created } = await supabase.from('albums').insert([{ user_id:email, name:'Mi Álbum' }]).select()
        data = created
      }
      localStorage.setItem('panini_email', email)
      setSession({ email })
      setAlbums(data)
      setActiveAlbumId(data[0].id)
      await loadStickers(data[0].id)
    } catch(e) { console.error(e); alert("Error conectando con Supabase.") }
    finally { setLoading(false) }
  }

  const handleLogout = () => {
    localStorage.removeItem('panini_email')
    setSession(null); setAlbums([]); setActiveAlbumId(''); setStates({})
  }

  const handleCreateAlbum = async (e) => {
    e.preventDefault()
    if (!newAlbumName.trim()) return
    const { data } = await supabase.from('albums').insert([{ user_id:session.email, name:newAlbumName }]).select()
    if (data) { setAlbums(prev=>[...prev,data[0]]); setNewAlbumName('') }
  }

  const handleDeleteAlbum = async (id, name) => {
    if (albums.length <= 1) return alert("No puedes borrar tu único álbum.")
    if (!confirm(`¿Borrar "${name}"?`)) return
    await supabase.from('stickers').delete().eq('album_id', id)
    await supabase.from('albums').delete().eq('id', id)
    const rest = albums.filter(a=>a.id!==id)
    setAlbums(rest)
    if (activeAlbumId===id) setActiveAlbumId(rest[0].id)
  }

  const handleImport = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const parsed = JSON.parse(atob(importCode.trim()))
      await supabase.from('stickers').delete().eq('album_id', importTarget)
      const rows = Object.entries(parsed).filter(([_,v])=>v>0).map(([k,v])=>({ album_id:importTarget, sticker_id:k, state:Math.min(v,4) }))
      if (rows.length) await supabase.from('stickers').insert(rows)
      if (importTarget===activeAlbumId) await loadStickers(activeAlbumId)
      alert(`✓ ${rows.length} láminas importadas.`)
      setImportCode(''); setShowImport(false)
    } catch { alert("Código inválido.") }
    finally { setLoading(false) }
  }

  const toggle = useCallback(async (id) => {
    if (!activeAlbumId) return
    const cur = states[id] ?? 0
    const nxt = cur >= 4 ? 0 : cur + 1
    setStates(prev => { const u={...prev,[id]:nxt}; if(nxt===0) delete u[id]; return u })
    await supabase.from('stickers').upsert({ album_id:activeAlbumId, sticker_id:id, state:nxt }, { onConflict:'album_id,sticker_id' })
  }, [states, activeAlbumId])

  const selectSection = useCallback((code) => { setActiveSection(code); setFilter("all"); setSearch("") }, [])
  const goBack = useCallback(() => setActiveSection(null), [])

  const getCounts = (code) => {
    const ss = ALL.filter(s=>s.section===code)
    return {
      have:    ss.filter(s=>(states[s.id]??0)>=1).length,
      missing: ss.filter(s=>!((states[s.id]??0)>=1)).length,
      repeat:  ss.filter(s=>(states[s.id]??0)>=2).length,
      total:   ss.length,
    }
  }

  const gHave    = ALL.filter(s=>(states[s.id]??0)>=1).length
  const gRepeat  = ALL.filter(s=>(states[s.id]??0)>=2).length
  const gMissing = ALL.filter(s=>!((states[s.id]??0)>=1)).length
  const gTotal   = ALL.length
  const pct      = Math.round((gHave/gTotal)*100)||0

  // ── VIEWS ───────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3 animate-bounce">⚽</div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Cargando...</p>
      </div>
    </div>
  )

  if (!session) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center">
        <div className="text-5xl mb-2">⚽</div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Panini Tracker</h1>
        <p className="text-xs text-slate-400 mt-1 mb-6">FIFA World Cup 2026</p>
        <form onSubmit={handleLogin} className="space-y-3">
          <input type="email" placeholder="tu@correo.com" value={emailInput} onChange={e=>setEmailInput(e.target.value)} required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-center outline-none placeholder-slate-300 focus:border-slate-400"/>
          <button type="submit" className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm active:scale-95 transition-all">
            Entrar →
          </button>
        </form>
        <p className="text-[10px] text-slate-400 mt-4">Tu progreso se guarda en la nube</p>
      </div>
    </div>
  )

  // Import modal
  const ImportModal = showImport && (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-1">⚡ Importar backup</h3>
        <p className="text-[11px] text-slate-400 mb-4">Pega tu código Base64 para restaurar este álbum.</p>
        <form onSubmit={handleImport} className="space-y-3">
          <textarea rows={5} value={importCode} onChange={e=>setImportCode(e.target.value)} required
            autoCapitalize="none" autoCorrect="off" spellCheck={false}
            placeholder="Pega el código aquí..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-[10px] font-mono outline-none focus:border-slate-400 resize-none placeholder-slate-300"/>
          <div className="flex gap-2 justify-end text-xs font-bold">
            <button type="button" onClick={()=>setShowImport(false)} className="px-4 py-2 rounded-xl text-slate-400">Cancelar</button>
            <button type="submit" className="px-5 py-2 bg-slate-900 text-white rounded-xl active:scale-95">Cargar</button>
          </div>
        </form>
      </div>
    </div>
  )

  // Album manager
  if (showAlbumMgr) return (
    <div className="min-h-screen bg-slate-50">
      {ImportModal}
      <div className="bg-white border-b border-slate-200 px-4 pt-5 pb-4 flex items-center justify-between sticky top-0 shadow-sm">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-0.5">Configuración</p>
          <h2 className="text-base font-extrabold text-slate-900">Mis Álbumes</h2>
        </div>
        <button onClick={()=>setShowAlbumMgr(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 font-bold">✕</button>
      </div>
      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Nueva colección</h3>
          <form onSubmit={handleCreateAlbum} className="flex gap-2">
            <input type="text" placeholder="Nombre del álbum" value={newAlbumName} onChange={e=>setNewAlbumName(e.target.value)} required
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-slate-400"/>
            <button type="submit" className="bg-slate-900 text-white font-bold text-sm px-4 py-2 rounded-xl active:scale-95">Crear</button>
          </form>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Álbumes activos</h3>
          <div className="space-y-2">
            {albums.map(a => {
              const active = a.id===activeAlbumId
              return (
                <div key={a.id} className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${active?"bg-green-50 border-green-200":"bg-slate-50 border-slate-100"}`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-bold text-slate-800 truncate">{a.name}</span>
                    {active && <span className="bg-green-600 text-white text-[8px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0">Activo</span>}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {!active && <button onClick={()=>{ setActiveAlbumId(a.id); setShowAlbumMgr(false) }} className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-1.5 rounded-lg">Activar</button>}
                    <button onClick={()=>{ setImportTarget(a.id); setShowImport(true) }} className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-1.5 rounded-lg">⚡ Import</button>
                    <button onClick={()=>handleDeleteAlbum(a.id,a.name)} className="bg-red-50 text-red-600 text-[10px] font-bold px-2.5 py-1.5 rounded-lg">🗑</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <p className="text-[10px] text-slate-400 text-center">{session.email}</p>
      </div>
    </div>
  )

  // Share view
  if (showShare) return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-white border-b border-slate-200 px-4 pt-5 pb-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-0.5">FIFA World Cup 2026</p>
          <h2 className="text-base font-extrabold text-slate-900">{showShare==="missing"?"Láminas Faltantes":"Láminas Repetidas"}</h2>
        </div>
        <button onClick={()=>setShowShare(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 font-bold">✕</button>
      </div>
      <div className="flex-1 overflow-auto px-4 py-4 pb-28 space-y-4">
        {SECTIONS.map(sec => {
          const filtered = ALL.filter(s=>s.section===sec.code&&(showShare==="missing"?(states[s.id]??0)===0:(states[s.id]??0)>=2))
          if (!filtered.length) return null
          return (
            <div key={sec.code} className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-100">
                <span className="text-lg">{sec.flag}</span>
                <span className="text-xs font-black text-slate-900 font-mono">{sec.code}</span>
                <span className="text-xs text-slate-400 truncate">— {sec.name}</span>
                <span className="ml-auto bg-slate-100 text-slate-600 font-mono text-[10px] font-bold px-2 py-0.5 rounded">{filtered.length}</span>
              </div>
              <div className="grid gap-2" style={{gridTemplateColumns:"repeat(auto-fill, minmax(54px, 1fr))"}}>
                {filtered.map(s => {
                  const cfg=stickerCfg(states[s.id]??0)
                  return (
                    <button key={s.id} onClick={()=>toggle(s.id)} style={{backgroundColor:cfg.bg,color:cfg.text,borderColor:cfg.bg}}
                      className="border-2 rounded-xl h-12 flex flex-col items-center justify-center active:scale-90 transition-all font-mono">
                      <span className="text-base font-bold leading-none">{s.num}</span>
                      {cfg.label&&<span className="text-[8px] font-bold" style={{color:cfg.sub}}>{cfg.label}</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      <div className="p-4 bg-white border-t border-slate-200 sticky bottom-0">
        <a href={`whatsapp://send?text=${encodeURIComponent(buildShareText(showShare,states))}`}
          className="w-full py-3.5 rounded-xl font-bold text-sm bg-[#25D366] text-white text-center flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
          💬 Enviar por WhatsApp
        </a>
      </div>
    </div>
  )

  // Section detail
  if (activeSection) {
    const sec     = SECTIONS.find(s=>s.code===activeSection)
    const stList  = ALL.filter(s=>s.section===activeSection)
    const shown   = stList.filter(s=>{ const st=states[s.id]??0; if(filter==="have") return st>=1; if(filter==="missing") return st===0; if(filter==="repeat") return st>=2; return true })
    const c       = getCounts(activeSection)
    const spct    = Math.round((c.have/sec.total)*100)
    const secIdx  = SECTIONS.findIndex(s=>s.code===activeSection)
    const prev    = secIdx>0 ? SECTIONS[secIdx-1] : null
    const next    = secIdx<SECTIONS.length-1 ? SECTIONS[secIdx+1] : null
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 pt-4 pb-3 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold">←</button>
            <span className="text-2xl">{sec.flag}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900 font-mono">{sec.code}</span>
                {sec.group && <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Grupo {sec.group}</span>}
              </div>
              <p className="text-xs text-slate-500 truncate">{sec.name}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-slate-900">{c.have}<span className="text-slate-400 font-normal">/{sec.total}</span></p>
              <p className="text-[10px] text-slate-400">{spct}%</p>
            </div>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3">
            <div className="h-full rounded-full transition-all duration-500" style={{width:`${spct}%`,backgroundColor:spct===100?"#5BAF48":"#2E5FA3"}}/>
          </div>
          <div className="flex gap-1">
            {[["all","Todas"],["have","Tengo"],["missing","Faltan"],["repeat","Repet."]].map(([k,l])=>(
              <button key={k} onClick={()=>setFilter(k)}
                className={`flex-1 text-[10px] py-1.5 rounded-lg font-bold uppercase tracking-wide transition-all ${filter===k?"bg-slate-900 text-white":"bg-slate-100 text-slate-500"}`}>{l}</button>
            ))}
          </div>
        </div>
        <div className="px-3 pt-3 pb-4">
          <div className="grid gap-2.5" style={{gridTemplateColumns:"repeat(auto-fill, minmax(62px, 1fr))"}}>
            {shown.map(s => {
              const cfg=stickerCfg(states[s.id]??0)
              return (
                <button key={s.id} onClick={()=>toggle(s.id)} style={{backgroundColor:cfg.bg,color:cfg.text,borderColor:cfg.bg}}
                  className="border-2 rounded-xl h-16 flex flex-col items-center justify-center active:scale-90 transition-all">
                  <span className="text-[9px] font-semibold font-mono" style={{color:cfg.sub}}>{s.section}</span>
                  <span className="text-xl font-bold leading-none font-mono">{s.num}</span>
                  {cfg.label&&<span className="text-[9px] font-bold" style={{color:cfg.sub}}>{cfg.label}</span>}
                </button>
              )
            })}
          </div>
        </div>
        <div className="flex gap-2 px-3 pb-6">
          {prev ? (
            <button onClick={()=>selectSection(prev.code)} className="flex-1 bg-white border border-slate-200 rounded-xl py-2.5 px-3 flex items-center gap-2 shadow-sm active:scale-[0.98]">
              <span className="text-slate-400 text-xs">←</span>
              <span className="text-lg">{prev.flag}</span>
              <span className="text-xs font-bold text-slate-700 font-mono">{prev.code}</span>
            </button>
          ) : <div className="flex-1"/>}
          {next ? (
            <button onClick={()=>selectSection(next.code)} className="flex-1 bg-white border border-slate-200 rounded-xl py-2.5 px-3 flex items-center justify-end gap-2 shadow-sm active:scale-[0.98]">
              <span className="text-xs font-bold text-slate-700 font-mono">{next.code}</span>
              <span className="text-lg">{next.flag}</span>
              <span className="text-slate-400 text-xs">→</span>
            </button>
          ) : <div className="flex-1"/>}
        </div>
      </div>
    )
  }

  // Global stats
  if (showStats) {
    const R=76, SW=16, C=2*Math.PI*R
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="bg-white border-b border-slate-200 px-4 pt-5 pb-4 flex items-center justify-between sticky top-0 shadow-sm">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-0.5">Análisis</p>
            <h2 className="text-base font-extrabold text-slate-900">Estado General</h2>
          </div>
          <button onClick={()=>setShowStats(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 font-bold">✕</button>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-4 max-w-2xl mx-auto w-full">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col items-center">
            <svg width="200" height="200" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r={R} fill="none" stroke="#E2E8F0" strokeWidth={SW}/>
              <circle cx="100" cy="100" r={R} fill="none" stroke="#E8A020" strokeWidth={SW}
                strokeDasharray={C} strokeDashoffset={C*(1-gHave/gTotal)} transform="rotate(-90 100 100)"
                style={{transition:"stroke-dashoffset 0.8s ease"}}/>
              <circle cx="100" cy="100" r={R} fill="none" stroke="#5BAF48" strokeWidth={SW}
                strokeDasharray={C} strokeDashoffset={C*(1-(gHave-gRepeat)/gTotal)} transform="rotate(-90 100 100)"
                style={{transition:"stroke-dashoffset 0.8s ease"}}/>
              <text x="100" y="92"  textAnchor="middle" fontSize="34" fontWeight="800" fill="#0F172A" fontFamily="'Plus Jakarta Sans',sans-serif">{pct}%</text>
              <text x="100" y="112" textAnchor="middle" fontSize="10" fontWeight="700" fill="#94A3B8" fontFamily="'Plus Jakarta Sans',sans-serif" letterSpacing="2">COMPLETADO</text>
              <text x="100" y="128" textAnchor="middle" fontSize="10" fill="#CBD5E1" fontFamily="monospace">{gHave} / {gTotal}</text>
            </svg>
            <div className="flex gap-6 mt-2">
              {[["#5BAF48",gHave-gRepeat,"Tengo"],["#E8A020",gRepeat,"Repet."],["#E2E8F0",gMissing,"Faltan"]].map(([color,val,lbl])=>(
                <div key={lbl} className="flex flex-col items-center gap-1">
                  <div className="w-3 h-3 rounded-sm" style={{backgroundColor:color,border:color==="#E2E8F0"?"1px solid #CBD5E1":"none"}}/>
                  <span className="text-sm font-extrabold text-slate-800">{val}</span>
                  <span className="text-[9px] uppercase tracking-wide text-slate-400 font-bold">{lbl}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-3">994 láminas · orden del álbum</p>
            <div className="flex flex-wrap gap-[3px]">
              {ALL.map(s => {
                const st=states[s.id]??0
                return <div key={s.id} className="w-2 h-2 rounded-sm" style={{backgroundColor:st>=2?"#E8A020":st===1?"#5BAF48":"#E2E8F0"}}/>
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── OVERVIEW (HOME) ──────────────────────────────────────────────────────────
  const sl = search.toLowerCase()
  return (
    <div className="min-h-screen bg-slate-50">
      {ImportModal}

      {/* Top bar */}
      <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <select value={activeAlbumId} onChange={e=>setActiveAlbumId(e.target.value)}
            className="bg-slate-800 text-white border border-slate-700 rounded-lg px-2 py-1 text-xs outline-none font-bold max-w-[160px]">
            {albums.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <button onClick={()=>setShowAlbumMgr(true)} className="bg-slate-800 text-emerald-400 text-[10px] font-bold px-2.5 py-1.5 rounded-lg">⚙ Álbumes</button>
        </div>
        <button onClick={handleLogout} className="text-slate-500 text-[10px] font-bold hover:text-white transition-colors">Salir ✕</button>
      </div>

      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">

        {/* Mobile */}
        <div className="md:hidden">
          <div className="px-4 pt-4 pb-3 border-b border-slate-100">
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-400 mb-1">Panini · Sticker Album</p>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">FIFA World Cup 2026</h1>
          </div>
          <div className="px-4 pt-3 pb-3">
            <div className="flex gap-2 mb-2.5">
              {[[null,gHave,"TENGO","#2E5FA3"],["text-slate-500",gMissing,"FALTAN",null],["text-amber-700",gRepeat,"REPET.",null]].map(([cls,val,lbl,hex])=>(
                <div key={lbl} className="flex-1 py-1.5 text-center bg-slate-50 rounded-xl border border-slate-200">
                  <p className={`text-base font-extrabold tabular-nums ${cls||""}`} style={hex?{color:hex}:{}}>{val}</p>
                  <p className="text-[9px] uppercase tracking-[0.12em] text-slate-400 font-bold mt-0.5">{lbl}</p>
                </div>
              ))}
              <button onClick={()=>setShowStats(true)} className="flex-1 py-1.5 flex flex-col items-center bg-slate-50 rounded-xl border border-slate-200 active:opacity-70">
                <p className="text-base font-extrabold leading-none" style={{color:"#5BAF48"}}>{pct}%</p>
                <div className="w-10 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1.5">
                  <div className="h-full rounded-full" style={{width:`${pct}%`,backgroundColor:"#5BAF48"}}/>
                </div>
                <p className="text-[9px] uppercase tracking-[0.12em] text-slate-400 font-bold mt-1">TOTAL</p>
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1.5 mb-2.5">
              {[
                {label:"Guardar",icon:"↓",bg:"#2E5FA3",action:()=>{ const b64=btoa(JSON.stringify(states)); navigator.clipboard?.writeText(b64).then(()=>alert("Código copiado al portapapeles")).catch(()=>alert(b64)) }},
                {label:"Cargar", icon:"↑",bg:"#38A89E",action:()=>{ setImportTarget(activeAlbumId); setShowImport(true) }},
                {label:"Faltan", icon:"−",bg:"#E8572A",action:()=>setShowShare("missing")},
                {label:"Repet.", icon:"×",bg:"#6845A0",action:()=>setShowShare("repeat")},
              ].map(b=>(
                <button key={b.label} onClick={b.action} style={{backgroundColor:b.bg}}
                  className="flex flex-col items-center justify-center py-2 rounded-xl text-white active:scale-95 active:opacity-90 transition-all shadow-sm">
                  <span className="text-sm font-bold leading-none mb-0.5">{b.icon}</span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/80">{b.label}</span>
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">⌕</span>
              <input type="text" placeholder="Buscar país o código..." value={search} onChange={e=>setSearch(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 text-sm rounded-xl pl-9 pr-3 py-2 outline-none border border-slate-200 focus:border-slate-400 placeholder-slate-300"/>
            </div>
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-4 px-6 py-3">
          <div className="shrink-0 pr-4 border-r border-slate-200">
            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400 leading-none mb-1">Panini · Sticker Album</p>
            <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">FIFA World Cup 2026</h1>
          </div>
          <div className="flex gap-2 shrink-0">
            {[[null,gHave,"TENGO","#2E5FA3"],["text-slate-500",gMissing,"FALTAN",null],["text-amber-700",gRepeat,"REPET.",null]].map(([cls,val,lbl,hex])=>(
              <div key={lbl} className="px-3 py-1.5 text-center bg-slate-50 rounded-lg border border-slate-200 min-w-[64px]">
                <p className={`text-sm font-extrabold tabular-nums ${cls||""}`} style={hex?{color:hex}:{}}>{val}</p>
                <p className="text-[8px] uppercase tracking-[0.12em] text-slate-400 font-bold">{lbl}</p>
              </div>
            ))}
            <button onClick={()=>setShowStats(true)} className="px-3 py-1.5 flex flex-col items-center bg-slate-50 rounded-lg border border-slate-200 min-w-[64px] active:opacity-70">
              <p className="text-sm font-extrabold leading-none" style={{color:"#5BAF48"}}>{pct}%</p>
              <div className="w-10 h-1 bg-slate-200 rounded-full overflow-hidden mt-1">
                <div className="h-full rounded-full" style={{width:`${pct}%`,backgroundColor:"#5BAF48"}}/>
              </div>
              <p className="text-[8px] uppercase tracking-[0.12em] text-slate-400 font-bold mt-0.5">TOTAL</p>
            </button>
          </div>
          <div className="flex gap-1.5 shrink-0 pl-2 border-l border-slate-200">
            {[
              {label:"Guardar",icon:"↓",bg:"#2E5FA3",action:()=>{ const b64=btoa(JSON.stringify(states)); navigator.clipboard?.writeText(b64).then(()=>alert("Copiado")).catch(()=>alert(b64)) }},
              {label:"Cargar", icon:"↑",bg:"#38A89E",action:()=>{ setImportTarget(activeAlbumId); setShowImport(true) }},
              {label:"Faltan", icon:"−",bg:"#E8572A",action:()=>setShowShare("missing")},
              {label:"Repet.", icon:"×",bg:"#6845A0",action:()=>setShowShare("repeat")},
            ].map(b=>(
              <button key={b.label} onClick={b.action} style={{backgroundColor:b.bg}}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-bold active:scale-95 shadow-sm">
                <span className="text-sm leading-none">{b.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-wide">{b.label}</span>
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-[160px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">⌕</span>
            <input type="text" placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 text-sm rounded-lg pl-8 pr-3 py-1.5 outline-none border border-slate-200 focus:border-slate-400 placeholder-slate-300"/>
          </div>
        </div>
      </div>

      {/* Section grid */}
      <div className="px-3 py-3 md:px-6 md:py-5 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-4 md:items-start">
        {/* FWC */}
        {(!sl||"fwc".includes(sl)||"fifa world cup".includes(sl)) && (() => {
          const sec=SECTIONS[0], c=getCounts("FWC"), spct=Math.round((c.have/20)*100)
          return (
            <div className="mb-4 md:mb-0">
              <div className="flex items-center gap-2 mb-2 px-1"><span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">FIFA World Cup</span><div className="flex-1 h-px bg-slate-200"/></div>
              <SectionCard sec={sec} c={c} spct={spct} stickers={ALL.filter(s=>s.section==="FWC")} states={states} onSelect={selectSection}/>
            </div>
          )
        })()}

        {/* Groups */}
        {GROUPS.map(grp => {
          const gs = TEAMS.filter(t=>t.group===grp&&(!sl||t.code.toLowerCase().includes(sl)||t.name.toLowerCase().includes(sl)))
          if (!gs.length) return null
          const gt=gs.length*20, gh=gs.reduce((a,t)=>a+getCounts(t.code).have,0)
          return (
            <div key={grp} className="mb-4 md:mb-0">
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Grupo {grp}</span>
                <div className="flex-1 h-px bg-slate-200"/>
                <span className="text-[10px] text-slate-400">{gh}/{gt}</span>
              </div>
              <div className="space-y-1.5">
                {gs.map(t => {
                  const sec=SECTIONS.find(s=>s.code===t.code), c=getCounts(t.code), spct=Math.round((c.have/20)*100)
                  return <SectionCard key={t.code} sec={sec} c={c} spct={spct} stickers={ALL.filter(s=>s.section===t.code)} states={states} onSelect={selectSection}/>
                })}
              </div>
            </div>
          )
        })}

        {/* CC */}
        {(!sl||"cc".includes(sl)||"coca-cola".includes(sl)) && (() => {
          const sec=SECTIONS[SECTIONS.length-1], c=getCounts("CC"), spct=Math.round((c.have/14)*100)
          return (
            <div className="mb-4 md:mb-0">
              <div className="flex items-center gap-2 mb-2 px-1"><span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Coca-Cola</span><div className="flex-1 h-px bg-slate-200"/></div>
              <SectionCard sec={sec} c={c} spct={spct} stickers={ALL.filter(s=>s.section==="CC")} states={states} onSelect={selectSection}/>
            </div>
          )
        })()}
      </div>
      <div className="pb-8 text-center pt-2">
        <p className="text-[10px] text-slate-300 font-medium">Desarrollado por Cristian Jaramillo</p>
      </div>
    </div>
  )
}

// ─── SECTION CARD ───────────────────────────────────────────────────────────────
function SectionCard({ sec, c, spct, stickers, states, onSelect }) {
  const done    = spct===100
  const doneBg  = sec.code==="FWC" ? "#B8940A" : sec.code==="CC" ? "#C0392B" : "#166534"
  const style   = done ? { backgroundColor:doneBg } : {}
  const card    = `w-full flex flex-col rounded-xl px-3 pt-2.5 pb-2 border shadow-sm text-left active:scale-[0.98] transition-all ${done?"border-0":"bg-white border-slate-200"}`
  const trackBg = done ? "rgba(255,255,255,0.25)" : "#f1f5f9"
  const barFill = done ? "rgba(255,255,255,0.9)"  : "#5BAF48"

  return (
    <button onClick={()=>onSelect(sec.code)} className={card} style={style}>
      <div className="flex items-center gap-3 w-full mb-1.5">
        <span className="text-xl w-7 text-center shrink-0">{sec.flag}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-bold font-mono ${done?"text-white":"text-slate-900"}`}>{sec.code}</span>
            {c.repeat>0 && (
              <span className="text-[9px] font-bold rounded px-1" style={done?{background:"rgba(255,255,255,0.2)",color:"rgba(255,255,255,0.9)"}:{background:"#fef3c7",color:"#92400e",border:"1px solid #fcd34d"}}>{c.repeat} rep</span>
            )}
          </div>
          <p className={`text-[11px] truncate leading-tight ${done?"text-white/80":"text-slate-600"}`}>{sec.name}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-14 h-2 rounded-full overflow-hidden" style={{backgroundColor:trackBg}}>
            <div className="h-full rounded-full transition-all duration-500" style={{width:`${spct}%`,backgroundColor:barFill}}/>
          </div>
          <span className={`text-xs font-bold w-9 text-right ${done?"text-white":"text-slate-700"}`}>
            {c.have}<span className={`font-normal ${done?"text-white/60":"text-slate-400"}`}>/{sec.total}</span>
          </span>
          <span className={`text-sm ${done?"text-white/50":"text-slate-300"}`}>›</span>
        </div>
      </div>
      <div className="flex gap-[3px] flex-wrap pl-10">
        {stickers.map(s => {
          const st=states[s.id]??0
          const dotColor = st>=2 ? (done?"rgba(255,255,255,0.65)":"#E8A020") : st===1 ? (done?"rgba(255,255,255,0.95)":"#5BAF48") : (done?"rgba(255,255,255,0.2)":"#E2E8F0")
          return <div key={s.id} className="w-1.5 h-1.5 rounded-sm" style={{backgroundColor:dotColor}}/>
        })}
      </div>
    </button>
  )
}
