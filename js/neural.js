// Neural Network Canvas Animation
class NeuralNetwork {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.nodes = [];
    this.edges = [];
    this.animFrame = null;
    this.tick = 0;

    this.colors = {
      node: 'rgba(59, 63, 240, 0.75)',
      nodeGlow: 'rgba(59, 63, 240, 0.15)',
      edge: 'rgba(59, 63, 240, 0.18)',
      edgeFiring: 'rgba(0, 201, 184, 0.7)',
      pulse: 'rgba(0, 201, 184, 0.9)',
    };

    this.resize();
    this.init();
    this.startAnimation();

    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const panel = this.canvas.parentElement;
    this.canvas.width = panel.clientWidth;
    this.canvas.height = panel.clientHeight;
    if (this.nodes.length > 0) this.repositionNodes();
  }

  init() {
    const W = this.canvas.width;
    const H = this.canvas.height;
    const margin = 40;
    const count = 22;

    this.nodes = [];
    this.edges = [];

    // Create nodes in layered positions for neural net feel
    const layers = [4, 6, 6, 4, 2];
    let allNodes = [];
    const layerCount = layers.length;

    layers.forEach((nodeCount, li) => {
      const x = margin + (li / (layerCount - 1)) * (W - margin * 2);
      for (let ni = 0; ni < nodeCount; ni++) {
        const ySpacing = (H - margin * 2) / (nodeCount + 1);
        const y = margin + ySpacing * (ni + 1);
        allNodes.push({
          x, y,
          layer: li,
          idx: ni,
          r: 4 + Math.random() * 3,
          baseR: 4 + Math.random() * 3,
          activation: Math.random(),
          activationSpeed: 0.005 + Math.random() * 0.01,
          phase: Math.random() * Math.PI * 2,
          firing: false,
          fireTime: 0,
        });
      }
    });

    this.nodes = allNodes;

    // Connect nodes between adjacent layers
    let nodesByLayer = {};
    allNodes.forEach(n => {
      if (!nodesByLayer[n.layer]) nodesByLayer[n.layer] = [];
      nodesByLayer[n.layer].push(n);
    });

    for (let l = 0; l < layerCount - 1; l++) {
      const from = nodesByLayer[l] || [];
      const to = nodesByLayer[l + 1] || [];
      from.forEach(fn => {
        to.forEach(tn => {
          if (Math.random() > 0.25) {
            this.edges.push({
              from: fn,
              to: tn,
              weight: 0.2 + Math.random() * 0.6,
              pulse: null,
              pulsePos: 0,
              pulseSpeed: 0.012 + Math.random() * 0.01,
              lastFire: -100,
            });
          }
        });
      });
    }

    // Randomly fire pulses
    this._pulseTimer = 0;
  }

  repositionNodes() {
    const W = this.canvas.width;
    const H = this.canvas.height;
    const margin = 40;
    const layers = [4, 6, 6, 4, 2];
    const layerCount = layers.length;

    let li = 0, ni = 0;
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
    const eligibleEdges = this.edges.filter(e => !e.pulse && this.tick - e.lastFire > 80);
    if (eligibleEdges.length === 0) return;
    const edge = eligibleEdges[Math.floor(Math.random() * eligibleEdges.length)];
    edge.pulse = { pos: 0 };
    edge.lastFire = this.tick;
  }

  draw() {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Trigger pulses periodically
    if (this.tick % 18 === 0) this.triggerRandomPulse();
    if (this.tick % 30 === 0) this.triggerRandomPulse();

    // Draw edges
    this.edges.forEach(edge => {
      const { from, to, weight } = edge;

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.strokeStyle = this.colors.edge;
      ctx.lineWidth = weight * 1.5;
      ctx.stroke();

      // Animate pulse
      if (edge.pulse) {
        edge.pulse.pos += edge.pulseSpeed;
        const t = edge.pulse.pos;
        const px = from.x + (to.x - from.x) * t;
        const py = from.y + (to.y - from.y) * t;

        // Pulse glow
        const grd = ctx.createRadialGradient(px, py, 0, px, py, 10);
        grd.addColorStop(0, this.colors.pulse);
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(px, py, 10, 0, Math.PI * 2);
        ctx.fill();

        // Pulse dot
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = this.colors.edgeFiring;
        ctx.fill();

        if (edge.pulse.pos >= 1) {
          edge.pulse = null;
          // Fire destination node
          edge.to.firing = true;
          edge.to.fireTime = this.tick;
        }
      }
    });

    // Draw nodes
    this.nodes.forEach(node => {
      node.activation = 0.5 + 0.4 * Math.sin(this.tick * node.activationSpeed + node.phase);

      const alpha = 0.4 + node.activation * 0.6;
      const r = node.baseR + (node.firing ? 3 * Math.max(0, 1 - (this.tick - node.fireTime) / 30) : 0);

      // Glow
      const grd = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 4);
      grd.addColorStop(0, `rgba(59, 63, 240, ${alpha * 0.3})`);
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(node.x, node.y, r * 4, 0, Math.PI * 2);
      ctx.fill();

      // Node body
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      if (node.firing && this.tick - node.fireTime < 20) {
        ctx.fillStyle = `rgba(0, 201, 184, ${alpha})`;
      } else {
        ctx.fillStyle = `rgba(59, 63, 240, ${alpha})`;
        node.firing = false;
      }
      ctx.fill();

      // Node border
      ctx.strokeStyle = `rgba(255, 255, 255, 0.4)`;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Update stats display
    const firing = this.nodes.filter(n => n.firing).length;
    const statEl = document.getElementById('neural-stat-nodes');
    const statEl2 = document.getElementById('neural-stat-edges');
    const statEl3 = document.getElementById('neural-stat-active');
    if (statEl) statEl.textContent = this.nodes.length;
    if (statEl2) statEl2.textContent = this.edges.length;
    if (statEl3) statEl3.textContent = this.edges.filter(e => e.pulse).length;
  }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('neural-canvas');
  if (canvas) {
    window.neuralNet = new NeuralNetwork(canvas);
  }
});