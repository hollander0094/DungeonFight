import { handleInput } from "./main.js";

export class Enemy {
    constructor(game, x, y, className, health, movementLocations) {
        this.game = game;
        this.x = -886 + (x * 40);
        this.y = -604 + (y * 40);
        this.initialX = this.x;
        this.initialY = this.y;
        this.fps = 10;
        this.frameInterval = 1000/this.fps;
        this.frameTimer = 0;
        this.class = className;
        this.state = 'idle';
        this.direction = 'right';
        this.frame = Math.floor(Math.random() * 3);
        this.maxFrame = 3;
        this.image = document.getElementById('tileset');
        this.tile = this.game.tileObjects[`${this.class}_${this.state}_anim_f${this.frame}`];
        this.frameX = this.tile.Position.X;
        this.frameY = this.tile.Position.Y;
        this.spriteWidth = this.tile.Width;
        this.spriteHeight = this.tile.Height;
        this.maxHealth = health;
        this.health = this.maxHealth;
        this.hittable = true;
        this.timer = 0;
        this.interval = Math.random() * 1000 + 200;
        this.alive = true;
        this.respawning = false;
        this.respawnTimer = 0;
        this.respawnInterval = 1000;
        this.speed = 1;
        this.healthBar = {
            x: this.x + 10,
            y: this.y + 7,
            width: (this.spriteWidth * 2.5 - 16) * (this.health / this.maxhealth),
            height: 3,
        }
        this.movementSpeed = (Math.random() * 1.25 + 0.75).toFixed(2);
        if (movementLocations) {
            this.movementLocations = movementLocations;
            this.currentMovementTargetIndex = 0
            this.movementTargetX = this.x + (movementLocations[this.currentMovementTargetIndex].directionX * 40);
            this.movementTargetY = this.y + (movementLocations[this.currentMovementTargetIndex].directionY * 40);
            this.vx = movementLocations[this.currentMovementTargetIndex].vx * this.movementSpeed;
            this.vy = movementLocations[this.currentMovementTargetIndex].vy * this.movementSpeed;
        }
    }
    update(input, deltaTime) {
        if (this.movementLocations) {
            if (
                    (this.vx > 0 && this.x < this.movementTargetX) ||
                    (this.vx < 0 && this.x > this.movementTargetX) ||
                    (this.vy > 0 && this.y < this.movementTargetY) ||
                    (this.vy < 0 && this.y > this.movementTargetY)
                ) {
                this.x += this.vx;
                this.y += this.vy;
            } else {
                if (this.currentMovementTargetIndex >= this.movementLocations.length -1) {
                    this.currentMovementTargetIndex = 0
                    this.movementTargetX = this.x + (this.movementLocations[this.currentMovementTargetIndex].directionX * 40);
                    this.movementTargetY = this.y + (this.movementLocations[this.currentMovementTargetIndex].directionY * 40);
                    this.vx = this.movementLocations[this.currentMovementTargetIndex].vx * this.movementSpeed;
                    this.vy = this.movementLocations[this.currentMovementTargetIndex].vy * this.movementSpeed;
                } else {
                    this.currentMovementTargetIndex++
                    this.movementTargetX = this.x + (this.movementLocations[this.currentMovementTargetIndex].directionX * 40);
                    this.movementTargetY = this.y + (this.movementLocations[this.currentMovementTargetIndex].directionY * 40);
                    this.vx = this.movementLocations[this.currentMovementTargetIndex].vx * this.movementSpeed;
                    this.vy = this.movementLocations[this.currentMovementTargetIndex].vy * this.movementSpeed;
                }
            }

        }
        // sprite animation
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            if (this.frame < this.maxFrame) {
                this.frame++;
                this.tile = this.game.tileObjects[`${this.class}_${this.state}_anim_f${this.frame}`];
                this.frameX = this.tile.Position.X;
                this.frameY = this.tile.Position.Y;
                this.spriteWidth = this.tile.Width;
                this.spriteHeight = this.tile.Height;        
            } else { 
                this.frame = 0;
                this.tile = this.game.tileObjects[`${this.class}_${this.state}_anim_f${this.frame}`];
                this.frameX = this.tile.Position.X;
                this.frameY = this.tile.Position.Y;
                this.spriteWidth = this.tile.Width;
                this.spriteHeight = this.tile.Height;      
            }
        } else {
            this.frameTimer += deltaTime;
        }
        this.healthBar = {...this.healthBar,
            x: this.x + 10,
            y: this.y + 7,
            width: (this.spriteWidth * 2.5 - 16) * (this.health / this.maxHealth),
        }
        handleInput(input, this);

        if (!this.alive && this.respawning) {
            if (this.respawnTimer > this.respawnInterval) {
                this.alive = true;
                this.health = this.maxHealth;
                this.respawnTimer = 0;
                this.interval = Math.random() * 1000 + 200;
            } else {
                this.respawnTimer += deltaTime;
            }
        }
    }
    draw(context) {
        if (this.alive) {
            if (this.direction === 'left') {
                context.save();
                context.translate(this.x + this.spriteWidth * 2.5, this.y);
                context.scale(-1, 1);
                context.drawImage(this.image, this.frameX, this.frameY, this.spriteWidth, this.spriteHeight,
                    0, 0, this.spriteWidth * 2.5, this.spriteHeight * 2.5);
                context.restore();
            } else {
                if (this.game.debug) {
                    //draw hitbox
                    context.strokeStyle = 'red'
                    context.strokeRect(this.x + 5, this.y + (this.spriteHeight * 1), this.spriteWidth * 2, this.spriteHeight * 2)
                }
    
                //draw enemy
                context.drawImage(this.image, this.frameX, this.frameY, this.spriteWidth, this.spriteHeight, 
                    this.x, this.y, this.spriteWidth * 2.5, this.spriteHeight * 2.5);
                context.save();
                context.fillStyle = 'red';
                context.shadowOffsetX = -1;
                context.shadowOffsetY = -1;
                context.shadowColor = 'black';        
                context.fillRect(this.healthBar.x, this.healthBar.y, this.healthBar.width, this.healthBar.height);
                context.restore();
            }
        }
    }

    setState(state, speed) {
        this.currentState = this.states[state];
        this.game.speed = this.game.maxSpeed * speed;
        this.currentState.enter();
    }
}
