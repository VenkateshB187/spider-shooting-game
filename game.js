// ...game constants...
// Game constants
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Information bar at the top
const INFO_BAR_HEIGHT = 40;

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
let diagonalBullets = []; // For diagonal shooting (W and S keys)

let playerX = canvas.width / 2 - PLAYER_WIDTH / 2;
let playerY = PLAYER_Y; // Add playerY variable for jumping
let playerVelocityY = 0; // Vertical velocity for jumping
let isJumping = false; // Jump state
let upPressed = false; // Up arrow key state

// Death animation variables - now for blinking effect
let isPlayerDying = false;
let deathAnimationStartTime = 0;
let blinkCount = 0;
let lastBlinkTime = 0;
const BLINK_DURATION = 150; // How long each blink lasts
const TOTAL_BLINKS = 8; // Number of times to blink
const DEATH_ANIMATION_DURATION = TOTAL_BLINKS * BLINK_DURATION * 2; // Total time for blinking
const JUMP_POWER = -12; // Jump strength (negative for upward)
const GRAVITY = 0.6; // Gravity strength
const GROUND_Y = PLAYER_Y; // Ground level
let leftPressed = false;
let rightPressed = false;
let shootPressed = false;
let shootLeftUpPressed = false; // W key for left up shooting
let shootLeftDownPressed = false; // S key for left down shooting
let shootLeftPressed = false; // A key for horizontal left shooting
let shootRightPressed = false; // D key for horizontal right shooting
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

// Spider count per level - Reduced for better accessibility for kids and older players
const spidersPerLevel = [5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30]; // Extended for higher levels
let spidersSpawnedThisLevel = 0;
let spidersDefeatedThisLevel = 0;

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
const pauseSound = document.getElementById('pauseSound');
const resumeSound = document.getElementById('resumeSound');
const footstepSound = document.getElementById('footstepSound');
const blastSound = document.getElementById('blastSound');

// Set default volumes for better audio experience
if (shootSound) shootSound.volume = 0.6;
if (breakSound) breakSound.volume = 0.7;
if (gameOverSound) gameOverSound.volume = 0.8;
if (loseLifeSound) loseLifeSound.volume = 0.8;
if (jumpSound) jumpSound.volume = 0.5;
if (enterSound) enterSound.volume = 0.7;
if (pauseSound) pauseSound.volume = 0.7;
if (resumeSound) resumeSound.volume = 0.7;
if (footstepSound) footstepSound.volume = 0.3; // Quiet footsteps
if (blastSound) blastSound.volume = 0.8;

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

// Player visual settings for procedural animation
const PLAYER_COLORS = {
    head: '#FFD1A9',      // Skin tone
    body: '#4169E1',      // Blue shirt
    legs: '#2F4F4F',      // Dark pants
    shoes: '#8B4513',     // Brown shoes
    hair: '#8B4513',      // Brown hair
    outline: '#000000',   // Black outline
    gun: '#2F2F2F',       // Dark gun metal
    gunBarrel: '#1A1A1A'  // Gun barrel
};

// Advanced animation settings
const ANIMATION_SETTINGS = {
    runCycleDuration: 320,    // Complete run cycle in ms
    bobIntensity: 3,          // Vertical bob amount
    armSwingAngle: 25,        // Arm swing in degrees
    legSwingAngle: 35,        // Leg swing in degrees
    headBobAmount: 1.5,       // Head movement during run
    jumpSquash: 0.8,          // Squash factor when landing
    shootRecoil: 2            // Recoil distance when shooting
};

// Power-up system
const POWER_UPS = {
    MACHINE_GUN: { 
        name: 'Machine Gun', 
        color: '#FF6B35', 
        duration: 10000, // 10 seconds
        fireRate: 50     // ms between shots
    },
    BLAST_POWER: { 
        name: 'Blast Power', 
        color: '#FF1744', 
        duration: 8000,  // 8 seconds
        explosionRadius: 10  // 10-pixel radius as requested
    },
    FREEZE_TIME: { 
        name: 'Freeze Time', 
        color: '#00E5FF', 
        duration: 5000   // 5 seconds
    },
    MULTI_SHOT: { 
        name: 'Multi-Shot', 
        color: '#FFD600', 
        duration: 12000, // 12 seconds
        shots: 3         // 3 bullets per shot
    }
};

// Power-up state
let activePowerUps = [];
let powerUpSpawns = [];
let lastPowerUpSpawn = 0;
let machineGunTimer = 0;
let lastHorizontalShot = 0; // Add cooldown for horizontal shooting

// Animation time variable for menu effects
let menuAnimationTime = 0;

// Player animation variables for realistic running effect
let playerAnimationTime = 0;
let isPlayerMoving = false;
let playerDirection = 0; // -1 for left, 1 for right, 0 for stationary
let lastPlayerX = 0;
let footstepTimer = 0;

// Function to draw information bar at the top
function drawInfoBar() {
    if (showSplash || gameOver) return; // Don't show info bar on splash or game over screens
    
    // Draw black background bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, INFO_BAR_HEIGHT);
    
    // Add border at bottom of info bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(0, INFO_BAR_HEIGHT - 1, canvas.width, 1);
    
    // Set up text properties
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    const centerY = INFO_BAR_HEIGHT / 2;
    const leftMargin = 10;
    let currentX = leftMargin;
    
    // Level information with icon
    ctx.fillStyle = '#00ff88';
    ctx.fillText('📊', currentX, centerY);
    currentX += 25;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Level ${currentLevel}`, currentX, centerY);
    currentX += 80;
    
    // Spider progress with icon
    const maxSpiders = spidersPerLevel[Math.min(currentLevel - 1, spidersPerLevel.length - 1)];
    ctx.fillStyle = '#ff6600';
    ctx.fillText('🕷️', currentX, centerY);
    currentX += 25;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${spidersDefeatedThisLevel}/${maxSpiders}`, currentX, centerY);
    currentX += 80;
    
    // Lives with heart icons
    ctx.fillStyle = '#ff0000';
    ctx.fillText('❤️', currentX, centerY);
    currentX += 25;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`x${lives}`, currentX, centerY);
    currentX += 50;
    
    // Score with icon
    ctx.fillStyle = '#ffff00';
    ctx.fillText('⭐', currentX, centerY);
    currentX += 25;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${score}`, currentX, centerY);
    
    // Right side - Timer
    ctx.textAlign = 'right';
    const minutes = Math.floor(gameTime / 60);
    const seconds = Math.floor(gameTime % 60);
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    ctx.fillStyle = '#00ccff';
    ctx.fillText('⏱️', canvas.width - 60, centerY);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(timeString, canvas.width - 10, centerY);
    
    // Pause indicator if game is paused
    if (gamePaused) {
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('⏸️ PAUSED', canvas.width / 2, centerY);
    }
}

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
    // Update player animation only if not paused
    if (!gamePaused) {
        playerAnimationTime += 16; // Assuming 60fps
    }
    
    // Check if player is moving
    const wasMoving = isPlayerMoving;
    isPlayerMoving = (leftPressed || rightPressed) && !isJumping;
    
    // Determine direction
    if (leftPressed && !rightPressed) {
        playerDirection = -1;
    } else if (rightPressed && !leftPressed) {
        playerDirection = 1;
    } else if (!isPlayerMoving) {
        playerDirection = 0;
    }
    
    // Footstep particles
    if (isPlayerMoving && !isJumping) {
        footstepTimer += 16;
        if (footstepTimer > 200) { // Every 200ms
            spawnFootstepParticles();
            footstepTimer = 0;
        }
    }
    
    // Use enhanced procedural animation like spider animation
    drawAnimatedPlayerFallback();
}

// Enhanced procedural character drawing function like spider animation
function drawAnimatedPlayerFallback() {
    const time = playerAnimationTime;
    
    // Death blinking effect handling
    if (isPlayerDying) {
        const elapsedTime = Date.now() - deathAnimationStartTime;
        const blinkPhase = Math.floor(elapsedTime / BLINK_DURATION) % 2;
        
        // Don't draw player during blink-off phases
        if (blinkPhase === 1) {
            return; // Skip drawing to create blink effect
        }
        
        // Continue with normal player drawing during blink-on phases
    }
    
    // Calculate animation cycles
    const runCycle = (time % ANIMATION_SETTINGS.runCycleDuration) / ANIMATION_SETTINGS.runCycleDuration;
    const runPhase = runCycle * Math.PI * 2;
    
    // Base position with effects
    let baseX = playerX + PLAYER_WIDTH / 2;
    let baseY = playerY - PLAYER_HEIGHT;
    
    // Running bob effect
    let bobOffset = 0;
    if (isPlayerMoving && !isJumping) {
        bobOffset = Math.sin(runPhase * 2) * ANIMATION_SETTINGS.bobIntensity;
    }
    
    // Jump squash effect
    let scaleY = 1;
    if (isJumping) {
        if (playerVelocityY > 5) {
            scaleY = ANIMATION_SETTINGS.jumpSquash; // Squash on landing
        } else if (playerVelocityY < -3) {
            scaleY = 1.1; // Stretch when jumping up
        }
    }
    
    // Shooting recoil
    let recoilOffset = 0;
    if (shootPressed) {
        recoilOffset = ANIMATION_SETTINGS.shootRecoil;
    }
    
    ctx.save();
    
    // Apply global transformations
    ctx.translate(baseX, baseY + bobOffset);
    ctx.scale(playerDirection === -1 ? -1 : 1, scaleY);
    
    // Character proportions (relative to PLAYER_WIDTH/HEIGHT)
    const headSize = PLAYER_WIDTH * 0.3;
    const bodyWidth = PLAYER_WIDTH * 0.4;
    const bodyHeight = PLAYER_HEIGHT * 0.6;
    const armLength = PLAYER_HEIGHT * 0.4;
    const legLength = PLAYER_HEIGHT * 0.5;
    
    // Head position with slight bob during running
    let headBob = 0;
    if (isPlayerMoving && !isJumping) {
        headBob = Math.sin(runPhase * 2) * ANIMATION_SETTINGS.headBobAmount;
    }
    
    // Draw head
    ctx.fillStyle = PLAYER_COLORS.head;
    ctx.strokeStyle = PLAYER_COLORS.outline;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -PLAYER_HEIGHT * 0.8 + headBob, headSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Draw hair
    ctx.fillStyle = PLAYER_COLORS.hair;
    ctx.beginPath();
    ctx.arc(0, -PLAYER_HEIGHT * 0.85 + headBob, headSize * 0.9, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Draw eyes
    ctx.fillStyle = PLAYER_COLORS.outline;
    ctx.beginPath();
    ctx.arc(-headSize * 0.3, -PLAYER_HEIGHT * 0.8 + headBob, 2, 0, Math.PI * 2);
    ctx.arc(headSize * 0.3, -PLAYER_HEIGHT * 0.8 + headBob, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw body
    ctx.fillStyle = PLAYER_COLORS.body;
    ctx.strokeStyle = PLAYER_COLORS.outline;
    ctx.fillRect(-bodyWidth/2, -PLAYER_HEIGHT * 0.6, bodyWidth, bodyHeight);
    ctx.strokeRect(-bodyWidth/2, -PLAYER_HEIGHT * 0.6, bodyWidth, bodyHeight);
    
    // Calculate arm positions and angles
    let leftArmAngle = 0;
    let rightArmAngle = 0;
    
    if (isPlayerMoving && !isJumping) {
        // Running arm swing - opposite to legs
        leftArmAngle = Math.sin(runPhase) * (ANIMATION_SETTINGS.armSwingAngle * Math.PI / 180);
        rightArmAngle = -leftArmAngle;
    } else if (shootPressed) {
        // Shooting pose - one arm extended
        rightArmAngle = -Math.PI / 4; // Extended arm
        leftArmAngle = Math.PI / 6;   // Support arm
    }
    
    // Draw arms
    const armStartY = -PLAYER_HEIGHT * 0.5;
    
    // Left arm
    ctx.save();
    ctx.translate(-bodyWidth/2, armStartY);
    ctx.rotate(leftArmAngle);
    ctx.fillStyle = PLAYER_COLORS.head; // Skin color for arms
    ctx.fillRect(-8, 0, 16, armLength);
    ctx.strokeRect(-8, 0, 16, armLength);
    ctx.restore();
    
    // Right arm (with recoil offset if shooting)
    ctx.save();
    ctx.translate(bodyWidth/2 - recoilOffset, armStartY);
    ctx.rotate(rightArmAngle);
    ctx.fillStyle = PLAYER_COLORS.head;
    ctx.fillRect(-8, 0, 16, armLength);
    ctx.strokeRect(-8, 0, 16, armLength);
    
    // Draw gun in right hand - positioned to point upward
    ctx.save();
    ctx.translate(0, armLength - 5); // Position at hand
    ctx.rotate(-Math.PI / 2); // Rotate gun to point upward
    
    // Gun body
    ctx.fillStyle = PLAYER_COLORS.gun;
    ctx.fillRect(-6, -3, 16, 6);
    ctx.strokeRect(-6, -3, 16, 6);
    
    // Gun barrel (nozzle)
    ctx.fillStyle = PLAYER_COLORS.gunBarrel;
    ctx.fillRect(10, -1, 10, 2);
    ctx.strokeRect(10, -1, 10, 2);
    
    // Gun handle
    ctx.fillRect(-6, 0, 4, 8);
    ctx.strokeRect(-6, 0, 4, 8);
    
    // Muzzle flash when shooting - at the nozzle end
    if (shootPressed) {
        ctx.fillStyle = '#FFFF00';
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 1;
        const flashSize = 3 + Math.random() * 2;
        ctx.beginPath();
        ctx.arc(20, 0, flashSize, 0, Math.PI * 2); // At nozzle end
        ctx.fill();
        ctx.stroke();
        
        // Add some spark particles at nozzle
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = '#FFAA00';
            ctx.beginPath();
            const sparkX = 20 + Math.random() * 8;
            const sparkY = (Math.random() - 0.5) * 4;
            ctx.arc(sparkX, sparkY, 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    ctx.restore();
    ctx.restore();
    
    // Calculate leg positions and angles
    let leftLegAngle = 0;
    let rightLegAngle = 0;
    
    if (isPlayerMoving && !isJumping) {
        // Running leg movement
        leftLegAngle = Math.sin(runPhase) * (ANIMATION_SETTINGS.legSwingAngle * Math.PI / 180);
        rightLegAngle = -leftLegAngle;
    } else if (isJumping) {
        // Jumping pose - legs slightly bent
        leftLegAngle = Math.PI / 12;
        rightLegAngle = Math.PI / 12;
    }
    
    // Draw legs
    const legStartY = -PLAYER_HEIGHT * 0.05;
    
    // Left leg
    ctx.save();
    ctx.translate(-bodyWidth/4, legStartY);
    ctx.rotate(leftLegAngle);
    ctx.fillStyle = PLAYER_COLORS.legs;
    ctx.fillRect(-10, 0, 20, legLength);
    ctx.strokeRect(-10, 0, 20, legLength);
    
    // Left shoe
    ctx.fillStyle = PLAYER_COLORS.shoes;
    ctx.fillRect(-12, legLength - 5, 24, 8);
    ctx.strokeRect(-12, legLength - 5, 24, 8);
    ctx.restore();
    
    // Right leg
    ctx.save();
    ctx.translate(bodyWidth/4, legStartY);
    ctx.rotate(rightLegAngle);
    ctx.fillStyle = PLAYER_COLORS.legs;
    ctx.fillRect(-10, 0, 20, legLength);
    ctx.strokeRect(-10, 0, 20, legLength);
    
    // Right shoe
    ctx.fillStyle = PLAYER_COLORS.shoes;
    ctx.fillRect(-12, legLength - 5, 24, 8);
    ctx.strokeRect(-12, legLength - 5, 24, 8);
    ctx.restore();
    
    ctx.restore();
}

// Function to spawn footstep particles
function spawnFootstepParticles() {
    if (!isPlayerMoving || isJumping) return;
    
    const footX = playerX + PLAYER_WIDTH / 2 + (Math.random() - 0.5) * PLAYER_WIDTH;
    const footY = playerY + PLAYER_HEIGHT;
    
    // Play footstep sound (quietly and briefly)
    if (footstepSound && gameRunning && !gamePaused) {
        footstepSound.currentTime = 0;
        footstepSound.volume = 0.1; // Very quiet
        footstepSound.play().catch(e => {});
    }
    
    // Create small dust particles
    for (let i = 0; i < 3; i++) {
        particles.push({
            x: footX + (Math.random() - 0.5) * 10,
            y: footY + Math.random() * 5,
            vx: (Math.random() - 0.5) * 2,
            vy: -Math.random() * 1.5 - 0.5,
            alpha: 0.6,
            size: Math.random() * 2 + 1,
            color: '#D2B48C', // Dust color
            gravity: 0.05
        });
    }
}

// Power-up management functions
function spawnPowerUp() {
    if (gamePaused) return; // Stop spawning when paused
    
    const now = Date.now();
    if (now - lastPowerUpSpawn < 15000) return; // Spawn every 15 seconds minimum
    
    const powerUpTypes = Object.keys(POWER_UPS);
    const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    
    // Spawn in more accessible locations
    const spawnX = 100 + Math.random() * (canvas.width - 200); // Away from edges
    const spawnY = 200 + Math.random() * (canvas.height - 350); // Mid-screen area
    
    powerUpSpawns.push({
        type: randomType,
        x: spawnX,
        y: spawnY,
        bobTime: 0,
        collected: false,
        spawnTime: now,
        lifetime: 10000 // Power-up disappears after 10 seconds
    });
    
    lastPowerUpSpawn = now;
}

function updatePowerUps() {
    const now = Date.now();
    
    // Update active power-ups
    activePowerUps = activePowerUps.filter(powerUp => {
        powerUp.duration -= 16;
        return powerUp.duration > 0;
    });
    
    // Update power-up spawns (bobbing animation and lifetime)
    powerUpSpawns = powerUpSpawns.filter(spawn => {
        spawn.bobTime += 16;
        
        // Remove if expired (after 10 seconds)
        if (now - spawn.spawnTime > spawn.lifetime) {
            return false;
        }
        
        return !spawn.collected;
    });
    
    // Machine gun auto-fire
    if (hasPowerUp('MACHINE_GUN') && shootPressed) {
        machineGunTimer += 16;
        if (machineGunTimer >= POWER_UPS.MACHINE_GUN.fireRate) {
            shoot();
            machineGunTimer = 0;
        }
    }
}

function collectPowerUp(type) {
    // Remove existing power-up of same type
    activePowerUps = activePowerUps.filter(powerUp => powerUp.type !== type);
    
    // Add new power-up
    activePowerUps.push({
        type: type,
        duration: POWER_UPS[type].duration
    });
    
    // Play collection sound with higher volume for better feedback
    const powerUpSound = document.getElementById('powerUpSound');
    if (powerUpSound) {
        powerUpSound.currentTime = 0;
        powerUpSound.volume = 0.8; // Increased volume for better feedback
        powerUpSound.play().catch(e => {});
    }
    
    // Add score bonus for collecting power-up
    score += 50;
}

function hasPowerUp(type) {
    return activePowerUps.some(powerUp => powerUp.type === type);
}

function drawPowerUps() {
    // Draw power-up spawns
    powerUpSpawns.forEach(spawn => {
        const now = Date.now();
        const timeRemaining = spawn.lifetime - (now - spawn.spawnTime);
        const bobOffset = Math.sin(spawn.bobTime / 200) * 5;
        const pulseScale = 1 + Math.sin(spawn.bobTime / 150) * 0.2; // Pulsing effect
        const powerUp = POWER_UPS[spawn.type];
        
        // Flash red when about to expire (last 3 seconds)
        const isExpiring = timeRemaining < 3000;
        const flashAlpha = isExpiring ? (Math.sin(spawn.bobTime / 100) * 0.5 + 0.5) : 1;
        
        ctx.save();
        ctx.translate(spawn.x, spawn.y + bobOffset);
        ctx.scale(pulseScale, pulseScale);
        ctx.globalAlpha = flashAlpha;
        
        // Enhanced glowing effect
        ctx.shadowColor = isExpiring ? '#FF0000' : powerUp.color;
        ctx.shadowBlur = 15;
        
        // Draw targeting circle (visual indicator for shooting)
        ctx.strokeStyle = isExpiring ? '#FF0000' : powerUp.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = flashAlpha;
        
        // Power-up icon
        ctx.fillStyle = isExpiring ? '#FF4444' : powerUp.color;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        
        if (spawn.type === 'MACHINE_GUN') {
            // Draw machine gun icon
            ctx.fillRect(-12, -8, 24, 16);
            ctx.strokeRect(-12, -8, 24, 16);
            ctx.fillRect(12, -3, 10, 6);
            ctx.strokeRect(12, -3, 10, 6);
        } else if (spawn.type === 'BLAST_POWER') {
            // Draw explosion icon
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const radius = i % 2 === 0 ? 14 : 7;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else if (spawn.type === 'FREEZE_TIME') {
            // Draw freeze icon
            ctx.beginPath();
            ctx.arc(0, 0, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(-2, -10, 4, 20);
            ctx.fillRect(-10, -2, 20, 4);
        } else if (spawn.type === 'MULTI_SHOT') {
            // Draw multi-shot icon
            for (let i = 0; i < 3; i++) {
                ctx.fillRect(-10 + i * 7, -12 + i * 4, 5, 14);
                ctx.strokeRect(-10 + i * 7, -12 + i * 4, 5, 14);
            }
        }
        
        ctx.restore();
        
        // Draw label with better visibility
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.globalAlpha = flashAlpha;
        ctx.strokeText(powerUp.name, spawn.x, spawn.y + 35);
        ctx.fillText(powerUp.name, spawn.x, spawn.y + 35);
        
        // Draw "SHOOT ME!" instruction
        ctx.fillStyle = isExpiring ? '#FF0000' : '#FFFF00';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.font = 'bold 12px Arial';
        const shootPulse = Math.sin(spawn.bobTime / 100) * 0.5 + 0.5;
        ctx.globalAlpha = 0.7 + shootPulse * 0.3;
        const instructionText = isExpiring ? 'HURRY!' : 'SHOOT ME!';
        ctx.strokeText(instructionText, spawn.x, spawn.y + 50);
        ctx.fillText(instructionText, spawn.x, spawn.y + 50);
        
        // Draw timer
        const seconds = Math.ceil(timeRemaining / 1000);
        ctx.fillStyle = isExpiring ? '#FF0000' : '#FFFFFF';
        ctx.font = 'bold 10px Arial';
        ctx.globalAlpha = 1;
        ctx.fillText(`${seconds}s`, spawn.x, spawn.y + 65);
        
        ctx.globalAlpha = 1;
    });
}

function drawPowerUpUI() {
    // Draw active power-ups in UI
    let yOffset = 120;
    activePowerUps.forEach(powerUp => {
        const info = POWER_UPS[powerUp.type];
        const timeLeft = Math.ceil(powerUp.duration / 1000);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, yOffset, 200, 25);
        
        ctx.fillStyle = info.color;
        ctx.fillRect(12, yOffset + 2, (powerUp.duration / info.duration) * 196, 21);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`${info.name}: ${timeLeft}s`, 15, yOffset + 17);
        
        yOffset += 30;
    });
}

// ...draw bullets...
function drawBullets() {
    // All bullets use the same white color and rectangular shape
    ctx.fillStyle = '#ffffff';
    
    // Player vertical bullets
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, BULLET_WIDTH, BULLET_HEIGHT);
    });
    
    // Player horizontal bullets
    horizontalBullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, HORIZONTAL_BULLET_WIDTH, HORIZONTAL_BULLET_HEIGHT);
    });
    
    // Player diagonal bullets
    diagonalBullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, HORIZONTAL_BULLET_WIDTH, HORIZONTAL_BULLET_HEIGHT);
    });
    
    // Spider bullets
    spiderBullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, SPIDER_BULLET_WIDTH, SPIDER_BULLET_HEIGHT);
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
    // Update spider animation time only if not paused
    if (!gamePaused) {
        spiderAnimationTime += 16; // Assuming 60fps, so ~16ms per frame
    }
    
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
        
        // Add dust particles under moving spider (only when not paused)
        if (!gamePaused && Math.random() < 0.1) {
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

// ...draw horizontal shooting hint...
function drawHorizontalShootingHint() {
    if (gameRunning && !gamePaused) {
        const hintText = "W/Ctrl: Up, S: Down-Left, A/D: Horizontal";
        const hintX = canvas.width - 200;
        const hintY = 70;
        
        // Pulsing effect
        const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
        
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 0, ${pulse})`;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.lineWidth = 2;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'right';
        
        ctx.strokeText(hintText, hintX, hintY);
        ctx.fillText(hintText, hintX, hintY);
        ctx.restore();
    }
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

// Function to draw information bar at the top
function drawInfoBar() {
    if (showSplash || gameOver) return; // Don't show info bar on splash or game over screens
    
    // Draw black background bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, INFO_BAR_HEIGHT);
    
    // Add border at bottom of info bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(0, INFO_BAR_HEIGHT - 1, canvas.width, 1);
    
    // Set up text properties
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    const centerY = INFO_BAR_HEIGHT / 2;
    const leftMargin = 10;
    let currentX = leftMargin;
    
    // Level information with icon
    ctx.fillStyle = '#00ff88';
    ctx.fillText('📊', currentX, centerY);
    currentX += 25;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Level ${currentLevel}`, currentX, centerY);
    currentX += 80;
    
    // Spider progress with icon
    const maxSpiders = spidersPerLevel[Math.min(currentLevel - 1, spidersPerLevel.length - 1)];
    ctx.fillStyle = '#ff6600';
    ctx.fillText('🕷️', currentX, centerY);
    currentX += 25;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${spidersDefeatedThisLevel}/${maxSpiders}`, currentX, centerY);
    currentX += 80;
    
    // Lives with heart icons
    ctx.fillStyle = '#ff0000';
    ctx.fillText('❤️', currentX, centerY);
    currentX += 25;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`x${lives}`, currentX, centerY);
    currentX += 50;
    
    // Score with icon
    ctx.fillStyle = '#ffff00';
    ctx.fillText('⭐', currentX, centerY);
    currentX += 25;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${score}`, currentX, centerY);
    
    // Right side - Timer
    ctx.textAlign = 'right';
    const minutes = Math.floor(gameTime / 60);
    const seconds = Math.floor(gameTime % 60);
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    ctx.fillStyle = '#00ccff';
    ctx.fillText('⏱️', canvas.width - 60, centerY);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(timeString, canvas.width - 10, centerY);
    
    // Pause indicator if game is paused
    if (gamePaused) {
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('⏸️ PAUSED', canvas.width / 2, centerY);
    }
}

// ...move player...
function movePlayer() {
    if (gamePaused) return; // Stop all player movement when paused
    
    // Handle death blinking effect
    if (isPlayerDying) {
        const elapsedTime = Date.now() - deathAnimationStartTime;
        
        // Update blink timing
        if (elapsedTime - lastBlinkTime > BLINK_DURATION) {
            blinkCount++;
            lastBlinkTime = elapsedTime;
        }
        
        // Player stays in place during blinking (no movement)
        return; // Don't process normal movement during death
    }
    
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
    if (gamePaused) return; // Stop all bullet movement when paused
    
    // Move player vertical bullets
    bullets.forEach(bullet => bullet.y -= BULLET_SPEED);
    
    // Check bullet collision with power-ups
    bullets = bullets.filter(bullet => {
        if (bullet.y + BULLET_HEIGHT < 0) return false;
        
        // Check collision with power-ups
        for (let i = powerUpSpawns.length - 1; i >= 0; i--) {
            const powerUp = powerUpSpawns[i];
            const bobOffset = Math.sin(powerUp.bobTime / 200) * 5;
            const powerUpCenterX = powerUp.x;
            const powerUpCenterY = powerUp.y + bobOffset;
            const bulletCenterX = bullet.x + BULLET_WIDTH / 2;
            const bulletCenterY = bullet.y + BULLET_HEIGHT / 2;
            
            const distance = Math.sqrt(
                Math.pow(bulletCenterX - powerUpCenterX, 2) + 
                Math.pow(bulletCenterY - powerUpCenterY, 2)
            );
            
            // Collision detected
            if (distance < 30) { // Increased detection area for better power-up collection
                collectPowerUp(powerUp.type);
                powerUpSpawns.splice(i, 1);
                
                // Create collection effect particles
                for (let j = 0; j < 12; j++) {
                    const angle = (j / 12) * Math.PI * 2;
                    const speed = 3 + Math.random() * 3;
                    particles.push({
                        x: powerUpCenterX,
                        y: powerUpCenterY,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        alpha: 1,
                        size: 3 + Math.random() * 4,
                        color: POWER_UPS[powerUp.type].color,
                        gravity: 0.02,
                        life: 40
                    });
                }
                
                return false; // Remove the bullet
            }
        }
        
        return true;
    });
    
    // Move player horizontal bullets
    horizontalBullets.forEach(bullet => bullet.x += bullet.direction * HORIZONTAL_BULLET_SPEED);
    
    // Check horizontal bullet collision with power-ups
    horizontalBullets = horizontalBullets.filter(bullet => {
        if (bullet.x < -HORIZONTAL_BULLET_WIDTH || bullet.x > canvas.width + HORIZONTAL_BULLET_WIDTH) {
            return false;
        }
        
        // Check collision with power-ups
        for (let i = powerUpSpawns.length - 1; i >= 0; i--) {
            const powerUp = powerUpSpawns[i];
            const bobOffset = Math.sin(powerUp.bobTime / 200) * 5;
            const powerUpCenterX = powerUp.x;
            const powerUpCenterY = powerUp.y + bobOffset;
            const bulletCenterX = bullet.x + HORIZONTAL_BULLET_WIDTH / 2;
            const bulletCenterY = bullet.y + HORIZONTAL_BULLET_HEIGHT / 2;
            
            const distance = Math.sqrt(
                Math.pow(bulletCenterX - powerUpCenterX, 2) + 
                Math.pow(bulletCenterY - powerUpCenterY, 2)
            );
            
            // Collision detected
            if (distance < 30) { // Slightly larger detection area for horizontal bullets
                collectPowerUp(powerUp.type);
                powerUpSpawns.splice(i, 1);
                
                // Create collection effect particles
                for (let j = 0; j < 12; j++) {
                    const angle = (j / 12) * Math.PI * 2;
                    const speed = 3 + Math.random() * 3;
                    particles.push({
                        x: powerUpCenterX,
                        y: powerUpCenterY,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        alpha: 1,
                        size: 3 + Math.random() * 4,
                        color: POWER_UPS[powerUp.type].color,
                        gravity: 0.02,
                        life: 40
                    });
                }
                
                return false; // Remove the bullet
            }
        }
        
        return true;
    });
    
    // Move diagonal bullets
    diagonalBullets.forEach(bullet => {
        bullet.x += bullet.directionX * HORIZONTAL_BULLET_SPEED;
        bullet.y += bullet.directionY * HORIZONTAL_BULLET_SPEED * 0.7; // Slightly slower vertical movement
    });
    
    // Check diagonal bullet collision with power-ups
    diagonalBullets = diagonalBullets.filter(bullet => {
        if (bullet.x < -HORIZONTAL_BULLET_WIDTH || bullet.x > canvas.width + HORIZONTAL_BULLET_WIDTH ||
            bullet.y < -HORIZONTAL_BULLET_HEIGHT || bullet.y > canvas.height + HORIZONTAL_BULLET_HEIGHT) {
            return false;
        }
        
        // Check collision with power-ups
        for (let i = powerUpSpawns.length - 1; i >= 0; i--) {
            const powerUp = powerUpSpawns[i];
            const bobOffset = Math.sin(powerUp.bobTime / 200) * 5;
            const powerUpCenterX = powerUp.x;
            const powerUpCenterY = powerUp.y + bobOffset;
            const bulletCenterX = bullet.x + HORIZONTAL_BULLET_WIDTH / 2;
            const bulletCenterY = bullet.y + HORIZONTAL_BULLET_HEIGHT / 2;
            
            const distance = Math.sqrt(
                Math.pow(bulletCenterX - powerUpCenterX, 2) + 
                Math.pow(bulletCenterY - powerUpCenterY, 2)
            );
            
            // Collision detected
            if (distance < 30) { // Slightly larger detection area for diagonal bullets
                collectPowerUp(powerUp.type);
                powerUpSpawns.splice(i, 1);
                
                // Create collection effect particles
                for (let j = 0; j < 12; j++) {
                    const angle = (j / 12) * Math.PI * 2;
                    const speed = 3 + Math.random() * 3;
                    particles.push({
                        x: powerUpCenterX,
                        y: powerUpCenterY,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        alpha: 1,
                        size: 3 + Math.random() * 4,
                        color: POWER_UPS[powerUp.type].color,
                        gravity: 0.02,
                        life: 40
                    });
                }
                
                return false; // Remove the bullet
            }
        }
        
        return true;
    });
    
    // Move spider bullets
    spiderBullets.forEach(bullet => bullet.y += SPIDER_BULLET_SPEED);
    spiderBullets = spiderBullets.filter(bullet => bullet.y < canvas.height);
}

// ...update difficulty based on level...
function updateDifficulty() {
    // Very gradual difficulty increase for better accessibility
    if (currentLevel === 1) {
        SPIDER_SPEED = BASE_SPIDER_SPEED;
        BULLET_SPEED = BASE_BULLET_SPEED;
    } else if (currentLevel === 2) {
        SPIDER_SPEED = BASE_SPIDER_SPEED + 0.05; // Very small increase
        BULLET_SPEED = BASE_BULLET_SPEED + 0.1;
    } else if (currentLevel === 3) {
        SPIDER_SPEED = BASE_SPIDER_SPEED + 0.1;
        BULLET_SPEED = BASE_BULLET_SPEED + 0.15;
    } else if (currentLevel === 4) {
        SPIDER_SPEED = BASE_SPIDER_SPEED + 0.15;
        BULLET_SPEED = BASE_BULLET_SPEED + 0.2;
    } else if (currentLevel === 5) {
        SPIDER_SPEED = BASE_SPIDER_SPEED + 0.2;
        BULLET_SPEED = BASE_BULLET_SPEED + 0.25;
    } else if (currentLevel === 6) {
        SPIDER_SPEED = BASE_SPIDER_SPEED + 0.25;
        BULLET_SPEED = BASE_BULLET_SPEED + 0.3;
    } else {
        // After level 6, very gradual speed increases with cap
        const speedIncrease = Math.min(0.5, 0.25 + (currentLevel - 6) * 0.05); // Cap at +0.5
        SPIDER_SPEED = BASE_SPIDER_SPEED + speedIncrease;
        BULLET_SPEED = BASE_BULLET_SPEED + speedIncrease + 0.3; // Keep bullets faster than spiders
        
        // Focus on pattern-based difficulty rather than overwhelming speed
        // - More erratic spider movement patterns
        // - Spiders that change direction
        // - Different spider behaviors
    }
}

// ...move spiders...
function moveSpiders() {
    if (gamePaused) return; // Stop all spider movement when paused
    
    // Freeze time power-up slows down spiders
    const freezeMultiplier = hasPowerUp('FREEZE_TIME') ? 0.2 : 1.0;
    
    spiders.forEach((spider, idx) => {
        // Level-based spider behavior
        if (currentLevel >= 3) {
            // Level 3+: Random swinging while dropping at slow rate
            const swayAmount = Math.sin(Date.now() / 600 + idx) * 1.2 * freezeMultiplier;
            spider.x += swayAmount;
            
            // Keep spiders within bounds
            spider.x = Math.max(SPIDER_RADIUS, Math.min(canvas.width - SPIDER_RADIUS, spider.x));
            
            // Random direction changes for swinging effect
            if (Math.random() < 0.012 * freezeMultiplier) {
                spider.x += (Math.random() - 0.5) * 30 * freezeMultiplier;
                spider.x = Math.max(SPIDER_RADIUS, Math.min(canvas.width - SPIDER_RADIUS, spider.x));
            }
        }
        
        // Apply speed based on level
        let spiderSpeed = SPIDER_SPEED;
        if (currentLevel >= 5 && currentLevel <= 7) {
            spiderSpeed = SPIDER_SPEED * 1.2; // Little speed increase for levels 5-7
        }
        
        spider.y += spiderSpeed * freezeMultiplier;
        
        // Level 5-7: Some random straight-dropping spiders shoot at player
        if (currentLevel >= 5 && currentLevel <= 7) {
            if (Math.random() < 0.001 && spider.y > 100) { // Very low chance, only when spider is lower
                spiderShoot(spider.x, spider.y);
            }
        }
        
        // Level 8+: Hanging spiders start shooting while descending
        if (currentLevel >= 8) {
            const distanceToPlayer = Math.abs(spider.x - (playerX + PLAYER_WIDTH / 2));
            const shootChance = (0.002 + (currentLevel - 8) * 0.0005) * freezeMultiplier;
            const shouldShoot = spider.y > 150 && distanceToPlayer < 120 && Math.random() < shootChance;
            if (shouldShoot) {
                spiderShoot(spider.x, spider.y);
            }
        }
        
        // Check if spider reached the ground
        if (spider.y >= GROUND_Y - SPIDER_RADIUS) {
            groundSpiders.push({
                x: spider.x,
                y: GROUND_Y - SPIDER_RADIUS, // Same level as player
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
    if (gamePaused) return; // Stop all spider bullet movement when paused
    
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
    if (gamePaused) return; // Stop shooting when paused
    
    const now = Date.now();
    const shootCooldown = 200; // 200ms cooldown between shots
    
    // Handle all directional shooting (now works at all times, not just when ground spiders present)
    if (shootLeftPressed && now - lastHorizontalShot > shootCooldown) {
        shootHorizontalBullet(-1); // Shoot left
        lastHorizontalShot = now;
    }
    if (shootRightPressed && now - lastHorizontalShot > shootCooldown) {
        shootHorizontalBullet(1); // Shoot right
        lastHorizontalShot = now;
    }
    if (shootLeftUpPressed && now - lastHorizontalShot > shootCooldown) {
        shoot(); // Shoot vertically upward like Ctrl key
        lastHorizontalShot = now;
    }
    if (shootLeftDownPressed && now - lastHorizontalShot > shootCooldown) {
        shootDiagonalBullet(-1, 1); // Shoot left down
        lastHorizontalShot = now;
    }
}

// ...shoot horizontal bullet...
function shootHorizontalBullet(direction) {
    if (!gameRunning || gamePaused || showSplash) return;
    
    // Always shoot from the gun nozzle position, regardless of player's Y position
    const gunNozzleX = playerX + PLAYER_WIDTH / 2;
    const gunNozzleY = playerY - PLAYER_HEIGHT * 0.3; // Same as vertical bullets
    
    const bulletX = direction > 0 ? 
        gunNozzleX : 
        gunNozzleX - HORIZONTAL_BULLET_WIDTH;
    const bulletY = gunNozzleY;
    
    horizontalBullets.push({
        x: bulletX,
        y: bulletY,
        direction: direction
    });
    
    // Play shoot sound
    if (shootSound) {
        shootSound.currentTime = 0;
        shootSound.play().catch(e => {});
    }
}

// ...shoot diagonal bullet...
function shootDiagonalBullet(directionX, directionY) {
    if (!gameRunning || gamePaused || showSplash) return;
    
    // Always shoot from the gun nozzle position
    const gunNozzleX = playerX + PLAYER_WIDTH / 2;
    const gunNozzleY = playerY - PLAYER_HEIGHT * 0.3; // Same as vertical bullets
    
    const bulletX = gunNozzleX - HORIZONTAL_BULLET_WIDTH / 2;
    const bulletY = gunNozzleY;
    
    diagonalBullets.push({
        x: bulletX,
        y: bulletY,
        directionX: directionX,
        directionY: directionY
    });
    
    // Play shoot sound
    if (shootSound) {
        shootSound.currentTime = 0;
        shootSound.play().catch(e => {});
    }
}

// ...move ground spiders toward player...
function moveGroundSpiders() {
    if (gamePaused) return; // Stop all movement when paused
    
    const now = Date.now();
    groundSpiders.forEach(spider => {
        const dx = (playerX + PLAYER_WIDTH / 2) - spider.x;
        // Slower, more manageable ground spider speed
        const speed = 0.8 + (currentLevel - 1) * 0.1; // Much slower progression
        
        if (Math.abs(dx) > speed) {
            spider.x += dx > 0 ? speed : -speed;
        } else {
            spider.x = playerX + PLAYER_WIDTH / 2;
        }
        
        // Ground spiders don't shoot in the new level system - they just chase
        // All shooting comes from hanging spiders based on level requirements
    });
}

// ...spawn spider...
function spawnSpider() {
    if (gamePaused) return; // Stop spawning when paused
    
    const now = Date.now();
    const maxSpiders = spidersPerLevel[Math.min(currentLevel - 1, spidersPerLevel.length - 1)];
    
    // Allow continuous spawning - only check if we haven't defeated enough spiders yet
    if (spidersDefeatedThisLevel >= maxSpiders) return; // Stop spawning when level is complete
    
    if (currentLevel === 1) {
        // Level 1: Very slow spawn rate - only spawn a new spider if none are present
        if (spiders.length === 0 && groundSpiders.length === 0) {
            const x = Math.random() * (canvas.width - SPIDER_RADIUS * 2) + SPIDER_RADIUS;
            spiders.push({
                x,
                y: 0,
                lastShot: now - Math.random() * 1000,
                animationFrame: 0
            });
            lastSpiderSpawn = now;
            spidersSpawnedThisLevel++;
        }
    } else if (currentLevel === 2) {
        // Level 2: Still very slow spawn rate
        if (now - lastSpiderSpawn > 4000) { // 4 seconds between spawns
            const x = Math.random() * (canvas.width - SPIDER_RADIUS * 2) + SPIDER_RADIUS;
            spiders.push({
                x,
                y: 0,
                lastShot: now - Math.random() * 1000,
                animationFrame: 0
            });
            lastSpiderSpawn = now;
            spidersSpawnedThisLevel++;
        }
    } else {
        // Higher levels: Controlled spawn rates
        let levelSpawnInterval;
        if (currentLevel === 2) {
            levelSpawnInterval = 3000; // Level 2: 3 seconds between spawns
        } else if (currentLevel === 3) {
            levelSpawnInterval = 2800; // Level 3: 2.8 seconds
        } else if (currentLevel === 4) {
            levelSpawnInterval = 2600; // Level 4: 2.6 seconds
        } else if (currentLevel === 5) {
            levelSpawnInterval = 2400; // Level 5: 2.4 seconds
        } else if (currentLevel === 6) {
            levelSpawnInterval = 2200; // Level 6: 2.2 seconds
        } else {
            // Levels 7+: Gradually decrease but stay reasonable
            levelSpawnInterval = Math.max(1500, 2200 - (currentLevel - 6) * 50);
        }
        
        // Continue spawning as long as there are fewer spiders on screen than needed and level isn't complete
        const totalSpidersOnScreen = spiders.length + groundSpiders.length;
        const maxConcurrentSpiders = Math.min(3 + Math.floor(currentLevel / 3), 6); // Max 6 spiders on screen at once
        
        if (now - lastSpiderSpawn > levelSpawnInterval && totalSpidersOnScreen < maxConcurrentSpiders) {
            const x = Math.random() * (canvas.width - SPIDER_RADIUS * 2) + SPIDER_RADIUS;
            spiders.push({
                x,
                y: 0,
                lastShot: now - Math.random() * 1000,
                animationFrame: 0
            });
            lastSpiderSpawn = now;
            spidersSpawnedThisLevel++;
            
            // Remove aggressive double spawning - only very rare extra spawns for higher levels
            if (currentLevel >= 8 && Math.random() < 0.15 && totalSpidersOnScreen < maxConcurrentSpiders - 1) {
                // Only 15% chance for extra spawn, and only from level 8+
                setTimeout(() => {
                    if (spiders.length + groundSpiders.length < maxConcurrentSpiders) {
                        const x2 = Math.random() * (canvas.width - SPIDER_RADIUS * 2) + SPIDER_RADIUS;
                        spiders.push({
                            x: x2,
                            y: 0,
                            lastShot: now - Math.random() * 1000,
                            animationFrame: 0
                        });
                        spidersSpawnedThisLevel++;
                    }
                }, 1500); // Longer delay for better spacing
            }
        }
    }
}

// ...update particles...
function updateParticles() {
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        // Apply gravity to footstep particles
        if (p.gravity) {
            p.vy += p.gravity;
        }
        
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
    // Don't check player collisions during death animation
    if (isPlayerDying) {
        // Still check bullet vs spider collisions, but skip player collision checks
        // Only process bullet-spider collisions, skip player damage sections
    }
    
    // Vertical bullet vs hanging spiders
    bullets.forEach((bullet, bIdx) => {
        spiders.forEach((spider, sIdx) => {
            // Use circular collision detection for better accuracy
            const bulletCenterX = bullet.x + BULLET_WIDTH / 2;
            const bulletCenterY = bullet.y + BULLET_HEIGHT / 2;
            const distance = Math.sqrt(
                Math.pow(bulletCenterX - spider.x, 2) + 
                Math.pow(bulletCenterY - spider.y, 2)
            );
            
            if (distance < SPIDER_RADIUS + 8) { // Increased tolerance for easier hitting
                const points = 20 + (currentLevel - 1) * 5; // More points at higher levels
                score += points;
                levelScore += points;
                spawnParticles(spider.x, spider.y);
                
                // Blast power effect - create explosion at spider location
                if (hasPowerUp('BLAST_POWER')) {
                    createExplosion(spider.x, spider.y);
                }
                
                spiders.splice(sIdx, 1);
                bullets.splice(bIdx, 1);
                
                // Only increment if we haven't reached the level requirement yet
                const maxSpiders = spidersPerLevel[Math.min(currentLevel - 1, spidersPerLevel.length - 1)];
                if (spidersDefeatedThisLevel < maxSpiders) {
                    spidersDefeatedThisLevel++;
                }
                
                if (breakSound) breakSound.currentTime = 0, breakSound.play();
                // Check level progression
                checkLevelUp();
            }
        });
        
        // Vertical bullet vs ground spiders
        groundSpiders.forEach((spider, sIdx) => {
            // Use circular collision detection for better accuracy
            const bulletCenterX = bullet.x + BULLET_WIDTH / 2;
            const bulletCenterY = bullet.y + BULLET_HEIGHT / 2;
            const distance = Math.sqrt(
                Math.pow(bulletCenterX - spider.x, 2) + 
                Math.pow(bulletCenterY - spider.y, 2)
            );
            
            if (distance < SPIDER_RADIUS + 8) { // Increased tolerance for easier hitting
                const points = 30 + (currentLevel - 1) * 5; // More points at higher levels
                score += points;
                levelScore += points;
                spawnParticles(spider.x, spider.y);
                
                // Blast power effect - create explosion at spider location
                if (hasPowerUp('BLAST_POWER')) {
                    createExplosion(spider.x, spider.y);
                }
                
                groundSpiders.splice(sIdx, 1);
                bullets.splice(bIdx, 1);
                
                // Only increment if we haven't reached the level requirement yet
                const maxSpiders = spidersPerLevel[Math.min(currentLevel - 1, spidersPerLevel.length - 1)];
                if (spidersDefeatedThisLevel < maxSpiders) {
                    spidersDefeatedThisLevel++;
                }
                
                if (breakSound) breakSound.currentTime = 0, breakSound.play();
                
                // Check level progression
                checkLevelUp();
            }
        });
    });
    
    // Horizontal bullet vs ground spiders
    horizontalBullets.forEach((bullet, bIdx) => {
        groundSpiders.forEach((spider, sIdx) => {
            // More precise collision detection
            const bulletCenterX = bullet.x + HORIZONTAL_BULLET_WIDTH / 2;
            const bulletCenterY = bullet.y + HORIZONTAL_BULLET_HEIGHT / 2;
            const distance = Math.sqrt(
                Math.pow(bulletCenterX - spider.x, 2) + 
                Math.pow(bulletCenterY - spider.y, 2)
            );
            
            if (distance < SPIDER_RADIUS + 8) { // Increased tolerance for easier hitting
                const points = 40 + (currentLevel - 1) * 5; // Bonus points for horizontal shots
                score += points;
                levelScore += points;
                spawnParticles(spider.x, spider.y);
                
                // Blast power effect - create explosion at spider location
                if (hasPowerUp('BLAST_POWER')) {
                    createExplosion(spider.x, spider.y);
                }
                
                groundSpiders.splice(sIdx, 1);
                horizontalBullets.splice(bIdx, 1);
                
                // Only increment if we haven't reached the level requirement yet
                const maxSpiders = spidersPerLevel[Math.min(currentLevel - 1, spidersPerLevel.length - 1)];
                if (spidersDefeatedThisLevel < maxSpiders) {
                    spidersDefeatedThisLevel++;
                }
                
                if (breakSound) breakSound.currentTime = 0, breakSound.play();
                
                // Check level progression
                checkLevelUp();
                return; // Exit early to avoid processing this bullet further
            }
        });
        
        // Horizontal bullet vs hanging spiders (improved collision detection)
        spiders.forEach((spider, sIdx) => {
            const bulletCenterX = bullet.x + HORIZONTAL_BULLET_WIDTH / 2;
            const bulletCenterY = bullet.y + HORIZONTAL_BULLET_HEIGHT / 2;
            const distance = Math.sqrt(
                Math.pow(bulletCenterX - spider.x, 2) + 
                Math.pow(bulletCenterY - spider.y, 2)
            );
            
            if (distance < SPIDER_RADIUS + 8) { // Increased tolerance for easier hitting
                const points = 35 + (currentLevel - 1) * 5; // Bonus for creative shots
                score += points;
                levelScore += points;
                spawnParticles(spider.x, spider.y);
                
                // Blast power effect - create explosion at spider location
                if (hasPowerUp('BLAST_POWER')) {
                    createExplosion(spider.x, spider.y);
                }
                
                spiders.splice(sIdx, 1);
                horizontalBullets.splice(bIdx, 1);
                
                // Only increment if we haven't reached the level requirement yet
                const maxSpiders = spidersPerLevel[Math.min(currentLevel - 1, spidersPerLevel.length - 1)];
                if (spidersDefeatedThisLevel < maxSpiders) {
                    spidersDefeatedThisLevel++;
                }
                
                if (breakSound) breakSound.currentTime = 0, breakSound.play();
                
                // Check level progression
                checkLevelUp();
            }
        });
    });
    
    // Diagonal bullet vs spiders
    diagonalBullets.forEach((bullet, bIdx) => {
        // Check against hanging spiders
        spiders.forEach((spider, sIdx) => {
            const bulletCenterX = bullet.x + HORIZONTAL_BULLET_WIDTH / 2;
            const bulletCenterY = bullet.y + HORIZONTAL_BULLET_HEIGHT / 2;
            const distance = Math.sqrt(
                Math.pow(bulletCenterX - spider.x, 2) + 
                Math.pow(bulletCenterY - spider.y, 2)
            );
            
            if (distance < SPIDER_RADIUS + 8) { // Increased tolerance for easier hitting
                const points = 25 + (currentLevel - 1) * 5; // Points for diagonal shots
                score += points;
                levelScore += points;
                spawnParticles(spider.x, spider.y);
                
                // Blast power effect
                if (hasPowerUp('BLAST_POWER')) {
                    createExplosion(spider.x, spider.y);
                }
                
                spiders.splice(sIdx, 1);
                diagonalBullets.splice(bIdx, 1);
                
                // Only increment if we haven't reached the level requirement yet
                const maxSpiders = spidersPerLevel[Math.min(currentLevel - 1, spidersPerLevel.length - 1)];
                if (spidersDefeatedThisLevel < maxSpiders) {
                    spidersDefeatedThisLevel++;
                }
                
                if (breakSound) breakSound.currentTime = 0, breakSound.play();
                
                // Check level progression
                checkLevelUp();
            }
        });
        
        // Check against ground spiders
        groundSpiders.forEach((spider, sIdx) => {
            const bulletCenterX = bullet.x + HORIZONTAL_BULLET_WIDTH / 2;
            const bulletCenterY = bullet.y + HORIZONTAL_BULLET_HEIGHT / 2;
            const distance = Math.sqrt(
                Math.pow(bulletCenterX - spider.x, 2) + 
                Math.pow(bulletCenterY - spider.y, 2)
            );
            
            if (distance < SPIDER_RADIUS + 8) { // Increased tolerance for easier hitting
                const points = 30 + (currentLevel - 1) * 5; // Points for diagonal shots on ground spiders
                score += points;
                levelScore += points;
                spawnParticles(spider.x, spider.y);
                
                // Blast power effect
                if (hasPowerUp('BLAST_POWER')) {
                    createExplosion(spider.x, spider.y);
                }
                
                groundSpiders.splice(sIdx, 1);
                diagonalBullets.splice(bIdx, 1);
                
                // Only increment if we haven't reached the level requirement yet
                const maxSpiders = spidersPerLevel[Math.min(currentLevel - 1, spidersPerLevel.length - 1)];
                if (spidersDefeatedThisLevel < maxSpiders) {
                    spidersDefeatedThisLevel++;
                }
                
                if (breakSound) breakSound.currentTime = 0, breakSound.play();
                
                // Check level progression
                checkLevelUp();
            }
        });
    });
    
    // Spider bullets vs player
    if (!isPlayerDying) { // Only check player collisions if not dying
        spiderBullets.forEach((bullet, bIdx) => {
            if (
                bullet.x > playerX &&
                bullet.x < playerX + PLAYER_WIDTH &&
                bullet.y > playerY &&
                bullet.y < playerY + PLAYER_HEIGHT
            ) {
                loseLife();
                spiderBullets.splice(bIdx, 1);
                spawnParticles(playerX + PLAYER_WIDTH / 2, playerY + PLAYER_HEIGHT / 2);
            }
        });
    }
    
    // Player vs ground spiders (lose life) - Rectangle-Circle collision detection
    if (!isPlayerDying) { // Only check player collisions if not dying
        groundSpiders.forEach((spider, sIdx) => {
            // Find the closest point on the rectangle (player) to the center of the circle (spider)
            const closestX = Math.max(playerX, Math.min(spider.x, playerX + PLAYER_WIDTH));
            const closestY = Math.max(playerY, Math.min(spider.y, playerY + PLAYER_HEIGHT));
            
            // Calculate the distance between the circle's center and this closest point
            const dx = spider.x - closestX;
            const dy = spider.y - closestY;
            const distanceSquared = dx * dx + dy * dy;
            
            // Check if the distance is within the spider's radius (collision)
            if (distanceSquared <= SPIDER_RADIUS * SPIDER_RADIUS) {
                loseLife();
                groundSpiders.splice(sIdx, 1); // Remove the spider that caught player
            }
        });
    }
    
    // Player vs hanging spiders (lose life) - Rectangle-Circle collision detection
    if (!isPlayerDying) { // Only check player collisions if not dying
        spiders.forEach((spider, sIdx) => {
            // Find the closest point on the rectangle (player) to the center of the circle (spider)
            const closestX = Math.max(playerX, Math.min(spider.x, playerX + PLAYER_WIDTH));
            const closestY = Math.max(playerY, Math.min(spider.y, playerY + PLAYER_HEIGHT));
            
            // Calculate the distance between the circle's center and this closest point
            const dx = spider.x - closestX;
            const dy = spider.y - closestY;
            const distanceSquared = dx * dx + dy * dy;
            
            // Check if the distance is within the spider's radius (collision)
            if (distanceSquared <= SPIDER_RADIUS * SPIDER_RADIUS) {
                loseLife();
                spiders.splice(sIdx, 1); // Remove the spider that caught player
            }
        });
    }
}

// ...level and life management...
function checkLevelUp() {
    const maxSpiders = spidersPerLevel[Math.min(currentLevel - 1, spidersPerLevel.length - 1)];
    const requiredScore = scoreToNextLevel * currentLevel;
    // End level if all spiders defeated
    if (spidersDefeatedThisLevel >= maxSpiders && currentLevel < maxLevel) {
        currentLevel++;
        levelScore = 0;
        lives = Math.min(maxLives, lives + 1); // Bonus life on level up
        updateDifficulty(); // Update speeds based on new level
        showLevelUpMessage();
        spidersSpawnedThisLevel = 0;
        spidersDefeatedThisLevel = 0;
    } else if (levelScore >= requiredScore && currentLevel < maxLevel) {
        // Fallback: allow score-based progression too
        currentLevel++;
        levelScore = 0;
        lives = Math.min(maxLives, lives + 1); // Bonus life on level up
        updateDifficulty(); // Update speeds based on new level
        showLevelUpMessage();
        spidersSpawnedThisLevel = 0;
        spidersDefeatedThisLevel = 0;
    }
}

function loseLife() {
    lives--;
    
    // Start death blinking
    isPlayerDying = true;
    deathAnimationStartTime = Date.now();
    blinkCount = 0;
    
    // Play lose life sound effect immediately and prominently
    if (loseLifeSound) {
        try {
            loseLifeSound.currentTime = 0;
            loseLifeSound.volume = 0.8; // Ensure volume is high enough
            const playPromise = loseLifeSound.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {});
            }
        } catch (error) {
            // Error playing lose life sound
        }
    }
    
    if (lives <= 0) {
        // Don't immediately end game - let death blinking play
        setTimeout(() => {
            gameOver = true;
            gameRunning = false;
            if (backgroundMusic) backgroundMusic.pause();
            if (gameOverSound) gameOverSound.currentTime = 0, gameOverSound.play();
        }, BLINK_DURATION * TOTAL_BLINKS);
    } else {
        // Reset after death blinking completes
        setTimeout(() => {
            // Reset player position and clear threats
            playerX = canvas.width / 2 - PLAYER_WIDTH / 2;
            playerY = GROUND_Y; // Reset to ground position
            playerVelocityY = 0; // Reset jump velocity
            isJumping = false; // Reset jump state
            isPlayerDying = false; // End death blinking
            blinkCount = 0; // Reset blink count
            groundSpiders = [];
            spiderBullets = []; // Clear spider bullets on respawn
            horizontalBullets = []; // Clear horizontal bullets on respawn
            // Brief invincibility could be added here
        }, BLINK_DURATION * TOTAL_BLINKS);
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
        if (newLevelNumber === 8) {
            ctx.fillText('Now spiders can shoot too!', 0, 0);
        } else {
            ctx.fillText('GET READY!', 0, 0);
        }
        // Reset shadow
        ctx.shadowBlur = 0;
        // Main subtitle
        ctx.fillStyle = `rgba(255, 215, 0, ${textAlpha})`;
        ctx.font = 'bold 24px Arial';
        if (newLevelNumber === 8) {
            ctx.fillText('Now spiders can shoot too!', 0, 0);
        } else {
            ctx.fillText('GET READY!', 0, 0);
        }
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
    draw3DText('Ctrl/W: Shoot Up', canvas.width / 2, canvas.height / 2 + 70, 18, 'control');
    draw3DText('S: Shoot Left Down', canvas.width / 2, canvas.height / 2 + 95, 18, 'control');
    draw3DText('A: Left, D: Right', canvas.width / 2, canvas.height / 2 + 120, 18, 'control');
    draw3DText('P: Pause', canvas.width / 2, canvas.height / 2 + 145, 18, 'control');
    draw3DText('M: Toggle Music', canvas.width / 2, canvas.height / 2 + 170, 18, 'control');
    
    if (isMobile) {
        draw3DText('Touch controls available on mobile', canvas.width / 2, canvas.height / 2 + 205, 18, 'control');
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
    // Since we now have the info bar, we can make this function simpler
    // or use it for additional score display if needed
    // The main info is now shown in the top info bar
    return; // Skip drawing the old score display since we have the info bar
}

// ...draw timer...
function drawTimer() {
    // Timer is now shown in the info bar, so this function can be simplified
    return; // Skip drawing the separate timer since it's in the info bar
}

// ...draw pause screen...
function drawPauseScreen() {
    // Since the pause indicator is now shown in the info bar, 
    // we can make this simpler or add a subtle overlay
    
    // Optional: Add a subtle overlay to indicate pause state
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, INFO_BAR_HEIGHT, canvas.width, canvas.height - INFO_BAR_HEIGHT);
    
    // Center message below info bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 - 30, 200, 60);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Paused', canvas.width / 2, canvas.height / 2 - 5);
    
    ctx.fillStyle = '#ff0';
    ctx.font = '16px Arial';
    ctx.fillText('Press P to Resume', canvas.width / 2, canvas.height / 2 + 20);
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
    draw3DText('G A M E   O V E R', canvas.width / 2, canvas.height / 2 - 60, 48, 'gameOver');

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
    drawInfoBar(); // Draw the information bar at the top
    drawPlayer();
    drawBullets();
    drawSpiders();
    drawPowerUps(); // Draw power-up spawns
    drawParticles();
    drawPowerUpUI(); // Draw active power-up indicators
    drawHorizontalShootingHint(); // Show horizontal shooting hints
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
    spawnPowerUp(); // Spawn power-ups
    updatePowerUps(); // Update power-up system
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
                enterSound.play().catch(e => {});
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
                backgroundMusic.play().catch(e => {});
            }
        }
        return;
    }
    
    if (gameOver) {
        if (e.code === 'KeyR') {
            // Play enter sound for restart
            if (enterSound) {
                enterSound.currentTime = 0;
                enterSound.play().catch(e => {});
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
            spidersDefeatedThisLevel = 0;
            spidersSpawnedThisLevel = 0;
            spiders = [];
            groundSpiders = [];
            bullets = [];
            spiderBullets = [];
            horizontalBullets = [];
            diagonalBullets = [];
            particles = [];
            
            // Reset power-up system
            activePowerUps = [];
            powerUpSpawns = [];
            lastPowerUpSpawn = 0;
            machineGunTimer = 0;
            
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
            
            // Reset death blinking variables
            isPlayerDying = false;
            deathAnimationStartTime = 0;
            blinkCount = 0;
            
            // Reset input states
            leftPressed = false;
            rightPressed = false;
            upPressed = false;
            shootPressed = false;
            shootLeftUpPressed = false;
            shootLeftDownPressed = false;
            shootLeftPressed = false;
            shootRightPressed = false;
            
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
        }
        return;
    }
    
    if (e.code === 'ArrowLeft') leftPressed = true;
    if (e.code === 'ArrowRight') rightPressed = true;
    if (e.code === 'ArrowUp') upPressed = true;
    if (e.code === 'ControlLeft' || e.code === 'ControlRight') shootPressed = true;
    if (e.code === 'KeyW') shootLeftUpPressed = true; // W key for left up shooting
    if (e.code === 'KeyS') shootLeftDownPressed = true; // S key for left down shooting
    if (e.code === 'KeyA') shootLeftPressed = true; // A key for horizontal left shooting
    if (e.code === 'KeyD') shootRightPressed = true; // D key for horizontal right shooting
    if (e.code === 'KeyP') {
        gamePaused = !gamePaused;
        
        if (gamePaused) {
            pauseStartTime = Date.now();
            if (backgroundMusic && !backgroundMusic.paused) backgroundMusic.pause();
            // Stop any existing resume sound and play pause sound
            if (resumeSound) {
                resumeSound.pause();
                resumeSound.currentTime = 0;
            }
            if (pauseSound) {
                pauseSound.currentTime = 0;
                pauseSound.play().catch(e => {});
            }
        } else {
            if (pauseStartTime > 0) {
                totalPauseTime += Date.now() - pauseStartTime;
                pauseStartTime = 0;
            }
            if (backgroundMusic && backgroundMusic.paused) backgroundMusic.play().catch(e => {});
            // Stop pause sound first, then play resume sound
            if (pauseSound) {
                pauseSound.pause();
                pauseSound.currentTime = 0;
            }
            if (resumeSound) {
                resumeSound.currentTime = 0;
                resumeSound.play().catch(e => {});
            }
        }
    }
    if (e.code === 'KeyM') {
        // Toggle music
        if (backgroundMusic) {
            if (backgroundMusic.paused) {
                backgroundMusic.play().catch(e => {});
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
    if (e.code === 'KeyW') shootLeftUpPressed = false; // W key for left up shooting
    if (e.code === 'KeyS') shootLeftDownPressed = false; // S key for left down shooting
    if (e.code === 'KeyA') shootLeftPressed = false; // A key for horizontal left shooting
    if (e.code === 'KeyD') shootRightPressed = false; // D key for horizontal right shooting
});

// Enhanced shooting function with power-ups
function shoot() {
    if (!gameRunning || gamePaused || showSplash) return;
    
    // Calculate gun nozzle position
    const gunNozzleX = playerX + PLAYER_WIDTH / 2;
    const gunNozzleY = playerY - PLAYER_HEIGHT * 0.3; // Approximate gun nozzle height
    
    if (hasPowerUp('MULTI_SHOT')) {
        // Multi-shot - fire 3 bullets in spread pattern from gun nozzle
        for (let i = 0; i < 3; i++) {
            bullets.push({ 
                x: gunNozzleX - BULLET_WIDTH / 2 + (i - 1) * 15, 
                y: gunNozzleY 
            });
        }
    } else {
        // Regular shot from gun nozzle
        bullets.push({ 
            x: gunNozzleX - BULLET_WIDTH / 2, 
            y: gunNozzleY 
        });
    }
    
    // Play shoot sound
    if (shootSound) {
        shootSound.currentTime = 0;
        shootSound.play().catch(e => {});
    }
}

function createExplosion(x, y) {
    const explosionRadius = POWER_UPS.BLAST_POWER.explosionRadius;
    
    // Play blast sound
    if (blastSound) {
        blastSound.currentTime = 0;
        blastSound.play().catch(e => {});
    }
    
    // Create explosion particles
    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const speed = 2 + Math.random() * 4;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1,
            size: 4 + Math.random() * 6,
            color: '#FF4444',
            gravity: 0.05,
            life: 50
        });
        
        // Add some orange particles for variety
        if (i % 2 === 0) {
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle + 0.5) * speed * 0.7,
                vy: Math.sin(angle + 0.5) * speed * 0.7,
                alpha: 1,
                size: 2 + Math.random() * 4,
                color: '#FF8800',
                gravity: 0.03,
                life: 40
            });
        }
    }
    
    // Damage all spiders in explosion radius
    spiders.forEach((spider, index) => {
        const distance = Math.sqrt(Math.pow(spider.x - x, 2) + Math.pow(spider.y - y, 2));
        if (distance < explosionRadius) {
            // Add points for explosion kills
            const points = 25 + (currentLevel - 1) * 5;
            score += points;
            levelScore += points;
            spawnParticles(spider.x, spider.y);
            spiders.splice(index, 1);
            
            // Only increment if we haven't reached the level requirement yet
            const maxSpiders = spidersPerLevel[Math.min(currentLevel - 1, spidersPerLevel.length - 1)];
            if (spidersDefeatedThisLevel < maxSpiders) {
                spidersDefeatedThisLevel++;
            }
            
            if (breakSound) {
                breakSound.currentTime = 0;
                breakSound.play();
            }
        }
    });
    
    groundSpiders.forEach((spider, index) => {
        const distance = Math.sqrt(Math.pow(spider.x - x, 2) + Math.pow(spider.y - y, 2));
        if (distance < explosionRadius) {
            // Add points for explosion kills
            const points = 35 + (currentLevel - 1) * 5;
            score += points;
            levelScore += points;
            spawnParticles(spider.x, spider.y);
            groundSpiders.splice(index, 1);
            if (breakSound) {
                breakSound.currentTime = 0;
                breakSound.play();
            }
        }
    });
    
    // Check for level progression after explosion
    checkLevelUp();
}

// ...shooting...
setInterval(() => {
    if (shootPressed && gameRunning && !gamePaused && !showSplash) {
        // Only auto-fire if not using machine gun (machine gun handles its own timing)
        if (!hasPowerUp('MACHINE_GUN')) {
            shoot();
        }
    }
}, 200); // shooting rate

// Mobile Touch Controls
if (isMobile) {
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const shootBtn = document.getElementById('shootBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const shootLeftBtn = document.getElementById('shootLeftBtn');
    const shootRightBtn = document.getElementById('shootRightBtn');
    const shootLeftUpBtn = document.getElementById('shootLeftUpBtn');
    const shootLeftDownBtn = document.getElementById('shootLeftDownBtn');
    
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
    
    // Touch events for horizontal shooting
    shootLeftBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        shootLeftPressed = true;
    });
    
    shootLeftBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        shootLeftPressed = false;
    });
    
    shootRightBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        shootRightPressed = true;
    });
    
    shootRightBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        shootRightPressed = false;
    });
    
    // Touch events for diagonal shooting
    shootLeftUpBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        shootLeftUpPressed = true;
    });
    
    shootLeftUpBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        shootLeftUpPressed = false;
    });
    
    shootLeftDownBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        shootLeftDownPressed = true;
    });
    
    shootLeftDownBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        shootLeftDownPressed = false;
    });
    
    // Touch events for pause
    pauseBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameRunning) {
            gamePaused = !gamePaused;
            
            if (gamePaused) {
                pauseStartTime = Date.now();
                if (backgroundMusic && !backgroundMusic.paused) backgroundMusic.pause();
                // Stop any existing resume sound and play pause sound
                if (resumeSound) {
                    resumeSound.pause();
                    resumeSound.currentTime = 0;
                }
                if (pauseSound) {
                    pauseSound.currentTime = 0;
                    pauseSound.play().catch(e => {});
                }
            } else {
                if (pauseStartTime > 0) {
                    totalPauseTime += Date.now() - pauseStartTime;
                    pauseStartTime = 0;
                }
                if (backgroundMusic && backgroundMusic.paused) backgroundMusic.play().catch(e => {});
                // Stop pause sound first, then play resume sound
                if (pauseSound) {
                    pauseSound.pause();
                    pauseSound.currentTime = 0;
                }
                if (resumeSound) {
                    resumeSound.currentTime = 0;
                    resumeSound.play().catch(e => {});
                }
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
