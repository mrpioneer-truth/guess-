"use strict";

const NOTES_SAVE_DELAY_MS = 800;
const DRAFT_SAVE_DELAY_MS = 600;
const SELECTION_SETTLE_MS = 350;

const $ = (sel) => document.querySelector(sel);
let state = null;
let currentDocId = null;
let documentRequest = 0;
let currentChapterId = null;
let cooldownTimer = null;
let sealTimer = null;

// ---------- sound (decorative only; failures never touch the game) ----------
const SOUND_PREF_KEY = "cheongunjae.sound";
const AMBIENCE_VOLUME = 0.22;
const IMPACT_VOLUME = 0.5;
const AMBIENCE_FADE_IN_S = 2.5;
const AMBIENCE_FADE_OUT_S = 0.8;
const SEAL_DURATION_MS = 2400;

const sound = (() => {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  let ctx = null;
  let buffers = {};
  let ambience = null; // { source, gain }
  let wantAmbience = false;
  let enabled = readPref();

  function readPref() {
    try { return localStorage.getItem(SOUND_PREF_KEY) !== "off"; } catch { return true; }
  }
  function writePref(on) {
    try { localStorage.setItem(SOUND_PREF_KEY, on ? "on" : "off"); } catch { /* storage blocked: keep in-memory choice */ }
  }
  async function load(name) {
    if (buffers[name]) return buffers[name];
    const res = await fetch(`assets/sfx/${name}.mp3`);
    if (!res.ok) throw new Error(`sound ${name}: HTTP ${res.status}`);
    const decoded = await ctx.decodeAudioData(await res.arrayBuffer());
    buffers = { ...buffers, [name]: decoded };
    return decoded;
  }
  async function ready() {
    if (!AudioCtx || !enabled) return false;
    if (!ctx) ctx = new AudioCtx();
    if (ctx.state === "suspended") await ctx.resume().catch(() => {});
    return ctx.state === "running";
  }
  function silence() {
    if (!ambience) return;
    const { source, gain } = ambience;
    ambience = null;
    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + AMBIENCE_FADE_OUT_S);
    source.stop(now + AMBIENCE_FADE_OUT_S + 0.05);
  }
  async function playAmbience() {
    if (!wantAmbience || ambience || !(await ready())) return;
    try {
      const buffer = await load("ambience");
      if (!wantAmbience || ambience) return;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(AMBIENCE_VOLUME, ctx.currentTime + AMBIENCE_FADE_IN_S);
      gain.connect(ctx.destination);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(gain);
      source.start();
      ambience = { source, gain };
    } catch (err) {
      console.warn("배경음을 재생할 수 없습니다.", err);
    }
  }
  return {
    isEnabled: () => enabled,
    /** Called on every user gesture: browsers only allow audio after one. */
    unlock() { if (enabled) playAmbience(); },
    startAmbience() { wantAmbience = true; playAmbience(); },
    stopAmbience() { wantAmbience = false; silence(); },
    async impact() {
      if (!(await ready())) return;
      try {
        const buffer = await load("impact");
        const gain = ctx.createGain();
        gain.gain.value = IMPACT_VOLUME;
        gain.connect(ctx.destination);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(gain);
        source.start();
      } catch (err) {
        console.warn("효과음을 재생할 수 없습니다.", err);
      }
    },
    setEnabled(on) {
      enabled = on;
      writePref(on);
      if (on) playAmbience();
      else silence();
    },
  };
})();

function updateSoundButton() {
  const btn = $("#sound-toggle");
  btn.textContent = sound.isEnabled() ? "sound on" : "sound off";
  btn.setAttribute("aria-pressed", String(sound.isEnabled()));
}

function showSeal(title) {
  const overlay = $("#seal-overlay");
  $("#seal-title").textContent = title;
  overlay.hidden = false;
  overlay.style.animation = "none";
  void overlay.offsetWidth; // restart the CSS animation
  overlay.style.animation = "";
  clearTimeout(sealTimer);
  sealTimer = setTimeout(() => { overlay.hidden = true; }, SEAL_DURATION_MS);
}

// ---------- language ----------
const LANG_KEY = "cheongunjae.lang";
const I18N = {
  ko: {
    title: "청운재의 겨울",
    loginEyebrow: "봉화경찰서 형사과 · 사건번호 2023-1224",
    loginLede: "눈에 갇힌 고택, 잠긴 서고, 서른 해 전의 불.<br>자료만으로 하나의 결론에 도달하라.",
    nameLabel: "수사관 이름", namePlaceholder: "이름을 입력하세요", ipLabel: "접속 IP", start: "수사 시작",
    loginFine: "진행 상황은 <b>이름 + 접속 IP</b> 조합으로 서버에 저장됩니다. 같은 기기·같은 네트워크에서 같은 이름으로 들어오면 이어서 할 수 있습니다.",
    tabFiles: "자료", tabViewer: "문서", tabSide: "수첩·질문", logout: "나가기",
    emptyHint: "왼쪽에서 자료를 고르세요.<br>먼저 <b>수사 원칙</b>을 읽기를 권합니다.",
    tabNotes: "수첩", tabQuestions: "질문",
    notesPlaceholder: "추리를 적으세요. 자동 저장됩니다.\n자료에서 문장을 드래그하면 인용할 수 있습니다.",
    saved: "저장됨", saving: "저장 중…", saveFailed: "저장 실패: ", quote: "수첩에 인용", loading: "불러오는 중…",
    unknownIp: "알 수 없음", solved: "해결", epilogueTitle: "종결", epilogueBadge: "사건 해결", choose: "— 선택 —",
    submitStage: "이 단계 결론 제출", submitFinal: "사건 종결 보고", solvedNote: "이 단계는 해결되었습니다.",
    fillAll: "모든 칸을 채워야 제출할 수 있습니다.",
    okStage: "결론이 확인되었습니다. 새 자료가 도착했습니다.",
    okFinal: "사건이 종결되었습니다. 자료 목록의 「종결」을 확인하세요.",
    near: "거의 맞았습니다. 틀린 칸이 두 개 이하입니다. 다시 검토하세요.",
    bad: "결론에 모순이 있습니다. 자료를 다시 검토하세요.",
    sealClosed: "사건 종결", sealConfirmed: "결론 확인", sec: "초",
    networkError: "서버에 연결할 수 없습니다.", loginNeeded: "로그인이 필요합니다.", requestFailed: "요청 실패",
    langButton: "EN", langLabel: "Switch to English",
    ipLabelStatic: "저장 위치", thisDevice: "이 기기의 브라우저",
    loginFineStatic: "진행 상황은 <b>이 기기의 브라우저</b>에 이름별로 저장됩니다. 같은 기기·같은 브라우저에서 같은 이름으로 들어오면 이어서 할 수 있습니다.",
  },
  en: {
    title: "Winter at Cheongunjae",
    loginEyebrow: "Bonghwa Police Station, Criminal Investigation · Case No. 2023-1224",
    loginLede: "A snowbound old house, a locked library, a fire thirty years ago.<br>Reach a single conclusion from the files alone.",
    nameLabel: "Investigator name", namePlaceholder: "Enter your name", ipLabel: "Your IP", start: "Begin",
    loginFine: "Progress is saved on the server by <b>name + IP address</b>. Come back with the same name from the same device and network to continue.",
    tabFiles: "Files", tabViewer: "Document", tabSide: "Notes · Questions", logout: "Log out",
    emptyHint: "Pick a file on the left.<br>Start with <b>Rules of Investigation</b>.",
    tabNotes: "Notebook", tabQuestions: "Questions",
    notesPlaceholder: "Write your reasoning. It saves automatically.\nDrag across text in a file to quote it.",
    saved: "Saved", saving: "Saving…", saveFailed: "Save failed: ", quote: "Quote to notebook", loading: "Loading…",
    unknownIp: "unknown", solved: "Solved", epilogueTitle: "Closed", epilogueBadge: "Case solved", choose: "— choose —",
    submitStage: "Submit conclusion", submitFinal: "File the closing report", solvedNote: "This stage is solved.",
    fillAll: "Fill in every blank before submitting.",
    okStage: "Conclusion confirmed. New files have arrived.",
    okFinal: "The case is closed. See “Closed” in the file list.",
    near: "Almost. Two or fewer blanks are wrong. Review again.",
    bad: "Your conclusion contains a contradiction. Review the files again.",
    sealClosed: "Case closed", sealConfirmed: "conclusion confirmed", sec: "s",
    networkError: "Cannot reach the server.", loginNeeded: "Please log in.", requestFailed: "Request failed",
    langButton: "한국어", langLabel: "한국어로 보기",
    ipLabelStatic: "Saved in", thisDevice: "this device's browser",
    loginFineStatic: "Progress is saved <b>in this device's browser</b>, per name. Use the same name on the same device and browser to continue.",
  },
};
// The server speaks Korean; these are its messages a player can see.
const SERVER_MESSAGES_EN = {
  "로그인이 필요합니다.": "Please log in.",
  "이름은 1~20자의 한글·영문·숫자로 입력하세요.": "Use 1–20 Korean or English letters or digits for your name.",
  "잠시 후 다시 시도하세요.": "Please try again in a moment.",
  "아직 볼 수 없는 자료입니다.": "This file is not available yet.",
  "아직 열리지 않은 단계입니다.": "This stage is not open yet.",
  "열리지 않은 단계입니다.": "This stage is not open yet.",
  "서버 오류가 발생했습니다.": "Something went wrong on the server.",
  "답안 형식이 올바르지 않습니다.": "The answer format is invalid.",
  "요청이 너무 큽니다.": "The request is too large.",
  "없는 주소입니다.": "Not found.",
  "수첩이 너무 깁니다. (20만 자 제한)": "The notebook is too long (200,000 characters max).",
};

// Present only in the serverless (GitHub Pages) build, which ships engine.js before this file.
const LOCAL_ENGINE = window.cheongunjaeLocal || null;
let lang = readLang();

function readLang() {
  try { return localStorage.getItem(LANG_KEY) === "en" ? "en" : "ko"; } catch { return "ko"; }
}
function t(key) {
  const staticKey = `${key}Static`;
  if (LOCAL_ENGINE && I18N[lang][staticKey]) return I18N[lang][staticKey];
  return I18N[lang][key] ?? I18N.ko[key] ?? key;
}
/** Picks `field_en` in English when the data has it, else the Korean field. */
function local(obj, field) {
  return lang === "en" && obj[`${field}_en`] ? obj[`${field}_en`] : obj[field];
}
function localizeError(message) {
  return lang === "en" && message ? (SERVER_MESSAGES_EN[message] || message) : message;
}
function applyStaticText() {
  document.documentElement.lang = lang;
  document.title = t("title");
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  // Only strings from the I18N table above are inserted as HTML.
  document.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  document.querySelectorAll("[data-lang-toggle]").forEach((b) => {
    b.textContent = t("langButton");
    b.setAttribute("aria-label", t("langLabel"));
  });
  if (LOCAL_ENGINE) $("#ip").textContent = t("thisDevice");
  applyReadingLabels();
}
function setLang(next) {
  lang = next;
  try { localStorage.setItem(LANG_KEY, next); } catch { /* storage blocked: keep in-memory choice */ }
  applyStaticText();
  if (!state) return;
  renderFiles();
  renderQuestions();
  if (currentDocId) openDoc(currentDocId, { keepPane: true });
  else renderOverview();
  applyReadingLabels();
}
document.querySelectorAll("[data-lang-toggle]").forEach((b) => b.addEventListener("click", () => setLang(lang === "ko" ? "en" : "ko")));

// ---------- network ----------
function handleResponse(status, data) {
  if (status === 401) { showLogin(); throw new Error(localizeError(data.error) || t("loginNeeded")); }
  if (status >= 400) throw new Error(localizeError(data.error) || `${t("requestFailed")} (${status})`);
  return data;
}

async function api(path, body) {
  if (LOCAL_ENGINE) {
    const res = await LOCAL_ENGINE.request(path, body);
    return handleResponse(res.status, res.data);
  }
  const opts = body === undefined
    ? { credentials: "same-origin" }
    : { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
  let res;
  try {
    res = await fetch(path, opts);
  } catch (err) {
    throw new Error(t("networkError"));
  }
  const data = await res.json().catch(() => ({}));
  return handleResponse(res.status, data);
}

function debounce(fn, ms) {
  let t = null;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

// ---------- markdown-lite ----------
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function inline(s) {
  return escapeHtml(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
}
function tableHtml(rows) {
  const cells = (line) => line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
  const body = rows.filter((r) => !/^\|?\s*:?-{2,}/.test(r.trim()));
  const [head, ...rest] = body;
  const th = cells(head).map((c) => `<th>${inline(c)}</th>`).join("");
  const trs = rest.map((r) => `<tr>${cells(r).map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("");
  return `<div class="table-wrap"><table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table></div>`;
}
function renderMarkdown(text) {
  const lines = text.replace(/\r/g, "").split("\n");
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("```")) {
      const buf = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith("```")) { buf.push(lines[i]); i += 1; }
      out.push(`<pre>${escapeHtml(buf.join("\n"))}</pre>`);
      i += 1;
      continue;
    }
    if (line.trim().startsWith("|")) {
      const buf = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) { buf.push(lines[i]); i += 1; }
      out.push(tableHtml(buf));
      continue;
    }
    if (line.startsWith("# ")) { out.push(`<h1>${inline(line.slice(2))}</h1>`); i += 1; continue; }
    if (line.startsWith("## ")) { out.push(`<h2>${inline(line.slice(3))}</h2>`); i += 1; continue; }
    if (/^-{3,}\s*$/.test(line)) { out.push("<hr>"); i += 1; continue; }
    if (line.startsWith(">")) {
      const buf = [];
      while (i < lines.length && lines[i].startsWith(">")) { buf.push(inline(lines[i].replace(/^>\s?/, ""))); i += 1; }
      out.push(`<blockquote>${buf.join("<br>")}</blockquote>`);
      continue;
    }
    const listMatch = /^(\s*)(-|\d+\.)\s+/;
    if (listMatch.test(line)) {
      const ordered = /^\d+\./.test(line.trim());
      const items = [];
      while (i < lines.length && listMatch.test(lines[i])) {
        const m = lines[i].match(listMatch);
        const nested = m[1].length > 0;
        items.push(`<li${nested ? ' style="list-style:circle;margin-left:18px"' : ""}>${inline(lines[i].replace(listMatch, ""))}</li>`);
        i += 1;
      }
      out.push(ordered ? `<ol>${items.join("")}</ol>` : `<ul>${items.join("")}</ul>`);
      continue;
    }
    if (!line.trim()) { i += 1; continue; }
    const buf = [];
    while (i < lines.length && lines[i].trim() && !/^(#|>|```|\||-{3,}|\s*(-|\d+\.)\s)/.test(lines[i])) {
      buf.push(inline(lines[i])); i += 1;
    }
    if (buf.length) out.push(`<p>${buf.join("<br>")}</p>`);
    else i += 1;
  }
  return out.join("\n");
}

// ---------- login ----------
function showLogin() {
  sound.stopAmbience();
  $("#app").hidden = true;
  $("#login").hidden = false;
  if (LOCAL_ENGINE) $("#ip").textContent = t("thisDevice");
  else api("/api/whoami").then((d) => { $("#ip").textContent = d.ip; }).catch(() => { $("#ip").textContent = t("unknownIp"); });
  $("#name").focus();
}

$("#login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("#login-error").textContent = "";
  try {
    await api("/api/login", { name: $("#name").value.trim() });
    await enterApp();
    sound.impact();
  } catch (err) {
    $("#login-error").textContent = err.message;
  }
});

$("#logout").addEventListener("click", async () => {
  await api("/api/logout", {}).catch(() => {});
  state = null;
  documentRequest += 1;
  currentDocId = null;
  closeTools();
  showLogin();
});

$("#sound-toggle").addEventListener("click", () => {
  sound.setEnabled(!sound.isEnabled());
  updateSoundButton();
});
["pointerdown", "keydown"].forEach((type) => document.addEventListener(type, () => sound.unlock(), { passive: true }));

async function enterApp() {
  state = await api("/api/state");
  $("#login").hidden = true;
  $("#app").hidden = false;
  closeTools();
  $("#who").textContent = [state.name, state.ip].filter(Boolean).join(" · ");
  $("#notes").value = state.notes || "";
  const open = state.chapters.filter((c) => !c.locked);
  currentChapterId = (open.find((c) => !c.solved) || open[open.length - 1]).id;
  renderFiles();
  renderQuestions();
  switchTab("notes");
  currentDocId = null;
  renderOverview();
  setMobilePane("viewer");
  updateSoundButton();
  sound.startAmbience();
}

async function refreshState() {
  state = await api("/api/state");
  renderFiles();
  renderQuestions();
}

// ---------- file list ----------
function docButton(id) {
  const meta = state.docs[id];
  const btn = document.createElement("button");
  const read = state.read.includes(id);
  btn.className = "doc-btn" + (read ? " read" : "") + (id === currentDocId ? " active" : "");
  btn.dataset.doc = id;
  if (id === currentDocId) btn.setAttribute("aria-current", "page");
  btn.innerHTML = `<span class="file-symbol" aria-hidden="true">${fileIcon(meta.category)}</span><span class="file-label">${escapeHtml(local(meta, "title"))}<span class="cat">${escapeHtml(local(meta, "category"))} · ${read ? ui("read") : ui("unread")}</span></span><span class="read-mark" aria-hidden="true">${read ? "✓" : ""}</span>`;
  btn.addEventListener("click", () => openDoc(id));
  return btn;
}

function renderFiles() {
  renderFileIndex();
}

async function openDoc(id, { keepPane = false } = {}) {
  const requestId = ++documentRequest;
  currentDocId = id;
  const viewer = $("#viewer");
  viewer.innerHTML = `<div class="empty">${escapeHtml(t("loading"))}</div>`;
  if (!keepPane) setMobilePane("viewer");
  try {
    const doc = await api(`/api/doc?id=${encodeURIComponent(id)}&lang=${lang}`);
    if (requestId !== documentRequest) return;
    renderReadingView(doc, id);
    viewer.scrollTop = 0;
    if (!state.read.includes(id)) state = { ...state, read: [...state.read, id] };
    renderFiles();
  } catch (err) {
    if (requestId === documentRequest) viewer.innerHTML = `<div class="empty">${escapeHtml(err.message)}</div>`;
  }
}

// ---------- notes ----------
const saveNotes = debounce(async () => {
  try {
    await api("/api/notes", { notes: $("#notes").value });
    $("#notes-status").textContent = `${t("saved")} · ${new Date().toLocaleTimeString(lang === "en" ? "en-US" : "ko-KR")}`;
  } catch (err) {
    $("#notes-status").textContent = t("saveFailed") + err.message;
  }
}, NOTES_SAVE_DELAY_MS);

$("#notes").addEventListener("input", () => { $("#notes-status").textContent = t("saving"); saveNotes(); });

// ---------- quote selection ----------
function placeQuoteButton() {
  const sel = window.getSelection();
  const text = sel ? sel.toString().trim() : "";
  const paper = $("#viewer .paper");
  const btn = $("#quote-btn");
  if (!text || !paper || !sel.rangeCount || !paper.contains(sel.anchorNode)) { btn.hidden = true; return; }
  const rect = sel.getRangeAt(0).getBoundingClientRect();
  btn.style.left = `${Math.min(window.innerWidth - 120, rect.right)}px`;
  btn.style.top = `${Math.max(8, rect.top - 36)}px`;
  btn.hidden = false;
  btn.dataset.text = text;
}
document.addEventListener("mouseup", (e) => {
  if (e.target.id === "quote-btn") return;
  setTimeout(placeQuoteButton, 0);
});
document.addEventListener("selectionchange", debounce(placeQuoteButton, SELECTION_SETTLE_MS));

$("#quote-btn").addEventListener("click", () => {
  const btn = $("#quote-btn");
  const title = $("#viewer .paper")?.dataset.title || "";
  const notes = $("#notes");
  const cite = lang === "en" ? `“${title}”` : `「${title}」`;
  const quote = `> ${btn.dataset.text.replace(/\n+/g, " ")}\n  — ${cite}\n\n`;
  notes.value = (notes.value && !notes.value.endsWith("\n") ? notes.value + "\n" : notes.value) + quote;
  btn.hidden = true;
  window.getSelection()?.removeAllRanges();
  openTools("notes");
  $("#notes-status").textContent = t("saving");
  saveNotes();
});

// ---------- side tabs ----------
function switchTab(name) {
  document.querySelectorAll(".side-tabs button").forEach((b) => {
    const active = b.dataset.tab === name;
    b.classList.toggle("active", active);
    b.setAttribute("aria-selected", String(active));
    b.tabIndex = active ? 0 : -1;
  });
  if ($("#app").classList.contains("tools-open")) document.querySelectorAll("[data-tool]").forEach(b => b.setAttribute("aria-expanded", String(b.dataset.tool === name)));
  $("#tab-notes").hidden = name !== "notes";
  $("#tab-questions").hidden = name !== "questions";
}
document.querySelectorAll(".side-tabs button").forEach((b) => b.addEventListener("click", () => switchTab(b.dataset.tab)));
$(".side-tabs").addEventListener("keydown", (e) => {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
  e.preventDefault();
  const tabs = [...document.querySelectorAll(".side-tabs button")];
  const index = tabs.indexOf(document.activeElement);
  const next = e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : (index + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
  switchTab(tabs[next].dataset.tab); tabs[next].focus();
});

function setMobilePane(name) {
  document.querySelectorAll(".mobile-tabs button").forEach((b) => b.classList.toggle("active", b.dataset.pane === name));
  ["files", "viewer", "side"].forEach((p) => $(`#${p}`).classList.toggle("show", p === name));
}
document.querySelectorAll(".mobile-tabs button").forEach((b) => b.addEventListener("click", () => setMobilePane(b.dataset.pane)));

// ---------- questions ----------
function fieldFor(q, value, inTemplate) {
  if (q.type === "number") {
    const input = document.createElement("input");
    input.type = "number";
    input.min = q.min; input.max = q.max; input.step = 1;
    input.value = value ?? "";
    input.dataset.qid = q.id;
    input.id = `answer-${currentChapterId}-${q.id}`;
    input.setAttribute("aria-label", local(q, "prompt"));
    return input;
  }
  const select = document.createElement("select");
  select.dataset.qid = q.id;
  select.id = `answer-${currentChapterId}-${q.id}`;
  select.setAttribute("aria-label", local(q, "prompt"));
  const prompt = local(q, "prompt");
  if (inTemplate) select.title = prompt;
  const placeholder = inTemplate ? `[${prompt}]` : t("choose");
  // The value stays the canonical (Korean) option the server grades; only the label is translated.
  const labels = lang === "en" && q.options_en ? q.options_en : q.options;
  select.innerHTML = `<option value="">${escapeHtml(placeholder)}</option>` +
    q.options.map((o, i) => `<option value="${escapeHtml(o)}"${o === value ? " selected" : ""}>${escapeHtml(labels[i])}</option>`).join("");
  return select;
}

function collectAnswers(box) {
  return Object.fromEntries([...box.querySelectorAll("[data-qid]")].map((el) => [el.dataset.qid, el.value]));
}

function renderQuestions() {
  const box = $("#tab-questions");
  box.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "qbox";
  const open = state.chapters.filter((c) => !c.locked);

  const pick = document.createElement("select");
  pick.className = "chapter-pick";
  pick.setAttribute("aria-label", ui("stage"));
  pick.innerHTML = open.map((c) => `<option value="${c.id}"${c.id === currentChapterId ? " selected" : ""}>${escapeHtml(local(c, "title"))}${c.solved ? " ✓" : ""}</option>`).join("");
  pick.addEventListener("change", () => { currentChapterId = pick.value; renderQuestions(); });
  wrap.appendChild(pick);

  const ch = open.find((c) => c.id === currentChapterId) || open[0];
  const draft = state.drafts[ch.id] || {};
  wrap.insertAdjacentHTML("beforeend", `<h3>${escapeHtml(local(ch, "title"))}</h3><p class="intro">${escapeHtml(local(ch, "intro"))}</p>`);

  const form = document.createElement("div");
  if (ch.template) {
    const p = document.createElement("p");
    p.className = "template";
    const byId = Object.fromEntries(ch.questions.map((q) => [q.id, q]));
    local(ch, "template").split(/(\{\w+\})/).forEach((part) => {
      const m = part.match(/^\{(\w+)\}$/);
      if (m && byId[m[1]]) p.appendChild(fieldFor(byId[m[1]], draft[m[1]], true));
      else p.appendChild(document.createTextNode(part));
    });
    form.appendChild(p);
  } else {
    ch.questions.forEach((q, idx) => {
      const row = document.createElement("div");
      row.className = "q";
      row.innerHTML = `<label for="answer-${ch.id}-${q.id}"><span class="question-number">${String(idx + 1).padStart(2, "0")}</span>${escapeHtml(local(q, "prompt"))}</label>`;
      row.appendChild(fieldFor(q, draft[q.id], false));
      form.appendChild(row);
    });
  }
  wrap.appendChild(form);

  const result = document.createElement("div");
  result.setAttribute("role", "status");
  if (ch.solved) {
    result.innerHTML = `<p class="solved-note">${escapeHtml(t("solvedNote"))}</p>`;
    form.querySelectorAll("[data-qid]").forEach((el) => { el.disabled = true; });
  } else {
    const submit = document.createElement("button");
    submit.className = "submit";
    submit.textContent = t(ch.template ? "submitFinal" : "submitStage");
    wrap.appendChild(submit);
    const saveDraft = debounce(() => api("/api/draft", { chapter: ch.id, answers: collectAnswers(form) }).catch(() => {}), DRAFT_SAVE_DELAY_MS);
    form.addEventListener("change", () => { state.drafts[ch.id] = collectAnswers(form); saveDraft(); });
    form.addEventListener("input", () => { state.drafts[ch.id] = collectAnswers(form); saveDraft(); });
    submit.addEventListener("click", () => submitChapter(ch, form, submit, result));
    if (ch.wait) startCooldown(submit, result, ch.wait);
  }
  wrap.appendChild(result);
  box.appendChild(wrap);
}

const COOLDOWN_SUFFIX = / \(\d+(초|s)\)$/;

function startCooldown(button, result, seconds) {
  clearInterval(cooldownTimer);
  let left = seconds;
  button.disabled = true;
  const tick = () => {
    if (left <= 0) {
      clearInterval(cooldownTimer);
      button.disabled = false;
      button.textContent = button.textContent.replace(COOLDOWN_SUFFIX, "");
      return;
    }
    button.textContent = button.textContent.replace(COOLDOWN_SUFFIX, "") + ` (${left}${t("sec")})`;
    left -= 1;
  };
  tick();
  cooldownTimer = setInterval(tick, 1000);
}

async function submitChapter(ch, form, button, result) {
  const answers = collectAnswers(form);
  if (Object.values(answers).some((v) => v === "")) {
    result.className = "result bad";
    result.textContent = t("fillAll");
    return;
  }
  button.disabled = true;
  try {
    const r = await api("/api/submit", { chapter: ch.id, answers });
    if (r.ok) {
      result.className = "result ok";
      result.textContent = t(ch.template ? "okFinal" : "okStage");
      sound.impact();
      showSeal(ch.template ? t("sealClosed") : `${local(ch, "title")} · ${t("sealConfirmed")}`);
      const prev = state.chapters.map((c) => c.id);
      state = await api("/api/state");
      const next = state.chapters.find((c) => !c.locked && !c.solved);
      if (next && prev.includes(next.id)) currentChapterId = next.id;
      renderFiles();
      if (!currentDocId) renderOverview();
      setTimeout(renderQuestions, 1600);
      return;
    }
    if (r.error) { result.className = "result bad"; result.textContent = localizeError(r.error); button.disabled = false; return; }
    result.className = r.near ? "result near" : "result bad";
    result.textContent = t(r.near ? "near" : "bad");
    if (r.wait) startCooldown(button, result, r.wait);
    else button.disabled = false;
  } catch (err) {
    result.className = "result bad";
    result.textContent = err.message;
    button.disabled = false;
  }
}

// ---------- boot ----------
(async function boot() {
  applyStaticText();
  try {
    const who = await api("/api/whoami");
    if (who.name) await enterApp();
    else showLogin();
  } catch (err) {
    showLogin();
    $("#login-error").textContent = err.message;
  }
})();
