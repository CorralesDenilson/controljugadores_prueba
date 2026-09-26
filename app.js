const defaultCategories = ["U-13","U-15"];
const seedPlayers = [
  {
    id:1,name:"Juan Pérez",birthDate:"2013-06-15",guardianPhone:"8888-1122",jersey:"10",category:"U-13",position:"Delantero",foot:"Derecho",
    absenceHistory:{},
    pastInjuries:"Esguince de tobillo derecho en 2025.",
    conditions:"Ninguno registrado.",
    gameAspects:"Buen desempeño en definición y movimientos dentro del área.",
    notes:"Buen desempeño general.",
    evolution:[{date:"2026-09-01",improved:"Mejoró la definición y el posicionamiento ofensivo.",improve:"Seguir trabajando el juego aéreo."}]
  },
  {
    id:2,name:"Diego Vargas",birthDate:"2013-09-21",guardianPhone:"8777-2233",jersey:"7",category:"U-13",position:"Mediocampista",foot:"Derecho",
    absenceHistory:{"2026-09":["2026-09-16"]},
    pastInjuries:"No ha reportado lesiones anteriores.",
    conditions:"Ninguno registrado.",
    gameAspects:"Buena visión de juego. Debe mejorar la recepción orientada y la velocidad de pase.",
    notes:"Trabajar recepción orientada y velocidad de pase.",
    evolution:[{date:"2026-09-08",improved:"Ha mejorado la precisión de sus pases cortos.",improve:"Continuar trabajando la recepción orientada y el cambio de juego."}]
  },
  {
    id:3,name:"Mateo Solano",birthDate:"2012-04-10",guardianPhone:"8666-3344",jersey:"9",category:"U-15",position:"Delantero",foot:"Izquierdo",
    absenceHistory:{},pastInjuries:"Ninguna registrada.",conditions:"Ninguno registrado.",
    gameAspects:"Buen desmarque y definición.",notes:"Jugador de referencia para la categoría.",
    adminStatus:"TODO_EN_REGLA",
    evolution:[{date:"2026-09-05",improved:"Mejoró la definición con pierna izquierda.",improve:"Trabajar presión tras pérdida."}]
  },
  {
    id:4,name:"Andrés Mora",birthDate:"2012-11-03",guardianPhone:"8555-4455",jersey:"4",category:"U-15",position:"Defensa",foot:"Derecho",
    absenceHistory:{"2026-09":["2026-09-10","2026-09-24"]},pastInjuries:"Golpe muscular leve en 2025.",conditions:"Ninguno registrado.",
    gameAspects:"Buen posicionamiento defensivo.",notes:"Debe mejorar salida con balón.",adminStatus:"ARREGLO_DE_PAGO",
    evolution:[{date:"2026-09-12",improved:"Mejoró la cobertura defensiva.",improve:"Mejorar primer pase."}]
  }
];

const PLAYERS_KEY = "academia_futbol_trial_v1_players";
const CATEGORIES_KEY = "academia_futbol_trial_v1_categories";
const USERS_KEY = "academia_futbol_trial_v1_users";

// --- Configuración de versión de prueba ---
const TRIAL_MODE = true;
const TRIAL_MAX_PLAYERS = 15;
const TRIAL_MAX_CATEGORIES = 2;
const TRIAL_MAX_COACHES = 3;
const TRIAL_NAME = "VERSIÓN DE PRUEBA";


const daysOfWeek = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

function normalizePlayer(p){
  const absenceHistory = (p.absenceHistory && typeof p.absenceHistory === "object" && !Array.isArray(p.absenceHistory)) ? p.absenceHistory : {};
  // Migra datos de la versión anterior a una estructura mensual.
  if (p.weeklyAttendance && p.weeklyAttendance.attendedAll === false && Array.isArray(p.weeklyAttendance.absentDays) && p.weeklyAttendance.absentDays.length && !Object.keys(absenceHistory).length) {
    const now = new Date();
    const key = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
    const dayMap = {"Lunes":1,"Martes":2,"Miércoles":3,"Jueves":4,"Viernes":5,"Sábado":6,"Domingo":0};
    const dates=[];
    const y=now.getFullYear(), m=now.getMonth();
    const total=new Date(y,m+1,0).getDate();
    for(let d=1;d<=total;d++){ const dt=new Date(y,m,d); if(p.weeklyAttendance.absentDays.includes(Object.keys(dayMap).find(k=>dayMap[k]===dt.getDay()))) dates.push(`${key}-${String(d).padStart(2,"0")}`); }
    if(dates.length) absenceHistory[key]=dates;
  }
  return {
    ...p,
    absenceHistory,
    pastInjuries: p.pastInjuries || "",
    conditions: p.conditions || "",
    gameAspects: p.gameAspects || "",
    notes: p.notes || "",
    adminStatus: p.adminStatus || "NO_SE_HA_REPORTADO",
    evolution: Array.isArray(p.evolution) ? p.evolution : []
  };
}

let players = (JSON.parse(localStorage.getItem(PLAYERS_KEY) || "null") || seedPlayers).map(normalizePlayer);
let storedCategories = JSON.parse(localStorage.getItem(CATEGORIES_KEY) || "null");
let categories = Array.isArray(storedCategories) && storedCategories.length ? storedCategories : [...defaultCategories];
let selectedPlayerId = null;
if(!localStorage.getItem(CATEGORIES_KEY)) localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
if(!localStorage.getItem(PLAYERS_KEY)) localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));

function save(){
  localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}
function trialInfo(){
  return TRIAL_MODE
    ? `Versión de prueba · hasta ${TRIAL_MAX_PLAYERS} jugadores · ${TRIAL_MAX_CATEGORIES} categorías · ${TRIAL_MAX_COACHES} entrenadores`
    : "";
}

function age(date){ if(!date)return "-"; const b=new Date(date+"T00:00:00"), t=new Date(); let a=t.getFullYear()-b.getFullYear(); const m=t.getMonth()-b.getMonth(); if(m<0||(m===0&&t.getDate()<b.getDate()))a--; return a; }
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function monthKey(date=new Date()){ return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}`; }
function monthName(key){ const [y,m]=String(key).split("-").map(Number); if(!y||!m)return key; return new Date(y,m-1,1).toLocaleDateString("es-CR",{month:"long",year:"numeric"}); }
function absenceDates(p,key){ return Array.isArray(p?.absenceHistory?.[key]) ? p.absenceHistory[key] : []; }
function monthAbsenceCount(p,key){ return absenceDates(p,key).length; }
function attendanceSummary(p,key=monthKey()){ const n=monthAbsenceCount(p,key); return n===0 ? "Sin faltas" : `${n} falta${n===1?"":"s"} en ${monthName(key)}`; }
function adminStatusLabel(status){ return ({TODO_EN_REGLA:"Todo en regla✅",NO_SE_HA_REPORTADO:"❌ NO se ha reportado",ARREGLO_DE_PAGO:"🗣️ Arreglo de pago",SALIERON_DE_LA_ACADEMIA:"🚫 Salieron de la Academia"})[status] || "Todo en regla✅"; }
function monthLabelShort(key){ const [y,m]=String(key).split("-").map(Number); return new Date(y,m-1,1).toLocaleDateString("es-CR",{month:"long"}); }
function evolutionSorted(p){ return [...(p.evolution||[])].sort((a,b)=>String(b.date).localeCompare(String(a.date))); }

function playerTable(list, emptyMessage){
  document.getElementById("playersTable").innerHTML=list.length?`<table class="table"><thead><tr><th>Jugador</th><th>Categoría</th><th>Posición</th><th>Camisa</th><th>Asistencia del mes</th><th>Estado</th></tr></thead><tbody>${list.map(p=>`<tr><td><span class="player-link" onclick="openDetail(${p.id})">${esc(p.name)}</span><div class="muted">${age(p.birthDate)} años</div></td><td>${esc(p.category)}</td><td>${esc(p.position)}</td><td>${p.jersey?esc(p.jersey):"—"}</td><td>${esc(attendanceSummary(p))}</td><td><span class="status-pill">${esc(adminStatusLabel(p.adminStatus))}</span></td></tr>`).join("")}</tbody></table>`:`<div class="empty">${emptyMessage}</div>`;
}

function render(){
  document.getElementById("totalPlayers").textContent=players.length;
  document.getElementById("totalCategories").textContent=categories.length;
  const key=monthKey();
  const absences=players.reduce((sum,p)=>sum+monthAbsenceCount(p,key),0);
  document.getElementById("avgAttendance").textContent=absences;
  document.getElementById("avgAttendance").previousElementSibling.textContent="Faltas este mes";
  document.getElementById("categoryCards").innerHTML=categories.map(c=>{
    const count=players.filter(p=>p.category===c).length;
    return `<div class="category-card" onclick="showCategory('${esc(c)}')" title="Entrar a ${esc(c)}"><div class="cat">${esc(c)}</div><div class="count">${count} jugador${count===1?"":"es"}</div><div class="category-action">Ver jugadores →</div></div>`;
  }).join("");
  renderPlayers();
  const categoryListEl=document.getElementById("categoriesList");
  categoryListEl.innerHTML=categories.length ? categories.map(c=>{
    const count=players.filter(p=>p.category===c).length;
    const actions=session?.role==="Administrador" ? `<div class="category-actions"><button type="button" class="secondary category-edit-btn" data-category="${encodeURIComponent(c)}">Editar</button><button type="button" class="danger category-delete-btn" data-category="${encodeURIComponent(c)}">Eliminar</button></div>` : "";
    return `<div class="cat-row category-row-click" onclick="showCategory('${esc(c)}')" title="Ver jugadores de ${esc(c)}"><div><strong>${esc(c)}</strong><small class="cat-hint">Ver jugadores →</small></div><div class="category-row-right"><span class="muted">${count} jugador${count===1?"":"es"}</span>${actions}</div></div>`;
  }).join("") : '<div class="empty">No hay categorías registradas.</div>';
  categoryListEl.querySelectorAll(".category-edit-btn").forEach(btn=>btn.onclick=e=>{e.stopPropagation();editCategory(decodeURIComponent(btn.dataset.category));});
  categoryListEl.querySelectorAll(".category-delete-btn").forEach(btn=>btn.onclick=e=>{e.stopPropagation();deleteCategory(decodeURIComponent(btn.dataset.category));});
  populateCategory();
  renderCoachAdmin();
}
function populatePlayerCategoryFilter(selected=""){
  const filter=document.getElementById("playerCategoryFilter");
  if(!filter)return;
  const current=selected || filter.value || "";
  filter.innerHTML=`<option value="">Todas las categorías</option>`+categories.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join("");
  filter.value=categories.includes(current)?current:"";
}
function renderPlayers(filter="", categoryFilter=null){
  const q=filter.toLowerCase();
  const selectedCategory=categoryFilter===null ? (document.getElementById("playerCategoryFilter")?.value||"") : categoryFilter;
  const list=players.filter(p=>(!selectedCategory || p.category===selectedCategory) && (p.name.toLowerCase().includes(q)||p.category.toLowerCase().includes(q)));
  playerTable(list,"No hay jugadores que coincidan con los filtros seleccionados.");
}
function populateCategory(){document.getElementById("category").innerHTML=categories.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join("");populatePlayerCategoryFilter();}
function showView(view){
  ["dashboard","players","categories","reports"].forEach(v=>{
    const section=document.getElementById(v+"View");
    if(section) section.classList.toggle("hidden",v!==view);
  });
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  const titles={dashboard:"Dashboard",players:"Jugadores",categories:"Categorías",reports:"Informes mensuales"};
  document.getElementById("pageTitle").textContent=titles[view] || "Dashboard";
}
function showCategory(cat){
  showView("players");
  document.getElementById("searchInput").value="";
  populatePlayerCategoryFilter(cat);
  renderPlayers("",cat);
}

let editingAttendancePlayer = null;
let editingAttendanceMonth = monthKey();
function daysInMonth(key){ const [y,m]=key.split("-").map(Number); return new Date(y,m,0).getDate(); }
function dateKey(key,day){ return `${key}-${String(day).padStart(2,"0")}`; }
function renderAttendanceCalendar(p){
  editingAttendancePlayer=p||null;
  editingAttendanceMonth=document.getElementById("attendanceMonth")?.value || monthKey();
  const [y,m]=editingAttendanceMonth.split("-").map(Number);
  const first=new Date(y,m-1,1);
  const offset=(first.getDay()+6)%7;
  const total=daysInMonth(editingAttendanceMonth);
  const absent=new Set(absenceDates(p,editingAttendanceMonth));
  const cal=document.getElementById("attendanceCalendar");
  if(!cal)return;
  let html=["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map(d=>`<div class="calendar-weekday">${d}</div>`).join("");
  for(let i=0;i<offset;i++) html+='<div class="calendar-day empty-day"></div>';
  for(let d=1;d<=total;d++){ const key=dateKey(editingAttendanceMonth,d); const isAbsent=absent.has(key); const dow=new Date(y,m-1,d).getDay(); const isWeekend=dow===0||dow===6; html+=`<button type="button" class="calendar-day ${isAbsent?"absent":""} ${isWeekend?"weekend":""}" data-date="${key}" title="${isAbsent?"Marcar como asistió":"Marcar como falta"}">${d}</button>`; }
  cal.innerHTML=html;
  document.getElementById("attendanceMonthLabel").textContent=monthName(editingAttendanceMonth);
  document.getElementById("attendanceSummary").innerHTML=`<strong>${absent.size}</strong> falta${absent.size===1?"":"s"} en ${esc(monthName(editingAttendanceMonth))}`;
  cal.querySelectorAll(".calendar-day[data-date]").forEach(btn=>btn.onclick=()=>{
    if(!editingAttendancePlayer)return;
    const key=btn.dataset.date;
    editingAttendancePlayer.absenceHistory=editingAttendancePlayer.absenceHistory||{};
    const arr=new Set(absenceDates(editingAttendancePlayer,editingAttendanceMonth));
    if(arr.has(key))arr.delete(key); else arr.add(key);
    editingAttendancePlayer.absenceHistory[editingAttendanceMonth]=[...arr].sort();
    renderAttendanceCalendar(editingAttendancePlayer);
  });
}
function shiftAttendanceMonth(delta){
  const [y,m]=editingAttendanceMonth.split("-").map(Number);
  const d=new Date(y,m-1+delta,1);
  editingAttendanceMonth=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
  document.getElementById("attendanceMonth").value=editingAttendanceMonth;
  renderAttendanceCalendar(editingAttendancePlayer);
}
function openForm(p=null){
  document.getElementById("playerModal").classList.remove("hidden");
  document.getElementById("modalTitle").textContent=p?"Editar jugador":"Agregar jugador";
  document.getElementById("playerId").value=p?.id||"";
  document.getElementById("name").value=p?.name||"";
  document.getElementById("birthDate").value=p?.birthDate||"";
  document.getElementById("guardianPhone").value=p?.guardianPhone||"";
  document.getElementById("jersey").value=p?.jersey||"";
  document.getElementById("category").value=p?.category||categories[0];
  document.getElementById("category").disabled=!!(session && session.role==="Entrenador");
  document.getElementById("position").value=p?.position||"Delantero";
  document.getElementById("foot").value=p?.foot||"Derecho";
  editingAttendancePlayer = p ? JSON.parse(JSON.stringify(p)) : {absenceHistory:{}};
  document.getElementById("attendanceMonth").value=monthKey();
  editingAttendanceMonth=monthKey();
  renderAttendanceCalendar(editingAttendancePlayer);
  document.getElementById("pastInjuries").value=p?.pastInjuries||"";
  document.getElementById("conditions").value=p?.conditions||"";
  document.getElementById("gameAspects").value=p?.gameAspects||"";
  document.getElementById("notes").value=p?.notes||"";
  document.getElementById("adminStatus").value=p?.adminStatus||"NO_SE_HA_REPORTADO";
  document.getElementById("evolutionDate").value=new Date().toISOString().slice(0,10);
  document.getElementById("evolutionImproved").value="";
  document.getElementById("evolutionImprove").value="";
}
function closeForm(){document.getElementById("playerModal").classList.add("hidden");}

function renderDetailAttendance(p){
  const keys=Object.keys(p.absenceHistory||{}).filter(k=>Array.isArray(p.absenceHistory[k])&&p.absenceHistory[k].length).sort().reverse();
  const box=document.getElementById("detailAttendance");
  if(!box)return;
  box.innerHTML=keys.length ? keys.map(k=>`<div class="absence-month"><div><strong>${esc(monthName(k))}</strong><span>${p.absenceHistory[k].length} falta${p.absenceHistory[k].length===1?"":"s"}</span></div><p>${p.absenceHistory[k].map(d=>new Date(d+"T00:00:00").toLocaleDateString("es-CR",{day:"numeric",month:"short"})).join(" · ")}</p></div>`).join("") : '<div class="empty">No hay faltas registradas.</div>';
}
function openDetail(id){
  selectedPlayerId=id; const p=players.find(x=>x.id===id); if(!p)return;
  document.getElementById("detailName").textContent=p.name;
  document.getElementById("detailGrid").innerHTML=[
    ["Edad",age(p.birthDate)+" años"],["Fecha de nacimiento",p.birthDate||"—"],["Teléfono encargado",p.guardianPhone||"—"],
    ["N.º de camisa",p.jersey||"Sin uniforme"],["Categoría",p.category],["Posición",p.position],["Pie fuerte",p.foot],
    ["Faltas este mes",attendanceSummary(p)]
  ].map(x=>`<div class="detail-item"><span>${esc(x[0])}</span><strong>${esc(x[1])}</strong></div>`).join("");
  renderDetailAttendance(p);
  document.getElementById("detailInjuries").textContent=p.pastInjuries||"Sin lesiones pasadas registradas.";
  document.getElementById("detailConditions").textContent=p.conditions||"Sin padecimientos o enfermedades registrados.";
  document.getElementById("detailGameAspects").textContent=p.gameAspects||"Sin aspectos importantes registrados.";
  document.getElementById("detailNotes").textContent=p.notes||"Sin observaciones.";
  document.getElementById("detailAdminStatus").textContent=adminStatusLabel(p.adminStatus);
  const history=evolutionSorted(p);
  document.getElementById("evolutionHistory").innerHTML=history.length?history.map(e=>`<div class="evolution-item"><div class="evolution-date">${esc(e.date||"Sin fecha")}</div><div><strong>Mejoró</strong><p>${esc(e.improved||"Sin registro.")}</p></div><div><strong>Debe mejorar</strong><p>${esc(e.improve||"Sin registro.")}</p></div></div>`).join(""):'<div class="empty evolution-empty">Todavía no hay registros de evolución.</div>';
  document.getElementById("deleteDetail").classList.toggle("hidden",!session || session.role!=="Administrador");
  document.getElementById("detailModal").classList.remove("hidden");
}
function closeDetail(){document.getElementById("detailModal").classList.add("hidden");}

document.querySelectorAll(".nav-btn").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
document.getElementById("addPlayerTop").onclick=()=>openFormForSession();
document.getElementById("cancelBtn").onclick=closeForm;
document.getElementById("closeModal").onclick=closeForm;
document.getElementById("closeDetail").onclick=closeDetail;
document.getElementById("editDetail").onclick=()=>{const p=players.find(x=>x.id===selectedPlayerId);closeDetail();openForm(p);};
document.getElementById("deleteDetail").onclick=()=>{
  if(!session || session.role!=="Administrador"){alert("Solo un Administrador puede eliminar jugadores.");return;}
  const p=players.find(x=>x.id===selectedPlayerId); if(!p)return;
  if(confirm("¿Eliminar a "+p.name+"? Esta acción no se puede deshacer en la demo.")){players=players.filter(x=>x.id!==selectedPlayerId);save();closeDetail();render();}
};
document.getElementById("searchInput").addEventListener("input",e=>renderPlayers(e.target.value));
document.getElementById("playerCategoryFilter")?.addEventListener("change",e=>window.renderPlayers(document.getElementById("searchInput").value,e.target.value));

document.getElementById("playerForm").addEventListener("submit",e=>{
  e.preventDefault();
  const id=Number(document.getElementById("playerId").value);
  const old=players.find(p=>p.id===id);
  const evolutionDate=document.getElementById("evolutionDate").value;
  const evolutionImproved=document.getElementById("evolutionImproved").value.trim();
  const evolutionImprove=document.getElementById("evolutionImprove").value.trim();
  const evolution=[...(old?.evolution||[])];
  if(evolutionImproved || evolutionImprove){
    evolution.push({date:evolutionDate||new Date().toISOString().slice(0,10),improved:evolutionImproved,improve:evolutionImprove});
  }
  const data={
    ...(old||{}),id:id||Date.now(),name:document.getElementById("name").value.trim(),birthDate:document.getElementById("birthDate").value,
    guardianPhone:document.getElementById("guardianPhone").value.trim(),jersey:document.getElementById("jersey").value,category:document.getElementById("category").value,
    position:document.getElementById("position").value,foot:document.getElementById("foot").value,
    absenceHistory:JSON.parse(JSON.stringify(editingAttendancePlayer?.absenceHistory || old?.absenceHistory || {})),pastInjuries:document.getElementById("pastInjuries").value.trim(),conditions:document.getElementById("conditions").value.trim(),
    gameAspects:document.getElementById("gameAspects").value.trim(),notes:document.getElementById("notes").value.trim(),adminStatus:document.getElementById("adminStatus").value,evolution
  };
  if(!id){
    if(TRIAL_MODE && players.length >= TRIAL_MAX_PLAYERS){
      alert(`Esta versión de prueba permite hasta ${TRIAL_MAX_PLAYERS} jugadores. Para continuar con más jugadores se requiere la versión completa.`);
      return;
    }
    players.push(data);
  }else{
    if(session?.role==="Entrenador" && !(session.categories||[session.category]).includes(old?.category)){alert("No podés editar jugadores de otra categoría.");return;}
    players=players.map(p=>p.id===id?data:p);
  }
  save();closeForm();render();showView("players");document.getElementById("searchInput").value="";renderPlayers("");
});

// --- Demo authentication / role simulation ---
const defaultUsers={
  "entrenador.u13":{password:"demo123",role:"Entrenador",categories:["U-13"],category:"U-13",name:"Carlos Rodríguez"},
  "admin":{password:"admin123",role:"Administrador",categories:categories.slice(),category:"Todas",name:"Administrador"}
};
let demoUsers=JSON.parse(localStorage.getItem(USERS_KEY)||"null");
if(!demoUsers || typeof demoUsers!=="object"){ demoUsers={...defaultUsers}; localStorage.setItem(USERS_KEY,JSON.stringify(demoUsers)); }
if(!demoUsers.admin) { demoUsers.admin=defaultUsers.admin; localStorage.setItem(USERS_KEY,JSON.stringify(demoUsers)); }
Object.values(demoUsers).forEach(u=>{
  if(u.role==="Entrenador"){
    if(!Array.isArray(u.categories)) u.categories=u.category?[u.category]:[];
    u.categories=[...new Set(u.categories.filter(Boolean))];
    u.category=u.categories[0]||categories[0]||"";
  }
});
localStorage.setItem(USERS_KEY,JSON.stringify(demoUsers));
let session=JSON.parse(sessionStorage.getItem("academia_session")||"null");

function applySession(){
  const screen=document.getElementById("loginScreen"),sidebar=document.querySelector(".sidebar"),main=document.querySelector(".main");
  if(!session){screen.classList.remove("hidden");sidebar.style.display="none";main.style.display="none";return;}
  screen.classList.add("hidden");sidebar.style.display="flex";main.style.display="block";
  document.getElementById("currentUserName").textContent=session.name;
  document.getElementById("currentUserRole").textContent=session.role+(session.role==="Entrenador"?" · "+((session.categories||[session.category]).join(", ")):"");
  if(session.role==="Entrenador"){
    document.getElementById("addCategoryBtn")?.remove();
    window.render=function(){
      const allowedCategories=session.categories||[session.category];
      const visiblePlayers=players.filter(p=>allowedCategories.includes(p.category));
      document.getElementById("totalPlayers").textContent=visiblePlayers.length;
      document.getElementById("totalCategories").textContent=allowedCategories.length;
      const currentKey=monthKey();
      const absences=visiblePlayers.reduce((sum,p)=>sum+monthAbsenceCount(p,currentKey),0);
      document.getElementById("avgAttendance").textContent=absences;
      document.getElementById("avgAttendance").previousElementSibling.textContent="Faltas este mes";
      document.getElementById("categoryCards").innerHTML=allowedCategories.map(cat=>{const count=visiblePlayers.filter(p=>p.category===cat).length;return `<div class="category-card" onclick="showCategory('${esc(cat)}')"><div class="cat">${esc(cat)}</div><div class="count">${count} jugador${count===1?"":"es"}</div><div class="category-action">Ver jugadores →</div></div>`;}).join("");
      playerTable(visiblePlayers,"Esta categoría todavía no tiene jugadores.");
      document.getElementById("categoriesList").innerHTML=allowedCategories.map(cat=>{const count=visiblePlayers.filter(p=>p.category===cat).length;return `<div class="cat-row category-row-click" onclick="showCategory('${esc(cat)}')"><div><strong>${esc(cat)}</strong><small class="cat-hint">Ver jugadores →</small></div><span class="muted">${count} jugador${count===1?"":"es"}</span></div>`;}).join("");
      populateCategory();
      populatePlayerCategoryFilter();
    };
    window.renderPlayers=function(filter="", categoryFilter=null){
      const q=filter.toLowerCase();
      const allowedCategories=session.categories||[session.category];
      const selectedCategory=categoryFilter===null ? (document.getElementById("playerCategoryFilter")?.value||"") : categoryFilter;
      const list=players.filter(p=>allowedCategories.includes(p.category) && (!selectedCategory || p.category===selectedCategory) && p.name.toLowerCase().includes(q));
      playerTable(list,"No hay jugadores en tu categoría que coincidan con los filtros seleccionados.");
    };
    window.showCategory=function(cat){showView("players");document.getElementById("searchInput").value="";populatePlayerCategoryFilter(cat);window.renderPlayers("",cat);};
  }
}
function openFormForSession(){
  openForm();
  if(session && session.role==="Entrenador"){
    document.getElementById("category").value=(session.categories||[session.category])[0]||categories[0];
    document.getElementById("category").disabled=true;
  }
}
function saveUsers(){ localStorage.setItem(USERS_KEY,JSON.stringify(demoUsers)); }
function renderCoachAdmin(){
  const panel=document.getElementById("coachAdminPanel"), list=document.getElementById("coachesList");
  if(!panel||!list)return;
  if(!session || session.role!=="Administrador"){ panel.classList.add("hidden"); return; }
  panel.classList.remove("hidden");
  const coaches=Object.entries(demoUsers).filter(([u,x])=>x.role==="Entrenador");
  if(!coaches.length){ list.innerHTML='<div class="coach-empty">No hay entrenadores registrados.</div>'; return; }
  list.innerHTML=coaches.map(([username,u])=>{
    const assigned=u.categories||[u.category].filter(Boolean);
    return `<div class="coach-row"><div class="coach-info"><strong>${esc(u.name)}</strong><small>Usuario: ${esc(username)}</small><small>Categorías: ${esc(assigned.join(", ")||"Ninguna")}</small></div><div class="coach-assignment"><div class="coach-category-checks">${categories.map(c=>`<label class="check-option"><input type="checkbox" class="coach-category-check" data-username="${esc(username)}" value="${esc(c)}" ${assigned.includes(c)?"checked":""}> ${esc(c)}</label>`).join("")}</div><div class="coach-actions"><button type="button" class="secondary save-coach-category" data-username="${esc(username)}">Guardar categorías</button><button type="button" class="secondary edit-coach" data-username="${esc(username)}">Editar</button><button type="button" class="danger delete-coach" data-username="${esc(username)}">Eliminar</button></div></div></div>`;
  }).join("");
  list.querySelectorAll(".save-coach-category").forEach(btn=>btn.onclick=()=>{
    const username=btn.dataset.username;
    const checks=[...list.querySelectorAll(`.coach-category-check[data-username="${CSS.escape(username)}"]:checked`)].map(x=>x.value);
    if(!checks.length){alert("Seleccioná al menos una categoría.");return;}
    demoUsers[username].categories=[...new Set(checks)];
    demoUsers[username].category=checks[0];
    saveUsers(); renderCoachAdmin(); alert("Categorías asignadas correctamente a "+demoUsers[username].name+".");
  });
  list.querySelectorAll(".edit-coach").forEach(btn=>btn.onclick=()=>openCoachModal("edit",btn.dataset.username));
  list.querySelectorAll(".delete-coach").forEach(btn=>btn.onclick=()=>deleteCoach(btn.dataset.username));
}
function openCoachModal(mode="add",username=""){
  const modal=document.getElementById("coachModal");
  const title=document.getElementById("coachModalTitle"); const saveBtn=document.getElementById("saveCoachBtn");
  const editOriginal=document.getElementById("coachEditOriginal"); const name=document.getElementById("coachName");
  const user=document.getElementById("coachUsername"); const pass=document.getElementById("coachPassword"); const category=document.getElementById("coachCategory");
  category.innerHTML=categories.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join("");
  title.textContent=mode==="edit"?"Editar entrenador":"Agregar entrenador"; saveBtn.textContent=mode==="edit"?"Guardar cambios":"Crear entrenador"; editOriginal.value=mode==="edit"?username:"";
  if(mode==="edit"){
    const coach=demoUsers[username]; if(!coach)return;
    name.value=coach.name||""; user.value=username; pass.value=""; pass.placeholder="Dejá vacío para conservar la actual";
    const assigned=coach.categories||[coach.category].filter(Boolean);
    [...category.options].forEach(o=>o.selected=assigned.includes(o.value));
    category.multiple=true; category.size=Math.min(Math.max(categories.length,2),6);
  }else{
    name.value=""; user.value=""; pass.value=""; pass.placeholder="Contraseña"; category.multiple=true; category.size=Math.min(Math.max(categories.length,2),6); category.options[0]&&(category.options[0].selected=true);
  }
  modal.classList.remove("hidden"); name.focus();
}
function deleteCoach(username){
  if(!session || session.role!=="Administrador")return;
  const coach=demoUsers[username];
  if(!coach || coach.role!=="Entrenador")return;
  const assigned=coach.categories||[coach.category];
  const playerCount=players.filter(p=>assigned.includes(p.category)).length;
  const warning=playerCount?`

La categoría ${coach.category} tiene ${playerCount} jugador${playerCount===1?"":"es"}. Los jugadores NO se eliminarán.`:"";
  if(confirm(`¿Eliminar al entrenador ${coach.name}?${warning}`)){
    delete demoUsers[username];
    saveUsers();
    renderCoachAdmin();
    alert("Entrenador eliminado correctamente.");
  }
}
function setupCoachAdmin(){
  const panel=document.getElementById("coachAdminPanel"), btn=document.getElementById("addCoachBtn"), modal=document.getElementById("coachModal"), form=document.getElementById("coachForm");
  if(!panel||!btn||!modal||!form)return;
  btn.onclick=()=>{
    if(!categories.length){alert("Primero creá al menos una categoría.");return;}
    if(TRIAL_MODE){
      const coachCount=Object.values(demoUsers).filter(u=>u.role==="Entrenador").length;
      if(coachCount>=TRIAL_MAX_COACHES){
        alert(`Esta versión de prueba permite hasta ${TRIAL_MAX_COACHES} entrenadores.`);
        return;
      }
    }
    openCoachModal("add");
  };
  const close=()=>modal.classList.add("hidden");
  document.getElementById("closeCoach").onclick=close;
  document.getElementById("cancelCoach").onclick=close;
  form.onsubmit=e=>{
    e.preventDefault();
    const name=document.getElementById("coachName").value.trim();
    const username=document.getElementById("coachUsername").value.trim().toLowerCase();
    const password=document.getElementById("coachPassword").value;
    const categoryValues=[...document.getElementById("coachCategory").selectedOptions].map(o=>o.value);
    const category=categoryValues[0]||"";
    const original=document.getElementById("coachEditOriginal").value;
    if(!name||!username||!category)return;
    if(original){
      const existing=demoUsers[original];
      if(!existing || existing.role!=="Entrenador")return;
      if(username!==original && demoUsers[username]){alert("Ese usuario ya existe.");return;}
      const updated={...existing,name,categories:categoryValues,category};
      if(password)updated.password=password;
      if(username!==original){delete demoUsers[original];}
      demoUsers[username]=updated;
      saveUsers(); close(); renderCoachAdmin(); alert("Entrenador actualizado correctamente.");
    }else{
      if(!password){alert("Ingresá una contraseña para el nuevo entrenador.");return;}
      if(demoUsers[username]){alert("Ese usuario ya existe.");return;}
      demoUsers[username]={password,role:"Entrenador",categories:categoryValues,category,name};
      saveUsers(); close(); renderCoachAdmin(); alert("Entrenador creado. Ya puede iniciar sesión con su usuario y contraseña.");
    }
  };
}

document.getElementById("loginForm").addEventListener("submit",e=>{
  e.preventDefault();const u=document.getElementById("loginUser").value.trim().toLowerCase(),p=document.getElementById("loginPassword").value,found=demoUsers[u];
  if(!found||found.password!==p){alert("Usuario o contraseña incorrectos.");return;}
  session={username:u,...found};sessionStorage.setItem("academia_session",JSON.stringify(session));location.reload();
});
document.getElementById("logoutBtn").onclick=()=>{sessionStorage.removeItem("academia_session");location.reload();};
document.getElementById("playerForm").addEventListener("submit",()=>{document.getElementById("category").disabled=false;});
document.getElementById("attendanceMonth")?.addEventListener("change",()=>{editingAttendanceMonth=document.getElementById("attendanceMonth").value||monthKey();renderAttendanceCalendar(editingAttendancePlayer);});
document.getElementById("prevAttendanceMonth")?.addEventListener("click",()=>shiftAttendanceMonth(-1));
document.getElementById("nextAttendanceMonth")?.addEventListener("click",()=>shiftAttendanceMonth(1));

applySession();

function openCategoryModal(mode="add",category=""){
  const modal=document.getElementById("categoryModal");
  document.getElementById("categoryModalTitle").textContent=mode==="edit"?"Editar categoría":"Agregar categoría";
  document.getElementById("categoryName").value=category;
  document.getElementById("categoryEditOriginal").value=mode==="edit"?category:"";
  modal.classList.remove("hidden");
  document.getElementById("categoryName").focus();
}
function setupCategoryAdmin(){
  const btn=document.getElementById("addCategoryBtn"),modal=document.getElementById("categoryModal"),form=document.getElementById("categoryForm"),close=()=>modal.classList.add("hidden");
  if(!btn)return;
  if(!session||session.role!=="Administrador"){btn.style.display="none";return;}
  btn.style.display="inline-block";
  btn.onclick=()=>openCategoryModal("add");
  document.getElementById("closeCategory").onclick=close;document.getElementById("cancelCategory").onclick=close;
  form.onsubmit=e=>{e.preventDefault();const name=document.getElementById("categoryName").value.trim().toUpperCase();const original=document.getElementById("categoryEditOriginal").value;
    if(!name)return;
    if(categories.some(c=>c.toLowerCase()===name.toLowerCase() && c!==original)){alert("Esa categoría ya existe. No se puede duplicar.");return;}
    if(original){
      categories=categories.map(c=>c===original?name:c);
      players=players.map(p=>p.category===original?{...p,category:name}:p);
      Object.values(demoUsers).forEach(u=>{if(u.role==="Entrenador"&&u.category===original)u.category=name;});
      save();saveUsers();close();render();showView("categories");alert("Categoría actualizada correctamente.");
    }else{
      if(TRIAL_MODE && categories.length >= TRIAL_MAX_CATEGORIES){
        alert(`Esta versión de prueba permite hasta ${TRIAL_MAX_CATEGORIES} categorías.`);
        return;
      }
      categories.push(name);save();close();render();showView("categories");
    }
  };
}
function editCategory(name){ if(!session||session.role!=="Administrador")return; openCategoryModal("edit",name); }
function deleteCategory(name){
  if(!session||session.role!=="Administrador")return;
  const playerCount=players.filter(p=>p.category===name).length;
  const coachCount=Object.values(demoUsers).filter(u=>u.role==="Entrenador"&&u.category===name).length;
  if(playerCount||coachCount){ alert(`No se puede eliminar ${name} todavía. Tiene ${playerCount} jugador${playerCount===1?"":"es"} y ${coachCount} entrenador${coachCount===1?"":"es"} asignado${coachCount===1?"":"s"}. Reasigná esos registros primero.`); return; }
  if(categories.length===1){alert("La academia debe conservar al menos una categoría.");return;}
  if(confirm(`¿Eliminar la categoría ${name}?`)){categories=categories.filter(c=>c!==name);save();render();showView("categories");}
}


const DEFAULT_REPORT_ASPECTS=[
  "Si tienen conocimiento de que alguno de estos chicos ya NO está en la academia, favor informarme.",
  "Ellos son jugadores que deben 2 meses o mas de mensualidad.",
  "Favor hablar con los jugadores y papas, y indicarles qué si no se ponen al día, por desicion de la parte administrativa de la Academia, NO podrá jugar partidos.",
  "Si algún profesor lleva al partido algún jugadores que este la lista de morosos, se expone a una multa económica.",
  "Tratemos de colaborar con esta parte, recuerde que todos ustedes son profesionales, dedicados a sus grupos y NO pueden regalar su trabajo."
];
const REPORT_OBS_KEY="academia_sql_demo_v4_report_observations";
function reportObsStore(){return JSON.parse(localStorage.getItem(REPORT_OBS_KEY)||"{}");}
function reportKey(){return `${document.getElementById("reportCategory").value}|${document.getElementById("reportMonth").value}`;}
function populateReportControls(){
  const cat=document.getElementById("reportCategory"); if(!cat)return;
  const allowed=session?.role==="Administrador"?categories:(session?.categories||[session?.category]);
  cat.innerHTML=allowed.filter(Boolean).map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join("");
  document.getElementById("reportMonth").value=monthKey();
  loadReportObservations(); renderReportPreview();
}
function loadReportObservations(){
  const store=reportObsStore(); document.getElementById("reportExtraObservations").value=store[reportKey()]||"";
  document.getElementById("defaultAspects").innerHTML=DEFAULT_REPORT_ASPECTS.map((x,i)=>`<div class="aspect-item"><span>${i+1}.</span><p>${esc(x)}</p></div>`).join("");
}
function reportRows(){
  const cat=document.getElementById("reportCategory").value, key=document.getElementById("reportMonth").value||monthKey();
  const sessions=Math.max(1,Number(document.getElementById("reportSessions").value)||8);
  return players.filter(p=>p.category===cat).map(p=>{const abs=Math.min(sessions,monthAbsenceCount(p,key)); const attended=Math.max(0,sessions-abs); return {p,abs,attended,sessions};});
}
function renderReportPreview(){
  const box=document.getElementById("reportPreview"); if(!box)return;
  const rows=reportRows(); const cat=document.getElementById("reportCategory").value; const key=document.getElementById("reportMonth").value||monthKey();
  box.innerHTML=`<div class="report-preview-head"><div><h4>Informe de asistencia — ${esc(cat)}</h4><p>${esc(monthName(key))} · ${document.getElementById("reportSessions").value||8} entrenamientos</p></div><span>${rows.length} jugador${rows.length===1?"":"es"}</span></div><div class="table-wrap"><table class="table"><thead><tr><th>Jugador</th><th>Asistencia</th><th>Faltas</th><th>Estado administrativo</th></tr></thead><tbody>${rows.length?rows.map(r=>`<tr><td>${esc(r.p.name)}</td><td><strong>${r.attended}/${r.sessions}</strong></td><td>${r.abs}</td><td><span class="status-pill">${esc(adminStatusLabel(r.p.adminStatus))}</span></td></tr>`).join(""): '<tr><td colspan="4">No hay jugadores registrados en esta categoría.</td></tr>'}</tbody></table></div>`;
}
function saveReportObservations(){const store=reportObsStore();store[reportKey()]=document.getElementById("reportExtraObservations").value.trim();localStorage.setItem(REPORT_OBS_KEY,JSON.stringify(store));alert("Observaciones del informe guardadas.");}
function generateReportPDF(){
  if(!session||session.role!=="Administrador"){alert("Solo el administrador puede generar informes.");return;}
  if(!window.jspdf?.jsPDF){alert("No se pudo cargar el generador PDF. Verificá la conexión a Internet y volvé a intentar.");return;}
  const cat=document.getElementById("reportCategory").value, key=document.getElementById("reportMonth").value||monthKey(), sessions=Math.max(1,Number(document.getElementById("reportSessions").value)||8);
  const rows=reportRows(); const extra=document.getElementById("reportExtraObservations").value.trim();
  const {jsPDF}=window.jspdf; const doc=new jsPDF();
  doc.setFont("helvetica","bold");doc.setFontSize(18);doc.text("ACADEMIA DE FÚTBOL",14,18);doc.setFontSize(13);doc.text("Informe mensual de asistencia",14,27);
  doc.setFont("helvetica","normal");doc.setFontSize(10);doc.text(`Categoría: ${cat}`,14,36);doc.text(`Mes: ${monthName(key)}`,14,42);doc.text(`Entrenamientos: ${sessions}`,14,48);
  const pdfStatusText = status => ({
    TODO_EN_REGLA:"Todo en regla",
    NO_SE_HA_REPORTADO:"NO se ha reportado",
    ARREGLO_DE_PAGO:"Arreglo de pago",
    SALIERON_DE_LA_ACADEMIA:"Salieron de la Academia"
  })[status] || "Todo en regla";
  const body=rows.map(r=>[r.p.name,`${r.attended}/${r.sessions}`,String(r.abs),pdfStatusText(r.p.adminStatus)]);
  doc.autoTable({
    startY:55,
    head:[["Jugador","Asistencia","Faltas","Estado administrativo"]],
    body,
    styles:{fontSize:9,cellPadding:3},
    headStyles:{fillColor:[109,104,117],textColor:255},
    didDrawCell:data=>{
      if(data.section!=="body" || data.column.index!==3) return;
      const status=rows[data.row.index]?.p?.adminStatus || "TODO_EN_REGLA";
      const x=data.cell.x+5, cy=data.cell.y+data.cell.height/2;
      doc.setLineWidth(0.8);
      if(status==="TODO_EN_REGLA"){
        doc.setFillColor(46,160,67); doc.circle(x,cy,2.4,"F");
        doc.setDrawColor(255,255,255); doc.setLineWidth(0.8);
        doc.line(x-1.1,cy,x-0.2,cy+0.9); doc.line(x-0.2,cy+0.9,x+1.4,cy-1.1);
      }else if(status==="NO_SE_HA_REPORTADO"){
        doc.setDrawColor(210,45,45); doc.setLineWidth(1.2);
        doc.line(x-1.7,cy-1.7,x+1.7,cy+1.7); doc.line(x+1.7,cy-1.7,x-1.7,cy+1.7);
      }else if(status==="ARREGLO_DE_PAGO"){
        doc.setFillColor(65,105,180); doc.roundedRect(x-3,cy-2.1,6,4.2,1,1,"F");
        doc.setFillColor(65,105,180); doc.triangle(x-1.3,cy+1.6,x-2.2,cy+3,x-0.1,cy+1.7,"F");
        doc.setFillColor(255,255,255); doc.circle(x-1.4,cy,0.35,"F"); doc.circle(x,cy,0.35,"F"); doc.circle(x+1.4,cy,0.35,"F");
      }else if(status==="SALIERON_DE_LA_ACADEMIA"){
        doc.setFillColor(190,45,45); doc.circle(x,cy,2.5,"F");
        doc.setDrawColor(255,255,255); doc.setLineWidth(0.8); doc.line(x-1.3,cy-1.3,x+1.3,cy+1.3); doc.line(x+1.3,cy-1.3,x-1.3,cy+1.3);
      }
    },
    didParseCell:data=>{
      if(data.section==="body" && data.column.index===3) data.cell.styles.cellPadding={top:3,right:3,bottom:3,left:8};
    }
  });
  let y=(doc.lastAutoTable?.finalY||55)+12;
  doc.setFont("helvetica","bold");doc.setFontSize(12);
  doc.text("Aspectos a considerar",20,y);
  doc.setFillColor(255,180,0); doc.circle(15,y-1.5,2.2,"F");
  doc.setDrawColor(255,255,255); doc.setLineWidth(0.8); doc.line(15,y-2.4,15,y-0.7); doc.circle(15,y-0.1,0.25,"F");
  y+=7; doc.setFont("helvetica","normal");doc.setFontSize(9);
  DEFAULT_REPORT_ASPECTS.forEach((a,i)=>{const lines=doc.splitTextToSize(`${i+1}. ${a}`,180);doc.text(lines,14,y);y+=lines.length*5+2;if(y>270){doc.addPage();y=18;}});
  if(extra){if(y>260){doc.addPage();y=18;}doc.setFont("helvetica","bold");doc.setFontSize(11);doc.text("Observaciones adicionales",14,y);y+=7;doc.setFont("helvetica","normal");doc.setFontSize(9);doc.text(doc.splitTextToSize(extra,180),14,y);}
  const filename=`Informe_Asistencia_${cat.replace(/[^a-z0-9]+/gi,"_")}_${key}.pdf`;doc.save(filename);
}
function setupReports(){
  const nav=document.querySelector('.nav-btn[data-view="reports"]'); if(!nav)return;
  nav.addEventListener("click",()=>{if(session?.role!=="Administrador"){showView("dashboard");return;}populateReportControls();});
  document.getElementById("reportCategory")?.addEventListener("change",()=>{loadReportObservations();renderReportPreview();});
  document.getElementById("reportMonth")?.addEventListener("change",()=>{loadReportObservations();renderReportPreview();});
  document.getElementById("reportSessions")?.addEventListener("input",renderReportPreview);
  document.getElementById("previewReportBtn")?.addEventListener("click",renderReportPreview);
  document.getElementById("generateReportBtn")?.addEventListener("click",generateReportPDF);
  document.getElementById("saveReportObservations")?.addEventListener("click",saveReportObservations);
  if(session?.role!=="Administrador") nav.style.display="none";
}

setupCategoryAdmin();
setupCoachAdmin();
setupReports();
renderCoachAdmin();
render();
