/* ==========================================================================
   GARBA NIGHT 🌷 — script.js
   ========================================================================== */

(function () {
  'use strict';

  /* =======================================================================
     1. CONFIG — names yahin se badlo
     ======================================================================= */
  const CONFIG = {
    people: {
      haldi:  'Haldi',   // dark yellow dress wali
      laal:   'Laal',    // red kurta + mummy ke jeans wali
      gulabi: 'Gulabi'   // boy, 6'1", pink kurta, light beard
    },
    shareText: 'Do ladkiyan, ek 6\'1" ladka, aur ek garba circle 🌷',
    teaseMessages: [
      'Arre, dhyan se!',
      'Yeh bhi nahi pakda? 😭',
      'Meri naak mat kaato yaar',
      'Ekdum fatafat pakdo!',
      'Garba mein bhi aisa hi tha tu',
      'Chal, thoda better karo',
      'Haath kaise kaanp rahe hain',
      'Bas thoda aur, himmat rakho',
      'Main dekh rahi hoon 👀',
      'Yellow wali bhi dekh rahi hai',
      'Aaram se, jaldi nahi',
      'Shabaash! Ab aage badho',
      'Itna bhi mushkil nahi hai',
      'Haan haan, ab samajh aaya'
    ],
    gameOverLines: [
      { title: 'Bas? Itna hi?', text: 'Ab samajh aaya tum log kyun has rahe the.' },
      { title: 'Teen miss. Teen.', text: 'Red kurta wali ab officially judge kar rahi hai.' },
      { title: 'Garba mein bhi aisa hi tha', text: 'Koi baat nahi. Practice se sab theek ho jaata hai.' }
    ]
  };

  /* =======================================================================
     2. UTILS
     ======================================================================= */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.prototype.slice.call(root.querySelectorAll(sel));

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const rand  = (a, b) => a + Math.random() * (b - a);
  const pick  = (arr) => arr[(Math.random() * arr.length) | 0];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =======================================================================
     3. NAMES
     ======================================================================= */
  function applyNames() {
    Object.keys(CONFIG.people).forEach(function (key) {
      const name = CONFIG.people[key];
      $$('[data-name="' + key + '"]').forEach(function (el) {
        el.textContent = name;
      });
    });
  }

  /* =======================================================================
     4. VEIL
     ======================================================================= */
  function initVeil() {
    const veil    = $('#veil');
    const openBtn = $('#openBtn');
    if (!veil || !openBtn) return;

    function open() {
      veil.classList.add('is-gone');
      document.body.classList.remove('is-locked');

      Audio.unlock();
      Petals.start();
      Reveal.refresh();

      window.setTimeout(function () {
        veil.setAttribute('hidden', '');
        veil.style.display = 'none';
      }, 900);
    }

    openBtn.addEventListener('click', open);
    openBtn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  }

  /* =======================================================================
     5. REVEAL
     ======================================================================= */
  const Reveal = (function () {
    let observer = null;

    function build() {
      const items = $$('.reveal');
      if (!('IntersectionObserver' in window) || reduceMotion) {
        items.forEach(function (el) { el.classList.add('is-visible'); });
        return;
      }

      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

      items.forEach(function (el) { observer.observe(el); });
    }

    function refresh() {
      if (!observer) return;
      $$('.reveal:not(.is-visible)').forEach(function (el) {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.92) {
          el.classList.add('is-visible');
          observer.unobserve(el);
        }
      });
    }

    return { build: build, refresh: refresh };
  })();

  /* =======================================================================
     6. CARDS
     ======================================================================= */
  function initCards() {
    $$('.card').forEach(function (card) {
      const toggle = $('.card__toggle', card);
      const note   = $('.card__note', card);
      if (!toggle || !note) return;

      toggle.addEventListener('click', function () {
        const isOpen = note.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        toggle.firstChild.textContent = isOpen ? 'close the note ' : 'read the note ';
      });
    });
  }

  /* =======================================================================
     7. TOAST
     ======================================================================= */
  const Toast = (function () {
    let el = null;
    let timer = 0;

    function show(msg, ms) {
      if (!el) el = $('#toast');
      if (!el) return;
      el.textContent = msg;
      el.classList.add('is-on');
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        el.classList.remove('is-on');
      }, ms || 2400);
    }

    return { show: show };
  })();

  /* =======================================================================
     8. SHARE
     ======================================================================= */
  function initShare() {
    const btn = $('#shareBtn');
    if (!btn) return;

    btn.addEventListener('click', async function () {
      const url  = window.location.href;
      const data = { title: document.title, text: CONFIG.shareText, url: url };

      try {
        if (navigator.share) {
          await navigator.share(data);
          return;
        }
      } catch (err) {
        /* cancelled — copy instead */
      }

      try {
        await navigator.clipboard.writeText(url);
        Toast.show('Link copy ho gaya 🌷');
      } catch (err) {
        Toast.show('Link: ' + url, 4200);
      }
    });
  }

  /* =======================================================================
     9. PETALS
     ======================================================================= */
  const Petals = (function () {
    const canvas = document.getElementById('petals');
    if (!canvas) return { start: function () {} };

    const ctx = canvas.getContext('2d');

    let W = 0, H = 0, dpr = 1;
    let petals = [];
    let raf = 0;
    let running = false;
    let last = 0;

    const COLORS = [
      'rgba(242, 193, 78, 0.55)',
      'rgba(239, 91, 115, 0.50)',
      'rgba(255, 209, 138, 0.48)',
      'rgba(214, 106, 130, 0.42)',
      'rgba(255, 240, 200, 0.34)'
    ];

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width  = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function make(count) {
      petals = [];
      for (let i = 0; i < count; i++) {
        petals.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: rand(3.5, 8.5),
          vy: rand(14, 42),
          drift: rand(-14, 14),
          rot: rand(0, Math.PI * 2),
          vr: rand(-0.9, 0.9),
          sway: rand(0.4, 1.4),
          phase: rand(0, Math.PI * 2),
          color: pick(COLORS),
          alpha: rand(0.5, 1)
        });
      }
    }

    function spawnCount() {
      if (reduceMotion) return 12;
      const base = Math.round((W * H) / 26000);
      return clamp(base, 14, 54);
    }

    function drawPetal(p) {
      const r = p.r;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.bezierCurveTo(r * 1.15, -r * 0.55, r * 0.92, r * 0.72, 0, r);
      ctx.bezierCurveTo(-r * 0.92, r * 0.72, -r * 1.15, -r * 0.55, 0, -r);
      ctx.fill();
      ctx.restore();
    }

    function loop(t) {
      if (!running) return;
      if (!last) last = t;
      const dt = Math.min(48, t - last) / 1000;
      last = t;

      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        p.phase += dt * p.sway;
        p.y += p.vy * dt;
        p.x += (p.drift + Math.sin(p.phase) * 14) * dt;
        p.rot += p.vr * dt;

        if (p.y - p.r > H + 20) {
          p.y = -20;
          p.x = Math.random() * W;
        }
        if (p.x < -30) p.x = W + 30;
        if (p.x > W + 30) p.x = -30;

        drawPetal(p);
      }

      raf = window.requestAnimationFrame(loop);
    }

    function start() {
      if (running || reduceMotion) return;
      running = true;
      last = 0;
      raf = window.requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      window.cancelAnimationFrame(raf);
    }

    function onResize() {
      size();
      make(spawnCount());
    }

    size();
    make(spawnCount());

    window.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else if (!document.body.classList.contains('is-locked')) start();
    });

    return { start: start, stop: stop };
  })();

  /* =======================================================================
     10. AUDIO
     ======================================================================= */
  const Audio = (function () {
    let ctx = null;
    let enabled = true;

    function unlock() {
      if (ctx) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try { ctx = new AC(); } catch (e) { ctx = null; }
    }

    function beep(freq, dur, type, gainValue) {
      if (!enabled || !ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type || 'sine';
      osc.frequency.value = freq;

      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(gainValue || 0.08, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + (dur || 0.16));

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + (dur || 0.16) + 0.03);
    }

    return {
      unlock: unlock,
      catchTulip: function () { beep(660, 0.14, 'sine', 0.07); },
      miss:       function () { beep(180, 0.22, 'triangle', 0.08); },
      over:       function () { beep(140, 0.34, 'sawtooth', 0.06); },
      setEnabled: function (v) { enabled = v; },
      isEnabled:  function () { return enabled; }
    };
  })();

  /* =======================================================================
     11. GAME
     ======================================================================= */
  const Game = (function () {
    const wrap     = document.getElementById('gameWrap');
    const canvas   = document.getElementById('gameCanvas');
    if (!wrap || !canvas) return { init: function () {} };

    const ctx      = canvas.getContext('2d');

    const scoreEl  = $('#score');
    const livesEl  = $('#lives');
    const overlay  = $('#gameOverlay');
    const ovTitle  = $('#ovTitle');
    const ovText   = $('#ovText');
    const playBtn  = $('#playBtn');
    const teaseEl  = $('#tease');
    const soundBtn = $('#soundBtn');

    let W = 0, H = 0, dpr = 1;
    let running = false;
    let raf = 0;
    let last = 0;

    let score = 0;
    let lives = 3;
    let speedMul = 1;

    const tulips = [];
    const sparks = [];

    let spawnTimer = 0;
    let spawnEvery = 880;

    let dragging = false;
    let targetX = 0;

    const keyLeft  = { active: false };
    const keyRight = { active: false };

    const paddle = { x: 0, w: 96, h: 18, y: 0 };

    let teaseTimer = 0;
    let bubbleTimer = 0;

    function resize() {
      const rect = wrap.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.round(rect.width);
      H = Math.round(rect.height);

      canvas.width  = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      paddle.w = clamp(W * 0.17, 74, 116);
      paddle.h = 18;
      paddle.y = H - Math.max(52, H * 0.10);

      if (!paddle.x) paddle.x = W / 2;
      paddle.x = clamp(paddle.x, paddle.w / 2, W - paddle.w / 2);
      if (!targetX) targetX = paddle.x;
    }

    function updateHud() {
      if (scoreEl) scoreEl.textContent = String(score);
      if (livesEl) {
        livesEl.textContent = lives > 0
          ? new Array(lives + 1).join('❤')
          : '💔';
      }
    }

    function showBubble(msg) {
      if (!teaseEl) return;
      teaseEl.textContent = msg;
      teaseEl.classList.add('is-on');
      window.clearTimeout(bubbleTimer);
      bubbleTimer = window.setTimeout(function () {
        teaseEl.classList.remove('is-on');
      }, 1600);
    }

    function drawTulip(x, y, r, headColor, stemColor, rot) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);

      ctx.strokeStyle = stemColor;
      ctx.lineWidth = Math.max(2, r * 0.16);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, r * 0.2);
      ctx.quadraticCurveTo(r * 0.18, r * 0.9, 0, r * 1.5);
      ctx.stroke();

      ctx.fillStyle = stemColor;
      ctx.beginPath();
      ctx.ellipse(r * 0.34, r * 0.95, r * 0.34, r * 0.15, -0.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = headColor;
      ctx.beginPath();
      ctx.moveTo(0, r * 0.35);
      ctx.bezierCurveTo(-r * 0.95, r * 0.15, -r * 0.85, -r * 0.85, 0, -r * 0.55);
      ctx.bezierCurveTo(r * 0.85, -r * 0.85, r * 0.95, r * 0.15, 0, r * 0.35);
      ctx.fill();

      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(-r * 0.22, -r * 0.22, r * 0.2, r * 0.34, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.restore();
    }

    function roundRect(x, y, w, h, r) {
      const rr = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + rr, y);
      ctx.arcTo(x + w, y, x + w, y + h, rr);
      ctx.arcTo(x + w, y + h, x, y + h, rr);
      ctx.arcTo(x, y + h, x, y, rr);
      ctx.arcTo(x, y, x + w, y, rr);
      ctx.closePath();
    }

    function drawPaddle() {
      const x = paddle.x;
      const y = paddle.y;
      const w = paddle.w;
      const h = paddle.h;

      ctx.save();

      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.ellipse(x, y + h + 8, w * 0.45, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      const grad = ctx.createLinearGradient(0, y, 0, y + h * 2.1);
      grad.addColorStop(0, '#f2c14e');
      grad.addColorStop(1, '#a9740f');

      ctx.fillStyle = grad;
      roundRect(x - w / 2, y + h * 0.35, w, h * 1.5, 8);
      ctx.fill();

      ctx.strokeStyle = 'rgba(90, 55, 5, 0.4)';
      ctx.lineWidth = 1.4;
      for (let i = 1; i < 4; i++) {
        const ly = y + h * 0.35 + (h * 1.5 / 4) * i;
        ctx.beginPath();
        ctx.moveTo(x - w / 2 + 4, ly);
        ctx.lineTo(x + w / 2 - 4, ly);
        ctx.stroke();
      }

      ctx.fillStyle = '#fbe08a';
      roundRect(x - w / 2 - 3, y, w + 6, h * 0.55, h * 0.28);
      ctx.fill();

      drawTulip(x, y - 4, 9, '#ef5b73', '#4a8a4a', 0);

      ctx.restore();
    }

    const TULIP_COLORS = [
      ['#ef5b73', '#3f7a3f'],
      ['#f2c14e', '#4a8a4a'],
      ['#ff8fa3', '#3f7a3f'],
      ['#f7e07a', '#4a8a4a'],
      ['#e2415a', '#2f6b2f']
    ];

    function spawnTulip() {
      const c = pick(TULIP_COLORS);
      const r = rand(13, 19);
      tulips.push({
        x: rand(r + 10, W - r - 10),
        y: -r * 2,
        r: r,
        vy: rand(78, 118) * speedMul,
        rot: rand(-0.35, 0.35),
        vr: rand(-0.9, 0.9),
        head: c[0],
        stem: c[1]
      });
    }

    function addSparks(x, y, color) {
      for (let i = 0; i < 9; i++) {
        sparks.push({
          x: x, y: y,
          vx: rand(-90, 90),
          vy: rand(-140, -30),
          life: 1,
          color: color
        });
      }
    }

    function update(dt) {
      const dts = dt / 1000;

      if (keyLeft.active)  targetX -= 520 * dts;
      if (keyRight.active) targetX += 520 * dts;

      targetX = clamp(targetX, paddle.w / 2, W - paddle.w / 2);
      paddle.x += (targetX - paddle.x) * Math.min(1, dts * 16);

      spawnTimer += dt;
      if (spawnTimer >= spawnEvery) {
        spawnTimer = 0;
        spawnTulip();
        if (score > 14 && Math.random() < 0.28) spawnTulip();
      }

      for (let i = tulips.length - 1; i >= 0; i--) {
        const t = tulips[i];
        t.y += t.vy * dts;
        t.rot += t.vr * dts;

        const caught =
          t.y + t.r >= paddle.y &&
          t.y + t.r <= paddle.y + paddle.h * 2.2 &&
          Math.abs(t.x - paddle.x) <= paddle.w / 2 + t.r * 0.7;

        if (caught) {
          tulips.splice(i, 1);
          score++;
          updateHud();
          addSparks(t.x, t.y, t.head);
          Audio.catchTulip();

          if (score % 6 === 0) {
            speedMul = Math.min(2.3, speedMul + 0.13);
            spawnEvery = Math.max(430, spawnEvery - 42);
          }

          teaseTimer++;
          if (teaseTimer >= 4) {
            teaseTimer = 0;
            showBubble(pick(CONFIG.teaseMessages));
          }
          continue;
        }

        if (t.y - t.r > H) {
          tulips.splice(i, 1);
          lives--;
          updateHud();
          Audio.miss();

          if (lives <= 0) {
            endGame();
            return;
          }
        }
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx * dts;
        s.y += s.vy * dts;
        s.vy += 320 * dts;
        s.life -= dts * 1.8;
        if (s.life <= 0) sparks.splice(i, 1);
      }
    }

    function render() {
      ctx.clearRect(0, 0, W, H);

      const g = ctx.createRadialGradient(W / 2, H + 30, 10, W / 2, H + 30, H * 0.75);
      g.addColorStop(0, 'rgba(242, 193, 78, 0.16)');
      g.addColorStop(1, 'rgba(242, 193, 78, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      for (let i = 0; i < tulips.length; i++) {
        const t = tulips[i];
        drawTulip(t.x, t.y, t.r, t.head, t.stem, t.rot);
      }

      for (let i = 0; i < sparks.length; i++) {
        const s = sparks[i];
        ctx.globalAlpha = Math.max(0, s.life);
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2.6 * s.life + 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      drawPaddle();
    }

    function loop(t) {
      if (!running) return;
      if (!last) last = t;
      const dt = Math.min(46, t - last);
      last = t;

      update(dt);
      if (!running) return;
      render();

      raf = window.requestAnimationFrame(loop);
    }

    function startGame() {
      resize();

      score = 0;
      lives = 3;
      speedMul = 1;
      spawnEvery = 880;
      spawnTimer = 0;
      teaseTimer = 0;
      tulips.length = 0;
      sparks.length = 0;
      paddle.x = W / 2;
      targetX = W / 2;

      updateHud();
      if (teaseEl) teaseEl.classList.remove('is-on');
      overlay.classList.add('is-hidden');

      running = true;
      last = 0;
      raf = window.requestAnimationFrame(loop);
    }

    function endGame() {
      running = false;
      window.cancelAnimationFrame(raf);
      Audio.over();

      const line = pick(CONFIG.gameOverLines);
      ovTitle.textContent = line.title;
      ovText.textContent = line.text;
      playBtn.textContent = 'Ek aur try';

      overlay.classList.remove('is-hidden');
    }

    function pointerX(e) {
      const rect = canvas.getBoundingClientRect();
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      return clamp(cx - rect.left, 0, W);
    }

    function onPointerDown(e) {
      if (!running) return;
      dragging = true;
      targetX = pointerX(e);
      if (e.cancelable) e.preventDefault();
    }

    function onPointerMove(e) {
      if (!running || !dragging) return;
      targetX = pointerX(e);
      if (e.cancelable) e.preventDefault();
    }

    function onPointerUp() { dragging = false; }

    function onKeyDown(e) {
      if (!running) return;
      if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') { keyLeft.active = true;  e.preventDefault(); }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { keyRight.active = true; e.preventDefault(); }
    }

    function onKeyUp(e) {
      if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') keyLeft.active = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keyRight.active = false;
    }

    function init() {
      resize();
      updateHud();
      render();

      playBtn.addEventListener('click', startGame);

      canvas.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove, { passive: false });
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);

      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);

      if ('ResizeObserver' in window) {
        new ResizeObserver(function () {
          resize();
          if (!running) render();
        }).observe(wrap);
      } else {
        window.addEventListener('resize', function () {
          resize();
          if (!running) render();
        }, { passive: true });
      }

      document.addEventListener('visibilitychange', function () {
        if (document.hidden && running) {
          running = false;
          window.cancelAnimationFrame(raf);
        }
      });

      if (soundBtn) {
        soundBtn.addEventListener('click', function () {
          const now = !Audio.isEnabled();
          Audio.setEnabled(now);
          soundBtn.setAttribute('aria-pressed', now ? 'true' : 'false');
          soundBtn.textContent = now ? '🔊' : '🔇';
        });
      }
    }

    return { init: init };
  })();

  /* =======================================================================
     12. BOOT
     ======================================================================= */
  function boot() {
    applyNames();
    Reveal.build();
    initCards();
    initShare();
    Game.init();
    initVeil();

    if (window.location.hash) {
      window.addEventListener('load', function () {
        Reveal.refresh();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();