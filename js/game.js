// Main Game Engine: Elektro Meister (سيد الإلكترونيات في ألمانيا)

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.width = 800;
    this.height = 650;

    // Game state
    this.state = 'start'; // 'start', 'playing', 'paused', 'gameover'
    this.score = 0;
    this.euros = parseInt(localStorage.getItem('elektro_meister_euros') || '50', 10);
    this.roundEarnings = 0;
    this.lives = 3;
    this.maxLives = 3;
    this.combo = 0;
    this.maxCombo = 0;
    this.ordersCompleted = 0;
    this.feverTimer = 0;
    this.feverActive = false;
    this.level = 1;

    // Upgrades (Load saved upgrades from localStorage)
    const savedUpgrades = localStorage.getItem('elektro_meister_upgrades');
    this.upgrades = savedUpgrades ? JSON.parse(savedUpgrades) : {
      magnet: 0,
      van: 0,
      shield: 0,
      laser: 0,
      assistant: 0
    };

    // Player Cart & Hero
    this.player = {
      x: this.width / 2,
      y: this.height - 85,
      width: 100,
      height: 70,
      speed: 9,
      vx: 0,
      tilt: 0,
      shieldActive: false,
      avatarImg: new Image(),
      avatarLoaded: false
    };

    // Hero image loading
    this.player.avatarImg.src = 'assets/hero_avatar.png';
    this.player.avatarImg.onload = () => {
      this.player.avatarLoaded = true;
    };

    // Collections
    this.fallingItems = [];
    this.particles = [];
    this.floatingTexts = [];

    // Customer order system
    this.activeOrder = null;
    this.orderProgress = {};
    this.orderIndex = 0;

    // Spawning timers
    this.lastSpawnTime = 0;
    this.spawnInterval = 1400; // ms
    this.lastFrameTime = performance.now();

    // Input state
    this.keys = { left: false, right: false };
    this.touchX = null;

    // Speech bubble for hero
    this.heroQuote = 'أهلاً بكم في متجر الإلكترونيات بألمانيا! 🇩🇪⚡';
    this.heroQuoteTimer = 200;

    // Init
    this.resizeCanvas();
    this.bindEvents();
    this.initNextOrder();
    this.updateHUD();
  }

  resizeCanvas() {
    const container = document.getElementById('canvas-container');
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    this.displayWidth = Math.min(rect.width, 800);
    this.displayHeight = Math.min(rect.height, 650);

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.displayWidth}px`;
    this.canvas.style.height = `${this.displayHeight}px`;

    this.ctx.scale(dpr, dpr);
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resizeCanvas());

    // Keyboard
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.keys.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.keys.right = true;
      }
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        this.togglePause();
      }
      if (this.state === 'start' && (e.key === ' ' || e.key === 'Enter')) {
        this.start();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.keys.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.keys.right = false;
      }
    });

    // Mouse / Touch Move on Canvas
    const handlePointer = (clientX) => {
      if (this.state !== 'playing') return;
      const rect = this.canvas.getBoundingClientRect();
      const relativeX = ((clientX - rect.left) / rect.width) * this.width;
      this.player.x = Math.max(this.player.width / 2, Math.min(this.width - this.player.width / 2, relativeX));
    };

    this.canvas.addEventListener('mousemove', (e) => {
      if (e.buttons === 1 || true) {
        handlePointer(e.clientX);
      }
    });

    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        handlePointer(e.touches[0].clientX);
      }
    }, { passive: false });

    // Touch on-screen buttons
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');

    if (btnLeft && btnRight) {
      const handleTouchStart = (dir) => {
        if (dir === 'left') this.keys.left = true;
        if (dir === 'right') this.keys.right = true;
      };
      const handleTouchEnd = (dir) => {
        if (dir === 'left') this.keys.left = false;
        if (dir === 'right') this.keys.right = false;
      };

      btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); handleTouchStart('left'); });
      btnLeft.addEventListener('touchend', (e) => { e.preventDefault(); handleTouchEnd('left'); });
      btnLeft.addEventListener('mousedown', () => handleTouchStart('left'));
      btnLeft.addEventListener('mouseup', () => handleTouchEnd('left'));

      btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); handleTouchStart('right'); });
      btnRight.addEventListener('touchend', (e) => { e.preventDefault(); handleTouchEnd('right'); });
      btnRight.addEventListener('mousedown', () => handleTouchStart('right'));
      btnRight.addEventListener('mouseup', () => handleTouchEnd('right'));
    }
  }

  start() {
    this.state = 'playing';
    this.score = 0;
    this.roundEarnings = 0;
    this.lives = this.maxLives;
    this.combo = 0;
    this.fallingItems = [];
    this.particles = [];
    this.floatingTexts = [];
    this.feverTimer = 0;
    this.feverActive = false;
    this.level = 1;

    // Reset shield if purchased
    if (this.upgrades.shield > 0) {
      this.player.shieldActive = true;
    }

    this.initNextOrder();
    this.updateHUD();

    document.getElementById('start-overlay').classList.add('hidden');
    document.getElementById('gameover-overlay').classList.add('hidden');
    document.getElementById('pause-overlay').classList.add('hidden');

    this.sayQuote('يا هلا بالشباب! فلنبدأ جمع أرقى قطع ألمانيا ⚡', 250);
    window.soundManager.resume();
  }

  togglePause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      document.getElementById('pause-overlay').classList.remove('hidden');
    } else if (this.state === 'paused') {
      this.state = 'playing';
      document.getElementById('pause-overlay').classList.add('hidden');
      this.lastFrameTime = performance.now();
    }
  }

  sayQuote(text, duration = 180) {
    this.heroQuote = text;
    this.heroQuoteTimer = duration;
    const bubble = document.getElementById('hero-quote-bubble');
    if (bubble) {
      bubble.innerText = text;
      bubble.style.opacity = '1';
    }
  }

  initNextOrder() {
    const orderTemplate = CUSTOMER_ORDERS[this.orderIndex % CUSTOMER_ORDERS.length];
    this.orderIndex++;

    this.activeOrder = JSON.parse(JSON.stringify(orderTemplate));
    this.orderProgress = {};
    for (const key in this.activeOrder.needed) {
      this.orderProgress[key] = 0;
    }
    this.renderOrderUI();
  }

  renderOrderUI() {
    const container = document.getElementById('order-card-content');
    if (!container || !this.activeOrder) return;

    let itemsHtml = '';
    for (const [compId, targetCount] of Object.entries(this.activeOrder.needed)) {
      const current = this.orderProgress[compId] || 0;
      const compInfo = COMPONENT_TYPES[compId];
      const isComplete = current >= targetCount;

      itemsHtml += `
        <div class="order-req-item ${isComplete ? 'completed' : ''}">
          <span class="order-req-icon">${compInfo ? compInfo.icon : '📦'}</span>
          <span class="order-req-label">${compInfo ? compInfo.nameEn : compId}:</span>
          <span class="order-req-count">${Math.min(current, targetCount)}/${targetCount}</span>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="order-header">
        <span class="order-avatar">${this.activeOrder.avatar}</span>
        <div class="order-info">
          <div class="order-client">${this.activeOrder.client} • 📍 ${this.activeOrder.city}</div>
          <div class="order-title">${this.activeOrder.title}</div>
        </div>
        <div class="order-reward">+${this.activeOrder.reward}€</div>
      </div>
      <div class="order-items-grid">${itemsHtml}</div>
    `;
  }

  checkOrderCompletion() {
    if (!this.activeOrder) return;

    let allDone = true;
    for (const [compId, targetCount] of Object.entries(this.activeOrder.needed)) {
      if ((this.orderProgress[compId] || 0) < targetCount) {
        allDone = false;
        break;
      }
    }

    if (allDone) {
      // Bonus earnings!
      const bonus = this.activeOrder.reward;
      this.euros += bonus;
      this.score += bonus * 5;
      this.ordersCompleted++;

      window.soundManager.playOrderComplete();
      this.addFloatingText(`+${bonus}€ طلب مكتمل! 🎉`, this.player.x, this.player.y - 60, '#ffd700', 26);
      this.createFireworkParticles(this.player.x, this.player.y - 40, '#ffd700', 30);

      this.sayQuote(`ممتاز! زبون راضي من ${this.activeOrder.city} وفرصة مكافأة ${bonus}€! 🇩🇪`, 240);

      setTimeout(() => {
        this.initNextOrder();
      }, 1200);
    } else {
      this.renderOrderUI();
    }
  }

  spawnItem() {
    // Determine pool based on fever mode
    let compKeys = Object.keys(COMPONENT_TYPES);
    if (this.feverActive) {
      // Only high-value components during fever mode!
      compKeys = ['cpu', 'gpu', 'ram', 'motherboard', 'german_seal'];
    }

    // Weighted random selection
    const totalWeight = compKeys.reduce((acc, k) => acc + COMPONENT_TYPES[k].weight, 0);
    let rand = Math.random() * totalWeight;
    let selectedKey = compKeys[0];

    for (const key of compKeys) {
      rand -= COMPONENT_TYPES[key].weight;
      if (rand <= 0) {
        selectedKey = key;
        break;
      }
    }

    const comp = COMPONENT_TYPES[selectedKey];
    const size = comp.isSpecial ? 48 : 38;
    const x = Math.random() * (this.width - 120) + 60;
    const speedMultiplier = 1 + (this.level - 1) * 0.08 - (this.upgrades.laser * 0.12);
    const speed = (Math.random() * 1.5 + 2.4) * Math.max(0.6, speedMultiplier);

    this.fallingItems.push({
      comp: comp,
      x: x,
      y: -40,
      size: size,
      speed: speed,
      angle: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 0.04
    });
  }

  update(delta) {
    if (this.state !== 'playing') return;

    // Movement
    if (this.keys.left) {
      this.player.vx = -this.player.speed;
      this.player.tilt = Math.max(-0.15, this.player.tilt - 0.02);
    } else if (this.keys.right) {
      this.player.vx = this.player.speed;
      this.player.tilt = Math.min(0.15, this.player.tilt + 0.02);
    } else {
      this.player.vx *= 0.8;
      this.player.tilt *= 0.85;
    }

    this.player.x += this.player.vx;
    this.player.x = Math.max(this.player.width / 2, Math.min(this.width - this.player.width / 2, this.player.x));

    // Fever mode countdown
    if (this.feverActive) {
      this.feverTimer -= delta;
      if (this.feverTimer <= 0) {
        this.feverActive = false;
        document.getElementById('game-container').classList.remove('fever-active');
        this.sayQuote('انتهى وضع السرعة الفائقة! عدنا للعمل المعتاد ⚡', 150);
      }
    }

    // Hero quote timer
    if (this.heroQuoteTimer > 0) {
      this.heroQuoteTimer--;
      if (this.heroQuoteTimer <= 0) {
        const bubble = document.getElementById('hero-quote-bubble');
        if (bubble) bubble.style.opacity = '0';
      }
    }

    // Spawning
    const now = performance.now();
    const currentInterval = this.feverActive ? 400 : Math.max(700, this.spawnInterval - (this.level * 45));
    if (now - this.lastSpawnTime > currentInterval) {
      this.spawnItem();
      this.lastSpawnTime = now;
    }

    // Magnet Upgrade radius
    const magnetRadius = this.upgrades.magnet * 45;

    // Update falling items
    for (let i = this.fallingItems.length - 1; i >= 0; i--) {
      const item = this.fallingItems[i];
      item.y += item.speed;
      item.angle += item.rotSpeed;

      // Magnetic attraction for good components
      if (!item.comp.isHazard && magnetRadius > 0) {
        const dx = this.player.x - item.x;
        const dy = (this.player.y - 10) - item.y;
        const dist = Math.hypot(dx, dy);

        if (dist < magnetRadius + 90) {
          item.x += (dx / dist) * (3.5 + this.upgrades.magnet * 1.5);
          item.y += (dy / dist) * 2;
        }
      }

      // Robo Assistant Auto-Catch
      if (this.upgrades.assistant > 0 && !item.comp.isHazard && item.comp.price >= 50) {
        const droneX = this.player.x + 75;
        const droneY = this.player.y - 45;
        const ddist = Math.hypot(droneX - item.x, droneY - item.y);
        if (ddist < 95) {
          this.catchItem(item);
          this.createSparkleParticles(droneX, droneY, '#00f0ff', 10);
          this.fallingItems.splice(i, 1);
          continue;
        }
      }

      // Check collision with player cart
      const hitBox = {
        left: this.player.x - this.player.width / 2,
        right: this.player.x + this.player.width / 2,
        top: this.player.y - 30,
        bottom: this.player.y + 35
      };

      if (
        item.x + item.size / 2 > hitBox.left &&
        item.x - item.size / 2 < hitBox.right &&
        item.y + item.size / 2 > hitBox.top &&
        item.y - item.size / 2 < hitBox.bottom
      ) {
        this.handleCollision(item);
        this.fallingItems.splice(i, 1);
        continue;
      }

      // Missed item (fell off screen)
      if (item.y > this.height + 40) {
        if (!item.comp.isHazard && this.combo > 2) {
          // Missed combo breaker
          this.combo = 0;
          this.updateHUD();
        }
        this.fallingItems.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      p.size = Math.max(0, p.size * 0.98);
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= ft.vy;
      ft.alpha -= ft.decay;
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Level progression
    const calculatedLevel = Math.floor(this.score / 600) + 1;
    if (calculatedLevel > this.level) {
      this.level = calculatedLevel;
      this.sayQuote(`ترقية المستوى! وصلت للمستوى ${this.level} في برلين 🇩🇪`, 180);
      window.soundManager.playUpgrade();
      this.createFireworkParticles(this.player.x, this.player.y - 50, '#38bdf8', 25);
    }
  }

  handleCollision(item) {
    if (item.comp.isHazard) {
      this.handleHazard(item.comp);
    } else {
      this.catchItem(item);
    }
  }

  catchItem(item) {
    const comp = item.comp;

    // Special item: German Seal (TÜV)
    if (comp.isSpecial) {
      this.activateFeverMode();
    }

    // Combo streak
    this.combo++;
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }

    // Van Upgrade bonus (+25% per level)
    const vanBonus = 1 + (this.upgrades.van * 0.25);
    const comboMultiplier = Math.min(4, 1 + Math.floor(this.combo / 4) * 0.5);
    const earnedEuros = Math.round(comp.price * vanBonus * (this.feverActive ? 2 : 1));
    const earnedScore = Math.round(earnedEuros * 2 * comboMultiplier);

    this.euros += earnedEuros;
    this.score += earnedScore;

    // Sound
    if (comp.price >= 80 || comp.isSpecial) {
      window.soundManager.playCatch('rare');
    } else {
      window.soundManager.playCatch('normal');
    }

    if (this.combo > 1 && this.combo % 3 === 0) {
      window.soundManager.playCombo(Math.min(10, Math.floor(this.combo / 3)));
    }

    // Visuals
    this.createSparkleParticles(item.x, item.y, comp.color, 14);
    const label = this.combo > 2 ? `+${earnedEuros}€ (x${comboMultiplier})` : `+${earnedEuros}€`;
    this.addFloatingText(label, item.x, item.y - 15, comp.color, 18);

    // Update active order requirements
    if (this.activeOrder && this.activeOrder.needed[comp.id]) {
      this.orderProgress[comp.id] = (this.orderProgress[comp.id] || 0) + 1;
      this.checkOrderCompletion();
    }

    // Random German Meister fun quotes on combos
    if (this.combo === 5) {
      this.sayQuote('سلسلة متتالية ممتازة! جودة ألمانية حقيقية 100%! 👌', 150);
    } else if (this.combo === 10) {
      this.sayQuote('Wunderbar! أنت أسطورة الإلكترونيات هنا! 🔥', 180);
    }

    this.updateHUD();
  }

  handleHazard(comp) {
    // Check if shield protects player
    if (this.player.shieldActive) {
      this.player.shieldActive = false;
      window.soundManager.playZap();
      this.createSparkleParticles(this.player.x, this.player.y, '#38bdf8', 25);
      this.addFloatingText('تم امتصاص الصدمة بالعازل! 🛡️', this.player.x, this.player.y - 40, '#38bdf8', 18);
      this.sayQuote('حمى العازل الكهربائي المتجر من الانفجار! 🛡️', 160);
      return;
    }

    // Reset combo
    this.combo = 0;

    if (comp.isPenaltyOnly) {
      // Fake counterfeit chip: fine/money loss
      this.euros = Math.max(0, this.euros - comp.penalty);
      window.soundManager.playZap();
      this.addFloatingText(`-${comp.penalty}€ قطعة مقلدة! 🚫`, this.player.x, this.player.y - 20, '#ef4444', 18);
      this.sayQuote('انتبه! قطع مقلدة رديئة تخالف المواصفات الألمانية! ❌', 160);
    } else {
      // Direct damage
      this.lives -= comp.damage;
      window.soundManager.playZap();
      this.createSparks(this.player.x, this.player.y - 20, '#ef4444', 25);
      this.addFloatingText(`-${comp.damage} ❤️ التماس خطير!`, this.player.x, this.player.y - 35, '#ff2222', 22);

      // Flash screen red
      document.getElementById('canvas-container').classList.add('damage-flash');
      setTimeout(() => {
        document.getElementById('canvas-container').classList.remove('damage-flash');
      }, 250);

      this.sayQuote('آخ! التماس كهربائي حاد! انتبه للأجهزة! ⚡', 160);

      if (this.lives <= 0) {
        this.gameOver();
      }
    }

    this.updateHUD();
  }

  activateFeverMode() {
    this.feverActive = true;
    this.feverTimer = 10000; // 10 seconds
    window.soundManager.playFever();
    document.getElementById('game-container').classList.add('fever-active');
    this.addFloatingText('ختم الجودة الألماني! وضع السرعة الفائقة 🇩🇪✨', this.width / 2, 200, '#ffd700', 26);
    this.sayQuote('DEUTSCHE QUALITÄT! مضاعفة الأرباح وتدفق أسرع للقطع! 🇩🇪🚀', 220);
    this.createFireworkParticles(this.width / 2, 150, '#ffd700', 40);
  }

  gameOver() {
    this.state = 'gameover';
    window.soundManager.playGameOver();

    // High scores & wallet persistence
    const bestScore = parseInt(localStorage.getItem('elektro_meister_best') || '0', 10);
    if (this.score > bestScore) {
      localStorage.setItem('elektro_meister_best', this.score);
    }
    localStorage.setItem('elektro_meister_euros', this.euros);

    // Populate Game Over overlay
    document.getElementById('final-score').innerText = this.score;
    document.getElementById('final-euros').innerText = `${this.euros}€`;
    document.getElementById('final-orders').innerText = this.ordersCompleted;
    document.getElementById('final-combo').innerText = this.maxCombo;

    let certTitle = 'مبتدئ صيانة أجهزة';
    if (this.score > 4000) certTitle = 'كبير مهندسي الإلكترونيات في ألمانيا 🇩🇪🏆';
    else if (this.score > 2000) certTitle = 'معلم صيانة برلين المعتمد ⚡';
    else if (this.score > 1000) certTitle = 'فني تقني محترف في ميونخ 💻';
    document.getElementById('final-title').innerText = certTitle;

    document.getElementById('gameover-overlay').classList.remove('hidden');
    this.sayQuote('انتهت الجولة يا بطل! لنستعد للتحدي القادم 🤝', 300);
  }

  updateHUD() {
    document.getElementById('hud-score').innerText = this.score;
    document.getElementById('hud-euros').innerText = `${this.euros}€`;
    document.getElementById('hud-combo').innerText = `x${this.combo}`;
    document.getElementById('hud-level').innerText = this.level;

    // Lives
    const hearts = '❤️'.repeat(Math.max(0, this.lives)) + '🖤'.repeat(Math.max(0, this.maxLives - this.lives));
    document.getElementById('hud-lives').innerText = hearts;

    // Upgrades badge in shop button
    const shopBtn = document.getElementById('btn-open-shop');
    if (shopBtn) {
      shopBtn.innerText = `🛒 المتجر (${this.euros}€)`;
    }
  }

  // --- Particles & Text FX ---

  createSparkleParticles(x, y, color, count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1.5;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 5 + 3,
        color: color,
        alpha: 1,
        decay: Math.random() * 0.04 + 0.02
      });
    }
  }

  createSparks(x, y, color, count = 20) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        color: color,
        alpha: 1,
        decay: 0.05
      });
    }
  }

  createFireworkParticles(x, y, color, count = 30) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 7 + 2;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        size: Math.random() * 6 + 3,
        color: ['#ffd700', '#00f0ff', '#ff007f', '#22c55e'][Math.floor(Math.random() * 4)],
        alpha: 1,
        decay: 0.025
      });
    }
  }

  addFloatingText(text, x, y, color = '#ffffff', fontSize = 18) {
    this.floatingTexts.push({
      text: text,
      x: x,
      y: y,
      vy: 1.5,
      color: color,
      fontSize: fontSize,
      alpha: 1,
      decay: 0.025
    });
  }

  // --- Rendering ---

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw Cyber German Tech Background
    this.drawBackground();

    // Draw Falling items
    for (const item of this.fallingItems) {
      drawComponent(this.ctx, item.comp, item.x, item.y, item.size, item.angle);
    }

    // Draw Particles
    for (const p of this.particles) {
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.fillStyle = p.color;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 8;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // Draw Player (Cart + Hero Avatar)
    this.drawPlayer();

    // Draw Floating Texts
    for (const ft of this.floatingTexts) {
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, ft.alpha);
      this.ctx.fillStyle = ft.color;
      this.ctx.shadowColor = ft.color;
      this.ctx.shadowBlur = 10;
      this.ctx.font = `bold ${ft.fontSize}px sans-serif`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(ft.text, ft.x, ft.y);
      this.ctx.restore();
    }
  }

  drawBackground() {
    // Dark cyber grid
    this.ctx.save();
    const grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
    grad.addColorStop(0, '#090d16');
    grad.addColorStop(1, '#05070c');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Subtle neon grid lines
    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
    this.ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < this.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }

    // Bottom Conveyor / Workbench rail
    this.ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
    this.ctx.fillRect(0, this.height - 25, this.width, 25);

    // German Flag Accent Line at bottom
    const stripeW = this.width / 3;
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, this.height - 4, stripeW, 4);
    this.ctx.fillStyle = '#dd0000';
    this.ctx.fillRect(stripeW, this.height - 4, stripeW, 4);
    this.ctx.fillStyle = '#ffcc00';
    this.ctx.fillRect(stripeW * 2, this.height - 4, stripeW, 4);

    this.ctx.restore();
  }

  drawPlayer() {
    this.ctx.save();
    this.ctx.translate(this.player.x, this.player.y);
    this.ctx.rotate(this.player.tilt);

    // 1. Futuristic High-Tech Cart / Workbench Base
    const w = this.player.width;
    const h = 42;

    // Glowing Underbody Thruster
    this.ctx.shadowColor = '#00f0ff';
    this.ctx.shadowBlur = 18;
    this.ctx.fillStyle = '#00f0ff';
    this.ctx.beginPath();
    this.ctx.ellipse(0, h * 0.45, w * 0.35, 6, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Cart Body
    this.ctx.fillStyle = '#1e293b';
    this.ctx.strokeStyle = '#38bdf8';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.roundRect(-w / 2, 0, w, h * 0.6, 8);
    this.ctx.fill();
    this.ctx.stroke();

    // German Quality Badge on Cart
    this.ctx.fillStyle = '#ffd700';
    this.ctx.font = 'bold 10px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🇩🇪 ELEKTRO MEISTER', 0, h * 0.4);

    // Magnetic collection field glow if magnet upgrade active
    if (this.upgrades.magnet > 0) {
      this.ctx.strokeStyle = `rgba(0, 240, 255, ${0.25 + Math.sin(performance.now() * 0.005) * 0.15})`;
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([6, 6]);
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 55 + this.upgrades.magnet * 15, Math.PI, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }

    // Shield Aura if active
    if (this.player.shieldActive) {
      this.ctx.strokeStyle = `rgba(56, 189, 248, ${0.5 + Math.sin(performance.now() * 0.008) * 0.3})`;
      this.ctx.lineWidth = 3;
      this.ctx.shadowColor = '#38bdf8';
      this.ctx.shadowBlur = 15;
      this.ctx.beginPath();
      this.ctx.ellipse(0, -10, w * 0.65, 50, 0, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    // 2. Hero Avatar (The young man's portrait)
    const avatarSize = 64;
    const avatarY = -avatarSize * 0.72;

    if (this.player.avatarLoaded) {
      this.ctx.save();
      this.ctx.shadowColor = '#ffd700';
      this.ctx.shadowBlur = 12;

      // Draw avatar image centered
      this.ctx.drawImage(
        this.player.avatarImg,
        -avatarSize / 2,
        avatarY,
        avatarSize,
        avatarSize
      );

      // Gold frame ring
      this.ctx.strokeStyle = '#ffd700';
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.arc(0, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    } else {
      // Fallback if image still loading
      this.ctx.fillStyle = '#38bdf8';
      this.ctx.beginPath();
      this.ctx.arc(0, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 3. Floating Robo-Meister Assistant Drone (if unlocked)
    if (this.upgrades.assistant > 0) {
      const droneX = 65;
      const droneY = -35 + Math.sin(performance.now() * 0.006) * 6;

      this.ctx.save();
      this.ctx.translate(droneX, droneY);
      this.ctx.shadowColor = '#00f0ff';
      this.ctx.shadowBlur = 10;

      // Drone sphere
      this.ctx.fillStyle = '#0f172a';
      this.ctx.strokeStyle = '#00f0ff';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 14, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      // Drone eye
      this.ctx.fillStyle = '#00f0ff';
      this.ctx.beginPath();
      this.ctx.arc(2, -1, 4, 0, Math.PI * 2);
      this.ctx.fill();

      // Mini antenna
      this.ctx.strokeStyle = '#ffd700';
      this.ctx.beginPath();
      this.ctx.moveTo(0, -14);
      this.ctx.lineTo(0, -20);
      this.ctx.stroke();
      this.ctx.fillStyle = '#ef4444';
      this.ctx.beginPath();
      this.ctx.arc(0, -21, 2.5, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    }

    this.ctx.restore();
  }

  // --- Main Loop ---

  loop(timestamp) {
    const delta = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;

    this.update(delta);
    this.draw();

    requestAnimationFrame((t) => this.loop(t));
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
  requestAnimationFrame((t) => window.game.loop(t));

  // Hook UI Buttons
  const btnStart = document.getElementById('btn-start-game');
  if (btnStart) btnStart.addEventListener('click', () => window.game.start());

  const btnRestart = document.getElementById('btn-restart-game');
  if (btnRestart) btnRestart.addEventListener('click', () => window.game.start());

  const btnResume = document.getElementById('btn-resume-game');
  if (btnResume) btnResume.addEventListener('click', () => window.game.togglePause());

  // Audio Toggles
  const btnMusic = document.getElementById('btn-toggle-music');
  if (btnMusic) {
    btnMusic.addEventListener('click', () => {
      const active = window.soundManager.toggleMusic();
      btnMusic.innerText = active ? '🎵 الموسيقى: تشغيل' : '🎵 الموسيقى: صامت';
      btnMusic.classList.toggle('active', active);
    });
  }

  const btnSfx = document.getElementById('btn-toggle-sfx');
  if (btnSfx) {
    btnSfx.addEventListener('click', () => {
      const active = window.soundManager.toggleSfx();
      btnSfx.innerText = active ? '🔊 المؤثرات: تشغيل' : '🔇 المؤثرات: صامت';
      btnSfx.classList.toggle('active', active);
    });
  }

  // Shop Modal logic
  const shopModal = document.getElementById('shop-modal');
  const btnOpenShop = document.getElementById('btn-open-shop');
  const btnCloseShop = document.getElementById('btn-close-shop');

  function renderShop() {
    const list = document.getElementById('shop-items-list');
    if (!list) return;

    list.innerHTML = '';
    SHOP_UPGRADES.forEach(up => {
      const currentLevel = window.game.upgrades[up.id] || 0;
      const isMax = currentLevel >= up.maxLevel;
      const currentCost = Math.round(up.cost * Math.pow(up.costMultiplier, currentLevel));
      const canAfford = window.game.euros >= currentCost && !isMax;

      const card = document.createElement('div');
      card.className = `shop-upgrade-card ${isMax ? 'maxed' : ''}`;
      card.innerHTML = `
        <div class="shop-up-header">
          <span class="shop-up-icon">${up.icon}</span>
          <div class="shop-up-details">
            <div class="shop-up-name">${up.name}</div>
            <div class="shop-up-desc">${up.desc}</div>
            <div class="shop-up-level">المستوى: ${currentLevel} / ${up.maxLevel}</div>
          </div>
        </div>
        <button class="btn-buy-upgrade ${canAfford ? '' : 'disabled'}" data-id="${up.id}">
          ${isMax ? 'تم الوصول للحد الأقصى ✅' : `شراء بـ ${currentCost}€`}
        </button>
      `;

      const buyBtn = card.querySelector('.btn-buy-upgrade');
      if (buyBtn && !isMax) {
        buyBtn.addEventListener('click', () => {
          if (window.game.euros >= currentCost) {
            window.game.euros -= currentCost;
            window.game.upgrades[up.id] = currentLevel + 1;
            if (up.id === 'shield') {
              window.game.player.shieldActive = true;
            }
            localStorage.setItem('elektro_meister_euros', window.game.euros);
            localStorage.setItem('elektro_meister_upgrades', JSON.stringify(window.game.upgrades));
            window.soundManager.playUpgrade();
            window.game.updateHUD();
            renderShop();
            window.game.sayQuote(`تم شراء وتطوير: ${up.name}! 🚀`, 180);
          }
        });
      }

      list.appendChild(card);
    });
  }

  if (btnOpenShop) {
    btnOpenShop.addEventListener('click', () => {
      renderShop();
      shopModal.classList.remove('hidden');
    });
  }

  if (btnCloseShop) {
    btnCloseShop.addEventListener('click', () => {
      shopModal.classList.add('hidden');
    });
  }

  // How to play modal
  const btnHowToPlay = document.getElementById('btn-how-to-play');
  const howToModal = document.getElementById('howto-modal');
  const btnCloseHowTo = document.getElementById('btn-close-howto');

  if (btnHowToPlay && howToModal) {
    btnHowToPlay.addEventListener('click', () => howToModal.classList.remove('hidden'));
  }
  if (btnCloseHowTo && howToModal) {
    btnCloseHowTo.addEventListener('click', () => howToModal.classList.add('hidden'));
  }
});
