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
// PIXEL ART — hand-built sprites for background decoration.
// The results-screen dino portrait is a generated image asset
// (assets/dino/*.png); everything below is still a hand-built matrix.
// Each row must be equal length within a matrix (validated at build time).
// '.' = transparent, 'O' = outline, 'B' = body, 'S' = shadow, 'E' = eye
// white, 'H' = highlight/teeth/icon-fill, 'P' = pupil
// ============================================================
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

// blocky background cloud, drawn once and reused at a few scales
const PX_CLOUD = [
  "..OOOO......",
  ".OOOOOOOO...",
  "OOOOOOOOOOO.",
  ".OOOOOOOOOO.",
];

// small saguaro-style cactus silhouette that drifts along the dirt strip
const PX_CACTUS = [
  "..O..",
  "..O..",
  ".OO..",
  ".OO.O",
  ".OOOO",
  "..O.O",
  "..O.O",
  "..O..",
  "..O..",
  ".OOO.",
];

// tiny ground-clutter shapes (twig, pebble, fleck) scattered at random
// across the dirt strip — see scatterDirtMarks
const PX_DIRT_MARKS = [
  ["O.O", ".O."],
  ["OO"],
  ["O"],
  [".O", "O."],
  ["OO.", ".OO"],
  ["O", "O", "O"],
  ["O.", "O.", ".O"],
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

// ---- small canvas/sharing utilities used by the DNA card below ----
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(test).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  return lines;
}

function hexToRgba(hex, alpha) {
  const clean = hex.replace("#", "");
  const value = parseInt(clean, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// canvas equivalent of renderPixelGrid, for drawing a matrix directly onto a
// 2D context instead of a DOM grid (used by the DNA card's badge icon)
function drawPixelMatrix(ctx, matrix, x, y, w, h, palette) {
  const cols = matrix[0].length;
  const rows = matrix.length;
  const cellW = w / cols;
  const cellH = h / rows;
  matrix.forEach((row, ry) => {
    [...row].forEach((ch, rx) => {
      if (ch === ".") return;
      ctx.fillStyle = palette[ch] || "transparent";
      ctx.fillRect(x + rx * cellW, y + ry * cellH, Math.ceil(cellW) + 0.5, Math.ceil(cellH) + 0.5);
    });
  });
}

// feature-detects file-sharing support specifically (narrower than just
// checking navigator.share, which doesn't guarantee file support)
function canShareFiles() {
  if (!navigator.canShare) return false;
  try {
    const probe = new File([""], "probe.png", { type: "image/png" });
    return navigator.canShare({ files: [probe] });
  } catch {
    return false;
  }
}

// ---- generates a small tileable dirt texture on a scratch canvas: a flat
// base with a handful of sparse, deliberate marks (not dense per-pixel
// noise, which reads as static). Random per page load. Returns a data URL. ----
function generateDirtTexture() {
  const size = 96;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = cssVar("dirt");
  ctx.fillRect(0, 0, size, size);

  const dark = cssVar("dirt-dark");
  const light = cssVar("dirt-light");

  // sparse, deliberate marks on an otherwise flat field — dense per-pixel
  // noise reads as static/strobing, especially once anything nearby moves
  const markCount = 18;
  for (let i = 0; i < markCount; i++) {
    ctx.fillStyle = Math.random() < 0.5 ? dark : light;
    const w = 1 + Math.floor(Math.random() * 2);
    const h = 1 + Math.floor(Math.random() * 2);
    ctx.fillRect(Math.floor(Math.random() * (size - w)), Math.floor(Math.random() * (size - h)), w, h);
  }

  return canvas.toDataURL();
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

// ---- a couple of small cacti drifting along the dirt strip, dino-game style ----
function scatterCacti() {
  const field = document.getElementById("cactus-field");
  if (!field) return;

  // paced to roughly match the ground/grass scroll speed (~160px/s) so the
  // whole scene reads as one consistent world scrolling by, rather than
  // independently-drifting background elements
  const configs = [
    { dur: 12, delay: -4 },
    { dur: 15, delay: -9 },
  ];

  configs.forEach((cfg) => {
    const cactus = document.createElement("div");
    cactus.className = "cactus pixel-grid";
    cactus.style.animationDuration = `${cfg.dur}s`;
    cactus.style.animationDelay = `${cfg.delay}s`;

    field.appendChild(cactus);
    renderPixelGrid(cactus, PX_CACTUS, { O: "var(--green)" });
  });
}

// ---- scattered twigs/pebbles/flecks drifting across the dirt strip. These
// are individually-placed random marks, not a tiled image, so the ground
// texture actually varies as it scrolls instead of repeating a small tile.
// Rendered twice, offset by one strip-width apart, so the loop is seamless
// (the CSS animation travels exactly one strip-width before resetting). ----
function scatterDirtMarks() {
  const field = document.getElementById("dirt-marks");
  if (!field) return;

  // sparse now — the fine noise texture (generateDirtTexture) carries most
  // of the ground detail, these are just occasional bigger accent clumps
  const stripVw = 300;
  const count = 30;
  const colors = ["var(--dirt-dark)", "var(--outline)", "var(--dirt-light)"];

  const marks = [];
  for (let i = 0; i < count; i++) {
    marks.push({
      x: Math.random() * stripVw,
      y: 8 + Math.random() * 84,
      shape: PX_DIRT_MARKS[Math.floor(Math.random() * PX_DIRT_MARKS.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      scale: 0.7 + Math.random() * 0.8,
    });
  }

  [0, stripVw].forEach((offset) => {
    marks.forEach((m) => {
      const el = document.createElement("div");
      el.className = "dirt-mark pixel-grid";
      el.style.left = `${m.x + offset}vw`;
      el.style.top = `${m.y}%`;
      el.style.width = `${8 * m.scale}px`;
      el.style.aspectRatio = `${m.shape[0].length} / ${m.shape.length}`;
      field.appendChild(el);
      renderPixelGrid(el, m.shape, { O: m.color });
    });
  });
}

// ---- two-frame silhouette for the periodic pteranodon flyby; the ground
// runner's leg-cycle is a fixed CSS animation now (it doesn't move
// horizontally, so there's nothing here left to randomize for it) ----
function initBackgroundActors() {
  const flyer = $("flyer");
  const silhouette = { O: "var(--outline)" };

  if (flyer) {
    renderPixelGrid($("flyer-a"), PX_PTERA[0], silhouette);
    renderPixelGrid($("flyer-b"), PX_PTERA[1], silhouette);
    const dur = 24 + Math.random() * 10;
    flyer.style.animationDuration = `${dur}s`;
    flyer.style.animationDelay = `${-Math.random() * dur}s`;
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
let currentResult = null; // { winnerKey, secondaryKey, totals } for the active DNA card

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
scatterStars();
scatterClouds();
const dirtField = document.querySelector(".dirt-field");
if (dirtField) dirtField.style.backgroundImage = `url(${generateDirtTexture()})`;
scatterDirtMarks();
scatterCacti();
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

  // Log to the roster in the background; UI updates when it resolves. The
  // card above has already rendered client-side either way.
  submitResult({ winner, secondary, totals });
}

// ---- canvas-drawn DNA card: trading-card version of the result, built to
// save/share since email can't be relied on to scale to unknown turnout ----

// Draws (or, with draw=false, just measures) the full card layout top to
// bottom and returns the final y — used as a measure pass to size the
// canvas correctly before the real draw pass, since trait/secondary text
// length varies per dino.
function layoutDnaCard(ctx, draw, opts) {
  const { W, H, dino, winnerKey, secondaryKey, totals, dinoImg } = opts;
  const padX = 18;
  const contentW = W - padX * 2;

  const outline = cssVar("outline");
  const ink = cssVar("ink");
  const inkRaised = cssVar("ink-raised");
  const bone = cssVar("bone");
  const boneDim = cssVar("bone-dim");
  const yellow = cssVar("yellow");
  const redDeep = cssVar("red-deep");
  const cyan = cssVar("cyan");
  const accent = cssVar(dino.accent);

  if (draw) {
    ctx.fillStyle = ink;
    ctx.fillRect(0, 0, W, H);
    ctx.lineWidth = 4;
    ctx.strokeStyle = outline;
    ctx.strokeRect(2, 2, W - 4, H - 4);
  }

  ctx.textBaseline = "top";
  let y = 18;

  // eyebrow
  ctx.font = `9px "Press Start 2P"`;
  if (draw) {
    ctx.fillStyle = yellow;
    ctx.fillText(`EXHIBIT ${dino.exhibit} · ${dino.code}`, padX, y);
  }
  y += 20;

  // name — shrink to fit the card width
  let nameSize = 22;
  const nameText = dino.name.toUpperCase();
  ctx.font = `${nameSize}px "Press Start 2P"`;
  while (ctx.measureText(nameText).width > contentW && nameSize > 10) {
    nameSize -= 1;
    ctx.font = `${nameSize}px "Press Start 2P"`;
  }
  if (draw) {
    ctx.fillStyle = redDeep;
    ctx.fillText(nameText, padX + 2, y + 2);
    ctx.fillStyle = bone;
    ctx.fillText(nameText, padX, y);
  }
  y += nameSize + 10;

  // competency
  ctx.font = `10px "Press Start 2P"`;
  if (draw) {
    ctx.fillStyle = boneDim;
    ctx.fillText(dino.competency.toUpperCase(), padX, y);
  }
  y += 24;

  // sprite + badge
  const spriteSize = 116;
  const spriteX = (W - spriteSize) / 2;
  if (draw) {
    ctx.drawImage(dinoImg, spriteX, y, spriteSize, spriteSize);

    const badgeSize = 36;
    const badgeX = spriteX + spriteSize - badgeSize + 8;
    const badgeY = y + spriteSize - badgeSize + 8;
    ctx.fillStyle = inkRaised;
    ctx.fillRect(badgeX - 4, badgeY - 4, badgeSize + 8, badgeSize + 8);
    ctx.lineWidth = 3;
    ctx.strokeStyle = outline;
    ctx.strokeRect(badgeX - 4, badgeY - 4, badgeSize + 8, badgeSize + 8);
    drawPixelMatrix(ctx, PX_ICONS[dino.icon], badgeX, badgeY, badgeSize, badgeSize, {
      H: accent,
      O: outline
    });
  }
  y += spriteSize + 18;

  // trait, word-wrapped
  ctx.font = `8px "Press Start 2P"`;
  if (draw) {
    ctx.fillStyle = boneDim;
    ctx.fillText("PREHISTORIC TRAIT", padX, y);
  }
  y += 16;
  ctx.font = `17px "VT323"`;
  const traitLines = wrapText(ctx, dino.trait, contentW);
  traitLines.forEach((line) => {
    if (draw) {
      ctx.fillStyle = bone;
      ctx.fillText(line, padX, y);
    }
    y += 19;
  });
  y += 8;

  // secondary strand callout, only if the quiz produced a close runner-up
  if (secondaryKey) {
    const sec = DINOSAURS[secondaryKey];
    const secText = `${sec.name} — ${sec.competency}`;
    ctx.font = `17px "VT323"`;
    const secLines = wrapText(ctx, secText, contentW - 20);
    const boxH = 16 + 8 + secLines.length * 19 + 8;

    if (draw) {
      ctx.lineWidth = 3;
      ctx.strokeStyle = cyan;
      ctx.strokeRect(padX, y, contentW, boxH);
      ctx.font = `8px "Press Start 2P"`;
      ctx.fillStyle = cyan;
      ctx.fillText("SECONDARY STRAND", padX + 10, y + 8);
      ctx.font = `17px "VT323"`;
      ctx.fillStyle = bone;
      let ly = y + 8 + 16;
      secLines.forEach((line) => {
        ctx.fillText(line, padX + 10, ly);
        ly += 19;
      });
    }
    y += boxH + 14;
  }

  // stat readout — all 7 competencies, out of 10, winner highlighted
  ctx.font = `9px "Press Start 2P"`;
  if (draw) {
    ctx.fillStyle = boneDim;
    ctx.fillText("DNA READOUT", padX, y);
  }
  y += 20;

  const barH = 14;
  const rowGap = 8;
  const labelW = 92;
  const valueW = 26;
  const barX = padX + labelW;
  const barW = contentW - labelW - valueW;

  DINO_ORDER.forEach((key) => {
    const d = DINOSAURS[key];
    const score = totals[key] || 0;
    const pct = Math.max(0, Math.min(1, score / 10));
    const isWinner = key === winnerKey;

    if (draw) {
      if (isWinner) {
        ctx.fillStyle = hexToRgba(yellow, 0.12);
        ctx.fillRect(padX - 6, y - 3, contentW + 12, barH + 6);
      }

      ctx.font = `12px "VT323"`;
      ctx.fillStyle = isWinner ? yellow : boneDim;
      const label = d.name.length > 12 ? d.name.split(" ")[0] : d.name;
      ctx.fillText(label, padX, y);

      ctx.fillStyle = inkRaised;
      ctx.fillRect(barX, y, barW, barH);
      ctx.fillStyle = cssVar(d.accent);
      ctx.fillRect(barX, y, Math.round(barW * pct), barH);
      ctx.lineWidth = 2;
      ctx.strokeStyle = outline;
      ctx.strokeRect(barX + 1, y + 1, barW - 2, barH - 2);

      ctx.font = `10px "Press Start 2P"`;
      ctx.fillStyle = isWinner ? yellow : boneDim;
      ctx.fillText(`${score}`, barX + barW + 8, y + 2);
    }
    y += barH + rowGap;
  });
  y += 6;

  // divider
  if (draw) {
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = boneDim;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padX, y);
    ctx.lineTo(W - padX, y);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  y += 14;

  // footer
  ctx.font = `9px "Press Start 2P"`;
  if (draw) {
    ctx.fillStyle = boneDim;
    ctx.fillText(`PLAYER: ${(studentInfo.name || "").toUpperCase()}`, padX, y);
  }
  y += 18;

  ctx.font = `8px "Press Start 2P"`;
  if (draw) {
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = boneDim;
    ctx.fillText("JURASSIC PAWS · CAREER EXHIBIT", padX, y);
    ctx.globalAlpha = 1;
  }
  y += 18;

  return Math.round(y);
}

async function renderDnaCard(winnerKey, secondaryKey, totals) {
  const canvas = $("dna-card");
  if (!canvas) return;

  try {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;

    const dino = DINOSAURS[winnerKey];
    const dinoImg = await loadImage(`assets/dino/${winnerKey}.png`);

    const W = 320;
    const dpr = window.devicePixelRatio || 1;

    // measure pass on a scratch context to find the height this card
    // actually needs (trait length and secondary presence both vary)
    const scratchCtx = document.createElement("canvas").getContext("2d");
    const H = layoutDnaCard(scratchCtx, false, {
      W, H: 4000, dino, winnerKey, secondaryKey, totals, dinoImg
    });

    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    layoutDnaCard(ctx, true, { W, H, dino, winnerKey, secondaryKey, totals, dinoImg });
  } catch (err) {
    console.error("DNA card render failed:", err);
  }
}

function renderResults(winnerKey, secondaryKey, totals) {
  const dino = DINOSAURS[winnerKey];
  currentResult = { winnerKey, secondaryKey, totals };

  const dinoSprite = $("sprite-dino");
  dinoSprite.src = `assets/dino/${winnerKey}.png`;
  dinoSprite.alt = dino.name;

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
  renderDnaCard(winnerKey, secondaryKey, totals);
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
  statusEl.textContent = "Logging your result…";
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
    statusEl.textContent = "✓ Added to the exhibit roster.";
    statusEl.dataset.state = "ok";
  } catch (err) {
    statusEl.textContent = "Couldn't reach the roster — your card above is still yours to keep.";
    statusEl.dataset.state = "err";
  }
}

// ============================================================
// DNA CARD ACTIONS — save always works; share only on browsers that
// support sharing files (feature-detected once at load, mostly mobile)
// ============================================================
if ($("btn-share-card")) {
  $("btn-share-card").style.display = canShareFiles() ? "" : "none";
}

$("btn-save-card").addEventListener("click", () => {
  const canvas = $("dna-card");
  if (!canvas || !currentResult) return;
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jurassic-paws-${currentResult.winnerKey}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, "image/png");
});

$("btn-share-card").addEventListener("click", () => {
  const canvas = $("dna-card");
  if (!canvas || !currentResult) return;
  canvas.toBlob(async (blob) => {
    if (!blob) return;
    try {
      const dino = DINOSAURS[currentResult.winnerKey];
      const file = new File([blob], `jurassic-paws-${currentResult.winnerKey}.png`, { type: "image/png" });
      await navigator.share({ files: [file], title: "My Jurassic Paws Dino DNA", text: `I got ${dino.name}!` });
    } catch {
      // user cancelled the share sheet, or sharing failed — nothing to do
    }
  }, "image/png");
});

// ============================================================
// RESTART
// ============================================================
$("btn-restart").addEventListener("click", () => {
  studentInfo = { name: "", email: "", uuid: "" };
  currentResult = null;
  $("form-intake").reset();
  showScreen("screen-landing");
});
