// Electronic Components, Hazards & Customer Orders Engine
// High-DPI Procedural Canvas Graphics for Electronic Components

const COMPONENT_TYPES = {
  cpu: {
    id: 'cpu',
    name: 'معالج Core i9 الألماني',
    nameEn: 'German Core i9 CPU',
    price: 60,
    color: '#00f0ff',
    icon: '⚡',
    isHazard: false,
    weight: 15
  },
  gpu: {
    id: 'gpu',
    name: 'كارت شاشة RTX 4090',
    nameEn: 'RTX 4090 Pro GPU',
    price: 120,
    color: '#00ff66',
    icon: '🎮',
    isHazard: false,
    weight: 8
  },
  ram: {
    id: 'ram',
    name: 'رامات DDR5 بتردد عالي',
    nameEn: 'DDR5 6400MHz RAM',
    price: 40,
    color: '#ff007f',
    icon: '💾',
    isHazard: false,
    weight: 20
  },
  cap: {
    id: 'cap',
    name: 'مكثف ياباني / ألماني فائق',
    nameEn: 'Precision Electrolytic Cap',
    price: 25,
    color: '#00d0ff',
    icon: '🔋',
    isHazard: false,
    weight: 25
  },
  resistor: {
    id: 'resistor',
    name: 'مقاومات دقيقة SMD',
    nameEn: 'SMD Precision Resistors',
    price: 15,
    color: '#ffaa00',
    icon: '🎛️',
    isHazard: false,
    weight: 25
  },
  motherboard: {
    id: 'motherboard',
    name: 'لوحة أم Z790 مخصصة',
    nameEn: 'Z790 Cyber Motherboard',
    price: 90,
    color: '#a855f7',
    icon: '🖲️',
    isHazard: false,
    weight: 10
  },
  german_seal: {
    id: 'german_seal',
    name: 'ختم الجودة الألماني TÜV 🇩🇪',
    nameEn: 'Made in Germany Seal',
    price: 250,
    color: '#ffd700',
    icon: '🇩🇪',
    isHazard: false,
    isSpecial: true,
    weight: 4
  },
  // Hazards
  blown_cap: {
    id: 'blown_cap',
    name: 'مكثف محترق ومنفجر!',
    nameEn: 'Blown Capacitor!',
    damage: 1,
    color: '#ff2222',
    icon: '💥',
    isHazard: true,
    weight: 12
  },
  short_circuit: {
    id: 'short_circuit',
    name: 'التماس كهربائي حارق!',
    nameEn: 'Short Circuit Arc!',
    damage: 1,
    color: '#ff0055',
    icon: '⚡',
    isHazard: true,
    weight: 10
  },
  water_spill: {
    id: 'water_spill',
    name: 'تسريب مياه تبريد!',
    nameEn: 'Coolant Water Leak!',
    damage: 1,
    color: '#38bdf8',
    icon: '💧',
    isHazard: true,
    weight: 9
  },
  fake_part: {
    id: 'fake_part',
    name: 'شريحة صينية مقلدة وغير أصلية!',
    nameEn: 'Counterfeit Fake IC!',
    penalty: 40,
    color: '#a3a3a3',
    icon: '🚫',
    isHazard: true,
    isPenaltyOnly: true,
    weight: 12
  }
};

// Customer Orders Pool
const CUSTOMER_ORDERS = [
  {
    client: 'Herr Müller 🇩🇪',
    city: 'برلين (Berlin)',
    title: 'تجميعة سيرفر بنك فرانكفورت',
    needed: { cpu: 2, ram: 2 },
    reward: 350,
    avatar: '👨‍💼'
  },
  {
    client: 'Frau Schmidt 🇩🇪',
    city: 'ميونخ (München)',
    title: 'كمبيوتر تصاميم هندسية لـ BMW',
    needed: { gpu: 1, motherboard: 1, ram: 1 },
    reward: 420,
    avatar: '👩‍💻'
  },
  {
    client: 'Dr. Klaus Wagner 🇩🇪',
    city: 'هامبورغ (Hamburg)',
    title: 'لوحة أجهزة فحص طبية متطورة',
    needed: { cap: 3, resistor: 2, cpu: 1 },
    reward: 380,
    avatar: '👨‍⚕️'
  },
  {
    client: 'Herr Becker 🇩🇪',
    city: 'فرانكفورت (Frankfurt)',
    title: 'منصة تداول مالي فائق السرعة',
    needed: { cpu: 1, gpu: 1, ram: 2 },
    reward: 480,
    avatar: '🧑‍💼'
  },
  {
    client: 'Frau Schneider 🇩🇪',
    city: 'شتوتغارت (Stuttgart)',
    title: 'أنظمة تحكم مصنع مرسيدس بنز',
    needed: { motherboard: 1, cap: 2, german_seal: 1 },
    reward: 600,
    avatar: '👩‍🔬'
  },
  {
    client: 'Herr Hoffmann 🇩🇪',
    city: 'كولونيا (Köln)',
    title: 'محطة ألعاب وبث مباشر يوتيوب',
    needed: { gpu: 2, cpu: 1 },
    reward: 460,
    avatar: '🎧'
  }
];

// Shop Upgrades Available
const SHOP_UPGRADES = [
  {
    id: 'magnet',
    name: 'المغناطيس الكهرومغناطيسي الذكي',
    desc: 'يجذب القطع الإلكترونية نحوك تلقائياً من مسافة أوسع',
    cost: 200,
    level: 0,
    maxLevel: 4,
    costMultiplier: 1.8,
    icon: '🧲'
  },
  {
    id: 'van',
    name: 'شاحنة التوصيل الألماني السريع (DHL Express)',
    desc: 'تزيد من أرباح بيع القطع بنسبة +25% لكل مستوى',
    cost: 300,
    level: 0,
    maxLevel: 3,
    costMultiplier: 2.2,
    icon: '🚚'
  },
  {
    id: 'shield',
    name: 'عازل تفريغ الكهرباء الساكنة (ESD Shield)',
    desc: 'يحميك من أول التماس كهربائي أو انفجار في كل جولة',
    cost: 350,
    level: 0,
    maxLevel: 2,
    costMultiplier: 2.5,
    icon: '🛡️'
  },
  {
    id: 'laser',
    name: 'محطة لحام ليزرية ألمانية',
    desc: 'تبطئ سقوط القطع بنسبة 15% للتحكم الكامل بدقة',
    cost: 250,
    level: 0,
    maxLevel: 3,
    costMultiplier: 2.0,
    icon: '🔬'
  },
  {
    id: 'assistant',
    name: 'روبوت المساعد الإلكتروني الذكي (Robo-Meister)',
    desc: 'يجمع القطع الذهبية والنادرة تلقائياً عند اقترابها',
    cost: 600,
    level: 0,
    maxLevel: 2,
    costMultiplier: 3.0,
    icon: '🤖'
  }
];

// Component Canvas Drawing Routine
function drawComponent(ctx, comp, x, y, size, angle = 0) {
  ctx.save();
  ctx.translate(x, y);
  if (angle !== 0) ctx.rotate(angle);

  const half = size / 2;

  switch (comp.id) {
    case 'cpu': {
      // Golden pins & dark silicon die
      ctx.fillStyle = '#0a2342';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(-half, -half, size, size, 6);
      ctx.fill();
      ctx.stroke();

      // Golden corner notch
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(-half, -half + 8);
      ctx.lineTo(-half + 8, -half);
      ctx.lineTo(-half, -half);
      ctx.closePath();
      ctx.fill();

      // Heatspreader
      ctx.fillStyle = '#22384f';
      ctx.beginPath();
      ctx.roundRect(-half * 0.65, -half * 0.65, size * 0.65, size * 0.65, 4);
      ctx.fill();

      // CPU text
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#00f0ff';
      ctx.font = `bold ${Math.max(10, size * 0.22)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('i9 PRO', 0, 0);
      break;
    }

    case 'gpu': {
      // RTX graphics card with dual fans
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(-half * 1.2, -half * 0.7, size * 1.2, size * 0.7, 5);
      ctx.fill();
      ctx.stroke();

      // Dual fans
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 1.5;
      [-half * 0.6, half * 0.6].forEach(fx => {
        ctx.beginPath();
        ctx.arc(fx, 0, size * 0.22, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      // PCIe golden contacts
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-half * 0.8, half * 0.35, size * 0.8, 3);

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#4ade80';
      ctx.font = `bold ${Math.max(9, size * 0.18)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('RTX', 0, -size * 0.18);
      break;
    }

    case 'ram': {
      // DDR5 RAM Stick
      ctx.fillStyle = '#052e16';
      ctx.strokeStyle = '#ff007f';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#ff007f';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.roundRect(-half * 1.3, -half * 0.4, size * 1.3, size * 0.4, 3);
      ctx.fill();
      ctx.stroke();

      // Memory Chips on stick
      ctx.fillStyle = '#111827';
      for (let i = -3; i <= 3; i++) {
        if (i === 0) continue;
        ctx.fillRect(i * (size * 0.18) - 5, -half * 0.25, 10, size * 0.3);
      }

      // Golden pins
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-half * 1.1, half * 0.16, size * 1.1, 4);

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(8, size * 0.16)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('DDR5', 0, -half * 0.05);
      break;
    }

    case 'cap': {
      // Cylindrical capacitor with polarity line
      ctx.fillStyle = '#1e3a8a';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;

      ctx.beginPath();
      ctx.roundRect(-half * 0.5, -half * 0.7, size * 0.5, size * 0.8, 4);
      ctx.fill();
      ctx.stroke();

      // Silver top
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-half * 0.45, -half * 0.7, size * 0.45, 6);

      // Negative stripe
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-half * 0.45, -half * 0.4, 4, size * 0.5);

      // Pins sticking down
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-half * 0.25, half * 0.1, 2.5, 9);
      ctx.fillRect(half * 0.05, half * 0.1, 2.5, 9);
      break;
    }

    case 'resistor': {
      // Axial Resistor with color bands
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-half * 0.9, -1.5, size * 0.9, 3); // leads

      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.roundRect(-half * 0.5, -half * 0.3, size * 0.5, size * 0.3, 4);
      ctx.fill();

      // Color bands (Brown, Black, Red, Gold)
      const bands = ['#78350f', '#000000', '#dc2626', '#fbbf24'];
      bands.forEach((bColor, idx) => {
        ctx.fillStyle = bColor;
        ctx.fillRect(-half * 0.35 + idx * 7, -half * 0.3, 3, size * 0.3);
      });
      break;
    }

    case 'motherboard': {
      // Motherboard PCB with tracks
      ctx.fillStyle = '#064e3b';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.roundRect(-half, -half, size, size, 5);
      ctx.fill();
      ctx.stroke();

      // CPU Socket
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-half * 0.5, -half * 0.5, size * 0.4, size * 0.4);

      // Chipset heatsink
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(half * 0.1, half * 0.1, size * 0.35, size * 0.35);
      break;
    }

    case 'german_seal': {
      // Glowing German Flag Eagle / TÜV Quality Seal
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 18;

      ctx.beginPath();
      ctx.arc(0, 0, half * 0.9, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ffd700';
      ctx.stroke();

      // German Flag Stripes inside
      const rad = half * 0.8;
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, rad, 0, Math.PI * 2);
      ctx.clip();

      const stripeH = (rad * 2) / 3;
      ctx.fillStyle = '#000000';
      ctx.fillRect(-rad, -rad, rad * 2, stripeH);
      ctx.fillStyle = '#dd0000';
      ctx.fillRect(-rad, -rad + stripeH, rad * 2, stripeH);
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(-rad, -rad + stripeH * 2, rad * 2, stripeH);
      ctx.restore();

      // Center text
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(10, size * 0.26)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🇩🇪 TÜV', 0, 0);
      break;
    }

    // --- HAZARDS ---

    case 'blown_cap': {
      // Blown exploded capacitor with smoke/sparks
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#450a0a';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.roundRect(-half * 0.5, -half * 0.6, size * 0.5, size * 0.7, 4);
      ctx.fill();
      ctx.stroke();

      // Bulged cracked top with fire burst
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(-half * 0.3, -half * 0.6);
      ctx.lineTo(0, -half * 0.9);
      ctx.lineTo(half * 0.3, -half * 0.6);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💥', 0, -2);
      break;
    }

    case 'short_circuit': {
      // Electric lightning arc
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 18;
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(0, 0, half * 0.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(16, size * 0.6)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚡', 0, 2);
      break;
    }

    case 'water_spill': {
      // Liquid droplet
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#0ea5e9';

      ctx.beginPath();
      ctx.moveTo(0, -half * 0.8);
      ctx.quadraticCurveTo(half * 0.8, half * 0.1, 0, half * 0.8);
      ctx.quadraticCurveTo(-half * 0.8, half * 0.1, 0, -half * 0.8);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(12, size * 0.4)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💧', 0, 3);
      break;
    }

    case 'fake_part': {
      // Grey shady counterfeit chip with big red X
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-half * 0.6, -half * 0.6, size * 0.6, size * 0.6, 3);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.font = `bold ${Math.max(14, size * 0.5)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🚫', 0, 0);
      break;
    }
  }

  ctx.restore();
}

window.COMPONENT_TYPES = COMPONENT_TYPES;
window.CUSTOMER_ORDERS = CUSTOMER_ORDERS;
window.SHOP_UPGRADES = SHOP_UPGRADES;
window.drawComponent = drawComponent;
