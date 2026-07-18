// Canvas setup
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Game variables
let gameRunning = true;
let gameTime = 0;
let coins = 0;
let gameStartTime = Date.now();

// Player object
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 30,
    height: 50,
    speed: 4,
    baseSpeed: 4,
    dx: 0,
    dy: 0,
    health: 3,
    isFlying: false,
    isSuperSpeed: false,
    isStunned: false,
    lives: 3
};

// Enemies
const enemies = [
    {
        x: 100,
        y: 100,
        width: 30,
        height: 50,
        speed: 2,
        isStunned: false,
        stunTime: 0
    },
    {
        x: canvas.width - 100,
        y: canvas.height - 100,
        width: 30,
        height: 50,
        speed: 2,
        isStunned: false,
        stunTime: 0
    }
];

// Abilities
const abilities = {
    superSpeed: {
        cooldown: 0,
        maxCooldown: 15000,
        duration: 0,
        maxDuration: 10000,
        active: false
    },
    fly: {
        cooldown: 0,
        maxCooldown: 20000,
        duration: 0,
        maxDuration: 5000,
        active: false
    },
    stun: {
        cooldown: 0,
        maxCooldown: 25000,
        active: false
    }
};

// Keyboard input
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key.toLowerCase() === 'q') activateSuperSpeed();
    if (e.key.toLowerCase() === 'w') activateFly();
    if (e.key.toLowerCase() === 'e') activateStun();
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Touch controls
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchmove', (e) => {
    touchEndX = e.touches[0].clientX;
    touchEndY = e.touches[0].clientY;
    handleTouchMovement();
}, false);

document.addEventListener('touchend', () => {
    player.dx = 0;
    player.dy = 0;
});

function handleTouchMovement() {
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 30) {
        player.dx = (dx / distance) * player.speed;
        player.dy = (dy / distance) * player.speed;
    }
}

// UI Buttons
document.getElementById('abilitySuper').addEventListener('click', activateSuperSpeed);
document.getElementById('abilityFly').addEventListener('click', activateFly);
document.getElementById('abilityStun').addEventListener('click', activateStun);

function activateSuperSpeed() {
    if (abilities.superSpeed.cooldown <= 0 && !abilities.superSpeed.active) {
        abilities.superSpeed.active = true;
        abilities.superSpeed.duration = abilities.superSpeed.maxDuration;
        abilities.superSpeed.cooldown = abilities.superSpeed.maxCooldown;
        player.baseSpeed = 12;
        updateAbilityButton('abilitySuper');
    }
}

function activateFly() {
    if (abilities.fly.cooldown <= 0 && !abilities.fly.active) {
        abilities.fly.active = true;
        abilities.fly.duration = abilities.fly.maxDuration;
        abilities.fly.cooldown = abilities.fly.maxCooldown;
        player.isFlying = true;
        updateAbilityButton('abilityFly');
    }
}

function activateStun() {
    if (abilities.stun.cooldown <= 0) {
        abilities.stun.active = true;
        abilities.stun.cooldown = abilities.stun.maxCooldown;
        enemies.forEach(enemy => {
            enemy.isStunned = true;
            enemy.stunTime = 5000;
        });
        updateAbilityButton('abilityStun');
    }
}

function updateAbilityButton(buttonId) {
    const btn = document.getElementById(buttonId);
    btn.classList.add('active');
    setTimeout(() => {
        btn.classList.remove('active');
    }, 500);
}

// Draw stickman
function drawStickman(x, y, color, isFlying = false) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.arc(x, y - 15, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x, y - 7);
    ctx.lineTo(x, y + 10);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x + 10, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, y + 10);
    ctx.lineTo(x - 5, y + 25);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, y + 10);
    ctx.lineTo(x + 5, y + 25);
    ctx.stroke();

    if (isFlying) {
        ctx.fillStyle = 'rgba(0, 200, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.fill();
    }

    if (player.isSuperSpeed) {
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 35, 0, Math.PI * 2);
        ctx.stroke();
    }
}

// Update player
function updatePlayer() {
    player.dx = 0;
    player.dy = 0;

    if (keys['ArrowUp'] || keys['w'] || keys['W']) player.dy = -player.speed;
    if (keys['ArrowDown'] || keys['s'] || keys['S']) player.dy = player.speed;
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) player.dx = -player.speed;
    if (keys['ArrowRight'] || keys['d'] || keys['D']) player.dx = player.speed;

    if (player.dx !== 0 && player.dy !== 0) {
        const length = Math.sqrt(player.dx * player.dx + player.dy * player.dy);
        player.dx = (player.dx / length) * player.speed;
        player.dy = (player.dy / length) * player.speed;
    }

    player.x += player.dx;
    player.y += player.dy;

    if (player.x < 20) player.x = 20;
    if (player.x > canvas.width - 20) player.x = canvas.width - 20;
    if (player.y < 20) player.y = 20;
    if (player.y > canvas.height - 20) player.y = canvas.height - 20;

    updateAbilities();
    checkCollisions();
}

// Update abilities
function updateAbilities() {
    if (abilities.superSpeed.active) {
        abilities.superSpeed.duration -= 16;
        player.isSuperSpeed = true;
        player.speed = 12;
        if (abilities.superSpeed.duration <= 0) {
            abilities.superSpeed.active = false;
            player.isSuperSpeed = false;
            player.speed = player.baseSpeed;
        }
    } else {
        player.speed = player.baseSpeed;
        abilities.superSpeed.cooldown -= 16;
    }

    if (abilities.fly.active) {
        abilities.fly.duration -= 16;
        player.isFlying = true;
        if (abilities.fly.duration <= 0) {
            abilities.fly.active = false;
            player.isFlying = false;
        }
    } else {
        abilities.fly.cooldown -= 16;
    }

    if (abilities.stun.cooldown > 0) {
        abilities.stun.cooldown -= 16;
    }
}

// Update enemies
function updateEnemies() {
    enemies.forEach(enemy => {
        if (enemy.isStunned) {
            enemy.stunTime -= 16;
            if (enemy.stunTime <= 0) {
                enemy.isStunned = false;
            }
        }

        if (!enemy.isStunned) {
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 0) {
                enemy.x += (dx / distance) * enemy.speed;
                enemy.y += (dy / distance) * enemy.speed;
            }
        }

        if (enemy.x < 20) enemy.x = 20;
        if (enemy.x > canvas.width - 20) enemy.x = canvas.width - 20;
        if (enemy.y < 20) enemy.y = 20;
        if (enemy.y > canvas.height - 20) enemy.y = canvas.height - 20;
    });
}

// Check collisions
function checkCollisions() {
    enemies.forEach(enemy => {
        if (!enemy.isStunned && !player.isFlying) {
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 40) {
                player.health--;
                if (player.health <= 0) {
                    gameOver();
                } else {
                    player.x = canvas.width / 2;
                    player.y = canvas.height / 2;
                }
            }
        }
    });
}

// Game over
function gameOver() {
    gameRunning = false;
    document.getElementById('gameOverScreen').classList.add('show');
    document.getElementById('finalScore').textContent = `Время: ${gameTime}s`;
    document.getElementById('finalCoins').textContent = `Монеты: ${coins}`;
}

// Update UI
function updateUI() {
    gameTime = Math.floor((Date.now() - gameStartTime) / 1000);
    coins = Math.floor(gameTime / 60) * 5;
    document.getElementById('score').textContent = `Время: ${gameTime}s`;
    document.getElementById('timer').textContent = `Здоровье: ${player.health}`;
    document.getElementById('coins').textContent = `💰 Монеты: ${coins}`;
    updateAbilityButtonState('abilitySuper', abilities.superSpeed);
    updateAbilityButtonState('abilityFly', abilities.fly);
    updateAbilityButtonState('abilityStun', abilities.stun);
}

function updateAbilityButtonState(buttonId, ability) {
    const btn = document.getElementById(buttonId);
    if (ability.cooldown > 0) {
        btn.classList.add('disabled');
        btn.textContent = Math.ceil(ability.cooldown / 1000) + 's';
        if (ability.active) {
            btn.textContent = Math.ceil(ability.duration / 1000) + 's';
        }
    } else {
        btn.classList.remove('disabled');
        const titles = {
            'abilitySuper': '⚡\nСупер\nбег',
            'abilityFly': '🕊️\nПолёт',
            'abilityStun': '💪\nСилач'
        };
        btn.innerHTML = titles[buttonId];
    }
}

// Draw
function draw() {
    ctx.fillStyle = 'rgba(135, 206, 235, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawStickman(player.x, player.y, '#FF6B6B', player.isFlying);
    enemies.forEach(enemy => {
        const color = enemy.isStunned ? '#FFD700' : '#4169E1';
        drawStickman(enemy.x, enemy.y, color);
        if (enemy.isStunned) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, 45, 0, Math.PI * 2);
            ctx.stroke();
        }
    });
}

// Game loop
function gameLoop() {
    if (gameRunning) {
        updatePlayer();
        updateEnemies();
        updateUI();
        draw();
    }
    requestAnimationFrame(gameLoop);
}

// Start game
gameLoop();
console.log('🎮 Stickman Runner Game Started!');
