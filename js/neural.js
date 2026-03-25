// Neural Network Canvas Animation — Dark Theme Edition
class NeuralNetwork {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.nodes = [];
    this.edges = [];
    this.animFrame = null;
    this.tick = 0;

    // Dark-optimised palette — vivid on near-black background
    this.colors = {
      nodeFill:      'rgba(99, 102, 241, 0.85)',
      nodeGlow:      'rgba(99, 102, 241, 0.22)',
      nodeFiring:    'rgba(0, 212, 194, 0.95)',
      nodeGlowFire:  'rgba(0, 212, 194, 0.30)',
      edge:          'rgba(139, 144, 255, 0.28)',    // was 0.13 — now clearly visible
      edgeHot:       'rgba(139, 144, 255, 0.65)',    // was 0.32 — bright when pulse travels
      pulseCore:     'rgba(0, 212, 194, 1.0)',
      pulseHalo:     'rgba(0, 212, 194, 0.0)',
      pulseTrail:    'rgba(165, 180, 252, 0.65)',
    };

    this.resize();
    this.init();
    this.startAnimation();

    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const panel = this.canvas.parentElement;
    this.canvas.width  = panel.clientWidth;
    this.canvas.height = panel.clientHeight;
    if (this.nodes.length > 0) this.repositionNodes();
  }

  init() {
    const W = this.canvas.width;
    const H = this.canvas.height;
    const margin = 38;

    this.nodes = [];
    this.edges = [];

    // 5-layer network — wider middle layers for organic look
    const layers = [3, 5, 6, 5, 3];
    const layerCount = layers.length;

    layers.forEach((nodeCount, li) => {
      const x = margin + (li / (layerCount - 1)) * (W - margin * 2);
      for (let ni = 0; ni < nodeCount; ni++) {
        const ySpacing = (H - margin * 2) / (nodeCount + 1);
        const y = margin + ySpacing * (ni + 1);
        const baseR = 3.5 + Math.random() * 2.5;
        this.nodes.push({
          x, y,
          layer: li,
          idx: ni,
          r: baseR,
          baseR,
          activation:      Math.random(),
          activationSpeed: 0.004 + Math.random() * 0.009,
          phase:           Math.random() * Math.PI * 2,
          firing:    false,
          fireTime:  0,
          fireAlpha: 0,
        });
      }
    });

    // Connect adjacent layers — keep ~70% of possible edges
    const byLayer = {};
    this.nodes.forEach(n => {
      if (!byLayer[n.layer]) byLayer[n.layer] = [];
      byLayer[n.layer].push(n);
    });

    for (let l = 0; l < layerCount - 1; l++) {
      const from = byLayer[l]     || [];
      const to   = byLayer[l + 1] || [];
      from.forEach(fn => {
        to.forEach(tn => {
          if (Math.random() > 0.30) {
            this.edges.push({
              from: fn,
              to:   tn,
              weight:     0.3 + Math.random() * 0.7,
              pulse:      null,
              pulseSpeed: 0.010 + Math.random() * 0.012,
              lastFire:   -999,
            });
          }
        });
      });
    }
  }

  repositionNodes() {
    const W = this.canvas.width;
    const H = this.canvas.height;
    const margin    = 38;
    const layers    = [3, 5, 6, 5, 3];
    const layerCount = layers.length;

    this.nodes.forEach(node => {
      const nodeCount = layers[node.layer];
      const x = margin + (node.layer / (layerCount - 1)) * (W - margin * 2);
      const ySpacing = (H - margin * 2) / (nodeCount + 1);
      const y = margin + ySpacing * (node.idx + 1);
      node.x = x;
      node.y = y;
    });
  }

  startAnimation() {
    const animate = () => {
      this.draw();
      this.tick++;
      this.animFrame = requestAnimationFrame(animate);
    };
    animate();
  }

  stopAnimation() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
  }

  triggerRandomPulse() {
    const eligible = this.edges.filter(e => !e.pulse && this.tick - e.lastFire > 60);
    if (!eligible.length) return;
    const edge = eligible[Math.floor(Math.random() * eligible.length)];
    edge.pulse   = { pos: 0 };
    edge.lastFire = this.tick;
  }

  draw() {
    const ctx = this.ctx;
    const W   = this.canvas.width;
    const H   = this.canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Pulse triggers — stagger to keep it lively but not chaotic
    if (this.tick % 14 === 0)  this.triggerRandomPulse();
    if (this.tick % 22 === 0)  this.triggerRandomPulse();
    if (this.tick % 37 === 0)  this.triggerRandomPulse();

    // ── Edges ──
    this.edges.forEach(edge => {
      const { from, to, weight } = edge;

      // Base edge — brighter when a pulse is travelling
      const hot = edge.pulse ? 1 : 0;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x,   to.y);
      ctx.strokeStyle = hot ? this.colors.edgeHot : this.colors.edge;
      ctx.lineWidth   = hot ? weight * 2.2 : weight * 1.8;   // thicker lines overall
      ctx.stroke();

      // ── Pulse animation ──
      if (edge.pulse) {
        edge.pulse.pos += edge.pulseSpeed;
        const t  = Math.min(edge.pulse.pos, 1);
        const px = from.x + (to.x - from.x) * t;
        const py = from.y + (to.y - from.y) * t;

        // Halo glow — larger radius for impact
        const haloR   = 16;
        const grd   = ctx.createRadialGradient(px, py, 0, px, py, haloR);
        grd.addColorStop(0,   'rgba(0, 212, 194, 0.70)');
        grd.addColorStop(0.4, 'rgba(0, 212, 194, 0.25)');
        grd.addColorStop(1,   'rgba(0, 212, 194, 0.0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(px, py, haloR, 0, Math.PI * 2);
        ctx.fill();

        // Core dot — bigger
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = this.colors.pulseCore;
        ctx.shadowColor = '#00d4c2';
        ctx.shadowBlur  = 14;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Arrival: fire destination node
        if (edge.pulse.pos >= 1) {
          edge.pulse = null;
          edge.to.firing    = true;
          edge.to.fireTime  = this.tick;
          edge.to.fireAlpha = 1;
        }
      }
    });

    // ── Nodes ──
    this.nodes.forEach(node => {
      // Oscillating activation
      node.activation = 0.45 + 0.45 * Math.sin(this.tick * node.activationSpeed + node.phase);

      const alpha = 0.45 + node.activation * 0.55;
      const age   = this.tick - node.fireTime;
      const isFiring = node.firing && age < 28;

      // Fire glow fades
      if (node.firing && age < 28) {
        node.fireAlpha = Math.max(0, 1 - age / 28);
      } else if (age >= 28) {
        node.firing    = false;
        node.fireAlpha = 0;
      }

      const r = node.baseR + (isFiring ? 4 * node.fireAlpha : 0);

      // Outer glow
      const glowR  = r * 5;
      const glowCol = isFiring ? `rgba(0,212,194,${0.28 * node.fireAlpha + 0.04})` : `rgba(99,102,241,${alpha * 0.22})`;
      const grd = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowR);
      grd.addColorStop(0,   isFiring ? `rgba(0,212,194,${0.55 * node.fireAlpha})` : `rgba(99,102,241,${alpha * 0.45})`);
      grd.addColorStop(0.5, glowCol);
      grd.addColorStop(1,   'transparent');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(node.x, node.y, glowR, 0, Math.PI * 2);
      ctx.fill();

      // Node body — two-stop radial for 3-D depth effect
      const bodyGrd = ctx.createRadialGradient(node.x - r * 0.3, node.y - r * 0.3, 0, node.x, node.y, r);
      if (isFiring) {
        bodyGrd.addColorStop(0, `rgba(160, 255, 248, ${alpha})`);
        bodyGrd.addColorStop(1, `rgba(0, 180, 165, ${alpha * 0.85})`);
      } else {
        bodyGrd.addColorStop(0, `rgba(165, 180, 252, ${alpha})`);
        bodyGrd.addColorStop(1, `rgba(79, 70, 229, ${alpha * 0.85})`);
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx.fillStyle = bodyGrd;

      // Shadow glow
      ctx.shadowColor  = isFiring ? '#00d4c2' : '#6366f1';
      ctx.shadowBlur   = isFiring ? 14 * node.fireAlpha : 8 * node.activation;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Bright rim
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 + node.activation * 0.2})`;
      ctx.lineWidth   = 0.7;
      ctx.stroke();
    });

    // ── Stats UI ──
    const activePulses = this.edges.filter(e => e.pulse).length;
    const sNodes  = document.getElementById('neural-stat-nodes');
    const sEdges  = document.getElementById('neural-stat-edges');
    const sActive = document.getElementById('neural-stat-active');
    if (sNodes)  sNodes.textContent  = this.nodes.length;
    if (sEdges)  sEdges.textContent  = this.edges.length;
    if (sActive) sActive.textContent = activePulses;
  }
}

// ── Bootstrap ──
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('neural-canvas');
  if (canvas) window.neuralNet = new NeuralNetwork(canvas);
});