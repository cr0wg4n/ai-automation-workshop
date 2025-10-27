/**
 * Space Invaders Clone - Versión Refactorizada
 * Estructura modular con clases y mejor organización
 */

class Game {
  constructor() {
    // Referencias DOM
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.startBtn = document.getElementById('startBtn');
    this.scoreEl = document.getElementById('score');
    this.livesEl = document.getElementById('lives');
    
    // Estado del juego
    this.gameRunning = false;
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    
    // Configuración del juego
    this.config = {
      player: {
        width: 40,
        height: 20,
        speed: 5
      },
      bullet: {
        width: 4,
        height: 12,
        speed: 8
      },
      enemy: {
        width: 32,
        height: 20,
        rows: 4,
        cols: 8,
        gap: 16,
        speed: 2,
        dropDistance: 20
      }
    };
    
    // Game objects
    this.player = null;
    this.bullets = [];
    this.enemies = [];
    this.explosions = [];
    
    // Assets
    this.assets = new AssetManager();
    
    // Input handler
    this.input = new InputHandler();
    
    this.init();
  }
  
  init() {
    this.assets.loadAssets(() => {
      this.showStartScreen();
      this.bindEvents();
    });
  }
  
  bindEvents() {
    this.startBtn.addEventListener('click', () => {
      if (!this.gameRunning) {
        this.startGame();
      }
    });
    
    this.input.bindEvents(this);
  }

  showStartScreen() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = '32px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('SPACE INVADERS', this.canvas.width/2, this.canvas.height/2 - 60);
    this.ctx.font = '16px monospace';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText('Usa las flechas para moverte', this.canvas.width/2, this.canvas.height/2 - 20);
    this.ctx.fillText('Presiona ESPACIO para disparar', this.canvas.width/2, this.canvas.height/2);
    this.ctx.fillText('Presiona "Iniciar Juego" para comenzar', this.canvas.width/2, this.canvas.height/2 + 40);
  }
  
  startGame() {
    this.gameRunning = true;
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    
    this.updateUI();
    
    // Inicializar objetos del juego
    this.player = new Player(
      this.canvas.width / 2 - this.config.player.width / 2,
      this.canvas.height - this.config.player.height - 20,
      this.config.player
    );
    
    this.bullets = [];
    this.explosions = [];
    this.enemies = new EnemyGrid(this.config.enemy);
    
    this.gameLoop();
  }
  
  updateUI() {
    this.scoreEl.textContent = this.score;
    this.livesEl.textContent = this.lives;
  }

  gameLoop() {
    if (!this.gameRunning) return;
    
    // Limpiar canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Actualizar objetos del juego
    this.updateGame();
    
    // Verificar colisiones
    this.checkCollisions();
    
    // Dibujar todos los elementos
    this.render();
    
    // Verificar condiciones de fin de juego
    if (this.checkGameOver()) {
      return;
    }
    
    // Continuar el bucle del juego
    requestAnimationFrame(() => this.gameLoop());
  }
  
  updateGame() {
    // Actualizar jugador
    this.player.update();
    
    // Actualizar balas
    this.bullets = this.bullets.filter(bullet => {
      bullet.update();
      return bullet.active;
    });
    
    // Actualizar enemigos
    this.enemies.update();
    
    // Actualizar explosiones
    this.explosions = this.explosions.filter(explosion => {
      explosion.update();
      return explosion.active;
    });
  }
  
  checkCollisions() {
    const aliveEnemies = this.enemies.getAliveEnemies();
    
    // Colisiones bala-enemigo
    this.bullets.forEach(bullet => {
      if (!bullet.active) return;
      
      aliveEnemies.forEach(enemy => {
        if (enemy.alive && CollisionManager.checkCollision(bullet, enemy)) {
          enemy.alive = false;
          bullet.active = false;
          this.score += enemy.points;
          this.updateUI();
          this.explosions.push(new Explosion(
            enemy.x + enemy.width / 2, 
            enemy.y + enemy.height / 2,
            '#ffff00'
          ));
        }
      });
    });
    
    // Colisiones enemigo-jugador
    aliveEnemies.forEach(enemy => {
      if (enemy.alive && CollisionManager.checkCollision(enemy, this.player)) {
        this.playerHit();
      }
    });
    
    // Verificar si los enemigos llegaron al fondo
    const lowestEnemy = Math.max(...aliveEnemies.map(e => e.y + e.height));
    if (lowestEnemy >= this.player.y) {
      this.playerHit();
    }
  }
  
  playerHit() {
    this.explosions.push(new Explosion(
      this.player.x + this.player.width / 2,
      this.player.y + this.player.height / 2,
      '#ff0000'
    ));
    
    this.lives--;
    this.updateUI();
    
    if (this.lives <= 0) {
      this.gameOver();
    } else {
      // Respawn del jugador después de un breve retraso
      setTimeout(() => {
        this.player.x = this.canvas.width / 2 - this.config.player.width / 2;
        this.bullets = []; // Limpiar balas
      }, 1000);
    }
  }
  
  render() {
    // Dibujar jugador
    this.player.draw(this.ctx, this.assets);
    
    // Dibujar balas
    this.bullets.forEach(bullet => bullet.draw(this.ctx, this.assets));
    
    // Dibujar enemigos
    this.enemies.draw(this.ctx, this.assets);
    
    // Dibujar explosiones
    this.explosions.forEach(explosion => explosion.draw(this.ctx));
  }
  
  checkGameOver() {
    if (this.lives <= 0) {
      this.gameOver();
      return true;
    }
    
    if (this.enemies.allDestroyed()) {
      this.levelComplete();
      return true;
    }
    
    return false;
  }
  
  gameOver() {
    this.gameRunning = false;
    this.ctx.fillStyle = '#ff0000';
    this.ctx.font = '32px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.canvas.width/2, this.canvas.height/2);
    this.ctx.font = '16px monospace';
    this.ctx.fillText(`Puntuación Final: ${this.score}`, this.canvas.width/2, this.canvas.height/2 + 40);
  }
  
  levelComplete() {
    this.level++;
    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = '32px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('¡NIVEL COMPLETADO!', this.canvas.width/2, this.canvas.height/2);
    this.ctx.font = '16px monospace';
    this.ctx.fillText(`Nivel ${this.level}`, this.canvas.width/2, this.canvas.height/2 + 40);
    
    // Avanzar al siguiente nivel después de un retraso
    setTimeout(() => {
      this.nextLevel();
    }, 2000);
  }
  
  nextLevel() {
    // Incrementar dificultad
    this.config.enemy.speed += 0.5;
    this.enemies = new EnemyGrid(this.config.enemy);
    this.bullets = [];
    this.explosions = [];
    
    // Resetear posición del jugador
    this.player.x = this.canvas.width / 2 - this.config.player.width / 2;
    
    this.gameLoop();
  }
}

class AssetManager {
  constructor() {
    this.images = {};
    this.loadedCount = 0;
    this.totalImages = 0;
  }
  
  loadAssets(callback) {
    const imageSources = {
      player: 'assets/player.png',
      enemy1: 'assets/enemy1.png',
      enemy2: 'assets/enemy2.png',
      bullet: 'assets/bullet.png'
    };
    
    this.totalImages = Object.keys(imageSources).length;
    
    for (const [key, src] of Object.entries(imageSources)) {
      const img = new Image();
      img.onload = () => {
        this.loadedCount++;
        if (this.loadedCount === this.totalImages) {
          callback();
        }
      };
      img.onerror = () => {
        console.warn(`Failed to load image: ${src}`);
        this.loadedCount++;
        if (this.loadedCount === this.totalImages) {
          callback();
        }
      };
      img.src = src;
      this.images[key] = img;
    }
  }
  
  getImage(name) {
    return this.images[name];
  }
}

class Player {
  constructor(x, y, config) {
    this.x = x;
    this.y = y;
    this.width = config.width;
    this.height = config.height;
    this.speed = config.speed;
    this.dx = 0;
    this.alive = true;
  }
  
  update() {
    this.x += this.dx;
    // Limitar movimiento a los bordes del canvas
    this.x = Math.max(0, Math.min(this.x, 480 - this.width));
  }
  
  draw(ctx, assets) {
    if (this.alive) {
      const img = assets.getImage('player');
      if (img && img.complete) {
        ctx.drawImage(img, this.x, this.y, this.width, this.height);
      } else {
        // Fallback si la imagen no está cargada
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
      }
    }
  }
  
  moveLeft() {
    this.dx = -this.speed;
  }
  
  moveRight() {
    this.dx = this.speed;
  }
  
  stopMoving() {
    this.dx = 0;
  }
  
  shoot(bulletConfig) {
    return new Bullet(
      this.x + this.width / 2 - bulletConfig.width / 2,
      this.y,
      bulletConfig.width,
      bulletConfig.height,
      -bulletConfig.speed
    );
  }
}

class Bullet {
  constructor(x, y, width, height, speed) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.active = true;
  }
  
  update() {
    this.y += this.speed;
    
    // Desactivar si sale de pantalla
    if (this.y < -this.height || this.y > 640 + this.height) {
      this.active = false;
    }
  }
  
  draw(ctx, assets) {
    if (this.active) {
      const img = assets.getImage('bullet');
      if (img && img.complete) {
        ctx.drawImage(img, this.x, this.y, this.width, this.height);
      } else {
        // Fallback si la imagen no está cargada
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
      }
    }
  }
}

class Enemy {
  constructor(x, y, config, type = 1) {
    this.x = x;
    this.y = y;
    this.width = config.width;
    this.height = config.height;
    this.alive = true;
    this.type = type;
    this.points = type === 1 ? 10 : 20;
  }
  
  update(direction, speed) {
    this.x += direction * speed;
  }
  
  moveDown(distance) {
    this.y += distance;
  }
  
  draw(ctx, assets) {
    if (this.alive) {
      const imageName = this.type === 1 ? 'enemy1' : 'enemy2';
      const img = assets.getImage(imageName);
      if (img && img.complete) {
        ctx.drawImage(img, this.x, this.y, this.width, this.height);
      } else {
        // Fallback si la imagen no está cargada
        ctx.fillStyle = this.type === 1 ? '#ff0000' : '#ff8800';
        ctx.fillRect(this.x, this.y, this.width, this.height);
      }
    }
  }
}

class EnemyGrid {
  constructor(config) {
    this.config = config;
    this.enemies = [];
    this.direction = 1;
    this.speed = config.speed;
    this.init();
  }
  
  init() {
    this.enemies = [];
    for (let row = 0; row < this.config.rows; row++) {
      for (let col = 0; col < this.config.cols; col++) {
        const x = 40 + col * (this.config.width + this.config.gap);
        const y = 60 + row * (this.config.height + this.config.gap);
        const enemyType = row < 2 ? 2 : 1; // Filas superiores son tipo 2
        this.enemies.push(new Enemy(x, y, this.config, enemyType));
      }
    }
  }
  
  update() {
    let moveDown = false;
    const aliveEnemies = this.enemies.filter(enemy => enemy.alive);
    
    if (aliveEnemies.length === 0) return;
    
    // Mover enemigos horizontalmente
    aliveEnemies.forEach(enemy => enemy.update(this.direction, this.speed));
    
    // Verificar colisión con bordes
    const leftMost = Math.min(...aliveEnemies.map(e => e.x));
    const rightMost = Math.max(...aliveEnemies.map(e => e.x + e.width));
    
    if (rightMost >= 470 || leftMost <= 10) {
      this.direction *= -1;
      moveDown = true;
    }
    
    if (moveDown) {
      aliveEnemies.forEach(enemy => enemy.moveDown(this.config.dropDistance));
      this.speed *= 1.1; // Incrementar velocidad gradualmente
    }
  }
  
  draw(ctx, assets) {
    this.enemies.forEach(enemy => enemy.draw(ctx, assets));
  }
  
  getAliveEnemies() {
    return this.enemies.filter(enemy => enemy.alive);
  }
  
  allDestroyed() {
    return this.enemies.every(enemy => !enemy.alive);
  }
}

class Explosion {
  constructor(x, y, color = '#ffff00') {
    this.x = x;
    this.y = y;
    this.radius = 5;
    this.maxRadius = 25;
    this.alpha = 1;
    this.color = color;
    this.active = true;
  }
  
  update() {
    this.radius += 1.5;
    this.alpha -= 0.05;
    
    if (this.alpha <= 0 || this.radius >= this.maxRadius) {
      this.active = false;
    }
  }
  
  draw(ctx) {
    if (this.active) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    }
  }
}

class CollisionManager {
  static checkCollision(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }
}

class InputHandler {
  constructor() {
    this.keys = {};
  }
  
  bindEvents(game) {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      
      if (!game.gameRunning) return;
      
      switch(e.key) {
        case 'ArrowLeft':
          game.player.moveLeft();
          break;
        case 'ArrowRight':
          game.player.moveRight();
          break;
        case ' ':
          e.preventDefault();
          this.handleShoot(game);
          break;
      }
    });
    
    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
      
      if (!game.gameRunning) return;
      
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        game.player.stopMoving();
      }
    });
  }
  
  handleShoot(game) {
    // Limitar a un disparo por vez
    if (game.bullets.length === 0) {
      const bullet = game.player.shoot(game.config.bullet);
      game.bullets.push(bullet);
    }
  }
}

// Inicializar el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
});