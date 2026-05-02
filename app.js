// ===================================================
// TAVOLA — Gestionale Ristorante v3 — App Logic
// ===================================================

// ===== PAGE TITLES =====
const TITLES = {
  dashboard: ["Panoramica", "Riepilogo di oggi — Mercoledì 14 Aprile"],
  prenotazioni: ["Prenotazioni", "Gestisci tavoli e prenotazioni"],
  ordini: ["Ordini e Cucina", "Comande in tempo reale e coda cucina"],
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
  Insalate: ["#d1fae5", "#10b981"]
};
const STAFF_COLORS = ["#7c3aed", "#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#ec4899", "#14b8a6", "#6366f1"];

// ===== DATA =====
let tavoli = [
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
];

let ordini = [
  { id: 1042, tavolo: 1, piatti: ["Risotto al tartufo", "Tagliata di manzo", "Tiramisù"], stato: "in preparazione", tempo: "12 min", note: "Tartufo extra" },
  { id: 1041, tavolo: 4, piatti: ["Antipasto misto", "Spaghetti alle vongole x2"], stato: "pronto", tempo: "2 min", note: "" },
  { id: 1040, tavolo: 7, piatti: ["Carpaccio", "Ossobuco", "Panna cotta x3", "Vino rosso"], stato: "in preparazione", tempo: "18 min", note: "No cipolla nell'ossobuco" },
  { id: 1039, tavolo: 9, piatti: ["Bruschette", "Pizza margherita", "Insalata caesar"], stato: "servito", tempo: "Completato", note: "" },
  { id: 1038, tavolo: 1, piatti: ["Acqua naturale x2", "Caffè x2"], stato: "nuovo", tempo: "Ora", note: "" },
  { id: 1037, tavolo: 7, piatti: ["Dolce del giorno x2", "Amaro"], stato: "nuovo", tempo: "1 min", note: "Conto separato" }
];
let nextOrdId = 1043;

let piatti = [
  { nome: "Risotto al Tartufo Nero", cat: "Primi", prezzo: 24, attivo: true, desc: "Riso Carnaroli, tartufo nero pregiato, parmigiano 24 mesi" },
  { nome: "Spaghetti alle Vongole", cat: "Primi", prezzo: 18, attivo: true, desc: "Spaghetti di Gragnano, vongole veraci, prezzemolo" },
  { nome: "Tagliata di Manzo Angus", cat: "Secondi", prezzo: 28, attivo: true, desc: "Black Angus irlandese, rucola, grana, aceto balsamico" },
  { nome: "Ossobuco alla Milanese", cat: "Secondi", prezzo: 26, attivo: false, desc: "Ossobuco di vitello, gremolada, risotto allo zafferano" },
  { nome: "Carpaccio di Tonno", cat: "Antipasti", prezzo: 16, attivo: true, desc: "Tonno rosso, avocado, salsa di soia, sesamo" },
  { nome: "Antipasto Misto", cat: "Antipasti", prezzo: 14, attivo: true, desc: "Selezione di salumi, formaggi, bruschette, olive" },
  { nome: "Tiramisù Classico", cat: "Dolci", prezzo: 10, attivo: true, desc: "Mascarpone, savoiardi, caffè espresso, cacao" },
  { nome: "Panna Cotta", cat: "Dolci", prezzo: 9, attivo: true, desc: "Panna cotta alla vaniglia, coulis di frutti di bosco" },
  { nome: "Insalata Caesar", cat: "Insalate", prezzo: 13, attivo: true, desc: "Lattuga romana, pollo grigliato, parmigiano, crostini" },
  { nome: "Bruschette al Pomodoro", cat: "Antipasti", prezzo: 8, attivo: true, desc: "Pane casereccio, pomodorini, basilico, olio EVO" }
];

let staff = [
  { nome: "Marco Verdi", ruolo: "Chef Esecutivo", turno: "10:00–22:00", on: true, telefono: "333 1112233", email: "marco@osteria.it" },
  { nome: "Giulia Ferri", ruolo: "Sous Chef", turno: "14:00–23:00", on: true, telefono: "338 4445566", email: "giulia@osteria.it" },
  { nome: "Luca Bassi", ruolo: "Responsabile Sala", turno: "16:00–00:00", on: true, telefono: "340 7778899", email: "luca@osteria.it" },
  { nome: "Sara Neri", ruolo: "Cameriera", turno: "18:00–00:00", on: true, telefono: "347 1234567", email: "sara@osteria.it" },
  { nome: "Paolo Ricci", ruolo: "Barman", turno: "17:00–01:00", on: true, telefono: "351 9876543", email: "paolo@osteria.it" },
  { nome: "Anna Colombo", ruolo: "Cameriera", turno: "Giorno libero", on: false, telefono: "320 5556677", email: "anna@osteria.it" }
];

let settings = {
  nome: "Osteria del Borgo", indirizzo: "Via Roma 42, Milano", telefono: "+39 02 1234 5678",
  email: "info@osteriadelborgo.it", piva: "IT12345678901", wifi: "OsteriaGuest / benvenuti2023",
  oraLunGio: "12:00 – 14:30, 19:00 – 23:00", oraVenSab: "12:00 – 14:30, 19:00 – 00:00",
  oraDom: "12:00 – 15:00 (solo pranzo)", cucina: "30 min prima della chiusura",
  bufferPren: "15", maxGruppo: "8",
  notifPren: true, notifOrdine: true, notifScorte: true, notifRitardo: false
};

let menuFilter = "Tutti";
let resFilter = "Tutti";

// ===== HELPERS =====
function $(id) { return document.getElementById(id); }
function toast(msg, type = "success") {
  const t = $("toast");
  t.innerHTML = (type === "success" ? "✓ " : type === "error" ? "✕ " : "ℹ ") + msg;
  t.className = "toast show " + type;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.className = "toast", 3500);
}
function showModal(html) {
  $("modalContent").innerHTML = `<button class="btn-close" onclick="closeModal()">✕</button>` + html;
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
  $("pageDesc").textContent = TITLES[pg][1];
});

// ===== RENDER ALL =====
function render() {
  renderDashboard();
  renderPrenotazioni();
  renderOrdini();
  renderMenu();
  renderStaff();
  renderImpostazioni();
  // badges
  $("badge-pren").textContent = tavoli.filter(t => t.stato === "prenotato").length;
  $("badge-ord").textContent = ordini.filter(o => o.stato !== "servito").length;
}

// ===== DASHBOARD =====
function renderDashboard() {
  const occ = tavoli.filter(t => t.stato === "occupato");
  const pren = tavoli.filter(t => t.stato === "prenotato");
  const liberi = tavoli.filter(t => t.stato === "libero");
  const attivi = ordini.filter(o => o.stato !== "servito");
  const inCucina = ordini.filter(o => o.stato === "in preparazione");

  $("pg-dashboard").innerHTML = `
    <div class="stats-row">
      ${statCard("Incasso Oggi", "€4.280", "↑ +18% vs mercoledì scorso", true, COLORS.accent, "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6")}
      ${statCard("Coperti Serviti", occ.reduce((a, t) => a + t.posti, 0).toString(), `${occ.length} tavoli occupati`, true, "#10b981", "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z")}
      ${statCard("Ordini Attivi", attivi.length.toString(), `${inCucina.length} in cucina`, true, "#f59e0b", "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2")}
      ${statCard("Prenotazioni", pren.length.toString(), `${liberi.length} tavoli liberi`, true, "#3b82f6", "M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18")}
    </div>
    <div class="grid-2-1">
      <div class="card">
        <div class="card-header"><h2>Incassi Settimanali</h2><span style="font-size:11px;color:var(--text-muted)">Lun – Dom</span></div>
        <div class="chart">${[65,80,55,95,88,70,40].map((h, i) => `<div class="chart-col"><div class="chart-bar" style="height:${h}%;background:${i === 3 ? "var(--accent-gradient)" : "var(--accent-light)"}"></div><span class="chart-lbl">${["Lun","Mar","Mer","Gio","Ven","Sab","Dom"][i]}</span></div>`).join("")}</div>
      </div>
      <div class="card">
        <h2>Piatti Più Venduti</h2>
        ${["Risotto al Tartufo","Tagliata di Manzo","Spaghetti Vongole","Tiramisù","Carpaccio"].map((n, i) => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:11px 0;${i < 4 ? "border-bottom:1px solid var(--border-light)" : ""}">
            <div style="display:flex;align-items:center;gap:10px">
              <span style="width:24px;height:24px;border-radius:6px;background:var(--accent-light);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--accent)">${i + 1}</span>
              <span style="font-size:13px;font-weight:600;color:var(--text-dark)">${n}</span>
            </div>
            <span style="font-size:12px;color:var(--accent);font-weight:700">${[42,38,35,28,24][i]}</span>
          </div>`).join("")}
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h2>Mappa Tavoli</h2><button class="btn-add" onclick="modalNuovaPrenotazione()">+ Nuova Prenotazione</button></div>
      <div class="tables-grid">${tavoli.map(t => `
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
  const filtered = resFilter === "Tutti" ? tavoli :
    resFilter === "Liberi" ? tavoli.filter(t => t.stato === "libero") :
    resFilter === "Prenotati" ? tavoli.filter(t => t.stato === "prenotato") :
    tavoli.filter(t => t.stato === "occupato");

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
  const free = tavoli.filter(t => t.stato === "libero");
  if (!free.length) { toast("Nessun tavolo disponibile", "error"); return; }
  showModal(`
    <h2>Nuova Prenotazione</h2>
    <p class="modal-sub">Inserisci i dettagli della prenotazione</p>
    <div class="form-row">
      <div><label>Tavolo</label><select id="m-table">${free.map(t => `<option value="${t.id}" ${t.id === preselect ? "selected" : ""}>Tavolo ${t.id} — ${t.posti} posti</option>`).join("")}</select></div>
      <div><label>Orario</label><input id="m-time" type="time" value="20:00"></div>
    </div>
    <label>Nome Ospite</label><input id="m-guest" placeholder="Es. Sig. Rossi">
    <label>Telefono</label><input id="m-phone" placeholder="Es. 333 1234567">
    <label>Numero Persone</label><input id="m-people" type="number" min="1" max="10" placeholder="2">
    <label>Note</label><textarea id="m-notes" placeholder="Allergie, occasioni speciali, preferenze posto..."></textarea>
    <div class="modal-actions"><button class="btn-cancel" onclick="closeModal()">Annulla</button><button class="btn-save" onclick="salvaPrenotazione()">Conferma Prenotazione</button></div>
  `);
}

function salvaPrenotazione() {
  const tid = parseInt($("m-table").value);
  const guest = $("m-guest").value.trim();
  const time = $("m-time").value;
  const phone = $("m-phone").value.trim();
  const notes = $("m-notes").value.trim();
  if (!guest) { toast("Inserisci il nome dell'ospite", "error"); return; }
  const t = tavoli.find(x => x.id === tid);
  t.stato = "prenotato"; t.ospite = guest; t.ora = time; t.telefono = phone; t.note = notes;
  closeModal(); render(); toast(`Prenotazione confermata — Tavolo ${tid}, ore ${time}`);
}

function modalDettaglioTavolo(id) {
  const t = tavoli.find(x => x.id === id);
  const ordiniTavolo = ordini.filter(o => o.tavolo === id && o.stato !== "servito");
  showModal(`
    <h2>Tavolo ${t.id}</h2>
    <p class="modal-sub">${t.posti} posti · ${STATUS_IT[t.stato]}</p>
    <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap">
      <span class="status-badge" style="background:${COLORS[t.stato]}14;color:${COLORS[t.stato]};font-size:12px;padding:6px 16px">${STATUS_IT[t.stato]}</span>
      <span class="status-badge" style="background:var(--bg);color:var(--text-body);font-size:12px;padding:6px 16px">${t.posti} posti</span>
    </div>
    ${t.ospite ? `
    <div class="modal-section">
      <h3>Dettagli Prenotazione</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div style="padding:14px;background:var(--bg);border-radius:10px"><div style="font-size:10px;color:var(--text-muted);font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px">Ospite</div><div style="font-size:14px;font-weight:700;color:var(--text-dark)">${t.ospite}</div></div>
        <div style="padding:14px;background:var(--bg);border-radius:10px"><div style="font-size:10px;color:var(--text-muted);font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px">Orario</div><div style="font-size:14px;font-weight:700;color:var(--text-dark)">${t.ora}</div></div>
        ${t.telefono ? `<div style="padding:14px;background:var(--bg);border-radius:10px"><div style="font-size:10px;color:var(--text-muted);font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px">Telefono</div><div style="font-size:14px;font-weight:700;color:var(--text-dark)">${t.telefono}</div></div>` : ""}
        ${t.note ? `<div style="padding:14px;background:var(--bg);border-radius:10px"><div style="font-size:10px;color:var(--text-muted);font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px">Note</div><div style="font-size:13px;color:var(--text-body)">${t.note}</div></div>` : ""}
      </div>
    </div>` : ""}
    ${ordiniTavolo.length ? `
    <div class="modal-section">
      <h3>Ordini Attivi</h3>
      ${ordiniTavolo.map(o => `<div style="padding:12px;background:var(--bg);border-radius:8px;margin-bottom:8px;border-left:3px solid ${COLORS[o.stato]}"><div style="font-size:12px;font-weight:700;color:var(--text-dark)">#${o.id} — <span style="color:${COLORS[o.stato]}">${ORD_IT[o.stato]}</span></div><div style="font-size:12px;color:var(--text-muted);margin-top:4px">${o.piatti.join(", ")}</div></div>`).join("")}
    </div>` : ""}
    <div class="modal-actions" style="flex-wrap:wrap;gap:8px">
      ${t.stato === "libero" ? `<button class="btn-save" onclick="closeModal();modalNuovaPrenotazione(${t.id})">Prenota</button>` : ""}
      ${t.stato === "prenotato" ? `<button class="btn-save" style="background:var(--green-gradient)" onclick="cambiaStatoTavolo(${t.id},'occupato')">Accomoda Ospiti</button><button class="btn-cancel" onclick="cambiaStatoTavolo(${t.id},'libero')">Cancella Prenotazione</button>` : ""}
      ${t.stato === "occupato" ? `<button class="btn-save" onclick="closeModal();modalNuovaComanda(${t.id})">Nuova Comanda</button><button class="btn-cancel" style="border-color:var(--red);color:var(--red)" onclick="cambiaStatoTavolo(${t.id},'libero')">Libera Tavolo</button>` : ""}
    </div>
  `);
}

function cambiaStatoTavolo(id, stato) {
  const t = tavoli.find(x => x.id === id);
  if (stato === "libero") { t.stato = "libero"; t.ospite = ""; t.ora = ""; t.telefono = ""; t.note = ""; }
  else { t.stato = stato; }
  closeModal(); render();
  toast(`Tavolo ${id} → ${STATUS_IT[stato]}`);
}

// ===== ORDINI =====
function renderOrdini() {
  const counts = { nuovo: 0, "in preparazione": 0, pronto: 0, servito: 0 };
  ordini.forEach(o => counts[o.stato]++);

  $("pg-ordini").innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;flex-wrap:wrap;gap:12px">
      <div class="orders-status">
        ${[["Nuovi", counts.nuovo, COLORS.nuovo], ["In Preparazione", counts["in preparazione"], COLORS["in preparazione"]], ["Pronti", counts.pronto, COLORS.pronto], ["Serviti", counts.servito, COLORS.servito]].map(([l, c, col]) => `
          <div class="os-card"><div style="display:flex;align-items:center"><span class="dot" style="background:${col}"></span><span class="os-label">${l}</span></div><span class="os-count" style="color:${col}">${c}</span></div>`).join("")}
      </div>
      <button class="btn-add" onclick="modalNuovaComanda()">+ Nuova Comanda</button>
    </div>
    <div class="orders-grid">${ordini.map(o => `
      <div class="order-card" style="border-left-color:${COLORS[o.stato]}">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <div>
            <span style="font-size:17px;font-weight:800;color:var(--text-dark)">#${o.id}</span>
            <span style="font-size:13px;color:var(--text-muted);margin-left:8px">Tavolo ${o.tavolo}</span>
            ${tavoli.find(t => t.id === o.tavolo)?.ospite ? `<span style="font-size:11px;color:var(--accent);margin-left:4px">· ${tavoli.find(t => t.id === o.tavolo).ospite}</span>` : ""}
          </div>
          <span class="order-status-pill" style="background:${COLORS[o.stato]}14;color:${COLORS[o.stato]}">${ORD_IT[o.stato]}</span>
        </div>
        <div style="margin-bottom:14px">${o.piatti.map(p => `<div class="order-item">${p}</div>`).join("")}</div>
        ${o.note ? `<div style="font-size:11px;color:var(--text-muted);margin-bottom:12px;padding:8px 12px;background:var(--bg);border-radius:6px;font-style:italic">📝 ${o.note}</div>` : ""}
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:12px;color:var(--text-muted)">⏱ ${o.tempo}</span>
          <div style="display:flex;gap:6px">
            ${ORD_BTN[o.stato] ? `<button class="btn-action" style="background:${ORD_BTN_COLOR[o.stato]}" onclick="avanzaOrdine(${o.id})">${ORD_BTN[o.stato]}</button>` : ""}
            ${o.stato !== "servito" ? `<button class="btn-sm danger" onclick="eliminaOrdine(${o.id})">Annulla</button>` : ""}
          </div>
        </div>
      </div>`).join("")}</div>`;
}

function modalNuovaComanda(preselTavolo) {
  const occupati = tavoli.filter(t => t.stato === "occupato");
  if (!occupati.length) { toast("Nessun tavolo occupato", "error"); return; }
  showModal(`
    <h2>Nuova Comanda</h2>
    <p class="modal-sub">Inserisci i piatti per la cucina</p>
    <div class="form-row">
      <div><label>Tavolo</label><select id="m-otable">${occupati.map(t => `<option value="${t.id}" ${t.id === preselTavolo ? "selected" : ""}>Tavolo ${t.id} — ${t.ospite}</option>`).join("")}</select></div>
      <div><label>Priorità</label><select id="m-oprio"><option value="normale">Normale</option><option value="alta">Alta — Urgente</option></select></div>
    </div>
    <label>Piatti (uno per riga)</label>
    <textarea id="m-oitems" rows="6" placeholder="Risotto al tartufo&#10;Tagliata di manzo x2&#10;Vino rosso della casa"></textarea>
    <label>Note per la cucina</label>
    <input id="m-onotes" placeholder="Es. No cipolla, allergia glutine, conto separato...">
    <div class="modal-actions"><button class="btn-cancel" onclick="closeModal()">Annulla</button><button class="btn-save" onclick="salvaComanda()">Invia in Cucina</button></div>
  `);
}

function salvaComanda() {
  const tid = parseInt($("m-otable").value);
  const items = $("m-oitems").value.trim().split("\n").filter(x => x.trim());
  const notes = $("m-onotes").value.trim();
  if (!items.length) { toast("Inserisci almeno un piatto", "error"); return; }
  ordini.unshift({ id: nextOrdId++, tavolo: tid, piatti: items, stato: "nuovo", tempo: "Ora", note: notes });
  closeModal(); render(); toast(`Comanda #${nextOrdId - 1} inviata in cucina`);
}

function avanzaOrdine(id) {
  const o = ordini.find(x => x.id === id);
  const next = ORD_NEXT[o.stato]; if (!next) return;
  o.stato = next;
  o.tempo = next === "in preparazione" ? "Appena iniziato" : next === "pronto" ? "Pronto!" : "Completato";
  render(); toast(`Ordine #${id} → ${ORD_IT[next]}`);
}

function eliminaOrdine(id) {
  ordini = ordini.filter(o => o.id !== id);
  render(); toast(`Ordine #${id} annullato`, "info");
}

// ===== MENU =====
function renderMenu() {
  const filtered = menuFilter === "Tutti" ? piatti : piatti.filter(p => p.cat === menuFilter);
  $("pg-menu").innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;flex-wrap:wrap;gap:12px">
      <div class="filters">${["Tutti","Antipasti","Primi","Secondi","Dolci","Insalate"].map(f => `<button class="filter-btn ${menuFilter === f ? "active" : ""}" onclick="menuFilter='${f}';render()">${f}</button>`).join("")}</div>
      <button class="btn-add" onclick="modalPiatto()">+ Aggiungi Piatto</button>
    </div>
    <div class="card" style="padding:0;overflow:hidden">
      <table class="menu-table"><thead><tr><th>Piatto</th><th>Categoria</th><th>Prezzo</th><th>Disponibile</th><th>Azioni</th></tr></thead>
      <tbody>${filtered.map(m => {
        const idx = piatti.indexOf(m);
        const cc = CAT_COLORS[m.cat] || ["#f1f5f9", "#475569"];
        return `<tr>
          <td><div style="font-weight:700;color:var(--text-dark)">${m.nome}</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px">${m.desc || ""}</div></td>
          <td><span class="cat-pill" style="background:${cc[0]};color:${cc[1]}">${m.cat}</span></td>
          <td style="font-weight:700;color:var(--text-dark);font-size:15px">€${m.prezzo}</td>
          <td><div class="toggle" style="background:${m.attivo ? "var(--green)" : "var(--border)"}" onclick="togglePiatto(${idx})"><div class="dot" style="left:${m.attivo ? "21px" : "3px"}"></div></div></td>
          <td><button class="btn-sm" onclick="modalPiatto(${idx})">Modifica</button> <button class="btn-sm danger" onclick="eliminaPiatto(${idx})">Elimina</button></td>
        </tr>`;
      }).join("")}</tbody></table>
    </div>
    <div style="margin-top:16px;padding:16px 20px;background:var(--white);border-radius:var(--radius);border:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
      <span style="font-size:13px;color:var(--text-muted)">${piatti.length} piatti totali · ${piatti.filter(p => p.attivo).length} disponibili · ${piatti.filter(p => !p.attivo).length} non disponibili</span>
    </div>`;
}

function modalPiatto(idx) {
  const isEdit = idx !== undefined;
  const d = isEdit ? piatti[idx] : { nome: "", cat: "Primi", prezzo: "", desc: "", attivo: true };
  showModal(`
    <h2>${isEdit ? "Modifica Piatto" : "Nuovo Piatto"}</h2>
    <p class="modal-sub">${isEdit ? "Aggiorna i dettagli del piatto" : "Aggiungi un nuovo piatto al menu"}</p>
    <label>Nome Piatto</label><input id="m-dname" value="${d.nome}" placeholder="Es. Risotto al Tartufo Nero">
    <div class="form-row">
      <div><label>Categoria</label><select id="m-dcat">${["Antipasti","Primi","Secondi","Dolci","Insalate"].map(c => `<option ${c === d.cat ? "selected" : ""}>${c}</option>`).join("")}</select></div>
      <div><label>Prezzo (€)</label><input id="m-dprice" type="number" step="0.5" value="${d.prezzo}" placeholder="24"></div>
    </div>
    <label>Descrizione / Ingredienti</label><textarea id="m-ddesc" placeholder="Es. Riso Carnaroli, tartufo nero pregiato, parmigiano 24 mesi">${d.desc || ""}</textarea>
    <div class="modal-actions"><button class="btn-cancel" onclick="closeModal()">Annulla</button><button class="btn-save" onclick="salvaPiatto(${isEdit ? idx : -1})">${isEdit ? "Salva Modifiche" : "Aggiungi al Menu"}</button></div>
  `);
}

function salvaPiatto(idx) {
  const nome = $("m-dname").value.trim();
  const cat = $("m-dcat").value;
  const prezzo = parseFloat($("m-dprice").value);
  const desc = $("m-ddesc").value.trim();
  if (!nome || !prezzo) { toast("Compila nome e prezzo", "error"); return; }
  if (idx >= 0) { piatti[idx] = { ...piatti[idx], nome, cat, prezzo, desc }; toast("Piatto aggiornato"); }
  else { piatti.push({ nome, cat, prezzo, desc, attivo: true }); toast("Piatto aggiunto al menu"); }
  closeModal(); render();
}

function togglePiatto(idx) {
  piatti[idx].attivo = !piatti[idx].attivo;
  render();
  toast(piatti[idx].attivo ? `${piatti[idx].nome} — Disponibile` : `${piatti[idx].nome} — Non disponibile`, "info");
}

function eliminaPiatto(idx) {
  const nome = piatti[idx].nome;
  piatti.splice(idx, 1);
  render(); toast(`${nome} eliminato dal menu`);
}

// ===== STAFF =====
function renderStaff() {
  const onCount = staff.filter(s => s.on).length;
  $("pg-staff").innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px">
      <div><h2 style="font-size:16px;font-weight:700;color:var(--text-dark);margin-bottom:4px">Team — ${onCount} in servizio su ${staff.length}</h2><p style="font-size:12px;color:var(--text-muted)">Gestisci il personale e i turni</p></div>
      <button class="btn-add" onclick="modalStaff()">+ Aggiungi Membro</button>
    </div>
    <div class="staff-grid">${staff.map((s, i) => `
      <div class="staff-card" style="opacity:${s.on ? 1 : 0.55}">
        <div class="staff-avatar" style="background:${STAFF_COLORS[i % STAFF_COLORS.length]}20;color:${STAFF_COLORS[i % STAFF_COLORS.length]}">${getAvatar(s.nome)}</div>
        <div style="flex:1">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:15px;font-weight:700;color:var(--text-dark)">${s.nome}</span>
            <div class="online-indicator" style="background:${s.on ? "var(--green)" : "var(--border)"}"></div>
          </div>
          <div style="font-size:12px;color:var(--accent);font-weight:600;margin-top:3px">${s.ruolo}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:4px">Turno: ${s.turno}</div>
          ${s.telefono ? `<div style="font-size:11px;color:var(--text-muted);margin-top:2px">📞 ${s.telefono}</div>` : ""}
          <div style="display:flex;gap:6px;margin-top:10px">
            <button class="btn-sm" onclick="modalStaff(${i})">Modifica</button>
            <button class="btn-sm ${s.on ? "danger" : "success"}" onclick="toggleStaff(${i})">${s.on ? "Segna Assente" : "Segna Presente"}</button>
          </div>
        </div>
      </div>`).join("")}</div>`;
}

function modalStaff(idx) {
  const isEdit = idx !== undefined;
  const s = isEdit ? staff[idx] : { nome: "", ruolo: "Cameriere/a", turno: "", telefono: "", email: "" };
  showModal(`
    <h2>${isEdit ? "Modifica Membro" : "Nuovo Membro del Team"}</h2>
    <p class="modal-sub">${isEdit ? "Aggiorna i dettagli" : "Aggiungi un nuovo membro al team"}</p>
    <label>Nome Completo</label><input id="m-sname" value="${s.nome}" placeholder="Es. Maria Bianchi">
    <div class="form-row">
      <div><label>Ruolo</label><select id="m-srole">${["Cameriere/a","Barman","Chef","Sous Chef","Sommelier","Lavapiatti","Responsabile Sala","Hostess"].map(r => `<option ${r === s.ruolo ? "selected" : ""}>${r}</option>`).join("")}</select></div>
      <div><label>Turno</label><input id="m-sshift" value="${s.turno}" placeholder="Es. 18:00–00:00"></div>
    </div>
    <div class="form-row">
      <div><label>Telefono</label><input id="m-sphone" value="${s.telefono || ""}" placeholder="333 1234567"></div>
      <div><label>Email</label><input id="m-semail" value="${s.email || ""}" placeholder="nome@osteria.it"></div>
    </div>
    <div class="modal-actions"><button class="btn-cancel" onclick="closeModal()">Annulla</button><button class="btn-save" onclick="salvaStaff(${isEdit ? idx : -1})">${isEdit ? "Salva" : "Aggiungi"}</button></div>
  `);
}

function salvaStaff(idx) {
  const nome = $("m-sname").value.trim();
  const ruolo = $("m-srole").value;
  const turno = $("m-sshift").value.trim();
  const telefono = $("m-sphone").value.trim();
  const email = $("m-semail").value.trim();
  if (!nome || !turno) { toast("Inserisci nome e turno", "error"); return; }
  if (idx >= 0) { Object.assign(staff[idx], { nome, ruolo, turno, telefono, email }); toast(`${nome} aggiornato`); }
  else { staff.push({ nome, ruolo, turno, on: true, telefono, email }); toast(`${nome} aggiunto al team`); }
  closeModal(); render();
}

function toggleStaff(idx) {
  staff[idx].on = !staff[idx].on;
  if (!staff[idx].on) staff[idx].turno = "Giorno libero";
  render(); toast(`${staff[idx].nome} — ${staff[idx].on ? "In servizio" : "Assente"}`);
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
        <div class="settings-row"><span class="lbl">Tavoli totali</span><span class="val">${tavoli.length}</span></div>
        <div class="settings-row"><span class="lbl">Posti totali</span><span class="val">${tavoli.reduce((a, t) => a + t.posti, 0)}</span></div>
        <div class="settings-row"><span class="lbl">Occupati ora</span><span class="val" style="color:var(--red)">${tavoli.filter(t => t.stato === "occupato").length}</span></div>
        <div class="settings-row"><span class="lbl">Prenotati</span><span class="val" style="color:var(--orange)">${tavoli.filter(t => t.stato === "prenotato").length}</span></div>
        <div class="settings-row"><span class="lbl">Liberi</span><span class="val" style="color:var(--green)">${tavoli.filter(t => t.stato === "libero").length}</span></div>
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
    </div>`;
}

function settingsField(label, key) {
  return `<div class="settings-row"><span class="lbl">${label}</span><input class="settings-input" data-key="${key}" value="${settings[key]}" onchange="settings['${key}']=this.value"></div>`;
}

function settingsToggle(label, key) {
  return `<div class="settings-row"><span class="lbl">${label}</span><div class="toggle" style="background:${settings[key] ? "var(--green)" : "var(--border)"}" onclick="settings['${key}']=!settings['${key}'];render()"><div class="dot" style="left:${settings[key] ? "21px" : "3px"}"></div></div></div>`;
}

function salvaSettings() {
  document.querySelectorAll(".settings-input").forEach(input => { settings[input.dataset.key] = input.value; });
}

// ===== INIT =====
render();
