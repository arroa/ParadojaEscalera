const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');

const controls = {
  base: document.getElementById('baseRange'),
  steps: document.getElementById('stepsRange'),
  speed: document.getElementById('speedRange'),
  run: document.getElementById('runButton'),
};

const labels = {
  base: document.getElementById('baseValue'),
  steps: document.getElementById('stepsValue'),
  speed: document.getElementById('speedValue'),
  legs: document.getElementById('legsValue'),
  stairsLen: document.getElementById('stairsLenValue'),
  hypLen: document.getElementById('hypLenValue'),
};

const margin = 75;
let animationTimer = null;
let segmentProgress = 0;

function getState() {
  const base = Number(controls.base.value);
  const steps = Number(controls.steps.value);
  const speed = Number(controls.speed.value);
  return { base, steps, speed };
}

function triangleGeometry(base, steps) {
  const cathetus = base * steps;
  const scale = Math.min(
    (canvas.width - margin * 2) / cathetus,
    (canvas.height - margin * 2) / cathetus,
  );

  return {
    cathetus,
    unitPx: base * scale,
    origin: { x: margin, y: canvas.height - margin },
    endX: margin + cathetus * scale,
    endY: canvas.height - margin - cathetus * scale,
  };
}

function getStairsPoints(geo, steps) {
  const points = [{ x: geo.origin.x, y: geo.origin.y }];
  let x = geo.origin.x;
  let y = geo.origin.y;

  for (let i = 0; i < steps; i += 1) {
    x += geo.unitPx;
    points.push({ x, y });
    y -= geo.unitPx;
    points.push({ x, y });
  }

  return points;
}

function drawBaseScene(state) {
  const { base, steps } = state;
  const geo = triangleGeometry(base, steps);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  for (let i = 0; i <= steps; i += 1) {
    const d = i * geo.unitPx;
    ctx.beginPath();
    ctx.moveTo(geo.origin.x + d, geo.origin.y);
    ctx.lineTo(geo.origin.x + d, geo.endY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(geo.origin.x, geo.origin.y - d);
    ctx.lineTo(geo.endX, geo.origin.y - d);
    ctx.stroke();
  }

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(geo.origin.x, geo.origin.y);
  ctx.lineTo(geo.endX, geo.origin.y);
  ctx.lineTo(geo.endX, geo.endY);
  ctx.closePath();
  ctx.stroke();

  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(geo.origin.x, geo.origin.y);
  ctx.lineTo(geo.endX, geo.endY);
  ctx.stroke();

  ctx.fillStyle = '#22c55e';
  ctx.font = '16px sans-serif';
  ctx.fillText('Hipotenusa ideal', geo.origin.x + 20, geo.endY + 26);

  return geo;
}

function drawStairs(points, segmentCount) {
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i <= segmentCount; i += 1) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
}

function updateMetrics(state) {
  const { base, steps } = state;
  labels.base.value = base;
  labels.steps.value = steps;
  labels.speed.value = Number(controls.speed.value);

  const cathetus = base * steps;
  const stairsLen = 2 * base * steps;
  const hypLen = Math.hypot(cathetus, cathetus);

  labels.legs.textContent = cathetus.toFixed(0);
  labels.stairsLen.textContent = stairsLen.toFixed(0);
  labels.hypLen.textContent = hypLen.toFixed(2);
}

function stopAnimation() {
  if (animationTimer) {
    clearInterval(animationTimer);
    animationTimer = null;
  }
}

function runAnimation() {
  stopAnimation();
  const state = getState();
  const geo = drawBaseScene(state);
  const stairs = getStairsPoints(geo, state.steps);
  segmentProgress = 0;

  animationTimer = setInterval(() => {
    drawBaseScene(state);
    drawStairs(stairs, segmentProgress);
    segmentProgress += 1;

    if (segmentProgress > stairs.length - 1) {
      stopAnimation();
    }
  }, state.speed);
}

Object.values(controls).forEach((el) => {
  if (el !== controls.run) {
    el.addEventListener('input', () => {
      const state = getState();
      drawBaseScene(state);
      updateMetrics(state);
    });
  }
});

controls.run.addEventListener('click', runAnimation);

const initial = getState();
updateMetrics(initial);
drawBaseScene(initial);
