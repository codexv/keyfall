// KEYFALL — Tactical Typing Arena, Training Academy & P2P Squadron Engine
(function () {
  "use strict";

  const canvas = document.getElementById("space");
  const ctx = canvas.getContext("2d");

  // Header & Nav
  const navTabs = document.querySelectorAll(".nav-tab[data-tab]");
  const openStatsBtn = document.getElementById("openStatsBtn");
  const closeStatsBtn = document.getElementById("closeStatsBtn");
  const statsDialog = document.getElementById("statsDialog");
  const editCallsignBtn = document.getElementById("editCallsignBtn");
  const pilotCallsignDisplay = document.getElementById("pilotCallsignDisplay");
  const soundToggleBtn = document.getElementById("soundToggleBtn");
  const soundLabel = document.getElementById("soundLabel");
  const navPeerBadge = document.getElementById("navPeerBadge");

  // Hero Intro
  const heroEyebrow = document.getElementById("heroEyebrow");
  const heroTitle = document.getElementById("heroTitle");
  const heroSubtitle = document.getElementById("heroSubtitle");
  const sysProtocolLabel = document.getElementById("sysProtocolLabel");
  const sysQuote = document.getElementById("sysQuote");
  const sysStatusText = document.getElementById("sysStatusText");

  // Sidebar Decks
  const deckArena = document.getElementById("deck-arena");
  const deckTraining = document.getElementById("deck-training");
  const deckSocial = document.getElementById("deck-social");

  const infoSession = document.getElementById("infoSession");
  const infoPool = document.getElementById("infoPool");
  const infoObjective = document.getElementById("infoObjective");

  const infoDrillKeys = document.getElementById("infoDrillKeys");
  const infoDrillCoach = document.getElementById("infoDrillCoach");
  const weakKeyDrillSub = document.getElementById("weakKeyDrillSub");

  const launchBtn = document.getElementById("launchBtn");
  const launchBtnText = document.getElementById("launchBtnText");
  const sidebarTipText = document.getElementById("sidebarTipText");

  // P2P & Social Controls
  const p2pRoomBox = document.getElementById("p2pRoomBox");
  const createRoomBtn = document.getElementById("createRoomBtn");
  const copyInviteBtn = document.getElementById("copyInviteBtn");
  const joinRoomInput = document.getElementById("joinRoomInput");
  const joinRoomBtn = document.getElementById("joinRoomBtn");
  const p2pStatusLine = document.getElementById("p2pStatusLine");
  const squadRosterList = document.getElementById("squadRosterList");
  const addFriendBtn = document.getElementById("addFriendBtn");

  // Arena HUD & Overlays
  const simModeTitle = document.getElementById("simModeTitle");
  const arenaStatus = document.getElementById("arenaStatus");
  const hudWpm = document.getElementById("hudWpm");
  const hudAcc = document.getElementById("hudAcc");
  const hudCombo = document.getElementById("hudCombo");
  const hudTimeLabel = document.getElementById("hudTimeLabel");
  const hudTime = document.getElementById("hudTime");

  const mpTelemetryBar = document.getElementById("mpTelemetryBar");
  const mpSelfName = document.getElementById("mpSelfName");
  const mpSelfStats = document.getElementById("mpSelfStats");
  const mpModeBadge = document.getElementById("mpModeBadge");
  const mpPeerName = document.getElementById("mpPeerName");
  const mpPeerStats = document.getElementById("mpPeerStats");

  const welcomeOverlay = document.getElementById("welcomeOverlay");
  const welcomeEyebrow = document.getElementById("welcomeEyebrow");
  const welcomeTitle = document.getElementById("welcomeTitle");
  const welcomeDesc = document.getElementById("welcomeDesc");
  const letsFlyBtn = document.getElementById("letsFlyBtn");

  const keyboardDock = document.getElementById("keyboardDock");
  const kbCoachPrompt = document.getElementById("kbCoachPrompt");
  const kbRows = document.getElementById("kbRows");

  const lockLabel = document.getElementById("lockLabel");
  const typedReadout = document.getElementById("typedReadout");
  const shieldDiamonds = document.getElementById("shieldDiamonds");
  const shieldText = document.getElementById("shieldText");
  const empBadge = document.getElementById("empBadge");

  const pauseOverlay = document.getElementById("pauseOverlay");
  const resumeBtn = document.getElementById("resumeBtn");
  const quitToResultsBtn = document.getElementById("quitToResultsBtn");

  const resultsOverlay = document.getElementById("resultsOverlay");
  const resEyebrow = document.getElementById("resEyebrow");
  const resHeadline = document.getElementById("resHeadline");
  const resNetWpm = document.getElementById("resNetWpm");
  const resRankPill = document.getElementById("resRankPill");
  const resRawSub = document.getElementById("resRawSub");
  const resAcc = document.getElementById("resAcc");
  const resWords = document.getElementById("resWords");
  const resCombo = document.getElementById("resCombo");
  const resTime = document.getElementById("resTime");
  const resWeakKeys = document.getElementById("resWeakKeys");
  const resCoaching = document.getElementById("resCoaching");
  const wpmChart = document.getElementById("wpmChart");
  const retryBtn = document.getElementById("retryBtn");
  const trainWeakBtn = document.getElementById("trainWeakBtn");
  const shareChallengeBtn = document.getElementById("shareChallengeBtn");

  // Persistent Storage Helper
  const STORAGE_KEY = "keyfall_v2_profile";
  function loadProfile() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return {
      callsign: "PILOT-" + Math.floor(10 + Math.random() * 89),
      bestWpm: {
        "assessment:cadet": 0,
        "assessment:pilot": 0,
        "assessment:ace": 0,
        "survival:cadet": 0,
        "survival:pilot": 0,
        "survival:ace": 0,
      },
      lifetimeSessions: 0,
      lifetimeWords: 0,
      highestEverWpm: 0,
      weakKeys: {}, // char -> total misses
      friends: [
        { name: "VANGUARD-7", bestWpm: 74, status: "ACE PILOT" },
        { name: "NOVA-ACTUAL", bestWpm: 62, status: "SQUAD LEADER" },
      ],
    };
  }

  function saveProfile() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (_) {}
  }

  const profile = loadProfile();
  pilotCallsignDisplay.textContent = profile.callsign;

  // Finger Map Metadata for On-Screen Keyboard Tutorial
  const KEYBOARD_LAYOUT = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"],
  ];

  const FINGER_MAP = {
    q: { zone: "pinky", label: "LEFT PINKY" },
    a: { zone: "pinky", label: "LEFT PINKY" },
    z: { zone: "pinky", label: "LEFT PINKY" },
    w: { zone: "ring", label: "LEFT RING" },
    s: { zone: "ring", label: "LEFT RING" },
    x: { zone: "ring", label: "LEFT RING" },
    e: { zone: "middle", label: "LEFT MIDDLE" },
    d: { zone: "middle", label: "LEFT MIDDLE" },
    c: { zone: "middle", label: "LEFT MIDDLE" },
    r: { zone: "index", label: "LEFT INDEX" },
    f: { zone: "index", label: "LEFT INDEX", bump: true },
    v: { zone: "index", label: "LEFT INDEX" },
    t: { zone: "index", label: "LEFT INDEX" },
    g: { zone: "index", label: "LEFT INDEX" },
    b: { zone: "index", label: "LEFT INDEX" },
    y: { zone: "index", label: "RIGHT INDEX" },
    h: { zone: "index", label: "RIGHT INDEX" },
    n: { zone: "index", label: "RIGHT INDEX" },
    u: { zone: "index", label: "RIGHT INDEX" },
    j: { zone: "index", label: "RIGHT INDEX", bump: true },
    m: { zone: "index", label: "RIGHT INDEX" },
    i: { zone: "middle", label: "RIGHT MIDDLE" },
    k: { zone: "middle", label: "RIGHT MIDDLE" },
    o: { zone: "ring", label: "RIGHT RING" },
    l: { zone: "ring", label: "RIGHT RING" },
    p: { zone: "pinky", label: "RIGHT PINKY" },
  };

  // Home-row & Alternating-hand curated word lists for Training Lab
  const HOME_ROW_WORDS = [
    "add", "all", "ask", "dad", "fad", "fall", "flask", "glad", "half", "hall",
    "had", "has", "jag", "jak", "lad", "lass", "sad", "salad", "sash", "shall",
    "slag", "slash", "dash", "flag", "flak", "gash", "glass", "hash", "kala", "skald"
  ];

  const ALTERNATING_WORDS = [
    "aid", "air", "also", "ant", "apron", "auger", "authentic", "auto", "big", "Blame",
    "bog", "both", "burn", "chair", "chapel", "city", "clan", "clay", "coal", "coat",
    "cod", "cog", "colt", "coma", "comb", "coral", "cork", "corn", "cot", "cue",
    "cut", "dame", "idiot", "island", "ivory", "jar", "jaundice", "jay", "kei", "kept",
    "key", "laity", "lake", "lamb", "lame", "land", "lane", "lantana", "lap", "lapel",
    "larva", "larch", "lash", "latch", "late", "laugh", "lay", "leapt", "lend", "lens",
    "lent", "light", "lint", "load", "loan", "lock", "mane", "map", "maple", "marl",
    "mate", "may", "meant", "end", "men", "mend", "mental", "mock", "name", "nap",
    "nape", "navy", "neighbor", "oak", "oar", "oat", "oddball", "offal", "oil", "omen",
    "oral", "orient", "ornament", "own", "oxen", "paid", "pail", "pain", "paint", "pair",
    "pale", "palm", "pan", "pane", "panel", "pang", "pant", "papal", "par", "pay",
    "pelican", "pen", "penal", "pendant", "pens", "pent", "pet", "pity", "plan", "plane",
    "planet", "plank", "plant", "plaza", "pm", "poem", "poet", "pro", "prof", "profit",
    "prop", "quantity", " quench", "right", "risk", "ritual", "roam", "roar", "oat", "ock",
    "rod", "roe", "romp", "rope", "rot", "rough", "royalty", "rub", "rude", "rug",
    "ruin", "rule", "rum", "run", "ung", "rush", "rust", "rut", "sake", "sale",
    "salt", "same", "sand", "sane", "sang", "sank", "sap", "ash", "sat", "aucer",
    "save", "saw", "say", "seal", "seam", "seat", "sect", "senate", "send", "sent",
    "set", "shack", "shady", "shaft", "shake", "shale", "sham", "shame", "shank", "shape",
    "shard", "share", "shark", "sharp", "shave", "shawl", "sheaf", "shear", "shed", "ac",
    "shell", "shift", "shin", "shine", "ship", "irk", "shirt", "shoal", "shock", "shoe",
    "shone", "shook", "shoot", "shop", "shore", "short", "shot", "shove", "shovel", "show",
    "shown", "shrank", "shred", "shrew", "shriek", "hrift", "shrike", "shrill", "shrimp",
    "shrine", "shrink", "shroud", "shrub", "shrug", "shrunk", "shuck", "shudder", "shuffle",
    "shun", "shunt", "shut", "shy", "ial", "sick", "side", "sift", "sigh", "sight",
    "sign", "signal", "silk", "sill", "silo", "silt", "silver", "simmer", "simple", "sin",
    "since", "sinew", "sing", "single", "sink", "sip", "siren", "sit", "site", "six",
    "size", "skate", "skein", "sketch", "skew", "ski", "skid", "skiff", "skill", "skim",
    "skin", "skip", "skirt", "skit", "skulk", "skull", "skunk", "sky", "slab", "slack",
    "slag", "slain", "slake", "slam", "slander", "slang", "slant", "slap", "slash", "slat",
    "slate", "slave", "slay", "sled", "sleek", "sleep", "sleet", "sleeve", "sleigh", "slept",
    "slew", "slice", "slick", "slid", "slide", "slight", "slim", "slime", "sling", "slink",
    "slip", "slit", "slither", "sliver", "slob", "sloe", "slog", "sloop", "slope", "slop",
    "slosh", "slot", "sloth", "slouch", "slough", "slow", "sludge", "slug", "sluice", "slum",
    "slumber", "slump", "slung", "slunk", "slur", "slush", "sly", "smack", "small", "smart",
    "smash", "smear", "smell", "smelt", "smile", "smirk", "smite", "smith", "smock", "smoke",
    "smolder", "smooth", "smother", "smudge", "smug", "smuggle", "smut", "snack", "snafu",
    "snag", "snail", "snake", "snap", "snare", "snarl", "snatch", "sneak", "sneer", "sneeze",
    "snicker", "snide", "sniff", "snip", "snipe", "ubit", "snob", "snooze", "snore", "snorkel",
    "snort", "snout", "snow", "snub", "snuff", "snug", "soak", "soap", "soar", "sob",
    "sober", "soccer", "social", "sock", "socket", "sod", "soda", "sofa", "soft", "soggy",
    "soil", "solace", "solar", "sold", "solder", "soldier", "sole", "solemn", "solid", "solo",
    "solve", "somber", "some", "son", "sonar", "song", "sonic", "sonnet", "soon", "soot",
    "soothe", "sop", "soprano", "sorcery", "sordid", "sore", "sorrow", "sorry", "sort", "soul",
    "sound", "soup", "sour", "source", "south", "sow", "soy", "space", "spade", "span",
    "spank", "spar", "spare", "spark", "sparrow", "sparse", "spasm", "spat", "spate", "spatial",
    "spawn", "spay", "speak", "spear", "spec", "special", "species", "speck", "specter", "speech",
    "speed", "spell", "spend", "spent", "sperm", "spew", "sphere", "sphinx", "spice", "spider",
    "spied", "spiel", "spigot", "spike", "spill", "spin", "spinach", "spindle", "spine", "spiral",
    "spire", "spirit", "spit", "spite", "spittle", "splash", "splat", "splay", "spleen", "splendid",
    "splice", "splint", "splinter", "split", "splotch", "splurge", "spoil", "spoke", "spoken", "sponge",
    "sponsor", "spoof", "spook", "spool", "spoon", "spoor", "spore", "sport", "spot", "spouse",
    "spout", "sprain", "zeal", "zero", "zest", "zinc", "zone", "zoom"
  ].map(w => w.trim().toLowerCase()).filter(w => /^[a-z]{3,8}$/.test(w));

  // Game & UI State
  const state = {
    activeTab: "arena", // 'arena' | 'training' | 'social'
    phase: "standby", // 'standby' | 'playing' | 'paused' | 'results'

    // Mode Settings
    soloMode: "assessment", // 'assessment' | 'survival'
    difficulty: "pilot", // 'cadet' | 'pilot' | 'ace'
    trainingDrill: "homerow", // 'homerow' | 'topbottom' | 'burst' | 'weakkeys'
    keyboardGuideOn: true,
    socialMode: "duel", // 'duel' | 'coop'
    partnerType: "p2p", // 'p2p' | 'bot'

    // Challenge Seed/Target (from URL ?challenge=...)
    challengeTargetWpm: 0,
    challengeChallenger: "",

    // Live Combat State
    wave: 1,
    shields: 3,
    maxShields: 3,
    empCharges: 2,
    killsTowardEmp: 0,
    score: 0,
    timeRemaining: 60,
    elapsedFlightSec: 0,
    spawnTimer: 0,
    spawnInterval: 1.4,

    // Entities
    enemies: [],
    projectiles: [],
    particles: [],
    shockwaves: [],
    floatingTexts: [],
    lockedEnemyId: null,
    nextEntityId: 1,

    // Ships
    player: { x: 0, y: 0, angle: -Math.PI / 2, targetAngle: -Math.PI / 2, recoil: 0 },
    wingman: { x: 0, y: 0, angle: -Math.PI / 2, targetAngle: -Math.PI / 2, recoil: 0, active: false },

    // Telemetry
    sessionStartTime: 0,
    firstKeyTime: 0,
    correctKeys: 0,
    errorKeys: 0,
    totalKeys: 0,
    combo: 0,
    maxCombo: 0,
    wordsCleared: 0,
    burstTimestamps: [],
    peakBurstWpm: 0,
    sessionMissedKeys: {},
    timelineSamples: [],
    lastSampleSec: 0,

    // Multiplayer / Bot State
    peer: null,
    conn: null,
    roomCode: "",
    isHost: false,
    peerConnected: false,
    peerCallsign: "RIVAL-01",
    peerWpm: 0,
    peerAcc: 100,
    peerWords: 0,
    botTimer: 0,
  };

  // Canvas Setup
  let width = 800;
  let height = 600;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resizeArena() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = Math.max(320, rect.width);
    height = Math.max(480, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resizeArena);
  resizeArena();

  // Starfield Particles
  const stars = Array.from({ length: 85 }, () => ({
    x: Math.random() * 1200,
    y: Math.random() * 800,
    r: Math.random() * 1.4 + 0.4,
    speed: Math.random() * 16 + 5,
    alpha: Math.random() * 0.45 + 0.12,
  }));

  // Build On-Screen Keyboard DOM
  function renderKeyboardDOM() {
    kbRows.innerHTML = "";
    const topWeak = new Set(
      Object.entries(profile.weakKeys)
        .filter(([, count]) => count >= 2)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([k]) => k)
    );

    KEYBOARD_LAYOUT.forEach((row) => {
      const rowEl = document.createElement("div");
      rowEl.className = "kb-row";
      row.forEach((char) => {
        const keyEl = document.createElement("div");
        const meta = FINGER_MAP[char] || { zone: "index", label: "INDEX" };
        keyEl.className = `kb-key finger-${meta.zone}${meta.bump ? " home-bump" : ""}${
          topWeak.has(char) ? " weak-spot" : ""
        }`;
        keyEl.dataset.key = char;
        keyEl.textContent = char.toUpperCase();
        rowEl.appendChild(keyEl);
      });
      kbRows.appendChild(rowEl);
    });
  }
  renderKeyboardDOM();

  // Highlight Next Required Key on Keyboard Dock
  function updateKeyboardHighlight() {
    const allKeys = kbRows.querySelectorAll(".kb-key");
    allKeys.forEach((k) => k.classList.remove("target-next"));

    let nextChar = null;
    const locked = getLockedEnemy();
    if (locked && locked.typedIndex < locked.word.length) {
      nextChar = locked.word[locked.typedIndex];
    } else if (state.enemies.length > 0) {
      // Suggest closest threat's initial letter
      const closest = [...state.enemies].sort((a, b) => b.y - a.y)[0];
      if (closest) nextChar = closest.word[closest.typedIndex || 0];
    }

    if (nextChar && FINGER_MAP[nextChar]) {
      const targetEl = kbRows.querySelector(`.kb-key[data-key="${nextChar}"]`);
      if (targetEl) targetEl.classList.add("target-next");
      const meta = FINGER_MAP[nextChar];
      kbCoachPrompt.textContent = `NEXT KEY: [${nextChar.toUpperCase()}] — USE ${meta.label}`;
    } else {
      kbCoachPrompt.textContent = "AWAITING TARGET — KEEP FINGERS ON [ASDF] [JKL;]";
    }
  }

  // Render Squadron Friend Roster
  function renderSquadRoster() {
    squadRosterList.innerHTML = "";
    profile.friends.forEach((f) => {
      const row = document.createElement("div");
      row.className = "roster-item";
      row.innerHTML = `
        <div>
          <span class="dot-online"></span>
          <strong>${f.name}</strong>
        </div>
        <span class="roster-meta">${f.bestWpm} WPM · ${f.status}</span>
      `;
      squadRosterList.appendChild(row);
    });
  }
  renderSquadRoster();

  // Update Left Sidebar & Header Info when switching Tabs/Modes
  function syncUIState() {
    deckArena.classList.toggle("hidden", state.activeTab !== "arena");
    deckTraining.classList.toggle("hidden", state.activeTab !== "training");
    deckSocial.classList.toggle("hidden", state.activeTab !== "social");

    const showKb =
      state.activeTab === "training" &&
      state.keyboardGuideOn &&
      (state.phase === "playing" || state.phase === "standby");
    keyboardDock.classList.toggle("hidden", !showKb);

    const showMpBar =
      state.activeTab === "social" &&
      (state.phase === "playing" || state.peerConnected);
    mpTelemetryBar.classList.toggle("hidden", !showMpBar);

    if (state.activeTab === "arena") {
      heroEyebrow.textContent = "THE KEYBOARD IS YOUR WEAPON";
      heroTitle.innerHTML = `Stay sharp.<br />Type <span class="lime-text">faster.</span>`;
      heroSubtitle.textContent = "Words incoming. Instincts on. Find your flow.";
      simModeTitle.textContent = "LIVE SIMULATION";

      const isAssess = state.soloMode === "assessment";
      infoSession.textContent = isAssess ? "60 seconds" : "Until shields fail";
      infoPool.textContent =
        state.difficulty === "cadet"
          ? "Short & familiar"
          : state.difficulty === "pilot"
          ? "Everyday English"
          : "Advanced vocabulary";
      infoObjective.textContent = isAssess
        ? "Measure your speed"
        : "Survive the incoming";
      hudTimeLabel.textContent = isAssess ? "TIME LEFT" : "FLIGHT TIME";
      if (state.phase === "standby") {
        hudTime.textContent = isAssess ? "60" : "0";
      }
    } else if (state.activeTab === "training") {
      heroEyebrow.textContent = "ORBITAL TYPING ACADEMY";
      heroTitle.innerHTML = `Build muscle<br /><span class="lime-text">memory.</span>`;
      heroSubtitle.textContent =
        "Interactive finger-zone coaching, rhythm drills, and personalized weak-key clinics.";
      simModeTitle.textContent = "TRAINING SIMULATION";
      hudTimeLabel.textContent = "DRILL TIME";

      const weakList = Object.entries(profile.weakKeys)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([k]) => k.toUpperCase());
      weakKeyDrillSub.textContent =
        weakList.length > 0
          ? `Focuses on your missed keys: ${weakList.join(", ")}`
          : "Targets your personal missed keys.";

      if (state.trainingDrill === "homerow") {
        infoDrillKeys.textContent = "A S D F G H J K L";
        infoDrillCoach.textContent = "Home-row anchor & return";
      } else if (state.trainingDrill === "topbottom") {
        infoDrillKeys.textContent = "Q W E R T Y + Z X C V";
        infoDrillCoach.textContent = "Vertical reach accuracy";
      } else if (state.trainingDrill === "burst") {
        infoDrillKeys.textContent = "ALTERNATING HANDS";
        infoDrillCoach.textContent = "High-velocity bigrams";
      } else {
        infoDrillKeys.textContent =
          weakList.length > 0 ? weakList.join(" · ") : "ALL KEYS (CALIBRATING)";
        infoDrillCoach.textContent = "Adaptive error elimination";
      }
    } else if (state.activeTab === "social") {
      heroEyebrow.textContent = "SQUADRON MULTIPLAYER NETWORK";
      heroTitle.innerHTML = `Duel rivals.<br />Defend <span class="lime-text">together.</span>`;
      heroSubtitle.textContent =
        "Real-time WebRTC P2P room codes & AI simulators for 1v1 Duels and 2-Player Co-op.";
      simModeTitle.textContent =
        state.socialMode === "duel" ? "1V1 DUEL ARENA" : "2P CO-OP SECTOR";
      hudTimeLabel.textContent =
        state.socialMode === "duel" ? "DUEL TIMER" : "SECTOR WAVE";
      mpModeBadge.textContent =
        state.socialMode === "duel" ? "1V1 JAMMER DUEL" : "2P CO-OP DEFENSE";
      mpSelfName.textContent = profile.callsign;
      mpPeerName.textContent = state.peerConnected
        ? state.peerCallsign
        : `AI-${state.difficulty.toUpperCase()}`;
      p2pRoomBox.classList.toggle("hidden", state.partnerType === "bot");
    }

    updateKeyboardHighlight();
  }

  // Word Picker with Mode/Drill Awareness & Unique First-Letter Priority
  function selectWordForSpawn() {
    const activeInitials = new Set(
      state.enemies.map((e) => e.word[e.typedIndex] || e.word[0])
    );
    const activeWords = new Set(state.enemies.map((e) => e.word));

    let pool = window.WORD_BANKS.medium;

    if (state.activeTab === "training") {
      if (state.trainingDrill === "homerow") {
        pool = HOME_ROW_WORDS;
      } else if (state.trainingDrill === "burst") {
        pool = ALTERNATING_WORDS;
      } else if (state.trainingDrill === "weakkeys") {
        const weakChars = Object.entries(profile.weakKeys)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([k]) => k);
        if (weakChars.length > 0) {
          const allWords = [
            ...window.WORD_BANKS.short,
            ...window.WORD_BANKS.medium,
          ];
          const filtered = allWords.filter((w) =>
            weakChars.some((ch) => w.includes(ch))
          );
          if (filtered.length >= 15) pool = filtered;
        }
      } else {
        pool = [...window.WORD_BANKS.short, ...window.WORD_BANKS.medium];
      }
    } else {
      // Solo Arena or Social
      if (state.difficulty === "cadet") {
        pool = window.WORD_BANKS.short;
      } else if (state.difficulty === "pilot") {
        pool =
          Math.random() < 0.35
            ? window.WORD_BANKS.short
            : window.WORD_BANKS.medium;
      } else {
        pool =
          Math.random() < 0.55
            ? window.WORD_BANKS.long
            : window.WORD_BANKS.medium;
      }
    }

    for (let i = 0; i < 25; i++) {
      const w = pool[Math.floor(Math.random() * pool.length)];
      if (!activeWords.has(w) && !activeInitials.has(w[0])) return w;
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // Spawn Enemy Word / Ship
  function spawnEnemy(options = {}) {
    const diffMult =
      state.difficulty === "cadet"
        ? 0.78
        : state.difficulty === "pilot"
        ? 1.0
        : 1.32;

    const liveWpm = getNetWpm();
    const paceBoost = 1 + Math.min(0.6, Math.max(0, (liveWpm - 45) / 140));

    let type = options.type || "standard";
    if (!options.type && state.activeTab !== "training") {
      const hasBoss = state.enemies.some((e) => e.type === "boss");
      const r = Math.random();
      if (!hasBoss && state.wordsCleared > 0 && state.wordsCleared % 10 === 0) {
        type = "boss"; // Multi-word Dreadnought flagship
      } else if (r < 0.18 && state.wordsCleared >= 3) {
        type = "cruiser"; // Heavy hull that splits into 2 shards
      } else if (r < 0.42) {
        type = "scout"; // Fast sleek dart
      }
    }

    let bossChain = null;
    let word = options.word;
    if (type === "boss" && !word) {
      const chains = window.WORD_BANKS.bossChains;
      const chosen = chains[Math.floor(Math.random() * chains.length)].slice();
      word = chosen.shift();
      bossChain = chosen;
    } else {
      word = word || selectWordForSpawn();
    }
    word = word.toLowerCase();

    const padX = 95;
    const x =
      options.x !== undefined
        ? options.x
        : padX + Math.random() * Math.max(120, width - padX * 2);
    const y = options.y !== undefined ? options.y : 88;

    let speed = 38 * diffMult * paceBoost;
    if (type === "scout" || type === "shard") speed *= 1.28;
    if (type === "cruiser") speed *= 0.76;
    if (type === "boss") speed *= 0.52;
    if (type === "jammer") speed *= 1.32;
    if (state.activeTab === "training") speed *= 0.72; // calmer pace for training focus

    const enemy = {
      id: state.nextEntityId++,
      type, // 'standard' | 'scout' | 'cruiser' | 'shard' | 'boss' | 'jammer'
      word,
      typedIndex: 0,
      x,
      y,
      vx: options.vx || 0,
      speed,
      hitFlash: 0,
      bossChain,
      bossPhaseTotal: bossChain ? bossChain.length + 1 : 1,
      bossPhaseCurrent: 1,
       isJammer: type === "jammer",
      sender: options.sender || null,
    };

    state.enemies.push(enemy);
    updateKeyboardHighlight();
    return enemy;
  }

  // WPM & Accuracy Calculations
  function getActiveMinutes() {
    if (!state.firstKeyTime) return 0;
    const ms = Math.max(2200, performance.now() - state.firstKeyTime);
    return ms / 60000;
  }

  function getNetWpm() {
    const mins = getActiveMinutes();
    if (mins <= 0) return 0;
    return Math.round(state.correctKeys / 5 / mins);
  }

  function getRawWpm() {
    const mins = getActiveMinutes();
    if (mins <= 0) return 0;
    return Math.round(state.totalKeys / 5 / mins);
  }

  function getAccuracy() {
    if (state.totalKeys === 0) return 100;
    return Math.round((state.correctKeys / state.totalKeys) * 100);
  }

  function updateBurstPeak() {
    const now = performance.now();
    state.burstTimestamps = state.burstTimestamps.filter((t) => now - t <= 5000);
    if (state.firstKeyTime && now - state.firstKeyTime >= 2500) {
      const burst = Math.round((state.burstTimestamps.length / 5) * 12);
      if (burst > state.peakBurstWpm) state.peakBurstWpm = burst;
    }
  }

  function getLockedEnemy() {
    if (state.lockedEnemyId === null) return null;
    const found = state.enemies.find((e) => e.id === state.lockedEnemyId);
    if (!found) {
      state.lockedEnemyId = null;
      return null;
    }
    return found;
  }

  // Launch / Restart Session
  function startSession( broadcastStart = true ) {
    window.soundEngine.init();
    resizeArena();

    state.phase = "playing";
    state.wave = 1;
    state.shields = 3;
    state.empCharges = 2;
    state.killsTowardEmp = 0;
    state.score = 0;
    state.elapsedFlightSec = 0;
    state.timeRemaining = 60;

    state.enemies = [];
    state.projectiles = [];
    state.particles = [];
    state.shockwaves = [];
    state.floatingTexts = [];
    state.lockedEnemyId = null;

    state.sessionStartTime = performance.now();
    state.firstKeyTime = 0;
    state.correctKeys = 0;
    state.errorKeys = 0;
    state.totalKeys = 0;
    state.combo = 0;
    state.maxCombo = 0;
    state.wordsCleared = 0;
    state.burstTimestamps = [];
    state.peakBurstWpm = 0;
    state.sessionMissedKeys = {};
    state.timelineSamples = [];
    state.lastSampleSec = 0;

    state.peerWpm = 0;
    state.peerAcc = 100;
    state.peerWords = 0;
    state.botTimer = 2.0;

    welcomeOverlay.classList.add("hidden");
    pauseOverlay.classList.add("hidden");
    resultsOverlay.classList.add("hidden");

    launchBtnText.textContent = "RESTART SESSION";
    arenaStatus.textContent = "SECTOR 01 / ENGAGED";
    lockLabel.textContent = "TYPE ANY VISIBLE WORD";
    typedReadout.innerHTML = `ACQUIRE A TARGET<span class="cursor">_</span>`;

    // Wingman ship active in 2P Co-op
    state.wingman.active =
      state.activeTab === "social" && state.socialMode === "coop";

    // Spawn initial wave of words
    for (let i = 0; i < 3; i++) {
      spawnEnemy({ y: 96 + i * 38 });
    }
    state.spawnTimer = 1.1;

    if (broadcastStart && state.peerConnected && state.conn) {
      sendP2P({ type: "start", socialMode: state.socialMode });
    }

    syncUIState();
    updateHudDisplay();
  }

  // Handle Character Keystroke
  function handleCharInput(char) {
    if (state.phase !== "playing") return;

    const now = performance.now();
    if (!state.firstKeyTime) state.firstKeyTime = now;
    state.totalKeys++;

    let locked = getLockedEnemy();
    if (!locked) {
      // Lock onto closest enemy (largest Y) starting with `char`
      const candidates = state.enemies.filter(
        (e) => e.typedIndex < e.word.length && e.word[e.typedIndex] === char
      );
      if (candidates.length > 0) {
        candidates.sort((a, b) => b.y - a.y);
        locked = candidates[0];
        state.lockedEnemyId = locked.id;
        window.soundEngine.playLock();
      } else {
        recordMistake(char);
        return;
      }
    }

    const expected = locked.word[locked.typedIndex];
    if (char === expected) {
      locked.typedIndex++;
      state.correctKeys++;
      state.combo++;
      if (state.combo > state.maxCombo) state.maxCombo = state.combo;
      state.burstTimestamps.push(now);
      updateBurstPeak();

      // Aim player chevron at target
      state.player.targetAngle = Math.atan2(
        locked.y - state.player.y,
        locked.x - state.player.x
      );
      state.player.recoil = 6;

      const isComplete = locked.typedIndex >= locked.word.length;
      window.soundEngine.playShot(
        locked.typedIndex - 1,
        locked.word.length,
        state.combo
      );

      // Fire laser bolt from player ship
      state.projectiles.push({
        x: state.player.x,
        y: state.player.y - 14,
        tx: locked.x,
        ty: locked.y,
        targetId: locked.id,
        color: "#c7ff6a",
        speed: 1450,
      });

      if (isComplete) {
        if (locked.type === "boss" && locked.bossChain && locked.bossChain.length > 0) {
          locked.word = locked.bossChain.shift().toLowerCase();
          locked.typedIndex = 0;
          locked.bossPhaseCurrent++;
          state.wordsCleared++;
          spawnParticles(locked.x, locked.y, "#d9a74a", 16);
          window.soundEngine.playWaveClear();
          addFloatingText(locked.x, locked.y - 22, "SHIELD PHASE BROKEN", "#d9a74a");
        } else {
          state.lockedEnemyId = null;
          completeEnemyWord(locked, false);
        }
      }

      updateTypedReadout();
      updateHudDisplay();
      updateKeyboardHighlight();
    } else {
      recordMistake(expected);
    }
  }

  function recordMistake(expectedChar) {
    state.errorKeys++;
    state.combo = 0;
    if (expectedChar) {
      state.sessionMissedKeys[expectedChar] =
        (state.sessionMissedKeys[expectedChar] || 0) + 1;
      profile.weakKeys[expectedChar] =
        (profile.weakKeys[expectedChar] || 0) + 1;
      saveProfile();
    }
    window.soundEngine.playError();
    updateHudDisplay();
  }

  function completeEnemyWord(enemy, byWingman = false) {
    const idx = state.enemies.findIndex((e) => e.id === enemy.id);
    if (idx !== -1) state.enemies.splice(idx, 1);

    if (!byWingman) {
      state.wordsCleared++;
      state.killsTowardEmp++;
      if (state.killsTowardEmp >= 12 && state.empCharges < 3) {
        state.killsTowardEmp = 0;
        state.empCharges++;
        addFloatingText(state.player.x, state.player.y - 36, "+1 EMP READY", "#5ce1e6");
      }
    }

    // Particle burst
    const burstColor = byWingman
      ? "#8aa8c7"
      : enemy.isJammer || enemy.type === "boss"
      ? "#d96b52"
      : enemy.type === "cruiser"
      ? "#d9a74a"
      : "#c7ff6a";
    spawnParticles(enemy.x, enemy.y, burstColor, 18);
    window.soundEngine.playExplosion(
      enemy.type === "boss"
        ? "boss"
        : enemy.type === "cruiser"
        ? "large"
        : "small"
    );

    // Cruiser splits into 2 shards
    if (enemy.type === "cruiser") {
      spawnEnemy({
        type: "shard",
        x: Math.max(70, enemy.x - 42),
        y: enemy.y,
        vx: -45,
      });
      spawnEnemy({
        type: "shard",
        x: Math.min(width - 70, enemy.x + 42),
        y: enemy.y,
        vx: 45,
      });
    }

    // Multiplayer 1v1 Duel: every 3 words cleared launches a Jammer word to rival!
    if (
      !byWingman &&
      state.activeTab === "social" &&
      state.socialMode === "duel" &&
      state.wordsCleared % 3 === 0
    ) {
      const jamWord = selectWordForSpawn();
      addFloatingText(enemy.x, enemy.y - 16, "JAMMER SENT ↗", "#c7ff6a");
      if (state.peerConnected && state.conn) {
        sendP2P({ type: "jammer", word: jamWord, sender: profile.callsign });
      }
    }

    // Broadcast P2P Telemetry & Co-op assist
    if (!byWingman && state.peerConnected && state.conn) {
      sendP2P({
        type: "telemetry",
        wpm: getNetWpm(),
        acc: getAccuracy(),
        words: state.wordsCleared,
        clearedWord: state.socialMode === "coop" ? enemy.word : null,
      });
    }
  }

  // Detonate EMP Shockwave (Spacebar)
  function triggerEmp() {
    if (state.phase !== "playing" || state.empCharges <= 0 || state.enemies.length === 0) {
      return;
    }
    state.empCharges--;
    window.soundEngine.playEmp();

    state.shockwaves.push({
      x: state.player.x,
      y: state.player.y,
      r: 16,
      maxR: Math.max(width, height) * 0.9,
      alpha: 0.95,
    });

    // Clear lowest 4 threats & push remaining upward
    state.enemies.sort((a, b) => b.y - a.y);
    const removed = state.enemies.splice(0, Math.min(4, state.enemies.length));
    removed.forEach((e) => {
      spawnParticles(e.x, e.y, "#5ce1e6", 14);
      state.wordsCleared++;
    });
    state.enemies.forEach((e) => {
      e.y = Math.max(95, e.y - 110);
    });

    state.lockedEnemyId = null;
    updateTypedReadout();
    updateHudDisplay();
    updateKeyboardHighlight();
  }

  function spawnParticles(x, y, color, count = 16) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = Math.random() * 130 + 30;
      state.particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        r: Math.random() * 2.4 + 1,
        color,
        life: 0.55,
        maxLife: 0.55,
      });
    }
  }

  function addFloatingText(x, y, text, color = "#c7ff6a") {
    state.floatingTexts.push({ x, y, text, color, life: 0.9, maxLife: 0.9 });
  }

  function updateTypedReadout() {
    const locked = getLockedEnemy();
    if (!locked) {
      lockLabel.textContent = "TYPE ANY VISIBLE WORD";
      typedReadout.innerHTML = `ACQUIRE A TARGET<span class="cursor">_</span>`;
      return;
    }
    lockLabel.textContent = locked.isJammer
      ? "INTERCEPTING RIVAL JAMMER"
      : "TARGET LOCKED";
    const done = locked.word.slice(0, locked.typedIndex).toUpperCase();
    const rest = locked.word.slice(locked.typedIndex).toUpperCase();
    typedReadout.innerHTML = `<span class="typed-done">${done}</span>${rest}<span class="cursor">_</span>`;
  }

  function updateHudDisplay() {
    const wpm = getNetWpm();
    const acc = getAccuracy();
    hudWpm.textContent = String(wpm).padStart(2, "0");
    hudAcc.textContent = String(acc);
    hudCombo.textContent = String(state.combo);

    const isCountdown =
      (state.activeTab === "arena" && state.soloMode === "assessment") ||
      (state.activeTab === "social" && state.socialMode === "duel");

    if (isCountdown) {
      hudTime.textContent = String(Math.max(0, Math.ceil(state.timeRemaining)));
    } else {
      hudTime.textContent = String(Math.floor(state.elapsedFlightSec));
    }

    // Shields & EMP
    if (state.activeTab === "training" || (state.activeTab === "arena" && state.soloMode === "assessment")) {
      shieldDiamonds.textContent = "◆ ◆ ◆";
      shieldText.textContent = "TRAINING SHIELDS";
    } else {
      const filled = "◆ ".repeat(Math.max(0, state.shields));
      const empty = "◇ ".repeat(Math.max(0, state.maxShields - state.shields));
      shieldDiamonds.textContent = (filled + empty).trim();
      shieldText.textContent = `${state.shields} SHIELDS REMAINING`;
    }
    empBadge.textContent = `⚡ EMP ×${state.empCharges}`;

    // Multiplayer Bar
    if (state.activeTab === "social") {
      mpSelfStats.textContent = `${wpm} WPM · ${acc}% · ${state.wordsCleared}W`;
      mpPeerStats.textContent = `${state.peerWpm} WPM · ${state.peerAcc}% · ${state.peerWords}W`;
    }
  }

  // Finish Session & Show Post-Game WPM Assessment Overlay
  function endSession() {
    state.phase = "results";
    arenaStatus.textContent = "MISSION / COMPLETE";
    pauseOverlay.classList.add("hidden");
    keyboardDock.classList.add("hidden");
    resultsOverlay.classList.remove("hidden");

    const netWpm = getNetWpm();
    const rawWpm = getRawWpm();
    const acc = getAccuracy();
    const peak = Math.max(netWpm, state.peakBurstWpm);
    const activeSec = Math.max(1, Math.round(state.elapsedFlightSec));

    // Check Personal Best
    const recordKey = `${state.soloMode}:${state.difficulty}`;
    const prevBest = profile.bestWpm[recordKey] || 0;
    const isNewBest = netWpm > prevBest && netWpm > 0;
    if (isNewBest) {
      profile.bestWpm[recordKey] = netWpm;
    }
    profile.lifetimeSessions++;
    profile.lifetimeWords += state.wordsCleared;
    if (netWpm > profile.highestEverWpm) {
      profile.highestEverWpm = netWpm;
    }
    saveProfile();

    // Rank Pill
    const rank =
      netWpm >= 85
        ? "ACE OVERLORD"
        : netWpm >= 65
        ? "SQUADRON ACE"
        : netWpm >= 45
        ? "VANGUARD PILOT"
        : "ORBITAL CADET";
    resRankPill.textContent = rank;

    // Headlines
    if (state.activeTab === "social" && state.socialMode === "duel") {
      const won = netWpm >= state.peerWpm;
      resEyebrow.textContent = won
        ? "DUEL VICTORY // RIVAL OUTPACED"
        : "DUEL COMPLETE // DEBRIEF";
      resHeadline.textContent = won
        ? `You defeated ${mpPeerName.textContent} (${netWpm} vs ${state.peerWpm} WPM)!`
        : `${mpPeerName.textContent} edged ahead (${state.peerWpm} vs ${netWpm} WPM).`;
    } else if (state.challengeTargetWpm > 0) {
      const beat = netWpm >= state.challengeTargetWpm;
      resEyebrow.textContent = beat
        ? "CHALLENGE CONQUERED!"
        : "CHALLENGE ATTEMPT COMPLETE";
      resHeadline.textContent = beat
        ? `You beat ${state.challengeChallenger}'s ${state.challengeTargetWpm} WPM!`
        : `${state.challengeTargetWpm - netWpm} WPM away from ${state.challengeChallenger}'s mark.`;
    } else {
      resEyebrow.textContent = isNewBest
        ? "FLIGHT COMPLETE / NEW PERSONAL BEST"
        : "FLIGHT COMPLETE / WPM ASSESSMENT";
      resHeadline.textContent =
        netWpm >= 70
          ? "Lethal precision in the arena."
          : netWpm >= 45
          ? "Solid rhythm. Your flow is locking in."
          : "Your journey starts here.";
    }

    resNetWpm.textContent = String(netWpm);
    resRawSub.textContent = `Raw Speed: ${rawWpm} WPM · Peak 5s Burst: ${peak} WPM`;
    resAcc.textContent = `${acc}%`;
    resWords.textContent = String(state.wordsCleared);
    resCombo.textContent = `${state.maxCombo}×`;
    resTime.textContent = `${activeSec}s`;

    // Weak Keys Breakdown
    resWeakKeys.innerHTML = "";
    const weakEntries = Object.entries(state.sessionMissedKeys).sort(
      (a, b) => b[1] - a[1]
    );
    if (weakEntries.length === 0) {
      resWeakKeys.innerHTML = `<span class="lime-text" style="font-size:11px;font-family:var(--font)">FLAWLESS — ZERO MISFIRES</span>`;
      resCoaching.textContent =
        "100% keystroke accuracy. Push your burst speed on longer words next round.";
    } else {
      weakEntries.slice(0, 5).forEach(([k, count]) => {
        const chip = document.createElement("span");
        chip.className = "weak-chip";
        chip.innerHTML = `[${k.toUpperCase()}] <b>${count}×</b>`;
        resWeakKeys.appendChild(chip);
      });
      const worstKey = weakEntries[0][0].toUpperCase();
      const fingerInfo = FINGER_MAP[weakEntries[0][0]];
      resCoaching.textContent = `Focus tip: Key [${worstKey}] (${
        fingerInfo ? fingerInfo.label : "INDEX"
      }) had the most misfires. Click 'TRAIN WEAK KEYS' below for a targeted drill.`;
    }

    drawWpmTimelineChart();
    renderKeyboardDOM();
  }

  // Draw Post-Game WPM Timeline Canvas Chart
  function drawWpmTimelineChart() {
    const c = wpmChart;
    const cw = c.clientWidth || 320;
    const ch = c.clientHeight || 86;
    const cdpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = cw * cdpr;
    c.height = ch * cdpr;
    const g = c.getContext("2d");
    g.setTransform(cdpr, 0, 0, cdpr, 0, 0);
    g.clearRect(0, 0, cw, ch);

    const pts =
      state.timelineSamples.length >= 2
        ? state.timelineSamples
        : [
            { wpm: 0, raw: 0 },
            { wpm: getNetWpm(), raw: getRawWpm() },
          ];
    const maxVal = Math.max(50, ...pts.map((p) => Math.max(p.wpm, p.raw))) * 1.15;

    const padX = 8;
    const padY = 10;
    const pw = cw - padX * 2;
    const ph = ch - padY * 2;

    const getX = (i) => padX + (i / Math.max(1, pts.length - 1)) * pw;
    const getY = (v) => padY + ph - (Math.min(maxVal, v) / maxVal) * ph;

    // Grid baseline
    g.strokeStyle = "#1f2a36";
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(padX, padY + ph * 0.5);
    g.lineTo(cw - padX, padY + ph * 0.5);
    g.stroke();

    // Net WPM Curve (#c7ff6a)
    g.beginPath();
    pts.forEach((p, i) => {
      const x = getX(i);
      const y = getY(p.wpm);
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    });
    g.strokeStyle = "#c7ff6a";
    g.lineWidth = 2;
    g.stroke();

    // Area Fill
    g.lineTo(getX(pts.length - 1), padY + ph);
    g.lineTo(getX(0), padY + ph);
    g.closePath();
    const grad = g.createLinearGradient(0, padY, 0, padY + ph);
    grad.addColorStop(0, "rgba(199, 255, 106, 0.28)");
    grad.addColorStop(1, "rgba(199, 255, 106, 0.0)");
    g.fillStyle = grad;
    g.fill();
  }

  // Real-Time WebRTC P2P Room Logic (PeerJS)
  function initPeerRoom(customCode = null, asHost = true) {
    if (!window.Peer) {
      p2pStatusLine.textContent =
        "PeerJS library loading — or switch to AI Simulator.";
      return;
    }
    if (state.peer) {
      state.peer.destroy();
      state.peer = null;
    }

    state.isHost = asHost;
    if (asHost) {
      const code =
        customCode || "KF-" + Math.floor(1000 + Math.random() * 9000);
      state.roomCode = code;
      joinRoomInput.value = code;
      p2pStatusLine.textContent = `Initializing Room ${code}...`;

      const peerId = `keyfall-v2-${code.toLowerCase()}`;
      const peer = new window.Peer(peerId);
      state.peer = peer;

      peer.on("open", () => {
        p2pStatusLine.innerHTML = `Room <strong class="lime-text">${code}</strong> live! Share code or click COPY LINK.`;
        sysStatusText.textContent = `ROOM ${code} // WAITING FOR PEER`;
      });

      peer.on("connection", (conn) => {
        bindPeerConnection(conn);
      });

      peer.on("error", (err) => {
        p2pStatusLine.textContent = `Room notice: ${err.type || "Use AI Simulator or try another code"}`;
      });
    } else {
      const targetCode = (customCode || joinRoomInput.value || "")
        .trim()
        .toUpperCase();
      if (!targetCode) {
        p2pStatusLine.textContent = "Enter a room code (e.g. KF-4821) first.";
        return;
      }
      state.roomCode = targetCode;
      p2pStatusLine.textContent = `Connecting to ${targetCode}...`;

      const peer = new window.Peer();
      state.peer = peer;
      peer.on("open", () => {
        const conn = peer.connect(`keyfall-v2-${targetCode.toLowerCase()}`);
        bindPeerConnection(conn);
      });
      peer.on("error", () => {
        p2pStatusLine.textContent = `Could not reach ${targetCode}. Check code or use AI Simulator.`;
      });
    }
  }

  function bindPeerConnection(conn) {
    state.conn = conn;
    conn.on("open", () => {
      state.peerConnected = true;
      navPeerBadge.textContent = "LIVE";
      p2pStatusLine.innerHTML = `<span class="lime-text">CONNECTED!</span> Ready to launch ${state.socialMode.toUpperCase()}.`;
      sysStatusText.textContent = `P2P LINK ACTIVE // ${state.roomCode}`;
      sendP2P({ type: "hello", callsign: profile.callsign });
      syncUIState();
    });

    conn.on("data", (data) => {
      if (!data || typeof data !== "object") return;
      if (data.type === "hello") {
        state.peerCallsign = data.callsign || "WINGMAN";
        mpPeerName.textContent = state.peerCallsign;
        // Add to Squadron Roster if not already there
        if (!profile.friends.some((f) => f.name === state.peerCallsign)) {
          profile.friends.unshift({
            name: state.peerCallsign,
            bestWpm: 60,
            status: "P2P SQUAD",
          });
          saveProfile();
          renderSquadRoster();
        }
      } else if (data.type === "start") {
        if (data.socialMode) state.socialMode = data.socialMode;
        startSession(false);
      } else if (data.type === "telemetry") {
        state.peerWpm = data.wpm || 0;
        state.peerAcc = data.acc || 100;
        state.peerWords = data.words || 0;
        // In Co-op mode, when partner clears a word, their ship fires a laser on our screen!
        if (
          state.socialMode === "coop" &&
          state.phase === "playing" &&
          state.enemies.length > 0 &&
          data.clearedWord
        ) {
          wingmanAssistFire();
        }
        updateHudDisplay();
      } else if (data.type === "jammer" && state.phase === "playing") {
        spawnEnemy({
          type: "jammer",
          word: data.word,
          sender: data.sender || state.peerCallsign,
        });
        addFloatingText(width / 2, 125, `⚠ INCOMING JAMMER FROM ${state.peerCallsign}!`, "#ff4d6d");
      }
    });

    conn.on("close", () => {
      state.peerConnected = false;
      navPeerBadge.textContent = "P2P";
      p2pStatusLine.textContent = "Peer disconnected.";
    });
  }

  function sendP2P(payload) {
    if (state.conn && state.peerConnected) {
      try {
        state.conn.send(payload);
      } catch (_) {}
    }
  }

  // Wingman Co-op Assist Shot (used by P2P Partner or AI Wingman)
  function wingmanAssistFire() {
    if (state.enemies.length === 0) return;
    const unlocked = state.enemies.filter((e) => e.id !== state.lockedEnemyId);
    const target =
      unlocked.length > 0
        ? unlocked.sort((a, b) => b.y - a.y)[0]
        : state.enemies[0];
    if (!target) return;

    state.wingman.targetAngle = Math.atan2(
      target.y - state.wingman.y,
      target.x - state.wingman.x
    );
    state.wingman.recoil = 6;
    state.projectiles.push({
      x: state.wingman.x,
      y: state.wingman.y - 14,
      tx: target.x,
      ty: target.y,
      targetId: target.id,
      color: "#5ce1e6",
      speed: 1350,
    });
    completeEnemyWord(target, true);
  }

  // Main Simulation Update Loop
  let lastTime = performance.now();

  function update(dt) {
    // Drift starfield
    for (const s of stars) {
      s.y += s.speed * (state.phase === "playing" ? 1.3 : 0.45) * dt;
      if (s.y > height) {
        s.y = 0;
        s.x = Math.random() * width;
      }
    }

    // Position ships at bottom of Arena
    if (state.wingman.active) {
      state.player.x = width * 0.42;
      state.player.y = height - 42;
      state.wingman.x = width * 0.58;
      state.wingman.y = height - 42;
    } else {
      state.player.x = width * 0.5;
      state.player.y = height - 42;
    }

    state.player.angle +=
      (state.player.targetAngle - state.player.angle) * Math.min(1, dt * 16);
    state.player.recoil = Math.max(0, state.player.recoil - dt * 25);
    state.wingman.angle +=
      (state.wingman.targetAngle - state.wingman.angle) * Math.min(1, dt * 16);
    state.wingman.recoil = Math.max(0, state.wingman.recoil - dt * 25);

    if (state.phase !== "playing") return;

    state.elapsedFlightSec += dt;

    // Sample WPM every 3 seconds for Timeline Chart
    if (state.elapsedFlightSec - state.lastSampleSec >= 3) {
      state.lastSampleSec = state.elapsedFlightSec;
      state.timelineSamples.push({
        wpm: getNetWpm(),
        raw: getRawWpm(),
      });
    }

    // Countdown Timer in Assessment & 1v1 Duel
    const isCountdown =
      (state.activeTab === "arena" && state.soloMode === "assessment") ||
      (state.activeTab === "social" && state.socialMode === "duel");

    if (isCountdown) {
      state.timeRemaining -= dt;
      if (state.timeRemaining <= 0) {
        state.timeRemaining = 0;
        window.soundEngine.playWaveClear();
        endSession();
        return;
      }
    }

    // AI Bot Simulation (when in Social mode without a live P2P peer, or AI selected)
    if (
      state.activeTab === "social" &&
      (!state.peerConnected || state.partnerType === "bot")
    ) {
      const targetBotWpm =
        state.difficulty === "cadet"
          ? 42
          : state.difficulty === "pilot"
          ? 64
          : 88;
      state.peerWpm = Math.round(
        targetBotWpm + Math.sin(state.elapsedFlightSec * 0.6) * 5
      );
      state.peerAcc = state.difficulty === "ace" ? 98 : 95;

      state.botTimer -= dt;
      if (state.botTimer <= 0) {
        state.botTimer = Math.max(1.8, 60 / (targetBotWpm / 5) * 3.2);
        state.peerWords++;
        if (state.socialMode === "coop") {
          wingmanAssistFire();
        } else if (state.socialMode === "duel" && state.peerWords % 3 === 0) {
          spawnEnemy({
            type: "jammer",
            sender: `AI-${state.difficulty.toUpperCase()}`,
          });
          addFloatingText(width / 2, 125, "⚠ INCOMING RIVAL JAMMER!", "#ff4d6d");
        }
      }
    }

    // Spawn Enemies
    state.spawnTimer -= dt;
    const maxActive = state.activeTab === "training" ? 5 : 8;
    if (state.spawnTimer <= 0 && state.enemies.length < maxActive) {
      spawnEnemy();
      const baseInterval =
        state.difficulty === "cadet"
          ? 1.9
          : state.difficulty === "pilot"
          ? 1.45
          : 1.05;
      state.spawnTimer = baseInterval * (0.8 + Math.random() * 0.4);
    }

    // Update Enemies
    const breachLineY = height - 76;
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const e = state.enemies[i];
      e.hitFlash = Math.max(0, e.hitFlash - dt * 6);
      e.x += e.vx * dt;
      e.vx *= Math.pow(0.25, dt);
      e.x = Math.max(70, Math.min(width - 70, e.x));
      e.y += e.speed * dt;

      if (e.y >= breachLineY) {
        if (state.lockedEnemyId === e.id) {
          state.lockedEnemyId = null;
          updateTypedReadout();
        }
        state.enemies.splice(i, 1);
        state.combo = 0;
        spawnParticles(e.x, breachLineY, "#ff4d6d", 20);
        window.soundEngine.playError();

        const usesHardShields =
          (state.activeTab === "arena" && state.soloMode === "survival") ||
          (state.activeTab === "social" && state.socialMode === "coop");

        if (usesHardShields) {
          state.shields--;
          if (state.shields <= 0) {
            endSession();
            return;
          }
        }
        updateKeyboardHighlight();
      }
    }

    // Update Projectiles
    for (let i = state.projectiles.length - 1; i >= 0; i--) {
      const p = state.projectiles[i];
      const t = state.enemies.find((e) => e.id === p.targetId);
      if (t) {
        p.tx = t.x;
        p.ty = t.y;
      }
      const dx = p.tx - p.x;
      const dy = p.ty - p.y;
      const dist = Math.hypot(dx, dy);
      const step = p.speed * dt;
      if (dist <= step + 8) {
        if (t) t.hitFlash = 1;
        spawnParticles(p.tx, p.ty, p.color, 5);
        state.projectiles.splice(i, 1);
      } else {
        p.x += (dx / dist) * step;
        p.y += (dy / dist) * step;
      }
    }

    // Update Particles
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const pt = state.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life -= dt;
      if (pt.life <= 0) state.particles.splice(i, 1);
    }

    // Update Shockwaves
    for (let i = state.shockwaves.length - 1; i >= 0; i--) {
      const sw = state.shockwaves[i];
      sw.r += (sw.maxR - sw.r) * dt * 5 + 90 * dt;
      sw.alpha -= dt * 1.4;
      if (sw.alpha <= 0) state.shockwaves.splice(i, 1);
    }

    // Update Floating Texts
    for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
      const ft = state.floatingTexts[i];
      ft.y -= 28 * dt;
      ft.life -= dt;
      if (ft.life <= 0) state.floatingTexts.splice(i, 1);
    }

    updateHudDisplay();
  }

  // Render Arena Canvas
  function render() {
    ctx.clearRect(0, 0, width, height);

    // 1. Concentric Tactical Radar Arcs around Player Chevron
    const cx = width * 0.5;
    const cy = height - 38;
    ctx.strokeStyle = "rgba(38, 56, 73, 0.34)";
    ctx.lineWidth = 1;
    [140, 260, 390, 520].forEach((radius) => {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, Math.PI, 0, false);
      ctx.stroke();
    });

    // 2. Starfield Particles
    for (const s of stars) {
      ctx.fillStyle = `rgba(215, 230, 245, ${s.alpha})`;
      ctx.beginPath();
      ctx.arc(s.x % width, s.y % height, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. EMP Shockwaves
    for (const sw of state.shockwaves) {
      ctx.save();
      ctx.strokeStyle = `rgba(92, 225, 230, ${Math.max(0, sw.alpha)})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 4. Laser Projectiles
    for (const p of state.projectiles) {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 5. Falling Enemy Targets (Diamond Reticle + Orbitron Word Pill)
    if (state.phase === "playing" || state.phase === "paused") {
      drawEnemies();
    }

    // 6. Particles & Floating Popups
    for (const pt of state.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (const ft of state.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.life / ft.maxLife);
      ctx.font = "700 11px 'Orbitron', sans-serif";
      ctx.fillStyle = ft.color;
      ctx.textAlign = "center";
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    // 7. Bottom Lime Player Fighter Chevron (+ Steel-Blue Wingman in 2P Co-op)
    drawChevronShip(state.player.x, state.player.y, state.player.angle, "#c7ff6a", state.player.recoil);
    if (state.wingman.active) {
      drawChevronShip(state.wingman.x, state.wingman.y, state.wingman.angle, "#8aa8c7", state.wingman.recoil);
    }
  }

  function drawChevronShip(x, y, angle, color, recoil) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2);

    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.strokeStyle = color;
    ctx.fillStyle = "rgba(16, 24, 32, 0.85)";
    ctx.lineWidth = 1.8;

    const k = recoil;
    ctx.beginPath();
    ctx.moveTo(0, -15 + k);
    ctx.lineTo(11, 12 + k);
    ctx.lineTo(0, 6 + k);
    ctx.lineTo(-11, 12 + k);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  function drawEnemies() {
    const locked = getLockedEnemy();
    const ordered = [...state.enemies].sort((a, b) => {
      if (locked && a.id === locked.id) return 1;
      if (locked && b.id === locked.id) return -1;
      return a.y - b.y;
    });

    const placedBoxes = [];

    for (const e of ordered) {
      const isLocked = locked && locked.id === e.id;
      ctx.save();

      // Measure word in Orbitron font
      const fontSize = e.type === "boss" ? 15 : isLocked ? 14 : 13;
      ctx.font = `700 ${fontSize}px 'Orbitron', sans-serif`;

      const wordStr = e.word;
      const doneStr = wordStr.slice(0, e.typedIndex);
      const nextStr = wordStr.slice(e.typedIndex, e.typedIndex + 1);
      const restStr = wordStr.slice(e.typedIndex + 1);

      const totalW = ctx.measureText(wordStr).width;
      const doneW = ctx.measureText(doneStr).width;
      const nextW = ctx.measureText(nextStr).width;

      const padX = 14;
      const boxW = totalW + padX * 2;
      const boxH = 30;
      const boxX = Math.max(10, Math.min(width - boxW - 10, e.x - boxW / 2));
      let boxY = e.y;

      // De-overlap word pills so no two words ever stack on each other
      for (let attempt = 0; attempt < 4; attempt++) {
        const hit = placedBoxes.find(
          (b) =>
            boxX < b.x + b.w + 6 &&
            boxX + boxW + 6 > b.x &&
            boxY < b.y + b.h + 24 &&
            boxY + boxH + 24 > b.y
        );
        if (!hit) break;
        boxY = hit.y + hit.h + 24;
      }
      placedBoxes.push({ x: boxX, y: boxY, w: boxW, h: boxH });

      const shipX = boxX + boxW / 2;
      const shipY = boxY - 14;

      // 1. Tactical Vector Ship Silhouette + Hollow Diamond Reticle above Word Pill
      ctx.save();
      ctx.translate(shipX, shipY);

      const strokeCol = isLocked
        ? "#c7ff6a"
        : e.isJammer || e.type === "boss"
        ? "#d96b52"
        : e.type === "cruiser"
        ? "#d9a74a"
        : "#556c82";
      ctx.strokeStyle = strokeCol;
      ctx.fillStyle = "rgba(11, 18, 26, 0.9)";
      ctx.lineWidth = isLocked ? 1.7 : 1.25;

      if (e.type === "boss") {
        // Dreadnought Octagonal Flagship + Phase Pips
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.lineTo(14, 3);
        ctx.lineTo(16, -6);
        ctx.lineTo(7, -12);
        ctx.lineTo(-7, -12);
        ctx.lineTo(-16, -6);
        ctx.lineTo(-14, 3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        const pipsLeft = (e.bossPhaseTotal || 3) - (e.bossPhaseCurrent || 1) + 1;
        for (let p = 0; p < (e.bossPhaseTotal || 3); p++) {
          ctx.fillStyle = p < pipsLeft ? "#d96b52" : "#253342";
          ctx.fillRect(-13 + p * 10, -18, 7, 3);
        }
      } else if (e.type === "cruiser") {
        // Heavy Hexagonal Splitter Hull + Inner Diamond
        ctx.beginPath();
        for (let a = 0; a < 6; a++) {
          const ang = (a * Math.PI) / 3 + Math.PI / 6;
          const px = Math.cos(ang) * 10;
          const py = Math.sin(ang) * 10;
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.rotate(Math.PI / 4);
        ctx.strokeRect(-3.5, -3.5, 7, 7);
      } else if (e.type === "scout" || e.type === "shard") {
        // Sleek Dart Scout
        ctx.beginPath();
        ctx.moveTo(0, 8);
        ctx.lineTo(8, -6);
        ctx.lineTo(0, -3);
        ctx.lineTo(-8, -6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        // Signature Hollow Diamond Target Marker with subtle wing ticks
        ctx.beginPath();
        ctx.moveTo(-12, 0);
        ctx.lineTo(-7, 0);
        ctx.moveTo(7, 0);
        ctx.lineTo(12, 0);
        ctx.stroke();

        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-4.5, -4.5, 9, 9);
        ctx.strokeRect(-4.5, -4.5, 9, 9);
      }
      ctx.restore();

      // 2. Dark Rectangular Tactical Word Pill
      ctx.fillStyle = isLocked ? "rgba(18, 28, 23, 0.96)" : "rgba(11, 18, 27, 0.92)";
      ctx.strokeStyle = isLocked
        ? "#c7ff6a"
        : e.isJammer || e.type === "boss"
        ? "rgba(217, 107, 82, 0.65)"
        : e.type === "cruiser"
        ? "rgba(217, 167, 74, 0.55)"
        : "rgba(38, 56, 73, 0.85)";
      ctx.lineWidth = isLocked ? 1.5 : 1;

      ctx.beginPath();
      ctx.rect(boxX, boxY, boxW, boxH);
      ctx.fill();
      ctx.stroke();

      // 3. Render Word in Orbitron
      const textX = boxX + padX;
      const textY = boxY + 20;
      ctx.textAlign = "left";

      if (doneStr) {
        ctx.fillStyle = "#c7ff6a";
        ctx.fillText(doneStr, textX, textY);
      }
      if (nextStr) {
        ctx.fillStyle = isLocked ? "#ffffff" : "#d8e5f2";
        ctx.fillText(nextStr, textX + doneW, textY);
      }
      if (restStr) {
        ctx.fillStyle = isLocked ? "#d8e5f2" : "#9db0c4";
        ctx.fillText(restStr, textX + doneW + nextW, textY);
      }

      ctx.restore();
    }
  }

  function animate(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    update(dt);
    render();
    requestAnimationFrame(animate);
  }

  // Populate Flight Record Modal (<dialog>)
  function renderStatsDialog() {
    const lifetimeGrid = document.getElementById("lifetimeStatsGrid");
    const recordsList = document.getElementById("recordsList");

    lifetimeGrid.innerHTML = `
      <div class="life-card">
        <span>PEAK WPM</span>
        <strong>${profile.highestEverWpm} WPM</strong>
      </div>
      <div class="life-card">
        <span>SESSIONS FLOWN</span>
        <strong>${profile.lifetimeSessions}</strong>
      </div>
      <div class="life-card">
        <span>WORDS CLEARED</span>
        <strong>${profile.lifetimeWords}</strong>
      </div>
    `;

    const labels = [
      ["assessment:cadet", "WPM Assessment · Cadet"],
      ["assessment:pilot", "WPM Assessment · Pilot"],
      ["assessment:ace", "WPM Assessment · Ace"],
      ["survival:cadet", "Endless Survival · Cadet"],
      ["survival:pilot", "Endless Survival · Pilot"],
      ["survival:ace", "Endless Survival · Ace"],
    ];

    recordsList.innerHTML = labels
      .map(
        ([key, title]) => `
        <div class="record-row">
          <span>${title}</span>
          <strong>${profile.bestWpm[key] || 0} WPM</strong>
        </div>
      `
      )
      .join("");
  }

  // Event Listeners — Navigation Tabs
  navTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      navTabs.forEach((t) => t.classList.remove("nav-active"));
      tab.classList.add("nav-active");
      state.activeTab = tab.dataset.tab;
      syncUIState();
    });
  });

  // Solo Modes
  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".mode-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.soloMode = btn.dataset.mode;
      syncUIState();
    });
  });

  // Solo Difficulty
  document.querySelectorAll("#soloDiffGroup .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll("#soloDiffGroup .seg-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.difficulty = btn.dataset.diff;
      syncUIState();
    });
  });

  // Training Drills
  document.querySelectorAll(".drill-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".drill-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.trainingDrill = btn.dataset.drill;
      syncUIState();
    });
  });

  // Keyboard Finger Guide Toggle
  document.querySelectorAll("#guideToggleGroup .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll("#guideToggleGroup .seg-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.keyboardGuideOn = btn.dataset.guide === "on";
      syncUIState();
    });
  });

  // Social Modes (Duel vs Co-op)
  document.querySelectorAll(".social-mode-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".social-mode-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.socialMode = btn.dataset.social;
      syncUIState();
    });
  });

  // Partner Type (Live P2P vs AI Simulator)
  document.querySelectorAll("#partnerTypeGroup .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll("#partnerTypeGroup .seg-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.partnerType = btn.dataset.partner;
      syncUIState();
    });
  });

  // P2P Room Buttons
  createRoomBtn.addEventListener("click", () => {
    initPeerRoom(null, true);
  });

  joinRoomBtn.addEventListener("click", () => {
    initPeerRoom(joinRoomInput.value, false);
  });

  copyInviteBtn.addEventListener("click", () => {
    if (!state.roomCode) {
      initPeerRoom(null, true);
    }
    const url = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(
      state.roomCode
    )}&mode=${state.socialMode}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      copyInviteBtn.textContent = "COPIED ↗";
      setTimeout(() => {
        copyInviteBtn.textContent = "COPY LINK ↗";
      }, 1800);
    }
  });

  // Add Friend to Squadron Roster
  addFriendBtn.addEventListener("click", () => {
    const callsign = window.prompt("Enter friend's Pilot Callsign:");
    if (callsign && callsign.trim()) {
      profile.friends.unshift({
        name: callsign.trim().toUpperCase().slice(0, 14),
        bestWpm: 65,
        status: "SQUAD MATE",
      });
      saveProfile();
      renderSquadRoster();
    }
  });

  // Edit Own Pilot Callsign
  editCallsignBtn.addEventListener("click", () => {
    const next = window.prompt("Set your Pilot Callsign:", profile.callsign);
    if (next && next.trim()) {
      profile.callsign = next.trim().toUpperCase().slice(0, 14);
      pilotCallsignDisplay.textContent = profile.callsign;
      saveProfile();
      syncUIState();
    }
  });

  // Sound Toggle
  soundToggleBtn.addEventListener("click", () => {
    const muted = window.soundEngine.toggleMute();
    soundLabel.textContent = muted ? "SOUND OFF" : "SOUND ON";
  });

  // Stats Modal
  openStatsBtn.addEventListener("click", () => {
    renderStatsDialog();
    if (statsDialog.showModal) statsDialog.showModal();
  });
  closeStatsBtn.addEventListener("click", () => {
    if (statsDialog.close) statsDialog.close();
  });

  // Launch / Resume / Quit / Results Actions
  launchBtn.addEventListener("click", () => startSession(true));
  letsFlyBtn.addEventListener("click", () => startSession(true));
  retryBtn.addEventListener("click", () => startSession(true));

  resumeBtn.addEventListener("click", () => {
    if (state.phase === "paused") {
      state.phase = "playing";
      arenaStatus.textContent = "SECTOR 01 / ENGAGED";
      pauseOverlay.classList.add("hidden");
    }
  });

  quitToResultsBtn.addEventListener("click", () => {
    endSession();
  });

  // Jump directly from Post-Game Assessment into Adaptive Weak-Key Clinic!
  trainWeakBtn.addEventListener("click", () => {
    navTabs.forEach((t) =>
      t.classList.toggle("nav-active", t.dataset.tab === "training")
    );
    state.activeTab = "training";
    document.querySelectorAll(".drill-btn").forEach((b) =>
      b.classList.toggle("active", b.dataset.drill === "weakkeys")
    );
    state.trainingDrill = "weakkeys";
    syncUIState();
    startSession(false);
  });

  // Copy Challenge Link from Post-Game Results
  shareChallengeBtn.addEventListener("click", () => {
    const wpm = getNetWpm();
    const url = `${window.location.origin}${window.location.pathname}?challenge=${wpm}&by=${encodeURIComponent(
      profile.callsign
    )}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      shareChallengeBtn.textContent = "CHALLENGE LINK COPIED ↗";
      setTimeout(() => {
        shareChallengeBtn.textContent = "CHALLENGE FRIEND ↗";
      }, 2000);
    }
  });

  empBadge.addEventListener("click", triggerEmp);

  // Global Keyboard Handler
  window.addEventListener("keydown", (e) => {
    if (document.activeElement === joinRoomInput) return;
    if (statsDialog.open) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (state.phase === "standby" || state.phase === "results") {
      if (e.key === "Enter") {
        e.preventDefault();
        startSession(true);
      }
      return;
    }

    if (state.phase === "paused") {
      if (e.key === "Escape" || e.key === "Enter") {
        e.preventDefault();
        state.phase = "playing";
        arenaStatus.textContent = "SECTOR 01 / ENGAGED";
        pauseOverlay.classList.add("hidden");
      }
      return;
    }

    if (state.phase === "playing") {
      if (e.key === "Escape") {
        e.preventDefault();
        state.phase = "paused";
        arenaStatus.textContent = "FLIGHT / PAUSED";
        pauseOverlay.classList.remove("hidden");
        return;
      }
      if (e.key === "Backspace") {
        e.preventDefault();
        state.lockedEnemyId = null;
        window.soundEngine.playSwitch();
        updateTypedReadout();
        updateKeyboardHighlight();
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        if (state.enemies.length > 0) {
          const sorted = [...state.enemies].sort((a, b) => b.y - a.y);
          const idx = sorted.findIndex((en) => en.id === state.lockedEnemyId);
          state.lockedEnemyId = sorted[(idx + 1) % sorted.length].id;
          window.soundEngine.playSwitch();
          updateTypedReadout();
          updateKeyboardHighlight();
        }
        return;
      }
      if (e.key === " ") {
        e.preventDefault();
        triggerEmp();
        return;
      }
      if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        handleCharInput(e.key.toLowerCase());
      }
    }
  });

  // Check URL Query Params (?room=KF-1234 or ?challenge=75&by=PILOT)
  function checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get("room");
    const modeParam = params.get("mode");
    const challengeParam = params.get("challenge");
    const byParam = params.get("by");

    if (roomParam) {
      navTabs.forEach((t) =>
        t.classList.toggle("nav-active", t.dataset.tab === "social")
      );
      state.activeTab = "social";
      if (modeParam === "coop" || modeParam === "duel") {
        state.socialMode = modeParam;
      }
      joinRoomInput.value = roomParam.toUpperCase();
      syncUIState();
      setTimeout(() => initPeerRoom(roomParam, false), 600);
    } else if (challengeParam) {
      state.challengeTargetWpm = parseInt(challengeParam, 10) || 0;
      state.challengeChallenger = (byParam || "A COLLEAGUE").toUpperCase();
      welcomeEyebrow.textContent = `INCOMING DUEL CHALLENGE // ${state.challengeChallenger}`;
      welcomeTitle.textContent = `Beat ${state.challengeTargetWpm} WPM in the Arena.`;
    }
  }

  checkUrlParams();
  syncUIState();

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => requestAnimationFrame(animate));
  } else {
    requestAnimationFrame(animate);
  }
})();
