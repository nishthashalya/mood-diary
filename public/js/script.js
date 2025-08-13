const calendar = document.getElementById('calendar');
const modal = document.getElementById('moodModal');
const closeModalBtn = document.getElementById('closeModal');
const saveBtn = document.getElementById('saveMood');
const deleteBtn = document.getElementById('deleteEntry');
const selectedDateEl = document.getElementById('selectedDate');
const colorPicker = document.getElementById('modalColorPicker');
const noteInput = document.getElementById('modalNote');
const emojiPicker = document.getElementById('emojiPicker');
const scorePicker = document.getElementById('scorePicker');
const tagInput = document.getElementById('tagInput');

const toggleThemeBtn = document.getElementById('toggleTheme');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const todayBtn = document.getElementById('todayBtn');
const monthLabel = document.getElementById('monthLabel');

const legendEl = document.getElementById('legend');
const entryListEl = document.getElementById('entryList');
const searchEl = document.getElementById('search');

const insightsMonth = document.getElementById('insightsMonth');
const chartMood = document.getElementById('chartMood');
const chartScore = document.getElementById('chartScore');
const insightFacts = document.getElementById('insightFacts');

const exportJSONBtn = document.getElementById('exportJSON');
const exportCSVBtn = document.getElementById('exportCSV');
const importBtn = document.getElementById('importBtn');
const importJSON = document.getElementById('importJSON');
const clearAllBtn = document.getElementById('clearAll');

const presetEditor = document.getElementById('presetEditor');

// --- State ---
let selectedDate = null;
let moodData = JSON.parse(localStorage.getItem('moodDataV2') || '{}');
let settings = JSON.parse(localStorage.getItem('moodSettings') || '{}');
if(!settings.presets){
  settings.presets = [
    {label:'Great', color:'#79f28a', emoji:'🤩', score:5},
    {label:'Good',  color:'#6bfacc', emoji:'🙂', score:4},
    {label:'Okay',  color:'#7aa2ff', emoji:'😐', score:3},
    {label:'Low',   color:'#ffb86b', emoji:'😕', score:2},
    {label:'Bad',   color:'#ff7a9b', emoji:'😢', score:1},
  ];
}

let current = new Date();
let currentYear = current.getFullYear();
let currentMonth = current.getMonth();

// --- Routing ---
const views = {
  calendar: document.getElementById('view-calendar'),
  journal:  document.getElementById('view-journal'),
  insights: document.getElementById('view-insights'),
  data:     document.getElementById('view-data'),
  settings: document.getElementById('view-settings'),
};
document.querySelectorAll('.nav button').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const v = btn.dataset.view;
    Object.values(views).forEach(el=>el.style.display='none');
    views[v].style.display='block';
    document.querySelectorAll('.nav button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    if(v==='insights'){renderInsights();}
    if(v==='journal'){renderList();}
  })
})

// --- Calendar ---
function generateCalendar(year, month){
  const date = new Date(year, month, 1);
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const firstDay = date.getDay();
  calendar.innerHTML = '';

  for(let i=0;i<firstDay;i++){
    const empty = document.createElement('div');
    empty.className = 'day empty';
    calendar.appendChild(empty);
  }

  for(let d=1; d<=daysInMonth; d++){
    const cell = document.createElement('div');
    cell.className = 'day';
    const dateStr = fmtDate(year, month+1, d);
    cell.innerHTML = `<div class="date-number">${d}</div>`;

    const data = moodData[dateStr];
    if(data){
      const overlay = document.createElement('div');
      overlay.className = 'mood-color';
      overlay.style.backgroundColor = data.color;
      cell.appendChild(overlay);
      const e = document.createElement('div');
      e.className='mood-emoji';
      e.textContent = data.emoji || '';
      cell.appendChild(e);
    }

    cell.addEventListener('click',()=> openModal(dateStr));
    calendar.appendChild(cell);
  }

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  monthLabel.textContent = `${monthNames[month]} ${year}`;
  buildLegend();
}

function openModal(dateStr){
  selectedDate = dateStr;
  selectedDateEl.textContent = dateStr;
  const data = moodData[dateStr] || { color: '#7aa2ff', note: '', emoji:'', score:3, tags:[] };
  colorPicker.value = data.color;
  noteInput.value = data.note || '';
  emojiPicker.value = data.emoji || '😐';
  scorePicker.value = data.score || 3;
  tagInput.value = (data.tags||[]).map(t=>`#${t}`).join(' ');
  modal.classList.add('open');
}
function closeModal(){ modal.classList.remove('open'); }

function saveMood(){
  if(!selectedDate) return;
  const tags = tagInput.value.split(/\s+/).filter(Boolean).map(t=>t.replace(/^#/,'').toLowerCase());
  moodData[selectedDate] = {
    color: colorPicker.value,
    note: noteInput.value.trim(),
    emoji: emojiPicker.value,
    score: +scorePicker.value,
    tags
  };
  persist();
  generateCalendar(currentYear, currentMonth);
  closeModal();
}

function deleteEntryFn(){
  if(selectedDate && moodData[selectedDate]){
    delete moodData[selectedDate];
    persist();
    generateCalendar(currentYear, currentMonth);
  }
  closeModal();
}

closeModalBtn.addEventListener('click', closeModal);
saveBtn.addEventListener('click', saveMood);
deleteBtn.addEventListener('click', deleteEntryFn);
window.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal(); })

prevMonthBtn.addEventListener('click', ()=>{ currentMonth--; if(currentMonth<0){currentMonth=11;currentYear--;} generateCalendar(currentYear,currentMonth);});
nextMonthBtn.addEventListener('click', ()=>{ currentMonth++; if(currentMonth>11){currentMonth=0;currentYear++;} generateCalendar(currentYear,currentMonth);});
todayBtn.addEventListener('click', ()=>{ const t=new Date(); currentYear=t.getFullYear(); currentMonth=t.getMonth(); generateCalendar(currentYear,currentMonth); });

// Quick add opens today
const qa = document.getElementById('quickAdd');
qa && qa.addEventListener('click', ()=>{
  const t=new Date();
  const ds = fmtDate(t.getFullYear(), t.getMonth()+1, t.getDate());
  openModal(ds);
})

// --- Legend / Presets ---
function buildLegend(){
  legendEl.innerHTML = '';
  settings.presets.forEach(p=>{
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.innerHTML = `<span class="swatch" style="background:${p.color}"></span><span>${p.emoji || ''} ${p.label}</span>`;
    tag.addEventListener('click',()=>{
      if(selectedDate){ // apply preset to modal fields
        colorPicker.value=p.color; emojiPicker.value=p.emoji; scorePicker.value=p.score;
      }
    })
    legendEl.appendChild(tag);
  })
}

function renderPresetEditor(){
  presetEditor.innerHTML='';
  settings.presets.forEach((p,idx)=>{
    const el = document.createElement('div');
    el.className='tag';
    el.innerHTML = `<input type="color" value="${p.color}" data-idx="${idx}" /> <span style="min-width:28px;text-align:center">${p.emoji}</span> <span contenteditable data-idx="${idx}" style="outline:none">${p.label}</span>`;
    el.querySelector('input').addEventListener('change',e=>{ settings.presets[idx].color=e.target.value; persist(); generateCalendar(currentYear,currentMonth); buildLegend(); });
    el.querySelector('[contenteditable]').addEventListener('blur',e=>{ settings.presets[idx].label=e.target.textContent.trim()||p.label; persist(); buildLegend(); });
    presetEditor.appendChild(el);
  })
}

// --- Journal list ---
function renderList(){
  const q = (searchEl.value||'').toLowerCase();
  const items = Object.entries(moodData)
    .map(([date,d])=>({date,...d}))
    .sort((a,b)=> a.date<b.date?1:-1)
    .filter(d=> !q || d.note.toLowerCase().includes(q) || (d.tags||[]).join(' ').includes(q.replace('#','')) );

  entryListEl.innerHTML='';
  if(!items.length){ entryListEl.innerHTML = '<div class="entry" style="justify-content:center;color:var(--muted)">No entries yet.</div>'; return; }

  items.forEach(d=>{
    const el = document.createElement('div');
    el.className='entry';
    el.innerHTML = `
      <div class="meta">
        <span class="swatch" style="width:14px;height:14px;background:${d.color}"></span>
        <strong>${d.date}</strong>
        <span>${d.emoji || ''}</span>
        <span class="muted">· score ${d.score}</span>
        <span class="muted">${(d.tags||[]).map(t=>'#'+t).join(' ')}</span>
      </div>
      <div style="max-width:60%">${escapeHtml(d.note||'')}</div>`;
    el.addEventListener('click',()=>openModal(d.date));
    entryListEl.appendChild(el);
  })
}
searchEl && searchEl.addEventListener('input', renderList);

// --- Insights ---
function renderInsights(){
  const keys = Object.keys(moodData).sort();
  const months = [...new Set(keys.map(k=>k.slice(0,7)))];
  insightsMonth.innerHTML = months.map(m=>`<option value="${m}">${m}</option>`).join('');
  if(!months.length){ insightFacts.innerHTML = '<span class="muted">No data yet.</span>'; drawBar(chartMood,[]); drawLine(chartScore,[]); return; }
  const sel = insightsMonth.value || months[months.length-1];
  if(!insightsMonth.value) insightsMonth.value = sel;

  const data = keys.filter(k=>k.startsWith(sel)).map(k=>({date:k, ...moodData[k]}));

  const byColor = {};
  data.forEach(d=>{ byColor[d.color] = (byColor[d.color]||0)+1; });
  const dist = Object.entries(byColor).map(([color,count])=>({label: color, value: count, color}));
  drawBar(chartMood,dist);

  const byDay = {};
  data.forEach(d=>{ const day=+d.date.slice(-2); (byDay[day]||(byDay[day]=[])).push(d.score||3); })
  const avg = Object.entries(byDay).map(([day,arr])=>({x:+day, y:avgArr(arr)})).sort((a,b)=>a.x-b.x);
  drawLine(chartScore,avg);

  const streak = calcStreak();
  const avgScore = avgArr(data.map(d=>d.score||3)).toFixed(2);
  const mostCommon = dist.sort((a,b)=>b.value-a.value)[0];
  insightFacts.innerHTML = `
    <div class="row wrap gap">
      <div class="tag"><b>Current streak:</b> ${streak} days</div>
      <div class="tag"><b>Monthly average score:</b> ${avgScore}</div>
      ${mostCommon?`<div class="tag"><span class="swatch" style="background:${mostCommon.color}"></span> Top color days: ${mostCommon.value}</div>`:''}
    </div>`;
}
insightsMonth && insightsMonth.addEventListener('change', renderInsights);

// --- Tiny chart drawer (vanilla canvas) ---
function drawBar(canvas, series){
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.clientWidth * devicePixelRatio;
  const h = canvas.height = canvas.clientHeight * devicePixelRatio;
  ctx.clearRect(0,0,w,h);
  if(!series.length){ return; }
  const max = Math.max(...series.map(s=>s.value));
  const barW = w/(series.length*1.5);
  series.forEach((s,i)=>{
    const x = (i+0.5)*barW*1.5;
    const bh = (s.value/max)*(h*0.72);
    ctx.fillStyle = s.color; ctx.globalAlpha = .8; ctx.fillRect(x, h-30-bh, barW, bh); ctx.globalAlpha=1;
    ctx.fillStyle = '#cbd5e1'; ctx.font = `${14*devicePixelRatio}px Inter`; ctx.fillText(String(s.value), x, h-34);
  })
}
function drawLine(canvas, points){
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.clientWidth * devicePixelRatio;
  const h = canvas.height = canvas.clientHeight * devicePixelRatio;
  ctx.clearRect(0,0,w,h);
  if(!points.length){ return; }
  const minX = Math.min(...points.map(p=>p.x)), maxX = Math.max(...points.map(p=>p.x));
  const minY = 1, maxY = 5;
  const sx = x => ((x-minX)/(maxX-minX||1)) * (w-40) + 20;
  const sy = y => h-30 - ((y-minY)/(maxY-minY)) * (h-60);
  ctx.beginPath();
  points.forEach((p,i)=>{ const x=sx(p.x), y=sy(p.y); i?ctx.lineTo(x,y):ctx.moveTo(x,y); });
  ctx.strokeStyle = '#7aa2ff'; ctx.lineWidth = 2*devicePixelRatio; ctx.stroke();
  points.forEach(p=>{ const x=sx(p.x), y=sy(p.y); ctx.fillStyle='#7aa2ff'; ctx.beginPath(); ctx.arc(x,y,3*devicePixelRatio,0,Math.PI*2); ctx.fill(); })
}

// --- Data utils ---
function persist(){ localStorage.setItem('moodDataV2', JSON.stringify(moodData)); localStorage.setItem('moodSettings', JSON.stringify(settings)); }
function fmtDate(y,m,d){ return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}` }
function avgArr(a){ return a.reduce((s,x)=>s+x,0)/Math.max(a.length,1); }
function escapeHtml(s){ return String(s).replace(/[&<>]/g, c=> ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]) ); }
function calcStreak(){
  const today = new Date();
  let streak=0; let cur = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  for(;;){
    const key = fmtDate(cur.getFullYear(), cur.getMonth()+1, cur.getDate());
    if(moodData[key]){ streak++; cur.setDate(cur.getDate()-1); } else break;
  }
  return streak;
}

// --- Theme ---
toggleThemeBtn.addEventListener('click',()=>{
  document.documentElement.classList.toggle('light');
  localStorage.setItem('themeV2', document.documentElement.classList.contains('light')?'light':'dark');
})
if(localStorage.getItem('themeV2')==='light'){ document.documentElement.classList.add('light'); }

// --- Import / Export ---
exportJSONBtn.addEventListener('click',()=>{
  download('mood-data.json', JSON.stringify({moodData, settings}, null, 2));
})
exportCSVBtn.addEventListener('click',()=>{
  const rows = [['date','color','emoji','score','tags','note']]
    .concat(Object.entries(moodData).map(([date,d])=>[
      date,d.color,d.emoji||'',d.score||'', (d.tags||[]).join(' '), (d.note||'').replace(/\n/g,'  ')
    ]));
  const csv = rows.map(r=> r.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(',') ).join('\n');
  download('mood-data.csv', csv);
})
importBtn.addEventListener('click',()=> importJSON.click());
importJSON.addEventListener('change', async (e)=>{
  const file = e.target.files[0]; if(!file) return;
  const text = await file.text();
  try{
    const {moodData:md, settings:s} = JSON.parse(text);
    if(md) moodData = md; if(s) settings = s; persist();
    generateCalendar(currentYear,currentMonth); renderPresetEditor(); alert('Imported successfully');
  }catch(err){ alert('Invalid JSON'); }
})
clearAllBtn.addEventListener('click',()=>{ if(confirm('Delete all saved data?')){ moodData={}; persist(); generateCalendar(currentYear,currentMonth); renderList(); renderInsights(); }});

// --- Init ---
function init(){
  generateCalendar(currentYear, currentMonth);
  buildLegend();
  renderPresetEditor();
}

function download(name, data){
  const blob = new Blob([data], {type: 'text/plain'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  URL.revokeObjectURL(a.href);
}

init();
