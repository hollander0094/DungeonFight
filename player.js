import { RunningLeft, RunningRight, Hit, IdleLeft, IdleRight } from "./playerStates.js";

export class Player {
    constructor(game, className, weapon) {
        this.game = game;
        this.x = this.game.width / 2;
        this.y = this.game.height /2;
        this.fps = 10;
        this.frameInterval = 1000/this.fps;
        this.frameTimer = 0;
        this.class = className;
        this.gender = 'm';
        this.state = 'idle';
        this.direction = 'right';
        this.frame = 0;
        this.maxFrame = 3;
        this.image = document.getElementById('tileset');
        this.tile = this.game.tileObjects[`${this.class}_${this.gender}_${this.state}_anim_f${this.frame}`];
        this.frameX = this.tile.Position.X;
        this.frameY = this.tile.Position.Y;
        this.spriteWidth = this.tile.Width;
        this.spriteHeight = this.tile.Height;
        this.states = [new IdleLeft(this.game), new IdleRight(this.game), new RunningLeft(this.game), new RunningRight(this.game), new Hit(this.game)];
        this.currentState = null;
        this.weapon = weapon;
        this.weaponHitBox = {
            xRight: this.x + (this.spriteWidth * 2.5 / 2),
            yRight: this.y + (this.spriteHeight * 2.5) - 14,
            xLeft: (this.spriteWidth * 2.5 / 2),
            yLeft: (this.spriteHeight * 2.5) - 14,
            xLeftOffset: this.x + this.spriteWidth * 2.5,
            yLeftOffset: this.y,
            width: 35,
            height: 10,
        };
        this.health = 10;
        this.speed = 1;
        this.lives = [new Life(this.game, 'full'), new Life(this.game, 'full'), new Life(this.game, 'full'), new Life(this.game, 'full'), new Life(this.game, 'full')];
        this.score = 0;

    }
    update(input, deltaTime) {
        this.currentState.handleInput(input, deltaTime);
        // weapon animation
        if (((this.frameTimer * 1.5) > this.frameInterval) && this.weapon.attacking) {
            if (this.weapon.frame < this.maxFrame) {
                this.weapon.frame++;
                this.weapon.currentFrame = this.weapon.coords[this.weapon.frame];
                this.weapon.angle = this.weapon.currentFrame[0];
                this.weapon.offsetX = this.weapon.currentFrame[1];
                this.weapon.offsetY = this.weapon.currentFrame[2];
            } else {
                this.weapon.frame = 0;
                this.weapon.currentFrame = this.weapon.coords[this.weapon.frame];
                this.weapon.angle = this.weapon.currentFrame[0];
                this.weapon.offsetX = this.weapon.currentFrame[1];
                this.weapon.offsetY = this.weapon.currentFrame[2];
                if (!input.includes(' ')) {
                    this.weapon.attacking = false;
                }
            }
        }
        // sprite animation
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            if (this.frame < this.maxFrame) {
                this.frame++;
                this.tile = this.game.tileObjects[`${this.class}_${this.gender}_${this.state}_anim_f${this.frame}`];
                this.frameX = this.tile.Position.X;
                this.frameY = this.tile.Position.Y;
                this.spriteWidth = this.tile.Width;
                this.spriteHeight = this.tile.Height;        
            } else this.frame = 0;
                this.tile = this.game.tileObjects[`${this.class}_${this.gender}_${this.state}_anim_f${this.frame}`];
                this.frameX = this.tile.Position.X;
                this.frameY = this.tile.Position.Y;
                this.spriteWidth = this.tile.Width;
                this.spriteHeight = this.tile.Height;
        } else {
            this.frameTimer += deltaTime;
        }
    }
    draw(context) {
        if (this.direction === 'left') {
            context.save();
            context.translate(this.x + this.spriteWidth * 2.5, this.y);
            context.scale(-1, 1);
            //draw player hitbox
            if (this.game.debug) {
                context.strokeStyle = 'red';
                context.strokeRect(0, 0 + (this.spriteHeight * 1.2), this.spriteWidth * 2.5, this.spriteHeight * 1.5);
                context.fillStyle = 'red';
                context.fillRect(this.weaponHitBox.xLeft, this.weaponHitBox.yLeft, this.weaponHitBox.width, this.weaponHitBox.height);
    
            }
            context.drawImage(this.image, this.frameX, this.frameY, this.spriteWidth, this.spriteHeight,
                0, 0, this.spriteWidth * 2.5, this.spriteHeight * 2.5);


            context.translate(this.spriteWidth * 2.5 + this.weapon.offsetX, this.spriteHeight * 1.85 + this.weapon.offsetY);
            context.rotate(this.weapon.angle);
            this.weapon.draw(context, 0, 0, this.weapon.scale, this.weapon.scale);
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.restore();

        } else {
            //draw player hitbox
            if (this.game.debug) {
                context.strokeStyle = 'red';
                context.strokeRect(this.x, this.y + (this.spriteHeight * 1.2), this.spriteWidth * 2.5, this.spriteHeight * 1.5);
                context.fillStyle = 'red';
                context.fillRect(this.weaponHitBox.xRight, this.weaponHitBox.yRight, this.weaponHitBox.width, this.weaponHitBox.height);    
            }
            
            //draw player
            context.drawImage(this.image, this.frameX, this.frameY, this.spriteWidth, this.spriteHeight, 
                this.x, this.y, this.spriteWidth * 2.5, this.spriteHeight * 2.5);

            //draw weapon
            context.save();
            context.translate(this.x + (this.spriteWidth * 2.5) + this.weapon.offsetX, this.y + (this.spriteHeight * 2.5) / 1.35 + this.weapon.offsetY);
            context.rotate(this.weapon.angle);
            this.weapon.draw(context, 0, 0, this.weapon.scale, this.weapon.scale);
            context.restore();
        }
    }
    setState(state, speed) {
        let previousState = this.currentState.state;
        this.currentState = this.states[state];
        this.game.speed = this.game.maxSpeed * speed;
        this.currentState.enter(previousState);
    }
}

export class Weapon {
    constructor(game, playerClass) {
        this.image = document.getElementById('tileset');
        this.tile = game.tileObjects[playerClass.weaponSpriteName];
        this.frameX = this.tile.Position.X;
        this.frameY = this.tile.Position.Y;
        this.spriteWidth = this.tile.Width;
        this.spriteHeight = this.tile.Height;
        this.attacking = false;
        this.coords = playerClass.weaponCoords;
        this.frame = 0
        this.maxFrame = 5;
        this.currentFrame = this.coords[this.frame];
        this.angle = this.currentFrame[0];
        this.offsetX = this.currentFrame[1];
        this.offsetY = this.currentFrame[2];
        this.scale = playerClass.weaponScale;
        this.damage = 10;
    }
    draw(context, x, y, widthModifier, heightModifier) {
        context.drawImage(this.image, this.frameX, this.frameY, this.spriteWidth, this.spriteHeight, 
            x, y, this.spriteWidth * widthModifier, this.spriteHeight * heightModifier);
    }

}

export class Life {
    constructor(game, type) {
        this.game = game;
        this.type = type;
        this.image = document.getElementById('tileset');
        this.tile = game.tileObjects[`ui_heart_${this.type}`];
        this.frameX = this.tile.Position.X;
        this.frameY = this.tile.Position.Y;
        this.spriteWidth = this.tile.Width;
        this.spriteHeight = this.tile.Height;

    }
    draw(context, x, y) {
        context.drawImage(this.image, this.frameX, this.frameY, this.spriteWidth, this.spriteHeight, 
            x, y, this.spriteWidth * 2.5, this.spriteHeight * 2.5);
    }
    setToHalf() {
        this.type = 'half';
        this.tile = this.game.tileObjects[`ui_heart_${this.type}`];
        this.frameX = this.tile.Position.X;
        this.frameY = this.tile.Position.Y;
        this.spriteWidth = this.tile.Width;
        this.spriteHeight = this.tile.Height;
    }
}
