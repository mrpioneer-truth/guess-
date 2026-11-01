/* Presentation only. Evidence, grading, unlocks and storage remain in engine.js. */
const READING_LABELS = {
  ko: {
    home: '수사 현황', notebook: '수첩', questions: '질문 확인', workspace: '수사 작업대', noteHint: '자료의 문장을 선택해 출처와 함께 인용하세요.',
    fileIndex: '사건 자료', search: '제목·분류로 자료 찾기', all: '전체', unreadOnly: '미열람', read: '열람', unread: '미열람', noFiles: '일치하는 자료가 없습니다.', clear: '검색 초기화',
    stage: '수사 단계', locked: '봉인됨', lockedHint: '앞 단계의 결론을 확인하면 열립니다.', progress: '자료 열람', complete: '사건 종결', start: '자료 살펴보기', continue: '이어서 열람',
    caseNo: '봉화경찰서 · 사건번호 2023-1224', overviewTitle: '눈 오는 밤의 기록', overviewSub: '자료를 읽고, 관계를 연결하고, 하나의 결론에 도달하라.',
    steps: ['수사 원칙 확인', '자료 읽고 기록', '단계별 결론 제출'], stepDetails: ['기록과 진술을 어떻게 읽을지 확인하세요.', '문장을 선택하면 수첩에 출처와 함께 남길 수 있습니다.', '모든 답이 맞으면 다음 자료가 열립니다.'],
    rules: '수사 원칙', files: '자료 열람', review: '질문 살펴보기', chapters: '수사 진행', visualFiles: '공간과 기록', visualSub: '복잡한 자료는 도면과 표로 함께 살펴보세요.',
    map: '청운재 배치', scene: '서고 내부', weather: '기상 관측', mapSub: '건물 · 이동 경로', sceneSub: '구조 · 현장 배치', weatherSub: '강설 · 시간별 관측',
    outline: '문서 안에서', original: '원문 보기', visual: '시각화 보기', smaller: '글자 작게', larger: '글자 크게', previous: '이전 자료', next: '다음 자료', end: '이 단계 자료 끝',
    illustration: '분위기를 위한 삽화', objectIllustration: '물품 이해를 돕는 삽화 · 실제 형상·배치는 원문 참조', mapCaption: '원문에 따른 개략도 · 축척 아님 · 거리는 본문 수치 기준',
    north: '북', mainHouse: '안채', sarang: '사랑채', bedroom: '안방', seraRoom: '건넌방', hall: '대청', living: '거실', kitchen: '부엌', smallRoom: '작은방', library: '서고', shed: '장작 헛간', yoonRoom: '사랑방', guestRoom: '손님방', backDoor: '뒷문', courtyard: '앞마당', clock: '괘종시계', wallPath: '담장길 약 25m', yardPath: '약 30m', southPath: '남쪽 15m',
    shelf: '붙박이 서가', ladder: '사다리', body: '시신', heater: '난로', bed: '간이 침상', desk: '책상', chair: '의자', door: '출입문', window: '고정창', dimensions: '내부 6.0m × 4.2m',
    lockClock: '도어락 내부 시계 기준 · 보정하지 않은 원기록', date: '날짜', time: '시각', event: '구분', user: '사용자', rawLog: '원문 기록 펼치기', rawMap: '원문 약도 펼치기',
    snow: '적설', snowUnit: '적설 (cm)', weatherCaption: '원문 관측값을 그래프로 표시 · 상세 수치는 아래 표 참조', zoom: '도면 확대', zoomOut: '도면 축소', pan: '좌우로 밀어 도면을 살펴보세요.', rawTable: '원문 표 펼치기', people: '사건 관계자', age: '나이', report: '자료 본문', seen: '열람한 자료', selectStage: '이 단계의 질문 확인',
  },
  en: {
    home: 'Case overview', notebook: 'Notebook', questions: 'Questions', workspace: 'Investigation desk', noteHint: 'Select text in a file to quote it with its source.',
    fileIndex: 'Case files', search: 'Find by title or category', all: 'All', unreadOnly: 'Unread', read: 'Read', unread: 'Unread', noFiles: 'No matching files.', clear: 'Clear search',
    stage: 'Investigation stage', locked: 'Sealed', lockedHint: 'Confirm the previous conclusion to unlock.', progress: 'Files opened', complete: 'Case closed', start: 'Explore files', continue: 'Continue reading',
    caseNo: 'Bonghwa Police · Case No. 2023-1224', overviewTitle: 'Records of a snowy night', overviewSub: 'Read the files. Connect the evidence. Reach a single conclusion.',
    steps: ['Read the rules', 'Read and take notes', 'Submit your conclusions'], stepDetails: ['Learn how to read records and statements.', 'Select text to quote it into your notebook.', 'Correct answers unlock the next set of files.'],
    rules: 'Investigation rules', files: 'Read files', review: 'View questions', chapters: 'Investigation progress', visualFiles: 'Spaces & records', visualSub: 'Explore spatial evidence and observations visually.',
    map: 'Estate layout', scene: 'Inside the library', weather: 'Weather records', mapSub: 'Buildings · routes', sceneSub: 'Structure · scene layout', weatherSub: 'Snow · hourly observations',
    outline: 'In this file', original: 'Original text', visual: 'Visual view', smaller: 'Smaller text', larger: 'Larger text', previous: 'Previous file', next: 'Next file', end: 'End of these files',
    illustration: 'Atmospheric illustration', objectIllustration: 'Illustration of objects · refer to the text for actual form and placement', mapCaption: 'Schematic based on the original · not to scale · use distances in the text',
    north: 'N', mainHouse: 'Main house', sarang: 'Sarangchae', bedroom: 'Master room', seraRoom: 'Geonneonbang', hall: 'Daecheong', living: 'Living room', kitchen: 'Kitchen', smallRoom: 'Small room', library: 'Library', shed: 'Woodshed', yoonRoom: 'Sarangbang', guestRoom: 'Guest room', backDoor: 'Back door', courtyard: 'Courtyard', clock: 'Chiming clock', wallPath: 'Wall path ≈25m', yardPath: '≈30m', southPath: '15m south',
    shelf: 'Built-in shelves', ladder: 'Ladder', body: 'Body', heater: 'Heater', bed: 'Daybed', desk: 'Desk', chair: 'Chair', door: 'Door', window: 'Fixed window', dimensions: 'Interior 6.0m × 4.2m',
    lockClock: 'Door-lock clock · original, uncorrected timestamps', date: 'Date', time: 'Time', event: 'Event', user: 'User', rawLog: 'Expand original log', rawMap: 'Expand original diagram',
    snow: 'Snow depth', snowUnit: 'Snow depth (cm)', weatherCaption: 'Chart of the original observations · see the table below for exact values', zoom: 'Enlarge plan', zoomOut: 'Fit plan', pan: 'Swipe sideways to explore the plan.', rawTable: 'Expand original table', people: 'People in the case', age: 'Age', report: 'File text', seen: 'Files opened', selectStage: 'Review this stage’s questions',
  },
};
const ui = (key) => READING_LABELS[lang][key] ?? READING_LABELS.ko[key] ?? key;
const FILE_PATHS = {
  '안내': '<path d="M12 10v7m0-10v.1"/><circle cx="12" cy="12" r="9"/>',
  '경찰 보고': '<path d="M7 3h10v18H4V6h3m0-3v5h5M8 12h8m-8 4h8"/>',
  '감식': '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6M7 10h6m-3-3v6"/>',
  '기록': '<path d="M4 4h16v16H4zM8 8h8M8 12h8M8 16h4"/>',
  '진술': '<path d="M21 4H3v13h5l4 4v-4h9zM7 8h10M7 12h7"/>',
  '압수 자료': '<path d="M3 7h18v14H3zM8 7V3h8v4M3 12h18m-11 0v3h4v-3"/>',
};
function fileIcon(category) { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true">${FILE_PATHS[category] || FILE_PATHS['기록']}</svg>`; }
let fileQuery = '';
let onlyUnread = false;
let readingMode = 'visual';
let readingSize = 17;
try { readingSize = Math.max(16, Math.min(21, Number(localStorage.getItem('cheongunjae.readingSize')) || 17)); } catch {}
function applyReadingLabels() {
  document.querySelectorAll('[data-ui]').forEach(el => el.textContent = ui(el.dataset.ui));
  document.querySelector('#case-home')?.setAttribute('aria-label', ui('home'));
  document.querySelector('#close-tools')?.setAttribute('aria-label', lang === 'en' ? 'Close' : '닫기');
  document.querySelector('.mobile-tabs')?.setAttribute('aria-label', lang === 'en' ? 'Switch pane' : '화면 전환');
}
function visibleIds() { return [...state.chapters.filter(c => !c.locked).flatMap(c => c.docs), ...state.epilogue]; }
function chapterRead(ch) { return ch.docs.filter(id => state.read.includes(id)).length; }
function renderFileIndex() {
  const root = $('#files');
  const scroll = root.scrollTop;
  root.innerHTML = `<div class="file-index-head"><button class="index-home" type="button">← ${ui('home')}</button><div class="index-title"><h1>${ui('fileIndex')}</h1><span>${String(visibleIds().length).padStart(2,'0')}</span></div><label class="file-search"><span aria-hidden="true">⌕</span><input type="search" placeholder="${ui('search')}" aria-label="${ui('search')}" value="${escapeHtml(fileQuery)}"></label><div class="file-filters"><button type="button" data-filter="all" aria-pressed="${!onlyUnread}">${ui('all')}</button><button type="button" data-filter="unread" aria-pressed="${onlyUnread}">${ui('unreadOnly')}</button></div></div><div class="file-results"></div>`;
  root.querySelector('.index-home').onclick = showOverview;
  root.querySelector('input').oninput = e => { fileQuery = e.target.value; renderFileResults(); };
  root.querySelectorAll('[data-filter]').forEach(b => b.onclick = () => { onlyUnread = b.dataset.filter === 'unread'; root.querySelectorAll('[data-filter]').forEach(el => el.setAttribute('aria-pressed', String((el.dataset.filter === 'unread') === onlyUnread))); renderFileResults(); });
  renderFileResults();
  root.scrollTop = scroll;
}
function renderFileResults() {
  const root = $('#files .file-results');
  root.innerHTML = '';
  let matches = 0;
  const query = fileQuery.toLocaleLowerCase().trim();
  const chapters = [...state.chapters];
  if (state.epilogue.length) chapters.push({id:'closed', title: t('epilogueTitle'), title_en: t('epilogueTitle'), docs:state.epilogue, solved:true});
  chapters.forEach((ch, i) => {
    if (ch.locked) {
      if (!query && !onlyUnread) root.insertAdjacentHTML('beforeend', `<div class="locked-chapter"><span class="stage-number">0${i+1}</span><div><b>${escapeHtml(local(ch,'title'))}</b><small>${ui('lockedHint')}</small></div><span aria-label="${ui('locked')}">⊠</span></div>`);
      return;
    }
    const ids = ch.docs.filter(id => (!onlyUnread || !state.read.includes(id)) && (!query || `${local(state.docs[id],'title')} ${local(state.docs[id],'category')}`.toLocaleLowerCase().includes(query)));
    if (!ids.length) return;
    matches += ids.length;
    const sec = document.createElement('details');
    sec.className = 'chapter';
    sec.open = !!query || onlyUnread || !ch.solved || ch.docs.includes(currentDocId);
    sec.innerHTML = `<summary><span class="chapter-heading"><span>${escapeHtml(local(ch,'title'))}</span><small>${chapterRead(ch)} / ${ch.docs.length} ${ui('read')}${ch.solved ? ' · ✓ '+t('solved') : ''}</small></span><span class="disclosure" aria-hidden="true">⌄</span></summary>`;
    let last = '';
    ids.forEach(id => {
      const cat = state.docs[id].category;
      if (last !== cat) { const label = document.createElement('div'); label.className = 'category-label'; label.textContent = local(state.docs[id],'category'); sec.appendChild(label); last = cat; }
      sec.appendChild(docButton(id));
    });
    root.appendChild(sec);
  });
  if (!matches) {
    const empty = document.createElement('div'); empty.className='no-files'; empty.innerHTML=`<p>${ui('noFiles')}</p><button class="ghost" type="button">${ui('clear')}</button>`;
    empty.querySelector('button').onclick = () => {fileQuery=''; onlyUnread=false;renderFileIndex();}; root.appendChild(empty);
  }
}
function showOverview() { documentRequest += 1; currentDocId = null; $('#quote-btn').hidden = true; renderOverview(); renderFiles(); setMobilePane('viewer'); }
function renderOverview() {
  const ch = state.chapters.find(c=>!c.locked && !c.solved) || state.chapters.filter(c=>!c.locked).at(-1);
  const next = ch.docs.find(id=>!state.read.includes(id)) || ch.docs[0];
  const total = visibleIds().length;
  const seen = visibleIds().filter(id=>state.read.includes(id)).length;
  $('#viewer').innerHTML = `<div class="overview"><div class="overview-kicker"><span>CASE DOSSIER / 2023-1224</span><span>${String(seen).padStart(2,'0')} / ${total} ${ui('read')}</span></div><section class="case-hero"><div class="hero-image"><img src="assets/art/winter-estate.webp" alt="${lang==='en'?'Illustration of a snowbound hanok estate':'눈에 갇힌 한옥 고택의 삽화'}"><span>${ui('illustration')}</span></div><div class="hero-copy"><p class="eyebrow">${ui('caseNo')}</p><h1>${ui('overviewTitle')}</h1><p>${ui('overviewSub')}</p><button type="button" class="solid" data-open="${next}">${seen ? ui('continue') : ui('start')} <span aria-hidden="true">↗</span></button></div></section><div class="investigation-steps">${ui('steps').map((s,i)=>`<button type="button" data-step="${i}"><span class="step-number">0${i+1}</span><span><b>${s}</b><small>${ui('stepDetails')[i]}</small></span><span class="step-arrow" aria-hidden="true">↗</span></button>`).join('')}</div><div class="section-heading"><h2>${ui('chapters')}</h2><span>${state.chapters.filter(c=>c.solved).length} / ${state.chapters.length}</span></div><div class="stage-cards">${state.chapters.map((c,i)=>`<section class="stage-card ${c.locked?'is-locked':''}"><div class="stage-card-top"><span class="stage-number">0${i+1}</span><span>${c.locked ? ui('locked') : c.solved ? '✓ '+t('solved') : ui('stage')}</span></div><h3>${escapeHtml(local(c,'title'))}</h3>${c.locked?`<p>${ui('lockedHint')}</p>`:`<p class="stage-intro">${escapeHtml(local(c,'intro'))}</p><div class="read-count"><span>${ui('progress')}</span><b>${chapterRead(c)} / ${c.docs.length}</b></div><progress max="${c.docs.length}" value="${chapterRead(c)}" aria-label="${ui('progress')}"></progress><button type="button" class="text-action" data-stage="${c.id}">${ui('selectStage')} <span>→</span></button>`}</section>`).join('')}</div><div class="section-heading"><h2>${ui('visualFiles')}</h2><span>${ui('visualSub')}</span></div><div class="visual-shortcuts">${[['d02','map','mapSub'],['d03','scene','sceneSub'],['d06','weather','weatherSub']].filter(([id])=>state.docs[id]).map(([id,key,sub])=>`<button type="button" data-open="${id}"><span class="shortcut-icon">${fileIcon(state.docs[id].category)}</span><span><b>${ui(key)}</b><small>${ui(sub)}</small></span><span>↗</span></button>`).join('')}</div></div>`;
  $('#viewer').scrollTop = 0;
  $('#viewer').querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>openDoc(b.dataset.open));
  $('#viewer').querySelectorAll('[data-stage]').forEach(b=>b.onclick=()=>{currentChapterId=b.dataset.stage;renderQuestions();openTools('questions');});
  $('#viewer').querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.step); if(i===0) openDoc('d00'); else if(i===1) openDoc(next); else openTools('questions');});
}
function openTools(tab) {
  switchTab(tab); document.querySelector('#app').classList.add('tools-open');
  document.querySelectorAll('[data-tool]').forEach(b=>b.setAttribute('aria-expanded',String(b.dataset.tool===tab)));
  if (matchMedia('(max-width: 1024px)').matches) setMobilePane('side');
}
function closeTools() {
  document.querySelector('#app').classList.remove('tools-open');
  document.querySelectorAll('[data-tool]').forEach(b=>b.setAttribute('aria-expanded','false'));
  if (matchMedia('(max-width: 1024px)').matches) setMobilePane('viewer');
}
document.querySelector('#case-home').onclick=()=>{if(state) showOverview();};
document.querySelector('#close-tools').onclick=closeTools;
document.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>{if($('#app').classList.contains('tools-open') && document.querySelector(`.side-tabs [data-tab="${b.dataset.tool}"]`).classList.contains('active')) closeTools(); else openTools(b.dataset.tool);});
document.addEventListener('keydown', e=>{if(e.key==='Escape'){closeTools();$('#quote-btn').hidden=true;}});
function svgText(x,y,text,cls='') { return `<text x="${x}" y="${y}" class="${cls}" text-anchor="middle">${escapeHtml(text)}</text>`; }
function room(x,y,w,h,key,sub='') { return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" class="map-room"/>${svgText(x+w/2,y+h/2+(sub?-3:5),ui(key),'room-name')}${sub?svgText(x+w/2,y+h/2+17,sub,'room-sub'):''}</g>`; }
function mapFigure(type) {
  const caption=ui('mapCaption');
  let inner;
  if(type==='estate') {
    inner=`<path class="map-route" d="M490 112H650V242M268 255H590M268 255V370"/>${svgText(585,91,ui('wallPath'),'map-note')}${svgText(435,280,ui('yardPath'),'map-note')}${svgText(316,334,ui('southPath'),'map-note')}${svgText(270,33,ui('mainHouse'),'map-building')}${room(50,150,125,78,'bedroom',lang==='en'?'Jin Myeong-ho':'진명호')}${room(50,228,125,70,'seraRoom',lang==='en'?'Jin Se-ra':'진세라')}${room(175,150,150,105,'hall',ui('clock'))}${room(325,150,135,105,'living')}${room(325,72,135,78,'kitchen')}${room(210,72,115,78,'smallRoom',lang==='en'?'Park Ha-rin':'박하린')}${room(585,195,135,95,'library')}${room(585,290,135,49,'shed')}${room(155,375,125,70,'yoonRoom',lang==='en'?'Yoon Ki-hyun':'윤기현')}${room(280,375,125,70,'guestRoom',lang==='en'?'Cho Min-gyu':'조민규')}${svgText(280,469,ui('sarang'),'map-building')}${svgText(502,137,ui('backDoor'),'room-sub')}${svgText(450,339,ui('courtyard'),'map-note')}<path class="map-north" d="M705 58V22m-7 10 7-10 7 10"/>${svgText(705,78,ui('north'),'map-note')}`;
  } else {
    inner=`<defs><pattern id="scene-hatch" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0 5 5 0" stroke="#b4b2aa" stroke-width=".7"/></pattern></defs><rect x="100" y="65" width="560" height="360" class="room-wall"/><rect x="114" y="78" width="532" height="36" class="map-object"/>${svgText(380,102,ui('shelf'),'room-name')}<rect x="250" y="124" width="33" height="60" class="map-object"/><path d="M250 139h33m-33 15h33m-33 15h33" class="map-detail"/>${svgText(310,149,ui('ladder'),'room-sub')}<rect x="167" y="192" width="137" height="38" fill="url(#scene-hatch)" stroke="#5b5b55"/>${svgText(235,217,ui('body'),'room-name')}<rect x="114" y="259" width="58" height="58" class="map-object"/>${svgText(143,295,ui('heater'),'room-sub')}<rect x="114" y="350" width="151" height="61" class="map-object"/>${svgText(189,387,ui('bed'),'room-name')}<rect x="585" y="228" width="60" height="108" class="map-object"/>${svgText(615,288,ui('desk'),'room-sub')}<rect x="524" y="264" width="37" height="40" class="map-object"/>${svgText(527,248,ui('chair'),'room-sub')}<path d="M660 226v110" stroke="#f9f8f4" stroke-width="10"/><path d="M657 226v110m6-110v110" class="map-detail"/>${svgText(705,289,ui('window'),'room-sub')}<path d="M350 425h65" stroke="#f9f8f4" stroke-width="9"/><path d="M350 424v-51m0 0q51 0 51 51" class="map-route"/>${svgText(383,457,ui('door'),'room-name')}<path class="map-north" d="M710 74V32m-7 10 7-10 7 10"/>${svgText(710,99,ui('north'),'map-note')}${svgText(380,39,ui('dimensions'),'map-note')}`;
  }
  return `<figure class="evidence-visual map-figure"><div class="visual-label"><span>${type==='estate'?'PLAN 01':'PLAN 02'}</span><b>${ui(type==='estate'?'map':'scene')}</b><button class="map-zoom" type="button" aria-expanded="false">${ui('zoom')} +</button></div><p class="map-pan-hint" hidden>${ui('pan')}</p><svg viewBox="0 0 760 490" role="img" aria-label="${ui(type==='estate'?'map':'scene')}"><title>${ui(type==='estate'?'map':'scene')}</title>${inner}</svg><figcaption>${caption}</figcaption></figure>`;
}
function rawDetails(element,key) { const d=document.createElement('details');d.className='raw-source'; const s=document.createElement('summary');s.textContent=ui(key);d.appendChild(s);element.replaceWith(d);d.appendChild(element); }
function enhanceDocument(paper,id) {
  if(id==='d00') paper.classList.add('rules-paper');
  if(id==='d01') {
    const table=paper.querySelector('table');
    if(table) {
      const cards=[...table.tBodies[0].rows].map((r,i)=>{const c=[...r.cells].map(c=>c.innerHTML);return `<li><span class="person-index">0${i+1}</span><div><h3>${c[0]}<small>${ui('age')} ${c[1]}</small></h3><p>${c[2]}</p></div></li>`;}).join('');
      const wrap=table.closest('.table-wrap');wrap.insertAdjacentHTML('beforebegin',`<ul class="people-cards" aria-label="${ui('people')}">${cards}</ul>`);rawDetails(wrap,'rawTable');
    }
  }
  if (id==='d02'||id==='d03') {
    const pre=paper.querySelector('pre');
    if(pre) { pre.insertAdjacentHTML('beforebegin', mapFigure(id==='d02'?'estate':'scene')); rawDetails(pre,'rawMap');
      const figure=paper.querySelector('.map-figure');
      figure.querySelector('.map-zoom').onclick=e=>{const expanded=figure.classList.toggle('is-expanded');e.currentTarget.setAttribute('aria-expanded',String(expanded));e.currentTarget.textContent=ui(expanded?'zoomOut':'zoom')+(expanded?' −':' +');figure.querySelector('.map-pan-hint').hidden=!expanded;};
    }
  }
  if(id==='d03') {
    const h=[...paper.querySelectorAll('h2')].find(el=>/^4\./.test(el.textContent.trim()));
    h?.insertAdjacentHTML('afterend',`<figure class="object-plate evidence-visual"><img src="assets/art/desk-objects.webp" alt="${lang==='en'?'Illustration of a lamp, magnifying glass, turtle paperweight and manuscript':'스탠드·돋보기·거북 문진·필사본의 삽화'}" loading="lazy"><figcaption>${ui('objectIllustration')}</figcaption></figure>`);
  }
  if(id==='d05') {
    const pre=paper.querySelector('pre');
    if(pre) {
      const lines=pre.textContent.split('\n').filter(s=>/^\d{2}-\d{2}\s/.test(s));
      const rows=lines.map(s=>s.trim().split(/\s{2,}|(?<=\d{2}-\d{2})\s+/));
      const header=`<thead><tr>${['date','time','event','user'].map(k=>`<th>${ui(k)}</th>`).join('')}</tr></thead>`;
      pre.insertAdjacentHTML('beforebegin',`<div class="log-visual evidence-visual"><p class="visual-label">${ui('lockClock')}</p><div class="table-wrap"><table>${header}<tbody>${rows.map(c=>`<tr><td>${escapeHtml(c[0])}</td><td>${escapeHtml(c[1]||'')}</td><td>${escapeHtml(c[2]||'')}</td><td>${escapeHtml(c[3]||'')}</td></tr>`).join('')}</tbody></table></div></div>`);
      rawDetails(pre,'rawLog');
    }
  }
  if(id==='d06') {
    const table=paper.querySelector('table');
    if(table) {
      const rows=[...table.tBodies[0].rows].map(r=>[r.cells[0].textContent.trim(),parseFloat(r.cells[3].textContent)]);
      const max=Math.max(...rows.map(r=>r[1]),1);
      const points=rows.map((r,i)=>`${58+i*57},${238-r[1]/max*170}`).join(' ');
      table.closest('.table-wrap').insertAdjacentHTML('beforebegin',`<figure class="evidence-visual weather-chart"><div class="visual-label"><span>OBSERVATION</span><b>${ui('snowUnit')}</b></div><svg viewBox="0 0 744 290" role="img" aria-label="${rows.map(r=>r.join(': ')).join(', ')}"><title>${ui('snowUnit')}</title><path d="M58 238H694M58 153H694M58 68H694" class="chart-grid"/>${[0,max/2,max].map((v,i)=>svgText(25,243-i*85,v.toFixed(1),'chart-axis')).join('')}<polygon points="58,238 ${points} 685,238" fill="url(#snow-gradient)"/><defs><linearGradient id="snow-gradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#aaa89f" stop-opacity=".4"/><stop offset="1" stop-color="#aaa89f" stop-opacity=".04"/></linearGradient></defs><polyline points="${points}" class="chart-line"/>${rows.map((r,i)=>`<circle cx="${58+i*57}" cy="${238-r[1]/max*170}" r="3.5" fill="currentColor"><title>${r[0]} · ${r[1]}cm</title></circle>${i%2===0||i===rows.length-1?svgText(58+i*57,264,r[0].split(' ').at(-1),'chart-axis'):''}`).join('')}</svg><figcaption>${ui('weatherCaption')}</figcaption></figure>`);
    }
  }
  if(id==='d12') paper.classList.add('care-log');
  if(state.docs[id].category==='진술') paper.classList.add('statement-paper');
  if(id==='d31'||id==='d32') paper.classList.add('archive-paper');
}
function renderReadingView(doc,id) {
  const viewer=$('#viewer');
  const meta=state.docs[id];
  viewer.innerHTML=`<div class="reading-view"><div class="reader-toolbar"><button type="button" class="back-overview">← ${ui('home')}</button><div class="reading-controls"><button type="button" id="reading-mode">${ui(readingMode==='visual'?'original':'visual')}</button><span class="control-divider"></span><button type="button" id="type-smaller" aria-label="${ui('smaller')}">A−</button><button type="button" id="type-larger" aria-label="${ui('larger')}">A+</button></div></div><div class="file-meta"><span>${fileIcon(meta.category)} ${escapeHtml(local(meta,'category'))}</span><span>FILE ${id.toUpperCase()}</span></div><div class="paper" data-title="${escapeHtml(doc.title)}" style="--reading-size:${readingSize}px">${renderMarkdown(doc.text)}</div><nav class="reader-navigation" aria-label="${ui('files')}"></nav></div>`;
  const paper=viewer.querySelector('.paper');
  if(readingMode==='visual') enhanceDocument(paper,id);
  const headings=[...paper.querySelectorAll('h2')];
  if(headings.length>1) {
    const nav=document.createElement('nav');nav.className='document-outline';nav.setAttribute('aria-label',ui('outline'));
    headings.forEach((h,i)=>{h.id=`section-${i}`;const b=document.createElement('button');b.type='button';b.textContent=h.textContent.replace(/^\d+\.\s*/,'');b.onclick=()=>{h.scrollIntoView({block:'start',behavior:'instant'});};nav.appendChild(b);});
    viewer.querySelector('.file-meta').after(nav);
  }
  const ids=visibleIds();const at=ids.indexOf(id);
  const nav=viewer.querySelector('.reader-navigation');
  for(const [key,next] of [['previous',ids[at-1]],['next',ids[at+1]]]) if(next) {const b=document.createElement('button');b.type='button';b.innerHTML=`<small>${ui(key)}</small><span>${escapeHtml(local(state.docs[next],'title'))} ${key==='next'?'→':''}</span>`;b.onclick=()=>openDoc(next);nav.appendChild(b);}
  if(at===ids.length-1) {const b=document.createElement('button');b.type='button';b.className='stage-review';b.textContent=ui('review')+' →';b.onclick=()=>openTools('questions');nav.appendChild(b);}
  viewer.querySelector('.back-overview').onclick=showOverview;
  $('#reading-mode').onclick=()=>{readingMode=readingMode==='visual'?'original':'visual';renderReadingView(doc,id);viewer.scrollTop=0;};
  function resizeText(delta){readingSize=Math.max(16,Math.min(21,readingSize+delta));paper.style.setProperty('--reading-size',`${readingSize}px`);try{localStorage.setItem('cheongunjae.readingSize',String(readingSize));}catch{} updateTypeButtons();}
  function updateTypeButtons(){$('#type-smaller').disabled=readingSize<=16;$('#type-larger').disabled=readingSize>=21;}
  $('#type-smaller').onclick=()=>resizeText(-1);$('#type-larger').onclick=()=>resizeText(1);updateTypeButtons();
}
