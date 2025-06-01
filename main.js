// Balloon Pop Duel Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const score1El = document.getElementById('score1');
const score2El = document.getElementById('score2');
const pauseBtn = document.getElementById('pauseBtn');
const startBtn = document.getElementById('startBtn');
const playerSetup = document.getElementById('player-setup');
const scoreboard = document.getElementById('scoreboard');
const name1Input = document.getElementById('name1');
const name2Input = document.getElementById('name2');
const name1Display = document.getElementById('name1Display');
const name2Display = document.getElementById('name2Display');

const BALLOON_RADIUS = 32;
const BALLOON_SPEED = 1.2;
const BALLOON_SPAWN_INTERVAL = 1200; // ms
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const COLORS = ['#e57373','#f06292','#ba68c8','#64b5f6','#4dd0e1','#81c784','#ffd54f','#ffb74d','#a1887f','#90a4ae'];

let balloons = [];
let score1 = 0;
let score2 = 0;
let paused = false;
let gameStarted = false;
let winner = null;

// Pointer for Player 2 (Keyboard)
const POINTER_RADIUS = 36;
const POINTER_SPEED = 16;
let pointer = {
  x: canvas.width / 2,
  y: canvas.height / 2
};

const MAX_SCORE = 30;
const PLAYER1_DEFAULT = "Игрок 1";
const PLAYER2_DEFAULT = "Игрок 2";

function randomLetter() {
  return LETTERS[Math.floor(Math.random() * LETTERS.length)];
}

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function spawnBalloon() {
  const x = BALLOON_RADIUS + Math.random() * (canvas.width - 2 * BALLOON_RADIUS);
  const y = canvas.height + BALLOON_RADIUS;
  const color = randomColor();
  const letter = randomLetter();
  balloons.push({ x, y, color, letter });
}

function drawBalloon(balloon) {
  ctx.beginPath();
  ctx.arc(balloon.x, balloon.y, BALLOON_RADIUS, 0, 2 * Math.PI);
  ctx.fillStyle = balloon.color;
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();
  // Draw letter
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(balloon.letter, balloon.x, balloon.y);
}

function updateBalloons() {
  if (paused || !gameStarted) return;
  for (const balloon of balloons) {
    balloon.y -= BALLOON_SPEED;
  }
  // Remove balloons that have gone off the top
  balloons = balloons.filter(b => b.y + BALLOON_RADIUS > 0);
}

function drawPointer() {
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.arc(pointer.x, pointer.y, POINTER_RADIUS, 0, 2 * Math.PI);
  ctx.fillStyle = '#2196f3';
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#1976d2';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function movePointer(dx, dy) {
  pointer.x = clamp(pointer.x + dx, POINTER_RADIUS, canvas.width - POINTER_RADIUS);
  pointer.y = clamp(pointer.y + dy, POINTER_RADIUS, canvas.height - POINTER_RADIUS);
}

function checkWinner() {
  if (score1 >= MAX_SCORE) {
    winner = name1Display.textContent;
  } else if (score2 >= MAX_SCORE) {
    winner = name2Display.textContent;
  }
  if (winner) {
    paused = true;
    manageBalloonInterval();
  }
}

function drawOverlay() {
  if (paused && winner) {
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 64px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(winner + ' Победила!', canvas.width / 2, canvas.height / 2);
    ctx.restore();
  } else if (paused) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Paused', canvas.width / 2, canvas.height / 2);
    ctx.restore();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!gameStarted) return;
  for (const balloon of balloons) {
    drawBalloon(balloon);
  }
  drawPointer();
  drawOverlay();
}

function gameLoop() {
  updateBalloons();
  draw();
  requestAnimationFrame(gameLoop);
}

canvas.addEventListener('click', function(e) {
  if (paused || !gameStarted || winner) return;
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  for (let i = 0; i < balloons.length; i++) {
    const b = balloons[i];
    const dx = mx - b.x;
    const dy = my - b.y;
    if (dx * dx + dy * dy <= BALLOON_RADIUS * BALLOON_RADIUS) {
      balloons.splice(i, 1);
      score1++;
      score1El.textContent = score1;
      checkWinner();
      break;
    }
  }
});

document.addEventListener('keydown', function(e) {
  if (paused || !gameStarted || winner) return;
  let moved = false;
  if (
    e.key === 'w' || e.key === 'W' || e.key === 'ц' || e.key === 'Ц' ||
    e.key === 'ArrowUp'
  ) { movePointer(0, -POINTER_SPEED); moved = true; }
  if (
    e.key === 'a' || e.key === 'A' || e.key === 'ф' || e.key === 'Ф' ||
    e.key === 'ArrowLeft'
  ) { movePointer(-POINTER_SPEED, 0); moved = true; }
  if (
    e.key === 's' || e.key === 'S' || e.key === 'ы' || e.key === 'Ы' ||
    e.key === 'ArrowDown'
  ) { movePointer(0, POINTER_SPEED); moved = true; }
  if (
    e.key === 'd' || e.key === 'D' || e.key === 'в' || e.key === 'В' ||
    e.key === 'ArrowRight'
  ) { movePointer(POINTER_SPEED, 0); moved = true; }
  if (e.code === 'Space') {
    // Pop balloon under pointer
    for (let i = 0; i < balloons.length; i++) {
      const b = balloons[i];
      const dx = pointer.x - b.x;
      const dy = pointer.y - b.y;
      if (dx * dx + dy * dy <= BALLOON_RADIUS * BALLOON_RADIUS) {
        balloons.splice(i, 1);
        score2++;
        score2El.textContent = score2;
        checkWinner();
        break;
      }
    }
  }
});

// Spawn balloons at intervals
let balloonInterval = setInterval(spawnBalloon, BALLOON_SPAWN_INTERVAL);

// Optionally, pause balloon spawning while paused
function manageBalloonInterval() {
  if (paused || !gameStarted) {
    clearInterval(balloonInterval);
  } else {
    clearInterval(balloonInterval);
    balloonInterval = setInterval(spawnBalloon, BALLOON_SPAWN_INTERVAL);
  }
}

pauseBtn.addEventListener('click', function() {
  if (winner) return;
  paused = !paused;
  pauseBtn.textContent = paused ? 'Resume' : 'Pause';
  manageBalloonInterval();
});

startBtn.addEventListener('click', function() {
  // Set player names
  name1Display.textContent = name1Input.value || PLAYER1_DEFAULT;
  name2Display.textContent = name2Input.value || PLAYER2_DEFAULT;
  // Hide setup, show game
  playerSetup.style.display = 'none';
  scoreboard.style.display = '';
  pauseBtn.style.display = '';
  gameCanvas.style.display = '';
  gameStarted = true;
});

// Start the game
spawnBalloon();
gameLoop(); 