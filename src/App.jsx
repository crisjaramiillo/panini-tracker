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

const ALL    = buildStickers();
const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
const APP_FONT = { fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" };

// ✅ CAMBIO: labels muestran extras reales (+1/×2/×3)
function stickerCfg(st) {
  if (st === 0) return { bg: "#f1f5f9", text: "#94a3b8", sub: "#94a3b8", label: null };
  if (st === 1) return { bg: "#2E5FA3", text: "#ffffff", sub: "#93c5fd", label: null };
  if (st === 2) return { bg: "#E8A020", text: "#ffffff", sub: "#fef3c7", label: "+1" };
  if (st === 3) return { bg: "#E8572A", text: "#ffffff", sub: "#ffedd5", label: "×2" };
  return             { bg: "#C0392B", text: "#ffffff", sub: "#ffe4e6", label: "×3" };
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
    // ✅ CAMBIO: muestra extras reales (state-1)
    const rows = secList
      .map(s => ({ ...s, reps: s.nums.filter(n => (states[`${s.code}-${n}`] ?? 0) >= 2).map(n => {
        const extras = (states[`${s.code}-${n}`] ?? 0) - 1;
        return extras === 1 ? `${n}` : `${n}×${extras}`;
      }) }))
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
  const [showBackupModal,      setShowBackupModal]      = useState(false);
  const [backupCode,           setBackupCode]           = useState('');
  const [backupAlbumName,      setBackupAlbumName]      = useState('');
  const [copyDone,             setCopyDone]             = useState(false);
  const [states,               setStates]               = useState({});
  const [filter,               setFilter]               = useState("all");
  const [activeSection,        setActiveSection]        = useState(null);
  const [search,               setSearch]               = useState("");
  const [showShare,            setShowShare]            = useState(false);
  const [showGlobalStats,      setShowGlobalStats]      = useState(false);
  const [showIntercambio,      setShowIntercambio]      = useState(false);
  const [intercambioStep,      setIntercambioStep]      = useState(1);
  const [tradeGive,            setTradeGive]            = useState({});
  const [tradeReceive,         setTradeReceive]         = useState({});
  const [intercambioQuery,     setIntercambioQuery]     = useState('');
  const [showSobres,           setShowSobres]           = useState(false);
  const [sobresInput,          setSobresInput]          = useState('');
  const [sobresPending,        setSobresPending]        = useState({});
  const [sobresStep,           setSobresStep]           = useState('scan');
  const [showSobresExplorer,   setShowSobresExplorer]   = useState(false);
  const [theme,                setTheme]                = useState(() => localStorage.getItem('panini_theme') || 'system');
  const [sectionComplete,      setSectionComplete]      = useState(null); // { code, name, flag }
  const [showAlbumComplete,    setShowAlbumComplete]    = useState(false);
  const [albumCompleteShown,   setAlbumCompleteShown]   = useState(false);
  const [achievements,         setAchievements]         = useState({});

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

  const fetchAlbums = async (userId) => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      let { data, error } = await supabase
        .from('albums').select('*').eq('user_id', userId).order('created_at', { ascending: true });
      if (error) throw error;
      if (!data || data.length === 0) {
        await supabase.from('albums').insert([{ user_id: userId, name: 'Mi Álbum Principal' }]);
        const { data: fresh } = await supabase
          .from('albums').select('*').eq('user_id', userId).order('created_at', { ascending: true });
        data = fresh;
      }
      if (data && data.length > 0) {
        setAlbums(data); setActiveAlbumId(data[0].id);
        await fetchStickers(data[0].id);
      }
    } catch (e) { console.error("fetchAlbums error:", e); }
    finally { setLoading(false); }
  };

  const fetchStickers = async (albumId) => {
    if (!albumId) return;
    try {
      const { data } = await supabase.from('stickers').select('sticker_id, state').eq('album_id', albumId);
      if (data) {
        const dict = {};
        data.forEach(row => { if (row.state > 0) dict[row.sticker_id] = row.state; });
        setStates(dict);
      }
    } catch (err) { console.error("fetchStickers error:", err); }
  };

  useEffect(() => { if (activeAlbumId) { fetchStickers(activeAlbumId); fetchAchievements(activeAlbumId); } }, [activeAlbumId]);

  const fetchAchievements = async (albumId) => {
    if (!albumId) return;
    const { data } = await supabase.from('achievements').select('section_code, completed_at').eq('album_id', albumId);
    if (data) {
      const dict = {};
      data.forEach(r => { dict[r.section_code] = r.completed_at; });
      setAchievements(dict);
    }
  };

  // ── REALTIME ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeAlbumId) return;
    const channel = supabase
      .channel(`album-${activeAlbumId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'stickers', filter: `album_id=eq.${activeAlbumId}` },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const { sticker_id, state } = payload.new;
            setStates(prev => {
              const upd = { ...prev };
              if (state > 0) upd[sticker_id] = state;
              else delete upd[sticker_id];
              return upd;
            });
          } else if (payload.eventType === 'DELETE') {
            setStates(prev => {
              const upd = { ...prev };
              delete upd[payload.old.sticker_id];
              return upd;
            });
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeAlbumId]);

  // ── MODO OSCURO ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const applyTheme = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
      document.documentElement.classList.toggle('dark', isDark);
    };
    applyTheme();
    localStorage.setItem('panini_theme', theme);
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', applyTheme);
    return () => mq.removeEventListener('change', applyTheme);
  }, [theme]);

  // ── CELEBRACIÓN ÁLBUM COMPLETO ───────────────────────────────────────────────
  // (movido después de pct)

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
        setAlbums(data); setActiveAlbumId(data[0].id);
        localStorage.setItem('tracker_user_email', cleanEmail);
        setSession({ user: { email: cleanEmail, id: cleanEmail } });
        await fetchStickers(data[0].id);
      } else { alert("Error al inicializar la base de datos."); }
    } catch (err) { console.error("handleEmailLogin error:", err); alert("Error de conexión con Supabase."); }
    finally { setLoading(false); }
  };

  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    if (!newAlbumName.trim() || !session?.user?.id) return;
    await supabase.from('albums').insert([{ user_id: session.user.id, name: newAlbumName }]);
    const { data } = await supabase.from('albums').select('*').eq('user_id', session.user.id).order('created_at', { ascending: true });
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

  // ✅ NUEVO: resetear láminas sin borrar el álbum
  const handleResetAlbum = async (albumId, name) => {
    if (!confirm(`¿Resetear "${name}"? Se borrarán todas las láminas. El álbum permanece.`)) return;
    setLoading(true);
    await supabase.from('stickers').delete().eq('album_id', albumId);
    if (albumId === activeAlbumId) setStates({});
    setLoading(false);
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
        .map(([stickerId, state]) => ({ album_id: targetPreloadAlbumId, sticker_id: stickerId, state: Math.min(state, 4) }));
      if (insertPayload.length > 0) {
        const { error } = await supabase.from('stickers').insert(insertPayload);
        if (error) throw error;
      }
      if (targetPreloadAlbumId === activeAlbumId) await fetchStickers(activeAlbumId);
      alert(`¡Listo! Se cargaron ${insertPayload.length} láminas.`);
      setRawBase64Input(''); setShowBase64Modal(false);
    } catch (err) { alert("Error: Base64 inválido."); console.error(err); }
    finally { setLoading(false); }
  };

  const triggerBase64Popup = (albumId) => {
    setTargetPreloadAlbumId(albumId); setRawBase64Input(''); setShowBase64Modal(true);
  };

  const handleExportBackup = async (albumId, albumName) => {
    setLoading(true);
    try {
      const { data } = await supabase.from('stickers').select('sticker_id, state').eq('album_id', albumId);
      const dict = {};
      if (data) data.forEach(r => { if (r.state > 0) dict[r.sticker_id] = r.state; });
      setBackupCode(btoa(JSON.stringify(dict)));
      setBackupAlbumName(albumName); setCopyDone(false); setShowBackupModal(true);
    } catch(e) { console.error(e); alert("Error al generar backup."); }
    finally { setLoading(false); }
  };

  const triggerSectionToasts = (oldStates, newStates) => {
    for (const sec of SECTIONS) {
      const stickers = ALL.filter(s => s.section === sec.code);
      const wasComplete = stickers.every(s => (oldStates[s.id] ?? 0) >= 1);
      const nowComplete = stickers.every(s => (newStates[s.id] ?? 0) >= 1);
      if (!wasComplete && nowComplete) {
        setSectionComplete({ code: sec.code, name: sec.name, flag: sec.flag });
        setTimeout(() => setSectionComplete(null), 3200);
        const now = new Date().toISOString();
        setAchievements(prev => ({ ...prev, [sec.code]: now }));
        if (activeAlbumId) {
          supabase.from('achievements')
            .upsert({ album_id: activeAlbumId, section_code: sec.code, completed_at: now }, { onConflict: 'album_id,section_code' })
            .then(() => {});
        }
        break;
      }
    }
  };

  const toggle = useCallback(async (id) => {
    if (!activeAlbumId) return;
    const cur = states[id] ?? 0;
    const nxt = cur >= 4 ? 0 : cur + 1;
    const oldStates = states;
    const newStates = { ...states, [id]: nxt };
    if (nxt === 0) delete newStates[id];
    setStates(newStates);
    triggerSectionToasts(oldStates, newStates);
    await supabase.from('stickers').upsert({ album_id: activeAlbumId, sticker_id: id, state: nxt }, { onConflict: 'album_id,sticker_id' });
  }, [states, activeAlbumId]);

  // ✅ NUEVO: bajar estado (nunca por debajo de 1 para proteger el álbum)
  const toggleDown = useCallback(async (id) => {
    if (!activeAlbumId) return;
    const cur = states[id] ?? 0;
    if (cur <= 1) return;
    const nxt = cur - 1;
    setStates(prev => { const upd = { ...prev, [id]: nxt }; if (nxt === 0) delete upd[id]; return upd; });
    await supabase.from('stickers').upsert({ album_id: activeAlbumId, sticker_id: id, state: nxt }, { onConflict: 'album_id,sticker_id' });
  }, [states, activeAlbumId]);

  // ── APERTURA DE SOBRES ─────────────────────────────────────────────────────
  const parseStickerCode = (raw) => {
    // Acepta: arg5, ARG-5, ARG 5, arg-5, FWC-3, fwc3, cc7, CC-7
    const clean = raw.trim().toUpperCase().replace(/[\s\-_]/g, '');
    // Formato: letras + número
    const match = clean.match(/^([A-Z]+)(\d+)$/);
    if (!match) return null;
    const [, code, num] = match;
    const id = `${code}-${num}`;
    return ALL.find(s => s.id === id) ? id : null;
  };

  const handleSobresInput = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const id = parseStickerCode(sobresInput);
      if (id) {
        setSobresPending(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
        setSobresInput('');
      } else if (sobresInput.trim()) {
        // Shake input to indicate error
        setSobresInput('❌ ' + sobresInput.trim());
        setTimeout(() => setSobresInput(''), 800);
      }
    }
  };

  const removeSobresPending = (id) => {
    setSobresPending(prev => {
      const u = { ...prev, [id]: (prev[id] ?? 1) - 1 };
      if (u[id] <= 0) delete u[id];
      return u;
    });
  };

  const confirmSobres = async () => {
    setLoading(true);
    try {
      const oldStates = { ...states };
      const newStates = { ...states };
      for (const [id, count] of Object.entries(sobresPending)) {
        newStates[id] = Math.min(4, (newStates[id] ?? 0) + count);
      }
      const payload = Object.entries(sobresPending).map(([id, count]) => ({
        album_id: activeAlbumId,
        sticker_id: id,
        state: newStates[id],
      }));
      if (payload.length > 0) {
        await supabase.from('stickers').upsert(payload, { onConflict: 'album_id,sticker_id' });
      }
      setStates(newStates);
      triggerSectionToasts(oldStates, newStates);
      // Pequeño delay para que el toast se vea antes de cerrar la vista
      await new Promise(r => setTimeout(r, 200));
      setShowSobres(false);
      setSobresPending({});
      setSobresStep('scan');
    } catch(e) { console.error(e); alert("Error al guardar."); }
    finally { setLoading(false); }
  };

  const startSobres = () => {
    setSobresPending({}); setSobresInput(''); setSobresStep('scan'); setActiveSection(null); setShowSobres(true);
  };
  const selectSection = useCallback((code) => { setActiveSection(code); setFilter("all"); setSearch(""); window.scrollTo(0, 0); }, []);
  const goBack = useCallback(() => { setActiveSection(null); }, []);

  // ── INTERCAMBIO ────────────────────────────────────────────────────────────
  const startIntercambio = () => {
    setTradeGive({}); setTradeReceive({}); setIntercambioStep(1); setIntercambioQuery(''); setActiveSection(null); setShowIntercambio(true);
  };

  const addToGive = (id) => {
    const cur = states[id] ?? 0;
    const giving = tradeGive[id] ?? 0;
    if (giving >= cur - 1) return; // nunca entrega la última (que está pegada)
    setTradeGive(prev => ({ ...prev, [id]: giving + 1 }));
  };

  const removeFromGive = (id) => {
    const giving = tradeGive[id] ?? 0;
    if (giving <= 0) return;
    setTradeGive(prev => { const u = { ...prev, [id]: giving - 1 }; if (!u[id]) delete u[id]; return u; });
  };

  const addToReceive = (id) => {
    const cur = tradeReceive[id] ?? 0;
    setTradeReceive(prev => ({ ...prev, [id]: cur + 1 }));
  };

  const removeFromReceive = (id) => {
    const cur = tradeReceive[id] ?? 0;
    if (cur <= 0) return;
    setTradeReceive(prev => { const u = { ...prev, [id]: cur - 1 }; if (!u[id]) delete u[id]; return u; });
  };

  const confirmIntercambio = async () => {
    setLoading(true);
    try {
      const oldStates = { ...states };
      const newStates = { ...states };
      for (const [id, count] of Object.entries(tradeGive)) {
        newStates[id] = Math.max(1, (newStates[id] ?? 0) - count);
      }
      for (const [id, count] of Object.entries(tradeReceive)) {
        newStates[id] = Math.min(4, (newStates[id] ?? 0) + count);
      }
      const allChanged = new Set([...Object.keys(tradeGive), ...Object.keys(tradeReceive)]);
      const upsertPayload = Array.from(allChanged).map(id => ({
        album_id: activeAlbumId, sticker_id: id, state: newStates[id] ?? 0,
      }));
      if (upsertPayload.length > 0) {
        await supabase.from('stickers').upsert(upsertPayload, { onConflict: 'album_id,sticker_id' });
      }
      setStates(prev => {
        const upd = { ...prev };
        for (const id of allChanged) { if (newStates[id]) upd[id] = newStates[id]; else delete upd[id]; }
        return upd;
      });
      triggerSectionToasts(oldStates, newStates);
      setShowIntercambio(false); setTradeGive({}); setTradeReceive({});
    } catch(e) { console.error(e); alert("Error al confirmar intercambio."); }
    finally { setLoading(false); }
  };

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
  const gRepeat  = ALL.reduce((acc, s) => { const st = states[s.id] ?? 0; return st >= 2 ? acc + (st - 1) : acc; }, 0);
  const gMissing = ALL.filter(s => !((states[s.id] ?? 0) >= 1)).length;
  const gTotal   = ALL.length;
  const pct      = Math.round((gHave / gTotal) * 100) || 0;

  // ── CELEBRACIÓN ÁLBUM COMPLETO (después de pct) ──────────────────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (pct === 100 && gHave === gTotal && gTotal > 0 && !albumCompleteShown) {
      setTimeout(() => { setShowAlbumComplete(true); setAlbumCompleteShown(true); }, 600);
    }
  }, [pct, gHave, gTotal]);

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
        className={`w-full flex flex-col rounded-xl px-3 pt-2.5 pb-2 border shadow-sm text-left active:scale-[0.98] transition-all ${done ? "text-white border-0" : "bg-white border-slate-200"} ${sectionComplete?.code === sec.code ? "group-complete-pulse" : ""}`}>
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
            const dotColor = st >= 2 ? (done ? "rgba(255,255,255,0.65)" : "#E8A020") : st === 1 ? (done ? "rgba(255,255,255,0.95)" : "#5BAF48") : (done ? "rgba(255,255,255,0.2)" : "#E2E8F0");
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
          <button type="submit" className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm active:scale-95 transition-all">Ingresar 🚀</button>
        </form>
      </div>
    </div>
  );

  return (
    <div style={APP_FONT} className={`select-none${theme === 'dark' ? ' dark' : theme === 'system' ? '' : ''}`}>
      <div id="app-frame" className="mx-auto">

        {/* Modal Backup Export */}
        {showBackupModal && (
          <div className="bg-slate-900/60 fixed inset-0 z-[60] flex items-center justify-center px-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl text-slate-800">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-1">⬇ Backup — {backupAlbumName}</h3>
              <p className="text-[11px] text-slate-400 mb-3">Toca el campo, selecciona todo y copia el código.</p>
              <textarea readOnly value={backupCode}
                onFocus={e => e.target.select()} onClick={e => e.target.select()}
                rows={5} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-[10px] font-mono outline-none resize-none text-emerald-700"/>
              <div className="flex gap-2 mt-3">
                <button onClick={async () => {
                  try { await navigator.clipboard.writeText(backupCode); setCopyDone(true); setTimeout(() => setCopyDone(false), 3000); } catch {}
                }} className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${copyDone ? "bg-emerald-500 text-white" : "bg-slate-900 text-white"}`}>
                  {copyDone ? "✓ Copiado" : "Copiar al portapapeles"}
                </button>
                <button onClick={() => setShowBackupModal(false)} className="px-4 py-2.5 rounded-xl text-slate-400 font-bold text-sm">Cerrar</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Base64 Import */}
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
                      {/* ✅ NUEVO: botones Backup, Import, Reset, Borrar */}
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => handleExportBackup(a.id, a.name)} className="bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase px-2.5 py-1.5 rounded-lg">⬇ Backup</button>
                        <button onClick={() => triggerBase64Popup(a.id)} className="bg-blue-50 text-blue-700 font-bold text-[10px] uppercase px-2.5 py-1.5 rounded-lg">⚡ Import</button>
                        <button onClick={() => handleResetAlbum(a.id, a.name)} className="bg-amber-50 text-amber-700 font-bold text-[10px] uppercase px-2.5 py-1.5 rounded-lg">↺ Reset</button>
                        <button onClick={() => handleDeleteAlbum(a.id, a.name)} className="bg-red-50 text-red-600 font-bold text-[10px] px-2.5 py-1.5 rounded-lg">🗑️</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── TOAST SECCIÓN COMPLETA ── */}
        {sectionComplete && (
          <div className="section-toast">
            <div style={{
              background: 'linear-gradient(135deg, #166534, #3D8B30)',
              borderRadius: '16px',
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
              minWidth: '280px',
              maxWidth: '340px',
            }}>
              <span style={{ fontSize: '32px', lineHeight: 1 }}>{sectionComplete.flag}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: '#86efac', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 2px' }}>¡Sección completada!</p>
                <p style={{ color: 'white', fontSize: '15px', fontWeight: 900, margin: '0 0 4px', lineHeight: 1.2 }}>{sectionComplete.name}</p>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', margin: 0 }}>
                  {gHave}/{gTotal} láminas · {pct}% del álbum
                </p>
              </div>
              <span style={{ fontSize: '20px' }}>🏆</span>
            </div>
          </div>
        )}

        {/* ── CELEBRACIÓN ÁLBUM COMPLETO ── */}
        {showAlbumComplete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
            {Array.from({length:40}).map((_,i) => (
              <div key={i} style={{
                position:'fixed',
                left:`${Math.random()*100}%`,
                top:`-${10+Math.random()*20}px`,
                width:`${7+Math.random()*7}px`,
                height:`${7+Math.random()*7}px`,
                borderRadius:'2px',
                backgroundColor:['#5BAF48','#2E5FA3','#E8A020','#E8572A','#6845A0','#FFD700'][i%6],
                animation:`confettiFall ${2+Math.random()*3}s linear ${Math.random()*1.5}s forwards`,
                pointerEvents:'none',
                zIndex:201,
              }}/>
            ))}
            <div style={{background:'white',borderRadius:'28px',padding:'28px',width:'100%',maxWidth:'360px',textAlign:'center',position:'relative',zIndex:10,boxShadow:'0 25px 60px rgba(0,0,0,0.6)'}}>
              <div style={{fontSize:'64px',marginBottom:'8px'}}>🏆</div>
              <h2 style={{fontSize:'24px',fontWeight:900,color:'#0f172a',margin:'0 0 4px'}}>¡Álbum Completo!</h2>
              <p style={{fontSize:'13px',color:'#94a3b8',margin:'0 0 20px'}}>FIFA World Cup 2026 · 994/994 láminas</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'20px'}}>
                <div style={{backgroundColor:'#2E5FA3',borderRadius:'14px',padding:'14px 8px'}}>
                  <p style={{fontSize:'22px',fontWeight:900,color:'white',margin:0}}>{gTotal}</p>
                  <p style={{fontSize:'9px',fontWeight:700,color:'#93c5fd',textTransform:'uppercase',letterSpacing:'0.1em',margin:'4px 0 0'}}>Láminas</p>
                </div>
                <div style={{backgroundColor:'#E8A020',borderRadius:'14px',padding:'14px 8px'}}>
                  <p style={{fontSize:'22px',fontWeight:900,color:'white',margin:0}}>{gRepeat}</p>
                  <p style={{fontSize:'9px',fontWeight:700,color:'#fef3c7',textTransform:'uppercase',letterSpacing:'0.1em',margin:'4px 0 0'}}>Repetidas</p>
                </div>
              </div>
              <a href={`whatsapp://send?text=${encodeURIComponent(
                '🏆⚽ *¡Completé el álbum FIFA World Cup 2026!*\n\n' +
                '📊 Mi colección:\n' +
                '✅ ' + gTotal + ' láminas pegadas\n' +
                '🔄 ' + gRepeat + ' repetidas acumuladas\n\n' +
                '¡El Mundial empieza con el álbum completo! 🎉'
              )}`} style={{
                display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',
                width:'100%',padding:'14px',borderRadius:'14px',
                backgroundColor:'#25D366',color:'white',
                fontWeight:700,fontSize:'14px',
                textDecoration:'none',boxSizing:'border-box',marginBottom:'10px',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>Compartir por WhatsApp</span>
              </a>
              <button onClick={() => setShowAlbumComplete(false)} style={{
                width:'100%',padding:'10px',borderRadius:'14px',border:'none',
                background:'transparent',color:'#94a3b8',fontWeight:700,fontSize:'13px',cursor:'pointer'
              }}>Cerrar</button>
            </div>
          </div>
        )}

        {/* ── APERTURA DE SOBRES ── */}
        {showSobres && (
          <div className="fixed inset-0 z-40 bg-slate-50 flex flex-col overflow-auto" style={APP_FONT}>
            <div className="bg-white border-b border-slate-200 px-4 pt-5 pb-4 sticky top-0 z-10 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-0.5">Registro rápido</p>
                  <h2 className="text-base font-extrabold text-slate-900">Apertura de Sobres</h2>
                </div>
                <button onClick={() => setShowSobres(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 font-bold">✕</button>
              </div>
            </div>

            {sobresStep === 'scan' && (
              <>
                {/* Input */}
                <div className="px-4 pt-4 pb-3 bg-white border-b border-slate-100">
                  <p className="text-[11px] text-slate-400 mb-2">Escribe el código de sección — o toca <strong>Explorar</strong></p>
                  <div className="flex gap-2">
                    <input
                      id="sobres-input"
                      type="text"
                      value={sobresInput}
                      onChange={e => {
                        const val = e.target.value;
                        setSobresInput(val);
                        const query = val.trim().toUpperCase().replace(/[\s\-_]/g, '');
                        if (query.length >= 2 && SECTIONS.find(s => s.code === query)) {
                          setTimeout(() => document.getElementById('sobres-input')?.blur(), 50);
                        }
                      }}
                      onKeyDown={handleSobresInput}
                      placeholder="ej: ARG, MEX, FWC..."
                      autoCapitalize="characters"
                      autoCorrect="off"
                      autoComplete="off"
                      spellCheck={false}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-slate-900 placeholder-slate-300"
                    />
                    <button onClick={() => setShowSobresExplorer(true)}
                      className="bg-slate-900 text-white font-bold px-4 rounded-xl text-sm active:scale-95 whitespace-nowrap">
                      🔍 Explorar
                    </button>
                  </div>
                  {/* Contadores en tiempo real */}
                  <div className="flex gap-3 mt-3">
                    {(() => {
                      const total    = Object.values(sobresPending).reduce((a,b)=>a+b,0);
                      const nuevas   = Object.entries(sobresPending).filter(([id]) => (states[id] ?? 0) === 0).reduce((a,[,b])=>a+b,0);
                      const repet    = total - nuevas;
                      return (
                        <>
                          <div className="flex-1 rounded-xl py-2 text-center" style={{ backgroundColor: "#1e293b" }}>
                            <p className="text-xl font-black text-white">{total}</p>
                            <p className="text-[9px] uppercase tracking-wide font-bold" style={{ color: "#94a3b8" }}>Total</p>
                          </div>
                          <div className="flex-1 rounded-xl py-2 text-center" style={{ backgroundColor: "#166534" }}>
                            <p className="text-xl font-black text-white">{nuevas}</p>
                            <p className="text-[9px] uppercase tracking-wide font-bold" style={{ color: "#86efac" }}>Nuevas</p>
                          </div>
                          <div className="flex-1 rounded-xl py-2 text-center" style={{ backgroundColor: "#E8A020" }}>
                            <p className="text-xl font-black text-white">{repet}</p>
                            <p className="text-[9px] uppercase tracking-wide font-bold" style={{ color: "#fef3c7" }}>Repetidas</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Sección sugerida o láminas pendientes */}
                <div className="flex-1 overflow-auto pb-28">
                  {(() => {
                    const query = sobresInput.trim().toUpperCase().replace(/[\s\-_]/g, '');
                    const matchedSec = query.length >= 2 ? SECTIONS.find(s => s.code === query) : null;

                    if (matchedSec) {
                      const secStickers = ALL.filter(s => s.section === matchedSec.code);
                      return (
                        <div className="px-4 pt-3">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg">{matchedSec.flag}</span>
                            <span className="text-sm font-black text-slate-900">{matchedSec.name}</span>
                            <button onClick={() => setSobresInput('')} className="ml-auto text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-1 rounded-lg">✕ limpiar</button>
                          </div>
                          <div className="sticker-grid">
                            {secStickers.map(s => {
                              const pending  = sobresPending[s.id] ?? 0;
                              const curSt    = states[s.id] ?? 0;
                              const isNew    = curSt === 0;
                              const bgColor  = pending > 0 ? "#2E5FA3" : isNew ? "#f1f5f9" : "#E8A020";
                              const txColor  = pending > 0 || !isNew ? "#fff" : "#64748b";
                              const subColor = pending > 0 ? "#93c5fd" : isNew ? "#94a3b8" : "#fef3c7";
                              return (
                                <button key={s.id}
                                  onClick={() => setSobresPending(prev => ({ ...prev, [s.id]: (prev[s.id] ?? 0) + 1 }))}
                                  onContextMenu={e => { e.preventDefault(); removeSobresPending(s.id); }}
                                  style={{ backgroundColor: bgColor, color: txColor }}
                                  className="rounded-xl h-14 flex flex-col items-center justify-center active:scale-90 transition-all font-mono">
                                  <span className="text-lg font-black leading-none">{s.num}</span>
                                  {pending > 0
                                    ? <span className="text-[9px] font-bold" style={{ color: subColor }}>+{pending}</span>
                                    : <span className="text-[8px]" style={{ color: subColor }}>{isNew ? "falta" : "tengo"}</span>
                                  }
                                </button>
                              );
                            })}
                          </div>
                          <p className="text-[10px] text-slate-400 text-center mt-3">Tap = agregar · manten presionado = quitar</p>
                        </div>
                      );
                    }

                    return (
                      <div className="px-4 pt-3">
                        {Object.keys(sobresPending).length === 0 ? (
                          <div className="text-center py-12">
                            <p className="text-4xl mb-3">📦</p>
                            <p className="text-sm text-slate-500">Escribe el código de una sección</p>
                            <p className="text-xs text-slate-300 mt-1">ARG · MEX · FWC · BRA · CC</p>
                          </div>
                        ) : (
                          <>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Láminas agregadas</p>
                            <div className="sticker-grid">
                              {Object.entries(sobresPending).map(([id, count]) => {
                                const isNew = (states[id] ?? 0) === 0;
                                return (
                                  <button key={id} onClick={() => removeSobresPending(id)}
                                    className="rounded-xl h-14 flex flex-col items-center justify-center active:scale-90 transition-all font-mono"
                                    style={{ backgroundColor: isNew ? "#166534" : "#E8A020" }}>
                                    <span className="text-[9px] font-bold text-white/70">{id.split('-')[0]}</span>
                                    <span className="text-lg font-black text-white leading-none">{id.split('-')[1]}</span>
                                    {count > 1 && <span className="text-[9px] font-bold text-white/80">×{count}</span>}
                                  </button>
                                );
                              })}
                            </div>
                            <p className="text-[10px] text-slate-400 text-center mt-3">Tap para quitar una</p>
                          </>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Explorer bottom sheet */}
                {showSobresExplorer && (
                  <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm"
                    onClick={() => setShowSobresExplorer(false)}>
                    <div className="bg-white rounded-t-3xl max-h-[80vh] overflow-auto"
                      onClick={e => e.stopPropagation()}>
                      <div className="sticky top-0 bg-white px-4 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-base font-black text-slate-900">Seleccionar sección</h3>
                        <button onClick={() => setShowSobresExplorer(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 font-bold">✕</button>
                      </div>
                      <div className="p-4 space-y-3">
                        {/* FWC */}
                        <button onClick={() => { setSobresInput('FWC'); setShowSobresExplorer(false); }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 active:scale-[0.98]">
                          <span className="text-2xl">🏆</span>
                          <div className="text-left">
                            <p className="text-sm font-black text-slate-900">FWC</p>
                            <p className="text-xs text-slate-500">FIFA World Cup</p>
                          </div>
                          <span className="ml-auto text-xs text-slate-400 font-mono">
                            {ALL.filter(s=>s.section==="FWC"&&(states[s.id]??0)>=1).length}/20
                          </span>
                        </button>
                        {/* Groups */}
                        {GROUPS.map(grp => (
                          <div key={grp}>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1 mb-2">Grupo {grp}</p>
                            <div className="space-y-1.5">
                              {TEAMS.filter(t => t.group === grp).map(t => {
                                const have = ALL.filter(s=>s.section===t.code&&(states[s.id]??0)>=1).length;
                                const done = have === 20;
                                return (
                                  <button key={t.code}
                                    onClick={() => { setSobresInput(t.code); setShowSobresExplorer(false); }}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl active:scale-[0.98] border"
                                    style={{ backgroundColor: done ? "#3D8B30" : "#f8fafc", borderColor: done ? "#3D8B30" : "#e2e8f0" }}>
                                    <span className="text-xl">{t.flag}</span>
                                    <div className="text-left flex-1 min-w-0">
                                      <p className="text-sm font-black truncate" style={{ color: done ? "white" : "#0f172a" }}>{t.name}</p>
                                      <p className="text-xs font-mono" style={{ color: done ? "rgba(255,255,255,0.7)" : "#94a3b8" }}>{t.code}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <p className="text-xs font-bold" style={{ color: done ? "rgba(255,255,255,0.9)" : "#64748b" }}>{have}/20</p>
                                      <div className="w-10 h-1 rounded-full overflow-hidden mt-1" style={{ backgroundColor: done ? "rgba(255,255,255,0.3)" : "#e2e8f0" }}>
                                        <div className="h-full rounded-full" style={{ width: `${(have/20)*100}%`, backgroundColor: done ? "rgba(255,255,255,0.9)" : "#5BAF48" }}/>
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                        {/* CC */}
                        <button onClick={() => { setSobresInput('CC'); setShowSobresExplorer(false); }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 active:scale-[0.98]">
                          <span className="text-2xl">🥤</span>
                          <div className="text-left">
                            <p className="text-sm font-black text-slate-900">CC</p>
                            <p className="text-xs text-slate-500">Coca-Cola</p>
                          </div>
                          <span className="ml-auto text-xs text-slate-400 font-mono">
                            {ALL.filter(s=>s.section==="CC"&&(states[s.id]??0)>=1).length}/14
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-white border-t border-slate-200 sticky bottom-0">
                  <button onClick={() => setSobresStep('confirm')}
                    disabled={Object.keys(sobresPending).length === 0}
                    className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm active:scale-95 transition-all disabled:opacity-40">
                    Ver resumen →
                  </button>
                </div>
              </>
            )}

            {sobresStep === 'confirm' && (() => {
              const total  = Object.values(sobresPending).reduce((a,b)=>a+b,0);
              const nuevas = Object.entries(sobresPending).filter(([id]) => (states[id] ?? 0) === 0).reduce((a,[,b])=>a+b,0);
              const repet  = total - nuevas;
              return (
                <>
                  <div className="flex-1 overflow-auto px-4 py-6 space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-2xl p-4 text-center shadow-sm" style={{ backgroundColor: "#1e293b" }}>
                        <p className="text-3xl font-black text-white">{total}</p>
                        <p className="text-[10px] uppercase tracking-wide font-bold mt-1" style={{ color: "#94a3b8" }}>Total</p>
                      </div>
                      <div className="rounded-2xl p-4 text-center shadow-sm" style={{ backgroundColor: "#166534" }}>
                        <p className="text-3xl font-black text-white">{nuevas}</p>
                        <p className="text-[10px] uppercase tracking-wide font-bold mt-1" style={{ color: "#86efac" }}>Nuevas</p>
                      </div>
                      <div className="rounded-2xl p-4 text-center shadow-sm" style={{ backgroundColor: "#E8A020" }}>
                        <p className="text-3xl font-black text-white">{repet}</p>
                        <p className="text-[10px] uppercase tracking-wide font-bold mt-1" style={{ color: "#fef3c7" }}>Repetidas</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 text-center">¿Todo correcto? Confirma para guardar en tu álbum.</p>
                  </div>
                  <div className="p-4 bg-white border-t border-slate-200 sticky bottom-0 flex gap-2">
                    <button onClick={() => setSobresStep('scan')} className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm">← Editar</button>
                    <button onClick={confirmSobres} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm active:scale-95 transition-all">
                      ✓ Guardar {total} láminas
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* ── INTERCAMBIO ── */}
        {showIntercambio && (
          <div className="fixed inset-0 z-40 bg-slate-50 flex flex-col overflow-auto" style={APP_FONT}>
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-4 pt-5 pb-4 sticky top-0 z-10 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-0.5">
                    {intercambioStep === 1 ? "Paso 1 de 3" : intercambioStep === 2 ? "Paso 2 de 3" : "Paso 3 de 3"}
                  </p>
                  <h2 className="text-base font-extrabold text-slate-900">
                    {intercambioStep === 1 ? "¿Qué entregas?" : intercambioStep === 2 ? "¿Qué recibes?" : "Resumen del intercambio"}
                  </h2>
                </div>
                <button onClick={() => setShowIntercambio(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 font-bold">✕</button>
              </div>
              {/* Step indicators */}
              <div className="flex gap-1.5 mt-3">
                {[1,2,3].map(s => (
                  <div key={s} className={`flex-1 h-1 rounded-full transition-all ${intercambioStep >= s ? "bg-slate-900" : "bg-slate-200"}`}/>
                ))}
              </div>
            </div>

            {/* Step 1: Entrego — browser de secciones */}
            {intercambioStep === 1 && (
              <>
                <div className="px-4 pt-3 pb-2 bg-white border-b border-slate-100">
                  <p className="text-[11px] text-slate-400 mb-2">Escribe el código de sección para ver tus repetidas</p>
                  <div className="flex gap-2">
                    <input id="trade-input-give" type="text" value={intercambioQuery}
                      onChange={e => {
                        const val = e.target.value;
                        setIntercambioQuery(val);
                        const q = val.trim().toUpperCase().replace(/[\s\-_]/g, '');
                        if (q.length >= 2 && SECTIONS.find(s => s.code === q))
                          setTimeout(() => document.getElementById('trade-input-give')?.blur(), 50);
                      }}
                      placeholder="ej: ARG, MEX, FWC..."
                      autoCapitalize="characters" autoCorrect="off" autoComplete="off" spellCheck={false}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono outline-none focus:border-slate-900 placeholder-slate-300"/>
                    <button onClick={() => setIntercambioQuery('')}
                      className="bg-slate-100 text-slate-500 font-bold px-3 rounded-xl text-xs">✕</button>
                  </div>
                  {/* Contadores */}
                  <div className="flex gap-2 mt-2.5">
                    <div className="flex-1 rounded-xl py-2 text-center" style={{backgroundColor:"#2E5FA3"}}>
                      <p className="text-lg font-black text-white">{Object.values(tradeGive).reduce((a,b)=>a+b,0)}</p>
                      <p className="text-[9px] uppercase tracking-wide font-bold" style={{color:"#93c5fd"}}>A entregar</p>
                    </div>
                    <div className="flex-1 rounded-xl py-2 text-center" style={{backgroundColor:"#1e293b"}}>
                      <p className="text-lg font-black text-white">{ALL.reduce((acc,s)=>{ const st=states[s.id]??0; return st>=2?acc+(st-1):acc; },0)}</p>
                      <p className="text-[9px] uppercase tracking-wide font-bold" style={{color:"#94a3b8"}}>Disponibles</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-auto pb-28 view-px">
                  {(() => {
                    const query = intercambioQuery.trim().toUpperCase().replace(/[\s\-_]/g,'');
                    const matchedSec = query.length >= 2 ? SECTIONS.find(s => s.code === query) : null;
                    if (matchedSec) {
                      const repeated = ALL.filter(s => s.section === matchedSec.code && (states[s.id] ?? 0) >= 2);
                      return (
                        <div className="px-4 pt-3">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg">{matchedSec.flag}</span>
                            <span className="text-sm font-black text-slate-900">{matchedSec.name}</span>
                            {!repeated.length && <span className="text-xs text-slate-400 ml-1">Sin repetidas</span>}
                          </div>
                          {repeated.length > 0 && (
                            <div className="sticker-grid">
                              {repeated.map(s => {
                                const st = states[s.id] ?? 0;
                                const giving = tradeGive[s.id] ?? 0;
                                const maxGive = st - 1;
                                const cfg = stickerCfg(st);
                                return (
                                  <button key={s.id}
                                    onClick={() => giving < maxGive ? addToGive(s.id) : removeFromGive(s.id)}
                                    style={{backgroundColor: giving > 0 ? "#2E5FA3" : cfg.bg, color: giving > 0 ? "#fff" : cfg.text, borderColor: giving > 0 ? "#2E5FA3" : cfg.bg}}
                                    className="border-2 rounded-xl h-16 flex flex-col items-center justify-center active:scale-90 transition-all font-mono">
                                    <span className="text-[9px] font-semibold" style={{color: giving > 0 ? "#93c5fd" : cfg.sub}}>{s.section}</span>
                                    <span className="text-xl font-black leading-none">{s.num}</span>
                                    <span className="text-[9px] font-bold" style={{color: giving > 0 ? "#93c5fd" : cfg.sub}}>
                                      {giving > 0 ? `−${giving}/${maxGive}` : `+${maxGive}`}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                          <p className="text-[10px] text-slate-400 text-center mt-3">Tap = entregar una · tap otra vez = deshacer</p>
                        </div>
                      );
                    }
                    const totalGiving = Object.values(tradeGive).reduce((a,b)=>a+b,0);
                    return (
                      <div className="px-4 pt-3">
                        {totalGiving === 0 ? (
                          <div className="text-center py-12">
                            <p className="text-4xl mb-3">🔄</p>
                            <p className="text-sm text-slate-500">Escribe el código de sección</p>
                            <p className="text-xs text-slate-300 mt-1">ARG · MEX · BRA · FWC</p>
                          </div>
                        ) : (
                          <>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Láminas a entregar</p>
                            <div className="sticker-grid">
                              {Object.entries(tradeGive).map(([id, count]) => {
                                const st = states[id] ?? 0;
                                const cfg = stickerCfg(st);
                                return (
                                  <button key={id} onClick={() => removeFromGive(id)}
                                    className="rounded-xl h-14 flex flex-col items-center justify-center active:scale-90 font-mono"
                                    style={{backgroundColor:"#2E5FA3"}}>
                                    <span className="text-[9px] font-bold text-blue-300">{id.split('-')[0]}</span>
                                    <span className="text-lg font-black text-white leading-none">{id.split('-')[1]}</span>
                                    {count > 1 && <span className="text-[9px] font-bold text-blue-300">×{count}</span>}
                                  </button>
                                );
                              })}
                            </div>
                            <p className="text-[10px] text-slate-400 text-center mt-3">Tap para quitar</p>
                          </>
                        )}
                      </div>
                    );
                  })()}
                </div>
                <div className="p-4 bg-white border-t border-slate-200 sticky bottom-0">
                  <button onClick={() => { setIntercambioStep(2); setIntercambioQuery(''); }}
                    disabled={Object.keys(tradeGive).length === 0}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm active:scale-95 transition-all disabled:opacity-40">
                    Siguiente → ¿Qué recibes?
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Recibo — browser de secciones */}
            {intercambioStep === 2 && (
              <>
                <div className="px-4 pt-3 pb-2 bg-white border-b border-slate-100">
                  <p className="text-[11px] text-slate-400 mb-2">Escribe el código de sección · faltantes primero</p>
                  <div className="flex gap-2">
                    <input id="trade-input-recv" type="text" value={intercambioQuery}
                      onChange={e => {
                        const val = e.target.value;
                        setIntercambioQuery(val);
                        const q = val.trim().toUpperCase().replace(/[\s\-_]/g, '');
                        if (q.length >= 2 && SECTIONS.find(s => s.code === q))
                          setTimeout(() => document.getElementById('trade-input-recv')?.blur(), 50);
                      }}
                      placeholder="ej: ARG, MEX, FWC..."
                      autoCapitalize="characters" autoCorrect="off" autoComplete="off" spellCheck={false}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono outline-none focus:border-slate-900 placeholder-slate-300"/>
                    <button onClick={() => setIntercambioQuery('')}
                      className="bg-slate-100 text-slate-500 font-bold px-3 rounded-xl text-xs">✕</button>
                  </div>
                  <div className="flex gap-2 mt-2.5">
                    <div className="flex-1 rounded-xl py-2 text-center" style={{backgroundColor:"#166534"}}>
                      <p className="text-lg font-black text-white">{Object.values(tradeReceive).reduce((a,b)=>a+b,0)}</p>
                      <p className="text-[9px] uppercase tracking-wide font-bold" style={{color:"#86efac"}}>A recibir</p>
                    </div>
                    <div className="flex-1 rounded-xl py-2 text-center" style={{backgroundColor:"#2E5FA3"}}>
                      <p className="text-lg font-black text-white">{Object.values(tradeGive).reduce((a,b)=>a+b,0)}</p>
                      <p className="text-[9px] uppercase tracking-wide font-bold" style={{color:"#93c5fd"}}>Entregadas</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-auto pb-28 view-px">
                  {(() => {
                    const query = intercambioQuery.trim().toUpperCase().replace(/[\s\-_]/g,'');
                    const matchedSec = query.length >= 2 ? SECTIONS.find(s => s.code === query) : null;
                    if (matchedSec) {
                      const secStickers = ALL.filter(s => s.section === matchedSec.code);
                      const missing = secStickers.filter(s => (states[s.id]??0) === 0);
                      const have = secStickers.filter(s => (states[s.id]??0) >= 1);
                      const renderGrid = (stickers, label) => stickers.length === 0 ? null : (
                        <div className="mb-4">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 px-1">{label}</p>
                          <div className="sticker-grid">
                            {stickers.map(s => {
                              const receiving = tradeReceive[s.id] ?? 0;
                              const isNew = (states[s.id]??0) === 0;
                              const bgColor = receiving > 0 ? "#166534" : isNew ? "#f1f5f9" : stickerCfg(states[s.id]??0).bg;
                              const txColor = receiving > 0 || !isNew ? "#fff" : "#64748b";
                              return (
                                <button key={s.id}
                                  onClick={() => receiving > 0 ? removeFromReceive(s.id) : addToReceive(s.id)}
                                  style={{backgroundColor: bgColor, color: txColor}}
                                  className="rounded-xl h-14 flex flex-col items-center justify-center active:scale-90 transition-all font-mono">
                                  <span className="text-lg font-black leading-none">{s.num}</span>
                                  {receiving > 0
                                    ? <span className="text-[9px] font-bold" style={{color:"#86efac"}}>+{receiving}</span>
                                    : <span className="text-[8px]" style={{color: isNew ? "#94a3b8" : "#fff"}}>{isNew?"falta":"tengo"}</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                      return (
                        <div className="px-4 pt-3">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg">{matchedSec.flag}</span>
                            <span className="text-sm font-black text-slate-900">{matchedSec.name}</span>
                          </div>
                          {renderGrid(missing, "📋 Faltantes")}
                          {renderGrid(have, "✅ Ya tengo")}
                          <p className="text-[10px] text-slate-400 text-center mt-1">Tap = agregar · tap otra vez = quitar</p>
                        </div>
                      );
                    }
                    return (
                      <div className="px-4 pt-3">
                        {Object.keys(tradeReceive).length === 0 ? (
                          <div className="text-center py-12">
                            <p className="text-4xl mb-3">🎯</p>
                            <p className="text-sm text-slate-500">Escribe el código de sección</p>
                            <p className="text-xs text-slate-300 mt-1">ARG · MEX · BRA · FWC</p>
                          </div>
                        ) : (
                          <>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Láminas a recibir</p>
                            <div className="sticker-grid">
                              {Object.entries(tradeReceive).map(([id, count]) => (
                                <button key={id} onClick={() => removeFromReceive(id)}
                                  className="rounded-xl h-14 flex flex-col items-center justify-center active:scale-90 font-mono"
                                  style={{backgroundColor:"#166534"}}>
                                  <span className="text-[9px] font-bold text-green-300">{id.split('-')[0]}</span>
                                  <span className="text-lg font-black text-white leading-none">{id.split('-')[1]}</span>
                                  {count > 1 && <span className="text-[9px] font-bold text-green-300">×{count}</span>}
                                </button>
                              ))}
                            </div>
                            <p className="text-[10px] text-slate-400 text-center mt-3">Tap para quitar</p>
                          </>
                        )}
                      </div>
                    );
                  })()}
                </div>
                <div className="p-4 bg-white border-t border-slate-200 sticky bottom-0 flex gap-2">
                  <button onClick={() => { setIntercambioStep(1); setIntercambioQuery(''); }}
                    className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm">←</button>
                  <button onClick={() => setIntercambioStep(3)}
                    disabled={Object.keys(tradeReceive).length === 0}
                    className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm active:scale-95 transition-all disabled:opacity-40">
                    Ver resumen →
                  </button>
                </div>
              </>
            )}

                        {/* Step 3: Resumen */}
            {intercambioStep === 3 && (() => {
              const totalGive    = Object.values(tradeGive).reduce((a,b)=>a+b,0);
              const totalReceive = Object.values(tradeReceive).reduce((a,b)=>a+b,0);
              const allChanged   = new Set([...Object.keys(tradeGive), ...Object.keys(tradeReceive)]);
              return (
                <>
                  <div className="flex-1 overflow-auto px-4 py-4 pb-28 space-y-4">
                    {/* Totales */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-sm">
                        <p className="text-3xl font-black text-slate-900">{totalGive}</p>
                        <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold mt-1">Entregas</p>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-sm">
                        <p className="text-3xl font-black" style={{ color: "#5BAF48" }}>{totalReceive}</p>
                        <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold mt-1">Recibes</p>
                      </div>
                    </div>

                    {/* Detalle de cambios */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Cambios en tu álbum</h3>
                      <div className="space-y-2">
                        {Array.from(allChanged).map(id => {
                          const sticker = ALL.find(s => s.id === id);
                          if (!sticker) return null;
                          const curSt   = states[id] ?? 0;
                          const give    = tradeGive[id] ?? 0;
                          const receive = tradeReceive[id] ?? 0;
                          const newSt   = Math.min(4, Math.max(give > 0 ? 1 : 0, curSt - give + receive));
                          const sec     = SECTIONS.find(s => s.code === sticker.section);
                          const stateLabel = (st) => st === 0 ? "falta" : st === 1 ? "tengo" : st === 2 ? "+1" : st === 3 ? "×2" : "×3";
                          return (
                            <div key={id} className="flex items-center gap-3 py-1.5 border-b border-slate-50 last:border-0">
                              <span className="text-base">{sec?.flag}</span>
                              <span className="text-xs font-bold font-mono text-slate-700">{id}</span>
                              <div className="ml-auto flex items-center gap-2">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500">{stateLabel(curSt)}</span>
                                <span className="text-slate-300 text-xs">→</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${newSt > curSt ? "bg-green-100 text-green-700" : "bg-blue-50 text-blue-700"}`}>{stateLabel(newSt)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-white border-t border-slate-200 sticky bottom-0 flex gap-2">
                    <button onClick={() => setIntercambioStep(2)} className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm">←</button>
                    <button onClick={confirmIntercambio}
                      className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm active:scale-95 transition-all">
                      ✓ Confirmar intercambio
                    </button>
                  </div>
                </>
              );
            })()}
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
            <div className="flex-1 overflow-auto view-px py-4 space-y-4 mb-20">
              <div className="section-card-list">
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
                    <div className="sticker-grid">
                      {sectionStickers.map(s => {
                        const cfg = stickerCfg(states[s.id] ?? 0);
                        return (
                          // ✅ CAMBIO: toggleDown en vista repetidas (protege álbum)
                          <button key={s.id} onClick={() => showShare === "repeat" ? toggleDown(s.id) : toggle(s.id)}
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
              {/* ✅ CAMBIO: cabecera rediseñada con bandera grande y nombre prominente */}
              <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 pt-4 pb-3 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold">←</button>
                  <div className="text-right">
                    <p className="text-xl font-black text-slate-900 tabular-nums">{c.have}<span className="text-slate-300 font-normal text-base">/{sec.total}</span></p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{spct}% completado</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-6xl leading-none">{sec.flag}</span>
                  <div className="min-w-0">
                    <p className="text-2xl font-black text-slate-900 leading-tight break-words">{sec.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold text-slate-500 font-mono">{sec.code}</span>
                      {sec.group && <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">· Grupo {sec.group}</span>}
                    </div>
                  </div>
                </div>
                {/* ✅ CAMBIO: barra h-3 más gruesa */}
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-3">
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
                <div className="sticker-grid">
                  {filtered.map(s => {
                    const cfg = stickerCfg(states[s.id] ?? 0);
                    return (
                      // ✅ CAMBIO: toggleDown en tab Repet.
                      <button key={s.id} onClick={() => filter === "repeat" ? toggleDown(s.id) : toggle(s.id)}
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
            <div className="flex-1 overflow-auto stats-grid">

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
                      <text x="100" y="92" textAnchor="middle" fontSize="34" fontWeight="800"
                        fill="#0F172A" fontFamily="'Plus Jakarta Sans',sans-serif">{pct}%</text>
                      <text x="100" y="112" textAnchor="middle" fontSize="10" fontWeight="700"
                        fill="#94A3B8" fontFamily="'Plus Jakarta Sans',sans-serif" letterSpacing="2">COMPLETADO</text>
                      <text x="100" y="128" textAnchor="middle" fontSize="10"
                        fill="#94A3B8" fontFamily="monospace">{gHave} / {gTotal}</text>
                    </svg>
                  );
                })()}
                <div className="flex gap-6 mt-2">
                  {[["#5BAF48", gHave - gRepeat, "Tengo"], ["#E8A020", gRepeat, "Repet."], ["#64748b", gMissing, "Faltan"]].map(([color, val, lbl]) => (
                    <div key={lbl} className="flex flex-col items-center gap-1">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                      <span className="text-sm font-extrabold text-slate-800">{val}</span>
                      <span className="text-[9px] uppercase tracking-wide text-slate-400 font-bold">{lbl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Logros */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">🏅 Logros</h3>
                  <span className="text-xs font-bold text-slate-500">
                    {Object.keys(achievements).length}/{SECTIONS.length} secciones
                  </span>
                </div>
                {Object.keys(achievements).length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">Completa una sección para desbloquear logros</p>
                ) : (
                  <div className="space-y-2">
                    {SECTIONS.filter(sec => achievements[sec.code]).sort((a,b) =>
                      new Date(achievements[b.code]) - new Date(achievements[a.code])
                    ).map(sec => {
                      const date = new Date(achievements[sec.code]);
                      const dateStr = date.toLocaleDateString('es-CL', { day:'numeric', month:'short', year:'numeric' });
                      const timeStr = date.toLocaleTimeString('es-CL', { hour:'2-digit', minute:'2-digit' });
                      return (
                        <div key={sec.code} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                          <span className="text-xl">{sec.flag}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{sec.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{sec.code} · {dateStr} {timeStr}</p>
                          </div>
                          <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{backgroundColor:"#5BAF48"}}>
                            <span className="text-white text-xs font-black">✓</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Progreso por grupo */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">📊 Progreso por Grupo</h3>
                <div className="space-y-2">
                  {(() => {
                    const groupStats = GROUPS.map(grp => {
                      const teams = TEAMS.filter(t => t.group === grp);
                      const total = teams.length * 20;
                      const have  = teams.reduce((a, t) => a + ALL.filter(s => s.section === t.code && (states[s.id] ?? 0) >= 1).length, 0);
                      return { grp, total, have, pct: Math.round((have/total)*100) };
                    }).sort((a,b) => b.pct - a.pct);

                    return groupStats.map(({ grp, total, have, pct: gpct }) => (
                      <div key={grp}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-700">Grupo {grp}</span>
                          <span className="text-xs font-bold text-slate-500 tabular-nums">{have}/{total} <span className="text-slate-400 font-normal">({gpct}%)</span></span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${gpct}%`, backgroundColor: gpct === 100 ? "#5BAF48" : gpct >= 75 ? "#2E5FA3" : gpct >= 50 ? "#E8A020" : "#E2E8F0" }}/>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Ranking secciones */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">🏆 Top 5 más completos</h3>
                <div className="space-y-2">
                  {(() => {
                    return SECTIONS
                      .map(sec => {
                        const have = ALL.filter(s => s.section === sec.code && (states[s.id] ?? 0) >= 1).length;
                        return { ...sec, have, pct: Math.round((have/sec.total)*100) };
                      })
                      .sort((a,b) => b.pct - a.pct)
                      .slice(0, 5)
                      .map((sec, i) => (
                        <div key={sec.code} className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-slate-400 w-4">{i+1}</span>
                          <span className="text-base">{sec.flag}</span>
                          <span className="text-xs font-bold text-slate-700 font-mono flex-1">{sec.code}</span>
                          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${sec.pct}%`, backgroundColor: sec.pct === 100 ? "#5BAF48" : "#2E5FA3" }}/>
                          </div>
                          <span className="text-xs font-bold text-slate-600 tabular-nums w-8 text-right">{sec.pct}%</span>
                        </div>
                      ));
                  })()}
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">⚠️ Top 5 más incompletos</h3>
                  <div className="space-y-2">
                    {SECTIONS
                      .map(sec => {
                        const have = ALL.filter(s => s.section === sec.code && (states[s.id] ?? 0) >= 1).length;
                        return { ...sec, have, pct: Math.round((have/sec.total)*100) };
                      })
                      .filter(sec => sec.pct < 100)
                      .sort((a,b) => a.pct - b.pct)
                      .slice(0, 5)
                      .map((sec, i) => (
                        <div key={sec.code} className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-slate-400 w-4">{i+1}</span>
                          <span className="text-base">{sec.flag}</span>
                          <span className="text-xs font-bold text-slate-700 font-mono flex-1">{sec.code}</span>
                          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-slate-300" style={{ width: `${sec.pct}%` }}/>
                          </div>
                          <span className="text-xs font-bold text-slate-400 tabular-nums w-8 text-right">{sec.pct}%</span>
                        </div>
                      ))
                    }
                  </div>
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
              <button onClick={() => setTheme(t => t === 'dark' ? 'light' : t === 'light' ? 'system' : 'dark')}
                className="bg-slate-800 text-slate-300 px-2 py-1 rounded-lg font-bold text-sm"
                title={`Tema: ${theme}`}>
                {theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '⚙'}
              </button>
              </div>
              <button onClick={handleLogout} className="text-slate-400 font-bold hover:text-white uppercase tracking-wide text-[10px]">Salir ✕</button>
            </div>

            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
              <div className="md:hidden px-4 pt-5 pb-4">
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
                    <span className="font-mono font-black text-slate-800 text-xl">{gHave}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Tengo</span>
                  </div>
                  <div className="w-px h-4 bg-slate-200" />
                  <button onClick={() => setShowShare("missing")} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl active:scale-95 transition-all">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <span className="font-mono font-black text-slate-800 text-xl">{gMissing}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400 underline">Faltan ↗</span>
                  </button>
                  <div className="w-px h-4 bg-slate-200" />
                  <button onClick={() => setShowShare("repeat")} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl active:scale-95 transition-all">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#E8A020" }} />
                    <span className="font-mono font-black text-slate-800 text-xl">{gRepeat}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400 underline">Repet. ↗</span>
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
                  <input type="text" placeholder="Buscar país o código..." value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl pl-8 pr-3 py-2.5 outline-none border border-slate-200 placeholder-slate-300 shadow-sm" />
                </div>
                <div className="flex gap-2 mt-2.5">
                  <button onClick={startIntercambio}
                    className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white active:scale-95 transition-all"
                    style={{ backgroundColor: "#5BAF48" }}>
                    Intercambio
                  </button>
                  <button onClick={startSobres}
                    className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white active:scale-95 transition-all"
                    style={{ backgroundColor: "#3D8B30" }}>
                    Abrir Sobres
                  </button>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-4 px-6 py-3">
                <div className="shrink-0 pr-4 border-r border-slate-200">
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400 leading-none mb-1">Panini · Sticker Album</p>
                  <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">FIFA World Cup 2026</h1>
                </div>
                <div className="flex gap-2 shrink-0">
                  <div className="px-3 py-1.5 text-center bg-slate-50 rounded-lg border border-slate-200 min-w-[72px]">
                    <p className="text-lg font-extrabold tabular-nums" style={{ color: "#2E5FA3" }}>{gHave}</p>
                    <p className="text-[8px] uppercase tracking-[0.12em] text-slate-400 font-bold">Tengo</p>
                  </div>
                  <button onClick={() => setShowShare("missing")} className="px-3 py-1.5 text-center bg-slate-50 rounded-lg border border-slate-200 min-w-[72px] active:opacity-70">
                    <p className="text-lg font-extrabold tabular-nums text-slate-700">{gMissing}</p>
                    <p className="text-[8px] uppercase tracking-[0.12em] text-slate-400 font-bold underline">Faltan ↗</p>
                  </button>
                  <button onClick={() => setShowShare("repeat")} className="px-3 py-1.5 text-center bg-slate-50 rounded-lg border border-slate-200 min-w-[72px] active:opacity-70">
                    <p className="text-lg font-extrabold tabular-nums" style={{ color: "#E8A020" }}>{gRepeat}</p>
                    <p className="text-[8px] uppercase tracking-[0.12em] text-slate-400 font-bold underline">Repet. ↗</p>
                  </button>
                  <button onClick={() => setShowGlobalStats(true)} className="px-3 py-1.5 text-center bg-slate-50 rounded-lg border border-slate-200 min-w-[72px] active:opacity-70">
                    <p className="text-lg font-extrabold tabular-nums" style={{ color: "#5BAF48" }}>{pct}%</p>
                    <div className="w-10 h-1 bg-slate-200 rounded-full overflow-hidden mx-auto mt-1">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: "#5BAF48" }} />
                    </div>
                    <p className="text-[8px] uppercase tracking-[0.12em] text-slate-400 font-bold mt-0.5">Total ↗</p>
                  </button>
                </div>
                <div className="relative flex-1 min-w-[180px] pl-2 border-l border-slate-200">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
                  <input type="text" placeholder="Buscar país o código..." value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 text-sm rounded-lg pl-8 pr-3 py-1.5 outline-none border border-slate-200 focus:border-slate-400 placeholder-slate-300" />
                </div>
                <button onClick={startIntercambio}
                  className="px-4 py-1.5 rounded-lg font-bold text-sm text-white shrink-0 active:scale-95 transition-all"
                  style={{ backgroundColor: "#5BAF48" }}>
                  Intercambio
                </button>
                <button onClick={startSobres}
                  className="px-4 py-1.5 rounded-lg font-bold text-sm text-white shrink-0 active:scale-95 transition-all"
                  style={{ backgroundColor: "#3D8B30" }}>
                  Abrir Sobres
                </button>
              </div>
            </div>

            <div className="px-3 py-3 md:px-6 md:py-5 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-4 md:items-start">
              {(() => { const r = grpSections("FWC"); if (!r) return null; return (
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">FIFA World Cup</span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>{r}
                </div>
              ); })()}

              {GROUPS.map(grp => {
                const gs = TEAMS.filter(s => s.group === grp);
                const matches = gs.filter(s => !search || s.code.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase()));
                if (!matches.length) return null;
                const gh = gs.reduce((a, t) => a + getCounts(t.code).have, 0);
                const gt = gs.length * 20;
                return (
                  <div key={grp} className="mb-4 md:mb-0">
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Grupo {grp}</span>
                      <div className="flex-1 h-px bg-slate-200" />
                      <span className="text-[10px] text-slate-400">{gh}/{gt}</span>
                    </div>
                    <div className="space-y-1.5">{gs.map(sec => grpSections(sec.code))}</div>
                  </div>
                );
              })}

              {(() => { const r = grpSections("CC"); if (!r) return null; return (
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Coca-Cola</span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>{r}
                </div>
              ); })()}
            </div>
            <p className="text-[10px] text-slate-300 font-medium text-center py-6">Desarrollado por Cristian Jaramillo</p>
          </div>
        )}
      </div>
    </div>
  );
}