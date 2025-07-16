# Spider Shooting Game

A 2D browser-based shooting game built with HTML5 Canvas and JavaScript.

## 🎮 Game Features

- **Interactive Splash Screen** with customizable settings
- **Spider Targets** hanging from webs that drop down
- **Ground Spiders** that move toward the player when they reach the ground
- **Particle Effects** when spiders are destroyed
- **Timer & Scoring System** with in-canvas display
- **Pause Functionality** during gameplay
- **Game Over Screen** with restart option
- **Customizable Speed Controls** for spiders and bullets

## 🕹️ Controls

### Splash Screen
- `←` `→` Switch between Spider Speed and Bullet Speed settings
- `↑` `↓` Adjust selected setting
- `Enter` Start the game

### Gameplay
- `←` `→` Move player left/right
- `Ctrl` Shoot bullets
- `P` Pause/unpause game

### Game Over
- `R` Restart game

## 🚀 How to Play

1. Open `index.html` in your web browser
2. Adjust spider and bullet speeds on the splash screen
3. Press Enter to start
4. Shoot spiders hanging from webs (20 points each)
5. Shoot ground spiders before they reach you (30 points each)
6. Survive as long as possible!

## 📁 Files

- `index.html` - Main HTML file
- `game.js` - Game logic and mechanics
- `style.css` - Styling
- `bg-img.jpg` - Background image
- `spider.png` - Spider sprite
- `person.png` - Player sprite
- `shoot.wav` - Shooting sound effect
- `smash.wav` - Spider destruction sound effect

## 🛠️ Technical Details

- Built with vanilla JavaScript and HTML5 Canvas
- No external dependencies
- Responsive game loop with requestAnimationFrame
- Collision detection for bullets and player
- Particle system for visual effects

## 🎯 Future Enhancements

- Power-ups (multi-shot, shield, faster bullets)
- Different spider types with varying health
- Boss battles
- High score persistence
- Mobile touch controls
- Additional sound effects and background music

## 📄 License

This project is open source and available under the MIT License.
