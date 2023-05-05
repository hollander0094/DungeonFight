import { handleInput } from "./main.js";

class Sprite {
    constructor(game, x, y) {
        this.game = game;
        this.x = -886 + (x * 40);
        this.y = -604 + (y * 40);
        this.image = document.getElementById('tileset');
        this.speed = 1;
    }
    update(input) {
        handleInput(input, this);
    }
    draw(context) {
        context.drawImage(this.image, this.frameX, this.frameY, this.spriteWidth, this.spriteHeight, 
            this.x, this.y, this.spriteWidth * 2.5, this.spriteHeight * 2.5);
    }
}

export class Door extends Sprite{
    constructor(game, x, y) {
        super(game, x, y)
        this.state = 'closed';
        this.tile = this.game.tileObjects[`doors_leaf_${this.state}`];
        this.frameX = this.tile.Position.X;
        this.frameY = this.tile.Position.Y;
        this.spriteWidth = this.tile.Width;
        this.spriteHeight = this.tile.Height;
    }
}

export class DoorSwitch extends Sprite {
    constructor(game, x, y) {
        super(game, x, y);
        this.state = 'left';
        this.tile = this.game.tileObjects[`lever_${this.state}`];
        this.frameX = this.tile.Position.X;
        this.frameY = this.tile.Position.Y;
        this.spriteWidth = this.tile.Width;
        this.spriteHeight = this.tile.Height;
    }
}

export class Potion extends Sprite {
    constructor(game, x, y, color) { // = 'red' | 'green' | 'blue'
        super(game, x, y);
        this.color = color;
        this.tile = this.game.tileObjects[`flask_big_${this.color}`];
        this.frameX = this.tile.Position.X;
        this.frameY = this.tile.Position.Y;
        this.spriteWidth = this.tile.Width;
        this.spriteHeight = this.tile.Height;
    }
}