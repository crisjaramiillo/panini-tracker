import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';

const TEAMS = [
  { code: "MEX", name: "Mexico",             group: "A", flag: "🇲🇽" },
  { code: "RSA", name: "South Africa",       group: "A", flag: "🇿🇦" },
  { code: "KOR", name: "Korea Republic",     group: "A", flag: "🇰🇷" },
  { code: "CZE", name: "Czechia",            group: "A", flag: "🇨🇿" },
  { code: "CAN", name: "Canada",             group: "B", flag: "🇨🇦" },
  { code: "BIH", name: "Bosnia-Herzegovina", group: "B", flag: "🇧🇦" },
  { code: "QAT", name: "Qatar",              group: "B", flag: "🇶🇦" },
  { code: "SUI", name: "Switzerland",        group: "B", flag: "🇨🇭" },
  { code: "BRA", name: "Brazil",             group: "C", flag: "🇧🇷" },
  { code: "MAR", name: "Morocco",            group: "C", flag: "🇲🇦" },
  { code: "HAI", name: "Haiti",              group: "C", flag: "🇭🇹" },
  { code: "SCO", name: "Scotland",           group: "C", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  { code: "USA", name: "USA",                group: "D", flag: "🇺🇸" },
  { code: "PAR", name: "Paraguay",           group: "D", flag: "🇵🇾" },
  { code: "AUS", name: "Australia",          group: "D", flag: "🇦🇺" },
  { code: "TUR", name: "Türkiye",            group: "D", flag: "🇹🇷" },
  { code: "GER", name: "Germany",            group: "E", flag: "🇩🇪" },
  { code: "CUW", name: "Curaçao",            group: "E", flag: "🇨🇼" },
  { code: "CIV", name: "Côte d'Ivoire",      group: "E", flag: "🇨🇮" },
  { code: "ECU", name: "Ecuador",            group: "E", flag: "🇪🇨" },
  { code: "NED", name: "Netherlands",        group: "F", flag: "🇳🇱" },
  { code: "JPN", name: "Japan",              group: "F", flag: "🇯🇵" },
  { code: "SWE", name: "Sweden",             group: "F", flag: "🇸🇪" },
  { code: "TUN", name: "Tunisia",            group: "F", flag: "🇹🇳" },
  { code: "BEL", name: "Belgium",            group: "G", flag: "🇧🇪" },
  { code: "EGY", name: "Egypt",              group: "G", flag: "🇪🇬" },
  { code: "IRN", name: "IR Iran",            group: "G", flag: "🇮🇷" },
  { code: "NZL", name: "New Zealand",        group: "G", flag: "🇳🇿" },
  { code: "ESP", name: "Spain",              group: "H", flag: "🇪🇸" },
  { code: "CPV", name: "Cabo Verde",         group: "H", flag: "🇨🇻" },
  { code: "KSA", name: "Saudi Arabia",       group: "H", flag: "🇸🇦" },
  { code: "URU", name: "Uruguay",            group: "H", flag: "🇺🇾" },
  { code: "FRA", name: "France",             group: "I", flag: "🇫🇷" },
  { code: "SEN", name: "Senegal",            group: "I", flag: "🇸🇳" },
  { code: "IRQ", name: "Iraq",               group: "I", flag: "🇮🇶" },
  { code: "NOR", name: "Norway",             group: "I", flag: "🇳🇴" },
  { code: "ARG", name: "Argentina",          group: "J", flag: "🇦🇷" },
  { code: "ALG", name: "Algeria",            group: "J", flag: "🇩🇿" },
  { code: "AUT", name: "Austria",            group: "J", flag: "🇦🇹" },
  { code: "JOR", name: "Jordan",             group: "J", flag: "🇯🇴" },
  { code: "POR", name: "Portugal",           group: "K", flag: "🇵🇹" },
  { code: "COD", name: "Congo DR",           group: "K", flag: "🇨🇩" },
  { code: "UZB", name: "Uzbekistan",         group: "K", flag: "🇺🇿" },
  { code: "COL", name: "Colombia",           group: "K", flag: "🇨🇴" },
  { code: "ENG", name: "England",            group: "L", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { code: "CRO", name: "Croatia",            group: "L", flag: "🇭🇷" },
  { code: "GHA", name: "Ghana",              group: "L", flag: "🇬🇭" },
  { code: "PAN", name: "Panama",             group: "L", flag: "🇵🇦" },
];

const SECTIONS = [{ code: "FWC", name: "FIFA World Cup", total: 20, group: null, flag: "🏆" }]
  .concat(TEAMS.map(t => ({ code: t.code, name: t.name, total: 20, group: t.group, flag: t.flag })))
  .concat([{ code: "CC", name: "Coca-Cola", total: 14, group: null, flag: "🥤" }]);

function buildStickers() {
  let list = [];
  Array.from({ length: 20 }, (_, i) => i).forEach(n => list.push({ id: `FWC-${n}`, section: "FWC", num: n }));
  TEAMS.forEach(t => {
    Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => list.push({ id: `${t.code}-${n}`, section: t.code, num: n }));
  });
  Array.from({ length: 14 }, (_, i) => i + 1).forEach(n => list.push({ id: `CC-${n}`, section: "CC", num: n }));
  return list;
}

const ALL = buildStickers();
const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
const APP_FONT = { fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" };

function stickerCfg(st) {
  if (st === 0) return { bg: "#f1f5f9", text: "#94a3b8", sub: "#94a3b8", label: null };
  if (st === 1) return { bg: "#2E5FA3", text: "#ffffff", sub: "#93c5fd", label: null };
  if (st === 2) return { bg: "#E8A020", text: "#ffffff", sub: "#fef3c7", label: "×2" };
  if (st === 3) return { bg: "#E8572A", text: "#ffffff", sub: "#ffedd5", label: "×3" };
  return { bg: "#C0392B", text: "#ffffff", sub: "#ffe4e6", label: "×4" };
}

function buildShareText(type, states) {
  const secList = [{ code: "FWC", name: "FIFA World Cup", flag: "🏆", nums: Array.from({ length: 20 }, (_, i) => i) }]
    .concat(TEAMS.map(t => ({ code: t.code, name: t.name, flag: t.flag, nums: Array.from({ length: 20 }, (_, i) => i + 1) })))
    .concat([{ code: "CC", name: "Coca-Cola", flag: "🥤", nums: Array.from({ length: 14 }, (_, i) => i + 1) }]);

  if (type === "missing") {
    const rows = secList
      .map(s => ({ ...s, miss: s.nums.filter(n => !(states[`${s.code}-${n}`] >= 1)) }))
      .filter(s => s.miss.length > 0)
      .map(s => `${s.flag} *${s.code}* (${s.miss.length}): ${s.miss.join(", ")}`);
    const totalMiss = secList.flatMap(s => s.nums.filter(n => !(states[`${s.code}-${n}`] >= 1))).length;
    return "⚽ *FIFA World Cup 2026 – Faltantes*\n📋 Total: " + totalMiss + "\n\n" + rows.join("\n");
  } else {
    const rows = secList
      .map(s => ({ ...s, reps: s.nums.filter(n => (states[`${s.code}-${n}`] ?? 0) >= 2).map(n => `${n}×${states[`${s.code}-${n}`]}`) }))
      .filter(s => s.reps.length > 0)
      .map(s => `${s.flag} *${s.code}* (${s.reps.length}): ${s.reps.join(", ")}`);
    const totalRep = secList.flatMap(s => s.nums.filter(n => (states[`${s.code}-${n}`] ?? 0) >= 2)).length;
    return "⚽ *FIFA World Cup 2026 – Repetidas*\n🔄 Total: " + totalRep + "\n\n" + rows.join("\n");
  }
}

export default function App() {
  const [session,              setSession]              = useState(null);
  const [emailInput,           setEmailInput]           = useState('');
  const [loading,              setLoading]              = useState(true);
  const [albums,               setAlbums]               = useState([]);
  const [activeAlbumId,        setActiveAlbumId]        = useState('');
  const [newAlbumName,         setNewAlbumName]         = useState('');
  const [showAlbumManager,     setShowAlbumManager]     = useState(false);
  const [showBase64Modal,      setShowBase64Modal]      = useState(false);
  const [targetPreloadAlbumId, setTargetPreloadAlbumId] = useState('');
  const [rawBase64Input,       setRawBase64Input]       = useState('');
  const [states,               setStates]               = useState({});
  const [filter,               setFilter]               = useState("all");
  const [activeSection,        setActiveSection]        = useState(null);
  const [search,               setSearch]               = useState("");
  const [showShare,            setShowShare]            = useState(false);
  const [showGlobalStats,      setShowGlobalStats]      = useState(false);

  // ── INIT ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const savedUser = localStorage.getItem('tracker_user_email');
    if (savedUser) {
      const cleanEmail = savedUser.trim().toLowerCase();
      setSession({ user: { email: cleanEmail, id: cleanEmail } });
      fetchAlbums(cleanEmail);
    } else {
      setLoading(false);
    }
  }, []);

  // ── DATA ───────────────────────────────────────────────────────────────────
  const fetchAlbums = async (userId) => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      let { data, error } = await supabase
        .from('albums').select('*').eq('user_id', userId).order('created_at', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        // INSERT separado del SELECT para evitar error 400
        await supabase.from('albums').insert([{ user_id: userId, name: 'Mi Álbum Principal' }]);
        const { data: fresh } = await supabase
          .from('albums').select('*').eq('user_id', userId).order('created_at', { ascending: true });
        data = fresh;
      }

      if (data && data.length > 0) {
        setAlbums(data);
        setActiveAlbumId(data[0].id);
        await fetchStickers(data[0].id);
      }
    } catch (e) {
      console.error("fetchAlbums error:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStickers = async (albumId) => {
    if (!albumId) return;
    try {
      const { data } = await supabase
        .from('stickers').select('sticker_id, state').eq('album_id', albumId);
      if (data) {
        const dict = {};
        data.forEach(row => { if (row.state > 0) dict[row.sticker_id] = row.state; });
        setStates(dict);
      }
    } catch (err) {
      console.error("fetchStickers error:", err);
    }
  };

  useEffect(() => {
    if (activeAlbumId) fetchStickers(activeAlbumId);
  }, [activeAlbumId]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail) return;
    setLoading(true);
    try {
      let { data } = await supabase
        .from('albums').select('*').eq('user_id', cleanEmail).order('created_at', { ascending: true });

      if (!data || data.length === 0) {
        await supabase.from('albums').insert([{ user_id: cleanEmail, name: 'Mi Álbum Principal' }]);
        const { data: fresh } = await supabase
          .from('albums').select('*').eq('user_id', cleanEmail).order('created_at', { ascending: true });
        data = fresh;
      }

      if (data && data.length > 0) {
        setAlbums(data);
        setActiveAlbumId(data[0].id);
        localStorage.setItem('tracker_user_email', cleanEmail);
        setSession({ user: { email: cleanEmail, id: cleanEmail } });
        await fetchStickers(data[0].id);
      } else {
        alert("Error al inicializar la base de datos.");
      }
    } catch (err) {
      console.error("handleEmailLogin error:", err);
      alert("Error de conexión con Supabase.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    if (!newAlbumName.trim() || !session?.user?.id) return;
    await supabase.from('albums').insert([{ user_id: session.user.id, name: newAlbumName }]);
    const { data } = await supabase
      .from('albums').select('*').eq('user_id', session.user.id).order('created_at', { ascending: true });
    if (data) { setAlbums(data); setActiveAlbumId(data[data.length - 1].id); setNewAlbumName(''); }
  };

  const handleDeleteAlbum = async (idToDelete, name) => {
    if (albums.length <= 1) { alert("No puedes borrar tu única colección activa."); return; }
    if (!confirm(`¿Estás seguro de borrar el álbum "${name}"?`)) return;
    await supabase.from('stickers').delete().eq('album_id', idToDelete);
    await supabase.from('albums').delete().eq('id', idToDelete);
    const updatedAlbums = albums.filter(a => a.id !== idToDelete);
    setAlbums(updatedAlbums);
    if (activeAlbumId === idToDelete) setActiveAlbumId(updatedAlbums[0].id);
  };

  const handleInjectBase64String = async (e) => {
    e.preventDefault();
    if (!rawBase64Input.trim() || !targetPreloadAlbumId) return;
    setLoading(true);
    try {
      const parsedJSON = JSON.parse(atob(rawBase64Input.trim()));
      await supabase.from('stickers').delete().eq('album_id', targetPreloadAlbumId);
      const insertPayload = Object.entries(parsedJSON)
        .filter(([_, state]) => state > 0)
        .map(([stickerId, state]) => ({
          album_id: targetPreloadAlbumId, sticker_id: stickerId, state: Math.min(state, 4)
        }));
      if (insertPayload.length > 0) {
        const { error } = await supabase.from('stickers').insert(insertPayload);
        if (error) throw error;
      }
      if (targetPreloadAlbumId === activeAlbumId) await fetchStickers(activeAlbumId);
      alert(`¡Listo! Se cargaron ${insertPayload.length} láminas.`);
      setRawBase64Input(''); setShowBase64Modal(false);
    } catch (err) {
      alert("Error: Base64 inválido."); console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const triggerBase64Popup = (albumId) => {
    setTargetPreloadAlbumId(albumId); setRawBase64Input(''); setShowBase64Modal(true);
  };

  const toggle = useCallback(async (id) => {
    if (!activeAlbumId) return;
    const cur = states[id] ?? 0;
    const nxt = cur >= 4 ? 0 : cur + 1;
    setStates(prev => { const upd = { ...prev, [id]: nxt }; if (nxt === 0) delete upd[id]; return upd; });
    await supabase.from('stickers')
      .upsert({ album_id: activeAlbumId, sticker_id: id, state: nxt }, { onConflict: 'album_id,sticker_id' });
  }, [states, activeAlbumId]);

  const selectSection = useCallback((code) => { setActiveSection(code); setFilter("all"); setSearch(""); }, []);
  const goBack = useCallback(() => { setActiveSection(null); }, []);

  const getCounts = (code) => {
    const ss = ALL.filter(s => s.section === code);
    return {
      have:    ss.filter(s => (states[s.id] ?? 0) >= 1).length,
      missing: ss.filter(s => !((states[s.id] ?? 0) >= 1)).length,
      repeat:  ss.filter(s => (states[s.id] ?? 0) >= 2).length,
      total:   ss.length,
    };
  };

  const handleLogout = () => {
    localStorage.removeItem('tracker_user_email');
    setSession(null); setEmailInput(''); setAlbums([]); setActiveAlbumId(''); setStates({});
  };

  const gHave    = ALL.filter(s => (states[s.id] ?? 0) >= 1).length;
  const gRepeat  = ALL.filter(s => (states[s.id] ?? 0) >= 2).length;
  const gMissing = ALL.filter(s => !((states[s.id] ?? 0) >= 1)).length;
  const gTotal   = ALL.length;
  const pct      = Math.round((gHave / gTotal) * 100) || 0;

  const grpSections = (code) => {
    const sec = SECTIONS.find(s => s.code === code);
    if (!sec || (search && !sec.code.toLowerCase().includes(search.toLowerCase()) && !sec.name.toLowerCase().includes(search.toLowerCase()))) return null;
    const c = getCounts(sec.code);
    const spct = Math.round((c.have / sec.total) * 100);
    const done = spct === 100;
    const doneBg = sec.code === "FWC" ? "#B8940A" : sec.code === "CC" ? "#C0392B" : "#3D8B30";
    const countryStickers = ALL.filter(s => s.section === sec.code);

    return (
      <button key={sec.code} onClick={() => selectSection(sec.code)}
        style={done ? { backgroundColor: doneBg } : {}}
        className={`w-full flex flex-col rounded-xl px-3 pt-2.5 pb-2 border shadow-sm text-left active:scale-[0.98] transition-all ${done ? "text-white border-0" : "bg-white border-slate-200"}`}>
        <div className="flex items-center gap-3 w-full mb-1.5">
          <span className="text-xl w-7 text-center shrink-0">{sec.flag}</span>
          <div className="flex-1 min-w-0">
            <span className={`text-xs font-bold font-mono ${done ? "text-white" : "text-slate-900"}`}>{sec.code}</span>
            <p className={`text-[11px] truncate leading-tight ${done ? "text-white/80" : "text-slate-600"}`}>{sec.name}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-14 h-2 rounded-full overflow-hidden" style={{ backgroundColor: done ? "rgba(255,255,255,0.25)" : "#f1f5f9" }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${spct}%`, backgroundColor: done ? "rgba(255,255,255,0.9)" : "#5BAF48" }} />
            </div>
            <span className={`text-xs w-9 text-right ${done ? "text-white font-bold" : "text-slate-700 font-bold"}`}>
              {c.have}<span className={done ? "text-white/60 font-normal" : "text-slate-400 font-normal"}>/{sec.total}</span>
            </span>
            <span className={`text-sm ${done ? "text-white/50" : "text-slate-300"}`}>›</span>
          </div>
        </div>
        <div className="flex gap-[3px] flex-wrap pl-10 w-full">
          {countryStickers.map(s => {
            const st = states[s.id] ?? 0;
            const dotColor = st >= 2
              ? (done ? "rgba(255,255,255,0.65)" : "#E8A020")
              : st === 1
              ? (done ? "rgba(255,255,255,0.95)" : "#5BAF48")
              : (done ? "rgba(255,255,255,0.2)" : "#E2E8F0");
            return <div key={s.id} className="w-1.5 h-1.5 rounded-sm shrink-0" style={{ backgroundColor: dotColor }} />;
          })}
        </div>
      </button>
    );
  };

  // ── VIEWS ──────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center" style={APP_FONT}>
      <div className="text-center">
        <div className="text-2xl mb-2 animate-bounce">⚽</div>
        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Sincronizando...</div>
      </div>
    </div>
  );

  if (!session) return (
    <div style={APP_FONT} className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center">
        <span className="text-3xl">⚽</span>
        <h2 className="text-xl font-black text-slate-900 mt-2">Panini Tracker</h2>
        <p className="text-xs text-slate-400 mt-1 mb-6">FIFA World Cup 2026</p>
        <form onSubmit={handleEmailLogin} className="space-y-3.5">
          <input type="email" placeholder="tu-correo@email.com" value={emailInput}
            onChange={e => setEmailInput(e.target.value)} required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-center outline-none placeholder-slate-300 focus:border-slate-400" />
          <button type="submit" className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm active:scale-95 transition-all">
            Ingresar 🚀
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div style={APP_FONT} className="select-none">
      <div id="app-frame" className="mx-auto">

        {/* Modal Base64 */}
        {showBase64Modal && (
          <div className="bg-slate-900/60 fixed inset-0 z-[60] flex items-center justify-center px-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl text-slate-800">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-1">⚡ Importar Backup</h3>
              <p className="text-[11px] text-slate-400 mb-4">Pega tu código Base64 para cargar este álbum.</p>
              <form onSubmit={handleInjectBase64String} className="space-y-4">
                <textarea rows={6} placeholder="Pega el código aquí..." value={rawBase64Input}
                  onChange={e => setRawBase64Input(e.target.value)} required
                  autoCapitalize="none" autoCorrect="off" spellCheck={false}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-[10px] font-mono outline-none focus:border-slate-400 placeholder-slate-300 resize-none" />
                <div className="flex gap-2 justify-end text-xs font-bold">
                  <button type="button" onClick={() => setShowBase64Modal(false)} className="px-4 py-2 rounded-xl text-slate-400">Cancelar</button>
                  <button type="submit" className="px-5 py-2 bg-slate-900 text-white rounded-xl active:scale-95 transition-all">Cargar ⚡</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Album Manager */}
        {showAlbumManager && (
          <div className="min-h-screen bg-slate-50 flex flex-col fixed inset-0 z-50 overflow-auto">
            <div className="bg-white border-b border-slate-200 px-4 pt-5 pb-4 flex items-center justify-between sticky top-0 shadow-sm">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-0.5">Configuración</p>
                <h2 className="text-base font-extrabold text-slate-900">Administrar Álbumes</h2>
              </div>
              <button onClick={() => setShowAlbumManager(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 font-bold">✕</button>
            </div>
            <div className="p-4 space-y-5 flex-1">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Crear Nueva Colección</h3>
                <form onSubmit={handleCreateAlbum} className="flex gap-2">
                  <input type="text" placeholder="Nombre del álbum" value={newAlbumName}
                    onChange={e => setNewAlbumName(e.target.value)} required
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-slate-400" />
                  <button type="submit" className="bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl active:scale-95">Agregar</button>
                </form>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">Mis Colecciones</h3>
                {albums.map(a => {
                  const isSelected = a.id === activeAlbumId;
                  return (
                    <div key={a.id} className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${isSelected ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-100"}`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-bold text-slate-800 truncate">{a.name}</span>
                        {isSelected && <span className="bg-emerald-500 text-white font-bold text-[8px] uppercase px-1.5 py-0.5 rounded shrink-0">Activo</span>}
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => triggerBase64Popup(a.id)} className="bg-blue-50 text-blue-700 font-bold text-[10px] uppercase px-2.5 py-1.5 rounded-lg">⚡ Import</button>
                        <button onClick={() => handleDeleteAlbum(a.id, a.name)} className="bg-red-50 text-red-600 font-bold text-[10px] px-2.5 py-1.5 rounded-lg">🗑️</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Share view */}
        {(showShare === "missing" || showShare === "repeat") && (
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <div className="bg-white border-b border-slate-200 px-4 pt-5 pb-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-0.5">FIFA World Cup 2026</p>
                <h2 className="text-base font-extrabold text-slate-900">
                  {showShare === "missing" ? "Láminas Faltantes" : "Láminas Repetidas"}
                </h2>
              </div>
              <button onClick={() => setShowShare(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 font-bold">✕</button>
            </div>
            <div className="flex-1 overflow-auto px-4 py-4 space-y-4 mb-20">
              {SECTIONS.map(sec => {
                const sectionStickers = ALL.filter(s => s.section === sec.code && (
                  showShare === "missing" ? (states[s.id] ?? 0) === 0 : (states[s.id] ?? 0) >= 2
                ));
                if (!sectionStickers.length) return null;
                return (
                  <div key={sec.code} className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-100">
                      <span className="text-lg">{sec.flag}</span>
                      <span className="text-xs font-black text-slate-900 font-mono">{sec.code}</span>
                      <span className="text-xs text-slate-400 truncate">— {sec.name}</span>
                      <span className="ml-auto bg-slate-100 text-slate-600 font-mono text-[10px] font-bold px-2 py-0.5 rounded">{sectionStickers.length}</span>
                    </div>
                    <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(58px, 1fr))" }}>
                      {sectionStickers.map(s => {
                        const cfg = stickerCfg(states[s.id] ?? 0);
                        return (
                          <button key={s.id} onClick={() => toggle(s.id)}
                            style={{ backgroundColor: cfg.bg, borderColor: cfg.bg, color: cfg.text }}
                            className="border-2 rounded-xl h-12 flex flex-col items-center justify-center active:scale-90 transition-all font-mono">
                            <span className="text-base font-bold leading-none">{s.num}</span>
                            {cfg.label && <span className="text-[8px] font-bold" style={{ color: cfg.sub }}>{cfg.label}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-4 bg-white border-t border-slate-200 sticky bottom-0">
              <a href={`whatsapp://send?text=${encodeURIComponent(buildShareText(showShare, states))}`}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-[#25D366] text-white text-center flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
                💬 Enviar por WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* Section detail */}
        {activeSection && showShare !== "missing" && showShare !== "repeat" && (() => {
          const sec = SECTIONS.find(s => s.code === activeSection);
          const mtList = ALL.filter(s => s.section === activeSection);
          const filtered = mtList.filter(s => {
            const st = states[s.id] ?? 0;
            if (filter === "have") return st >= 1;
            if (filter === "missing") return st === 0;
            if (filter === "repeat") return st >= 2;
            return true;
          });
          const c = getCounts(activeSection);
          const spct = Math.round((c.have / sec.total) * 100);
          const secIdx = SECTIONS.findIndex(s => s.code === activeSection);
          const prev = secIdx > 0 ? SECTIONS[secIdx - 1] : null;
          const next = secIdx < SECTIONS.length - 1 ? SECTIONS[secIdx + 1] : null;

          return (
            <div className="min-h-screen bg-slate-50">
              <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 pt-4 pb-3 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold">←</button>
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span className="text-xl">{sec.flag}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 font-mono">{sec.code}</span>
                        {sec.group && <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Grupo {sec.group}</span>}
                      </div>
                      <p className="text-xs text-slate-500 truncate">{sec.name}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-slate-900">{c.have}<span className="text-slate-400 font-normal">/{sec.total}</span></p>
                    <p className="text-[10px] text-slate-400">{spct}%</p>
                  </div>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${spct}%`, backgroundColor: spct === 100 ? "#5BAF48" : "#2E5FA3" }} />
                </div>
                <div className="flex gap-1">
                  {[["all","Todas"],["have","Tengo"],["missing","Faltan"],["repeat","Repet."]].map(([k,l]) => (
                    <button key={k} onClick={() => setFilter(k)}
                      className={`flex-1 text-[10px] py-1.5 rounded-lg font-bold uppercase tracking-wide transition-all ${filter === k ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"}`}>{l}</button>
                  ))}
                </div>
              </div>
              <div className="px-3 pt-3 pb-4">
                <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(62px, 1fr))" }}>
                  {filtered.map(s => {
                    const cfg = stickerCfg(states[s.id] ?? 0);
                    return (
                      <button key={s.id} onClick={() => toggle(s.id)}
                        style={{ backgroundColor: cfg.bg, borderColor: cfg.bg, color: cfg.text }}
                        className="border-2 rounded-xl h-16 flex flex-col items-center justify-center active:scale-90 transition-all">
                        <span className="text-[9px] font-semibold font-mono" style={{ color: cfg.sub }}>{s.section}</span>
                        <span className="text-xl font-bold leading-none font-mono">{s.num}</span>
                        {cfg.label && <span className="text-[9px] font-bold" style={{ color: cfg.sub }}>{cfg.label}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-2 px-3 pb-6">
                {prev ? (
                  <button onClick={() => selectSection(prev.code)} className="flex-1 bg-white border border-slate-200 rounded-xl py-2.5 px-3 flex items-center gap-2 shadow-sm active:scale-[0.98]">
                    <span className="text-slate-400 text-xs">←</span>
                    <span className="text-lg">{prev.flag}</span>
                    <span className="text-xs font-bold text-slate-700 font-mono">{prev.code}</span>
                  </button>
                ) : <div className="flex-1" />}
                {next ? (
                  <button onClick={() => selectSection(next.code)} className="flex-1 bg-white border border-slate-200 rounded-xl py-2.5 px-3 flex items-center justify-end gap-2 shadow-sm active:scale-[0.98]">
                    <span className="text-xs font-bold text-slate-700 font-mono">{next.code}</span>
                    <span className="text-lg">{next.flag}</span>
                    <span className="text-slate-400 text-xs">→</span>
                  </button>
                ) : <div className="flex-1" />}
              </div>
            </div>
          );
        })()}

        {/* Global stats */}
        {showGlobalStats && !activeSection && showShare !== "missing" && showShare !== "repeat" && (
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <div className="bg-white border-b border-slate-200 px-4 pt-5 pb-4 flex items-center justify-between sticky top-0 shadow-sm">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-0.5">Análisis de Progreso</p>
                <h2 className="text-base font-extrabold text-slate-900">Estadísticas Generales</h2>
              </div>
              <button onClick={() => setShowGlobalStats(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 font-bold">✕</button>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {/* Donut */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col items-center">
                {(() => {
                  const R = 76, SW = 16, C = 2 * Math.PI * R;
                  return (
                    <svg width="200" height="200" viewBox="0 0 200 200">
                      <circle cx="100" cy="100" r={R} fill="none" stroke="#E2E8F0" strokeWidth={SW} />
                      <circle cx="100" cy="100" r={R} fill="none" stroke="#E8A020" strokeWidth={SW}
                        strokeDasharray={C} strokeDashoffset={C * (1 - gHave / gTotal)}
                        transform="rotate(-90 100 100)" style={{ transition: "stroke-dashoffset 0.8s ease" }} />
                      <circle cx="100" cy="100" r={R} fill="none" stroke="#5BAF48" strokeWidth={SW}
                        strokeDasharray={C} strokeDashoffset={C * (1 - (gHave - gRepeat) / gTotal)}
                        transform="rotate(-90 100 100)" style={{ transition: "stroke-dashoffset 0.8s ease" }} />
                      <text x="100" y="92" textAnchor="middle" fontSize="34" fontWeight="800" fill="#0F172A"
                        fontFamily="'Plus Jakarta Sans',sans-serif">{pct}%</text>
                      <text x="100" y="112" textAnchor="middle" fontSize="10" fontWeight="700" fill="#94A3B8"
                        fontFamily="'Plus Jakarta Sans',sans-serif" letterSpacing="2">COMPLETADO</text>
                      <text x="100" y="128" textAnchor="middle" fontSize="10" fill="#CBD5E1"
                        fontFamily="monospace">{gHave} / {gTotal}</text>
                    </svg>
                  );
                })()}
                <div className="flex gap-6 mt-2">
                  {[["#5BAF48", gHave - gRepeat, "Tengo"], ["#E8A020", gRepeat, "Repet."], ["#E2E8F0", gMissing, "Faltan"]].map(([color, val, lbl]) => (
                    <div key={lbl} className="flex flex-col items-center gap-1">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color, border: color === "#E2E8F0" ? "1px solid #CBD5E1" : "none" }} />
                      <span className="text-sm font-extrabold text-slate-800">{val}</span>
                      <span className="text-[9px] uppercase tracking-wide text-slate-400 font-bold">{lbl}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Dot map */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-3">994 láminas en orden del álbum</p>
                <div className="flex flex-wrap gap-[3px]">
                  {ALL.map(s => {
                    const st = states[s.id] ?? 0;
                    return <div key={s.id} className="w-2 h-2 rounded-sm"
                      style={{ backgroundColor: st >= 2 ? "#E8A020" : st === 1 ? "#5BAF48" : "#E2E8F0" }} />;
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Overview Home */}
        {!activeSection && !showGlobalStats && showShare !== "missing" && showShare !== "repeat" && (
          <div className="min-h-screen bg-slate-50">
            <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <select value={activeAlbumId} onChange={e => setActiveAlbumId(e.target.value)}
                  className="bg-slate-800 text-white border border-slate-700 rounded-lg px-2 py-1 text-xs outline-none font-bold max-w-[160px]">
                  {albums.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <button onClick={() => setShowAlbumManager(true)} className="bg-slate-800 text-emerald-400 px-2.5 py-1 rounded-lg font-bold">⚙️ Administrar</button>
              </div>
              <button onClick={handleLogout} className="text-slate-400 font-bold hover:text-white uppercase tracking-wide text-[10px]">
                Salir ✕
              </button>
            </div>

            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm px-4 pt-5 pb-4">
              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-400 mb-0.5">Panini · Sticker Album</p>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">FIFA World Cup 2026</h1>
                </div>
                <button onClick={() => setShowGlobalStats(true)} className="text-right shrink-0 hover:opacity-80 active:scale-95 transition-all outline-none">
                  <span className="text-4xl font-black tracking-tighter" style={{ color: "#5BAF48" }}>{pct}%</span>
                  <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400 -mt-1">Completado ↗</p>
                </button>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: "#5BAF48" }} />
              </div>
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200/60 rounded-2xl px-2 py-2 mb-3.5">
                <div className="flex-1 flex items-center justify-center gap-1.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span className="font-mono font-black text-slate-800 text-sm">{gHave}</span>
                  <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Tengo</span>
                </div>
                <div className="w-px h-4 bg-slate-200" />
                <button onClick={() => setShowShare("missing")} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl active:scale-95 transition-all">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <span className="font-mono font-black text-slate-800 text-sm">{gMissing}</span>
                  <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400 underline">Faltan ↗</span>
                </button>
                <div className="w-px h-4 bg-slate-200" />
                <button onClick={() => setShowShare("repeat")} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl active:scale-95 transition-all">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#E8A020" }} />
                  <span className="font-mono font-black text-slate-800 text-sm">{gRepeat}</span>
                  <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400 underline">Repet. ↗</span>
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
                <input type="text" placeholder="Buscar país o código..." value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl pl-8 pr-3 py-2.5 outline-none border border-slate-200 placeholder-slate-300 shadow-sm" />
              </div>
            </div>

            <div className="px-3 py-3 space-y-4">
              {grpSections("FWC")}
              {GROUPS.map(grp => {
                const gs = TEAMS.filter(s => s.group === grp);
                const matches = gs.filter(s => !search || s.code.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase()));
                if (!matches.length) return null;
                return (
                  <div key={grp} className="space-y-1.5">
                    <div className="flex items-center gap-3 px-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Grupo {grp}</span>
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>
                    {gs.map(sec => grpSections(sec.code))}
                  </div>
                );
              })}
              {grpSections("CC")}
            </div>
            <p className="text-[10px] text-slate-300 font-medium text-center py-6">Desarrollado por Cristian Jaramillo</p>
          </div>
        )}
      </div>
    </div>
  );
}
