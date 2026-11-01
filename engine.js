"use strict";
/*
 * Serverless stand-in for server.py, used only by the GitHub Pages build.
 * app.js talks to it through window.cheongunjaeLocal.request(path, body), with the
 * same routes, rules and (Korean) messages as the Python server.
 *
 * Later stages ship encrypted: each sealed bundle is AES-GCM encrypted with a key
 * derived (PBKDF2) from the previous stage's correct answers, so the answers and
 * locked files never appear in the page source. A wrong submission simply fails
 * to decrypt.
 */
(() => {
  const STORE_KEY = "cheongunjae.pages.v1";
  const NAME_PATTERN = /^[0-9A-Za-z가-힣 _\-.]{1,20}$/;
  const BASE_COOLDOWN_SECONDS = 20;
  const MAX_COOLDOWN_SECONDS = 600;
  const MAX_NOTES_CHARS = 200000;
  const MAX_ANSWER_CHARS = 40;
  const SEPARATOR = "␟";

  const MSG = {
    loginNeeded: "로그인이 필요합니다.",
    badName: "이름은 1~20자의 한글·영문·숫자로 입력하세요.",
    notReadable: "아직 볼 수 없는 자료입니다.",
    notOpen: "아직 열리지 않은 단계입니다.",
    notOpenDraft: "열리지 않은 단계입니다.",
    badAnswer: "답안 형식이 올바르지 않습니다.",
    notesType: "수첩 내용 형식이 올바르지 않습니다.",
    notesLong: "수첩이 너무 깁니다. (20만 자 제한)",
    notFound: "없는 주소입니다.",
    server: "서버 오류가 발생했습니다.",
    noCrypto: "이 브라우저는 필요한 암호 기능을 지원하지 않습니다. 최신 브라우저에서 https 주소로 열어 주세요.",
  };

  let casePromise = null;
  let opened = { chapters: {}, docs: {} };
  let memoryStore = { current: null, players: {} };

  class HttpError extends Error {
    constructor(status, message) { super(message); this.status = status; }
  }

  // ---------- case data ----------
  function loadCase() {
    if (!casePromise) {
      casePromise = fetch("data/case.json", { cache: "no-cache" })
        .then((res) => {
          if (!res.ok) throw new Error(`case.json: HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => {
          opened = {
            chapters: Object.fromEntries(data.chapters.map((c) => [c.id, c])),
            docs: { ...data.docs },
          };
          return data;
        })
        .catch((err) => { casePromise = null; throw err; });
    }
    return casePromise;
  }

  // ---------- storage ----------
  function newState() {
    return { solved: [], read: [], notes: "", drafts: {}, attempts: {}, keys: {} };
  }
  function readStore() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (err) {
      console.warn("브라우저 저장소를 읽지 못했습니다. 이번 방문 동안만 기억합니다.", err);
    }
    return memoryStore;
  }
  function writeStore(store) {
    memoryStore = store;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
    } catch (err) {
      console.warn("브라우저 저장소에 쓰지 못했습니다. 탭을 닫으면 진행이 사라집니다.", err);
    }
  }
  function currentPlayer() {
    const store = readStore();
    const name = store.current;
    if (!name || !store.players[name]) throw new HttpError(401, MSG.loginNeeded);
    return { store, name, state: { ...newState(), ...store.players[name] } };
  }
  function savePlayer(store, name, state) {
    writeStore({ ...store, players: { ...store.players, [name]: state } });
  }

  // ---------- crypto ----------
  const fromB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const normalize = (v) => String(v).trim().replace(/ /g, "").toLowerCase();
  const secretFor = (chapter, answers) =>
    chapter.questions.map((q) => normalize(answers[q.id] ?? "")).join(SEPARATOR);

  async function openBlob(blob, secret, iterations) {
    if (!window.crypto || !crypto.subtle) throw new HttpError(500, MSG.noCrypto);
    const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), "PBKDF2", false, ["deriveKey"]);
    const key = await crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: fromB64(blob.salt), iterations, hash: "SHA-256" },
      base, { name: "AES-GCM", length: 256 }, false, ["decrypt"],
    );
    try {
      const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64(blob.iv) }, key, fromB64(blob.data));
      return JSON.parse(new TextDecoder().decode(plain));
    } catch (err) {
      if (err && err.name === "OperationError") return null; // wrong answers: authentication tag mismatch
      throw err;
    }
  }

  /** The bundle that solving chapter `index` opens: the next stage, or the epilogue after the last. */
  function blobAfter(data, index) {
    return index < data.sealed.length ? data.sealed[index] : data.epilogue;
  }
  function absorb(payload) {
    const chapters = payload.chapter ? { ...opened.chapters, [payload.chapter.id]: payload.chapter } : opened.chapters;
    opened = { chapters, docs: { ...opened.docs, ...payload.docs } };
  }

  /** Re-open every bundle this player has already earned (contents live only in memory). */
  async function restore(data, state) {
    for (let i = 0; i < data.order.length; i += 1) {
      const id = data.order[i];
      if (!state.solved.includes(id) || !state.keys[id]) break;
      const target = blobAfter(data, i);
      const alreadyOpen = i < data.sealed.length ? Boolean(opened.chapters[data.sealed[i].id]) : Boolean(opened.docs[data.epilogue_ids[0]]);
      if (alreadyOpen) continue;
      const payload = await openBlob(target, secretFor(opened.chapters[id], state.keys[id]), data.iterations);
      if (!payload) break;
      absorb(payload);
    }
  }

  // ---------- rules (mirror game.py) ----------
  function unlockedChapters(data, state) {
    const unlocked = [data.order[0]];
    for (let i = 0; i + 1 < data.order.length; i += 1) {
      if (!state.solved.includes(data.order[i]) || !opened.chapters[data.order[i + 1]]) break;
      unlocked.push(data.order[i + 1]);
    }
    return unlocked;
  }
  const isComplete = (data, state) => data.order.every((id) => state.solved.includes(id));
  function readableDocIds(data, state) {
    const open = unlockedChapters(data, state);
    const ids = open.flatMap((id) => opened.chapters[id].docs);
    return isComplete(data, state) ? [...ids, ...data.epilogue_ids.filter((id) => opened.docs[id])] : ids;
  }
  function cooldownSeconds(wrong) {
    return wrong <= 0 ? 0 : Math.min(MAX_COOLDOWN_SECONDS, BASE_COOLDOWN_SECONDS * 2 ** (wrong - 1));
  }
  function secondsUntilAllowed(state, id, now) {
    const record = state.attempts[id];
    if (!record || record.last_wrong_at == null) return 0;
    return Math.max(0, Math.ceil(record.last_wrong_at + cooldownSeconds(record.wrong) - now));
  }
  function sanitize(chapter, submitted) {
    if (!submitted || typeof submitted !== "object") throw new HttpError(400, MSG.badAnswer);
    return Object.fromEntries(chapter.questions.map((q) => {
      const raw = submitted[q.id] ?? "";
      if (typeof raw !== "string" && typeof raw !== "number") throw new HttpError(400, MSG.badAnswer);
      return [q.id, String(raw).slice(0, MAX_ANSWER_CHARS)];
    }));
  }

  function publicView(data, state, name, now) {
    const open = unlockedChapters(data, state);
    const chapters = data.order.map((id) => {
      if (!open.includes(id)) {
        const sealed = data.sealed.find((s) => s.id === id);
        return { id, title: sealed.title, title_en: sealed.title_en, locked: true };
      }
      const c = opened.chapters[id];
      return {
        id, title: c.title, title_en: c.title_en, intro: c.intro, intro_en: c.intro_en,
        template: c.template ?? null, template_en: c.template_en ?? c.template ?? null,
        questions: c.questions, docs: c.docs,
        solved: state.solved.includes(id), wait: secondsUntilAllowed(state, id, now), locked: false,
      };
    });
    const docs = Object.fromEntries(readableDocIds(data, state).map((id) => {
      const d = opened.docs[id];
      return [id, { title: d.title, title_en: d.title_en, category: d.category, category_en: d.category_en }];
    }));
    return {
      title: data.title, chapters, docs,
      epilogue: isComplete(data, state) ? data.epilogue_ids : [],
      complete: isComplete(data, state),
      read: state.read, notes: state.notes, drafts: state.drafts, name, ip: null,
    };
  }

  async function judge(data, state, chapterId, submitted, now) {
    const index = data.order.indexOf(chapterId);
    if (index < 0 || !unlockedChapters(data, state).includes(chapterId)) return { state, result: { ok: false, error: MSG.notOpen } };
    if (state.solved.includes(chapterId)) return { state, result: { ok: true, already: true } };
    const wait = secondsUntilAllowed(state, chapterId, now);
    if (wait) return { state, result: { ok: false, wait } };

    const chapter = opened.chapters[chapterId];
    const clean = sanitize(chapter, submitted);
    const payload = await openBlob(blobAfter(data, index), secretFor(chapter, clean), data.iterations);
    const previous = state.attempts[chapterId] || { wrong: 0, total: 0, last_wrong_at: null };
    if (payload) {
      absorb(payload);
      return {
        state: {
          ...state,
          solved: [...state.solved, chapterId],
          keys: { ...state.keys, [chapterId]: clean },
          attempts: { ...state.attempts, [chapterId]: { ...previous, total: previous.total + 1 } },
        },
        result: { ok: true },
      };
    }
    const record = { wrong: previous.wrong + 1, total: previous.total + 1, last_wrong_at: now };
    // Counting wrong blanks would need per-blank checks, which would leak the answers; no near-miss hint here.
    return { state: { ...state, attempts: { ...state.attempts, [chapterId]: record } }, result: { ok: false, near: false, wait: cooldownSeconds(record.wrong) } };
  }

  // ---------- routes ----------
  async function route(method, path, query, body) {
    const data = await loadCase();
    const now = Date.now() / 1000;
    if (method === "GET" && path === "/api/whoami") {
      const store = readStore();
      return { ip: null, name: store.current && store.players[store.current] ? store.current : null };
    }
    if (method === "POST" && path === "/api/login") {
      const name = String(body?.name ?? "").trim();
      if (!NAME_PATTERN.test(name)) throw new HttpError(400, MSG.badName);
      const store = readStore();
      writeStore({ current: name, players: { ...store.players, [name]: store.players[name] || newState() } });
      return { name, ip: null };
    }
    const { store, name, state } = currentPlayer();
    if (method === "POST" && path === "/api/logout") {
      writeStore({ ...store, current: null });
      return { ok: true };
    }
    await restore(data, state);
    if (method === "GET" && path === "/api/state") return publicView(data, state, name, now);
    if (method === "GET" && path === "/api/doc") {
      const id = query.get("id") || "";
      if (!readableDocIds(data, state).includes(id)) throw new HttpError(403, MSG.notReadable);
      const doc = opened.docs[id];
      const english = query.get("lang") === "en";
      if (!state.read.includes(id)) savePlayer(store, name, { ...state, read: [...state.read, id] });
      return { id, title: english && doc.title_en ? doc.title_en : doc.title, text: english && doc.en ? doc.en : doc.ko };
    }
    if (method === "POST" && path === "/api/notes") {
      const notes = body?.notes ?? "";
      if (typeof notes !== "string") throw new HttpError(400, MSG.notesType);
      if (notes.length > MAX_NOTES_CHARS) throw new HttpError(400, MSG.notesLong);
      savePlayer(store, name, { ...state, notes });
      return { ok: true };
    }
    if (method === "POST" && path === "/api/draft") {
      const chapterId = String(body?.chapter ?? "");
      if (!unlockedChapters(data, state).includes(chapterId)) throw new HttpError(400, MSG.notOpenDraft);
      const clean = sanitize(opened.chapters[chapterId], body?.answers ?? {});
      savePlayer(store, name, { ...state, drafts: { ...state.drafts, [chapterId]: clean } });
      return { ok: true };
    }
    if (method === "POST" && path === "/api/submit") {
      const chapterId = String(body?.chapter ?? "");
      const answers = body?.answers ?? {};
      const judged = await judge(data, state, chapterId, answers, now);
      let next = judged.state;
      if (unlockedChapters(data, next).includes(chapterId)) {
        next = { ...next, drafts: { ...next.drafts, [chapterId]: sanitize(opened.chapters[chapterId], answers) } };
      }
      savePlayer(store, name, next);
      return judged.result;
    }
    throw new HttpError(404, MSG.notFound);
  }

  async function request(path, body) {
    try {
      const url = new URL(path, location.origin);
      const data = await route(body === undefined ? "GET" : "POST", url.pathname, url.searchParams, body);
      return { status: 200, data };
    } catch (err) {
      if (err instanceof HttpError) return { status: err.status, data: { error: err.message } };
      console.error("게임 엔진 오류", err);
      return { status: 500, data: { error: MSG.server } };
    }
  }

  window.cheongunjaeLocal = Object.freeze({ request });
})();
