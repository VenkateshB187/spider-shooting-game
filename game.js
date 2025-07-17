// ...game constants...
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Mobile detection and canvas scaling
const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
let canvasScale = 1;

// Responsive canvas setup
function setupCanvas() {
    const container = document.getElementById('gameContainer');
    const maxWidth = Math.min(window.innerWidth * 0.95, 800);
    const maxHeight = Math.min(window.innerHeight * (isMobile ? 0.6 : 0.8), 600);
    
    // Calculate scale to fit screen
    const scaleX = maxWidth / 800;
    const scaleY = maxHeight / 600;
    canvasScale = Math.min(scaleX, scaleY);
    
    canvas.style.width = (800 * canvasScale) + 'px';
    canvas.style.height = (600 * canvasScale) + 'px';
}

// Call setup on load and resize
setupCanvas();
window.addEventListener('resize', setupCanvas);

// Background image
const bgImg = new Image();
bgImg.src = 'bg-img.jpg';

const PLAYER_WIDTH = 60;
const PLAYER_HEIGHT = 20;
const PLAYER_Y = canvas.height - 40;
const PLAYER_SPEED = 6;

const BULLET_WIDTH = 6;
const BULLET_HEIGHT = 16;
const BASE_BULLET_SPEED = 8;
let BULLET_SPEED = BASE_BULLET_SPEED;

// Horizontal bullet properties
const HORIZONTAL_BULLET_WIDTH = 12;
const HORIZONTAL_BULLET_HEIGHT = 4;
const HORIZONTAL_BULLET_SPEED = 10;

const SPIDER_RADIUS = 18;
const BASE_SPIDER_SPEED = 1; // Start slower for level 1
let SPIDER_SPEED = BASE_SPIDER_SPEED;
const BASE_SPIDER_SPAWN_INTERVAL = 2000; // Start with slower spawn rate

// Spider bullet properties
const SPIDER_BULLET_WIDTH = 4;
const SPIDER_BULLET_HEIGHT = 8;
const SPIDER_BULLET_SPEED = 3;
let spiderBullets = [];
let horizontalBullets = []; // For horizontal shooting

let playerX = canvas.width / 2 - PLAYER_WIDTH / 2;
let playerY = PLAYER_Y; // Add playerY variable for jumping
let playerVelocityY = 0; // Vertical velocity for jumping
let isJumping = false; // Jump state
let upPressed = false; // Up arrow key state
const JUMP_POWER = -12; // Jump strength (negative for upward)
const GRAVITY = 0.6; // Gravity strength
const GROUND_Y = PLAYER_Y; // Ground level
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
let pauseStartTime = 0;
let totalPauseTime = 0;
let groundSpiders = []; // Spiders that reached the ground

// Level transition animation variables
let isLevelTransition = false;
let levelTransitionStartTime = 0;
let levelTransitionDuration = 2500; // Total transition duration (2.5 seconds)
let fadeInDuration = 800; // Fade in duration
let displayDuration = 900; // Message display duration
let fadeOutDuration = 800; // Fade out duration
let newLevelNumber = 1;

// New game features
let currentLevel = 1;
let maxLevel = 10;
let lives = 3;
let maxLives = 5;
let levelScore = 0;
let scoreToNextLevel = 100; // Score needed to advance to next level

// Splash screen - simplified without speed controls
let selectedOption = 'start'; // Only start option now

// Sound effects
const shootSound = document.getElementById('shootSound');
const breakSound = document.getElementById('breakSound');
const backgroundMusic = document.getElementById('backgroundMusic');
const gameOverSound = document.getElementById('gameOverSound');
const loseLifeSound = document.getElementById('loseLifeSound');
const jumpSound = document.getElementById('jumpSound');
const enterSound = document.getElementById('enterSound');

// Debug sound initialization
console.log('Sound elements loaded:');
console.log('shootSound:', !!shootSound);
console.log('breakSound:', !!breakSound);
console.log('backgroundMusic:', !!backgroundMusic);
console.log('gameOverSound:', !!gameOverSound);
console.log('loseLifeSound:', !!loseLifeSound);
console.log('jumpSound:', !!jumpSound);
console.log('enterSound:', !!enterSound);

// Set default volumes for better audio experience
if (shootSound) shootSound.volume = 0.6;
if (breakSound) breakSound.volume = 0.7;
if (gameOverSound) gameOverSound.volume = 0.8;
if (loseLifeSound) loseLifeSound.volume = 0.8;
if (jumpSound) jumpSound.volume = 0.5;
if (enterSound) enterSound.volume = 0.7;

const spiderImg = new Image();
spiderImg.src = 'spider.png'; // Place your real spider image in the project folder

// Spider animation variables for realistic movement
const SPIDER_LEG_COUNT = 8;
const SPIDER_BODY_SEGMENTS = 2; // Abdomen and thorax
let spiderAnimationTime = 0;

// Spider appearance constants
const SPIDER_BODY_COLOR = '#1a0a00';
const SPIDER_LEG_COLOR = '#2d1a0d';
const SPIDER_HIGHLIGHT_COLOR = '#4a2c1a';

const personImg = new Image();
personImg.src = 'person.png'; // Place your real person image in the project folder

// Animation time variable for menu effects
let menuAnimationTime = 0;

// Function to draw 3D text with various effects
function draw3DText(text, x, y, size, style = 'default') {
    const time = menuAnimationTime;
    
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    switch (style) {
        case 'title':
            // Extruded 3D title with gradient and animation
            const titleScale = 1 + Math.sin(time / 500) * 0.1;
            const titleRotate = Math.sin(time / 1000) * 0.1;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(titleScale, titleScale);
            ctx.rotate(titleRotate);
            
            // 3D depth layers
            for (let i = 8; i >= 0; i--) {
                const depth = i * 2;
                const alpha = 1 - (i / 10);
                
                if (i === 0) {
                    // Front face with gradient
                    const gradient = ctx.createLinearGradient(0, -size/2, 0, size/2);
                    gradient.addColorStop(0, '#ff6600');
                    gradient.addColorStop(0.5, '#ffaa00');
                    gradient.addColorStop(1, '#ff3300');
                    ctx.fillStyle = gradient;
                } else {
                    // Depth layers
                    ctx.fillStyle = `rgba(${100 - i * 8}, ${50 - i * 4}, 0, ${alpha})`;
                }
                
                ctx.font = `bold ${size}px Arial`;
                ctx.fillText(text, depth, depth);
            }
            
            // Outline
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.font = `bold ${size}px Arial`;
            ctx.strokeText(text, 0, 0);
            
            // Glow effect
            ctx.shadowColor = '#ffaa00';
            ctx.shadowBlur = 20;
            ctx.fillStyle = '#fff';
            ctx.fillText(text, 0, 0);
            
            ctx.restore();
            break;
            
        case 'instruction':
            // Floating and pulsing instruction text
            const instFloat = Math.sin(time / 300) * 3;
            const instPulse = 1 + Math.sin(time / 400) * 0.2;
            
            ctx.save();
            ctx.translate(x, y + instFloat);
            ctx.scale(instPulse, instPulse);
            
            // Shadow depth
            for (let i = 5; i >= 0; i--) {
                if (i === 0) {
                    // Front face
                    ctx.fillStyle = '#00ffff';
                } else {
                    ctx.fillStyle = `rgba(0, ${255 - i * 40}, ${255 - i * 40}, ${0.8 - i * 0.15})`;
                }
                
                ctx.font = `bold ${size}px Arial`;
                ctx.fillText(text, i * 1.5, i * 1.5);
            }
            
            // Glow
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 15;
            ctx.fillStyle = '#ffffff';
            ctx.fillText(text, 0, 0);
            
            ctx.restore();
            break;
            
        case 'control':
            // Enhanced control text with better visibility
            const controlShimmer = Math.sin(time / 200 + x / 50) * 0.5 + 0.5;
            
            // Dark outline for contrast
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.lineWidth = 3;
            ctx.font = `bold ${size}px Arial`;
            ctx.strokeText(text, 0, 0);
            
            // Depth
            for (let i = 3; i >= 0; i--) {
                if (i === 0) {
                    // Front face with enhanced shimmer
                    const alpha = 0.9 + controlShimmer * 0.1;
                    const red = Math.floor(200 + controlShimmer * 55);
                    const green = Math.floor(200 + controlShimmer * 55);
                    const blue = Math.floor(200 + controlShimmer * 55);
                    ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
                } else {
                    ctx.fillStyle = `rgba(150, 150, 150, ${0.6 - i * 0.15})`;
                }
                
                ctx.font = `bold ${size}px Arial`;
                ctx.fillText(text, i, i);
            }
            
            // Additional glow
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 5;
            ctx.fillStyle = '#ffffff';
            ctx.fillText(text, 0, 0);
            ctx.shadowBlur = 0;
            break;
            
        case 'gameOver':
            // Dramatic game over effect
            const shakeX = (Math.random() - 0.5) * 4;
            const shakeY = (Math.random() - 0.5) * 4;
            const gameOverScale = 1 + Math.sin(time / 200) * 0.15;
            
            ctx.save();
            ctx.translate(x + shakeX, y + shakeY);
            ctx.scale(gameOverScale, gameOverScale);
            
            // Deep 3D extrusion
            for (let i = 12; i >= 0; i--) {
                const depth = i * 3;
                
                if (i === 0) {
                    // Front face
                    const gradient = ctx.createLinearGradient(0, -size/2, 0, size/2);
                    gradient.addColorStop(0, '#ff0000');
                    gradient.addColorStop(0.5, '#cc0000');
                    gradient.addColorStop(1, '#990000');
                    ctx.fillStyle = gradient;
                } else {
                    const darkness = Math.max(0, 100 - i * 8);
                    ctx.fillStyle = `rgba(${darkness}, 0, 0, ${0.8 - i * 0.06})`;
                }
                
                ctx.font = `bold ${size}px Arial`;
                ctx.fillText(text, depth, depth);
            }
            
            // Electric outline effect
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.lineDashOffset = time / 20;
            ctx.strokeText(text, 0, 0);
            ctx.setLineDash([]);
            
            ctx.restore();
            break;
            
        case 'score':
            // Metallic score text with enhanced visibility
            const metalShine = Math.sin(time / 300 + x / 30) * 0.5 + 0.5;
            
            // Dark outline for better contrast
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.lineWidth = 4;
            ctx.font = `bold ${size}px Arial`;
            ctx.strokeText(text, 0, 0);
            
            // 3D depth
            for (let i = 4; i >= 0; i--) {
                if (i === 0) {
                    // Metallic front face with enhanced brightness
                    const gradient = ctx.createLinearGradient(-50, -size/2, 50, size/2);
                    gradient.addColorStop(0, '#e0e0e0');
                    gradient.addColorStop(0.3, '#ffffff');
                    gradient.addColorStop(0.7, '#c0c0c0');
                    gradient.addColorStop(1, '#a0a0a0');
                    ctx.fillStyle = gradient;
                } else {
                    ctx.fillStyle = `rgba(${64 - i * 12}, ${64 - i * 12}, ${64 - i * 12}, ${0.8 - i * 0.15})`;
                }
                
                ctx.font = `bold ${size}px Arial`;
                ctx.fillText(text, i * 1.5, i * 1.5);
            }
            
            // Shine effect
            if (metalShine > 0.7) {
                ctx.fillStyle = `rgba(255, 255, 255, ${(metalShine - 0.7) * 4})`;
                ctx.fillText(text, 0, 0);
            }
            
            // Additional glow for better visibility
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 8;
            ctx.fillStyle = '#ffffff';
            ctx.fillText(text, 0, 0);
            ctx.shadowBlur = 0;
            break;
    }
    
    ctx.restore();
}

// ...draw player...
function drawPlayer() {
    // Draw person image with fallback
    if (personImg.complete && personImg.naturalWidth !== 0) {
        ctx.drawImage(personImg, playerX, playerY - PLAYER_HEIGHT, PLAYER_WIDTH, PLAYER_HEIGHT * 2);
    } else {
        // Fallback: draw simple player shape
        ctx.fillStyle = '#0f0';
        ctx.fillRect(playerX + PLAYER_WIDTH / 4, playerY, PLAYER_WIDTH / 2, PLAYER_HEIGHT);
        ctx.beginPath();
        ctx.arc(playerX + PLAYER_WIDTH / 2, playerY - PLAYER_HEIGHT / 2, PLAYER_HEIGHT / 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ...draw bullets...
function drawBullets() {
    // Player vertical bullets
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
    
    // Player horizontal bullets
    ctx.fillStyle = '#0ff'; // Cyan color for horizontal bullets
    horizontalBullets.forEach(bullet => {
        // Draw horizontal bullet as diamond shape
        ctx.beginPath();
        if (bullet.direction > 0) {
            // Right-pointing diamond
            ctx.moveTo(bullet.x + HORIZONTAL_BULLET_WIDTH, bullet.y + HORIZONTAL_BULLET_HEIGHT / 2); // right point
            ctx.lineTo(bullet.x + HORIZONTAL_BULLET_WIDTH / 2, bullet.y); // top
            ctx.lineTo(bullet.x, bullet.y + HORIZONTAL_BULLET_HEIGHT / 2); // left point
            ctx.lineTo(bullet.x + HORIZONTAL_BULLET_WIDTH / 2, bullet.y + HORIZONTAL_BULLET_HEIGHT); // bottom
        } else {
            // Left-pointing diamond
            ctx.moveTo(bullet.x, bullet.y + HORIZONTAL_BULLET_HEIGHT / 2); // left point
            ctx.lineTo(bullet.x + HORIZONTAL_BULLET_WIDTH / 2, bullet.y); // top
            ctx.lineTo(bullet.x + HORIZONTAL_BULLET_WIDTH, bullet.y + HORIZONTAL_BULLET_HEIGHT / 2); // right point
            ctx.lineTo(bullet.x + HORIZONTAL_BULLET_WIDTH / 2, bullet.y + HORIZONTAL_BULLET_HEIGHT); // bottom
        }
        ctx.closePath();
        ctx.fill();
    });
    
    // Spider bullets
    ctx.fillStyle = '#f00';
    spiderBullets.forEach(bullet => {
        // Draw spider bullet as downward-pointing triangle
        ctx.beginPath();
        ctx.moveTo(bullet.x + SPIDER_BULLET_WIDTH / 2, bullet.y + SPIDER_BULLET_HEIGHT); // bottom point
        ctx.lineTo(bullet.x, bullet.y); // top left
        ctx.lineTo(bullet.x + SPIDER_BULLET_WIDTH, bullet.y); // top right
        ctx.closePath();
        ctx.fill();
    });
}

// Function to draw a realistic animated spider
function drawRealisticSpider(x, y, size, animationOffset = 0) {
    const time = spiderAnimationTime + animationOffset;
    
    // Draw shadow first
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x + 2, y + size + 3, size * 0.8, size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Body segments with breathing animation
    const breathe = 1 + Math.sin(time / 800) * 0.05;
    const abdomenSize = size * 0.7 * breathe;
    const thoraxSize = size * 0.5 * breathe;
    const headSize = size * 0.3;
    
    // Body sway animation
    const bodySwayX = Math.sin(time / 300) * 1;
    const bodySwayY = Math.cos(time / 400) * 0.5;
    
    // Draw abdomen (back part) with gradient
    const gradient = ctx.createRadialGradient(x + bodySwayX, y + bodySwayY, 0, x + bodySwayX, y + bodySwayY, abdomenSize);
    gradient.addColorStop(0, SPIDER_HIGHLIGHT_COLOR);
    gradient.addColorStop(0.7, SPIDER_BODY_COLOR);
    gradient.addColorStop(1, '#0a0500');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(x + bodySwayX, y + bodySwayY, abdomenSize, abdomenSize * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Abdomen markings
    ctx.fillStyle = 'rgba(255, 140, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x + bodySwayX, y + bodySwayY, abdomenSize * 0.4, abdomenSize * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw thorax (middle part)
    ctx.fillStyle = SPIDER_BODY_COLOR;
    ctx.beginPath();
    ctx.ellipse(x + bodySwayX, y - thoraxSize + bodySwayY, thoraxSize, thoraxSize * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Thorax highlight
    ctx.fillStyle = SPIDER_HIGHLIGHT_COLOR;
    ctx.beginPath();
    ctx.ellipse(x + bodySwayX, y - thoraxSize + bodySwayY, thoraxSize * 0.6, thoraxSize * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw head with mandibles
    ctx.fillStyle = SPIDER_BODY_COLOR;
    ctx.beginPath();
    ctx.arc(x + bodySwayX, y - thoraxSize - headSize/2 + bodySwayY, headSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw multiple eyes (spiders have 8 eyes)
    const eyePositions = [
        {x: -headSize/3, y: -headSize/4, size: 0.15},
        {x: headSize/3, y: -headSize/4, size: 0.15},
        {x: -headSize/5, y: -headSize/3, size: 0.1},
        {x: headSize/5, y: -headSize/3, size: 0.1},
        {x: -headSize/2, y: 0, size: 0.08},
        {x: headSize/2, y: 0, size: 0.08},
        {x: -headSize/4, y: headSize/4, size: 0.08},
        {x: headSize/4, y: headSize/4, size: 0.08}
    ];
    
    eyePositions.forEach(eye => {
        ctx.fillStyle = '#ff2200';
        ctx.beginPath();
        ctx.arc(
            x + eye.x + bodySwayX, 
            y - thoraxSize - headSize/2 + eye.y + bodySwayY, 
            headSize * eye.size, 
            0, Math.PI * 2
        );
        ctx.fill();
        
        // Eye reflection
        ctx.fillStyle = '#ff6666';
        ctx.beginPath();
        ctx.arc(
            x + eye.x + bodySwayX - headSize * eye.size * 0.3, 
            y - thoraxSize - headSize/2 + eye.y + bodySwayY - headSize * eye.size * 0.3, 
            headSize * eye.size * 0.3, 
            0, Math.PI * 2
        );
        ctx.fill();
    });
    
    // Draw 8 animated legs with realistic movement
    ctx.strokeStyle = SPIDER_LEG_COLOR;
    ctx.lineWidth = size * 0.08;
    ctx.lineCap = 'round';
    
    for (let i = 0; i < SPIDER_LEG_COUNT; i++) {
        const side = i < 4 ? -1 : 1; // Left or right side
        const legIndex = i % 4; // 0-3 for each side
        
        // Realistic spider leg movement - alternating tripod gait
        const legPhase = (time / 200) + (legIndex * Math.PI / 3);
        const legOffset = Math.sin(legPhase) * 0.4;
        const legLift = Math.max(0, Math.sin(legPhase + Math.PI/4)) * 3;
        
        // Leg positioning along thorax
        const legStartX = x + side * thoraxSize * 0.4 + bodySwayX;
        const legStartY = y - thoraxSize/2 + (legIndex * thoraxSize/3) + bodySwayY;
        
        // Leg segments with realistic proportions
        const legLength = size * 1.3;
        const segment1Length = legLength * 0.35;
        const segment2Length = legLength * 0.4;
        const segment3Length = legLength * 0.25;
        
        // First segment (coxa + femur)
        const angle1 = side * (Math.PI/3 + legIndex * Math.PI/10) + legOffset * 0.8;
        const joint1X = legStartX + Math.cos(angle1) * segment1Length;
        const joint1Y = legStartY + Math.sin(angle1) * segment1Length - legLift;
        
        ctx.beginPath();
        ctx.moveTo(legStartX, legStartY);
        ctx.lineTo(joint1X, joint1Y);
        ctx.stroke();
        
        // Second segment (tibia)
        const angle2 = angle1 + side * (Math.PI/3) + legOffset * 0.6;
        const joint2X = joint1X + Math.cos(angle2) * segment2Length;
        const joint2Y = joint1Y + Math.sin(angle2) * segment2Length;
        
        ctx.beginPath();
        ctx.moveTo(joint1X, joint1Y);
        ctx.lineTo(joint2X, joint2Y);
        ctx.stroke();
        
        // Third segment (metatarsus + tarsus)
        const angle3 = angle2 + side * (Math.PI/4) + legOffset * 0.4;
        const footX = joint2X + Math.cos(angle3) * segment3Length;
        const footY = joint2Y + Math.sin(angle3) * segment3Length;
        
        ctx.beginPath();
        ctx.moveTo(joint2X, joint2Y);
        ctx.lineTo(footX, footY);
        ctx.stroke();
        
        // Draw leg joints
        ctx.fillStyle = SPIDER_LEG_COLOR;
        ctx.beginPath();
        ctx.arc(joint1X, joint1Y, size * 0.06, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(joint2X, joint2Y, size * 0.05, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw foot/claw
        ctx.fillStyle = '#1a0a00';
        ctx.beginPath();
        ctx.arc(footX, footY, size * 0.04, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Draw chelicerae (fangs) - the business end!
    ctx.strokeStyle = '#1a0a00';
    ctx.lineWidth = size * 0.06;
    const fangLength = headSize * 0.6;
    const fangSway = Math.sin(time / 250) * 0.15;
    
    ctx.beginPath();
    ctx.moveTo(x - headSize/4 + bodySwayX, y - thoraxSize - headSize/4 + bodySwayY);
    ctx.lineTo(x - headSize/3 + bodySwayX + fangSway, y - thoraxSize + bodySwayY);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x + headSize/4 + bodySwayX, y - thoraxSize - headSize/4 + bodySwayY);
    ctx.lineTo(x + headSize/3 + bodySwayX - fangSway, y - thoraxSize + bodySwayY);
    ctx.stroke();
    
    // Draw pedipalps (smaller feeding appendages)
    ctx.strokeStyle = SPIDER_LEG_COLOR;
    ctx.lineWidth = size * 0.04;
    const palpLength = headSize * 0.7;
    const palpSway = Math.sin(time / 180) * 0.3;
    
    ctx.beginPath();
    ctx.moveTo(x + bodySwayX, y - thoraxSize - headSize/3 + bodySwayY);
    ctx.lineTo(x - palpLength + bodySwayX + palpSway, y - thoraxSize - headSize/2 + bodySwayY);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x + bodySwayX, y - thoraxSize - headSize/3 + bodySwayY);
    ctx.lineTo(x + palpLength + bodySwayX - palpSway, y - thoraxSize - headSize/2 + bodySwayY);
    ctx.stroke();
}
function drawSpiders() {
    // Update spider animation time
    spiderAnimationTime += 16; // Assuming 60fps, so ~16ms per frame
    
    // Draw hanging spiders
    spiders.forEach((spider, index) => {
        // Draw web
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(spider.x, 0);
        ctx.lineTo(spider.x, spider.y - SPIDER_RADIUS);
        ctx.stroke();
        
        // Draw web strands for realism
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 3; i++) {
            const offset = (Math.sin(spiderAnimationTime / 1000 + i) * 5);
            ctx.beginPath();
            ctx.moveTo(spider.x + offset, i * (spider.y / 3));
            ctx.lineTo(spider.x - offset, (i + 1) * (spider.y / 3));
            ctx.stroke();
        }
        
        // Draw realistic animated spider
        drawRealisticSpider(spider.x, spider.y, SPIDER_RADIUS, index * 100);
    });
    
    // Draw ground spiders with walking animation
    groundSpiders.forEach((spider, index) => {
        // Ground spiders have different animation for walking
        const walkCycle = Math.sin(spiderAnimationTime / 100 + index) * 2;
        
        // Draw realistic animated spider with ground movement
        drawRealisticSpider(spider.x, spider.y + walkCycle, SPIDER_RADIUS, index * 150);
        
        // Add dust particles under moving spider
        if (Math.random() < 0.1) {
            ctx.fillStyle = 'rgba(139, 69, 19, 0.3)';
            for (let i = 0; i < 3; i++) {
                const dustX = spider.x + (Math.random() - 0.5) * SPIDER_RADIUS;
                const dustY = spider.y + SPIDER_RADIUS + Math.random() * 5;
                ctx.beginPath();
                ctx.arc(dustX, dustY, 1, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    });
}

// ...draw particles...
function drawParticles() {
    particles.forEach(p => {
        if (p.size > 0 && p.alpha > 0) { // Safety check for valid size and alpha
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    });
}

// ...draw background...
function drawBackground() {
    if (bgImg.complete && bgImg.naturalWidth !== 0) {
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    } else {
        // Fallback: gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#001122');
        gradient.addColorStop(1, '#003366');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

// ...move player...
function movePlayer() {
    if (leftPressed) playerX -= PLAYER_SPEED;
    if (rightPressed) playerX += PLAYER_SPEED;
    playerX = Math.max(0, Math.min(canvas.width - PLAYER_WIDTH, playerX));
    
    // Handle jumping
    if (upPressed && !isJumping) {
        isJumping = true;
        playerVelocityY = JUMP_POWER;
        if (jumpSound) {
            jumpSound.currentTime = 0;
            jumpSound.play();
        }
    }
    
    // Apply gravity and update position
    if (isJumping) {
        playerY += playerVelocityY;
        playerVelocityY += GRAVITY;
        
        // Check if player landed
        if (playerY >= GROUND_Y) {
            playerY = GROUND_Y;
            playerVelocityY = 0;
            isJumping = false;
        }
    }
}

// ...move bullets...
function moveBullets() {
    // Move player vertical bullets
    bullets.forEach(bullet => bullet.y -= BULLET_SPEED);
    bullets = bullets.filter(bullet => bullet.y + BULLET_HEIGHT > 0);
    
    // Move player horizontal bullets
    horizontalBullets.forEach(bullet => bullet.x += bullet.direction * HORIZONTAL_BULLET_SPEED);
    horizontalBullets = horizontalBullets.filter(bullet => 
        bullet.x > -HORIZONTAL_BULLET_WIDTH && bullet.x < canvas.width + HORIZONTAL_BULLET_WIDTH
    );
    
    // Move spider bullets
    spiderBullets.forEach(bullet => bullet.y += SPIDER_BULLET_SPEED);
    spiderBullets = spiderBullets.filter(bullet => bullet.y < canvas.height);
}

// ...update difficulty based on level...
function updateDifficulty() {
    // Spider speed increases gradually with level
    SPIDER_SPEED = BASE_SPIDER_SPEED + (currentLevel - 1) * 0.3;
    
    // Bullet speed increases slightly with level (player gets better)
    BULLET_SPEED = BASE_BULLET_SPEED + (currentLevel - 1) * 0.5;
}

// ...move spiders...
function moveSpiders() {
    spiders.forEach((spider, idx) => {
        spider.y += SPIDER_SPEED;
        
        // Spider shoots at player when in range
        const distanceToPlayer = Math.abs(spider.x - (playerX + PLAYER_WIDTH / 2));
        const shouldShoot = spider.y > 100 && distanceToPlayer < 150 && Math.random() < 0.005 + (currentLevel - 1) * 0.002;
        
        if (shouldShoot) {
            spiderShoot(spider.x, spider.y);
        }
        
        // Check if spider reached the ground
        if (spider.y >= canvas.height - SPIDER_RADIUS) {
            groundSpiders.push({
                x: spider.x,
                y: canvas.height - SPIDER_RADIUS,
                targetX: playerX + PLAYER_WIDTH / 2,
                lastShot: Date.now(),
                animationFrame: 0 // Animation frame for ground spider
            });
            spiders.splice(idx, 1);
        }
    });
}

// ...spider shooting function...
function spiderShoot(x, y) {
    // Calculate direction towards player
    const targetX = playerX + PLAYER_WIDTH / 2;
    const targetY = PLAYER_Y + PLAYER_HEIGHT / 2;
    const dx = targetX - x;
    const dy = targetY - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Normalize direction
    const dirX = dx / distance;
    const dirY = dy / distance;
    
    spiderBullets.push({
        x: x - SPIDER_BULLET_WIDTH / 2,
        y: y,
        vx: dirX * SPIDER_BULLET_SPEED,
        vy: dirY * SPIDER_BULLET_SPEED
    });
}

// ...move spider bullets...
function moveSpiderBullets() {
    spiderBullets.forEach(bullet => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
    });
    spiderBullets = spiderBullets.filter(bullet => 
        bullet.x > -SPIDER_BULLET_WIDTH && 
        bullet.x < canvas.width + SPIDER_BULLET_WIDTH &&
        bullet.y > -SPIDER_BULLET_HEIGHT && 
        bullet.y < canvas.height + SPIDER_BULLET_HEIGHT
    );
}

// ...auto horizontal shooting...
function autoHorizontalShoot() {
    // Check for ground spiders approaching the player
    groundSpiders.forEach(spider => {
        const distanceToPlayer = Math.abs(spider.x - (playerX + PLAYER_WIDTH / 2));
        const isInRange = distanceToPlayer < 120; // Shooting range
        const shouldShoot = isInRange && Math.random() < 0.3; // 30% chance per frame when in range
        
        if (shouldShoot) {
            const direction = spider.x > playerX + PLAYER_WIDTH / 2 ? 1 : -1; // Shoot toward spider
            shootHorizontalBullet(direction);
        }
    });
}

// ...shoot horizontal bullet...
function shootHorizontalBullet(direction) {
    const bulletY = playerY + PLAYER_HEIGHT / 2 - HORIZONTAL_BULLET_HEIGHT / 2;
    const bulletX = direction > 0 ? 
        playerX + PLAYER_WIDTH : 
        playerX - HORIZONTAL_BULLET_WIDTH;
    
    horizontalBullets.push({
        x: bulletX,
        y: bulletY,
        direction: direction
    });
    
    // Play shoot sound
    if (shootSound) {
        shootSound.currentTime = 0;
        shootSound.play();
    }
}

// ...move ground spiders toward player...
function moveGroundSpiders() {
    const now = Date.now();
    groundSpiders.forEach(spider => {
        const dx = (playerX + PLAYER_WIDTH / 2) - spider.x;
        const speed = 1 + (currentLevel - 1) * 0.2; // Ground spiders get faster with level
        
        if (Math.abs(dx) > speed) {
            spider.x += dx > 0 ? speed : -speed;
        } else {
            spider.x = playerX + PLAYER_WIDTH / 2;
        }
        
        // Ground spiders shoot more frequently
        const shootInterval = 1500 - (currentLevel - 1) * 100; // Faster shooting at higher levels
        if (now - spider.lastShot > shootInterval && Math.random() < 0.3) {
            spiderShoot(spider.x, spider.y);
            spider.lastShot = now;
        }
    });
}

// ...spawn spider...
function spawnSpider() {
    const now = Date.now();
    // Spawn interval decreases with level, but starts slower for level 1
    const levelSpawnInterval = Math.max(800, BASE_SPIDER_SPAWN_INTERVAL - (currentLevel - 1) * 150);
    
    if (now - lastSpiderSpawn > levelSpawnInterval) {
        const x = Math.random() * (canvas.width - SPIDER_RADIUS * 2) + SPIDER_RADIUS;
        spiders.push({ 
            x, 
            y: 0,
            lastShot: now - Math.random() * 1000, // Random initial shot delay
            animationFrame: 0 // Animation frame for spider
        });
        lastSpiderSpawn = now;
        
        // Chance to spawn additional spiders at higher levels
        if (currentLevel > 3 && Math.random() < (currentLevel - 3) * 0.1) {
            const x2 = Math.random() * (canvas.width - SPIDER_RADIUS * 2) + SPIDER_RADIUS;
            spiders.push({ 
                x: x2, 
                y: 0,
                lastShot: now - Math.random() * 1000,
                animationFrame: 0 // Animation frame for spider
            });
        }
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
    // Vertical bullet vs hanging spiders
    bullets.forEach((bullet, bIdx) => {
        spiders.forEach((spider, sIdx) => {
            if (
                bullet.x > spider.x - SPIDER_RADIUS &&
                bullet.x < spider.x + SPIDER_RADIUS &&
                bullet.y > spider.y - SPIDER_RADIUS &&
                bullet.y < spider.y + SPIDER_RADIUS
            ) {
                const points = 20 + (currentLevel - 1) * 5; // More points at higher levels
                score += points;
                levelScore += points;
                spawnParticles(spider.x, spider.y);
                spiders.splice(sIdx, 1);
                bullets.splice(bIdx, 1);
                if (breakSound) breakSound.currentTime = 0, breakSound.play();
                
                // Check level progression
                checkLevelUp();
            }
        });
        
        // Vertical bullet vs ground spiders
        groundSpiders.forEach((spider, sIdx) => {
            if (
                bullet.x > spider.x - SPIDER_RADIUS &&
                bullet.x < spider.x + SPIDER_RADIUS &&
                bullet.y > spider.y - SPIDER_RADIUS &&
                bullet.y < spider.y + SPIDER_RADIUS
            ) {
                const points = 30 + (currentLevel - 1) * 5; // More points at higher levels
                score += points;
                levelScore += points;
                spawnParticles(spider.x, spider.y);
                groundSpiders.splice(sIdx, 1);
                bullets.splice(bIdx, 1);
                if (breakSound) breakSound.currentTime = 0, breakSound.play();
                
                // Check level progression
                checkLevelUp();
            }
        });
    });
    
    // Horizontal bullet vs ground spiders
    horizontalBullets.forEach((bullet, bIdx) => {
        groundSpiders.forEach((spider, sIdx) => {
            if (
                bullet.x < spider.x + SPIDER_RADIUS &&
                bullet.x + HORIZONTAL_BULLET_WIDTH > spider.x - SPIDER_RADIUS &&
                bullet.y < spider.y + SPIDER_RADIUS &&
                bullet.y + HORIZONTAL_BULLET_HEIGHT > spider.y - SPIDER_RADIUS
            ) {
                const points = 40 + (currentLevel - 1) * 5; // Bonus points for horizontal shots
                score += points;
                levelScore += points;
                spawnParticles(spider.x, spider.y);
                groundSpiders.splice(sIdx, 1);
                horizontalBullets.splice(bIdx, 1);
                if (breakSound) breakSound.currentTime = 0, breakSound.play();
                
                // Check level progression
                checkLevelUp();
            }
        });
        
        // Horizontal bullet vs hanging spiders (if they're low enough)
        spiders.forEach((spider, sIdx) => {
            if (
                spider.y > PLAYER_Y - 50 && // Only if spider is near player level
                bullet.x < spider.x + SPIDER_RADIUS &&
                bullet.x + HORIZONTAL_BULLET_WIDTH > spider.x - SPIDER_RADIUS &&
                bullet.y < spider.y + SPIDER_RADIUS &&
                bullet.y + HORIZONTAL_BULLET_HEIGHT > spider.y - SPIDER_RADIUS
            ) {
                const points = 35 + (currentLevel - 1) * 5; // Bonus for creative shots
                score += points;
                levelScore += points;
                spawnParticles(spider.x, spider.y);
                spiders.splice(sIdx, 1);
                horizontalBullets.splice(bIdx, 1);
                if (breakSound) breakSound.currentTime = 0, breakSound.play();
                
                // Check level progression
                checkLevelUp();
            }
        });
    });
    
    // Spider bullets vs player
    spiderBullets.forEach((bullet, bIdx) => {
        if (
            bullet.x > playerX &&
            bullet.x < playerX + PLAYER_WIDTH &&
            bullet.y > playerY &&
            bullet.y < playerY + PLAYER_HEIGHT
        ) {
            console.log('Spider bullet hit player!');
            loseLife();
            spiderBullets.splice(bIdx, 1);
            spawnParticles(playerX + PLAYER_WIDTH / 2, playerY + PLAYER_HEIGHT / 2);
        }
    });
    
    // Player vs ground spiders (lose life)
    groundSpiders.forEach((spider, sIdx) => {
        if (
            playerX < spider.x + SPIDER_RADIUS &&
            playerX + PLAYER_WIDTH > spider.x - SPIDER_RADIUS &&
            playerY < spider.y + SPIDER_RADIUS &&
            playerY + PLAYER_HEIGHT > spider.y - SPIDER_RADIUS
        ) {
            console.log('Ground spider touched player!');
            loseLife();
            groundSpiders.splice(sIdx, 1); // Remove the spider that caught player
        }
    });
}

// ...level and life management...
function checkLevelUp() {
    const requiredScore = scoreToNextLevel * currentLevel;
    if (levelScore >= requiredScore && currentLevel < maxLevel) {
        currentLevel++;
        levelScore = 0;
        lives = Math.min(maxLives, lives + 1); // Bonus life on level up
        updateDifficulty(); // Update speeds based on new level
        showLevelUpMessage();
    }
}

function loseLife() {
    console.log('loseLife() function called - lives before:', lives);
    lives--;
    
    // Play lose life sound effect immediately and prominently
    if (loseLifeSound) {
        try {
            loseLifeSound.currentTime = 0;
            loseLifeSound.volume = 0.8; // Ensure volume is high enough
            const playPromise = loseLifeSound.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.log('Lose life sound failed to play:', e);
                });
            }
            console.log('Lose life sound should be playing now');
        } catch (error) {
            console.log('Error playing lose life sound:', error);
        }
    } else {
        console.log('Lose life sound element not found');
    }
    
    if (lives <= 0) {
        gameOver = true;
        gameRunning = false;
        if (backgroundMusic) backgroundMusic.pause();
        if (gameOverSound) gameOverSound.currentTime = 0, gameOverSound.play();
    } else {
        // Reset player position and clear threats
        playerX = canvas.width / 2 - PLAYER_WIDTH / 2;
        playerY = GROUND_Y; // Reset to ground position
        playerVelocityY = 0; // Reset jump velocity
        isJumping = false; // Reset jump state
        groundSpiders = [];
        spiderBullets = []; // Clear spider bullets on respawn
        horizontalBullets = []; // Clear horizontal bullets on respawn
        // Brief invincibility could be added here
    }
}

function showLevelUpMessage() {
    // Start level transition animation
    isLevelTransition = true;
    levelTransitionStartTime = Date.now();
    newLevelNumber = currentLevel;
    
    // Track transition as pause time for timer
    pauseStartTime = Date.now();
    
    // Clear enemies after fade in completes
    setTimeout(() => {
        spiders = [];
        groundSpiders = [];
        spiderBullets = [];
        horizontalBullets = [];
    }, fadeInDuration + 200);
    
    // End transition and resume timer
    setTimeout(() => {
        if (pauseStartTime > 0) {
            totalPauseTime += Date.now() - pauseStartTime;
            pauseStartTime = 0;
        }
        isLevelTransition = false;
    }, levelTransitionDuration);
}

// Function to draw level transition overlay
function drawLevelTransition() {
    if (!isLevelTransition) return;
    
    const elapsed = Date.now() - levelTransitionStartTime;
    let alpha = 0;
    let textAlpha = 0;
    
    // Calculate fade phases
    if (elapsed < fadeInDuration) {
        // Fade in phase
        alpha = elapsed / fadeInDuration;
        textAlpha = Math.max(0, (elapsed - 200) / (fadeInDuration - 200));
    } else if (elapsed < fadeInDuration + displayDuration) {
        // Display phase
        alpha = 1;
        textAlpha = 1;
    } else if (elapsed < levelTransitionDuration) {
        // Fade out phase
        const fadeOutElapsed = elapsed - (fadeInDuration + displayDuration);
        alpha = 1 - (fadeOutElapsed / fadeOutDuration);
        textAlpha = 1 - (fadeOutElapsed / fadeOutDuration);
    } else {
        // Transition complete
        isLevelTransition = false;
        return;
    }
    
    // Ensure alpha values are within bounds
    alpha = Math.max(0, Math.min(1, alpha));
    textAlpha = Math.max(0, Math.min(1, textAlpha));
    
    // Draw semi-transparent dark background
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.7})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw level up text with glow effect
    if (textAlpha > 0) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Outer glow
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 20 * textAlpha;
        ctx.fillStyle = `rgba(0, 255, 136, ${textAlpha * 0.3})`;
        ctx.font = 'bold 52px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`LEVEL ${newLevelNumber}`, centerX, centerY - 30);
        
        // Reset shadow for main text
        ctx.shadowBlur = 0;
        
        // Main level text
        ctx.fillStyle = `rgba(255, 255, 255, ${textAlpha})`;
        ctx.font = 'bold 48px Arial';
        ctx.fillText(`LEVEL ${newLevelNumber}`, centerX, centerY - 30);
        
        // Subtitle with animation
        const subtitleScale = 0.8 + 0.2 * Math.sin(elapsed / 150);
        ctx.save();
        ctx.translate(centerX, centerY + 30);
        ctx.scale(subtitleScale, subtitleScale);
        
        // Subtitle glow
        ctx.shadowColor = '#ffaa00';
        ctx.shadowBlur = 15 * textAlpha;
        ctx.fillStyle = `rgba(255, 170, 0, ${textAlpha * 0.4})`;
        ctx.font = 'bold 26px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GET READY!', 0, 0);
        
        // Reset shadow
        ctx.shadowBlur = 0;
        
        // Main subtitle
        ctx.fillStyle = `rgba(255, 215, 0, ${textAlpha})`;
        ctx.font = 'bold 24px Arial';
        ctx.fillText('GET READY!', 0, 0);
        
        ctx.restore();
        
        // Add some particle effects
        if (textAlpha > 0.5) {
            for (let i = 0; i < 8; i++) {
                const angle = (elapsed / 100 + i * Math.PI / 4) % (Math.PI * 2);
                const radius = 80 + Math.sin(elapsed / 200 + i) * 20;
                const particleX = centerX + Math.cos(angle) * radius;
                const particleY = centerY + Math.sin(angle) * radius;
                
                ctx.fillStyle = `rgba(255, 255, 136, ${textAlpha * 0.6})`;
                ctx.beginPath();
                ctx.arc(particleX, particleY, 3, 0, Math.PI * 2);
                ctx.fill();
                
                // Smaller trailing particles
                const trailX = centerX + Math.cos(angle - 0.5) * (radius - 10);
                const trailY = centerY + Math.sin(angle - 0.5) * (radius - 10);
                ctx.fillStyle = `rgba(255, 255, 136, ${textAlpha * 0.3})`;
                ctx.beginPath();
                ctx.arc(trailX, trailY, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Progress bar for remaining time
        if (elapsed > fadeInDuration && elapsed < fadeInDuration + displayDuration) {
            const progressWidth = 200;
            const progressHeight = 6;
            const progressX = centerX - progressWidth / 2;
            const progressY = centerY + 80;
            const progress = (elapsed - fadeInDuration) / displayDuration;
            
            // Progress bar background
            ctx.fillStyle = `rgba(255, 255, 255, ${textAlpha * 0.3})`;
            ctx.fillRect(progressX, progressY, progressWidth, progressHeight);
            
            // Progress bar fill
            ctx.fillStyle = `rgba(0, 255, 136, ${textAlpha})`;
            ctx.fillRect(progressX, progressY, progressWidth * progress, progressHeight);
        }
    }
}

// ...existing code...
// ...draw splash screen...
function drawSplash() {
    // Update menu animation time
    menuAnimationTime += 16;
    
    // Draw background
    drawBackground();
    
    // Add animated particles in background
    for (let i = 0; i < 5; i++) {
        const time = menuAnimationTime + i * 1000;
        const x = (Math.sin(time / 2000) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(time / 1500) * 0.5 + 0.5) * canvas.height;
        const alpha = (Math.sin(time / 800) * 0.5 + 0.5) * 0.3;
        
        ctx.fillStyle = `rgba(255, 255, 100, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Draw 3D animated title
    draw3DText('SPIDER HUNT', canvas.width / 2, canvas.height / 2 - 100, 48, 'title');
    
    // Draw 3D instruction text
    draw3DText('Press ENTER to Start', canvas.width / 2, canvas.height / 2 - 20, 24, 'instruction');
    
    // Draw 3D control instructions
    draw3DText('Arrow Keys: Move', canvas.width / 2, canvas.height / 2 + 20, 18, 'control');
    draw3DText('Up Arrow: Jump', canvas.width / 2, canvas.height / 2 + 45, 18, 'control');
    draw3DText('Ctrl: Shoot', canvas.width / 2, canvas.height / 2 + 70, 18, 'control');
    draw3DText('P: Pause', canvas.width / 2, canvas.height / 2 + 95, 18, 'control');
    draw3DText('M: Toggle Music', canvas.width / 2, canvas.height / 2 + 120, 18, 'control');
    
    if (isMobile) {
        draw3DText('Touch controls available on mobile', canvas.width / 2, canvas.height / 2 + 155, 18, 'control');
    }
    
    // Add some sparkle effects
    for (let i = 0; i < 3; i++) {
        const sparkleTime = menuAnimationTime + i * 500;
        const sparkleX = canvas.width / 2 + Math.sin(sparkleTime / 300) * 200;
        const sparkleY = canvas.height / 2 - 100 + Math.cos(sparkleTime / 400) * 50;
        const sparkleAlpha = Math.sin(sparkleTime / 200) * 0.5 + 0.5;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${sparkleAlpha})`;
        ctx.beginPath();
        ctx.arc(sparkleX, sparkleY, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ...draw score with shadow...
function drawScore() {
    // Update menu animation for 3D effects
    menuAnimationTime += 16;
    
    // Draw score with 3D metallic effect
    ctx.textAlign = 'left';
    draw3DText('Score: ' + score, 120, 30, 24, 'score');
    
    // Draw level with 3D effect  
    draw3DText('Level: ' + currentLevel, 120, 60, 24, 'score');
    
    // Draw lives with heart symbols
    ctx.fillStyle = '#f00';
    ctx.font = '20px Arial';
    for (let i = 0; i < lives; i++) {
        // Add subtle 3D effect to hearts
        ctx.fillStyle = '#800';
        ctx.fillText('♥', 21 + i * 25, 91);
        ctx.fillStyle = '#f00';
        ctx.fillText('♥', 20 + i * 25, 90);
    }
    
    // Draw level progress bar with enhanced effects
    if (currentLevel <= maxLevel) {
        const requiredScore = scoreToNextLevel * currentLevel;
        const progress = Math.min(100, (levelScore / requiredScore) * 100);
        
        // Progress bar background with depth
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(22, 102, 200, 10);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(20, 100, 200, 10);
        
        // Progress bar fill with gradient
        const progressGradient = ctx.createLinearGradient(20, 100, 220, 110);
        progressGradient.addColorStop(0, '#00ff00');
        progressGradient.addColorStop(0.5, '#88ff88');
        progressGradient.addColorStop(1, '#00aa00');
        ctx.fillStyle = progressGradient;
        ctx.fillRect(20, 100, (200 * progress) / 100, 10);
        
        // Progress highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillRect(20, 100, (200 * progress) / 100, 3);
        
        // Progress text with 3D effect
        draw3DText(`Level Progress: ${Math.floor(progress)}%`, 120, 125, 14, 'control');
    }
}

// ...draw timer...
function drawTimer() {
    const minutes = Math.floor(gameTime / 60);
    const seconds = Math.floor(gameTime % 60);
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Draw timer with 3D metallic effect
    ctx.textAlign = 'right';
    draw3DText('Time: ' + timeString, canvas.width - 100, 30, 24, 'score');
}

// ...draw pause screen...
function drawPauseScreen() {
    // Draw pause indicator in corner instead of overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(canvas.width / 2 - 80, 20, 160, 60);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvas.width / 2, 50);
    
    ctx.fillStyle = '#ff0';
    ctx.fillText('PAUSED', canvas.width / 2 + 2, 52);
}

// ...draw game over screen...
function drawGameOver() {
    // Update menu animation time
    menuAnimationTime += 16;
    
    drawBackground();
    
    // Semi-transparent overlay with animated opacity
    const overlayAlpha = 0.7 + Math.sin(menuAnimationTime / 300) * 0.1;
    ctx.fillStyle = `rgba(0, 0, 0, ${overlayAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add dramatic lightning effects
    if (Math.random() < 0.1) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, 0);
        ctx.lineTo(Math.random() * canvas.width, canvas.height);
        ctx.stroke();
    }
    
    // Game Over text with dramatic 3D effect
    draw3DText('GAME OVER', canvas.width / 2, canvas.height / 2 - 60, 48, 'gameOver');
    
    // Final score with metallic effect
    draw3DText('Final Score: ' + score, canvas.width / 2, canvas.height / 2 - 10, 32, 'score');
    draw3DText('Level Reached: ' + currentLevel, canvas.width / 2, canvas.height / 2 + 30, 32, 'score');
    
    // Final time
    const minutes = Math.floor(gameTime / 60);
    const seconds = Math.floor(gameTime % 60);
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    draw3DText('Time: ' + timeString, canvas.width / 2, canvas.height / 2 + 70, 32, 'score');
    
    // Restart instruction with pulsing effect
    draw3DText('Press R to Restart', canvas.width / 2, canvas.height / 2 + 110, 24, 'instruction');
    
    if (isMobile) {
        draw3DText('Mobile: Tap screen to restart', canvas.width / 2, canvas.height / 2 + 140, 18, 'control');
    }
    
    // Add floating embers effect
    for (let i = 0; i < 8; i++) {
        const emberTime = menuAnimationTime + i * 200;
        const emberX = Math.sin(emberTime / 1000) * canvas.width * 0.3 + canvas.width / 2;
        const emberY = (emberTime / 20) % canvas.height;
        const emberSize = Math.abs(Math.sin(emberTime / 300)) * 2 + 1; // Ensure positive radius
        const emberAlpha = Math.sin(emberTime / 400) * 0.5 + 0.3;
        
        ctx.fillStyle = `rgba(255, 100, 0, ${emberAlpha})`;
        ctx.beginPath();
        ctx.arc(emberX, emberY, emberSize, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ...existing code...
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
    
    drawLevelTransition(); // Draw level transition overlay
}

// ...main update...
function update() {
    if (showSplash || gameOver) {
        draw();
        requestAnimationFrame(update);
        return;
    }
    
    if (!gameRunning || gamePaused || isLevelTransition) {
        draw();
        requestAnimationFrame(update);
        return;
    }
    
    // Update game timer (excluding pause time)
    gameTime = (Date.now() - gameStartTime - totalPauseTime) / 1000;
    
    movePlayer();
    moveBullets();
    moveSpiderBullets();
    moveSpiders();
    moveGroundSpiders();
    spawnSpider();
    autoHorizontalShoot(); // Auto horizontal shooting
    checkCollisions();
    updateParticles();
    draw();
    requestAnimationFrame(update);
}

// Button handlers removed - now using keyboard controls only

// ...keyboard controls...
document.addEventListener('keydown', e => {
    if (showSplash) {
        if (e.code === 'Enter') {
            // Play enter sound effect
            if (enterSound) {
                enterSound.currentTime = 0;
                enterSound.play().catch(e => console.log('Enter sound failed to play:', e));
            }
            
            showSplash = false;
            gameRunning = true;
            gamePaused = false;
            gameStartTime = Date.now();
            updateDifficulty(); // Set initial difficulty
            
            // Start background music
            if (backgroundMusic) {
                backgroundMusic.currentTime = 0;
                backgroundMusic.volume = 0.3; // Lower volume for background music
                backgroundMusic.play().catch(e => console.log('Background music autoplay prevented'));
            }
        }
        return;
    }
    
    if (gameOver) {
        if (e.code === 'KeyR') {
            // Play enter sound for restart
            if (enterSound) {
                enterSound.currentTime = 0;
                enterSound.play().catch(e => console.log('Enter sound failed to play:', e));
            }
            
            // Reset all game variables
            score = 0;
            gameTime = 0;
            gameStartTime = 0;
            totalPauseTime = 0;
            pauseStartTime = 0;
            currentLevel = 1;
            lives = 3;
            levelScore = 0;
            spiders = [];
            groundSpiders = [];
            bullets = [];
            spiderBullets = [];
            horizontalBullets = [];
            particles = [];
            
            // Reset game states
            gameOver = false;
            showSplash = true;
            gameRunning = false;
            gamePaused = false;
            isLevelTransition = false;
            
            // Reset player position and physics
            playerX = canvas.width / 2 - PLAYER_WIDTH / 2;
            playerY = GROUND_Y;
            playerVelocityY = 0;
            isJumping = false;
            
            // Reset input states
            leftPressed = false;
            rightPressed = false;
            upPressed = false;
            shootPressed = false;
            
            // Reset difficulty to level 1
            SPIDER_SPEED = BASE_SPIDER_SPEED;
            BULLET_SPEED = BASE_BULLET_SPEED;
            updateDifficulty();
            
            // Stop game over sound and reset music
            if (gameOverSound) {
                gameOverSound.pause();
                gameOverSound.currentTime = 0;
            }
            if (backgroundMusic) {
                backgroundMusic.pause();
                backgroundMusic.currentTime = 0;
            }
            
            console.log('Game restarted successfully - returning to splash screen');
        }
        return;
    }
    
    if (e.code === 'ArrowLeft') leftPressed = true;
    if (e.code === 'ArrowRight') rightPressed = true;
    if (e.code === 'ArrowUp') upPressed = true;
    if (e.code === 'ControlLeft' || e.code === 'ControlRight') shootPressed = true;
    if (e.code === 'KeyP') {
        gamePaused = !gamePaused;
        
        if (gamePaused) {
            pauseStartTime = Date.now();
            if (backgroundMusic && !backgroundMusic.paused) backgroundMusic.pause();
        } else {
            if (pauseStartTime > 0) {
                totalPauseTime += Date.now() - pauseStartTime;
                pauseStartTime = 0;
            }
            if (backgroundMusic && backgroundMusic.paused) backgroundMusic.play().catch(e => console.log('Music play failed'));
        }
    }
    if (e.code === 'KeyM') {
        // Toggle music
        if (backgroundMusic) {
            if (backgroundMusic.paused) {
                backgroundMusic.play().catch(e => console.log('Music play failed'));
            } else {
                backgroundMusic.pause();
            }
        }
    }
});
document.addEventListener('keyup', e => {
    if (showSplash) return;
    
    if (e.code === 'ArrowLeft') leftPressed = false;
    if (e.code === 'ArrowRight') rightPressed = false;
    if (e.code === 'ArrowUp') upPressed = false;
    if (e.code === 'ControlLeft' || e.code === 'ControlRight') shootPressed = false;
});

// ...shooting...
setInterval(() => {
    if (shootPressed && gameRunning && !gamePaused && !showSplash) {
        bullets.push({ x: playerX + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2, y: playerY });
        if (shootSound) shootSound.currentTime = 0, shootSound.play();
    }
}, 200); // shooting rate

// Mobile Touch Controls
if (isMobile) {
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const shootBtn = document.getElementById('shootBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    
    // Touch events for movement
    leftBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        leftPressed = true;
    });
    
    leftBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        leftPressed = false;
    });
    
    rightBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        rightPressed = true;
    });
    
    rightBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        rightPressed = false;
    });
    
    // Touch events for shooting
    shootBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        shootPressed = true;
    });
    
    shootBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        shootPressed = false;
    });
    
    // Touch events for pause
    pauseBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameRunning) {
            gamePaused = !gamePaused;
            
            if (gamePaused) {
                pauseStartTime = Date.now();
                if (backgroundMusic && !backgroundMusic.paused) backgroundMusic.pause();
            } else {
                if (pauseStartTime > 0) {
                    totalPauseTime += Date.now() - pauseStartTime;
                    pauseStartTime = 0;
                }
                if (backgroundMusic && backgroundMusic.paused) backgroundMusic.play().catch(e => console.log('Music play failed'));
            }
        }
    });
    
    // Prevent default touch behaviors
    document.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
    
    document.addEventListener('touchstart', (e) => {
        if (e.target === canvas) {
            e.preventDefault();
        }
    }, { passive: false });
}

// Canvas touch controls for splash screen and game over
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    
    if (showSplash) {
        // Simulate Enter key press for mobile
        const enterEvent = new KeyboardEvent('keydown', { code: 'Enter' });
        document.dispatchEvent(enterEvent);
    } else if (gameOver) {
        // Simulate R key press for mobile
        const rEvent = new KeyboardEvent('keydown', { code: 'KeyR' });
        document.dispatchEvent(rEvent);
    }
});

// Start the game loop
update();
