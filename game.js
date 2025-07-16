// ...game constants...
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Background image
const bgImg = new Image();
bgImg.src = 'bg-img.jpg';

const PLAYER_WIDTH = 60;
const PLAYER_HEIGHT = 20;
const PLAYER_Y = canvas.height - 40;
const PLAYER_SPEED = 6;

const BULLET_WIDTH = 6;
const BULLET_HEIGHT = 16;
let BULLET_SPEED = 8; // default bullet speed

const SPIDER_RADIUS = 18;
let SPIDER_SPEED = 2;
const SPIDER_SPAWN_INTERVAL = 1200; // ms

let playerX = canvas.width / 2 - PLAYER_WIDTH / 2;
let leftPressed = false;
let rightPressed = false;
let shootPressed = false;
let bullets = [];
let spiders = [];
let score = 0;
let lastSpiderSpawn = Date.now();

let gameRunning = false;
let gamePaused = false;
let particles = [];
let showSplash = true;
let gameOver = false;
let gameStartTime = 0;
let gameTime = 0;
let groundSpiders = []; // Spiders that reached the ground

// Splash screen settings
let spiderSpeedSetting = 2;
let bulletSpeedSetting = 8;
let selectedSlider = 'spider'; // 'spider' or 'bullet'

// Sound effects
const shootSound = document.getElementById('shootSound');
const breakSound = document.getElementById('breakSound');

const spiderImg = new Image();
spiderImg.src = 'spider.png'; // Place your real spider image in the project folder

const personImg = new Image();
personImg.src = 'person.png'; // Place your real person image in the project folder

// ...draw player...
function drawPlayer() {
    // Draw person image instead of shapes
    ctx.drawImage(personImg, playerX, PLAYER_Y - PLAYER_HEIGHT, PLAYER_WIDTH, PLAYER_HEIGHT * 2);
}

// ...draw bullets...
function drawBullets() {
    ctx.fillStyle = '#ff0';
    bullets.forEach(bullet => {
        // Draw bullet as an upward-pointing triangle
        ctx.beginPath();
        ctx.moveTo(bullet.x + BULLET_WIDTH / 2, bullet.y); // top point
        ctx.lineTo(bullet.x, bullet.y + BULLET_HEIGHT); // bottom left
        ctx.lineTo(bullet.x + BULLET_WIDTH, bullet.y + BULLET_HEIGHT); // bottom right
        ctx.closePath();
        ctx.fill();
    });
}

// ...draw realistic spider...
function drawSpiders() {
    // Draw hanging spiders
    spiders.forEach(spider => {
        // Draw web
        ctx.strokeStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(spider.x, 0);
        ctx.lineTo(spider.x, spider.y - SPIDER_RADIUS);
        ctx.stroke();
        // Draw spider image
        ctx.drawImage(spiderImg, spider.x - SPIDER_RADIUS, spider.y - SPIDER_RADIUS, SPIDER_RADIUS * 2, SPIDER_RADIUS * 2);
    });
    
    // Draw ground spiders
    groundSpiders.forEach(spider => {
        ctx.drawImage(spiderImg, spider.x - SPIDER_RADIUS, spider.y - SPIDER_RADIUS, SPIDER_RADIUS * 2, SPIDER_RADIUS * 2);
    });
}

// ...draw particles...
function drawParticles() {
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });
}

// ...draw background...
function drawBackground() {
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
}

// ...move player...
function movePlayer() {
    if (leftPressed) playerX -= PLAYER_SPEED;
    if (rightPressed) playerX += PLAYER_SPEED;
    playerX = Math.max(0, Math.min(canvas.width - PLAYER_WIDTH, playerX));
}

// ...move bullets...
function moveBullets() {
    bullets.forEach(bullet => bullet.y -= BULLET_SPEED);
    bullets = bullets.filter(bullet => bullet.y + BULLET_HEIGHT > 0);
}

// ...move spiders...
function moveSpiders() {
    spiders.forEach((spider, idx) => {
        spider.y += SPIDER_SPEED;
        // Check if spider reached the ground
        if (spider.y >= canvas.height - SPIDER_RADIUS) {
            groundSpiders.push({
                x: spider.x,
                y: canvas.height - SPIDER_RADIUS,
                targetX: playerX + PLAYER_WIDTH / 2
            });
            spiders.splice(idx, 1);
        }
    });
}

// ...move ground spiders toward player...
function moveGroundSpiders() {
    groundSpiders.forEach(spider => {
        const dx = (playerX + PLAYER_WIDTH / 2) - spider.x;
        const speed = 1.5;
        if (Math.abs(dx) > speed) {
            spider.x += dx > 0 ? speed : -speed;
        } else {
            spider.x = playerX + PLAYER_WIDTH / 2;
        }
    });
}

// ...spawn spider...
function spawnSpider() {
    const now = Date.now();
    if (now - lastSpiderSpawn > SPIDER_SPAWN_INTERVAL) {
        const x = Math.random() * (canvas.width - SPIDER_RADIUS * 2) + SPIDER_RADIUS;
        spiders.push({ x, y: 0 });
        lastSpiderSpawn = now;
    }
}

// ...update particles...
function updateParticles() {
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.03;
    });
    particles = particles.filter(p => p.alpha > 0);
}

// ...spawn particles...
function spawnParticles(x, y) {
    for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1,
            size: Math.random() * 4 + 2,
            color: '#ff0'
        });
    }
}

// ...collision detection...
function checkCollisions() {
    // Bullet vs hanging spiders
    bullets.forEach((bullet, bIdx) => {
        spiders.forEach((spider, sIdx) => {
            if (
                bullet.x > spider.x - SPIDER_RADIUS &&
                bullet.x < spider.x + SPIDER_RADIUS &&
                bullet.y > spider.y - SPIDER_RADIUS &&
                bullet.y < spider.y + SPIDER_RADIUS
            ) {
                score += 20;
                spawnParticles(spider.x, spider.y);
                spiders.splice(sIdx, 1);
                bullets.splice(bIdx, 1);
                if (breakSound) breakSound.currentTime = 0, breakSound.play();
            }
        });
        
        // Bullet vs ground spiders
        groundSpiders.forEach((spider, sIdx) => {
            if (
                bullet.x > spider.x - SPIDER_RADIUS &&
                bullet.x < spider.x + SPIDER_RADIUS &&
                bullet.y > spider.y - SPIDER_RADIUS &&
                bullet.y < spider.y + SPIDER_RADIUS
            ) {
                score += 30;
                spawnParticles(spider.x, spider.y);
                groundSpiders.splice(sIdx, 1);
                bullets.splice(bIdx, 1);
                if (breakSound) breakSound.currentTime = 0, breakSound.play();
            }
        });
    });
    
    // Player vs ground spiders (game over)
    groundSpiders.forEach(spider => {
        if (
            playerX < spider.x + SPIDER_RADIUS &&
            playerX + PLAYER_WIDTH > spider.x - SPIDER_RADIUS &&
            PLAYER_Y < spider.y + SPIDER_RADIUS &&
            PLAYER_Y + PLAYER_HEIGHT > spider.y - SPIDER_RADIUS
        ) {
            gameOver = true;
            gameRunning = false;
        }
    });
}

// ...draw score with shadow...
function drawScore() {
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillText('Score: ' + score, 22, 32);
    
    // Main text
    ctx.fillStyle = '#fff';
    ctx.fillText('Score: ' + score, 20, 30);
}

// ...draw timer...
function drawTimer() {
    const minutes = Math.floor(gameTime / 60);
    const seconds = Math.floor(gameTime % 60);
    const timeText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'right';
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillText('Time: ' + timeText, canvas.width - 18, 32);
    
    // Main text
    ctx.fillStyle = '#fff';
    ctx.fillText('Time: ' + timeText, canvas.width - 20, 30);
}

// ...draw pause screen...
function drawPauseScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    
    ctx.font = '20px Arial';
    ctx.fillText('Press P to continue', canvas.width / 2, canvas.height / 2 + 50);
}

// ...draw game over screen...
function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#f00';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 60);
    
    ctx.fillStyle = '#fff';
    ctx.font = '28px Arial';
    ctx.fillText('Spider caught you!', canvas.width / 2, canvas.height / 2 - 10);
    
    ctx.font = '24px Arial';
    ctx.fillText('Final Score: ' + score, canvas.width / 2, canvas.height / 2 + 30);
    
    const minutes = Math.floor(gameTime / 60);
    const seconds = Math.floor(gameTime % 60);
    const timeText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    ctx.fillText('Time Survived: ' + timeText, canvas.width / 2, canvas.height / 2 + 60);
    
    ctx.fillStyle = '#0a0';
    ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 + 90, 200, 40);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('Press R to Restart', canvas.width / 2, canvas.height / 2 + 115);
}

// ...draw splash screen...
function drawSplash() {
    // Dark background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Spider Shooting Game', canvas.width / 2, 100);
    
    // Settings box
    ctx.fillStyle = 'rgba(50, 50, 50, 0.9)';
    ctx.fillRect(canvas.width / 2 - 200, 150, 400, 250);
    
    // Settings title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Settings', canvas.width / 2, 180);
    
    // Spider speed setting
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Spider Speed: ' + spiderSpeedSetting, canvas.width / 2 - 180, 220);
    
    // Spider speed bar
    ctx.fillStyle = selectedSlider === 'spider' ? '#ff0' : '#666';
    ctx.fillRect(canvas.width / 2 - 180, 230, 200, 20);
    ctx.fillStyle = '#0f0';
    ctx.fillRect(canvas.width / 2 - 180, 230, (spiderSpeedSetting / 8) * 200, 20);
    
    // Bullet speed setting
    ctx.fillStyle = '#fff';
    ctx.fillText('Bullet Speed: ' + bulletSpeedSetting, canvas.width / 2 - 180, 280);
    
    // Bullet speed bar
    ctx.fillStyle = selectedSlider === 'bullet' ? '#ff0' : '#666';
    ctx.fillRect(canvas.width / 2 - 180, 290, 200, 20);
    ctx.fillStyle = '#0f0';
    ctx.fillRect(canvas.width / 2 - 180, 290, ((bulletSpeedSetting - 4) / 16) * 200, 20);
    
    // Start button
    ctx.fillStyle = '#0a0';
    ctx.fillRect(canvas.width / 2 - 80, 340, 160, 40);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('START GAME', canvas.width / 2, 365);
    
    // Instructions
    ctx.font = '14px Arial';
    ctx.fillText('Use Arrow Keys to adjust settings, Enter to start', canvas.width / 2, canvas.height - 50);
    ctx.fillText('Game Controls: ← → to move, Ctrl to shoot, P to pause', canvas.width / 2, canvas.height - 30);
}

// ...main draw...
function draw() {
    if (showSplash) {
        drawSplash();
        return;
    }
    
    if (gameOver) {
        drawGameOver();
        return;
    }
    
    drawBackground();
    drawPlayer();
    drawBullets();
    drawSpiders();
    drawParticles();
    drawScore();
    drawTimer();
    
    if (gamePaused) {
        drawPauseScreen();
    }
}

// ...main update...
function update() {
    if (showSplash || gameOver) {
        draw();
        requestAnimationFrame(update);
        return;
    }
    
    if (!gameRunning || gamePaused) {
        draw();
        requestAnimationFrame(update);
        return;
    }
    
    // Update game timer
    gameTime = (Date.now() - gameStartTime) / 1000;
    
    movePlayer();
    moveBullets();
    moveSpiders();
    moveGroundSpiders();
    spawnSpider();
    checkCollisions();
    updateParticles();
    draw();
    requestAnimationFrame(update);
}

// Button handlers removed - now using keyboard controls only

// ...keyboard controls...
document.addEventListener('keydown', e => {
    if (showSplash) {
        if (e.code === 'ArrowLeft') {
            selectedSlider = 'spider';
        }
        if (e.code === 'ArrowRight') {
            selectedSlider = 'bullet';
        }
        if (e.code === 'ArrowUp') {
            if (selectedSlider === 'spider') {
                spiderSpeedSetting = Math.min(8, spiderSpeedSetting + 1);
            } else {
                bulletSpeedSetting = Math.min(20, bulletSpeedSetting + 1);
            }
        }
        if (e.code === 'ArrowDown') {
            if (selectedSlider === 'spider') {
                spiderSpeedSetting = Math.max(1, spiderSpeedSetting - 1);
            } else {
                bulletSpeedSetting = Math.max(4, bulletSpeedSetting - 1);
            }
        }
        if (e.code === 'Enter') {
            showSplash = false;
            gameRunning = true;
            gamePaused = false;
            gameStartTime = Date.now();
            SPIDER_SPEED = spiderSpeedSetting;
            BULLET_SPEED = bulletSpeedSetting;
        }
        return;
    }
    
    if (gameOver) {
        if (e.code === 'KeyR') {
            // Restart game
            score = 0;
            gameTime = 0;
            spiders = [];
            groundSpiders = [];
            bullets = [];
            particles = [];
            gameOver = false;
            showSplash = true;
            gameRunning = false;
            gamePaused = false;
            playerX = canvas.width / 2 - PLAYER_WIDTH / 2;
        }
        return;
    }
    
    if (e.code === 'ArrowLeft') leftPressed = true;
    if (e.code === 'ArrowRight') rightPressed = true;
    if (e.code === 'ControlLeft' || e.code === 'ControlRight') shootPressed = true;
    if (e.code === 'KeyP') gamePaused = !gamePaused;
});
document.addEventListener('keyup', e => {
    if (showSplash) return;
    
    if (e.code === 'ArrowLeft') leftPressed = false;
    if (e.code === 'ArrowRight') rightPressed = false;
    if (e.code === 'ControlLeft' || e.code === 'ControlRight') shootPressed = false;
});

// ...shooting...
setInterval(() => {
    if (shootPressed && gameRunning && !gamePaused && !showSplash) {
        bullets.push({ x: playerX + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2, y: PLAYER_Y });
        if (shootSound) shootSound.currentTime = 0, shootSound.play();
    }
}, 200); // shooting rate

// Start the game loop
update();
