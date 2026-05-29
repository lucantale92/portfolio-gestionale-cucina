// ===================================================
// TAVOLA — Gestionale Ristorante v4 — App Logic
// Sistema completo con incassi, persistenza localStorage
// ===================================================

const STORAGE_KEY = "tavola_v4_data";
const APP_VERSION = "v4.0";

// Forzato reset se è la prima volta che parte la v4 (per pulire dati vecchi v3)
if (!localStorage.getItem("tavola_version") || localStorage.getItem("tavola_version") !== APP_VERSION) {
  // pulizia di tutte le chiavi vecchie
  Object.keys(localStorage).forEach(k => { if (k.startsWith("tavola")) localStorage.removeItem(k); });
  localStorage.setItem("tavola_version", APP_VERSION);
}

// ===== PAGE TITLES =====
const TITLES = {
  dashboard: ["Panoramica", "Riepilogo di oggi"],
  prenotazioni: ["Prenotazioni", "Gestisci tavoli e prenotazioni"],
  ordini: ["Ordini e Cucina", "Comande in tempo reale e coda cucina"],
  incassi: ["Incassi", "Storico e statistiche dei pagamenti"],
  menu: ["Gestione Menu", "Modifica piatti, prezzi e disponibilità"],
  staff: ["Personale", "Membri del team e turni di lavoro"],
  impostazioni: ["Impostazioni", "Configurazione del ristorante"]
};

// ===== COLORS =====
const COLORS = {
  occupato: "#ef4444", prenotato: "#f59e0b", libero: "#10b981",
  nuovo: "#3b82f6", "in preparazione": "#f59e0b", pronto: "#10b981", servito: "#94a3b8",
  accent: "#7c3aed"
};
const STATUS_IT = { occupato: "Occupato", prenotato: "Prenotato", libero: "Libero" };
const ORD_IT = { nuovo: "Nuovo", "in preparazione": "In Preparazione", pronto: "Pronto", servito: "Servito" };
const ORD_NEXT = { nuovo: "in preparazione", "in preparazione": "pronto", pronto: "servito" };
const ORD_BTN = { nuovo: "Inizia Preparazione", "in preparazione": "Segna Pronto", pronto: "Segna Servito" };
const ORD_BTN_COLOR = { nuovo: "#f59e0b", "in preparazione": "#10b981", pronto: "#7c3aed" };
const CAT_COLORS = {
  Antipasti: ["#fce7f3", "#ec4899"], Primi: ["#ede9fe", "#7c3aed"],
  Secondi: ["#fee2e2", "#ef4444"], Dolci: ["#fef3c7", "#f59e0b"],
  Insalate: ["#d1fae5", "#10b981"], Bevande: ["#dbeafe", "#3b82f6"]
};
const PAGAMENTI = { contanti: "Contanti", carta: "Carta", bonifico: "Bonifico", buoni: "Buoni pasto" };
const PAG_COLORS = { contanti: "#10b981", carta: "#3b82f6", bonifico: "#7c3aed", buoni: "#f59e0b" };
const STAFF_COLORS = ["#7c3aed", "#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#ec4899", "#14b8a6", "#6366f1"];

// ===== HELPERS =====
function $(id) { return document.getElementById(id); }
function fmt(n) { return "€" + n.toFixed(2).replace(".", ","); }
function todayStr() { const d = new Date(); return d.toISOString().slice(0, 10); }
function dateStr(d) { return d.toISOString().slice(0, 10); }
function parseDate(s) { return new Date(s + "T00:00:00"); }
function dayLabel(d) { return ["Dom","Lun","Mar","Mer","Gio","Ven","Sab"][d.getDay()]; }
function monthLabel(d) { return ["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"][d.getMonth()]; }
function todayHuman() {
  const d = new Date();
  const giorni = ["Domenica","Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato"];
  return `${giorni[d.getDay()]} ${d.getDate()} ${monthLabel(d)}`;
}

// ===== DATA (DEFAULTS) =====
function defaultData() {
  return {
    tavoli: [
      { id: 1, posti: 2, stato: "occupato", ospite: "Rossi", ora: "20:00", telefono: "333 1234567", note: "Allergia glutine" },
      { id: 2, posti: 2, stato: "prenotato", ospite: "Bianchi", ora: "20:30", telefono: "338 7654321", note: "" },
      { id: 3, posti: 4, stato: "libero", ospite: "", ora: "", telefono: "", note: "" },
      { id: 4, posti: 4, stato: "occupato", ospite: "Conti", ora: "19:30", telefono: "340 1112233", note: "Compleanno" },
      { id: 5, posti: 6, stato: "libero", ospite: "", ora: "", telefono: "", note: "" },
      { id: 6, posti: 6, stato: "prenotato", ospite: "Ferrari", ora: "21:00", telefono: "347 9998877", note: "Finestra" },
      { id: 7, posti: 8, stato: "occupato", ospite: "Marino", ora: "20:00", telefono: "351 5556677", note: "Gruppo aziendale" },
      { id: 8, posti: 2, stato: "libero", ospite: "", ora: "", telefono: "", note: "" },
      { id: 9, posti: 4, stato: "occupato", ospite: "Greco", ora: "19:00", telefono: "320 4443322", note: "" },
      { id: 10, posti: 4, stato: "prenotato", ospite: "Romano", ora: "21:30", telefono: "333 8887766", note: "2 bambini" },
      { id: 11, posti: 2, stato: "libero", ospite: "", ora: "", telefono: "", note: "" },
      { id: 12, posti: 8, stato: "prenotato", ospite: "Costa (VIP)", ora: "20:30", telefono: "335 1119999", note: "Cliente abituale, vino speciale" }
    ],
    ordini: [],
    nextOrdId: 1043,
    nextIncId: 5001,
    piatti: [
      { id: 1, nome: "Risotto al Tartufo Nero", cat: "Primi", prezzo: 24, attivo: true, desc: "Riso Carnaroli, tartufo nero pregiato, parmigiano 24 mesi" },
      { id: 2, nome: "Spaghetti alle Vongole", cat: "Primi", prezzo: 18, attivo: true, desc: "Spaghetti di Gragnano, vongole veraci, prezzemolo" },
      { id: 3, nome: "Tagliata di Manzo Angus", cat: "Secondi", prezzo: 28, attivo: true, desc: "Black Angus irlandese, rucola, grana, aceto balsamico" },
      { id: 4, nome: "Ossobuco alla Milanese", cat: "Secondi", prezzo: 26, attivo: true, desc: "Ossobuco di vitello, gremolada, risotto allo zafferano" },
      { id: 5, nome: "Carpaccio di Tonno", cat: "Antipasti", prezzo: 16, attivo: true, desc: "Tonno rosso, avocado, salsa di soia, sesamo" },
      { id: 6, nome: "Antipasto Misto", cat: "Antipasti", prezzo: 14, attivo: true, desc: "Selezione di salumi, formaggi, bruschette, olive" },
      { id: 7, nome: "Tiramisù Classico", cat: "Dolci", prezzo: 10, attivo: true, desc: "Mascarpone, savoiardi, caffè espresso, cacao" },
      { id: 8, nome: "Panna Cotta", cat: "Dolci", prezzo: 9, attivo: true, desc: "Panna cotta alla vaniglia, coulis di frutti di bosco" },
      { id: 9, nome: "Insalata Caesar", cat: "Insalate", prezzo: 13, attivo: true, desc: "Lattuga romana, pollo grigliato, parmigiano, crostini" },
      { id: 10, nome: "Bruschette al Pomodoro", cat: "Antipasti", prezzo: 8, attivo: true, desc: "Pane casereccio, pomodorini, basilico, olio EVO" },
      { id: 11, nome: "Acqua naturale 0.75L", cat: "Bevande", prezzo: 3, attivo: true, desc: "" },
      { id: 12, nome: "Vino Rosso della Casa 0.75L", cat: "Bevande", prezzo: 18, attivo: true, desc: "" },
      { id: 13, nome: "Caffè espresso", cat: "Bevande", prezzo: 2, attivo: true, desc: "" }
    ],
    staff: [
      { nome: "Marco Verdi", ruolo: "Chef Esecutivo", turno: "10:00–22:00", on: true, telefono: "333 1112233", email: "marco@osteria.it" },
      { nome: "Giulia Ferri", ruolo: "Sous Chef", turno: "14:00–23:00", on: true, telefono: "338 4445566", email: "giulia@osteria.it" },
      { nome: "Luca Bassi", ruolo: "Responsabile Sala", turno: "16:00–00:00", on: true, telefono: "340 7778899", email: "luca@osteria.it" },
      { nome: "Sara Neri", ruolo: "Cameriera", turno: "18:00–00:00", on: true, telefono: "347 1234567", email: "sara@osteria.it" },
      { nome: "Paolo Ricci", ruolo: "Barman", turno: "17:00–01:00", on: true, telefono: "351 9876543", email: "paolo@osteria.it" },
      { nome: "Anna Colombo", ruolo: "Cameriera", turno: "Giorno libero", on: false, telefono: "320 5556677", email: "anna@osteria.it" }
    ],
    incassi: generaIncassiDemo(),
    settings: {
      nome: "Osteria del Borgo", indirizzo: "Via Roma 42, Milano", telefono: "+39 02 1234 5678",
      email: "info@osteriadelborgo.it", piva: "IT12345678901", wifi: "OsteriaGuest / benvenuti2026",
      oraLunGio: "12:00 – 14:30, 19:00 – 23:00", oraVenSab: "12:00 – 14:30, 19:00 – 00:00",
      oraDom: "12:00 – 15:00 (solo pranzo)", cucina: "30 min prima della chiusura",
      bufferPren: "15", maxGruppo: "8",
      notifPren: true, notifOrdine: true, notifScorte: true, notifRitardo: false
    }
  };
}

// Genera 35 giorni di incassi finti realistici per popolare grafici e storico
function generaIncassiDemo() {
  const incassi = [];
  let nextId = 4001;
  const piattiBase = [
    { id: 1, nome: "Risotto al Tartufo Nero", prezzo: 24 },
    { id: 2, nome: "Spaghetti alle Vongole", prezzo: 18 },
    { id: 3, nome: "Tagliata di Manzo Angus", prezzo: 28 },
    { id: 5, nome: "Carpaccio di Tonno", prezzo: 16 },
    { id: 6, nome: "Antipasto Misto", prezzo: 14 },
    { id: 7, nome: "Tiramisù Classico", prezzo: 10 },
    { id: 8, nome: "Panna Cotta", prezzo: 9 },
    { id: 9, nome: "Insalata Caesar", prezzo: 13 },
    { id: 10, nome: "Bruschette al Pomodoro", prezzo: 8 },
    { id: 12, nome: "Vino Rosso della Casa 0.75L", prezzo: 18 },
    { id: 13, nome: "Caffè espresso", prezzo: 2 }
  ];
  const metodi = ["contanti", "carta", "carta", "carta", "contanti", "buoni"];
  const today = new Date();
  for (let g = 34; g >= 1; g--) {
    const d = new Date(today); d.setDate(d.getDate() - g);
    const day = d.getDay();
    // più scontrini venerdì/sabato, meno il lunedì
    const base = day === 5 || day === 6 ? 18 : day === 0 ? 14 : day === 1 ? 6 : 12;
    const nScontrini = base + Math.floor(Math.random() * 5);
    for (let s = 0; s < nScontrini; s++) {
      const nPiatti = 2 + Math.floor(Math.random() * 4);
      const items = [];
      for (let i = 0; i < nPiatti; i++) {
        const p = piattiBase[Math.floor(Math.random() * piattiBase.length)];
        const q = Math.random() > 0.8 ? 2 : 1;
        items.push({ piattoId: p.id, nome: p.nome, prezzo: p.prezzo, qta: q });
      }
      const subtot = items.reduce((a, i) => a + i.prezzo * i.qta, 0);
      const sconto = Math.random() > 0.85 ? Math.floor(subtot * 0.1) : 0;
      const totale = subtot - sconto;
      const oraH = 12 + Math.floor(Math.random() * 11);
      const oraM = Math.floor(Math.random() * 60);
      incassi.push({
        id: nextId++,
        data: dateStr(d),
        ora: `${String(oraH).padStart(2,"0")}:${String(oraM).padStart(2,"0")}`,
        tavolo: 1 + Math.floor(Math.random() * 12),
        coperti: nPiatti,
        items: items,
        subtotale: subtot,
        sconto: sconto,
        totale: totale,
        metodo: metodi[Math.floor(Math.random() * metodi.length)]
      });
    }
  }
  return incassi;
}

// ===== STATE =====
let data = loadData();
let menuFilter = "Tutti";
let resFilter = "Tutti";
let incFilter = "settimana"; // oggi, settimana, mese, tutto
let comandaCart = []; // array temporaneo per la modale comanda

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // safety: garantisco la presenza di tutti i campi
      const def = defaultData();
      return { ...def, ...parsed };
    }
  } catch (e) { console.warn("Reset dati: errore lettura localStorage"); }
  const d = defaultData();
  saveData(d);
  return d;
}
function saveData(d) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d || data)); } catch (e) {}
}
function resetDemo() {
  if (!confirm("Vuoi ripristinare i dati demo? Tutti i tuoi cambiamenti andranno persi.")) return;
  localStorage.removeItem(STORAGE_KEY);
  data = loadData();
  render();
  toast("Dati demo ripristinati");
}

// ===== UI HELPERS =====
function toast(msg, type = "success") {
  const t = $("toast");
  t.innerHTML = (type === "success" ? "✓ " : type === "error" ? "✕ " : "ℹ ") + msg;
  t.className = "toast show " + type;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.className = "toast", 3500);
}
function showModal(html, wide) {
  $("modalContent").innerHTML = `<button class="btn-close" onclick="closeModal()">✕</button>` + html;
  $("modalContent").className = "modal" + (wide ? " modal-wide" : "");
  $("modalOverlay").classList.add("show");
}
function closeModal() { $("modalOverlay").classList.remove("show"); }
$("modalOverlay").addEventListener("click", e => { if (e.target === $("modalOverlay")) closeModal(); });
function getAvatar(name) { return name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase(); }

// ===== NAVIGATION =====
$("sidebarNav").addEventListener("click", e => {
  const btn = e.target.closest(".nav-btn"); if (!btn) return;
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  const pg = btn.dataset.page;
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  $("pg-" + pg).classList.add("active");
  $("pageTitle").textContent = TITLES[pg][0];
  $("pageDesc").textContent = pg === "dashboard" ? `Riepilogo di oggi — ${todayHuman()}` : TITLES[pg][1];
});

// ===== RENDER ALL =====
function render() {
  saveData();
  renderDashboard();
  renderPrenotazioni();
  renderOrdini();
  renderIncassi();
  renderMenu();
  renderStaff();
  renderImpostazioni();
  $("badge-pren").textContent = data.tavoli.filter(t => t.stato === "prenotato").length;
  $("badge-ord").textContent = data.ordini.filter(o => o.stato !== "servito").length;
}

// ===== DASHBOARD =====
function renderDashboard() {
  const oggi = todayStr();
  const incassiOggi = data.incassi.filter(i => i.data === oggi);
  const totOggi = incassiOggi.reduce((a, i) => a + i.totale, 0);
  // confronto vs ieri
  const ieri = new Date(); ieri.setDate(ieri.getDate() - 1);
  const totIeri = data.incassi.filter(i => i.data === dateStr(ieri)).reduce((a, i) => a + i.totale, 0);
  const delta = totIeri > 0 ? Math.round(((totOggi - totIeri) / totIeri) * 100) : (totOggi > 0 ? 100 : 0);

  const occ = data.tavoli.filter(t => t.stato === "occupato");
  const pren = data.tavoli.filter(t => t.stato === "prenotato");
  const liberi = data.tavoli.filter(t => t.stato === "libero");
  const attivi = data.ordini.filter(o => o.stato !== "servito");
  const inCucina = data.ordini.filter(o => o.stato === "in preparazione");

  // grafico ultimi 7 giorni
  const settimana = [];
  for (let g = 6; g >= 0; g--) {
    const d = new Date(); d.setDate(d.getDate() - g);
    const tot = data.incassi.filter(i => i.data === dateStr(d)).reduce((a, i) => a + i.totale, 0);
    settimana.push({ data: d, totale: tot });
  }
  const maxSet = Math.max(...settimana.map(x => x.totale), 1);

  // piatti più venduti negli ultimi 30 giorni
  const trenta = new Date(); trenta.setDate(trenta.getDate() - 30);
  const incRecenti = data.incassi.filter(i => parseDate(i.data) >= trenta);
  const conteggio = {};
  incRecenti.forEach(inc => inc.items.forEach(it => {
    conteggio[it.nome] = (conteggio[it.nome] || 0) + it.qta;
  }));
  const topPiatti = Object.entries(conteggio).sort((a, b) => b[1] - a[1]).slice(0, 5);

  $("pg-dashboard").innerHTML = `
    <div class="stats-row">
      ${statCard("Incasso Oggi", fmt(totOggi), `${delta >= 0 ? "↑ +" : "↓ "}${Math.abs(delta)}% vs ieri`, delta >= 0, COLORS.accent, "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6")}
      ${statCard("Coperti Serviti", occ.reduce((a, t) => a + t.posti, 0).toString(), `${occ.length} tavoli occupati`, true, "#10b981", "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z")}
      ${statCard("Ordini Attivi", attivi.length.toString(), `${inCucina.length} in cucina`, true, "#f59e0b", "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2")}
      ${statCard("Prenotazioni", pren.length.toString(), `${liberi.length} tavoli liberi`, true, "#3b82f6", "M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18")}
    </div>
    <div class="grid-2-1">
      <div class="card">
        <div class="card-header"><h2>Incassi Settimanali</h2><span style="font-size:11px;color:var(--text-muted)">Ultimi 7 giorni</span></div>
        <div class="chart" style="display:flex;align-items:flex-end;gap:12px;height:200px;padding:8px 0">${settimana.map((s, i) => {
          const h = s.totale > 0 ? Math.max(10, (s.totale / maxSet) * 170) : 4;
          const isToday = i === 6;
          const bg = isToday ? "linear-gradient(180deg,#7c3aed,#a78bfa)" : "rgba(124,58,237,.45)";
          return `<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:8px;height:100%">
            <div title="${fmt(s.totale)}" style="width:100%;max-width:40px;height:${h}px;background:${bg};border-radius:6px 6px 0 0"></div>
            <span style="font-size:11px;color:#94a3b8;font-weight:500">${dayLabel(s.data)}</span>
          </div>`;
        }).join("")}</div>
      </div>
      <div class="card">
        <h2>Top Piatti (30gg)</h2>
        ${topPiatti.length ? topPiatti.map(([n, c], i) => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:11px 0;${i < topPiatti.length - 1 ? "border-bottom:1px solid var(--border-light)" : ""}">
            <div style="display:flex;align-items:center;gap:10px;min-width:0">
              <span style="width:24px;height:24px;border-radius:6px;background:var(--accent-light);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--accent);flex-shrink:0">${i + 1}</span>
              <span style="font-size:13px;font-weight:600;color:var(--text-dark);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${n}</span>
            </div>
            <span style="font-size:12px;color:var(--accent);font-weight:700;flex-shrink:0">${c}</span>
          </div>`).join("") : `<p style="color:var(--text-muted);font-size:13px;text-align:center;padding:30px 0">Nessun dato ancora.<br>Inizia a registrare incassi per popolare le statistiche.</p>`}
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h2>Mappa Tavoli</h2><button class="btn-add" onclick="modalNuovaPrenotazione()">+ Nuova Prenotazione</button></div>
      <div class="tables-grid">${data.tavoli.map(t => `
        <div class="table-cell" onclick="modalDettaglioTavolo(${t.id})" style="background:${COLORS[t.stato]}12;border-color:${COLORS[t.stato]}30">
          <div style="font-size:10px;font-weight:700;color:${COLORS[t.stato]};letter-spacing:1px">TAVOLO ${t.id}</div>
          <div style="font-size:22px;font-weight:800;color:var(--text-dark);margin:6px 0">${t.posti}<span style="font-size:12px;font-weight:500;color:var(--text-muted)">p</span></div>
          <div style="font-size:10px;color:var(--text-muted)">${t.stato === "libero" ? "Libero" : t.ospite}</div>
          ${t.ora ? `<div style="font-size:10px;color:${COLORS[t.stato]};font-weight:600;margin-top:2px">${t.ora}</div>` : ""}
        </div>`).join("")}</div>
    </div>`;
}

function statCard(label, value, change, up, color, iconPath) {
  return `<div class="stat-card" style="--sc:${color}"><div style="position:absolute;top:0;left:0;width:100%;height:3px;background:${color};border-radius:14px 14px 0 0"></div><div><div class="stat-label">${label}</div><div class="stat-value">${value}</div><div class="stat-change ${up ? "up" : "down"}">${change}</div></div><div class="stat-icon" style="background:${color}14"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"><path d="${iconPath}"/></svg></div></div>`;
}

// ===== PRENOTAZIONI =====
function renderPrenotazioni() {
  const filtered = resFilter === "Tutti" ? data.tavoli :
    resFilter === "Liberi" ? data.tavoli.filter(t => t.stato === "libero") :
    resFilter === "Prenotati" ? data.tavoli.filter(t => t.stato === "prenotato") :
    data.tavoli.filter(t => t.stato === "occupato");

  $("pg-prenotazioni").innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;flex-wrap:wrap;gap:12px">
      <div class="filters" id="res-filters">${["Tutti","Liberi","Prenotati","Occupati"].map(f => `<button class="filter-btn ${resFilter === f ? "active" : ""}" onclick="resFilter='${f}';render()">${f}</button>`).join("")}</div>
      <button class="btn-add" onclick="modalNuovaPrenotazione()">+ Nuova Prenotazione</button>
    </div>
    <div class="res-grid">${filtered.map(t => `
      <div class="res-card" onclick="modalDettaglioTavolo(${t.id})">
        <div class="bar" style="background:${COLORS[t.stato]}"></div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <span style="font-size:17px;font-weight:800;color:var(--text-dark)">Tavolo ${t.id}</span>
          <span class="status-badge" style="background:${COLORS[t.stato]}14;color:${COLORS[t.stato]}">${STATUS_IT[t.stato]}</span>
        </div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px">${t.posti} posti</div>
        ${t.ospite ? `<div style="font-size:14px;font-weight:600;color:var(--text-dark)">${t.ospite}</div>` : ""}
        ${t.ora ? `<div style="font-size:13px;color:${COLORS[t.stato]};font-weight:600;margin-top:2px">${t.ora}</div>` : ""}
        ${t.note ? `<div style="font-size:11px;color:var(--text-muted);margin-top:6px;font-style:italic">📝 ${t.note}</div>` : ""}
        ${t.stato === "libero" ? `<button class="btn-reserve" onclick="event.stopPropagation();modalNuovaPrenotazione(${t.id})">+ PRENOTA</button>` : ""}
      </div>`).join("")}</div>`;
}

function modalNuovaPrenotazione(preselect) {
  const free = data.tavoli.filter(t => t.stato === "libero");
  if (!free.length) { toast("Nessun tavolo disponibile", "error"); return; }
  showModal(`
    <h2>Nuova Prenotazione</h2>
    <p class="modal-sub">Inserisci i dettagli della prenotazione</p>
    <div class="form-row">
      <div><label>Tavolo</label><select id="m-table">${free.map(t => `<option value="${t.id}" ${t.id === preselect ? "selected" : ""}>Tavolo ${t.id} — ${t.posti} posti</option>`).join("")}</select></div>
      <div><label>Orario</label><input id="m-time" type="time" value="20:00"></div>
    </div>
    <label>Nome cliente</label><input id="m-name" placeholder="Es. Rossi">
    <label>Telefono</label><input id="m-phone" placeholder="333 1234567">
    <label>Note</label><input id="m-notes" placeholder="Es. Compleanno, allergie, tavolo finestra">
    <div class="modal-actions"><button class="btn-cancel" onclick="closeModal()">Annulla</button><button class="btn-save" onclick="salvaPrenotazione()">Conferma Prenotazione</button></div>
  `);
}

function salvaPrenotazione() {
  const id = parseInt($("m-table").value);
  const name = $("m-name").value.trim();
  if (!name) { toast("Inserisci il nome del cliente", "error"); return; }
  const t = data.tavoli.find(x => x.id === id);
  t.stato = "prenotato"; t.ospite = name; t.ora = $("m-time").value;
  t.telefono = $("m-phone").value.trim(); t.note = $("m-notes").value.trim();
  closeModal(); render(); toast(`Prenotazione confermata per Tavolo ${id}`);
}

function modalDettaglioTavolo(id) {
  const t = data.tavoli.find(x => x.id === id);
  const ordiniTavolo = data.ordini.filter(o => o.tavolo === id && !o.pagato);
  const totConto = calcolaTotaleTavolo(id);
  showModal(`
    <h2>Tavolo ${t.id}</h2>
    <p class="modal-sub">${t.posti} posti · <span style="color:${COLORS[t.stato]};font-weight:700">${STATUS_IT[t.stato]}</span></p>
    ${t.ospite ? `
    <div class="modal-section">
      <h3>Cliente</h3>
      <p><strong>${t.ospite}</strong></p>
      ${t.ora ? `<p style="color:var(--text-muted);font-size:13px;margin-top:4px">Orario: ${t.ora}</p>` : ""}
      ${t.telefono ? `<p style="color:var(--text-muted);font-size:13px">Telefono: ${t.telefono}</p>` : ""}
      ${t.note ? `<p style="color:var(--text-muted);font-size:13px;margin-top:6px;font-style:italic">📝 ${t.note}</p>` : ""}
    </div>` : ""}
    ${ordiniTavolo.length ? `
    <div class="modal-section">
      <h3>Ordini Attivi · Totale: ${fmt(totConto)}</h3>
      ${ordiniTavolo.map(o => `<div style="padding:12px;background:var(--bg);border-radius:8px;margin-bottom:8px;border-left:3px solid ${COLORS[o.stato]}">
        <div style="display:flex;justify-content:space-between;align-items:center"><div style="font-size:12px;font-weight:700;color:var(--text-dark)">#${o.id} — <span style="color:${COLORS[o.stato]}">${ORD_IT[o.stato]}</span></div><div style="font-size:13px;font-weight:700;color:var(--text-dark)">${fmt(calcolaTotaleOrdine(o))}</div></div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:4px">${o.items ? o.items.map(i => `${i.nome}${i.qta > 1 ? ` ×${i.qta}` : ""}`).join(", ") : (o.piatti || []).join(", ")}</div>
      </div>`).join("")}
    </div>` : ""}
    <div class="modal-actions" style="flex-wrap:wrap;gap:8px">
      ${t.stato === "libero" ? `<button class="btn-save" onclick="closeModal();modalNuovaPrenotazione(${t.id})">Prenota</button>` : ""}
      ${t.stato === "prenotato" ? `<button class="btn-save" style="background:var(--green-gradient)" onclick="cambiaStatoTavolo(${t.id},'occupato')">Accomoda Ospiti</button><button class="btn-cancel" onclick="cambiaStatoTavolo(${t.id},'libero')">Cancella Prenotazione</button>` : ""}
      ${t.stato === "occupato" ? `
        <button class="btn-save" onclick="closeModal();modalNuovaComanda(${t.id})">+ Nuova Comanda</button>
        ${totConto > 0
          ? `<button class="btn-save" style="background:linear-gradient(135deg,#10b981,#059669)" onclick="closeModal();modalIncassa(${t.id})">💳 Fai il Conto · ${fmt(totConto)}</button>`
          : `<button class="btn-cancel" style="border-color:var(--red);color:var(--red)" onclick="cambiaStatoTavolo(${t.id},'libero')">Libera Tavolo</button>`
        }
      ` : ""}
    </div>
  `);
}

function cambiaStatoTavolo(id, stato) {
  const t = data.tavoli.find(x => x.id === id);
  if (stato === "libero") {
    // se ci sono ordini non pagati, avvisa
    const aperti = data.ordini.filter(o => o.tavolo === id && !o.pagato);
    if (aperti.length && !confirm(`Il tavolo ha ${aperti.length} ordini ancora da pagare. Libero comunque (ordini cancellati)?`)) return;
    data.ordini = data.ordini.filter(o => o.tavolo !== id || o.pagato);
    t.stato = "libero"; t.ospite = ""; t.ora = ""; t.telefono = ""; t.note = "";
  } else { t.stato = stato; }
  closeModal(); render();
  toast(`Tavolo ${id} → ${STATUS_IT[stato]}`);
}

function calcolaTotaleOrdine(o) {
  if (o.items) return o.items.reduce((a, i) => a + i.prezzo * i.qta, 0);
  return 0;
}
function calcolaTotaleTavolo(id) {
  return data.ordini.filter(o => o.tavolo === id && !o.pagato).reduce((a, o) => a + calcolaTotaleOrdine(o), 0);
}

// ===== ORDINI =====
function renderOrdini() {
  const counts = { nuovo: 0, "in preparazione": 0, pronto: 0, servito: 0 };
  data.ordini.forEach(o => counts[o.stato]++);

  $("pg-ordini").innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;flex-wrap:wrap;gap:12px">
      <div class="orders-status">
        ${[["Nuovi", counts.nuovo, COLORS.nuovo], ["In Preparazione", counts["in preparazione"], COLORS["in preparazione"]], ["Pronti", counts.pronto, COLORS.pronto], ["Serviti", counts.servito, COLORS.servito]].map(([l, c, col]) => `
          <div class="os-card"><div style="display:flex;align-items:center"><span class="dot" style="background:${col}"></span><span class="os-label">${l}</span></div><span class="os-count" style="color:${col}">${c}</span></div>`).join("")}
      </div>
      <button class="btn-add" onclick="modalNuovaComanda()">+ Nuova Comanda</button>
    </div>
    <div class="orders-grid">${data.ordini.map(o => {
      const tot = calcolaTotaleOrdine(o);
      const items = o.items || (o.piatti || []).map(p => ({ nome: p, qta: 1, prezzo: 0 }));
      return `<div class="order-card" style="border-left-color:${COLORS[o.stato]}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;gap:8px">
          <div style="min-width:0">
            <span style="font-size:17px;font-weight:800;color:var(--text-dark)">#${o.id}</span>
            <span style="font-size:13px;color:var(--text-muted);margin-left:8px">Tavolo ${o.tavolo}</span>
            ${data.tavoli.find(t => t.id === o.tavolo)?.ospite ? `<span style="font-size:11px;color:var(--accent);margin-left:4px">· ${data.tavoli.find(t => t.id === o.tavolo).ospite}</span>` : ""}
          </div>
          <span class="order-status-pill" style="background:${COLORS[o.stato]}14;color:${COLORS[o.stato]};flex-shrink:0">${ORD_IT[o.stato]}</span>
        </div>
        <div style="margin-bottom:14px">${items.map(i => `<div class="order-item"><span>${i.nome}${i.qta > 1 ? ` <span style="color:var(--accent)">×${i.qta}</span>` : ""}</span>${i.prezzo ? `<span style="float:right;color:var(--text-muted);font-size:11px">${fmt(i.prezzo * i.qta)}</span>` : ""}</div>`).join("")}</div>
        ${tot ? `<div style="font-size:13px;font-weight:700;color:var(--text-dark);margin-bottom:10px;text-align:right">Totale ${fmt(tot)}</div>` : ""}
        ${o.note ? `<div style="font-size:11px;color:var(--text-muted);margin-bottom:12px;padding:8px 12px;background:var(--bg);border-radius:6px;font-style:italic">📝 ${o.note}</div>` : ""}
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:12px;color:var(--text-muted)">⏱ ${o.tempo}</span>
          <div style="display:flex;gap:6px">
            ${ORD_BTN[o.stato] ? `<button class="btn-action" style="background:${ORD_BTN_COLOR[o.stato]}" onclick="avanzaOrdine(${o.id})">${ORD_BTN[o.stato]}</button>` : ""}
            ${o.stato !== "servito" ? `<button class="btn-sm danger" onclick="eliminaOrdine(${o.id})">Annulla</button>` : ""}
          </div>
        </div>
      </div>`;
    }).join("")}</div>`;
}

// modale comanda con piatti scelti dal menu
function modalNuovaComanda(preselTavolo) {
  const occupati = data.tavoli.filter(t => t.stato === "occupato");
  if (!occupati.length) { toast("Nessun tavolo occupato. Accomoda prima gli ospiti.", "error"); return; }
  comandaCart = [];
  renderModalComanda(preselTavolo || occupati[0].id);
}

function renderModalComanda(tavoloSel) {
  const occupati = data.tavoli.filter(t => t.stato === "occupato");
  const attivi = data.piatti.filter(p => p.attivo);
  const categorie = [...new Set(attivi.map(p => p.cat))];
  const tot = comandaCart.reduce((a, c) => {
    const p = data.piatti.find(pp => pp.id === c.piattoId);
    return a + (p ? p.prezzo * c.qta : 0);
  }, 0);

  showModal(`
    <h2>Nuova Comanda</h2>
    <p class="modal-sub">Seleziona piatti dal menu, regola le quantità, invia in cucina</p>
    <div class="form-row">
      <div><label>Tavolo</label><select id="m-otable" onchange="renderModalComanda(parseInt(this.value))">${occupati.map(t => `<option value="${t.id}" ${t.id === tavoloSel ? "selected" : ""}>Tavolo ${t.id} — ${t.ospite}</option>`).join("")}</select></div>
      <div><label>Priorità</label><select id="m-oprio"><option value="normale">Normale</option><option value="alta">Alta — Urgente</option></select></div>
    </div>

    <div class="comanda-layout">
      <div class="comanda-menu">
        <label style="margin-bottom:8px">Menu disponibile</label>
        ${categorie.map(cat => {
          const cc = CAT_COLORS[cat] || ["#f1f5f9", "#475569"];
          return `<div style="margin-bottom:14px">
            <div style="font-size:11px;font-weight:700;letter-spacing:1px;color:${cc[1]};text-transform:uppercase;margin-bottom:6px">${cat}</div>
            ${attivi.filter(p => p.cat === cat).map(p => `
              <div class="menu-item-row" onclick="addToCart(${p.id})">
                <div style="min-width:0">
                  <div style="font-size:13px;font-weight:600;color:var(--text-dark);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.nome}</div>
                  <div style="font-size:11px;color:var(--text-muted)">${fmt(p.prezzo)}</div>
                </div>
                <span class="menu-item-plus">+</span>
              </div>
            `).join("")}
          </div>`;
        }).join("")}
      </div>
      <div class="comanda-cart">
        <label style="margin-bottom:8px">Comanda · ${comandaCart.length} piatti</label>
        ${comandaCart.length ? comandaCart.map((c, idx) => {
          const p = data.piatti.find(pp => pp.id === c.piattoId); if (!p) return "";
          return `<div class="cart-row">
            <div style="min-width:0;flex:1">
              <div style="font-size:12px;font-weight:600;color:var(--text-dark);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.nome}</div>
              <div style="font-size:11px;color:var(--text-muted)">${fmt(p.prezzo)} cad.</div>
            </div>
            <div class="qty-ctrl">
              <button onclick="changeQty(${idx},-1)">−</button>
              <span>${c.qta}</span>
              <button onclick="changeQty(${idx},1)">+</button>
            </div>
            <div style="font-size:12px;font-weight:700;color:var(--text-dark);min-width:48px;text-align:right">${fmt(p.prezzo * c.qta)}</div>
          </div>`;
        }).join("") : `<div style="text-align:center;padding:32px 12px;color:var(--text-muted);font-size:12px">Clicca sui piatti dal menu a sinistra</div>`}
        <div class="cart-total"><span>Totale</span><span>${fmt(tot)}</span></div>
      </div>
    </div>

    <label style="margin-top:14px">Note per la cucina</label>
    <input id="m-onotes" placeholder="Es. No cipolla, allergia glutine, conto separato...">
    <div class="modal-actions"><button class="btn-cancel" onclick="closeModal()">Annulla</button><button class="btn-save" onclick="salvaComanda()">Invia in Cucina · ${fmt(tot)}</button></div>
  `, true);
}

function addToCart(piattoId) {
  const ex = comandaCart.find(c => c.piattoId === piattoId);
  if (ex) ex.qta++; else comandaCart.push({ piattoId, qta: 1 });
  const sel = $("m-otable"); const tav = sel ? parseInt(sel.value) : null;
  renderModalComanda(tav);
}
function changeQty(idx, delta) {
  comandaCart[idx].qta += delta;
  if (comandaCart[idx].qta <= 0) comandaCart.splice(idx, 1);
  const sel = $("m-otable"); const tav = sel ? parseInt(sel.value) : null;
  renderModalComanda(tav);
}

function salvaComanda() {
  if (!comandaCart.length) { toast("Aggiungi almeno un piatto", "error"); return; }
  const tid = parseInt($("m-otable").value);
  const notes = $("m-onotes").value.trim();
  const items = comandaCart.map(c => {
    const p = data.piatti.find(pp => pp.id === c.piattoId);
    return { piattoId: p.id, nome: p.nome, prezzo: p.prezzo, qta: c.qta };
  });
  data.ordini.unshift({ id: data.nextOrdId++, tavolo: tid, items, stato: "nuovo", tempo: "Ora", note: notes, pagato: false });
  comandaCart = [];
  closeModal(); render(); toast(`Comanda #${data.nextOrdId - 1} inviata in cucina`);
}

function avanzaOrdine(id) {
  const o = data.ordini.find(x => x.id === id);
  const next = ORD_NEXT[o.stato]; if (!next) return;
  o.stato = next;
  o.tempo = next === "in preparazione" ? "Appena iniziato" : next === "pronto" ? "Pronto!" : "Completato";
  render(); toast(`Ordine #${id} → ${ORD_IT[next]}`);
}

function eliminaOrdine(id) {
  data.ordini = data.ordini.filter(o => o.id !== id);
  render(); toast(`Ordine #${id} annullato`, "info");
}

// ===== INCASSO TAVOLO =====
function modalIncassa(tavoloId) {
  const t = data.tavoli.find(x => x.id === tavoloId);
  const ordiniTav = data.ordini.filter(o => o.tavolo === tavoloId && !o.pagato);
  if (!ordiniTav.length) { toast("Nessun ordine da incassare", "error"); return; }

  // raccolgo tutti gli items di tutti gli ordini
  const allItems = [];
  ordiniTav.forEach(o => (o.items || []).forEach(i => allItems.push({ ...i })));
  const subtot = allItems.reduce((a, i) => a + i.prezzo * i.qta, 0);

  showModal(`
    <h2>Conto Tavolo ${t.id}</h2>
    <p class="modal-sub">Cliente: <strong>${t.ospite || "—"}</strong> · ${ordiniTav.length} ordini</p>

    <div class="modal-section">
      <h3>Riepilogo</h3>
      <div class="receipt">
        ${allItems.map(i => `<div class="receipt-row"><span>${i.nome}${i.qta > 1 ? ` ×${i.qta}` : ""}</span><span>${fmt(i.prezzo * i.qta)}</span></div>`).join("")}
      </div>
      <div class="receipt-sep"></div>
      <div class="receipt-row" style="font-size:13px"><span>Subtotale</span><span id="r-subtot">${fmt(subtot)}</span></div>
    </div>

    <div class="form-row" style="margin-top:14px">
      <div><label>Sconto (€)</label><input type="number" id="m-sconto" min="0" step="0.5" value="0" oninput="aggiornaTotaleIncasso(${subtot})"></div>
      <div><label>Sconto (%)</label><input type="number" id="m-sconto-pct" min="0" max="50" step="1" value="0" oninput="applicaScontoPct(${subtot})"></div>
    </div>

    <label style="margin-top:14px">Metodo di pagamento</label>
    <div class="pag-grid">
      ${Object.entries(PAGAMENTI).map(([k, v], i) => `
        <label class="pag-opt" style="--col:${PAG_COLORS[k]}">
          <input type="radio" name="m-pag" value="${k}" ${i === 1 ? "checked" : ""}>
          <span class="pag-bullet"></span>
          <span class="pag-label">${v}</span>
        </label>
      `).join("")}
    </div>

    <label style="margin-top:14px">Data incasso</label>
    <input type="date" id="m-incdata" value="${todayStr()}" max="${todayStr()}">

    <div class="big-total"><span>Totale da incassare</span><span id="r-totale">${fmt(subtot)}</span></div>

    <div class="modal-actions">
      <button class="btn-cancel" onclick="closeModal()">Annulla</button>
      <button class="btn-save" style="background:linear-gradient(135deg,#10b981,#059669)" onclick="confermaIncasso(${tavoloId})">✓ Incassa e Libera Tavolo</button>
    </div>
  `, true);
}

function aggiornaTotaleIncasso(subtot) {
  const sc = parseFloat($("m-sconto").value) || 0;
  const tot = Math.max(0, subtot - sc);
  $("r-totale").textContent = fmt(tot);
}
function applicaScontoPct(subtot) {
  const pct = parseFloat($("m-sconto-pct").value) || 0;
  const sc = subtot * (pct / 100);
  $("m-sconto").value = sc.toFixed(2);
  aggiornaTotaleIncasso(subtot);
}

function confermaIncasso(tavoloId) {
  const t = data.tavoli.find(x => x.id === tavoloId);
  const ordiniTav = data.ordini.filter(o => o.tavolo === tavoloId && !o.pagato);
  const allItems = [];
  ordiniTav.forEach(o => (o.items || []).forEach(i => allItems.push({ ...i })));
  const subtot = allItems.reduce((a, i) => a + i.prezzo * i.qta, 0);
  const sconto = parseFloat($("m-sconto").value) || 0;
  const totale = Math.max(0, subtot - sconto);
  const metodo = document.querySelector("input[name='m-pag']:checked").value;
  const dataInc = $("m-incdata").value || todayStr();

  data.incassi.unshift({
    id: data.nextIncId++,
    data: dataInc,
    ora: new Date().toTimeString().slice(0, 5),
    tavolo: tavoloId,
    coperti: t.posti,
    items: allItems,
    subtotale: subtot,
    sconto: sconto,
    totale: totale,
    metodo: metodo
  });

  // marca ordini come pagati + serviti, libera tavolo
  ordiniTav.forEach(o => { o.pagato = true; o.stato = "servito"; o.tempo = "Completato"; });
  t.stato = "libero"; t.ospite = ""; t.ora = ""; t.telefono = ""; t.note = "";

  closeModal(); render();
  toast(`Incasso registrato: ${fmt(totale)} · ${PAGAMENTI[metodo]}`);
}

// ===== INCASSI (PAGINA) =====
function renderIncassi() {
  const oggi = new Date();
  let from;
  if (incFilter === "oggi") { from = new Date(oggi); from.setHours(0,0,0,0); }
  else if (incFilter === "settimana") { from = new Date(oggi); from.setDate(from.getDate() - 6); from.setHours(0,0,0,0); }
  else if (incFilter === "mese") { from = new Date(oggi); from.setDate(from.getDate() - 29); from.setHours(0,0,0,0); }
  else { from = new Date(0); }

  const filtered = data.incassi.filter(i => parseDate(i.data) >= from);
  const totale = filtered.reduce((a, i) => a + i.totale, 0);
  const numScontrini = filtered.length;
  const totCoperti = filtered.reduce((a, i) => a + i.coperti, 0);
  const scontrinoMedio = numScontrini > 0 ? totale / numScontrini : 0;

  // ripartizione per metodo
  const perMetodo = {};
  Object.keys(PAGAMENTI).forEach(k => perMetodo[k] = 0);
  filtered.forEach(i => perMetodo[i.metodo] = (perMetodo[i.metodo] || 0) + i.totale);
  const totMetodo = Object.values(perMetodo).reduce((a, b) => a + b, 0) || 1;

  // grafico per giorno (ultimi N giorni in base al filtro)
  const nGiorni = incFilter === "oggi" ? 1 : incFilter === "settimana" ? 7 : 30;
  const graf = [];
  for (let g = nGiorni - 1; g >= 0; g--) {
    const d = new Date(oggi); d.setDate(d.getDate() - g);
    const tot = data.incassi.filter(i => i.data === dateStr(d)).reduce((a, i) => a + i.totale, 0);
    graf.push({ data: d, totale: tot });
  }
  const maxG = Math.max(...graf.map(x => x.totale), 1);

  // top piatti per ricavo nel periodo
  const ricaviPiatti = {};
  filtered.forEach(inc => inc.items.forEach(it => {
    if (!ricaviPiatti[it.nome]) ricaviPiatti[it.nome] = { ricavo: 0, qta: 0 };
    ricaviPiatti[it.nome].ricavo += it.prezzo * it.qta;
    ricaviPiatti[it.nome].qta += it.qta;
  }));
  const topRicavi = Object.entries(ricaviPiatti).sort((a, b) => b[1].ricavo - a[1].ricavo).slice(0, 6);

  $("pg-incassi").innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;flex-wrap:wrap;gap:12px">
      <div class="filters">${[["oggi","Oggi"],["settimana","Ultimi 7 gg"],["mese","Ultimi 30 gg"],["tutto","Tutto"]].map(([k, l]) => `<button class="filter-btn ${incFilter === k ? "active" : ""}" onclick="incFilter='${k}';render()">${l}</button>`).join("")}</div>
      <div style="font-size:12px;color:var(--text-muted)">${filtered.length} scontrini · ${totCoperti} coperti</div>
    </div>

    <div class="stats-row">
      ${statCard("Totale Incassato", fmt(totale), `${numScontrini} scontrini nel periodo`, true, "#10b981", "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6")}
      ${statCard("Scontrino Medio", fmt(scontrinoMedio), `Su ${numScontrini || 0} scontrini`, true, COLORS.accent, "M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z")}
      ${statCard("Coperti Totali", totCoperti.toString(), `Media ${(totCoperti / (numScontrini || 1)).toFixed(1)} per scontrino`, true, "#3b82f6", "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z")}
      ${statCard("Per Coperto", fmt(totCoperti > 0 ? totale / totCoperti : 0), `Spesa media a persona`, true, "#f59e0b", "M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z")}
    </div>

    <div class="grid-2-1">
      <div class="card">
        <div class="card-header"><h2>Andamento ${incFilter === "mese" ? "ultimi 30 giorni" : incFilter === "settimana" ? "ultimi 7 giorni" : incFilter === "oggi" ? "di oggi" : "completo"}</h2><span style="font-size:11px;color:var(--text-muted)">Totale ${fmt(totale)}</span></div>
        <div class="chart" style="display:flex;align-items:flex-end;gap:${nGiorni > 14 ? "3" : "12"}px;height:200px;padding:8px 0">${graf.map((s, i) => {
          const h = s.totale > 0 ? Math.max(6, (s.totale / maxG) * 170) : 3;
          const isLast = i === graf.length - 1;
          const bg = isLast ? "linear-gradient(180deg,#7c3aed,#a78bfa)" : "rgba(124,58,237,.45)";
          return `<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:8px;height:100%">
            <div title="${dateStr(s.data)}: ${fmt(s.totale)}" style="width:100%;max-width:40px;height:${h}px;background:${bg};border-radius:6px 6px 0 0"></div>
            <span style="font-size:${nGiorni > 14 ? "9" : "11"}px;color:#94a3b8;font-weight:500">${nGiorni > 14 ? s.data.getDate() : dayLabel(s.data)}</span>
          </div>`;
        }).join("")}</div>
      </div>
      <div class="card">
        <h2>Metodi di Pagamento</h2>
        ${Object.entries(perMetodo).map(([k, v]) => {
          const pct = totMetodo > 0 ? Math.round((v / totMetodo) * 100) : 0;
          return `<div style="margin-bottom:14px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
              <span style="font-size:12px;font-weight:600;color:var(--text-dark)">${PAGAMENTI[k]}</span>
              <span style="font-size:12px;color:var(--text-muted)">${fmt(v)} · ${pct}%</span>
            </div>
            <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${PAG_COLORS[k]}"></div></div>
          </div>`;
        }).join("")}
      </div>
    </div>

    <div class="grid-2-1">
      <div class="card">
        <div class="card-header"><h2>Ultimi scontrini</h2><span style="font-size:11px;color:var(--text-muted)">Clicca per dettaglio</span></div>
        <div style="overflow-x:auto">
          <table class="menu-table" style="margin-top:0">
            <thead><tr><th>#</th><th>Data</th><th>Ora</th><th>Tavolo</th><th>Cop.</th><th>Pagamento</th><th style="text-align:right">Totale</th></tr></thead>
            <tbody>${filtered.slice(0, 15).map(i => `
              <tr style="cursor:pointer" onclick="modalDettaglioIncasso(${i.id})">
                <td style="font-weight:700;color:var(--text-dark)">#${i.id}</td>
                <td style="font-size:12px;color:var(--text-muted)">${i.data.split("-").reverse().join("/")}</td>
                <td style="font-size:12px;color:var(--text-muted)">${i.ora}</td>
                <td style="font-size:12px">Tav. ${i.tavolo}</td>
                <td style="font-size:12px">${i.coperti}</td>
                <td><span class="cat-pill" style="background:${PAG_COLORS[i.metodo]}14;color:${PAG_COLORS[i.metodo]}">${PAGAMENTI[i.metodo]}</span></td>
                <td style="font-weight:700;color:var(--text-dark);text-align:right">${fmt(i.totale)}</td>
              </tr>
            `).join("")}</tbody>
          </table>
        </div>
        ${filtered.length === 0 ? `<p style="text-align:center;padding:30px;color:var(--text-muted);font-size:13px">Nessun incasso nel periodo selezionato.</p>` : ""}
      </div>
      <div class="card">
        <h2>Top Piatti (ricavo)</h2>
        ${topRicavi.length ? topRicavi.map(([n, d], i) => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:11px 0;${i < topRicavi.length - 1 ? "border-bottom:1px solid var(--border-light)" : ""}">
            <div style="display:flex;align-items:center;gap:10px;min-width:0">
              <span style="width:24px;height:24px;border-radius:6px;background:var(--accent-light);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--accent);flex-shrink:0">${i + 1}</span>
              <div style="min-width:0">
                <div style="font-size:13px;font-weight:600;color:var(--text-dark);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${n}</div>
                <div style="font-size:10px;color:var(--text-muted)">${d.qta} venduti</div>
              </div>
            </div>
            <span style="font-size:12px;color:var(--accent);font-weight:700;flex-shrink:0">${fmt(d.ricavo)}</span>
          </div>`).join("") : `<p style="color:var(--text-muted);font-size:13px;text-align:center;padding:30px 0">Nessun dato nel periodo.</p>`}
      </div>
    </div>
  `;
}

function modalDettaglioIncasso(id) {
  const i = data.incassi.find(x => x.id === id); if (!i) return;
  showModal(`
    <h2>Scontrino #${i.id}</h2>
    <p class="modal-sub">${i.data.split("-").reverse().join("/")} · ${i.ora} · Tavolo ${i.tavolo} · ${i.coperti} coperti</p>
    <div class="modal-section">
      <h3>Dettaglio</h3>
      <div class="receipt">
        ${i.items.map(it => `<div class="receipt-row"><span>${it.nome}${it.qta > 1 ? ` ×${it.qta}` : ""}</span><span>${fmt(it.prezzo * it.qta)}</span></div>`).join("")}
      </div>
      <div class="receipt-sep"></div>
      <div class="receipt-row"><span>Subtotale</span><span>${fmt(i.subtotale)}</span></div>
      ${i.sconto > 0 ? `<div class="receipt-row" style="color:#10b981"><span>Sconto</span><span>− ${fmt(i.sconto)}</span></div>` : ""}
      <div class="receipt-row" style="font-size:16px;font-weight:800;color:var(--text-dark);margin-top:8px"><span>Totale</span><span>${fmt(i.totale)}</span></div>
      <div style="margin-top:14px"><span class="cat-pill" style="background:${PAG_COLORS[i.metodo]}14;color:${PAG_COLORS[i.metodo]}">${PAGAMENTI[i.metodo]}</span></div>
    </div>
    <div class="modal-actions"><button class="btn-cancel" onclick="closeModal()">Chiudi</button></div>
  `);
}

// ===== MENU =====
function renderMenu() {
  const filtered = menuFilter === "Tutti" ? data.piatti : data.piatti.filter(p => p.cat === menuFilter);
  $("pg-menu").innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;flex-wrap:wrap;gap:12px">
      <div class="filters">${["Tutti","Antipasti","Primi","Secondi","Dolci","Insalate","Bevande"].map(f => `<button class="filter-btn ${menuFilter === f ? "active" : ""}" onclick="menuFilter='${f}';render()">${f}</button>`).join("")}</div>
      <button class="btn-add" onclick="modalPiatto()">+ Aggiungi Piatto</button>
    </div>
    <div class="card" style="padding:0;overflow:hidden">
      <table class="menu-table"><thead><tr><th>Piatto</th><th>Categoria</th><th>Prezzo</th><th>Disponibile</th><th>Azioni</th></tr></thead>
      <tbody>${filtered.map(m => {
        const idx = data.piatti.indexOf(m);
        const cc = CAT_COLORS[m.cat] || ["#f1f5f9", "#475569"];
        return `<tr>
          <td><div style="font-weight:700;color:var(--text-dark)">${m.nome}</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px">${m.desc || ""}</div></td>
          <td><span class="cat-pill" style="background:${cc[0]};color:${cc[1]}">${m.cat}</span></td>
          <td style="font-weight:700;color:var(--text-dark);font-size:15px">${fmt(m.prezzo)}</td>
          <td><div class="toggle" style="background:${m.attivo ? "var(--green)" : "var(--border)"}" onclick="togglePiatto(${idx})"><div class="dot" style="left:${m.attivo ? "21px" : "3px"}"></div></div></td>
          <td><button class="btn-sm" onclick="modalPiatto(${idx})">Modifica</button> <button class="btn-sm danger" onclick="eliminaPiatto(${idx})">Elimina</button></td>
        </tr>`;
      }).join("")}</tbody></table>
    </div>
    <div style="margin-top:16px;padding:16px 20px;background:var(--white);border-radius:var(--radius);border:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
      <span style="font-size:13px;color:var(--text-muted)">${data.piatti.length} piatti totali · ${data.piatti.filter(p => p.attivo).length} disponibili · ${data.piatti.filter(p => !p.attivo).length} non disponibili</span>
    </div>`;
}

function togglePiatto(idx) { data.piatti[idx].attivo = !data.piatti[idx].attivo; render(); }

function modalPiatto(idx) {
  const isNew = idx === undefined;
  const p = isNew ? { nome: "", cat: "Primi", prezzo: 15, attivo: true, desc: "" } : data.piatti[idx];
  showModal(`
    <h2>${isNew ? "Nuovo Piatto" : "Modifica Piatto"}</h2>
    <p class="modal-sub">${isNew ? "Aggiungi un piatto al menu" : `Modifica ${p.nome}`}</p>
    <label>Nome</label><input id="mp-nome" value="${p.nome}">
    <div class="form-row">
      <div><label>Categoria</label><select id="mp-cat">${["Antipasti","Primi","Secondi","Dolci","Insalate","Bevande"].map(c => `<option value="${c}" ${c === p.cat ? "selected" : ""}>${c}</option>`).join("")}</select></div>
      <div><label>Prezzo (€)</label><input type="number" step="0.5" min="0" id="mp-prezzo" value="${p.prezzo}"></div>
    </div>
    <label>Descrizione</label><input id="mp-desc" value="${p.desc || ""}">
    <div class="modal-actions"><button class="btn-cancel" onclick="closeModal()">Annulla</button><button class="btn-save" onclick="salvaPiatto(${isNew ? -1 : idx})">${isNew ? "Aggiungi" : "Salva"}</button></div>
  `);
}

function salvaPiatto(idx) {
  const nome = $("mp-nome").value.trim();
  if (!nome) { toast("Inserisci il nome del piatto", "error"); return; }
  const obj = {
    id: idx === -1 ? Date.now() : data.piatti[idx].id,
    nome,
    cat: $("mp-cat").value,
    prezzo: parseFloat($("mp-prezzo").value) || 0,
    attivo: idx === -1 ? true : data.piatti[idx].attivo,
    desc: $("mp-desc").value.trim()
  };
  if (idx === -1) data.piatti.push(obj); else data.piatti[idx] = obj;
  closeModal(); render(); toast(idx === -1 ? "Piatto aggiunto" : "Piatto aggiornato");
}

function eliminaPiatto(idx) {
  if (!confirm("Eliminare questo piatto dal menu?")) return;
  data.piatti.splice(idx, 1); render(); toast("Piatto eliminato", "info");
}

// ===== STAFF =====
function renderStaff() {
  $("pg-staff").innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;flex-wrap:wrap;gap:12px">
      <div style="font-size:13px;color:var(--text-muted)">${data.staff.filter(s => s.on).length} in servizio · ${data.staff.length} totali</div>
    </div>
    <div class="staff-grid">${data.staff.map((s, i) => `
      <div class="staff-card">
        <div class="staff-avatar" style="background:${STAFF_COLORS[i % STAFF_COLORS.length]}">${getAvatar(s.nome)}</div>
        <h3>${s.nome}</h3>
        <p class="staff-role">${s.ruolo}</p>
        <div class="staff-info">
          <div><span class="lbl">📞</span> ${s.telefono}</div>
          <div><span class="lbl">✉</span> ${s.email}</div>
          <div><span class="lbl">⏰</span> ${s.turno}</div>
        </div>
        <div class="staff-status ${s.on ? "on" : "off"}"><span class="dot"></span>${s.on ? "In servizio" : "Non in servizio"}</div>
      </div>`).join("")}</div>`;
}

// ===== IMPOSTAZIONI =====
function renderImpostazioni() {
  $("pg-impostazioni").innerHTML = `
    <div class="settings-grid">
      <div class="settings-card">
        <h3>🏠 Info Ristorante</h3>
        ${settingsField("Nome", "nome")}${settingsField("Indirizzo", "indirizzo")}${settingsField("Telefono", "telefono")}${settingsField("Email", "email")}${settingsField("P.IVA", "piva")}${settingsField("WiFi Ospiti", "wifi")}
        <button class="btn-sm" style="margin-top:16px" onclick="salvaSettings();toast('Info ristorante salvate')">Salva Modifiche</button>
      </div>
      <div class="settings-card">
        <h3>🕐 Orari di Apertura</h3>
        ${settingsField("Lun–Gio", "oraLunGio")}${settingsField("Ven–Sab", "oraVenSab")}${settingsField("Domenica", "oraDom")}${settingsField("Cucina chiude", "cucina")}
        <button class="btn-sm" style="margin-top:16px" onclick="salvaSettings();toast('Orari aggiornati')">Salva Modifiche</button>
      </div>
      <div class="settings-card">
        <h3>🪑 Configurazione Tavoli</h3>
        <div class="settings-row"><span class="lbl">Tavoli totali</span><span class="val">${data.tavoli.length}</span></div>
        <div class="settings-row"><span class="lbl">Posti totali</span><span class="val">${data.tavoli.reduce((a, t) => a + t.posti, 0)}</span></div>
        <div class="settings-row"><span class="lbl">Occupati ora</span><span class="val" style="color:var(--red)">${data.tavoli.filter(t => t.stato === "occupato").length}</span></div>
        <div class="settings-row"><span class="lbl">Prenotati</span><span class="val" style="color:var(--orange)">${data.tavoli.filter(t => t.stato === "prenotato").length}</span></div>
        <div class="settings-row"><span class="lbl">Liberi</span><span class="val" style="color:var(--green)">${data.tavoli.filter(t => t.stato === "libero").length}</span></div>
        ${settingsField("Buffer prenotazione (min)", "bufferPren")}${settingsField("Gruppo massimo", "maxGruppo")}
        <button class="btn-sm" style="margin-top:16px" onclick="salvaSettings();toast('Configurazione salvata')">Salva Modifiche</button>
      </div>
      <div class="settings-card">
        <h3>🔔 Notifiche</h3>
        ${settingsToggle("Nuova prenotazione", "notifPren")}
        ${settingsToggle("Ordine pronto", "notifOrdine")}
        ${settingsToggle("Scorte basse", "notifScorte")}
        ${settingsToggle("Ritardo personale", "notifRitardo")}
        <button class="btn-sm" style="margin-top:16px" onclick="salvaSettings();toast('Notifiche aggiornate')">Salva Modifiche</button>
      </div>
      <div class="settings-card" style="border:1px dashed var(--border)">
        <h3>🔄 Dati Demo</h3>
        <p style="font-size:12px;color:var(--text-muted);margin-bottom:14px;line-height:1.6">I dati sono salvati nel tuo browser. Tutto quello che fai (incassi, ordini, modifiche al menu) resta tra una visita e l'altra. Usa questo bottone se vuoi tornare allo stato iniziale della demo.</p>
        <button class="btn-sm danger" onclick="resetDemo()">Ripristina dati demo</button>
      </div>
    </div>`;
}

function settingsField(label, key) {
  return `<div class="settings-row"><span class="lbl">${label}</span><input class="settings-input" data-key="${key}" value="${data.settings[key]}" onchange="data.settings['${key}']=this.value;saveData()"></div>`;
}
function settingsToggle(label, key) {
  return `<div class="settings-row"><span class="lbl">${label}</span><div class="toggle" style="background:${data.settings[key] ? "var(--green)" : "var(--border)"}" onclick="data.settings['${key}']=!data.settings['${key}'];render()"><div class="dot" style="left:${data.settings[key] ? "21px" : "3px"}"></div></div></div>`;
}
function salvaSettings() {
  document.querySelectorAll(".settings-input").forEach(input => { data.settings[input.dataset.key] = input.value; });
  saveData();
}

// ===== INIT =====
render();
