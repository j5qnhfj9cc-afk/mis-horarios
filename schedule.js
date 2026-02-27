// Horario: 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb
// Formato de hora 24h: "HH:MM"
// timezone: America/Argentina/Mendoza

const SCHEDULE = [
  // EJEMPLOS (cámbialos por los tuyos)
  { day: 1, start: "08:00", end: "10:00", course: "Ingles", room: "Ambiente 1" },
  { day: 1, start: "10:30", end: "12:45", course: "Comunicación de datos", room: "Ambiente 1" },
  { day: 2, start: "08:00", end: "10:15", course: "Economía", room: "Ambiente 1"},
  { day: 2, start: "16:00", end: "19:00", course: "Bases de datos", room: "Ambiente 1"},
  { day: 3, start: "08:00", end: "12:45", course: "Diseño de sistemas de información", room: "Ambiente 1" },
  { day: 3, start: "16:00", end: "19:00", course: "Desarrollo de software", room: "Ambiente 1" },
  { day: 4, start: "08:00", end: "11:15", course: "Análisis numérico", room: "Ambiente 1" },
  { day: 5, start: "08:00", end: "10:00", course: "Ingles", room: "Ambiente 1" },
  { day: 5, start: "10:30", end: "12:45", course: "Economía", room: "Ambiente 1" },
];

const TZ = "America/Argentina/Mendoza";

function toMinutes(hhmm){
  const [h,m] = hhmm.split(":").map(Number);
  return h*60 + m;
}

function nowInTZ(){
  // Convertimos "ahora" a partes de tiempo en la zona indicada
  const parts = new Intl.DateTimeFormat("es-AR", {
    timeZone: TZ,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(new Date());

  const get = (type) => parts.find(p => p.type === type)?.value;

  // weekday: dom, lun, mar, mié, jue, vie, sáb (varía por locale pero funciona en es-AR)
  const wd = (get("weekday") || "").toLowerCase();
  const map = { "dom":0, "lun":1, "mar":2, "mié":3, "mie":3, "jue":4, "vie":5, "sáb":6, "sab":6 };

  const day = map[wd] ?? new Date().getDay();
  const hour = Number(get("hour"));
  const minute = Number(get("minute"));
  return { day, minutes: hour*60 + minute };
}

function isInClass(){
  const { day, minutes } = nowInTZ();
  const current = SCHEDULE.find(s =>
    s.day === day &&
    minutes >= toMinutes(s.start) &&
    minutes < toMinutes(s.end)
  );
  return current || null;
}

function dayName(d){
  return ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"][d];
}

function renderTable(){
  const tbody = document.querySelector("#table tbody");
  tbody.innerHTML = "";

  const sorted = [...SCHEDULE].sort((a,b) => a.day - b.day || toMinutes(a.start) - toMinutes(b.start));
  for (const s of sorted){
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${dayName(s.day)}</td>
      <td>${s.start}–${s.end}</td>
      <td>${s.course}</td>
      <td>${s.room || "-"}</td>
    `;
    tbody.appendChild(tr);
  }
}

function tick(){
  const status = document.getElementById("status");
  const current = isInClass();

  if (current){
    status.className = "status in";
    status.textContent = `✅ Estoy en clases: ${current.course} (${current.start}–${current.end})`;
  } else {
    status.className = "status out";
    status.textContent = "🟡 No estoy en clases ahora";
  }
}

renderTable();
tick();
setInterval(tick, 30 * 1000); // refresca cada 30s

