/* ============================================================
   JURASSIC PAWS — quiz data & logic
   ============================================================ */

// ---- Dino DNA data, sourced from the exhibit breakdown ----
// `accent` = the pixel-art color for this species' sprite + UI highlights
// `icon`   = which competency badge icon to render next to the sprite
const DINOSAURS = {
  trex: {
    exhibit: "01",
    code: "LDR-07",
    name: "Tyrannosaurus Rex",
    competency: "Leadership DNA",
    trait: "Known for its commanding presence, standing at the top of its ecosystem.",
    meaning: "Inspiring confidence, making thoughtful decisions, empowering others toward a shared goal, and leading by influence and example.",
    accent: "red",
    icon: "crown"
  },
  raptor: {
    exhibit: "02",
    code: "CRT-14",
    name: "Velociraptor",
    competency: "Critical Thinking DNA",
    trait: "Known for intelligence and adaptability, carefully assessing its environment before acting.",
    meaning: "Analyzing complex situations, solving problems, and making well-informed decisions.",
    accent: "cyan",
    icon: "bulb"
  },
  trike: {
    exhibit: "03",
    code: "TMW-21",
    name: "Triceratops",
    competency: "Teamwork DNA",
    trait: "Relied on strength in numbers for mutual protection and survival — together is stronger.",
    meaning: "Collaborating effectively, valuing diverse perspectives, and supporting team members to reach shared objectives.",
    accent: "green",
    icon: "link"
  },
  ptera: {
    exhibit: "04",
    code: "CMM-28",
    name: "Pteranodon",
    competency: "Communication DNA",
    trait: "Soared above the landscape, depending on broad awareness and connection to its surroundings.",
    meaning: "Sharing ideas clearly, practicing active listening, and building meaningful relationships that drive collective success.",
    accent: "blue",
    icon: "speech"
  },
  stego: {
    exhibit: "05",
    code: "PRF-35",
    name: "Stegosaurus",
    competency: "Professionalism DNA",
    trait: "Recognized for its steady nature and protective features — consistency builds trust.",
    meaning: "Demonstrating personal integrity, accountability, mutual respect, and reliability in all professional interactions.",
    accent: "violet",
    icon: "shield"
  },
  ankylo: {
    exhibit: "06",
    code: "TCH-42",
    name: "Ankylosaurus",
    competency: "Technology DNA",
    trait: "Relied on specialized natural tools, armor, and adaptability to thrive.",
    meaning: "Leveraging technology strategically to solve problems, increase operational efficiency, and continuously learn in an evolving workplace.",
    accent: "yellow",
    icon: "chip"
  },
  brachio: {
    exhibit: "07",
    code: "CSD-49",
    name: "Brachiosaurus",
    competency: "Career & Self-Development DNA",
    trait: "Reaching above the treetops to attain new heights.",
    meaning: "Cultivating curiosity, engaging in lifelong learning, practicing self-reflection, and taking intentional steps toward personal and professional milestones.",
    accent: "orange",
    icon: "arrow"
  }
};

// ============================================================
// PIXEL ART — hand-built sprites, no external image assets
// Each row must be equal length within a matrix (validated at build time).
// '.' = transparent, 'O' = outline, 'B' = body, 'S' = shadow, 'E' = eye
// white, 'H' = highlight/teeth/icon-fill, 'P' = pupil
// ============================================================
const PX_DINO_BASE = [
  "....OOOO....",
  "...OBBBBBO..",
  "...OEBBEBO..",
  "...OBHHBBO..",
  "....OOOO....",
  "..OBBBBBBO..",
  ".OBBBBBBBBO.",
  ".OSBBBBBBSO.",
  "...OBO.OBO..",
  "..OBBO.OBBO.",
];

const PX_BONE = [
  ".O.....O.",
  "OOO...OOO",
  ".O.OOO.O.",
  "OOO...OOO",
  ".O.....O.",
];

// extra fossil bones scattered in the dirt alongside the main bone shape
const PX_FOSSILS = {
  longBone: [
    ".O.........O.",
    "OOO.......OOO",
    ".O.OOOOOOO.O.",
    "OOO.......OOO",
    ".O.........O.",
  ],
  fragment: [
    ".O...",
    "OOO..",
    ".OOO.",
    "OOO..",
    ".O...",
  ],
  tooth: [
    "..O..",
    ".OOO.",
    ".OOO.",
    "..O..",
    "..O..",
    "..O..",
    "..O..",
  ],
};

// two-frame wing-flap silhouette used for the periodic background flyby
const PX_PTERA = [
  [
    "O.......O",
    "OO.....OO",
    ".OO...OO.",
    "..OOOOO..",
    "...O.O...",
  ],
  [
    ".........",
    "OOO...OOO",
    "..OOOOO..",
    "...O.O...",
    ".........",
  ],
];

// two-frame running-legs silhouette for the ground critter that scurries
// across the dirt strip in the background
const PX_RUNNER = [
  [
    "...OOOO....",
    "..OOOOOOO..",
    ".OOOOOOOOO.",
    "OOO..OOOOO.",
    "O.....O.O..",
    "......O....",
  ],
  [
    "...OOOO....",
    "..OOOOOOO..",
    ".OOOOOOOOO.",
    "OOO..OOOOO.",
    ".O.....O...",
    ".O.....O...",
  ],
];

// blocky background cloud, drawn once and reused at a few scales
const PX_CLOUD = [
  "..OOOO......",
  ".OOOOOOOO...",
  "OOOOOOOOOOO.",
  ".OOOOOOOOOO.",
];

const PX_ICONS = {
  crown: [
    ".H.H.H.",
    "HHHHHHH",
    "HHHHHHH",
  ],
  bulb: [
    "..HHH..",
    ".HHHHH.",
    ".HHHHH.",
    "..HOH..",
    "...O...",
  ],
  link: [
    ".OO....",
    "O..O...",
    "O.OO.O.",
    "...O..O",
    "....OO.",
  ],
  speech: [
    "OOOOO..",
    "O...O..",
    "O...O..",
    "OOOOO..",
    "..O....",
  ],
  shield: [
    ".OOOOO.",
    "O.....O",
    "O.....O",
    ".O...O.",
    "..O.O..",
    "...O...",
  ],
  chip: [
    "..OOO..",
    "O.OOO.O",
    "OOOOOOO",
    "OOOOOOO",
    "O.OOO.O",
    "..OOO..",
  ],
  arrow: [
    "...O...",
    "..OOO..",
    ".OOOOO.",
    "...O...",
    "...O...",
  ]
};

// Named accent colors, resolved against the CSS custom properties so the
// palette only has to be defined once (in style.css :root).
function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
}

function paletteFor(accentName) {
  return {
    O: cssVar("outline"),
    B: cssVar(accentName),
    S: cssVar("outline"),   // shadow cells reuse outline tone for contrast
    E: "#ffffff",
    H: "#ffffff",
    P: cssVar("outline")
  };
}

function renderPixelGrid(container, matrix, palette) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  container.innerHTML = "";
  container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  container.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

  matrix.forEach((row) => {
    [...row].forEach((ch) => {
      const cell = document.createElement("div");
      cell.className = "px";
      cell.style.background = ch === "." ? "transparent" : (palette[ch] || "transparent");
      container.appendChild(cell);
    });
  });
}

// ---- scatter little fossil bones across the dirt strip, one per grid cell so nothing overlaps ----
function scatterFossils() {
  const field = document.getElementById("bone-scatter");
  if (!field) return;
  const fossilPalette = { O: cssVar("outline"), S: cssVar("outline") };

  const shapes = [
    { matrix: PX_BONE, weight: 4 },
    { matrix: PX_FOSSILS.longBone, weight: 3 },
    { matrix: PX_FOSSILS.fragment, weight: 3 },
    { matrix: PX_FOSSILS.tooth, weight: 1 },
  ];
  const pool = shapes.flatMap((s) => Array(s.weight).fill(s.matrix));

  // divide the strip into a loose grid and place at most one fossil per
  // cell (with jitter inside the cell) so pieces never stack on each other
  const gridCols = 5;
  const gridRows = 3;
  const cells = [];
  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) cells.push({ r, c });
  }
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }

  const count = Math.min(10, cells.length);
  const cellW = 100 / gridCols;
  const cellH = 100 / gridRows;

  for (let i = 0; i < count; i++) {
    const { r, c } = cells[i];
    const matrix = pool[Math.floor(Math.random() * pool.length)];
    const rows = matrix.length;
    const cols = matrix[0].length;

    const holder = document.createElement("div");
    holder.className = "pixel-grid";
    const size = 20 + Math.random() * 16; // px, base dimension
    holder.style.width = `${size}px`;
    holder.style.aspectRatio = `${cols} / ${rows}`;

    // position within this cell, with jitter, kept away from cell edges
    const left = c * cellW + cellW * 0.2 + Math.random() * cellW * 0.5;
    const top = r * cellH + cellH * 0.15 + Math.random() * cellH * 0.55;
    holder.style.left = `${left}%`;
    holder.style.top = `${top}%`;
    holder.style.transform = `rotate(${Math.floor(Math.random() * 4) * 90}deg)`;

    field.appendChild(holder);
    renderPixelGrid(holder, matrix, fossilPalette);
  }
}

// ---- twinkling stars, scattered across the upper sky ----
function scatterStars() {
  const field = document.getElementById("star-field");
  if (!field) return;

  const count = 40;
  for (let i = 0; i < count; i++) {
    const star = document.createElement("div");
    star.className = "star";
    const size = Math.random() < 0.15 ? 3 : 2;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 55}%`;
    if (Math.random() < 0.12) star.style.background = "var(--yellow)";

    const dur = 1.8 + Math.random() * 2.6;
    star.style.animationDuration = `${dur}s`;
    star.style.animationDelay = `${-Math.random() * dur}s`;

    field.appendChild(star);
  }
}

// ---- a few blocky clouds, drifting past at different depths/speeds ----
function scatterClouds() {
  const field = document.getElementById("cloud-field");
  if (!field) return;

  const configs = [
    { top: "6%", scale: 1.3, dur: 90 },
    { top: "18%", scale: 0.8, dur: 65 },
    { top: "30%", scale: 1.6, dur: 120 },
  ];

  configs.forEach((cfg) => {
    const cloud = document.createElement("div");
    cloud.className = "cloud pixel-grid";
    cloud.style.top = cfg.top;
    cloud.style.width = `${72 * cfg.scale}px`;
    cloud.style.aspectRatio = `${PX_CLOUD[0].length} / ${PX_CLOUD.length}`;
    cloud.style.animationDuration = `${cfg.dur}s`;
    cloud.style.animationDelay = `${-Math.random() * cfg.dur}s`;

    field.appendChild(cloud);
    renderPixelGrid(cloud, PX_CLOUD, { O: "var(--bone)" });
  });
}

// ---- two-frame silhouettes for the periodic pteranodon flyby + ground runner ----
function initBackgroundActors() {
  const flyer = $("flyer");
  const runner = $("ground-runner");
  const silhouette = { O: "var(--outline)" };

  if (flyer) {
    renderPixelGrid($("flyer-a"), PX_PTERA[0], silhouette);
    renderPixelGrid($("flyer-b"), PX_PTERA[1], silhouette);
    const dur = 24 + Math.random() * 10;
    flyer.style.animationDuration = `${dur}s`;
    flyer.style.animationDelay = `${-Math.random() * dur}s`;
  }

  if (runner) {
    renderPixelGrid($("runner-a"), PX_RUNNER[0], silhouette);
    renderPixelGrid($("runner-b"), PX_RUNNER[1], silhouette);
    const dur = 32 + Math.random() * 14;
    runner.style.animationDuration = `${dur}s`;
    runner.style.animationDelay = `${-Math.random() * dur}s`;
  }
}

// Canonical order used for stable tie-breaking
const DINO_ORDER = ["trex", "raptor", "trike", "ptera", "stego", "ankylo", "brachio"];

// ---- 14 statements, 2 per competency, Likert 1 (disagree) – 5 (agree) ----
const QUESTIONS = [
  { dino: "trex", text: "I feel confident stepping up to guide a group toward a shared goal." },
  { dino: "trex", text: "Others often look to me for direction when a group needs to make a decision." },
  { dino: "raptor", text: "I like to carefully examine a problem from multiple angles before acting." },
  { dino: "raptor", text: "When something doesn't make sense, I dig deeper until I understand why." },
  { dino: "trike", text: "I do my best work when I'm collaborating with others rather than alone." },
  { dino: "trike", text: "I make an effort to include and support people with different perspectives than mine." },
  { dino: "ptera", text: "I make sure to really listen before I respond in a conversation." },
  { dino: "ptera", text: "I'm comfortable explaining my ideas clearly, even to people who see things differently." },
  { dino: "stego", text: "People can count on me to follow through on what I say I'll do." },
  { dino: "stego", text: "I hold myself to a high standard even when no one is watching." },
  { dino: "ankylo", text: "I enjoy figuring out new tools or apps that make tasks easier." },
  { dino: "ankylo", text: "When I hit a technical problem, I look for a smarter way to solve it rather than giving up." },
  { dino: "brachio", text: "I'm always looking for ways to learn something new about myself or my field." },
  { dino: "brachio", text: "I set goals for my own growth and check in on my progress." }
];

// Shuffle display order each attempt (scoring stays keyed by dino, not position)
function shuffledQuestions() {
  const arr = [...QUESTIONS];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ============================================================
// STATE
// ============================================================
let studentInfo = { name: "", email: "", uuid: "" };
let quiz = [];
let currentIndex = 0;
let answers = []; // answers[i] = 1..5, aligned to `quiz`

// ============================================================
// DOM HELPERS
// ============================================================
const $ = (id) => document.getElementById(id);

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((el) => {
    el.dataset.screen = el.id === id ? "active" : "hidden";
  });
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}

function buildStrip(container, total) {
  container.innerHTML = "";
  for (let i = 0; i < total; i++) {
    const seg = document.createElement("div");
    seg.className = "seg dashed";
    container.appendChild(seg);
  }
}

function updateStrip(container, filledCount) {
  const segs = container.querySelectorAll(".seg");
  segs.forEach((seg, i) => {
    if (i < filledCount) {
      seg.classList.add("filled");
      seg.classList.remove("dashed");
    } else {
      seg.classList.remove("filled");
      seg.classList.add("dashed");
    }
  });
}

// ============================================================
// LANDING → INTAKE
// ============================================================
buildStrip($("strip-landing"), 14);
// tease: a couple of segments glow faintly on landing for atmosphere
setTimeout(() => updateStrip($("strip-landing"), 3), 400);
scatterFossils();
scatterStars();
scatterClouds();
initBackgroundActors();

$("btn-start").addEventListener("click", () => {
  showScreen("screen-intake");
});

// ============================================================
// INTAKE FORM
// ============================================================
$("form-intake").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("input-name").value.trim();
  const email = $("input-email").value.trim();
  const uuid = $("input-uuid").value.trim();
  const errorEl = $("intake-error");

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!name || !email || !uuid) {
    errorEl.textContent = "All fields are required.";
    return;
  }
  if (!emailOk) {
    errorEl.textContent = "That email doesn't look right — double-check it.";
    return;
  }
  errorEl.textContent = "";

  studentInfo = { name, email, uuid };
  startQuiz();
});

// ============================================================
// QUIZ FLOW
// ============================================================
function startQuiz() {
  quiz = shuffledQuestions();
  answers = new Array(quiz.length).fill(null);
  currentIndex = 0;
  buildStrip($("strip-quiz"), quiz.length);
  renderQuestion();
  showScreen("screen-quiz");
}

function renderQuestion() {
  const q = quiz[currentIndex];
  $("quiz-counter").textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${quiz.length}`;
  $("quiz-statement").textContent = q.text;

  const answeredCount = answers.filter((a) => a !== null).length;
  updateStrip($("strip-quiz"), answeredCount);

  document.querySelectorAll(".likert-btn").forEach((btn) => {
    const val = Number(btn.dataset.value);
    btn.classList.toggle("selected", answers[currentIndex] === val);
  });

  $("btn-back").style.visibility = currentIndex === 0 ? "hidden" : "visible";
}

document.querySelectorAll(".likert-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const val = Number(btn.dataset.value);
    answers[currentIndex] = val;

    document.querySelectorAll(".likert-btn").forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");

    // brief pause so the selection is visible before advancing
    setTimeout(() => {
      if (currentIndex < quiz.length - 1) {
        currentIndex++;
        renderQuestion();
      } else {
        finishQuiz();
      }
    }, 220);
  });
});

$("btn-back").addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    renderQuestion();
  }
});

// ============================================================
// SCORING
// ============================================================
function scoreQuiz() {
  const totals = {};
  DINO_ORDER.forEach((d) => (totals[d] = 0));

  quiz.forEach((q, i) => {
    totals[q.dino] += answers[i] || 0;
  });

  const ranked = DINO_ORDER
    .map((d) => ({ dino: d, score: totals[d] }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return DINO_ORDER.indexOf(a.dino) - DINO_ORDER.indexOf(b.dino); // stable tie-break
    });

  const winner = ranked[0];
  const runnerUp = ranked[1];

  // Only surface a secondary strand if it's a close second (within 2 points)
  const secondary = winner.score - runnerUp.score <= 2 ? runnerUp.dino : null;

  return { winner: winner.dino, secondary, totals };
}

// ============================================================
// FINISH → SUBMIT → RESULTS
// ============================================================
async function finishQuiz() {
  showScreen("screen-loading");
  buildStrip($("strip-loading"), 14);
  updateStrip($("strip-loading"), 14);

  const { winner, secondary, totals } = scoreQuiz();
  renderResults(winner, secondary, totals);

  showScreen("screen-results");

  // Fire the save+email in the background; UI updates when it resolves
  submitResult({ winner, secondary, totals });
}

function renderResults(winnerKey, secondaryKey, totals) {
  const dino = DINOSAURS[winnerKey];

  renderPixelGrid($("sprite-dino"), PX_DINO_BASE, paletteFor(dino.accent));
  renderPixelGrid($("sprite-badge"), PX_ICONS[dino.icon], {
    H: cssVar(dino.accent),
    O: cssVar("outline")
  });

  $("result-code").textContent = `YOU FOUND: ${dino.code}`;
  $("result-exhibit").textContent = `Exhibit ${dino.exhibit}`;
  $("result-dino").textContent = dino.name.toUpperCase();
  $("result-competency").textContent = dino.competency;
  $("result-trait").textContent = dino.trait;
  $("result-meaning").textContent = dino.meaning;

  const secWrap = $("result-secondary-wrap");
  if (secondaryKey) {
    const sec = DINOSAURS[secondaryKey];
    $("result-secondary").textContent = `${sec.name} — ${sec.competency}`;
    secWrap.style.display = "block";
  } else {
    secWrap.style.display = "none";
  }

  renderDnaPie(totals, winnerKey);
}

// ---- full DNA breakdown, drawn as a hard-edged conic-gradient pie ----
function renderDnaPie(totals, winnerKey) {
  const pieEl = $("dna-pie");
  const legendEl = $("dna-legend");
  if (!pieEl || !legendEl) return;

  const sum = DINO_ORDER.reduce((s, d) => s + totals[d], 0);
  legendEl.innerHTML = "";

  let cursor = 0;
  const stops = [];
  const ariaParts = [];

  DINO_ORDER.forEach((d) => {
    const dino = DINOSAURS[d];
    const pct = sum > 0 ? (totals[d] / sum) * 100 : 0;
    const start = cursor;
    cursor += pct;
    stops.push(`var(--${dino.accent}) ${start}% ${cursor}%`);

    const rounded = Math.round(pct);
    ariaParts.push(`${dino.name} ${rounded}%`);

    const li = document.createElement("li");
    li.className = "dna-legend-item";
    if (d === winnerKey) li.classList.add("is-winner");

    const swatch = document.createElement("span");
    swatch.className = "dna-swatch";
    swatch.style.background = cssVar(dino.accent);

    const name = document.createElement("span");
    name.className = "dna-legend-name";
    name.textContent = dino.name;

    const pctEl = document.createElement("span");
    pctEl.className = "dna-legend-pct";
    pctEl.textContent = `${rounded}%`;

    li.append(swatch, name, pctEl);
    legendEl.appendChild(li);
  });

  pieEl.style.background = `conic-gradient(${stops.join(", ")})`;
  pieEl.setAttribute("aria-label", `DNA breakdown — ${ariaParts.join(", ")}`);
}

async function submitResult({ winner, secondary, totals }) {
  const statusEl = $("submit-status");
  statusEl.textContent = "Saving your result…";
  statusEl.dataset.state = "";

  const payload = {
    name: studentInfo.name,
    email: studentInfo.email,
    uuid: studentInfo.uuid,
    result: DINOSAURS[winner].name,
    resultCode: DINOSAURS[winner].code,
    competency: DINOSAURS[winner].competency,
    secondary: secondary ? DINOSAURS[secondary].name : "",
    scores: totals,
    submittedAt: new Date().toISOString()
  };

  try {
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Request failed");
    statusEl.textContent = "✓ Saved — check your email for your Dino DNA card.";
    statusEl.dataset.state = "ok";
  } catch (err) {
    statusEl.textContent = "We couldn't save this automatically — show this screen to an event volunteer.";
    statusEl.dataset.state = "err";
  }
}

// ============================================================
// RESTART
// ============================================================
$("btn-restart").addEventListener("click", () => {
  studentInfo = { name: "", email: "", uuid: "" };
  $("form-intake").reset();
  showScreen("screen-landing");
});
