let WEEKS = [], DAYS = [], REST_DAYS = [], MILESTONES = [];
let META = {};
let MODULES = {};
let planId = 'default';
let STORE_KEY = 'august-plan-v1';

// 应用一份计划数据（来自默认 data.js，或 ?plan=xxx.json 覆盖）
function applyPlan(data) {
  WEEKS = data.weeks || [];
  DAYS = data.days || [];
  REST_DAYS = data.restDays || [];
  MILESTONES = data.milestones || [];
  META = data.meta || {};
  MODULES = data.modules || {};
}

// 加载计划：默认读 data.js；带 ?plan=xxx.json 时 fetch 外部 JSON 覆盖
async function loadPlan() {
  const params = new URLSearchParams(location.search);
  const src = params.get('plan') || params.get('data');
  if (src) {
    planId = src;
    STORE_KEY = 'august-plan-v1-' + src;
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      applyPlan(await res.json());
    } catch (e) {
      console.warn('[plan] 加载失败，回退默认数据：', e);
      applyPlan(window.PLAN_DATA || {});
    }
  } else {
    // 无参数：优先后台草稿，否则默认数据
    let draft = null;
    try { draft = JSON.parse(localStorage.getItem('plan-admin-draft')); } catch (e) {}
    applyPlan(draft || window.PLAN_DATA || {});
  }
  init();
}

// ═══════════════ RENDER: DESKTOP TABLE ═══════════════
function renderDesktop() {
  const el = document.getElementById('desktop-calendar');
  if (!el) return;

  // Group days into calendar rows (Mon-Sun, Aug 1 is Sat, 31 is Mon)
  // Row 1: Jul 27-31 + Aug 1-2 (filler)
  // Row 2-5: Aug 3-30
  // Row 6: Aug 31 + empties

  const weekNames = ['一','二','三','四','五','六','日'];
  let ths = weekNames.map(w => `<th>${w}</th>`).join('');

  // Build day lookup
  const dayMap = {};
  DAYS.forEach(d => { dayMap[d.date] = d; });

  // Determine what weekday each date is (2026-08-01 = Saturday = index 5)
  function getCol(date) { return (date + 4) % 7; } // Aug 1=Sat→5, so offset +4

  // Build rows manually for correct Aug 2026 layout
  // Aug 1 = Sat (col 5), Aug 3 = Mon (col 0), Aug 31 = Mon (col 0)
  const rows = [
    // Row 1: Jul 27(Sun)~31(Thu) + Aug 1(Fri) + 2(Sat)
    { dates: [27,28,29,30,31,1,2], otherMonth: [27,28,29,30,31] },
    // Row 2: Aug 3-9 (Mon-Sun)
    { dates: [3,4,5,6,7,8,9], otherMonth: [] },
    // Row 3: Aug 10-16
    { dates: [10,11,12,13,14,15,16], otherMonth: [] },
    // Row 4: Aug 17-23
    { dates: [17,18,19,20,21,22,23], otherMonth: [] },
    // Row 5: Aug 24-30
    { dates: [24,25,26,27,28,29,30], otherMonth: [28,29,30] },
    // Row 6: Aug 31 + empties
    { dates: [31,null,null,null,null,null,null], otherMonth: [31] },
  ];

  let tbody = '';
  const today = new Date().getDate();
  const thisMonth = new Date().getMonth() === 7; // 7 = August

  rows.forEach(row => {
    let cells = row.dates.map((date, i) => {
      if (date === null) return '<td class="weekday-none"></td>';
      if (row.otherMonth.includes(date)) return `<td class="other-month"><div class="date-num">${date}</div></td>`;

      const d = dayMap[date];
      if (!d) return `<td><div class="date-num">${date}</div></td>`;

      // 主题标签（含客户编辑覆盖）
      const tags = getDayTags(date);

      // Determine cell classes
      let cellClass = '';
      if (d.s === 'done') cellClass += ' done';
      if (d.s === 'missed') cellClass += ' missed';
      if (d.s === 'warn') cellClass += ' paused';
      if (d.s === 'milestone') cellClass += ' milestone-cell';
      if (d.type === 'half-rest') cellClass += ' half-rest-cell';
      if (d.type === 'full-rest') cellClass += ' full-rest-cell';
      if (thisMonth && date === today) cellClass += ' today';

      // Tags HTML
      let tagsHtml = tags.map(t => {
        let cls = 'tag';
        if (t.includes('半休')) cls += ' tag-half-rest';
        else if (t.includes('纯休')) cls += ' tag-full-rest';
        else if (t.includes('发布') || t.includes('离职')) cls += ' tag-milestone';
        else if (t.includes('NFC')) cls += ' tag-nfc';
        else if (t.includes('完成') || d.s === 'done') cls += ' tag-done';
        else if (t.includes('表达')) cls += ' tag-express';
        else cls += ' tag-main';
        return `<span class="${cls}">${t}</span>`;
      }).join(' ');

      // Week tag for first day of each week
      let weekTag = '';
      if (d.w !== undefined && DAYS.filter(x => x.w === d.w)[0] === d) {
        weekTag = `<span class="week-tag">${WEEKS[d.w]}</span>`;
      }

      // Event lines（遍历时段 slots，含客户编辑覆盖）
      let events = '';
      getDaySlots(date).forEach(s => {
        if (s.type === 'main') {
          events += `<div class="event-line">${s.text.includes('<b>') ? s.text : '<b>' + tags[0] + '</b>：' + s.text}</div>`;
        } else if (s.type === 'workout') {
          events += `<div class="event-line workout-line">🏋️ ${s.text}</div>`;
        } else if (s.type === 'express') {
          events += `<div class="event-line express-line">🎤 ${s.text}</div>`;
        } else if (s.type === 'read') {
          events += `<div class="event-line read-line">📖 ${s.text}</div>`;
        } else {
          events += `<div class="event-line">${s.text}</div>`;
        }
      });

      // Status
      let status = '';
      if (d.result) status += `<div class="status-line ${d.rClass}">${d.result}</div>`;

      return `<td class="${cellClass.trim()}" data-date="${date}" onclick="openDetail(${date})">
        <div class="date-num">${date} ${tagsHtml}</div>
        ${weekTag}
        ${events}
        <div class="card-progress" data-progress="${date}"></div>
        ${status}
      </td>`;
    }).join('');

    tbody += `<tr>${cells}</tr>`;
  });

  el.innerHTML = `
    <table class="cal-table">
      <thead><tr>${ths}</tr></thead>
      <tbody>${tbody}</tbody>
    </table>
  `;
}

// ═══════════════ RENDER: MOBILE CARD LIST ═══════════════
function renderMobile() {
  const el = document.getElementById('mobile-calendar');
  if (!el) return;

  // Group by week
  let html = '';
  for (let w = 0; w < WEEKS.length; w++) {
    const weekDays = DAYS.filter(d => d.w === w);
    if (!weekDays.length) continue;

    const doneCount = weekDays.filter(d => d.s === 'done').length;
    const totalCount = weekDays.length;
    let badgeHtml = '';
    if (doneCount === totalCount) badgeHtml = `<span class="badge" style="background:var(--green-bg);color:var(--green);">✅ 完成</span>`;

    html += `<div class="week-section">
      <div class="week-label">📌 ${WEEKS[w]} ${badgeHtml}</div>`;

    weekDays.forEach(d => {
      let cardClass = '';
      if (d.s === 'done') cardClass = 'done';
      else if (d.s === 'missed') cardClass = 'missed';
      else if (d.s === 'warn') cardClass = 'paused';
      else if (d.s === 'milestone') cardClass = 'milestone';
      if (d.type === 'rest' || d.type === 'full-rest') cardClass += ' rest';
      if (d.type === 'half-rest') cardClass += ' half-rest';

      // Tags（含客户编辑覆盖）
      const tags = getDayTags(d.date);
      let tagsHtml = tags.map(t => {
        let cls = 'day-tag';
        if (t.includes('半休')) cls += ' dt-half-rest';
        else if (t.includes('纯休')) cls += ' dt-full-rest';
        else if (t.includes('发布') || t.includes('离职')) cls += ' dt-milestone';
        else if (t.includes('NFC')) cls += ' dt-nfc';
        else if (t.includes('完成')) cls += ' dt-done';
        else if (t.includes('表达')) cls += ' dt-express';
        else cls += ' dt-main';
        return `<span class="${cls}">${t}</span>`;
      }).join('');

      // Lines（遍历时段 slots，含客户编辑覆盖）
      let lines = [];
      getDaySlots(d.date).forEach(s => {
        if (s.type === 'main') {
          lines.push(s.text.includes('<b>') ? s.text : `<b>${tags[0]}</b>：${s.text}`);
        } else if (s.type === 'workout') {
          lines.push(`<span style="color:var(--orange);font-weight:600;">🏋️ ${s.text}</span>`);
        } else if (s.type === 'express') {
          lines.push(`<span style="color:var(--purple);">🎤 ${s.text}</span>`);
        } else if (s.type === 'read') {
          lines.push(`<span style="color:var(--blue);">📖 ${s.text}</span>`);
        } else {
          lines.push(s.text);
        }
      });

      // Status
      let statusHtml = '';
      if (d.result) {
        let sc = 'ds-ok';
        if (d.rClass === 's-no') sc = 'ds-no';
        else if (d.rClass === 's-warn') sc = 'ds-warn';
        statusHtml = `<span class="day-status ${sc}">${d.result}</span>`;
      }

      html += `
      <div class="day-card ${cardClass.trim()}" data-date="${d.date}" onclick="openDetail(${d.date})">
        <div class="day-left"><div class="day-num">${d.date}</div><div class="day-weekday">${d.wd}</div></div>
        <div class="day-middle">
          <div class="day-tags">${tagsHtml}</div>
          <div class="day-lines">${lines.join('<span class="sep">|</span>')}</div>
          <div class="card-progress" data-progress="${d.date}"></div>
          ${statusHtml}
        </div>
      </div>`;
    });

    html += `</div>`;
  }

  el.innerHTML = html;
}

// ═══════════════ RENDER: REST DAY CARDS ═══════════════
function renderRestCards() {
  const el = document.getElementById('rest-detail-cards');
  if (!el) return;

  el.innerHTML = REST_DAYS.map(r => {
    let cls = r.type === 'half' ? 'half-rest' : 'rest';
    let tagCls = r.type === 'half' ? 'tag-half-rest' : 'tag-full-rest';
    let tagText = r.type === 'half' ? '半休' : '纯休';
    let outcomeHtml = r.outcome ? `<div class="line" style="color:${r.oc || 'var(--red)'};margin-top:4px;">${r.outcome}</div>` : '';
    return `
    <div class="detail-card ${cls}">
      <div class="date-header"><span class="tag ${tagCls}">${tagText}</span> ${r.date}日 ${r.wd}</div>
      ${r.results.map(l => `<div class="line">${l}</div>`).join('')}
      ${outcomeHtml}
    </div>`;
  }).join('');
}

// ═══════════════ RENDER: MILESTONE CARDS ═══════════════
function renderMilestoneCards() {
  const el = document.getElementById('milestone-cards');
  if (!el) return;

  el.innerHTML = MILESTONES.map(m => `
    <div class="detail-card ${m.cls}">
      <div class="date-header">${m.emoji} ${m.dt} ${m.tags}</div>
      ${m.lines.map(l => `<div class="line">${l}</div>`).join('')}
    </div>
  `).join('');
}

// ═══════════════ TIMESTAMP ═══════════════
function setTimestamp() {
  const el = document.getElementById('timestamp');
  if (!el) return;
  const now = new Date();
  const s = now.toLocaleString('zh-CN', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' });
  el.textContent = '📅 最后更新：' + s;
}

// ═══════════════ DAY DETAIL: 数据层 ═══════════════
let currentDate = null;

function loadStore() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
  catch(e) { return {}; }
}
function saveStore(s) { localStorage.setItem(STORE_KEY, JSON.stringify(s)); }

// slot 类型 → 中文标签
const SLOT_LABEL = { main:'主线', express:'表达', workout:'健身', read:'阅读' };

// 某天的有效时段：客户编辑过就用 localStorage 覆盖版，否则用默认数据；统一补 id
function getDaySlots(date) {
  const d = DAYS.find(x => x.date === date) || {};
  const day = loadStore()[date] || {};
  const base = ('slots' in day) ? day.slots : (d.slots || []);
  return base.map((s, i) => ({ ...s, id: s.id || (s.type + '-' + i) }));
}

// 把某天的时段持久化（客户编辑后整体覆盖默认）
function persistSlots(date, slots) {
  const store = loadStore();
  if (!store[date]) store[date] = { done: {}, notes: [] };
  store[date].slots = slots.map(s => ({ id: s.id, time: s.time || '', text: s.text || '', type: s.type || 'main' }));
  saveStore(store);
}

// 某天的主题标签（客户编辑过就覆盖默认）
function getDayTags(date) {
  const d = DAYS.find(x => x.date === date) || {};
  const day = loadStore()[date] || {};
  return ('tags' in day) ? day.tags : (d.tags || []);
}

// 把某天的主题标签持久化
function persistTags(date, tags) {
  const store = loadStore();
  if (!store[date]) store[date] = { done: {}, notes: [] };
  store[date].tags = tags;
  saveStore(store);
}

// 合并：默认时段 + 客户编辑 + 勾选状态 + 用户新增记录
function getDayData(date) {
  const d = DAYS.find(x => x.date === date) || {};
  const day = loadStore()[date] || { done: {}, notes: [] };
  const slots = getDaySlots(date).map(s => ({ ...s, done: !!day.done[s.id] }));
  const notes = day.notes || [];
  const tags = getDayTags(date);
  return { d, slots, notes, tags };
}

function calcProgress(date) {
  const { slots, notes } = getDayData(date);
  const all = [...slots, ...notes];
  return { done: all.filter(t => t.done).length, total: all.length };
}

function updateCardProgress(date) {
  const { done, total } = calcProgress(date);
  const txt = total > 0 ? `✓ ${done}/${total}` : '';
  document.querySelectorAll(`[data-progress="${date}"]`).forEach(el => {
    el.textContent = txt;
    el.style.color = total > 0 && done === total ? 'var(--green)' : (done > 0 ? 'var(--orange)' : 'var(--text-secondary)');
  });
}

// 渲染标题 + 统计数字（跟着数据走）
function renderMeta() {
  document.getElementById('plan-title').textContent = '📅 ' + (META.title || '我的计划');
  document.getElementById('plan-subtitle').textContent = META.subtitle || '';
  const total = DAYS.length;
  const rest = DAYS.filter(d => d.type === 'full-rest' || d.type === 'half-rest').length;
  const done = DAYS.filter(d => d.s === 'done').length;
  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-rest').textContent = rest;
  document.getElementById('stat-done').textContent = done;
  document.getElementById('stat-todo').textContent = total - done;
}

// ═══════════════ 可选模块渲染（有数据才显示）═══════════════
function renderModules() {
  renderBanner();
  renderDiet();
  renderDailyTemplate();
  renderChecklist();
  renderFooter();
}

function renderBanner() {
  const el = document.getElementById('banner-module');
  if (!el) return;
  const m = MODULES.banner;
  if (!m) { el.innerHTML = ''; return; }
  el.innerHTML = `
    <div class="pause-banner">
      <span class="icon">⏸️</span>
      <span class="msg">${m.msg || ''}</span>
      ${m.sub ? `<span class="sub">${m.sub}</span>` : ''}
    </div>`;
}

function renderDiet() {
  const el = document.getElementById('diet-module');
  if (!el) return;
  const m = MODULES.diet;
  if (!m) { el.innerHTML = ''; return; }
  const items = (m.items || []).map(it =>
    `<span style="background:var(--card);border:1px solid var(--border);border-radius:6px;padding:6px 12px;font-size:13px;">${it.emoji ? it.emoji + ' ' : ''}<b>${it.label}</b>${it.text ? ' ' + it.text : ''}</span>`
  ).join('');
  el.innerHTML = `
    <div style="background:linear-gradient(135deg, rgba(251,146,60,0.15), rgba(74,222,128,0.1)); border:1px solid var(--orange); border-radius:var(--radius); padding:14px 18px; margin-bottom:18px;">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
        <span style="font-size:20px;">🍚</span>
        <b style="color:var(--orange);">${m.title || '每日饮食清单'}</b>
        ${m.note ? `<span style="color:var(--text-secondary);font-size:13px;">— ${m.note}</span>` : ''}
      </div>
      <div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap;">${items}</div>
      ${m.footnote ? `<div style="margin-top:8px;font-size:11px;color:var(--text-secondary);">${m.footnote}</div>` : ''}
    </div>`;
}

function renderDailyTemplate() {
  const el = document.getElementById('template-module');
  if (!el) return;
  const m = MODULES.dailyTemplate;
  if (!m) { el.innerHTML = ''; return; }
  const cls = { main:'strip-main', express:'strip-express', read:'strip-read', workout:'strip-main' };
  const blocks = (m.slots || []).map(s =>
    `<div class="strip-block ${cls[s.type] || 'strip-main'}"><div class="time">${s.time || ''}</div>${s.label}${s.note ? '<br>' + s.note : ''}</div>`
  ).join('');
  el.innerHTML = `<div class="daily-strip"><h3>⏰ ${m.title || '每日时间模板'}</h3><div class="strip-blocks">${blocks}</div></div>`;
}

function renderChecklist() {
  const el = document.getElementById('checklist-module');
  if (!el) return;
  const m = MODULES.checklist;
  if (!m) { el.innerHTML = ''; return; }
  const items = (m.items || []).map(it =>
    `<li><span class="check ${it.done ? 'done' : 'pending'}">${it.done ? '☑' : '☐'}</span> ${it.text}</li>`
  ).join('');
  el.innerHTML = `<div class="checklist"><h3>✅ ${m.title || ''}</h3><ul>${items}</ul></div>`;
}

function renderFooter() {
  const el = document.getElementById('footer-module');
  if (!el) return;
  const lines = (MODULES.footer && MODULES.footer.lines) ? MODULES.footer.lines : [];
  const html = lines.map((l, i) => `<p${i > 0 ? ' style="margin-top:4px;"' : ''}>${l}</p>`).join('');
  el.innerHTML = html + '<p class="timestamp" id="timestamp"></p>';
}

// 重新渲染整个日历（编辑时段后让主页面立即反映变化）
function rerenderCalendar() {
  renderMeta();
  renderDesktop();
  renderMobile();
  DAYS.forEach(d => updateCardProgress(d.date));
}

// ═══════════════ DAY DETAIL: 渲染 ═══════════════
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function renderSlots(slots) {
  const el = document.getElementById('modal-tasks');
  if (!slots.length) { el.innerHTML = '<div class="empty-hint">这天没有安排时段，点下方「+ 添加时段」</div>'; return; }
  el.innerHTML = slots.map(s => {
    if (editingSlotId === s.id) return renderSlotEditForm(s);
    return `
    <div class="slot-item ${s.done ? 'done' : ''}">
      <div class="slot-main" onclick="toggleSlot(${currentDate}, '${s.id}')">
        <span class="slot-check">${s.done ? '✓' : ''}</span>
        <span class="slot-type type-${s.type}">${SLOT_LABEL[s.type] || s.type}</span>
        ${s.time ? `<span class="slot-time">${escapeHtml(s.time)}</span>` : ''}
        <span class="slot-text">${escapeHtml(s.text)}</span>
      </div>
      <div class="slot-actions">
        <button class="slot-btn" onclick="startEditSlot('${s.id}')" title="编辑">✏️</button>
        <button class="slot-btn" onclick="deleteSlot(${currentDate}, '${s.id}')" title="删除">🗑</button>
      </div>
    </div>`;
  }).join('');
}

function renderSlotEditForm(s) {
  const opts = Object.keys(SLOT_LABEL).map(t => `<option value="${t}" ${t === s.type ? 'selected' : ''}>${SLOT_LABEL[t]}</option>`).join('');
  return `
  <div class="slot-edit">
    <div class="slot-edit-row">
      <input id="edit-time" class="edit-time" placeholder="时段，如 21:00-22:00" value="${escapeHtml(s.time || '')}">
      <select id="edit-type">${opts}</select>
    </div>
    <input id="edit-text" class="edit-text" placeholder="做什么" value="${escapeHtml(s.text || '')}">
    <div class="slot-edit-actions">
      <button class="btn-save" onclick="saveSlotEdit(${currentDate}, '${s.id}')">保存</button>
      <button class="btn-cancel" onclick="cancelSlotEdit()">取消</button>
    </div>
  </div>`;
}

// ── 主题标签编辑 ──
function updateModalTitle(date) {
  const d = DAYS.find(x => x.date === date) || {};
  const tags = getDayTags(date);
  const tagHtml = tags.map(t => `<span class="tag tag-main">${t}</span>`).join(' ');
  document.getElementById('modal-title').innerHTML = `${d.wd || ''} ${date}日 ${tagHtml}`;
}

function renderTags(tags) {
  const el = document.getElementById('modal-tags');
  if (!tags.length) { el.innerHTML = '<div class="empty-hint">还没有标签，加个主题（如 数学/英语）</div>'; return; }
  el.innerHTML = tags.map((t, i) => `
    <span class="tag-chip">${escapeHtml(t)}<span class="tag-del" onclick="removeTag(${currentDate}, ${i})" title="删除">✕</span></span>
  `).join('');
}

function addTag() {
  const input = document.getElementById('tag-input');
  const t = input.value.trim();
  if (!t || currentDate === null) return;
  const tags = getDayTags(currentDate).filter(x => x !== t);
  tags.push(t);
  persistTags(currentDate, tags);
  input.value = '';
  renderTags(tags);
  updateModalTitle(currentDate);
  rerenderCalendar();
}

function removeTag(date, index) {
  const tags = getDayTags(date);
  tags.splice(index, 1);
  persistTags(date, tags);
  renderTags(tags);
  updateModalTitle(date);
  rerenderCalendar();
}

function renderDetailNotes(notes) {
  const el = document.getElementById('modal-notes');
  if (!notes.length) { el.innerHTML = '<div class="empty-hint">还没有记录，下面加一条</div>'; return; }
  el.innerHTML = notes.map(n => `
    <div class="task-item ${n.done ? 'done' : ''}">
      <div class="checkbox" onclick="toggleNote(${currentDate}, '${n.id}')">${n.done ? '✓' : ''}</div>
      <div class="task-text" onclick="toggleNote(${currentDate}, '${n.id}')">${n.text}</div>
      <div class="task-del" onclick="deleteNote(${currentDate}, '${n.id}')" title="删除">🗑</div>
    </div>`).join('');
}

function updateModalProgress() {
  const { done, total } = calcProgress(currentDate);
  document.getElementById('modal-progress').style.width = (total > 0 ? Math.round(done / total * 100) : 0) + '%';
}

// ═══════════════ DAY DETAIL: 交互 ═══════════════
function openDetail(date) {
  currentDate = date;
  editingSlotId = null;
  const { slots, notes, tags } = getDayData(date);
  updateModalTitle(date);
  renderSlots(slots);
  renderTags(tags);
  renderDetailNotes(notes);
  updateModalProgress();
  document.getElementById('detail-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDetail() {
  document.getElementById('detail-modal').classList.remove('open');
  document.body.style.overflow = '';
  currentDate = null;
}

let editingSlotId = null;

function toggleSlot(date, id) {
  const store = loadStore();
  if (!store[date]) store[date] = { done: {}, notes: [] };
  store[date].done[id] = !store[date].done[id];
  saveStore(store);
  renderSlots(getDayData(date).slots);
  updateModalProgress();
  updateCardProgress(date);
}

function startEditSlot(id) {
  editingSlotId = id;
  renderSlots(getDayData(currentDate).slots);
}

function cancelSlotEdit() {
  editingSlotId = null;
  renderSlots(getDayData(currentDate).slots);
}

function saveSlotEdit(date, id) {
  const time = document.getElementById('edit-time').value.trim();
  const type = document.getElementById('edit-type').value;
  const text = document.getElementById('edit-text').value.trim();
  const slots = getDaySlots(date).map(s => s.id === id ? { ...s, time, type, text } : s);
  persistSlots(date, slots);
  editingSlotId = null;
  renderSlots(getDayData(date).slots);
  updateModalProgress();
  rerenderCalendar();
}

function deleteSlot(date, id) {
  persistSlots(date, getDaySlots(date).filter(s => s.id !== id));
  renderSlots(getDayData(date).slots);
  updateModalProgress();
  rerenderCalendar();
}

function addSlot() {
  const id = 's' + Date.now();
  const slots = getDaySlots(currentDate);
  slots.push({ id, time: '', text: '', type: 'main' });
  persistSlots(currentDate, slots);
  editingSlotId = id;
  renderSlots(getDayData(currentDate).slots);
  updateModalProgress();
  rerenderCalendar();
}

function addNote() {
  const input = document.getElementById('note-input');
  const text = input.value.trim();
  if (!text || currentDate === null) return;
  const store = loadStore();
  if (!store[currentDate]) store[currentDate] = { done: {}, notes: [] };
  store[currentDate].notes.push({ id: 'n' + Date.now(), text, done: false });
  saveStore(store);
  input.value = '';
  renderDetailNotes(store[currentDate].notes);
  updateModalProgress();
  updateCardProgress(currentDate);
}

function toggleNote(date, noteId) {
  const store = loadStore();
  const day = store[date];
  if (!day) return;
  const n = day.notes.find(x => x.id === noteId);
  if (n) n.done = !n.done;
  saveStore(store);
  renderDetailNotes(day.notes);
  updateModalProgress();
  updateCardProgress(date);
}

function deleteNote(date, noteId) {
  const store = loadStore();
  const day = store[date];
  if (!day) return;
  day.notes = day.notes.filter(x => x.id !== noteId);
  saveStore(store);
  renderDetailNotes(day.notes);
  updateModalProgress();
  updateCardProgress(date);
}

// ═══════════════ 导出 / 导入 ═══════════════
function exportData() {
  const blob = new Blob([JSON.stringify(loadStore(), null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '八月计划记录-' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data || typeof data !== 'object' || Array.isArray(data)) throw 0;
      saveStore(data);
      alert('✅ 导入成功');
      if (currentDate !== null) openDetail(currentDate);
      DAYS.forEach(d => updateCardProgress(d.date));
    } catch(e) {
      alert('❌ 文件格式不对，请选择导出的 JSON 文件');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

// 点击遮罩关闭
document.getElementById('detail-modal').addEventListener('click', function(e) {
  if (e.target === this) closeDetail();
});

// ═══════════════ AI 定制计划 ═══════════════
const AI_KEY_STORE = 'plan-ai-key';

function openAi() {
  const saved = localStorage.getItem(AI_KEY_STORE);
  if (saved) document.getElementById('ai-key').value = saved;
  document.getElementById('ai-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeAi() {
  document.getElementById('ai-modal').classList.remove('open');
  document.body.style.overflow = '';
}

function setAiStatus(msg) {
  document.getElementById('ai-status').textContent = msg;
}

function addTimeSlot() {
  const list = document.getElementById('time-slot-list');
  const input = document.createElement('input');
  input.className = 'note-input time-slot';
  input.placeholder = '如 20:00-23:00';
  list.appendChild(input);
}

function getSelectedWeekdays() {
  return [...document.querySelectorAll('#weekday-picker .wd-btn.on')].map(b => b.textContent);
}

function getTimeSlots() {
  return [...document.querySelectorAll('.time-slot')].map(i => i.value.trim()).filter(Boolean);
}

async function generatePlan() {
  const keyInput = document.getElementById('ai-key');
  const goal = document.getElementById('ai-goal').value.trim();
  const constraint = document.getElementById('ai-constraint').value.trim();
  const key = (keyInput.value.trim() || localStorage.getItem(AI_KEY_STORE) || '').trim();

  if (!key) { setAiStatus('❌ 请先填 API Key'); return; }
  if (!goal) { setAiStatus('❌ 请填目标'); return; }

  localStorage.setItem(AI_KEY_STORE, key);
  setAiStatus('⏳ 生成中，约 10-30 秒…');

  try {
    const weekdays = getSelectedWeekdays();
    const times = getTimeSlots();
    const plan = await callDeepSeek(key, goal, constraint, weekdays, times);
    applyPlan(normalizePlan(plan));
    renderModules();
    renderRestCards();
    renderMilestoneCards();
    rerenderCalendar();
    setAiStatus('✅ 生成成功！关掉面板看日历，或用下方下载 JSON');
  } catch (e) {
    setAiStatus('❌ 生成失败：' + (e.message || e));
  }
}

async function callDeepSeek(key, goal, constraint, weekdays, times) {
  const sys = [
    '你是计划定制专家。根据用户目标、约束和偏好，生成一个结构化的每日计划。',
    '只输出 JSON，不要输出任何 JSON 以外的文字、注释或代码块标记。',
    'JSON 结构如下：',
    '{',
    '  "meta": { "title": "计划名称", "subtitle": "一句话说明" },',
    '  "weeks": ["W1 主题", "W2 主题", "W3 主题", "收尾周"],',
    '  "days": [',
    '    { "date": 3, "wd": "周一", "w": 0, "s": "", "tags": ["主题"],',
    '      "slots": [ { "time": "19:00-20:30", "text": "具体任务", "type": "main" } ],',
    '      "result": "", "rClass": "" }',
    '  ],',
    '  "modules": {',
    '    "diet": { "title": "每日饮食清单", "note": "一句说明", "items": [ { "emoji": "🥚", "label": "早餐", "text": "内容" } ], "footnote": "底部说明" },',
    '    "dailyTemplate": { "title": "每日时间模板", "slots": [ { "time": "20:00-21:00", "label": "主线", "note": "备注", "type": "main" } ] },',
    '    "checklist": { "title": "完成后你该有的东西", "items": [ { "text": "一条", "done": false } ] }',
    '  },',
    '  "restDays": [], "milestones": []',
    '}',
    '规则：',
    '- date 是 8 月内的日期数字（3~27），wd 是对应星期，w 是周索引从 0 开始。',
    '- slots 里 type 只能取：main(主线)/express(表达)/workout(健身)/read(阅读)。',
    '- time 用「起-止」格式（如 19:00-20:30），健身可留空。',
    '- s 留空字符串（不要填 done）。',
    '- 每天 1~4 个 slot，劳逸结合。',
    '- 只在这些日子安排任务（可利用日），其余日子不排或作休息日。',
    '- 所有 slots 的 time 必须落在用户给定的可用时间段内。',
    '- modules 按需生成：与目标无关的模块直接省略（如考研计划不要 diet 饮食清单）。'
  ].join('\n');

  const user = `目标：${goal}\n约束/偏好：${constraint || '无'}` +
    (weekdays && weekdays.length ? `\n可利用日：${weekdays.join('、')}` : '') +
    (times && times.length ? `\n可用时间段：${times.join('、')}` : '');

  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: user }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error('HTTP ' + res.status + (errText ? ' ' + errText.slice(0, 200) : ''));
  }
  const data = await res.json();
  const content = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
  return JSON.parse(content);
}

// 校验并补全 AI 返回的 plan 结构，避免渲染崩溃
function normalizePlan(p) {
  p = p || {};
  const weeks = Array.isArray(p.weeks) && p.weeks.length ? p.weeks : ['W1', 'W2', 'W3', 'W4'];
  const days = (Array.isArray(p.days) ? p.days : []).map(d => ({
    date: Number(d.date) || 0,
    wd: d.wd || '',
    w: Number(d.w) || 0,
    s: d.s || '',
    type: d.type || '',
    tags: Array.isArray(d.tags) ? d.tags : [],
    slots: Array.isArray(d.slots) ? d.slots.map(s => ({
      time: s.time || '', text: s.text || '', type: s.type || 'main'
    })) : [],
    result: d.result || '',
    rClass: d.rClass || '',
  })).filter(d => d.date > 0);
  return {
    meta: p.meta || {},
    weeks,
    days,
    restDays: Array.isArray(p.restDays) ? p.restDays : [],
    milestones: Array.isArray(p.milestones) ? p.milestones : [],
    modules: p.modules || {},
  };
}

// 下载当前计划（含客户编辑的 tags/slots）为标准 plans JSON
function downloadPlan() {
  const data = {
    weeks: WEEKS,
    days: DAYS.map(d => ({
      date: d.date, wd: d.wd, w: d.w, s: d.s, type: d.type,
      tags: getDayTags(d.date),
      slots: getDaySlots(d.date).map(s => ({ time: s.time, text: s.text, type: s.type })),
      result: d.result, rClass: d.rClass,
    })),
    restDays: REST_DAYS,
    milestones: MILESTONES,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'plan-' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

// ═══════════════ INIT ═══════════════
function init() {
  renderMeta();
  renderModules();
  renderDesktop();
  renderMobile();
  renderRestCards();
  renderMilestoneCards();
  setTimestamp();
  DAYS.forEach(d => updateCardProgress(d.date));
}

// 数据就绪后渲染（默认 data.js，或 ?plan=xxx.json 覆盖）
loadPlan();
