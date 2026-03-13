// ─── Data ─────────────────────────────────────────────────────────────────────
//
// Three scene categories — the writer always begins at T-0 (the Cliffhanger)
// and excavates backwards:
//
//   cliffhanger — the ending: the moment of maximum suspense or uncertainty
//   portent     — a sign of the cliffhanger to come; foreshadowing
//   obfuscation — a distraction from the inevitable; a red herring
//
// T-0 is always the Cliffhanger. All other entries are portents or obfuscations.

// ─── Scene display labels ─────────────────────────────────────────────────────

const SCENE_LABELS = {
  cliffhanger: 'Cliffhanger',
  portent:     'Portent',
  obfuscation: 'Obfuscation'
}

// SVG icons for scene types — used as bullet indicators on the timeline
const SCENE_ICONS = {
  portent:     `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" viewBox="0 0 16 16" aria-label="Portent"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/></svg>`,
  obfuscation: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" viewBox="0 0 16 16" aria-label="Obfuscation"><path d="M0 .5A.5.5 0 0 1 .5 0h15a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5H14v2h1.5a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5H14v2h1.5a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5H.5a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5H2v-2H.5a.5.5 0 0 1-.5-.5v-3A.5.5 0 0 1 .5 6H2V4H.5a.5.5 0 0 1-.5-.5zM3 4v2h4.5V4zm5.5 0v2H13V4zM3 10v2h4.5v-2zm5.5 0v2H13v-2zM1 1v2h3.5V1zm4.5 0v2h5V1zm6 0v2H15V1zM1 7v2h3.5V7zm4.5 0v2h5V7zm6 0v2H15V7zM1 13v2h3.5v-2zm4.5 0v2h5v-2zm6 0v2H15v-2z"/></svg>`,
  eschaton:    `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" viewBox="0 0 16 16" aria-label="Eschaton"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/><path d="M8 13A5 5 0 1 1 8 3a5 5 0 0 1 0 10m0 1A6 6 0 1 0 8 2a6 6 0 0 0 0 12"/><path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8"/><path d="M9.5 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/></svg>`,
}

// ─── Rhetorical Figure Definitions ───────────────────────────────────────────

const FIGURE_DEFINITIONS = {
  Parallelism:  'Repeated grammatical structure across clauses or phrases.',
  Isocolon:     'Parallel clauses of exactly equal length and rhythm.',
  Tricolon:     'A series of three parallel elements building toward a point.',
  Antithesis:   'Contrasting ideas placed side by side in parallel structure.',
  Chiasmus:     'Reversed grammatical structure in successive clauses (A–B / B–A).',
  Asyndeton:    'Conjunctions omitted between clauses for speed or force.',
  Polysyndeton: 'Conjunctions repeated between clauses to accumulate weight.',
  Anaphora:     'A word or phrase repeated at the start of successive clauses.',
  Epistrophe:   'A word or phrase repeated at the end of successive clauses.',
  Symploce:     'Anaphora and epistrophe combined — repetition at both ends.',
  Anadiplosis:  'The last word of one clause repeated at the start of the next.',
  Ellipsis:     'Deliberate omission of words understood from context.',
  Zeugma:       'One word governs two or more others in different senses.',
}

function updateFigureDef() {
  const val   = document.getElementById('figure-select')?.value
  const defEl = document.getElementById('figure-def')
  if (defEl) defEl.textContent = FIGURE_DEFINITIONS[val] || ''
}

function selectRandomFigure() {
  const keys   = Object.keys(FIGURE_DEFINITIONS)
  const select = document.getElementById('figure-select')
  if (select) {
    select.value = keys[Math.floor(Math.random() * keys.length)]
    updateFigureDef()
  }
}

// Dynamic textarea placeholder changes to match the selected scene
const COMPOSER_PLACEHOLDER = {
  portent:     'What fortold the eschaton',
  obfuscation: 'What distracts from the eschaton'
}

// ─── State ────────────────────────────────────────────────────────────────────

let currentScene   = null
let editingEntryId = null   // non-null while editing an existing entry

// ─── Stretch Goals ────────────────────────────────────────────────────────────

// localStorage: restore last scene on load
function saveScene(sceneType) {
  localStorage.setItem('narrator_scene_v3', sceneType)
}

function loadSavedScene() {
  return localStorage.getItem('narrator_scene_v3')
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────

function setActiveScene(sceneType) {
  // Update button states
  document.querySelectorAll('.scene-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.scene === sceneType)
  })
}

function selectScene(sceneType) {
  // Cliffhanger removed — any legacy path that passes it falls back to portent
  if (sceneType === 'cliffhanger') sceneType = 'portent'
  currentScene = sceneType
  setActiveScene(sceneType)
  saveScene(sceneType)
  // Body class drives the reckoning's distinct prompt styling
  document.body.className = `scene--${sceneType}`
  // Tune placeholder to the scene
  document.getElementById('entry-text').placeholder = COMPOSER_PLACEHOLDER[sceneType] || 'Write the scene...'
}

// ─── Event Listeners ──────────────────────────────────────────────────────────

document.querySelectorAll('.scene-btn').forEach(button => {
  button.addEventListener('click', () => {
    selectScene(button.dataset.scene)
  })
})

// ─── Entry Storage ────────────────────────────────────────────────────────────

function loadEntries() {
  try { return JSON.parse(localStorage.getItem('narrator_entries') || '[]') }
  catch { return [] }
}

function persistEntries(entries) {
  localStorage.setItem('narrator_entries', JSON.stringify(entries))
}

// ─── Title Storage ────────────────────────────────────────────────────────────

function loadTitle() {
  return localStorage.getItem('narrator_title') || ''
}

function saveTitle(text) {
  localStorage.setItem('narrator_title', text)
}

function initTitle() {
  const el = document.getElementById('story-title')
  if (!el) return
  el.textContent = loadTitle()
  el.addEventListener('input', () => saveTitle(el.textContent.trim()))
  // Prevent newlines — title stays on one line
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); el.blur() }
  })
}

// ─── Thread State ─────────────────────────────────────────────────────────────

// Which climax are we currently writing toward?
// null = next save creates a new thread.
let currentClimaxId = null

// Non-null when the composer is in nested (drill) mode.
// Stores the id of the entry being drilled into (the local T-0 reference).
let currentEschaton = null

// Saved climaxId from before a drill — restored when surfacing back to root.
let _predrillClimaxId = null

// Entry ids whose sub-thread is currently collapsed in the timeline.
const _collapsedEntries = new Set()

// Tracks which entry is being dragged — set on dragstart, cleared on dragend.
let draggedEntryId = null

// Page state
let currentPage          = 'timeline'
let draggingNewEntry     = false
let pendingInsertPosition = null  // { targetId, insertBefore } | null

// ─── Page Switching ───────────────────────────────────────────────────────────

function switchPage(page) {
  currentPage = page
  document.getElementById('page-entry').hidden    = (page !== 'entry')
  document.getElementById('page-timeline').hidden = (page !== 'timeline')
  document.querySelectorAll('.page-toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === page)
  })
  if (page === 'entry')    renderEntryContext()
  if (page === 'timeline') renderTimeline()
}

// ─── Entry Context (prev/next around composer) ────────────────────────────────

function updateEschatonRef() {
  const el   = document.getElementById('eschaton-ref')
  const text = document.getElementById('eschaton-ref-text')
  if (!el) return

  let t0 = null
  const entries = loadEntries()

  if (currentClimaxId) {
    t0 = entries.find(e => e.climaxId === currentClimaxId && e.timelinePosition === 0 && !e.eschaton)
  } else if (!currentEschaton) {
    // No active thread or drill — fallback to most recent thread's T-0
    const climaxes = entries
      .filter(e => e.climaxId === e.id)
      .sort((a, b) => b.createdAt - a.createdAt)
    if (climaxes.length) {
      t0 = entries.find(e => e.climaxId === climaxes[0].id && e.timelinePosition === 0 && !e.eschaton)
    }
  } else if (currentEschaton) {
    // Drilling — walk up the eschaton chain to find the root-level entry
    let cur = entries.find(e => e.id === currentEschaton)
    while (cur && cur.eschaton) {
      cur = entries.find(e => e.id === cur.eschaton)
    }
    if (cur) {
      t0 = entries.find(e => e.climaxId === cur.climaxId && e.timelinePosition === 0 && !e.eschaton)
    }
  }

  const hasEntries = entries.length > 0
  if (t0) {
    text.textContent = t0.text
    el.hidden = false
  } else if (hasEntries) {
    // Thread exists but T-0 not yet written — keep block visible, empty text
    text.textContent = ''
    el.hidden = false
  } else {
    el.hidden = true
  }
}

function renderEntryContext() {
  const prevEl = document.getElementById('entry-prev')
  const nextEl = document.getElementById('entry-next')
  if (!prevEl || !nextEl) return

  const entries = loadEntries()
  let prevEntry = null
  let nextEntry = null

  if (pendingInsertPosition) {
    // New entry will be inserted at a specific position — show surrounding context
    const target = entries.find(e => e.id === pendingInsertPosition.targetId)
    if (target) {
      const thread = entries
        .filter(e => target.eschaton
          ? e.eschaton === target.eschaton
          : e.climaxId === target.climaxId && !e.eschaton)
        .sort((a, b) => a.timelinePosition - b.timelinePosition)
      const tIdx = thread.findIndex(e => e.id === target.id)
      if (pendingInsertPosition.insertBefore) {
        prevEntry = tIdx > 0 ? thread[tIdx - 1] : null
        nextEntry = target
      } else {
        prevEntry = target
        nextEntry = tIdx < thread.length - 1 ? thread[tIdx + 1] : null
      }
    }
  } else if (editingEntryId) {
    const editing = entries.find(e => e.id === editingEntryId)
    if (editing) {
      const thread = entries
        .filter(e => editing.eschaton
          ? e.eschaton === editing.eschaton
          : e.climaxId === editing.climaxId && !e.eschaton)
        .sort((a, b) => a.timelinePosition - b.timelinePosition)
      const idx = thread.findIndex(e => e.id === editingEntryId)
      prevEntry = idx > 0 ? thread[idx - 1] : null
      nextEntry = idx < thread.length - 1 ? thread[idx + 1] : null
    }
  } else {
    // New entry — show the current earliest entry (T-N) as "after" context
    let climaxId = currentClimaxId
    const eschaton = currentEschaton
    // Fallback: if no thread is active, auto-pick the most recent one
    if (!climaxId && !eschaton) {
      const climaxes = entries
        .filter(e => e.climaxId === e.id)
        .sort((a, b) => b.createdAt - a.createdAt)
      if (climaxes.length) climaxId = climaxes[0].id
    }
    if (climaxId || eschaton) {
      const thread = entries
        .filter(e => eschaton
          ? e.eschaton === eschaton
          : e.climaxId === climaxId && !e.eschaton)
        .sort((a, b) => a.timelinePosition - b.timelinePosition)
      nextEntry = thread.length > 0 ? thread[0] : null
    }
  }

  if (prevEntry) {
    prevEl.innerHTML = renderContextEntry(prevEntry, 'before')
    prevEl.hidden = false
  } else {
    prevEl.hidden = true
  }

  if (nextEntry) {
    nextEl.innerHTML = renderContextEntry(nextEntry, 'after')
    nextEl.hidden = false
  } else {
    nextEl.hidden = true
  }


  updateEschatonRef()
}

function renderContextEntry(entry, direction) {
  const pos      = formatPosition(entry.timelinePosition)
  const scene    = SCENE_LABELS[entry.sceneType] || entry.sceneType
  const preview  = entry.text.length > 220
    ? entry.text.slice(0, 220).trimEnd() + '…'
    : entry.text
  const label    = direction === 'before' ? 'Before' : 'After'
  return `
    <div class="ctx-entry" data-scene="${entry.sceneType}" data-entry-id="${entry.id}">
      <div class="ctx-direction">${label}</div>
      <div class="ctx-meta">
        <span class="ctx-pos">${pos}</span>
        <span class="ctx-scene">${scene}</span>
      </div>
      <p class="ctx-text">${escapeHtml(preview)}</p>
    </div>`
}

// Show/hide the "New Entry" drag chip based on whether a thread is active
function updateNewEntryChip() {
  const chip = document.getElementById('new-entry-drag')
  if (chip) chip.hidden = !currentClimaxId
}

function initCurrentClimaxId() {
  const entries = loadEntries()
  const climaxes = entries
    .filter(e => e.climaxId === e.id)
    .sort((a, b) => b.createdAt - a.createdAt)
  if (climaxes.length) currentClimaxId = climaxes[0].id
}

function startNewStory() {
  currentClimaxId = null
  selectScene('portent')
  updateThreadStatus()
  updateSceneNav()
}

// ─── Scene Nav State ──────────────────────────────────────────────────────────
//
// The Cliffhanger button is only available when no T-0 exists yet.
// Once the climax is written it disappears — you can only excavate backwards.

function updateSceneNav() {
  // Cliffhanger scene removed — all entries are portent or obfuscation.
  // Guard: if somehow still on cliffhanger (legacy saved state), switch to portent.
  if (currentScene === 'cliffhanger') selectScene('portent')
}

// ─── Entry CRUD ───────────────────────────────────────────────────────────────

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function createEntry(sceneType, subject, rhetoricalFigure, text, eschaton = null) {
  const entries  = loadEntries()
  const id       = generateId()
  let climaxId, timelinePosition

  if (!currentClimaxId) {
    // First entry of a new thread — it IS the climax (T-0, labeled "UR ESCHATON").
    // sceneType is preserved as-is (portent or obfuscation); the UR ESCHATON label
    // is applied purely at render time based on timelinePosition === 0.
    climaxId         = id
    currentClimaxId  = id
    timelinePosition = 0
  } else {
    climaxId = currentClimaxId
    // Count how many entries already exist in this thread
    const threadLength   = entries.filter(e => e.climaxId === currentClimaxId).length
    timelinePosition     = -threadLength  // -1, -2, -3 …
  }

  const entry = {
    id,
    climaxId,
    eschaton,
    sceneType,
    timelinePosition,
    subject:          subject.trim(),
    rhetoricalFigure: rhetoricalFigure.trim(),
    text,
    createdAt: Date.now()
  }

  entries.push(entry)
  persistEntries(entries)
  return entry
}

// ─── Drill Helpers ────────────────────────────────────────────────────────

// Returns the nesting level when drilling into an entry.
// Root thread = Level 1; drilling into a root entry = Level 2; deeper = Level 3+
function getDrillLevel(entries, entryId) {
  let level   = 2
  let current = entries.find(e => e.id === entryId)
  while (current && current.eschaton) {
    level++
    current = entries.find(e => e.id === current.eschaton)
  }
  return level
}

function drillIntoEntry(entryId) {
  const entries = loadEntries()
  const entry   = entries.find(e => e.id === entryId)
  if (!entry) return

  // Clear any in-progress edit so the composer starts fresh for the new child entry
  editingEntryId = null
  entryTextarea.value        = ''
  entryTextarea.style.height = ''
  document.getElementById('subject-input').value = ''
  document.getElementById('figure-select').value = ''
  document.getElementById('save-btn').textContent = 'Save Entry'
  const wcEl = document.getElementById('composer-word-count')
  if (wcEl) wcEl.textContent = '0 words'

  _predrillClimaxId    = currentClimaxId   // save so surfaceUp can restore it
  currentEschaton = entryId
  currentClimaxId      = null              // next save starts a fresh sub-thread

  const drillRefText = document.getElementById('drill-ref-text')
  const drillRef     = document.getElementById('drill-ref')
  if (drillRef && drillRefText) {
    drillRefText.textContent = entry.text
    drillRef.hidden = false
  }

  const surfaceBtn = document.getElementById('surface-btn')
  if (surfaceBtn) surfaceBtn.hidden = false

  selectScene('portent')
  updateSceneNav()
  updateThreadStatus()
  renderTimeline()
  switchPage('entry')

  document.getElementById('composer').scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  entryTextarea.focus()
}

function surfaceUp() {
  if (currentEschaton === null) return

  currentClimaxId      = _predrillClimaxId
  currentEschaton = null
  _predrillClimaxId    = null
  if (!currentClimaxId) initCurrentClimaxId()

  const drillRef   = document.getElementById('drill-ref')
  const surfaceBtn = document.getElementById('surface-btn')
  if (drillRef)   drillRef.hidden = true
  if (surfaceBtn) surfaceBtn.hidden = true

  updateSceneNav()
  updateThreadStatus()
  renderTimeline()
  renderEntryContext()
}

// ─── Thread Status UI ─────────────────────────────────────────────────────────

function updateThreadStatus() {
  const el = document.getElementById('thread-status')
  if (!el) return

  if (editingEntryId) {
    const entries = loadEntries()
    const entry   = entries.find(e => e.id === editingEntryId)
    if (entry) {
      el.textContent  = `Editing ${formatPosition(entry.timelinePosition)} · ${SCENE_LABELS[entry.sceneType]}`
      el.dataset.mode = 'editing'
      return
    }
  }

  if (currentEschaton !== null) {
    const entries = loadEntries()
    const parent  = entries.find(e => e.id === currentEschaton)
    const level   = getDrillLevel(entries, currentEschaton)
    const preview = parent
      ? parent.text.slice(0, 40).trimEnd() + (parent.text.length > 40 ? '…' : '')
      : ''
    el.textContent  = `Level ${level} · drilling into: "${preview}"`
    el.dataset.mode = 'drill'
    return
  }

  if (!currentClimaxId) {
    el.textContent  = 'New story — first entry will become the climax (T-0).'
    el.dataset.mode = 'new'
    return
  }

  const entries = loadEntries()
  const thread  = entries.filter(e => e.climaxId === currentClimaxId)
  // Use the entry currently AT position 0 — stays correct after reordering
  const climax  = thread.find(e => e.timelinePosition === 0)
  const preview = climax
    ? `"${climax.text.slice(0, 48).trimEnd()}${climax.text.length > 48 ? '…' : ''}"`
    : ''
  const count = thread.length
  const next  = `T-${count}`

  el.textContent  = `Thread · ${count} ${count === 1 ? 'entry' : 'entries'} · next: ${next} · ${preview}`
  el.dataset.mode = 'active'
}

// ─── Timeline Render ──────────────────────────────────────────────────────
//
// renderEntryWithChildren renders one entry plus any nested sub-entries.
// childrenOf maps eschaton → sorted child entries.
// isFirst / isLast govern reorder-button disabled states within that level.

// parentPosLabel: the position string of the immediate eschaton (null at root level).
//   e.g. "1" when the eschaton is T-1, "1.2" when the eschaton is T-1.2.
// siblingIndex: 1-based rank of this entry among its siblings (null at root level).
function renderEntryWithChildren(entry, childrenOf, isFirst, isLast, parentPosLabel = null, siblingIndex = null) {
  const children    = childrenOf[entry.id] || []
  const hasChildren = children.length > 0
  const collapsed   = _collapsedEntries.has(entry.id)
  const isEditing   = entry.id === editingEntryId
  const wc          = countWords(entry.text)

  // "UR ESCHATON" and climax styling only for the root-level T-0 (never sub-level T-0)
  const isClimax = entry.timelinePosition === 0 && !entry.eschaton

  // Position label and scene badge
  // Sub-entries: T-X.Y  (X = parent's pos string, Y = 1-based rank among siblings)
  // Root entries: T-N   (standard, "UR ESCHATON" at T-0)
  const pos        = parentPosLabel !== null
    ? `T-${parentPosLabel}.${siblingIndex}`
    : formatPosition(entry.timelinePosition)
  // Bullet-position icon: scene icon for portent/obfuscation, eschaton icon for climax
  const bulletSvg = isClimax ? SCENE_ICONS.eschaton : (SCENE_ICONS[entry.sceneType] ?? '')
  const bulletIcon = `<span class="tl-scene-icon">${bulletSvg}</span>`
  // Meta-row label: only shown for the climax (ESCHATON text)
  const sceneContent = isClimax ? 'ESCHATON' : ''

  // Position label prefix passed down to this entry's children.
  // Root T-3 → prefix "3"  (children become T-3.1, T-3.2 …)
  // Sub  T-1.2 → prefix "1.2"  (children become T-1.2.1, T-1.2.2 …)
  const childPosLabel = parentPosLabel !== null
    ? `${parentPosLabel}.${siblingIndex}`
    : String(Math.abs(entry.timelinePosition))


  const collapseBtn = hasChildren
    ? `<button class="collapse-btn" draggable="false" data-action="collapse" data-entry-id="${entry.id}" aria-label="${collapsed ? 'Expand' : 'Collapse'} sub-thread">${collapsed ? '▶' : '▼'}</button>`
    : ''

  const bodyHtml = isEditing
    ? `<div class="tl-inline-edit">
        <div class="tl-inline-scene-row">
          <button class="tl-inline-scene-btn${entry.sceneType === 'portent'     ? ' active' : ''}" draggable="false" data-action="inline-scene" data-scene="portent"     data-entry-id="${entry.id}">Portent</button>
          <button class="tl-inline-scene-btn${entry.sceneType === 'obfuscation' ? ' active' : ''}" draggable="false" data-action="inline-scene" data-scene="obfuscation" data-entry-id="${entry.id}">Obfuscation</button>
        </div>
        <textarea class="tl-inline-textarea" id="tl-inline-textarea" draggable="false">${escapeHtml(entry.text)}</textarea>
        <div class="tl-inline-footer">
          <span class="tl-inline-wc" id="tl-inline-wc">${wc} ${wc === 1 ? 'word' : 'words'}</span>
          <button class="tl-inline-update-btn" draggable="false" data-action="inline-save" data-entry-id="${entry.id}">Update</button>
          <button class="tl-inline-cancel-btn" draggable="false" data-action="inline-cancel">✕</button>
        </div>
      </div>`
    : `<p class="tl-text">${escapeHtml(entry.text)}</p>`

  const entryHtml = `
    <div class="tl-entry${isClimax ? ' tl-entry--climax' : ''}${isEditing ? ' tl-entry--editing' : ''}${hasChildren ? ' tl-entry--has-children' : ''}" draggable="${isEditing ? 'false' : 'true'}" data-scene="${entry.sceneType}" data-entry-id="${entry.id}">
      ${bulletIcon}
      <div class="tl-meta">
        ${collapseBtn}
        <span class="tl-pos">${pos}</span>
        ${sceneContent ? `<span class="tl-scene">${sceneContent}</span>` : ''}
        <div class="tl-meta-right">
          <span class="tl-wordcount">${wc}w</span>
          <button class="drill-btn" draggable="false" data-action="drill" data-entry-id="${entry.id}" aria-label="Drill into entry">drill</button>
          <div class="tl-reorder">
            <button class="reorder-btn" draggable="false" data-action="up" data-entry-id="${entry.id}"
              ${isFirst ? 'disabled' : ''} aria-label="Move earlier in story">↑</button>
            <button class="reorder-btn" draggable="false" data-action="down" data-entry-id="${entry.id}"
              ${isLast ? 'disabled' : ''} aria-label="Move later in story">↓</button>
          </div>
        </div>
      </div>
      ${bodyHtml}
    </div>`

  if (hasChildren && !collapsed) {
    const childHtml = children
      .map((child, i) => renderEntryWithChildren(
        child, childrenOf, i === 0, i === children.length - 1,
        childPosLabel, children.length - i   // .1 = closest to eschaton (bottom), .N = furthest (top)
      ))
      .join('')
    return `<div class="tl-subthread">${childHtml}</div>` + entryHtml
  }

  return entryHtml
}

function countWords(text) {
  const trimmed = String(text).trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ─── Inline Edit (timeline) ───────────────────────────────────────────────────

function startInlineEdit(entryId) {
  editingEntryId = entryId
  renderTimeline()
  requestAnimationFrame(() => {
    const ta = document.getElementById('tl-inline-textarea')
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = ta.scrollHeight + 'px'
    ta.focus()
    ta.selectionStart = ta.selectionEnd = ta.value.length
  })
}

// ─── Entry Edit (entry page) ──────────────────────────────────────────────────

function startEditEntry(entryId) {
  const entries = loadEntries()
  const entry   = entries.find(e => e.id === entryId)
  if (!entry) return

  editingEntryId = entryId

  switchPage('entry')  // shows entry page, calls renderEntryContext with editingEntryId set

  // Switch scene to match the entry so the prompt is contextually relevant
  selectScene(entry.sceneType)

  // Load content into composer
  document.getElementById('subject-input').value = entry.subject          || ''
  document.getElementById('figure-select').value = entry.rhetoricalFigure || ''
  entryTextarea.value        = entry.text
  entryTextarea.style.height = 'auto'
  entryTextarea.style.height = entryTextarea.scrollHeight + 'px'

  // Update live word count
  const n    = countWords(entry.text)
  const wcEl = document.getElementById('composer-word-count')
  if (wcEl) wcEl.textContent = `${n} ${n === 1 ? 'word' : 'words'}`

  // Flip save button to edit-mode label (Esc cancels)
  document.getElementById('save-btn').textContent = 'Update Entry'

  updateThreadStatus()
  renderTimeline()

  // Pull composer into view
  document.getElementById('composer').scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  updateFigureDef()
}


function cancelEdit() {
  editingEntryId = null

  entryTextarea.value        = ''
  entryTextarea.style.height = ''
  document.getElementById('subject-input').value = ''
  selectRandomFigure()

  const wcEl = document.getElementById('composer-word-count')
  if (wcEl) wcEl.textContent = '0 words'

  document.getElementById('save-btn').textContent = 'Save Entry'

  updateThreadStatus()
  renderTimeline()
  renderEntryContext()
  switchPage('timeline')
}

// ─── Start Fresh ──────────────────────────────────────────────────────────────
//
// Wipes all entries and resets state. The confirmation panel shown before this
// runs nudges the writer to export first — but doesn't require it.

function startFresh() {
  // Clear all persisted data
  localStorage.removeItem('narrator_entries')
  localStorage.removeItem('narrator_scene_v3')
  localStorage.removeItem('narrator_title')
  const titleEl = document.getElementById('story-title')
  if (titleEl) titleEl.textContent = ''

  // Reset all runtime state
  currentClimaxId      = null
  editingEntryId       = null
  currentEschaton = null
  _predrillClimaxId    = null
  _collapsedEntries.clear()

  const drillRef   = document.getElementById('drill-ref')
  const surfaceBtn = document.getElementById('surface-btn')
  if (drillRef)   drillRef.hidden = true
  if (surfaceBtn) surfaceBtn.hidden = true

  // Reset composer to a clean slate
  entryTextarea.value        = ''
  entryTextarea.style.height = ''
  document.getElementById('subject-input').value = ''
  selectRandomFigure()
  const wcEl = document.getElementById('composer-word-count')
  if (wcEl) wcEl.textContent = '0 words'
  document.getElementById('save-btn').textContent = 'Save Entry'

  // Reset milestones so they can be earned again from scratch
  _shownWordMilestones.clear()
  _shownEntryMilestones.clear()

  playReset()
  selectScene('portent')
  updateThreadStatus()
  renderTimeline()
  updateSceneNav()
  refreshHud()
  renderEntryContext()
  updateNewEntryChip()
}

function formatPosition(pos) {
  return pos === 0 ? 'T-0' : `T-${Math.abs(pos)}`
}

function getThreads(entries) {
  const map = {}
  entries.forEach(e => {
    if (!map[e.climaxId]) map[e.climaxId] = []
    map[e.climaxId].push(e)
  })
  // Within each thread: chronological order, earliest → climax
  Object.values(map).forEach(thread =>
    thread.sort((a, b) => a.timelinePosition - b.timelinePosition)
  )
  return map
}

function renderTimeline() {
  const entries   = loadEntries()
  const container = document.getElementById('tl-container')
  if (!container) return

  updateNewEntryChip()

  if (!entries.length) {
    container.innerHTML = `
      <div class="tl-empty-state">
        <p class="tl-empty-state-label">No entries yet</p>
        <button class="tl-new-eschaton-btn" id="tl-new-eschaton-btn">
          Write the Eschaton
        </button>
        <p class="tl-empty-state-hint">Your first entry becomes the ending — T&#8209;0</p>
      </div>`
    document.getElementById('tl-new-eschaton-btn').addEventListener('click', () => switchPage('entry'))
    return
  }

  // Build parent→children lookup for recursive rendering
  const childrenOf = {}
  entries.forEach(e => {
    if (e.eschaton) {
      if (!childrenOf[e.eschaton]) childrenOf[e.eschaton] = []
      childrenOf[e.eschaton].push(e)
    }
  })
  Object.values(childrenOf).forEach(arr => arr.sort((a, b) => a.timelinePosition - b.timelinePosition))

  // Root-only entries drive thread grouping — sub-entries render inline via renderEntryWithChildren
  const rootEntries = entries.filter(e => !e.eschaton)
  const threads     = getThreads(rootEntries)

  // Threads ordered newest-first by climax createdAt
  const sortedIds = Object.keys(threads).sort((a, b) => {
    const aC = threads[a].find(e => e.id === e.climaxId)
    const bC = threads[b].find(e => e.id === e.climaxId)
    return (bC?.createdAt ?? 0) - (aC?.createdAt ?? 0)
  })

  container.innerHTML = sortedIds.map(climaxId => {
    const thread = threads[climaxId]
    const rows   = thread.map((entry, idx) =>
      renderEntryWithChildren(entry, childrenOf, idx === 0, idx === thread.length - 1)
    ).join('')
    return `<div class="tl-thread" data-climax-id="${climaxId}">${rows}</div>`
  }).join('')
}

// ─── Reorder ──────────────────────────────────────────────────────────────────
//
// Swaps the timelinePosition of two adjacent entries within a thread.
// direction 'up'   → move this entry earlier in the story (away from climax)
// direction 'down' → move this entry later  in the story (toward  climax)
//
// The sorted display order is T-n at top → T-0 at bottom, so:
//   'up'   = swap with the entry above  (idx - 1, more negative position)
//   'down' = swap with the entry below  (idx + 1, less negative position)

function reorderEntry(entryId, direction) {
  const entries = loadEntries()
  const entry   = entries.find(e => e.id === entryId)
  if (!entry) return

  // Sub-entries group by shared eschaton; root entries group by shared climaxId.
  const thread = entries
    .filter(e => entry.eschaton
      ? e.eschaton === entry.eschaton
      : e.climaxId === entry.climaxId && !e.eschaton)
    .sort((a, b) => a.timelinePosition - b.timelinePosition)

  const idx      = thread.findIndex(e => e.id === entryId)
  const swapIdx  = direction === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= thread.length) return

  const other     = thread[swapIdx]
  const mainEntry = entries.find(e => e.id === entryId)
  const mainOther = entries.find(e => e.id === other.id)

  // Swap positions — destructuring assignment, a clean JS pattern
  ;[mainEntry.timelinePosition, mainOther.timelinePosition] =
    [mainOther.timelinePosition, mainEntry.timelinePosition]

  persistEntries(entries)
  renderTimeline()
  updateThreadStatus()
}

// ─── Drag-and-Drop Reorder ────────────────────────────────────────────────────
//
// Moves an entry to a specific position in its thread.
// Unlike reorderEntry (adjacent swap), this supports arbitrary repositioning
// from drag-and-drop. Re-assigns all positions sequentially after the move.

function moveEntryToPosition(draggedId, targetId, insertBefore) {
  if (draggedId === targetId) return
  const entries = loadEntries()
  const dragged = entries.find(e => e.id === draggedId)
  if (!dragged) return

  // Sub-entries group by shared eschaton; root entries group by shared climaxId.
  const thread = entries
    .filter(e => dragged.eschaton
      ? e.eschaton === dragged.eschaton
      : e.climaxId === dragged.climaxId && !e.eschaton)
    .sort((a, b) => a.timelinePosition - b.timelinePosition)

  // Splice dragged out, then insert at new position
  const fromIdx = thread.findIndex(e => e.id === draggedId)
  thread.splice(fromIdx, 1)

  const toIdx = thread.findIndex(e => e.id === targetId)
  if (toIdx === -1) return
  thread.splice(insertBefore ? toIdx : toIdx + 1, 0, dragged)

  // Re-assign positions: last item = T-0, counting back from there
  const len = thread.length
  thread.forEach((entry, i) => {
    entries.find(e => e.id === entry.id).timelinePosition = -(len - 1 - i)
  })

  persistEntries(entries)
  renderTimeline()
  updateThreadStatus()
}

// ─── Export / Import ──────────────────────────────────────────────────────────

function exportStory() {
  const entries = loadEntries()
  if (!entries.length) return

  const title   = loadTitle()
  const payload = { title, entries }
  const json    = JSON.stringify(payload, null, 2)
  const blob    = new Blob([json], { type: 'application/json' })
  const url     = URL.createObjectURL(blob)
  const a       = document.createElement('a')
  a.href        = url
  a.download    = `narrator-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function exportMarkdown() {
  const entries = loadEntries()
  if (!entries.length) return

  // Build a lookup: eschaton → child entries, sorted earliest → T-0
  const childrenOf = {}
  entries.forEach(e => {
    if (e.eschaton) {
      if (!childrenOf[e.eschaton]) childrenOf[e.eschaton] = []
      childrenOf[e.eschaton].push(e)
    }
  })
  Object.values(childrenOf).forEach(arr =>
    arr.sort((a, b) => a.timelinePosition - b.timelinePosition)
  )

  // Recursive expansion: a drilled entry's children appear immediately before it.
  // Each child is itself expanded first, so nesting compiles correctly at any depth.
  function expand(entry) {
    const children = childrenOf[entry.id] || []
    return [...children.flatMap(c => expand(c)), entry]
  }

  const threads = getThreads(entries)

  // Only render root-level threads — sub-thread entries are woven in via expand().
  const sortedIds = Object.keys(threads)
    .filter(climaxId => {
      const climax = threads[climaxId].find(e => e.id === climaxId)
      return !climax?.eschaton
    })
    .sort((a, b) => {
      const aC = threads[a].find(e => e.id === e.climaxId)
      const bC = threads[b].find(e => e.id === e.climaxId)
      return (bC?.createdAt ?? 0) - (aC?.createdAt ?? 0)
    })

  // Each thread: entries sorted earliest → T-0, each recursively expanded.
  // Output is pure prose — no positions, scene types, or metadata.
  const threadBlocks = sortedIds.map(climaxId =>
    threads[climaxId]
      .flatMap(e => expand(e))
      .map(e => e.text.trim())
      .join('\n\n')
  )

  const title  = loadTitle()
  const header = title ? `# ${title}\n\n` : ''
  const md     = header + threadBlocks.join('\n\n\n')
  const blob   = new Blob([md], { type: 'text/markdown' })
  const url    = URL.createObjectURL(blob)
  const a      = document.createElement('a')
  a.href       = url
  a.download   = `narrator-${new Date().toISOString().slice(0, 10)}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function importStory(file) {
  if (!file) return
  const reader = new FileReader()

  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result)

      // Support both old format (bare array) and new format ({ title, entries })
      const importedEntries = Array.isArray(parsed) ? parsed : parsed.entries
      const importedTitle   = Array.isArray(parsed) ? null : (parsed.title || null)

      if (!Array.isArray(importedEntries)) throw new Error('Expected an array of entries')

      const existing    = loadEntries()
      const existingIds = new Set(existing.map(e => e.id))

      // Validate shape, skip duplicates, normalise eschaton (absent in older exports)
      const valid = importedEntries
        .filter(e =>
          e.id && e.climaxId && e.sceneType &&
          typeof e.text === 'string' &&
          !existingIds.has(e.id)
        )
        .map(e => ({ ...e, eschaton: e.eschaton ?? null }))

      if (!valid.length && !importedTitle) return

      persistEntries([...existing, ...valid])

      // Restore title if the import carries one and nothing is set locally
      if (importedTitle && !loadTitle()) {
        saveTitle(importedTitle)
        const titleEl = document.getElementById('story-title')
        if (titleEl) titleEl.textContent = importedTitle
      }

      initCurrentClimaxId()
      updateThreadStatus()
      renderTimeline()
      updateNewEntryChip()
      renderEntryContext()
      refreshHud()
    } catch (err) {
      console.error('Narrator import failed:', err.message)
      // A future iteration could show an inline error state here
    }
  }

  reader.readAsText(file)
}

// ─── Sound Engine ─────────────────────────────────────────────────────────────
//
// All sounds are synthesised with the Web Audio API — no files to load.
// Tones are kept short and musical so they reward without startling.

let _audioCtx    = null
let _soundEnabled = localStorage.getItem('narrator_sfx') !== 'false'
let _lastTapTime  = 0   // throttle keystroke sounds
let _prevTextLen  = 0   // track textarea length to detect insertions vs deletions

function getAudio() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  return _audioCtx
}

// Play a single sine tone: freq Hz, dur seconds, vol 0–1, startOffset seconds
function tone(freq, dur, vol = 0.20, startOffset = 0) {
  if (!_soundEnabled) return
  try {
    const ctx  = getAudio()
    const t    = ctx.currentTime + startOffset
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type   = 'sine'
    osc.frequency.setValueAtTime(freq, t)
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(vol, t + 0.012)        // soft attack
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)  // natural decay
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(t)
    osc.stop(t + dur + 0.01)
  } catch (e) { /* silent if AudioContext is blocked */ }
}

// Soft key tap — each letter typed, throttled, slightly randomised pitch
function playKeyTap() {
  const now = Date.now()
  if (now - _lastTapTime < 52) return   // max ~19 taps/sec
  _lastTapTime = now
  tone(820 + Math.random() * 340, 0.032, 0.042)
}

// Sentence-end chime — G5 → C6, light and complete-feeling
function playPunctuate() {
  tone(783.99, 0.18, 0.11)
  tone(1046.5, 0.32, 0.08, 0.13)
}

// Entry saved — two-note ascending fifth (C5 → G5)
function playSave() {
  tone(523.25, 0.30, 0.18)
  tone(783.99, 0.44, 0.14, 0.11)
}

// Milestone hit — rising major-chord arpeggio (C5 → E5 → G5 → C6)
function playMilestone() {
  tone(523.25, 0.22, 0.18)
  tone(659.25, 0.24, 0.16, 0.11)
  tone(783.99, 0.30, 0.16, 0.22)
  tone(1046.5, 0.60, 0.14, 0.36)
}

// Soft reset — descending pair (A4 → F4)
function playReset() {
  tone(440.00, 0.26, 0.13, 0)
  tone(349.23, 0.40, 0.10, 0.17)
}

// SFX toggle — persisted to localStorage
function updateSfxToggle() {
  const btn = document.getElementById('sfx-toggle')
  if (!btn) return
  btn.dataset.muted = !_soundEnabled
  btn.setAttribute('aria-label', _soundEnabled ? 'Sound on — click to mute' : 'Sound muted — click to unmute')
}

function toggleSound() {
  _soundEnabled = !_soundEnabled
  localStorage.setItem('narrator_sfx', _soundEnabled)
  updateSfxToggle()
}

// ─── Scoring ──────────────────────────────────────────────────────────────────
//
// Milestones follow the Fibonacci sequence — the gap between celebrations
// grows naturally, so early wins feel frequent and later ones feel earned.

const WORD_MILESTONES  = [13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765, 10946]
const ENTRY_MILESTONES = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89]

const _shownWordMilestones  = new Set()
const _shownEntryMilestones = new Set()

// Read current totals directly from stored entries
function getTotals() {
  const entries = loadEntries()
  const words   = entries.reduce((sum, e) => sum + countWords(e.text), 0)
  const avg     = entries.length ? Math.round(words / entries.length) : 0
  return { words, entries: entries.length, avg }
}

// Silently sync both counters — used on init and after reset
function refreshHud() {
  const { words, entries, avg } = getTotals()
  const wEl = document.getElementById('score-words')
  const eEl = document.getElementById('score-entries')
  if (wEl) wEl.textContent = words.toLocaleString()
  if (eEl) eEl.textContent = entries
  const fwEl  = document.getElementById('footer-words')
  const feEl  = document.getElementById('footer-entries')
  const faEl  = document.getElementById('footer-avg')
  if (fwEl) fwEl.textContent = words.toLocaleString()
  if (feEl) feEl.textContent = entries
  if (faEl) faEl.textContent = avg
}

// Update both counters with spring animations and a "+N words" toast
function updateHud(prev, next) {
  const wEl = document.getElementById('score-words')
  const eEl = document.getElementById('score-entries')

  if (wEl) {
    wEl.textContent = next.words.toLocaleString()
    if (next.words > prev.words) {
      wEl.classList.remove('score-bump')
      void wEl.offsetWidth
      wEl.classList.add('score-bump')
      showWordsToast(next.words - prev.words)
    }
  }

  if (eEl) {
    eEl.textContent = next.entries
    if (next.entries > prev.entries) {
      eEl.classList.remove('score-bump')
      void eEl.offsetWidth
      eEl.classList.add('score-bump')
    }
  }

  const fwEl = document.getElementById('footer-words')
  const feEl = document.getElementById('footer-entries')
  const faEl = document.getElementById('footer-avg')
  if (fwEl) fwEl.textContent = next.words.toLocaleString()
  if (feEl) feEl.textContent = next.entries
  if (faEl) faEl.textContent = next.avg
}

// Floating "+Nw" that pops up from the save button
function showWordsToast(delta) {
  const btn = document.getElementById('save-btn')
  if (!btn) return
  const rect = btn.getBoundingClientRect()
  const el   = document.createElement('span')
  el.className   = 'pts-toast'
  el.textContent = `+${delta}w`
  el.style.left  = `${rect.left + rect.width * 0.5}px`
  el.style.top   = `${rect.top}px`
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 960)
}

// Banner that slides in from the top on milestone
function showMilestoneToast(label) {
  const el = document.createElement('div')
  el.className   = 'milestone-toast'
  el.textContent = `★  ${label}`
  document.querySelector('.page').appendChild(el)
  requestAnimationFrame(() =>
    requestAnimationFrame(() => el.classList.add('milestone-toast--show'))
  )
  setTimeout(() => {
    el.classList.remove('milestone-toast--show')
    setTimeout(() => el.remove(), 400)
  }, 1900)
}

// Pre-mark milestones already achieved so we don't re-trigger them on load
function initMilestones() {
  const entries    = loadEntries()
  const totalWords = entries.reduce((sum, e) => sum + countWords(e.text), 0)
  WORD_MILESTONES.forEach(m  => { if (totalWords >= m)      _shownWordMilestones.add(m)  })
  ENTRY_MILESTONES.forEach(m => { if (entries.length >= m)  _shownEntryMilestones.add(m) })
}

function checkMilestones(prevEntryCount) {
  const entries    = loadEntries()
  const totalWords = entries.reduce((sum, e) => sum + countWords(e.text), 0)
  for (const m of WORD_MILESTONES) {
    if (totalWords >= m && !_shownWordMilestones.has(m)) {
      _shownWordMilestones.add(m)
      showMilestoneToast(`${m.toLocaleString()} words!`)
      playMilestone()
      return
    }
  }
  for (const m of ENTRY_MILESTONES) {
    if (entries.length >= m && prevEntryCount < m && !_shownEntryMilestones.has(m)) {
      _shownEntryMilestones.add(m)
      showMilestoneToast(`${m} ${m === 1 ? 'entry' : 'entries'}!`)
      if (m > 1) playMilestone()
      return
    }
  }
}

// Save button spring-pop — adds class, auto-removes on animationend
function animateSaveBtn() {
  const btn = document.getElementById('save-btn')
  if (!btn) return
  btn.classList.remove('pop')
  void btn.offsetWidth
  btn.classList.add('pop')
  btn.addEventListener('animationend', () => btn.classList.remove('pop'), { once: true })
}

// ─── Composer Event Listeners ─────────────────────────────────────────────────

// Update figure definition whenever the selection changes
document.getElementById('figure-select').addEventListener('change', updateFigureDef)

// Auto-grow textarea + live word count
const entryTextarea = document.getElementById('entry-text')
entryTextarea.addEventListener('input', () => {
  entryTextarea.style.height = 'auto'
  entryTextarea.style.height = entryTextarea.scrollHeight + 'px'

  const n   = countWords(entryTextarea.value)
  const wcEl = document.getElementById('composer-word-count')
  if (wcEl) wcEl.textContent = `${n} ${n === 1 ? 'word' : 'words'}`

  // Keystroke sounds — only on insertion, not deletion
  const len = entryTextarea.value.length
  if (len > _prevTextLen) {
    const lastChar = entryTextarea.value.slice(-1)
    if (lastChar === '.' || lastChar === '!' || lastChar === '?') {
      playPunctuate()
    } else {
      playKeyTap()
    }
  }
  _prevTextLen = len
})

document.getElementById('save-btn').addEventListener('click', () => {
  const text = entryTextarea.value.trim()
  if (!text) return

  const subject = document.getElementById('subject-input').value
  const figure  = document.getElementById('figure-select').value

  // Capture pre-save state for HUD delta
  const prevEntries    = loadEntries()
  const prevWords      = prevEntries.reduce((s, e) => s + countWords(e.text), 0)
  const prevEntryCount = prevEntries.length

  if (editingEntryId) {
    // UPDATE — patch the existing entry in place
    const entries = loadEntries()
    const entry   = entries.find(e => e.id === editingEntryId)
    if (entry) {
      entry.text             = text
      entry.subject          = subject.trim()
      entry.rhetoricalFigure = figure.trim()
      persistEntries(entries)
    }
    editingEntryId = null
    entryTextarea.value        = ''
    entryTextarea.style.height = ''
    document.getElementById('subject-input').value = ''
    selectRandomFigure()
    const wcEl = document.getElementById('composer-word-count')
    if (wcEl) wcEl.textContent = '0 words'
    document.getElementById('save-btn').textContent = 'Save Entry'
    updateThreadStatus()
    renderTimeline()
    renderEntryContext()
  } else {
    // CREATE — new entry in the current thread (passes eschaton for sub-thread tracking)
    const newEntry = createEntry(currentScene, subject, figure, text, currentEschaton)
    // If a specific insert position was requested (via timeline drag), move entry there
    if (pendingInsertPosition) {
      moveEntryToPosition(newEntry.id, pendingInsertPosition.targetId, pendingInsertPosition.insertBefore)
      pendingInsertPosition = null
    }
    // Clear text but keep Subject — writer likely continuing same context
    entryTextarea.value        = ''
    entryTextarea.style.height = ''
    selectRandomFigure()
    const wcEl = document.getElementById('composer-word-count')
    if (wcEl) wcEl.textContent = '0 words'
    updateThreadStatus()
    renderTimeline()
    updateSceneNav()
    updateNewEntryChip()
    renderEntryContext()
  }

  // ── Gamification ────────────────────────────────────────────────────────────
  const next = getTotals()
  playSave()
  animateSaveBtn()
  updateHud({ words: prevWords, entries: prevEntryCount }, next)
  checkMilestones(prevEntryCount)
  switchPage('timeline')
})

document.getElementById('cancel-btn').addEventListener('click', cancelEdit)

// Escape cancels an in-progress edit
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return
  if (editingEntryId && currentPage === 'timeline') {
    // Inline edit — just dismiss without touching the entry-page composer
    editingEntryId = null
    renderTimeline()
  } else {
    cancelEdit()
  }
})

document.getElementById('sfx-toggle').addEventListener('click', toggleSound)

// Page toggle
document.querySelectorAll('.page-toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => switchPage(btn.dataset.page))
})

// ─── Reorder / Export / Import Event Listeners ────────────────────────────────

// Event delegation: one listener on the container handles all interactive buttons
// (reorder + drill), even ones not yet in the DOM.
document.getElementById('tl-container').addEventListener('click', e => {
  const reorderBtn = e.target.closest('.reorder-btn')
  if (reorderBtn && !reorderBtn.disabled) {
    reorderEntry(reorderBtn.dataset.entryId, reorderBtn.dataset.action)
    return
  }
  const drillBtn = e.target.closest('[data-action="drill"]')
  if (drillBtn) {
    drillIntoEntry(drillBtn.dataset.entryId)
    return
  }
  const collapseBtn = e.target.closest('[data-action="collapse"]')
  if (collapseBtn) {
    const id = collapseBtn.dataset.entryId
    if (_collapsedEntries.has(id)) _collapsedEntries.delete(id)
    else _collapsedEntries.add(id)
    renderTimeline()
    return
  }

  // ── Inline edit actions ────────────────────────────────────────────────────
  const inlineSceneBtn = e.target.closest('[data-action="inline-scene"]')
  if (inlineSceneBtn) {
    document.querySelectorAll('[data-action="inline-scene"]').forEach(b => b.classList.remove('active'))
    inlineSceneBtn.classList.add('active')
    const entryEl = inlineSceneBtn.closest('.tl-entry')
    if (entryEl) entryEl.dataset.scene = inlineSceneBtn.dataset.scene
    return
  }

  const inlineSaveBtn = e.target.closest('[data-action="inline-save"]')
  if (inlineSaveBtn) {
    const ta = document.getElementById('tl-inline-textarea')
    if (!ta) return
    const text = ta.value.trim()
    if (!text) return
    const entryId = inlineSaveBtn.dataset.entryId
    const entries = loadEntries()
    const entry   = entries.find(e => e.id === entryId)
    if (entry) {
      const activeScene = document.querySelector('[data-action="inline-scene"].active')
      if (activeScene) entry.sceneType = activeScene.dataset.scene
      entry.text = text
      persistEntries(entries)
    }
    editingEntryId = null
    playSave()
    renderTimeline()
    refreshHud()
    return
  }

  const inlineCancelBtn = e.target.closest('[data-action="inline-cancel"]')
  if (inlineCancelBtn) {
    editingEntryId = null
    renderTimeline()
    return
  }
})

// ─── Drag-and-Drop Event Listeners ───────────────────────────────────────────
//
// All four drag events are delegated to tl-container so they work on
// dynamically-rendered entries without re-attaching listeners on every render.

const tlContainer = document.getElementById('tl-container')

// Live word count + auto-grow for inline textarea
tlContainer.addEventListener('input', e => {
  if (e.target.id !== 'tl-inline-textarea') return
  const ta = e.target
  ta.style.height = 'auto'
  ta.style.height = ta.scrollHeight + 'px'
  const n   = countWords(ta.value)
  const wcEl = document.getElementById('tl-inline-wc')
  if (wcEl) wcEl.textContent = `${n} ${n === 1 ? 'word' : 'words'}`
})

// Cmd/Ctrl+Enter saves inline edit
tlContainer.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && e.target.id === 'tl-inline-textarea') {
    e.preventDefault()
    const saveBtn = document.querySelector('[data-action="inline-save"]')
    if (saveBtn) saveBtn.click()
  }
})

// Double-click on a timeline entry → edit it inline
tlContainer.addEventListener('dblclick', e => {
  if (e.target.closest('button')) return
  const entry = e.target.closest('.tl-entry')
  if (entry) startInlineEdit(entry.dataset.entryId)
})


// New Entry drag chip — drag from toolbar onto timeline to insert at position
const newEntryDrag = document.getElementById('new-entry-drag')
newEntryDrag.addEventListener('dragstart', e => {
  draggingNewEntry = true
  e.dataTransfer.effectAllowed = 'copy'
  e.dataTransfer.setData('text/plain', 'new-entry')
})
newEntryDrag.addEventListener('dragend', () => {
  draggingNewEntry = false
  document.querySelectorAll('.tl-entry').forEach(el =>
    el.classList.remove('drag-over-top', 'drag-over-bottom')
  )
})

tlContainer.addEventListener('dragstart', e => {
  if (e.target.closest('button')) return  // buttons are not drag handles
  const entry = e.target.closest('.tl-entry')
  if (!entry) return
  draggedEntryId = entry.dataset.entryId
  entry.classList.add('dragging')
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', draggedEntryId) // required by Firefox
})

tlContainer.addEventListener('dragend', e => {
  draggedEntryId = null
  draggingNewEntry = false
  document.querySelectorAll('.tl-entry').forEach(el =>
    el.classList.remove('dragging', 'drag-over-top', 'drag-over-bottom')
  )
})

tlContainer.addEventListener('dragover', e => {
  e.preventDefault()
  e.dataTransfer.dropEffect = draggingNewEntry ? 'copy' : 'move'
  const target = e.target.closest('.tl-entry')

  // Clear all indicators, then re-apply only to current target
  document.querySelectorAll('.tl-entry').forEach(el =>
    el.classList.remove('drag-over-top', 'drag-over-bottom')
  )
  if (!target) return
  if (!draggingNewEntry && target.dataset.entryId === draggedEntryId) return

  const { top, height } = target.getBoundingClientRect()
  target.classList.add(e.clientY < top + height / 2 ? 'drag-over-top' : 'drag-over-bottom')
})

tlContainer.addEventListener('dragleave', e => {
  // Only clear when the mouse actually leaves the container, not between children
  if (!tlContainer.contains(e.relatedTarget)) {
    document.querySelectorAll('.tl-entry').forEach(el =>
      el.classList.remove('drag-over-top', 'drag-over-bottom')
    )
  }
})

tlContainer.addEventListener('drop', e => {
  e.preventDefault()
  const target = e.target.closest('.tl-entry')
  if (!target) return

  const targetId = target.dataset.entryId
  const { top, height } = target.getBoundingClientRect()
  const insertBefore = e.clientY < top + height / 2

  // Clean up visual state
  document.querySelectorAll('.tl-entry').forEach(el =>
    el.classList.remove('dragging', 'drag-over-top', 'drag-over-bottom')
  )

  if (draggingNewEntry) {
    // Drag from "New Entry" chip — set pending position and open entry page
    const entries = loadEntries()
    const tgt = entries.find(e => e.id === targetId)
    if (tgt) {
      currentClimaxId       = tgt.climaxId
      currentEschaton       = null
      pendingInsertPosition = { targetId, insertBefore }
      draggingNewEntry      = false
      selectScene(currentScene || 'portent')
      switchPage('entry')
    }
    return
  }

  if (!draggedEntryId || targetId === draggedEntryId) return
  moveEntryToPosition(draggedEntryId, targetId, insertBefore)
  draggedEntryId = null
})

document.getElementById('export-btn').addEventListener('click', exportStory)
document.getElementById('export-md-btn').addEventListener('click', exportMarkdown)

// ─── Export & Erase Event Listener ────────────────────────────────────────────

document.getElementById('export-clear-btn').addEventListener('click', () => {
  if (!loadEntries().length) return
  exportStory()   // triggers file download, then erase
  startFresh()
})

document.getElementById('import-input').addEventListener('change', e => {
  importStory(e.target.files[0])
  e.target.value = '' // reset so the same file can be re-imported if needed
})

// ─── Init ─────────────────────────────────────────────────────────────────────

initCurrentClimaxId()
const saved = loadSavedScene()
// Cliffhanger scene removed — migrate any saved 'cliffhanger' value to portent
let initialScene = (saved && saved !== 'cliffhanger' && SCENE_LABELS[saved]) ? saved : 'portent'
selectScene(initialScene)

initTitle()
updateThreadStatus()
renderTimeline()
updateSceneNav()
selectRandomFigure()
initMilestones()
refreshHud()
updateSfxToggle()
renderEntryContext()
updateNewEntryChip()
