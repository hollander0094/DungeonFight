import { handleInput } from "./main.js";

class Layer {
    constructor(game, width, height, image) {
        this.game = game;
        this.width = width;
        this.height = height;
        this.image = image;
        this.x = -886;
        this.y = -604;
        this.speed = 1;
    }
    update(input) {
        handleInput(input, this);
    }
    draw(context) {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

export class Background {
    constructor(game) {
        this.game = game;
        this.width = 2560;
        this.height = 1800;
        this.layer1image = document.getElementById('layer1');
        this.layer1 = new Layer(this.game, this.width, this.height, this.layer1image)
        this.backgroundLayers = [this.layer1]
        this.moving = true;
    }
    update(input) {
        if (this.moving === true) {
            this.backgroundLayers.forEach((layer) => {
                layer.update(input);
            })
        }
    }
    draw(context) {
        this.backgroundLayers.forEach((layer) => {
            layer.draw(context);
        })
    }
}

export class Foreground {
    constructor(game) {
        this.game = game;
        this.width = 2560;
        this.height = 1800;
        this.layer1image = document.getElementById('foreground');
        this.layer1 = new Layer(this.game, this.width, this.height, this.layer1image)
        this.backgroundLayers = [this.layer1]
        this.moving = true;
    }
    update(input) {
        if (this.moving === true) {
            this.backgroundLayers.forEach((layer) => {
                layer.update(input);
            })
        }
    }
    draw(context) {
        this.backgroundLayers.forEach((layer) => {
            layer.draw(context);
        })
    }
}
