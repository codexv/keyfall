// KEYFALL // Tactical Orbital Typing Shooter & WPM Assessment Engine

(function () {
  "use strict";

  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");

  // UI Elements
  const hud = document.getElementById("hud");
  const hudModeLabel = document.getElementById("hud-mode-label");
  const hudWave = document.getElementById("hud-wave");
  const hudWpm = document.getElementById("hud-wpm");
  const hudAcc = document.getElementById("hud-acc");
  const hudCombo = document.getElementById("hud-combo");
  const hudScore = document.getElementById("hud-score");
  const hudShields = document.getElementById("hud-shields");
  const hudEmp = document.getElementById("hud-emp");
  const empTriggerBtn = document.getElementById("emp-trigger-btn");
  const btnFinishAssess = document.getElementById("btn-finish-assess");
  const btnMute = document.getElementById("btn-mute");

  const targetBar = document.getElementById("target-bar");
  const lockedWordDisplay = document.getElementById("locked-word-display");

  const startScreen = document.getElementById("start-screen");
  const assessmentScreen = document.getElementById("assessment-screen");
  const btnLaunch = document.getElementById("btn-launch");
  const btnRetry = document.getElementById("btn-retry");
  const btnMenu = document.getElementById("btn-menu");

  // Assessment Elements
  const assessStatusPill = document.getElementById("assess-status-pill");
  const assessSummaryLine = document.getElementById("assess-summary-line");
  const assessRank = document.getElementById("assess-rank");
  const assessRankTitle = document.getElementById("assess-rank-title");
  const statNetWpm = document.getElementById("stat-net-wpm");
  const statWpmPercentile = document.getElementById("stat-wpm-percentile");
  const statRawWpm = document.getElementById("stat-raw-wpm");
  const statCpm = document.getElementById("stat-cpm");
  const statAccuracy = document.getElementById("stat-accuracy");
  const statKeystrokes = document.getElementById("stat-keystrokes");
  const statPeakWpm = document.getElementById("stat-peak-wpm");
  const statMaxCombo = document.getElementById("stat-max-combo");
  const weakKeysList = document.getElementById("weak-keys-list");
  const statKills = document.getElementById("stat-kills");
  const statDuration = document.getElementById("stat-duration");
  const statFastestWord = document.getElementById("stat-fastest-word");
  const statFinalScore = document.getElementById("stat-final-score");
  const wpmChartCanvas = document.getElementById("wpm-chart");

  // Configuration
  const DIFF_MULTIPLIERS = {
    cadet: 0.78,
    vanguard: 1.0,
    overdrive: 1.35,
  };

  let width = window.innerWidth;
  let height = window.innerHeight;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  // Background Starfield
  const stars = [];
  for (let i = 0; i < 140; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.4,
      speed: Math.random() * 28 + 8,
      alpha: Math.random() * 0.65 + 0.2,
      hue: Math.random() > 0.8 ? 190 : 215,
    });
  }

  // Game State
  const state = {
    phase: "menu", // 'menu' | 'playing' | 'assessment'
    mode: "survival", // 'survival' | 'timed60' | 'timed120'
    difficulty: "vanguard",
    wave: 1,
    score: 0,
    shields: 3,
    maxShields: 3,
    empCharges: 2,
    maxEmpCharges: 3,
    killsTowardEmp: 0,

    // Wave / Spawning
    waveEnemiesRemaining: 0,
    spawnTimer: 0,
    spawnInterval: 1.5,
    waveBannerTimer: 0,
    waveBannerText: "",
    waveBannerSub: "",

    // Timed mode
    timeRemaining: 60,
    totalDuration: 60,

    // Entities
    enemies: [],
    projectiles: [],
    particles: [],
    shockwaves: [],
    floatingTexts: [],
    lockedEnemyId: null,
    nextEntityId: 1,

    // Player ship
    player: {
      x: width / 2,
      y: height - 78,
      angle: -Math.PI / 2,
      targetAngle: -Math.PI / 2,
      recoil: 0,
      muzzleFlash: 0,
      errorFlash: 0,
    },

    // Screen Shake
    shakeTime: 0,
    shakeMagnitude: 0,

    // WPM & Typing Telemetry
    sessionStartTime: 0,
    firstKeyTime: 0,
    elapsedActiveSec: 0,
    correctKeystrokes: 0,
    errorKeystrokes: 0,
    totalKeystrokes: 0,
    currentCombo: 0,
    maxCombo: 0,
    wordsDestroyed: 0,
    keystrokeTimestamps: [], // timestamps (ms) of correct keystrokes for rolling burst WPM
    errorTimestamps: [],
    peakBurstWpm: 0,
    missedKeys: {}, // char -> count
    attemptedKeys: {}, // char -> count
    completedWords: [], // { word, wpm }
    timelineSamples: [], // { timeSec, netWpm, rawWpm, errorsInWindow }
    lastSampleTime: 0,
    errorsSinceLastSample: 0,
  };

  // Word Selection Helper (avoids duplicate starting letters on screen when possible)
  function pickWord(tier = "medium") {
    const bank = window.WORD_BANKS[tier] || window.WORD_BANKS.medium;
    const activeFirstLetters = new Set(
      state.enemies.map((e) => e.word[e.typedIndex] || e.word[0])
    );

    // Try up to 25 times to find a word with a unique starting letter and not already active
    const activeWords = new Set(state.enemies.map((e) => e.word));
    for (let i = 0; i < 25; i++) {
      const candidate = bank[Math.floor(Math.random() * bank.length)];
      if (!activeWords.has(candidate) && !activeFirstLetters.has(candidate[0])) {
        return candidate;
      }
    }
    // Fallback: any word not currently active
    for (let i = 0; i < 15; i++) {
      const candidate = bank[Math.floor(Math.random() * bank.length)];
      if (!activeWords.has(candidate)) return candidate;
    }
    return bank[Math.floor(Math.random() * bank.length)];
  }

  // Trigger Screen Shake
  function addScreenShake(magnitude, duration = 0.22) {
    state.shakeMagnitude = Math.max(state.shakeMagnitude, magnitude);
    state.shakeTime = Math.max(state.shakeTime, duration);
  }

  // Spawn Floating Popup Text
  function addFloatingText(x, y, text, color = "#00e5ff", size = 13) {
    state.floatingTexts.push({
      x,
      y,
      vy: -38,
      text,
      color,
      size,
      life: 0.95,
      maxLife: 0.95,
    });
  }

  // Spawn Particle Burst
  function spawnExplosionParticles(x, y, color, count = 24, speedScale = 1) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 170 + 35) * speedScale;
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3.2 + 1.2,
        color,
        life: Math.random() * 0.55 + 0.25,
        maxLife: 0.8,
      });
    }
  }

  // Start New Game Session
  function startGame() {
    window.soundEngine.init();

    state.phase = "playing";
    state.wave = 1;
    state.score = 0;
    state.shields = 3;
    state.empCharges = 2;
    state.killsTowardEmp = 0;

    state.enemies = [];
    state.projectiles = [];
    state.particles = [];
    state.shockwaves = [];
    state.floatingTexts = [];
    state.lockedEnemyId = null;

    state.sessionStartTime = performance.now();
    state.firstKeyTime = 0;
    state.elapsedActiveSec = 0;
    state.correctKeystrokes = 0;
    state.errorKeystrokes = 0;
    state.totalKeystrokes = 0;
    state.currentCombo = 0;
    state.maxCombo = 0;
    state.wordsDestroyed = 0;
    state.keystrokeTimestamps = [];
    state.errorTimestamps = [];
    state.peakBurstWpm = 0;
    state.missedKeys = {};
    state.attemptedKeys = {};
    state.completedWords = [];
    state.timelineSamples = [];
    state.lastSampleTime = 0;
    state.errorsSinceLastSample = 0;

    if (state.mode === "timed60") {
      state.totalDuration = 60;
      state.timeRemaining = 60;
      hudModeLabel.textContent = "TIME LEFT";
    } else if (state.mode === "timed120") {
      state.totalDuration = 120;
      state.timeRemaining = 120;
      hudModeLabel.textContent = "TIME LEFT";
    } else {
      hudModeLabel.textContent = "WAVE";
    }

    startScreen.classList.add("hidden");
    assessmentScreen.classList.add("hidden");
    hud.classList.remove("hidden");
    targetBar.classList.remove("hidden");

    setupWave(1);
    updateHud();
    updateLockedWordBar();
  }

  // Configure a Wave
  function setupWave(waveNum) {
    state.wave = waveNum;
    const diffMult = DIFF_MULTIPLIERS[state.difficulty] || 1.0;

    if (state.mode === "survival") {
      state.waveEnemiesRemaining = 6 + waveNum * 3;
      state.spawnInterval = Math.max(0.55, (1.85 - waveNum * 0.09) / diffMult);
      state.spawnTimer = 0.4;
      state.waveBannerText = `WAVE ${String(waveNum).padStart(2, "0")}`;
      state.waveBannerSub =
        waveNum % 3 === 0
          ? "WARNING // DREADNOUGHT FLAGSHIP DETECTED"
          : "INTERCEPT HOSTILE FORMATION";
      state.waveBannerTimer = 2.4;
    } else {
      // Timed WPM Assessment Mode: continuous adaptive stream
      state.waveEnemiesRemaining = 9999;
      state.spawnInterval = 1.25 / diffMult;
      state.spawnTimer = 0.25;
      state.waveBannerText =
        state.mode === "timed60" ? "60S WPM BLITZ" : "120S ENDURANCE TEST";
      state.waveBannerSub = "CONTINUOUS ADAPTIVE TELEMETRY ACTIVE";
      state.waveBannerTimer = 2.2;
    }
  }

  // Spawn an Enemy Ship
  function spawnEnemy(forcedType = null, customX = null, customY = null, customWord = null) {
    const diffMult = DIFF_MULTIPLIERS[state.difficulty] || 1.0;
    // Adaptive speed boost in timed mode based on current WPM
    const liveWpm = getLiveNetWpm();
    const adaptiveFactor =
      state.mode !== "survival"
        ? 1 + Math.min(0.65, Math.max(0, (liveWpm - 45) / 140))
        : 1 + (state.wave - 1) * 0.065;

    let type = forcedType;
    if (!type) {
      const roll = Math.random();
      if (state.wave >= 3 && state.wave % 3 === 0 && state.waveEnemiesRemaining === 1 && state.mode === "survival") {
        type = "boss";
      } else if (state.mode !== "survival" && state.wordsDestroyed > 0 && state.wordsDestroyed % 18 === 0 && !state.enemies.some(e => e.type === "boss")) {
        type = "boss";
      } else if (roll < 0.28) {
        type = "scout";
      } else if (roll < 0.76) {
        type = "interceptor";
      } else {
        type = "cruiser";
      }
    }

    const margin = 90;
    const x = customX !== null ? customX : margin + Math.random() * (width - margin * 2);
    const y = customY !== null ? customY : -36;

    let word = customWord;
    let speed = 42;
    let radius = 18;
    let color = "#00e5ff";
    let points = 100;
    let bossChain = null;

    if (type === "scout") {
      word = word || pickWord("short");
      speed = 58 * diffMult * adaptiveFactor;
      radius = 14;
      color = "#00e5ff";
      points = 90;
    } else if (type === "shard") {
      word = word || pickWord("short");
      speed = 70 * diffMult * adaptiveFactor;
      radius = 12;
      color = "#ffbe0b";
      points = 75;
    } else if (type === "missile") {
      word = word || pickWord("short");
      speed = 78 * diffMult * adaptiveFactor;
      radius = 10;
      color = "#ff2a85";
      points = 60;
    } else if (type === "interceptor") {
      word = word || pickWord("medium");
      speed = 42 * diffMult * adaptiveFactor;
      radius = 18;
      color = "#e2f1ff";
      points = 150;
    } else if (type === "cruiser") {
      word = word || pickWord("long");
      speed = 29 * diffMult * adaptiveFactor;
      radius = 25;
      color = "#ffbe0b";
      points = 280;
    } else if (type === "boss") {
      const chains = window.WORD_BANKS.bossChains;
      const chosenChain = chains[Math.floor(Math.random() * chains.length)].slice();
      word = chosenChain.shift();
      bossChain = chosenChain;
      speed = 19 * diffMult * adaptiveFactor;
      radius = 38;
      color = "#ff2a85";
      points = 750;
    }

    const enemy = {
      id: state.nextEntityId++,
      type,
      x,
      y,
      vx: type === "shard" ? (Math.random() - 0.5) * 90 : 0,
      speed,
      radius,
      color,
      points,
      word: word.toLowerCase(),
      typedIndex: 0,
      incomingHits: 0,
      bossChain,
      bossPhaseTotal: bossChain ? bossChain.length + 1 : 1,
      bossPhaseCurrent: 1,
      missileTimer: 3.4,
      spawnTime: performance.now(),
      firstHitTime: 0,
      hitFlash: 0,
    };

    state.enemies.push(enemy);
    return enemy;
  }

  // Calculate Live Net & Raw WPM
  function getElapsedMinutes() {
    if (!state.firstKeyTime) return 0;
    const elapsedMs = Math.max(2500, performance.now() - state.firstKeyTime);
    return elapsedMs / 60000;
  }

  function getLiveNetWpm() {
    const mins = getElapsedMinutes();
    if (mins <= 0) return 0;
    return Math.round(state.correctKeystrokes / 5 / mins);
  }

  function getLiveRawWpm() {
    const mins = getElapsedMinutes();
    if (mins <= 0) return 0;
    return Math.round(state.totalKeystrokes / 5 / mins);
  }

  function getAccuracyPercent() {
    if (state.totalKeystrokes === 0) return 100;
    return (state.correctKeystrokes / state.totalKeystrokes) * 100;
  }

  // Rolling 5-second burst WPM
  function updateBurstWpm() {
    const now = performance.now();
    const windowMs = 5000;
    state.keystrokeTimestamps = state.keystrokeTimestamps.filter(
      (t) => now - t <= windowMs
    );
    if (now - state.firstKeyTime >= 2500) {
      const charsIn5s = state.keystrokeTimestamps.length;
      const burst = Math.round((charsIn5s / 5) * (60000 / windowMs));
      if (burst > state.peakBurstWpm) {
        state.peakBurstWpm = burst;
      }
    }
  }

  // Record Timeline Sample for Post-Game Chart
  function recordTimelineSample(force = false) {
    if (!state.firstKeyTime) return;
    const elapsedSec = (performance.now() - state.sessionStartTime) / 1000;
    if (!force && elapsedSec - state.lastSampleTime < 2.5) return;

    state.lastSampleTime = elapsedSec;
    state.timelineSamples.push({
      timeSec: Math.round(elapsedSec),
      netWpm: getLiveNetWpm(),
      rawWpm: getLiveRawWpm(),
      errors: state.errorsSinceLastSample,
    });
    state.errorsSinceLastSample = 0;
  }

  // Find currently locked enemy object
  function getLockedEnemy() {
    if (state.lockedEnemyId === null) return null;
    const found = state.enemies.find((e) => e.id === state.lockedEnemyId);
    if (!found) {
      state.lockedEnemyId = null;
      return null;
    }
    return found;
  }

  // Handle Typing Input
  function handleCharacterInput(char) {
    if (state.phase !== "playing") return;

    const now = performance.now();
    if (!state.firstKeyTime) {
      state.firstKeyTime = now;
    }

    state.totalKeystrokes++;
    let locked = getLockedEnemy();

    // If no target locked, find closest threat (largest Y) starting with `char`
    if (!locked) {
      const candidates = state.enemies.filter(
        (e) => e.typedIndex < e.word.length && e.word[e.typedIndex] === char
      );
      if (candidates.length > 0) {
        candidates.sort((a, b) => b.y - a.y);
        locked = candidates[0];
        state.lockedEnemyId = locked.id;
        window.soundEngine.playLock();
      } else {
        // Misfire: no enemy starts with `char`
        registerTypo(char);
        return;
      }
    }

    const expectedChar = locked.word[locked.typedIndex];
    state.attemptedKeys[expectedChar] = (state.attemptedKeys[expectedChar] || 0) + 1;

    if (char === expectedChar) {
      // Hit!
      if (locked.typedIndex === 0) {
        locked.firstHitTime = now;
      }
      locked.typedIndex++;
      locked.incomingHits++;
      state.correctKeystrokes++;
      state.currentCombo++;
      if (state.currentCombo > state.maxCombo) {
        state.maxCombo = state.currentCombo;
      }
      state.keystrokeTimestamps.push(now);
      updateBurstWpm();

      // Aim player turret at locked target
      const dx = locked.x - state.player.x;
      const dy = locked.y - state.player.y;
      state.player.targetAngle = Math.atan2(dy, dx);
      state.player.recoil = 7;
      state.player.muzzleFlash = 1.0;

      // Play laser shot synth
      const isFinalChar = locked.typedIndex >= locked.word.length;
      window.soundEngine.playShot(
        locked.typedIndex - 1,
        locked.word.length,
        state.currentCombo
      );

      // Spawn homing plasma bolt
      state.projectiles.push({
        x: state.player.x + Math.cos(state.player.targetAngle) * 24,
        y: state.player.y + Math.sin(state.player.targetAngle) * 24,
        targetId: locked.id,
        targetX: locked.x,
        targetY: locked.y,
        speed: 1350,
        color: isFinalChar ? "#ffbe0b" : "#00e5ff",
        isFinalChar,
      });

      // If word completed, unlock target immediately so player can type next word seamlessly!
      if (isFinalChar) {
        const wordTimeMs = Math.max(180, now - (locked.firstHitTime || locked.spawnTime));
        const wordWpm = Math.round((locked.word.length / 5) / (wordTimeMs / 60000));
        state.completedWords.push({
          word: locked.word.toUpperCase(),
          wpm: Math.min(260, wordWpm),
        });

        // If Boss has remaining shield phases, advance phase when bolt hits or right now
        if (locked.type === "boss" && locked.bossChain && locked.bossChain.length > 0) {
          const nextWord = locked.bossChain.shift();
          locked.word = nextWord.toLowerCase();
          locked.typedIndex = 0;
          locked.bossPhaseCurrent++;
          locked.firstHitTime = now;
          window.soundEngine.playWaveClear();
          spawnExplosionParticles(locked.x, locked.y, "#ff2a85", 22, 1.1);
          addFloatingText(locked.x, locked.y - 28, "SHIELD PHASE BROKEN!", "#ffbe0b", 12);
          addScreenShake(5, 0.18);
          // Keep boss locked for smooth chaining
        } else {
          state.lockedEnemyId = null;
          destroyEnemy(locked);
        }
      }

      updateHud();
      updateLockedWordBar();
    } else {
      registerTypo(expectedChar);
    }
  }

  function registerTypo(expectedChar) {
    state.errorKeystrokes++;
    state.errorsSinceLastSample++;
    state.currentCombo = 0;
    state.player.errorFlash = 1.0;
    if (expectedChar) {
      state.missedKeys[expectedChar] = (state.missedKeys[expectedChar] || 0) + 1;
    }
    window.soundEngine.playError();
    addScreenShake(4, 0.14);
    updateHud();
  }

  // Destroy Enemy & Spawn Shards/Rewards
  function destroyEnemy(enemy) {
    const idx = state.enemies.findIndex((e) => e.id === enemy.id);
    if (idx !== -1) {
      state.enemies.splice(idx, 1);
    }

    state.wordsDestroyed++;
    state.killsTowardEmp++;
    if (state.killsTowardEmp >= 15 && state.empCharges < state.maxEmpCharges) {
      state.killsTowardEmp = 0;
      state.empCharges++;
      addFloatingText(state.player.x, state.player.y - 45, "+1 EMP CHARGE READY", "#00e5ff", 13);
    }

    const comboMult = 1 + Math.floor(state.currentCombo / 10) * 0.25;
    const gainedScore = Math.round(enemy.points * comboMult);
    state.score += gainedScore;

    // Explosion SFX & Particles
    if (enemy.type === "boss") {
      window.soundEngine.playExplosion("boss");
      spawnExplosionParticles(enemy.x, enemy.y, "#ff2a85", 55, 1.6);
      spawnExplosionParticles(enemy.x, enemy.y, "#ffbe0b", 35, 1.2);
      state.shockwaves.push({
        x: enemy.x,
        y: enemy.y,
        radius: 10,
        maxRadius: 190,
        color: "#ff2a85",
        alpha: 0.9,
      });
      addScreenShake(12, 0.45);
      addFloatingText(enemy.x, enemy.y, `DREADNOUGHT DESTROYED +${gainedScore}`, "#ffbe0b", 15);
    } else if (enemy.type === "cruiser") {
      window.soundEngine.playExplosion("large");
      spawnExplosionParticles(enemy.x, enemy.y, "#ffbe0b", 34, 1.2);
      addScreenShake(7, 0.25);
      addFloatingText(enemy.x, enemy.y, `+${gainedScore}`, "#ffbe0b", 13);

      // Split Cruiser into 2 fast Shards!
      for (let s = -1; s <= 1; s += 2) {
        const shard = spawnEnemy(
          "shard",
          Math.max(60, Math.min(width - 60, enemy.x + s * 36)),
          enemy.y
        );
        shard.vx = s * 65;
      }
    } else {
      window.soundEngine.playExplosion(enemy.type === "scout" ? "small" : "medium");
      spawnExplosionParticles(enemy.x, enemy.y, enemy.color, 22, 1.0);
      addScreenShake(3.5, 0.15);
      addFloatingText(enemy.x, enemy.y, `+${gainedScore}`, "#00e5ff", 12);
    }
  }

  // Trigger EMP Shockwave
  function triggerEmp() {
    if (state.phase !== "playing" || state.empCharges <= 0 || state.enemies.length === 0) {
      return;
    }
    state.empCharges--;
    window.soundEngine.playEmp();
    addScreenShake(14, 0.45);

    state.shockwaves.push({
      x: state.player.x,
      y: state.player.y,
      radius: 20,
      maxRadius: Math.max(width, height) * 0.95,
      color: "#00e5ff",
      alpha: 1.0,
    });

    // Vaporize scouts/shards/missiles/interceptors, push back cruisers & bosses
    const survivors = [];
    for (const enemy of state.enemies) {
      if (enemy.type === "boss" || enemy.type === "cruiser") {
        enemy.y = Math.max(40, enemy.y - 160);
        spawnExplosionParticles(enemy.x, enemy.y, "#00e5ff", 16, 0.9);
        survivors.push(enemy);
      } else {
        spawnExplosionParticles(enemy.x, enemy.y, enemy.color, 18, 1.0);
        state.score += Math.round(enemy.points * 0.5);
        state.wordsDestroyed++;
      }
    }
    state.enemies = survivors;
    if (!getLockedEnemy()) {
      state.lockedEnemyId = null;
    }
    addFloatingText(width / 2, height * 0.45, "EMP SHOCKWAVE DETONATED", "#00e5ff", 18);
    updateHud();
    updateLockedWordBar();
  }

  // Unlock or Switch Target
  function unlockTarget() {
    const locked = getLockedEnemy();
    if (locked) {
      state.lockedEnemyId = null;
      window.soundEngine.playSwitch();
      updateLockedWordBar();
    }
  }

  function cycleTarget() {
    if (state.enemies.length === 0) return;
    const sorted = [...state.enemies].sort((a, b) => b.y - a.y);
    const currentIdx = sorted.findIndex((e) => e.id === state.lockedEnemyId);
    const nextEnemy = sorted[(currentIdx + 1) % sorted.length];
    state.lockedEnemyId = nextEnemy.id;
    window.soundEngine.playSwitch();
    updateLockedWordBar();
  }

  // Update HUD Readouts
  function updateHud() {
    if (state.mode === "survival") {
      hudWave.textContent = String(state.wave).padStart(2, "0");
    } else {
      const secs = Math.max(0, Math.ceil(state.timeRemaining));
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      hudWave.textContent = `${m}:${String(s).padStart(2, "0")}`;
    }

    hudWpm.textContent = getLiveNetWpm();
    hudAcc.textContent = `${Math.round(getAccuracyPercent())}%`;
    hudCombo.textContent = `${state.currentCombo}x`;
    hudScore.textContent = state.score.toLocaleString();

    // Shields
    const shieldSpans = hudShields.querySelectorAll(".pip");
    shieldSpans.forEach((pip, idx) => {
      pip.className = "pip";
      if (idx < state.shields) {
        pip.classList.add(state.shields === 1 ? "danger" : "active");
      }
    });

    // EMP Pips
    const empSpans = hudEmp.querySelectorAll(".emp-pip");
    empSpans.forEach((pip, idx) => {
      pip.className = "emp-pip" + (idx < state.empCharges ? " active" : "");
    });
  }

  function updateLockedWordBar() {
    const locked = getLockedEnemy();
    if (!locked) {
      lockedWordDisplay.innerHTML =
        "NO TARGET LOCKED — TYPE ANY INITIAL LETTER";
      return;
    }
    const typed = locked.word.slice(0, locked.typedIndex).toUpperCase();
    const untyped = locked.word.slice(locked.typedIndex).toUpperCase();
    lockedWordDisplay.innerHTML = `<span class="typed-part">${typed}</span>${untyped}`;
  }

  // End Game & Display WPM Assessment Screen
  function finishAndShowAssessment(reasonTitle = "ASSESSMENT COMPLETE") {
    state.phase = "assessment";
    recordTimelineSample(true);

    hud.classList.add("hidden");
    targetBar.classList.add("hidden");
    assessmentScreen.classList.remove("hidden");

    const netWpm = getLiveNetWpm();
    const rawWpm = getLiveRawWpm();
    const acc = getAccuracyPercent();
    const peakWpm = Math.max(netWpm, state.peakBurstWpm);
    const cpm = Math.round(netWpm * 5);

    // Pilot Rank Grade calculation
    let grade = "C";
    let rankTitle = "ORBITAL CADET";
    const effectiveRating = netWpm * (acc / 100);
    if (effectiveRating >= 90) {
      grade = "S+";
      rankTitle = "CYBERNETIC OVERLORD";
    } else if (effectiveRating >= 72) {
      grade = "S";
      rankTitle = "HYPERDRIVE ACE";
    } else if (effectiveRating >= 55) {
      grade = "A";
      rankTitle = "VANGUARD COMMANDER";
    } else if (effectiveRating >= 38) {
      grade = "B";
      rankTitle = "INTERCEPTOR PILOT";
    }

    assessStatusPill.textContent = reasonTitle;
    const modeLabel =
      state.mode === "survival"
        ? `WAVE SURVIVAL (WAVE ${state.wave})`
        : state.mode === "timed60"
        ? "60S WPM BLITZ"
        : "120S ENDURANCE TEST";
    assessSummaryLine.textContent = `${modeLabel} // ${state.difficulty.toUpperCase()} PROTOCOL`;

    assessRank.textContent = grade;
    assessRankTitle.textContent = rankTitle;

    statNetWpm.textContent = netWpm;
    statWpmPercentile.textContent =
      netWpm >= 80
        ? "Top 2% Orbital Speed"
        : netWpm >= 60
        ? "Top 15% Tactical Speed"
        : netWpm >= 42
        ? "Above Average Cadence"
        : "Standard Combat Cadence";

    statRawWpm.textContent = rawWpm;
    statCpm.textContent = `${cpm} CPM`;
    statAccuracy.textContent = `${acc.toFixed(1)}%`;
    statKeystrokes.textContent = `${state.correctKeystrokes} / ${state.totalKeystrokes} Keys`;
    statPeakWpm.textContent = peakWpm;
    statMaxCombo.textContent = `${state.maxCombo}x Max Streak`;

    statKills.textContent = state.wordsDestroyed;
    const totalSec = Math.max(
      1,
      Math.round((performance.now() - state.sessionStartTime) / 1000)
    );
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    statDuration.textContent = `W${state.wave} · ${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

    if (state.completedWords.length > 0) {
      const fastest = [...state.completedWords].sort((a, b) => b.wpm - a.wpm)[0];
      statFastestWord.textContent = `${fastest.word} (${fastest.wpm} WPM)`;
    } else {
      statFastestWord.textContent = "—";
    }

    statFinalScore.textContent = state.score.toLocaleString();

    // Populate Weak-Keys Diagnostics
    weakKeysList.innerHTML = "";
    const missedEntries = Object.entries(state.missedKeys).sort(
      (a, b) => b[1] - a[1]
    );
    if (missedEntries.length === 0) {
      weakKeysList.innerHTML = `<div class="flawless-badge">FLAWLESS EXECUTION — ZERO KEY MISFIRES</div>`;
    } else {
      missedEntries.slice(0, 5).forEach(([keyChar, misses]) => {
        const attempts = state.attemptedKeys[keyChar] || misses;
        const missRate = Math.min(100, Math.round((misses / (attempts + misses)) * 100));
        const badge = document.createElement("div");
        badge.className = "key-badge";
        badge.innerHTML = `
          <span class="key-char">${keyChar.toUpperCase()}</span>
          <div class="key-meta">
            <strong>${misses} ${misses === 1 ? "MISS" : "MISSES"}</strong>
            <span>${100 - missRate}% HIT RATE</span>
          </div>
        `;
        weakKeysList.appendChild(badge);
      });
    }

    renderAssessmentChart();
  }

  // Render WPM Over Time Chart on Canvas
  function renderAssessmentChart() {
    const c = wpmChartCanvas;
    const cw = c.clientWidth || 540;
    const ch = c.clientHeight || 190;
    const chartDpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = cw * chartDpr;
    c.height = ch * chartDpr;
    const g = c.getContext("2d");
    g.setTransform(chartDpr, 0, 0, chartDpr, 0, 0);

    g.clearRect(0, 0, cw, ch);

    const samples =
      state.timelineSamples.length >= 2
        ? state.timelineSamples
        : [
            { timeSec: 0, netWpm: 0, rawWpm: 0, errors: 0 },
            {
              timeSec: Math.max(5, Math.round((performance.now() - state.sessionStartTime) / 1000)),
              netWpm: getLiveNetWpm(),
              rawWpm: getLiveRawWpm(),
              errors: state.errorKeystrokes,
            },
          ];

    const padL = 38;
    const padR = 16;
    const padT = 16;
    const padB = 26;
    const plotW = cw - padL - padR;
    const plotH = ch - padT - padB;

    const maxWpm = Math.max(
      60,
      ...samples.map((s) => Math.max(s.netWpm, s.rawWpm))
    ) * 1.15;

    // Grid lines
    g.strokeStyle = "rgba(255, 255, 255, 0.08)";
    g.lineWidth = 1;
    g.font = "600 9px 'Orbitron', sans-serif";
    g.fillStyle = "#7f9bb8";
    g.textAlign = "right";

    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const y = padT + (plotH / steps) * i;
      const val = Math.round(maxWpm * (1 - i / steps));
      g.beginPath();
      g.moveTo(padL, y);
      g.lineTo(cw - padR, y);
      g.stroke();
      g.fillText(String(val), padL - 6, y + 3);
    }

    // Helper to map sample index to X/Y
    const getX = (i) =>
      padL + (i / Math.max(1, samples.length - 1)) * plotW;
    const getY = (wpm) =>
      padT + plotH - (Math.min(maxWpm, wpm) / maxWpm) * plotH;

    // 1. Raw WPM Line (Cyan Dashed)
    g.save();
    g.beginPath();
    samples.forEach((s, i) => {
      const x = getX(i);
      const y = getY(s.rawWpm);
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    });
    g.strokeStyle = "rgba(0, 229, 255, 0.65)";
    g.lineWidth = 2;
    g.setLineDash([4, 4]);
    g.stroke();
    g.restore();

    // 2. Net WPM Area + Solid Line (Gold)
    g.save();
    g.beginPath();
    samples.forEach((s, i) => {
      const x = getX(i);
      const y = getY(s.netWpm);
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    });
    g.strokeStyle = "#ffbe0b";
    g.lineWidth = 2.5;
    g.stroke();

    // Fill gradient under Net WPM
    g.lineTo(getX(samples.length - 1), padT + plotH);
    g.lineTo(getX(0), padT + plotH);
    g.closePath();
    const grad = g.createLinearGradient(0, padT, 0, padT + plotH);
    grad.addColorStop(0, "rgba(255, 190, 11, 0.32)");
    grad.addColorStop(1, "rgba(255, 190, 11, 0.0)");
    g.fillStyle = grad;
    g.fill();
    g.restore();

    // 3. Points & Error Markers
    samples.forEach((s, i) => {
      const x = getX(i);
      const y = getY(s.netWpm);

      g.beginPath();
      g.arc(x, y, 3, 0, Math.PI * 2);
      g.fillStyle = "#ffbe0b";
      g.fill();

      if (s.errors > 0) {
        g.beginPath();
        g.arc(x, y, 5.5, 0, Math.PI * 2);
        g.fillStyle = "#ff3860";
        g.fill();
      }
    });

    // X-axis Time Labels
    g.fillStyle = "#7f9bb8";
    g.textAlign = "center";
    const labelStride = Math.max(1, Math.floor(samples.length / 5));
    samples.forEach((s, i) => {
      if (i % labelStride === 0 || i === samples.length - 1) {
        g.fillText(`${s.timeSec}s`, getX(i), ch - 6);
      }
    });
  }

  // Main Update Loop
  let lastFrameTime = performance.now();

  function update(dt) {
    // Update Starfield always
    for (const star of stars) {
      star.y += star.speed * (state.phase === "playing" ? 1.35 : 0.5) * dt;
      if (star.y > height) {
        star.y = 0;
        star.x = Math.random() * width;
      }
    }

    if (state.phase !== "playing") return;

    // Position player ship responsive to resize
    state.player.x = width / 2;
    state.player.y = height - 76;

    // Smooth turret rotation
    const angleDiff = state.player.targetAngle - state.player.angle;
    state.player.angle += angleDiff * Math.min(1, dt * 18);
    state.player.recoil = Math.max(0, state.player.recoil - dt * 28);
    state.player.muzzleFlash = Math.max(0, state.player.muzzleFlash - dt * 8);
    state.player.errorFlash = Math.max(0, state.player.errorFlash - dt * 4);

    if (state.shakeTime > 0) {
      state.shakeTime = Math.max(0, state.shakeTime - dt);
    }

    if (state.waveBannerTimer > 0) {
      state.waveBannerTimer = Math.max(0, state.waveBannerTimer - dt);
    }

    // Timed Mode Countdown
    if (state.mode !== "survival") {
      state.timeRemaining -= dt;
      if (state.timeRemaining <= 0) {
        state.timeRemaining = 0;
        window.soundEngine.playWaveClear();
        finishAndShowAssessment("TIMED WPM BENCHMARK COMPLETE");
        return;
      }
    }

    // Periodic WPM Timeline Sampling
    recordTimelineSample(false);
    updateBurstWpm();

    // Enemy Spawning
    if (state.waveEnemiesRemaining > 0) {
      state.spawnTimer -= dt;
      const maxSimultaneous = state.mode === "survival" ? 6 + state.wave : 10;
      if (state.spawnTimer <= 0 && state.enemies.length < maxSimultaneous) {
        spawnEnemy();
        state.waveEnemiesRemaining--;
        state.spawnTimer = state.spawnInterval * (0.75 + Math.random() * 0.5);
      }
    } else if (state.enemies.length === 0 && state.mode === "survival") {
      // Wave Cleared!
      window.soundEngine.playWaveClear();
      setupWave(state.wave + 1);
    }

    // Update Enemies
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const e = state.enemies[i];
      e.hitFlash = Math.max(0, e.hitFlash - dt * 6);

      // Gentle steering toward player ship X as they descend
      const steerDx = state.player.x - e.x;
      e.x += (e.vx + steerDx * 0.12) * dt;
      e.vx *= Math.pow(0.25, dt);
      e.x = Math.max(70, Math.min(width - 70, e.x));
      e.y += e.speed * dt;

      // Boss fires seeker word missiles periodically
      if (e.type === "boss") {
        e.missileTimer -= dt;
        if (e.missileTimer <= 0 && state.enemies.length < 11) {
          e.missileTimer = 4.2;
          spawnEnemy("missile", e.x + (Math.random() - 0.5) * 70, e.y + 32);
        }
      }

      // Check Hull Breach (enemy reaches player defense line)
      if (e.y >= state.player.y - 24) {
        if (state.lockedEnemyId === e.id) {
          state.lockedEnemyId = null;
        }
        state.enemies.splice(i, 1);
        state.shields--;
        state.currentCombo = 0;
        window.soundEngine.playExplosion("large");
        spawnExplosionParticles(state.player.x, state.player.y, "#ff3860", 36, 1.3);
        addScreenShake(14, 0.4);
        addFloatingText(state.player.x, state.player.y - 40, "HULL SHIELD BREACH!", "#ff3860", 15);
        updateHud();
        updateLockedWordBar();

        if (state.shields <= 0) {
          finishAndShowAssessment("HULL BREACH // MISSION TERMINATED");
          return;
        }
      }
    }

    // Update Homing Plasma Projectiles
    for (let i = state.projectiles.length - 1; i >= 0; i--) {
      const p = state.projectiles[i];
      const target = state.enemies.find((e) => e.id === p.targetId);
      if (target) {
        p.targetX = target.x;
        p.targetY = target.y;
      }
      const dx = p.targetX - p.x;
      const dy = p.targetY - p.y;
      const dist = Math.hypot(dx, dy);
      const step = p.speed * dt;

      if (dist <= step + 10) {
        if (target) {
          target.hitFlash = 1.0;
        }
        spawnExplosionParticles(p.targetX, p.targetY, p.color, 7, 0.55);
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
      pt.vx *= Math.pow(0.15, dt);
      pt.vy *= Math.pow(0.15, dt);
      pt.life -= dt;
      if (pt.life <= 0) {
        state.particles.splice(i, 1);
      }
    }

    // Update Shockwaves
    for (let i = state.shockwaves.length - 1; i >= 0; i--) {
      const sw = state.shockwaves[i];
      sw.radius += (sw.maxRadius - sw.radius) * Math.min(1, dt * 6.5) + 120 * dt;
      sw.alpha -= dt * 1.35;
      if (sw.alpha <= 0) {
        state.shockwaves.splice(i, 1);
      }
    }

    // Update Floating Texts
    for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
      const ft = state.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.life -= dt;
      if (ft.life <= 0) {
        state.floatingTexts.splice(i, 1);
      }
    }

    updateHud();
  }

  // Render Game Scene
  function render() {
    ctx.save();

    // Screen Shake Offset
    if (state.shakeTime > 0 && state.phase === "playing") {
      const sx = (Math.random() - 0.5) * state.shakeMagnitude * 2;
      const sy = (Math.random() - 0.5) * state.shakeMagnitude * 2;
      ctx.translate(sx, sy);
    }

    // Deep Space Background
    const bgGrad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.85,
      40,
      width * 0.5,
      height * 0.5,
      Math.max(width, height)
    );
    bgGrad.addColorStop(0, "#0b1830");
    bgGrad.addColorStop(0.55, "#050b18");
    bgGrad.addColorStop(1, "#02050b");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle Perspective Tactical Grid
    ctx.strokeStyle = "rgba(0, 229, 255, 0.04)";
    ctx.lineWidth = 1;
    const gridSpacing = 80;
    for (let x = (width / 2) % gridSpacing; x < width; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Starfield
    for (const star of stars) {
      ctx.fillStyle = `hsla(${star.hue}, 90%, 80%, ${star.alpha})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }

    if (state.phase === "playing") {
      // Defense Perimeter Line near player
      ctx.save();
      ctx.strokeStyle = "rgba(0, 229, 255, 0.14)";
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(0, state.player.y - 24);
      ctx.lineTo(width, state.player.y - 24);
      ctx.stroke();
      ctx.restore();

      // Target Lock Laser Sight Line
      const locked = getLockedEnemy();
      if (locked) {
        ctx.save();
        ctx.strokeStyle = "rgba(255, 190, 11, 0.25)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(state.player.x, state.player.y);
        ctx.lineTo(locked.x, locked.y);
        ctx.stroke();
        ctx.restore();
      }

      // Shockwaves
      for (const sw of state.shockwaves) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = Math.max(0, sw.alpha);
        ctx.lineWidth = 4;
        ctx.shadowColor = sw.color;
        ctx.shadowBlur = 18;
        ctx.stroke();
        ctx.restore();
      }

      // Projectiles
      for (const p of state.projectiles) {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.isFinalChar ? 4.5 : 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw Enemy Ships first, then Word Labels so text is always crisp & readable on top
      for (const e of state.enemies) {
        drawEnemyShip(e, locked && locked.id === e.id);
      }

      // Draw Enemy Word Labels in Orbitron Font (with vertical de-overlapping)
      drawEnemyWordLabels(locked);

      // Draw Player Turret Ship
      drawPlayerShip();

      // Particles
      for (const pt of state.particles) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
        ctx.fillStyle = pt.color;
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Floating Popups in Orbitron
      for (const ft of state.floatingTexts) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.life / ft.maxLife);
        ctx.font = `800 ${ft.size}px 'Orbitron', sans-serif`;
        ctx.fillStyle = ft.color;
        ctx.textAlign = "center";
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 10;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      // Wave Announcement Banner
      if (state.waveBannerTimer > 0) {
        const alpha = Math.min(1, state.waveBannerTimer * 1.2);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.textAlign = "center";
        ctx.font = "900 34px 'Orbitron', sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#00e5ff";
        ctx.shadowBlur = 20;
        ctx.fillText(state.waveBannerText, width / 2, height * 0.24);

        ctx.font = "700 11px 'Orbitron', sans-serif";
        ctx.fillStyle = "#00e5ff";
        ctx.fillText(state.waveBannerSub, width / 2, height * 0.24 + 24);
        ctx.restore();
      }
    }

    ctx.restore();
  }

  function drawPlayerShip() {
    const p = state.player;
    ctx.save();
    ctx.translate(p.x, p.y);

    // Shield Aura Ring
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 2);
    ctx.strokeStyle =
      p.errorFlash > 0
        ? `rgba(255, 56, 96, ${0.4 + p.errorFlash * 0.5})`
        : state.shields === 1
        ? "rgba(255, 56, 96, 0.35)"
        : "rgba(0, 229, 255, 0.22)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Rotate turret toward locked enemy
    ctx.rotate(p.angle + Math.PI / 2);
    const kick = p.recoil;

    // Thruster Glow
    ctx.fillStyle = "rgba(0, 229, 255, 0.7)";
    ctx.beginPath();
    ctx.moveTo(-7, 14 + kick);
    ctx.lineTo(0, 26 + Math.random() * 6 + kick);
    ctx.lineTo(7, 14 + kick);
    ctx.closePath();
    ctx.fill();

    // Ship Hull
    ctx.fillStyle = "#0b192e";
    ctx.strokeStyle = p.errorFlash > 0 ? "#ff3860" : "#00e5ff";
    ctx.lineWidth = 2.2;
    ctx.shadowColor = p.errorFlash > 0 ? "#ff3860" : "#00e5ff";
    ctx.shadowBlur = 14;

    ctx.beginPath();
    ctx.moveTo(0, -24 + kick);
    ctx.lineTo(18, 14 + kick);
    ctx.lineTo(6, 9 + kick);
    ctx.lineTo(0, 15 + kick);
    ctx.lineTo(-6, 9 + kick);
    ctx.lineTo(-18, 14 + kick);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cockpit Core
    ctx.fillStyle = "#ffbe0b";
    ctx.beginPath();
    ctx.arc(0, -2 + kick, 4, 0, Math.PI * 2);
    ctx.fill();

    // Muzzle Flash
    if (p.muzzleFlash > 0) {
      ctx.fillStyle = `rgba(255, 190, 11, ${p.muzzleFlash})`;
      ctx.beginPath();
      ctx.arc(0, -26 + kick, 6 * p.muzzleFlash, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawEnemyShip(e, isLocked) {
    ctx.save();
    ctx.translate(e.x, e.y);

    // Locked Target Tactical Reticle
    if (isLocked) {
      const pulse = Math.sin(performance.now() * 0.01) * 3;
      const r = e.radius + 9 + pulse;
      ctx.strokeStyle = "#ffbe0b";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    const strokeColor = e.hitFlash > 0 ? "#ffffff" : e.color;
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = e.hitFlash > 0 ? "rgba(255,255,255,0.45)" : "rgba(8, 16, 32, 0.9)";
    ctx.lineWidth = 2;
    ctx.shadowColor = strokeColor;
    ctx.shadowBlur = isLocked ? 16 : 8;

    const r = e.radius;
    ctx.beginPath();
    if (e.type === "scout" || e.type === "shard" || e.type === "missile") {
      // Sleek Dart
      ctx.moveTo(0, r);
      ctx.lineTo(r * 0.85, -r * 0.75);
      ctx.lineTo(0, -r * 0.35);
      ctx.lineTo(-r * 0.85, -r * 0.75);
      ctx.closePath();
    } else if (e.type === "interceptor") {
      // Twin-Wing Fighter
      ctx.moveTo(0, r);
      ctx.lineTo(r, -r * 0.4);
      ctx.lineTo(r * 0.45, -r * 0.85);
      ctx.lineTo(0, -r * 0.4);
      ctx.lineTo(-r * 0.45, -r * 0.85);
      ctx.lineTo(-r, -r * 0.4);
      ctx.closePath();
    } else if (e.type === "cruiser") {
      // Heavy Hexagon Splitter Hull
      for (let a = 0; a < 6; a++) {
        const ang = (a * Math.PI) / 3 + Math.PI / 6;
        const px = Math.cos(ang) * r;
        const py = Math.sin(ang) * r;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    } else if (e.type === "boss") {
      // Dreadnought Octagonal Flagship
      ctx.moveTo(0, r * 1.05);
      ctx.lineTo(r * 0.95, r * 0.35);
      ctx.lineTo(r * 1.15, -r * 0.45);
      ctx.lineTo(r * 0.5, -r * 0.95);
      ctx.lineTo(-r * 0.5, -r * 0.95);
      ctx.lineTo(-r * 1.15, -r * 0.45);
      ctx.lineTo(-r * 0.95, r * 0.35);
      ctx.closePath();
    }
    ctx.fill();
    ctx.stroke();

    // Boss phase pips
    if (e.type === "boss" && e.bossPhaseTotal > 1) {
      const pipsRemaining = e.bossPhaseTotal - e.bossPhaseCurrent + 1;
      for (let p = 0; p < e.bossPhaseTotal; p++) {
        ctx.fillStyle = p < pipsRemaining ? "#ff2a85" : "rgba(255,255,255,0.2)";
        ctx.fillRect(-16 + p * 12, -r - 12, 8, 4);
      }
    }

    ctx.restore();
  }

  function drawEnemyWordLabels(lockedEnemy) {
    // Sort enemies so locked enemy is drawn last (on top), otherwise by Y descending
    const ordered = [...state.enemies].sort((a, b) => {
      if (lockedEnemy && a.id === lockedEnemy.id) return 1;
      if (lockedEnemy && b.id === lockedEnemy.id) return -1;
      return b.y - a.y;
    });

    const placedBoxes = [];

    ctx.save();
    for (const e of ordered) {
      const isLocked = lockedEnemy && lockedEnemy.id === e.id;
      const fontSize = e.type === "boss" ? 17 : isLocked ? 16 : 14;
      ctx.font = `800 ${fontSize}px 'Orbitron', sans-serif`;

      const fullUpper = e.word.toUpperCase();
      const typedStr = fullUpper.slice(0, e.typedIndex);
      const nextChar = fullUpper.slice(e.typedIndex, e.typedIndex + 1);
      const restStr = fullUpper.slice(e.typedIndex + 1);

      const fullWidth = ctx.measureText(fullUpper).width;
      const typedWidth = ctx.measureText(typedStr).width;
      const nextWidth = ctx.measureText(nextChar).width;

      const boxPadX = 10;
      const boxW = fullWidth + boxPadX * 2;
      const boxH = fontSize + 11;
      const boxX = Math.max(8, Math.min(width - boxW - 8, e.x - boxW / 2));
      let boxY = e.y + e.radius + 7;

      // De-overlap against previously placed word labels
      for (let attempt = 0; attempt < 4; attempt++) {
        const collision = placedBoxes.find(
          (b) =>
            boxX < b.x + b.w + 4 &&
            boxX + boxW + 4 > b.x &&
            boxY < b.y + b.h + 3 &&
            boxY + boxH + 3 > b.y
        );
        if (!collision) break;
        boxY = collision.y + collision.h + 4;
      }
      placedBoxes.push({ x: boxX, y: boxY, w: boxW, h: boxH });

      // Label Pill Background
      ctx.fillStyle = isLocked
        ? "rgba(18, 26, 48, 0.96)"
        : "rgba(5, 11, 24, 0.88)";
      ctx.strokeStyle = isLocked
        ? "#ffbe0b"
        : e.type === "boss"
        ? "#ff2a85"
        : "rgba(0, 229, 255, 0.38)";
      ctx.lineWidth = isLocked ? 2 : 1.2;

      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(boxX, boxY, boxW, boxH, 5);
      } else {
        ctx.rect(boxX, boxY, boxW, boxH);
      }
      ctx.fill();
      ctx.stroke();

      // Render Text Segments in Orbitron
      const textStartX = boxX + boxPadX;
      const textBaselineY = boxY + boxH - 6.5;
      ctx.textAlign = "left";

      // 1. Typed segment (Gold dimmed)
      if (typedStr) {
        ctx.fillStyle = "rgba(255, 190, 11, 0.48)";
        ctx.fillText(typedStr, textStartX, textBaselineY);
      }

      // 2. Next Target Letter (Highlighted Gold if locked, Cyan if unlocked)
      if (nextChar) {
        ctx.fillStyle = isLocked ? "#ffbe0b" : "#00e5ff";
        ctx.shadowColor = isLocked ? "#ffbe0b" : "#00e5ff";
        ctx.shadowBlur = isLocked ? 10 : 6;
        ctx.fillText(nextChar, textStartX + typedWidth, textBaselineY);
        ctx.shadowBlur = 0;
      }

      // 3. Remaining Letters (Crisp White)
      if (restStr) {
        ctx.fillStyle = "#f0f7ff";
        ctx.fillText(restStr, textStartX + typedWidth + nextWidth, textBaselineY);
      }
    }
    ctx.restore();
  }

  // Animation Loop
  function loop(now) {
    const dt = Math.min(0.05, (now - lastFrameTime) / 1000);
    lastFrameTime = now;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  // Event Listeners
  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (state.phase === "menu") {
      if (e.key === "Enter") {
        e.preventDefault();
        startGame();
      }
      return;
    }

    if (state.phase === "assessment") {
      if (e.key === "Enter") {
        e.preventDefault();
        startGame();
      }
      return;
    }

    if (state.phase === "playing") {
      if (e.key === "Backspace" || e.key === "Escape") {
        e.preventDefault();
        unlockTarget();
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        cycleTarget();
        return;
      }
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        triggerEmp();
        return;
      }
      if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        handleCharacterInput(e.key.toLowerCase());
      }
    }
  });

  // UI Mode Cards
  document.querySelectorAll(".mode-card").forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".mode-card").forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      state.mode = card.dataset.mode;
    });
  });

  // UI Difficulty Buttons
  document.querySelectorAll(".diff-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".diff-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.difficulty = btn.dataset.diff;
    });
  });

  btnLaunch.addEventListener("click", startGame);
  btnRetry.addEventListener("click", startGame);
  btnMenu.addEventListener("click", () => {
    state.phase = "menu";
    assessmentScreen.classList.add("hidden");
    hud.classList.add("hidden");
    targetBar.classList.add("hidden");
    startScreen.classList.remove("hidden");
  });

  btnFinishAssess.addEventListener("click", () => {
    if (state.phase === "playing") {
      finishAndShowAssessment("MANUAL EXTRACTION // WPM ASSESSMENT");
    }
  });

  empTriggerBtn.addEventListener("click", () => {
    triggerEmp();
  });

  btnMute.addEventListener("click", () => {
    const muted = window.soundEngine.toggleMute();
    btnMute.textContent = muted ? "SFX: OFF" : "SFX: ON";
  });

  // Ensure Orbitron font is ready before starting render loop
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      requestAnimationFrame(loop);
    });
  } else {
    requestAnimationFrame(loop);
  }
})();
