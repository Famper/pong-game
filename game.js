const canvas = document.querySelector('#game-canvas');
const ctx = canvas.getContext('2d');
const overlay = document.querySelector('#overlay');
const startButton = document.querySelector('#start-button');
const restartButton = document.querySelector('#restart-button');
const status = document.querySelector('#status');
const playerScore = document.querySelector('#player-score');
const computerScore = document.querySelector('#computer-score');

const W = canvas.width, H = canvas.height, paddleW = 14, paddleH = 104;
const player = { x:34, y:H / 2 - paddleH / 2, score:0 };
const computer = { x:W - 48, y:H / 2 - paddleH / 2, score:0 };
const ball = { x:0, y:0, vx:0, vy:0 };
const keys = new Set();
let running = false, lastTime = 0;

function clamp(paddle) { paddle.y = Math.max(0, Math.min(H - paddleH, paddle.y)); }
function serve(direction = Math.random() > .5 ? 1 : -1) {
  const angle = Math.random() * .9 - .45, speed = 6.4;
  ball.x = W / 2 - 7; ball.y = H / 2 - 7;
  ball.vx = direction * speed * Math.cos(angle); ball.vy = speed * Math.sin(angle);
}
function reset() {
  player.score = computer.score = 0; playerScore.textContent = computerScore.textContent = '0';
  player.y = computer.y = H / 2 - paddleH / 2; status.textContent = 'First to 7 wins'; serve();
}
function hits(paddle) { return ball.x < paddle.x + paddleW && ball.x + 14 > paddle.x && ball.y < paddle.y + paddleH && ball.y + 14 > paddle.y; }
function bounce(paddle, direction) {
  const hit = (ball.y + 7 - (paddle.y + paddleH / 2)) / (paddleH / 2);
  const speed = Math.min(Math.abs(ball.vx) * 1.05 + .15, 11), angle = hit * 1.05;
  ball.vx = direction * speed * Math.cos(angle); ball.vy = speed * Math.sin(angle);
  ball.x = direction === 1 ? paddle.x + paddleW : paddle.x - 14;
}
function point(scoringPaddle) {
  scoringPaddle.score++;
  playerScore.textContent = player.score; computerScore.textContent = computer.score;
  if (scoringPaddle.score === 7) {
    running = false; status.textContent = scoringPaddle === player ? 'You win!' : 'Computer wins';
    startButton.textContent = 'Play again'; overlay.classList.remove('hidden');
  } else serve(scoringPaddle === player ? 1 : -1);
}
function update(dt) {
  if (keys.has('ArrowUp') || keys.has('w')) player.y -= 8 * dt;
  if (keys.has('ArrowDown') || keys.has('s')) player.y += 8 * dt;
  clamp(player);
  const target = ball.y + 7, center = computer.y + paddleH / 2;
  if (center < target - 8) computer.y += 4.8 * dt;
  if (center > target + 8) computer.y -= 4.8 * dt;
  clamp(computer);
  ball.x += ball.vx * dt; ball.y += ball.vy * dt;
  if (ball.y <= 0 || ball.y + 14 >= H) { ball.y = Math.max(0, Math.min(H - 14, ball.y)); ball.vy *= -1; }
  if (ball.vx < 0 && hits(player)) bounce(player, 1);
  if (ball.vx > 0 && hits(computer)) bounce(computer, -1);
  if (ball.x + 14 < 0) point(computer);
  if (ball.x > W) point(player);
}
function draw() {
  ctx.fillStyle = '#0b0d0f'; ctx.fillRect(0, 0, W, H);
  ctx.setLineDash([8, 13]); ctx.strokeStyle = '#f2f3f533'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#c8ff5a'; ctx.fillRect(player.x, player.y, paddleW, paddleH); ctx.fillRect(ball.x, ball.y, 14, 14);
  ctx.fillStyle = '#f2f3f5'; ctx.fillRect(computer.x, computer.y, paddleW, paddleH);
}
function loop(time) { const dt = Math.min((time - lastTime) / 16.67 || 1, 2); lastTime = time; if (running) update(dt); draw(); requestAnimationFrame(loop); }
function start() { if (player.score === 7 || computer.score === 7) reset(); running = true; overlay.classList.add('hidden'); status.textContent = 'Match in progress'; }
canvas.addEventListener('mousemove', e => { const r = canvas.getBoundingClientRect(); player.y = (e.clientY - r.top) / r.height * H - paddleH / 2; clamp(player); });
document.addEventListener('keydown', e => { if (['ArrowUp', 'ArrowDown', ' '].includes(e.key)) e.preventDefault(); keys.add(e.key); if (e.key === ' ') { running = !running; status.textContent = running ? 'Match in progress' : 'Paused — press Space to continue'; } });
document.addEventListener('keyup', e => keys.delete(e.key));
startButton.addEventListener('click', start); restartButton.addEventListener('click', () => { reset(); start(); });
reset(); draw(); requestAnimationFrame(loop);
