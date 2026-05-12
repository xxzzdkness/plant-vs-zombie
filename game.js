const board = document.getElementById('board');
const energyBox = document.getElementById('energyBox');
const killsText = document.getElementById('kills');
const message = document.getElementById('message');
const messageText = document.getElementById('messageText');

const ROWS = 5;
const COLS = 9;
const CELL = 90;

let energy = 100;
let selectedType = null;
let plants = [];
let enemies = [];
let bullets = [];
let kills = 0;
let gameOver = false;

const costs = {
  producer: 50,
  shooter: 100,
  wall: 75
};

const stats = {
  producer: { hp: 200 },
  shooter: { hp: 260 },
  wall: { hp: 900 }
};

function createBoard() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener('click', () => placePlant(r, c));
      board.appendChild(cell);
    }
  }
}

function getCell(row, col) {
  return document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
}

function placePlant(row, col) {
  if (!selectedType || gameOver) return;

  if (plants.find(p => p.row === row && p.col === col)) return;

  if (energy < costs[selectedType]) return;

  energy -= costs[selectedType];
  updateEnergy();

  const plant = {
    type: selectedType,
    row,
    col,
    hp: stats[selectedType].hp,
    lastAction: 0,
    el: document.createElement('div')
  };

  plant.el.className = `plant ${selectedType}`;

  if (selectedType === 'producer') plant.el.textContent = '🌻';
  if (selectedType === 'shooter') plant.el.textContent = '🌱';
  if (selectedType === 'wall') plant.el.textContent = '🥔';

  getCell(row, col).appendChild(plant.el);
  plants.push(plant);
}

function updateEnergy() {
  energyBox.textContent = `☀ ${energy}`;
}

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedType = card.dataset.type;
  });
});

function spawnEnemy() {
  const row = Math.floor(Math.random() * ROWS);

  const enemy = {
    row,
    x: COLS * CELL,
    hp: 260,
    speed: 0.25,
    el: document.createElement('div')
  };

  enemy.el.className = 'enemy';
  enemy.el.textContent = '🧟';
  enemy.el.style.top = `${row * CELL + 5}px`;
  enemy.el.style.left = `${enemy.x}px`;

  board.appendChild(enemy.el);
  enemies.push(enemy);
}

function createBullet(plant) {
  const bullet = {
    row: plant.row,
    x: plant.col * CELL + 70,
    damage: 50,
    el: document.createElement('div')
  };

  bullet.el.className = 'bullet';
  bullet.el.style.top = `${plant.row * CELL + 35}px`;
  bullet.el.style.left = `${bullet.x}px`;

  board.appendChild(bullet.el);
  bullets.push(bullet);
}

function createSun(x, y) {
  const sun = document.createElement('div');
  sun.className = 'sun';
  sun.textContent = '+25';
  sun.style.left = `${x}px`;
  sun.style.top = `${y}px`;

  sun.onclick = () => {
    energy += 25;
    updateEnergy();
    sun.remove();
  };

  board.appendChild(sun);

  setTimeout(() => {
    sun.remove();
  }, 5000);
}

function gameLoop(time) {
  if (gameOver) return;

  plants.forEach(plant => {
    if (plant.type === 'shooter') {
      const hasEnemy = enemies.some(e => e.row === plant.row);

      if (hasEnemy && time - plant.lastAction > 1200) {
        plant.lastAction = time;
        createBullet(plant);
      }
    }

    if (plant.type === 'producer') {
      if (time - plant.lastAction > 7000) {
        plant.lastAction = time;
        createSun(plant.col * CELL + 20, plant.row * CELL + 20);
      }
    }
  });

  bullets.forEach(bullet => {
    bullet.x += 4;
    bullet.el.style.left = `${bullet.x}px`;

    enemies.forEach(enemy => {
      if (enemy.row === bullet.row && bullet.x > enemy.x) {
        enemy.hp -= bullet.damage;
        bullet.el.remove();
      }
    });
  });

  enemies.forEach(enemy => {
    const col = Math.floor(enemy.x / CELL);
    const plant = plants.find(p => p.row === enemy.row && p.col === col);

    if (plant) {
      plant.hp -= 0.4;
    } else {
      enemy.x -= enemy.speed;
      enemy.el.style.left = `${enemy.x}px`;
    }

    if (enemy.hp <= 0) {
      enemy.el.remove();
      kills++;
      killsText.textContent = kills;
    }

    if (enemy.x < -50) {
      endGame('防線失守！');
    }
  });

  plants = plants.filter(p => {
    if (p.hp <= 0) {
      p.el.remove();
      return false;
    }
    return true;
  });

  enemies = enemies.filter(e => e.hp > 0);

  if (kills >= 25) {
    endGame('你守住了花園！');
  }

  requestAnimationFrame(gameLoop);
}

function endGame(text) {
  gameOver = true;
  message.style.display = 'flex';
  messageText.textContent = text;
}

createBoard();
updateEnergy();

setInterval(() => {
  if (!gameOver) spawnEnemy();
}, 2500);

requestAnimationFrame(gameLoop);
