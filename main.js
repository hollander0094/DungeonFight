import { Player, Weapon, Life } from "./player.js";
import { InputHandler } from "./input.js";
import { Background, Foreground } from "./background.js";
import { Door, DoorSwitch, Potion } from "./items.js";
import { tile_list } from "./tile_list.js";
import { collisions } from "./collisions.js";
import { Enemy } from "./enemy.js";
import { states } from "./playerStates.js";

window.addEventListener('load', function() {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1024;
    canvas.height = 720;
    
    let tileObjects = {};
    tile_list.forEach((tileInfo) => {
        const tileData = tileInfo.split(' ');
        tileObjects[tileData[0]] = {
                Position: {
                    X: Number(tileData[1]),
                    Y: Number(tileData[2]),
                },
                Width: Number(tileData[3]),
                Height: Number(tileData[4])
            };
    });

    const collisionsMap = [];
    for (let i = 0; i < collisions.length; i += 64) {
        collisionsMap.push(collisions.slice(i, 64 + i))
    }

    class Boundary {
        constructor(x, y) {
    
            this.x = -886 + x;
            this.y = -604 + y;
            this.width = 40;
            this.height = 40;
            this.speed = 1;
        }
        update(input) {
            handleInput(input, this);
        }
        draw(context) {
            context.fillStyle = 'black'
            context.fillRect(this.x, this.y, this.width, this.height)
        }
    }

    let boundaries = [];
    collisionsMap.forEach((row, i) => {
        row.forEach((symbol, j) => {
            if (symbol === 2049) {
                boundaries.push(new Boundary((j * 40), (i * 40)))
            }
        })
    })

    function rectangularCollision(rectangle1, rectangle2) {
        return (rectangle1.x + (rectangle1.spriteWidth * 2.5) >= rectangle2.x &&
                rectangle1.x <= rectangle2.x + rectangle2.width &&
                rectangle1.y + rectangle1.spriteHeight * 1.2  <= rectangle2.y + rectangle2.height &&
                rectangle1.y + rectangle1.spriteHeight + (rectangle1.spriteHeight * 1.75) >= rectangle2.y)
    }

    function spriteCollision(rectangle1, rectangle2) {
        return (rectangle1.x + (rectangle1.spriteWidth * 2.5) >= rectangle2.x + 5 &&
                rectangle1.x <= rectangle2.x + 5 + rectangle2.spriteWidth * 2 &&
                rectangle1.y + (rectangle1.spriteHeight * 1.2)  <= (rectangle2.y + rectangle2.spriteHeight) + rectangle2.spriteHeight * 2 &&
                rectangle1.y + (rectangle1.spriteHeight * 1.2) + rectangle1.spriteHeight * 1.5 >= rectangle2.y + rectangle2.spriteHeight)
    }

    const classTiles = [
        {
            name: 'Knight',
            spriteName: 'knight',
            weaponSpriteName: 'weapon_lavish_sword',
            weaponCoords: [[-30, 15, -5], [0, -20, -20], [-50, -15, -20], [-100, -12, -20], [70, -5, -5] ],
            weaponScale: 1.3,
            x: canvas.width / 2 - 140,
            y: canvas.height / 2,
            textX: canvas.width / 2 - 132,
            textY: canvas.height / 2 + 25,
            width: 80,
            height: 40,
            color: 'white'
        },
        {
            name: 'Wizard',
            spriteName: 'wizzard',
            weaponSpriteName: 'weapon_green_magic_staff',
            weaponCoords: [[-30, 16, 0], [0, -25, -16], [-50, -20, -16], [-100, -17, -15], [70, -10, -10] ],
            weaponScale: 1.25,
            x: canvas.width / 2 - 40,
            y: canvas.height / 2,
            textX: canvas.width / 2 - 32,
            textY: canvas.height / 2 + 25,
            width: 80,
            height: 40,
            color: 'white'
        },
        {
            name: 'Elf',
            spriteName: 'elf',
            weaponSpriteName: 'weapon_red_gem_sword',
            weaponCoords: [[-30, 10, -9], [0, -25, -16], [-50, -20, -16], [-100, -17, -15], [70, -10, -10] ],
            weaponScale: 1.5,
            x: canvas.width / 2 + 60,
            y: canvas.height / 2,
            textX: canvas.width / 2 + 82,
            textY: canvas.height / 2 + 25,
            width: 80,
            height: 40,
            color: 'white'
        },
        {
            name: 'Dwarf',
            spriteName: 'dwarf',
            weaponSpriteName: 'weapon_throwing_axe',
            weaponCoords: [[-30, 10, -9], [0, -25, -16], [-50, -20, -16], [-100, -17, -15], [70, -10, -10] ],
            weaponScale: 1.5,
            x: canvas.width / 2 - 80,
            y: canvas.height / 2 + 70,
            textX: canvas.width / 2 - 70,
            textY: canvas.height / 2 + 95,
            width: 80,
            height: 40,
            color: 'white'
        },
        {
            name: 'Dino',
            spriteName: 'lizard',
            weaponSpriteName: 'weapon_double_axe',
            weaponCoords: [[-30, 10, -9], [0, -25, -16], [-50, -20, -16], [-100, -17, -15], [70, -10, -10] ],
            weaponScale: 1.5,
            x: canvas.width / 2 + 20,
            y: canvas.height / 2 + 70,
            textX: canvas.width / 2 + 37,
            textY: canvas.height / 2 + 95,
            width: 80,
            height: 40,
            color: 'white'
        }
    ];

    let activeTile = undefined
    let chosenClass = undefined
    const mouse = {
        x: undefined,
        y: undefined
    }
    canvas.addEventListener('click', (event) => {
        if (activeTile) {
            chosenClass = activeTile
        }
    });

    canvas.addEventListener('mousemove', (event) => {
        mouse.rect = canvas.getBoundingClientRect();
        mouse.x = (event.clientX - mouse.rect.left) / (mouse.rect.width / canvas.width)
        mouse.y = (event.clientY - mouse.rect.top) / (mouse.rect.height / canvas.height)
        mouse.event = event
        
        activeTile = null
        for (let i = 0; i < classTiles.length; i++) {
            const tile = classTiles[i]
            tile.color = 'white';
            if (
            mouse.x > tile.x -3 &&
            mouse.x < tile.x + tile.width + 6 &&
            mouse.y > tile.y -3 &&
            mouse.y < tile.y + tile.height + 6
            ) {
            tile.color = 'red';
            activeTile = tile
            break
            }
        }
    });

    class Game {
        constructor(width, height, tileObjects) {
            this.width = width;
            this.height = height;
            this.tileObjects = tileObjects;
            this.player = new Player(this, 'elf', new Weapon(this, classTiles[2]));
            this.enemies = [//topright space (easy)
                            //Testing enemy
                            new Enemy(this, 36, 24, 'imp', 20, [
                                {directionX: 0, directionY: 0, vx: 0, vy: 0}, 
                            ]),

                            new Enemy(this, 40, 22, 'tiny_zombie', 20, [
                                {directionX: 0, directionY: 1, vx: 0, vy: 1}, 
                                {directionX: 0, directionY: -1, vx: 0, vy: -1}
                            ]),
                            new Enemy(this, 45, 23, 'goblin', 20, [
                                {directionX: 0, directionY: -1, vx: 0, vy: -1}, 
                                {directionX: 0, directionY: 1, vx: 0, vy: 1}
                            ]),
                            new Enemy(this, 48, 20, 'imp', 30, [
                                {directionX: 2, directionY: 0, vx: 1, vy: 0}, 
                                {directionX: -2, directionY: 0, vx: -1, vy: 0}
                            ]),
                            new Enemy(this, 50, 23, 'tiny_zombie', 20, [
                                {directionX: -2, directionY: 0, vx: -1, vy: 0}, 
                                {directionX: 2, directionY: 0, vx: 1, vy: 0}
                            ]),
                            new Enemy(this, 50, 17, 'goblin', 20, [
                                {directionX: -2, directionY: 0, vx: -1, vy: 0}, 
                                {directionX: 2, directionY: 0, vx: 1, vy: 0}
                            ]),
                            new Enemy(this, 50, 8, 'tiny_zombie', 20, [
                                {directionX: 0, directionY: 3.5, vx: 0, vy: 1}, 
                                {directionX: -2, directionY: 0, vx: -1, vy: 0},
                                {directionX: 2, directionY: 0, vx: 1, vy: 0},
                                {directionX: 0, directionY: -3.5, vx: 0, vy: -1}, 
                            ]),
                            new Enemy(this, 50, 6, 'imp', 30, [
                                {directionX: 0, directionY: 1, vx: 0, vy: 1}, 
                                {directionX: 1, directionY: 0, vx: 1, vy: 0},
                                {directionX: 0, directionY: -1, vx: 0, vy: -1},
                                {directionX: -1, directionY: 0, vx: -1, vy: 0}, 
                            ]),
                            new Enemy(this, 52, 6, 'goblin', 20, [
                                {directionX: 3, directionY: 0, vx: 1, vy: 0}, 
                                {directionX: -3, directionY: 0, vx: -1, vy: 0}
                            ]),
                            new Enemy(this, 57, 7, 'angel', 30, [
                                {directionX: 0, directionY: -2, vx: 0, vy: -1}, 
                                {directionX: 0, directionY: 2, vx: 0, vy: 1}
                            ]),
                            new Enemy(this, 59, 5, 'angel', 30, [
                                {directionX: 0, directionY: 2, vx: 0, vy: 1}, 
                                {directionX: 0, directionY: -2, vx: 0, vy: -1}
                            ]),
                            new Enemy(this, 61, 7, 'angel', 30,[
                                {directionX: 0, directionY: -2, vx: 0, vy: -1}, 
                                {directionX: 0, directionY: 2, vx: 0, vy: 1}
                            ]),
                            new Enemy(this, 60, 14, 'big_zombie', 100, [
                                {directionX: 0, directionY: -1, vx: 0, vy: -0.75}, 
                                {directionX: -1, directionY: 0, vx: -0.75, vy: 0},
                                {directionX: 0, directionY: 1, vx: 0, vy: 0.75},
                                {directionX: 1, directionY: 0, vx: 0.75, vy: 0}, 
                            ]),
                            new Enemy(this, 58, 24, 'big_zombie', 100, [
                                {directionX: -1, directionY: 0, vx: -0.75, vy: 0}, 
                                {directionX: 0, directionY: -1, vx: 0, vy: -0.75},
                                {directionX: 1, directionY: 0, vx: 0.75, vy: 0},
                                {directionX: 0, directionY: 1, vx: 0, vy: 0.75}, 
                            ]),
                            //bottomright room (easy 2)
                            new Enemy(this, 46, 32.25, 'goblin', 20, [
                                {directionX: 2, directionY: 0, vx: 1, vy: 0}, 
                                {directionX: -2, directionY: 0, vx: -1, vy: 0}
                            ]),
                            new Enemy(this, 53, 33, 'goblin', 20, [
                                {directionX: -2, directionY: 0, vx: -1, vy: 0}, 
                                {directionX: 2, directionY: 0, vx: 1, vy: 0}
                            ]),
                            new Enemy(this, 47.25, 33.75, 'big_zombie', 100, [
                                {directionX: 1, directionY: 0, vx: 0.75, vy: 0}, 
                                {directionX: -1, directionY: 0, vx: -0.75, vy: 0}
                            ]),
                            new Enemy(this, 51.5, 34, 'big_zombie', 100, [
                                {directionX: -1, directionY: 0, vx: -0.75, vy: 0}, 
                                {directionX: 1, directionY: 0, vx: 0.75, vy: 0}
                            ]),
                            new Enemy(this, 47, 37.25, 'goblin', 20,[
                                {directionX: 1, directionY: 0, vx: 1, vy: 0}, 
                                {directionX: -1, directionY: 0, vx: -1, vy: 0}
                            ]),
                            new Enemy(this, 50, 36.5, 'imp', 30, [
                                {directionX: 0, directionY: -3, vx: 0, vy: -1},
                                {directionX: 0, directionY: 3, vx: 0, vy: 1}
                            ]),
                            new Enemy(this, 53, 37, 'goblin', 20, [
                                {directionX: -1, directionY: 0, vx: -1, vy: 0}, 
                                {directionX: 1, directionY: 0, vx: 1, vy: 0}
                            ]),
                            new Enemy(this, 47, 39, 'big_zombie', 100, [
                                {directionX: 1, directionY: 0, vx: 0.75, vy: 0}, 
                                {directionX: -1, directionY: 0, vx: -0.75, vy: 0}
                            ]),
                            new Enemy(this, 50, 40, 'goblin', 20, [
                                {directionX: 0, directionY: 2, vx: 0, vy: 1}, 
                                {directionX: 0, directionY: -2, vx: 0, vy: -1}
                            ]),
                            new Enemy(this, 52, 39, 'big_zombie', 100, [
                                {directionX: -1, directionY: 0, vx: -0.75, vy: 0}, 
                                {directionX: 1, directionY: 0, vx: 0.75, vy: 0}
                            ]),
                            //bottomleft room (medium)
                            new Enemy(this, 22, 24, 'masked_orc', 40, [
                                {directionX: 0, directionY: -1, vx: 0, vy: -1}, 
                                {directionX: 0, directionY: 1, vx: 0, vy: 1}
                            ]),
                            new Enemy(this, 19, 23, 'orc_warrior', 40, [
                                {directionX: 1, directionY: 0, vx: 1, vy: 0}, 
                                {directionX: -1, directionY: 0, vx: -1, vy: 0}
                            ]),
                            new Enemy(this, 16, 22, 'orc_shaman', 20, [
                                {directionX: 1, directionY: 0, vx: 1, vy: 0}, 
                                {directionX: 0, directionY: -1, vx: 0, vy: -1},
                                {directionX: -1, directionY: 0, vx: -1, vy: 0},
                                {directionX: 0, directionY: 1, vx: 0, vy: 1}, 
                            ]),
                            new Enemy(this, 16, 32, 'pumpkin_dude', 50, [
                                {directionX: 0, directionY: -2, vx: 0, vy: -1}, 
                                {directionX: 2, directionY: 0, vx: 1, vy: 0},
                                {directionX: 0, directionY: 2, vx: 0, vy: 1},
                                {directionX: -2, directionY: 0, vx: -1, vy: 0}, 
                            ]),
                            new Enemy(this, 18, 34, 'orc_warrior', 40, [
                                {directionX: -2, directionY: 0, vx: -1, vy: 0}, 
                                {directionX: 2, directionY: 0, vx: 1, vy: 0}
                            ]),
                            new Enemy(this, 18, 38, 'masked_orc', 40, [
                                {directionX: -1, directionY: 0, vx: -0.75, vy: 0}, 
                                {directionX: 1, directionY: 0, vx: 0.75, vy: 0}
                            ]),
                            new Enemy(this, 15, 39, 'orc_shaman', 50, [
                                {directionX: 0, directionY: -2, vx: 0, vy: -1}, 
                                {directionX: 0, directionY: 2, vx: 0, vy: 1}
                            ]),
                            new Enemy(this, 11, 39, 'ogre', 150, [
                                {directionX: 0, directionY: -2, vx: 0, vy: -0.75}, 
                                {directionX: 0, directionY: 2, vx: 0, vy: 0.75}
                            ]),
                            new Enemy(this, 9, 25, 'pumpkin_dude', 50, [
                                {directionX: 0, directionY: -3, vx: 0, vy: -1}, 
                                {directionX: 0, directionY: 3, vx: 0, vy: 1}
                            ]),
                            new Enemy(this, 6, 22, 'ogre', 150, [
                                {directionX: -1, directionY: 0, vx: -0.75, vy: 0}, 
                                {directionX: 1, directionY: 0, vx: 0.75, vy: 0}
                            ]),
                            new Enemy(this, 5, 24, 'ogre', 150, [
                                {directionX: 1, directionY: 0, vx: 0.75, vy: 0}, 
                                {directionX: -1, directionY: 0, vx: -0.75, vy: 0}
                            ]),
                            //topleft and top-middle (hard)
                            new Enemy(this, 38, 15, 'doc', 75, [
                                {directionX: -2, directionY: 0, vx: -1, vy: 0}, 
                                {directionX: 2, directionY: 0, vx: 1, vy: 0}
                            ]),
                            new Enemy(this, 34, 15, 'doc', 75, [
                                {directionX: 0, directionY: 1, vx: 0, vy: 1}, 
                                {directionX: 0, directionY: -1, vx: 0, vy: -1}
                            ]),
                            new Enemy(this, 31, 13, 'chort', 60, [
                                {directionX: 1, directionY: 0, vx: 1, vy: 0}, 
                                {directionX: 0, directionY: -2, vx: 0, vy: -1},
                                {directionX: -1, directionY: 0, vx: -1, vy: 0},
                                {directionX: 0, directionY: 2, vx: 0, vy: 1}, 
                            ]),
                            new Enemy(this, 18, 11, 'chort', 60, [
                                {directionX: -1, directionY: 0, vx: -1, vy: 0}, 
                                {directionX: 1, directionY: 0, vx: 1, vy: 0}
                            ]),
                            new Enemy(this, 12, 11, 'chort', 60, [
                                {directionX: 2, directionY: 0, vx: 1, vy: 0}, 
                                {directionX: -2, directionY: 0, vx: -1, vy: 0}
                            ]),
                            new Enemy(this, 15, 9, 'wogol', 60, [
                                {directionX: -2, directionY: 0, vx: -1, vy: 0}, 
                                {directionX: 2, directionY: 0, vx: 1, vy: 0}
                            ]),
                            new Enemy(this, 9, 10, 'doc', 75,[
                                {directionX: 2, directionY: 0, vx: 1, vy: 0}, 
                                {directionX: -2, directionY: 0, vx: -1, vy: 0}
                            ]),
                            new Enemy(this, 14, 5, 'chort', 60, [
                                {directionX: 0, directionY: 2, vx: 0, vy: 1}, 
                                {directionX: 0, directionY: -2, vx: 0, vy: -1}
                            ]),
                            new Enemy(this, 12, 6, 'doc', 75, [
                                {directionX: 0, directionY: 3, vx: 0, vy: 1}, 
                                {directionX: 0, directionY: -3, vx: 0, vy: -1}
                            ]),
                            new Enemy(this, 9, 7, 'wogol', 60, [
                                {directionX: 0, directionY: 2, vx: 0, vy: 1}, 
                                {directionX: 0, directionY: -2, vx: 0, vy: -1}
                            ]),
                            new Enemy(this, 7, 4, 'chort', 60, [
                                {directionX: 2, directionY: 0, vx: 1, vy: 0}, 
                                {directionX: -2, directionY: 0, vx: -1, vy: 0}
                            ]),
                            new Enemy(this, 35, 3, 'big_demon', 200, [
                                {directionX: -6, directionY: 0, vx: -0.75, vy: 0}, 
                                {directionX: 6, directionY: 0, vx: 0.75, vy: 0}
                            ])];
            this.background = new Background(this);
            this.foreground = new Foreground(this);
            this.doors = [new Door(this, 31, 5), new Door(this, 49, 12)]
            this.doorBoundaries = [new Boundary((31 * 40), (6 * 40)), new Boundary((32 * 40), (6 * 40)), new Boundary((49 * 40), (13 * 40)), new Boundary((50 * 40), (13 * 40))];
            this.doorSwitch = new DoorSwitch(this, 48, 14);
            this.healthPotions = [new Potion(this, 48, 11, 'red'), new Potion(this, 61, 10, 'red'), new Potion(this, 49, 38, 'red'),
                                    new Potion(this, 15, 36, 'red'), new Potion(this, 32, 8, 'red')];
            this.attackPotions = [new Potion(this, 57, 24, 'blue'), new Potion(this, 39, 32, 'blue'), new Potion(this, 36, 14, 'blue'),
                                    new Potion(this, 11, 4, 'blue'), new Potion(this, 18, 40, 'blue')];
            this.speedPotions = [new Potion(this, 49, 22, 'green'), new Potion(this, 3, 26, 'green')];
            this.input = new InputHandler(this);
            this.speed = 0;
            this.maxSpeed = 3;
            this.player.currentState = this.player.states[1];
            this.player.currentState.enter();
            this.movables = [this.background, this.foreground, ...boundaries, ...this.doorBoundaries,
                            ...this.enemies, ...this.doors, this.doorSwitch, ...this.healthPotions,  ...this.attackPotions, ...this.speedPotions];
            this.renderables = [this.background, ...this.enemies, ...this.doors,  this.doorSwitch, 
                            ...this.healthPotions, ...this.attackPotions, ...this.speedPotions, this.player, this.foreground];
            this.moving = true;
            this.gameOver = false;
            this.debug = false;
            this.gameSetup = true;
        }
        update(deltaTime) {
            if (this.gameOver) {
                this.moving = false;    
            } else if (this.gameSetup) {
                this.moving = false;
                if (chosenClass) {
                    this.player = new Player(this, chosenClass.spriteName, new Weapon(game, chosenClass));
                    this.player.currentState = this.player.states[1];
                    this.player.currentState.enter();
                    this.gameSetup = false;
                    this.moving = true;
                    this.renderables = [this.background, ...this.enemies, ...this.doors,  this.doorSwitch, 
                        ...this.healthPotions, ...this.attackPotions, ...this.speedPotions, this.player, this.foreground];
                }
            } else {
                this.moving = true;
                if (this.input.keys.includes('ArrowUp')) {
                    if (!this.player.weapon.attacking) {
                        this.enemies.forEach((enemy) => {
                            if (spriteCollision(this.player, {...enemy, x: enemy.x - 3,
                                    y: enemy.y - 3}) && enemy.alive
                            ) {
                                console.log('Player hit by enemy!')
                                if (this.player.currentState.state !== 'HIT') {
                                    this.player.setState(states.HIT, 0);
                                    if (this.player.lives[this.player.lives.length -1].type === 'full') {
                                        this.player.lives[this.player.lives.length -1].setToHalf();
                                    } else {
                                        this.player.lives.splice(-1, 1)
                                    }
                                }
            
                            }
        
                        })
                    }
                    for (let i = 0; i < boundaries.length; i++) {
                        const boundary = boundaries[i]
                        if (rectangularCollision(this.player, {...boundary, x: boundary.x,
                                y: boundary.y + 3})
                        ) {
                        this.moving = false
                        break;
                        }
                    }
                    for (let i = 0; i < this.doorBoundaries.length; i++) {
                        const boundary = this.doorBoundaries[i]
                        if (rectangularCollision(this.player, {...boundary, x: boundary.x,
                                y: boundary.y + 3})
                        ) {
                        this.moving = false
                        break;
                        }
                    }
                } else if (this.input.keys.includes('ArrowLeft')) {
                    if (!this.player.weapon.attacking) {
                        this.enemies.forEach((enemy) => {
                            if (spriteCollision(this.player, {...enemy, x: enemy.x + 3,
                                    y: enemy.y})  && enemy.alive
                            ) {
                                console.log('Player hit by enemy!')
                                if (this.player.currentState.state !== 'HIT') {
                                    this.player.setState(states.HIT, 0);
                                    if (this.player.lives[this.player.lives.length -1].type === 'full') {
                                        this.player.lives[this.player.lives.length -1].setToHalf();
                                    } else {
                                        this.player.lives.splice(-1, 1)
                                    }
                                }
            
                            }
        
                        })
                    }
                    for (let i = 0; i < boundaries.length; i++) {
                        const boundary = boundaries[i]
                        if (rectangularCollision(this.player, {...boundary, x: boundary.x + 3,
                                y: boundary.y})
                        ) {
                        this.moving = false
                        break;
                        }
                    }
                    for (let i = 0; i < this.doorBoundaries.length; i++) {
                        const boundary = this.doorBoundaries[i]
                        if (rectangularCollision(this.player, {...boundary, x: boundary.x + 3,
                                y: boundary.y})
                        ) {
                        this.moving = false
                        break;
                        }
                    }
                } else if (this.input.keys.includes('ArrowDown')) {
                    if (!this.player.weapon.attacking) {
                        this.enemies.forEach((enemy) => {
                            if (spriteCollision(this.player, {...enemy, x: enemy.x,
                                    y: enemy.y - 3}) && enemy.alive
                            ) {
                                console.log('Player hit by enemy!')
                                if (this.player.currentState.state !== 'HIT') {
                                    this.player.setState(states.HIT, 0);
                                    if (this.player.lives[this.player.lives.length -1].type === 'full') {
                                        this.player.lives[this.player.lives.length -1].setToHalf();
                                    } else {
                                        this.player.lives.splice(-1, 1)
                                    }
                                }
            
                            }
        
                        })
                    }
                    for (let i = 0; i < boundaries.length; i++) {
                        const boundary = boundaries[i]
                        if (rectangularCollision(this.player, {...boundary, x: boundary.x,
                                y: boundary.y - 3})
                        ) {
                        this.moving = false
                        break;
                        }
                    }
                    for (let i = 0; i < this.doorBoundaries.length; i++) {
                        const boundary = this.doorBoundaries[i]
                        if (rectangularCollision(this.player, {...boundary, x: boundary.x,
                                y: boundary.y - 3})
                        ) {
                        this.moving = false
                        break;
                        }
                    }  
                } else if (this.input.keys.includes('ArrowRight')) {
                    if (!this.player.weapon.attacking) {
                        this.enemies.forEach((enemy) => {
                            if (spriteCollision(this.player, {...enemy, x: enemy.x - 3,
                                    y: enemy.y}) && enemy.alive
                            ) {
                                console.log('Player hit by enemy!')
                                if (this.player.currentState.state !== 'HIT') {
                                    this.player.setState(states.HIT, 0);
                                    if (this.player.lives[this.player.lives.length -1].type === 'full') {
                                        this.player.lives[this.player.lives.length -1].setToHalf();
                                    } else {
                                        this.player.lives.splice(-1, 1)
                                    }
                                }
            
                            }
        
                        })
                    }
                    for (let i = 0; i < boundaries.length; i++) {
                        const boundary = boundaries[i]
                        if (rectangularCollision(this.player, {...boundary, x: boundary.x - 3,
                                y: boundary.y})
                        ) {
                            this.moving = false
                            break;
                        }
                    }
                    for (let i = 0; i < this.doorBoundaries.length; i++) {
                        const boundary = this.doorBoundaries[i]
                        if (rectangularCollision(this.player, {...boundary, x: boundary.x - 3,
                                y: boundary.y})
                        ) {
                            this.moving = false
                            break;
                        }
                    }
                }
            }
            if (this.player.lives.length === 0) {
                this.gameOver = true;
            }
            if (this.player.weapon.attacking) {
                this.enemies.forEach((enemy, index) => {
                    if (((this.player.direction === 'right' &&  rectangularCollision({...enemy, x: enemy.x - 3, y: enemy.y}, 
                        {...this.player.weaponHitBox, x: this.player.weaponHitBox.xRight, y: this.player.weaponHitBox.yRight})
                    ) || (this.player.direction === 'left' &&  rectangularCollision({...enemy, x: enemy.x - 3, y: enemy.y}, 
                        {...this.player.weaponHitBox, x: this.player.weaponHitBox.xRight - this.player.weaponHitBox.width, y: this.player.weaponHitBox.yRight})
                    )) && enemy.alive) {
                        console.log('Enemy hit by player!');
                        console.log('enemy health: ', enemy.health)
                        if (enemy.hittable === false) {
                            if (enemy.timer > enemy.interval) {
                                enemy.hittable = true;
                                enemy.timer = 0;
                            } else {
                                enemy.timer += deltaTime
                            }
                        }
                        if (enemy.health > 0) {
                            if (enemy.hittable) {
                                enemy.health -= this.player.weapon.damage;
                                enemy.hittable = false;
                            }
                            if (enemy.health <= 0) {
                                enemy.alive = false;
                                this.enemies.splice(index, 1);
                                this.player.score++;
                                if (this.enemies.length === 0) {
                                    this.gameOver = true;
                                }
                            }
                        } else {
                            enemy.alive = false;
                            this.enemies.splice(index, 1);
                            this.player.score++;
                            if (this.enemies.length === 0) {
                                this.gameOver = true;
                            }
                        }
                    }
                })
                if ((this.player.direction === 'right' &&  rectangularCollision({...this.doorSwitch, x: this.doorSwitch.x - 3, y: this.doorSwitch.y}, 
                    {...this.player.weaponHitBox, x: this.player.weaponHitBox.xRight, y: this.player.weaponHitBox.yRight})
                ) || (this.player.direction === 'left' &&  rectangularCollision({...this.doorSwitch, x: this.doorSwitch.x - 3, y: this.doorSwitch.y}, 
                    {...this.player.weaponHitBox, x: this.player.weaponHitBox.xRight - this.player.weaponHitBox.width, y: this.player.weaponHitBox.yRight})
                )) {
                    this.doorSwitch.state = 'right';
                    this.doorSwitch.tile = this.tileObjects[`lever_${this.doorSwitch.state}`];
                    this.doorSwitch.frameX = this.doorSwitch.tile.Position.X;
                    this.doorSwitch.frameY = this.doorSwitch.tile.Position.Y;
            
                    this.doors[1].state = 'open';
                    this.doors[1].tile = this.tileObjects[`doors_leaf_${this.doors[1].state}`];
                    this.doors[1].frameX = this.doors[1].tile.Position.X;
                    this.doors[1].frameY = this.doors[1].tile.Position.Y;

                    this.doorBoundaries = this.doorBoundaries.slice(0, 2);
                }
            }
            if (this.enemies.length === 1) {
                this.doors[0].state = 'open';
                this.doors[0].tile = this.tileObjects[`doors_leaf_${this.doors[0].state}`];
                this.doors[0].frameX = this.doors[0].tile.Position.X;
                this.doors[0].frameY = this.doors[0].tile.Position.Y;
                this.doorBoundaries = [];
            }
            this.healthPotions.forEach((healthPotion, index) => {
                if ((this.player.direction === 'right' &&  rectangularCollision({...healthPotion, x: healthPotion.x - 3, y: healthPotion.y}, 
                    {...this.player.weaponHitBox, x: this.player.weaponHitBox.xRight, y: this.player.weaponHitBox.yRight})
                ) || (this.player.direction === 'left' &&  rectangularCollision({...healthPotion, x: healthPotion.x - 3, y: healthPotion.y}, 
                    {...this.player.weaponHitBox, x: this.player.weaponHitBox.xRight - this.player.weaponHitBox.width, y: this.player.weaponHitBox.yRight})
                )) {
                    console.log('Obtained a potion!');
                    this.healthPotions.splice(index, 1);
                    this.player.lives = [new Life(this, 'full'), new Life(this, 'full'), new Life(this, 'full'), 
                                        new Life(this, 'full'), new Life(this, 'full')];
                                        this.renderables = [this.background, ...this.enemies, ...this.doors,  this.doorSwitch, 
                                            ...this.healthPotions, ...this.attackPotions, ...this.speedPotions, this.player, this.foreground];
                }
            });
            this.attackPotions.forEach((attackPotion, index) => {
                if ((this.player.direction === 'right' &&  rectangularCollision({...attackPotion, x: attackPotion.x - 3, y: attackPotion.y}, 
                    {...this.player.weaponHitBox, x: this.player.weaponHitBox.xRight, y: this.player.weaponHitBox.yRight})
                ) || (this.player.direction === 'left' &&  rectangularCollision({...attackPotion, x: attackPotion.x - 3, y: attackPotion.y}, 
                    {...this.player.weaponHitBox, x: this.player.weaponHitBox.xRight - this.player.weaponHitBox.width, y: this.player.weaponHitBox.yRight})
                )) {
                    console.log('Obtained an attack potion!');
                    this.attackPotions.splice(index, 1);
                    this.player.weapon.damage += 5;
                    this.renderables = [this.background, ...this.enemies, ...this.doors,  this.doorSwitch, 
                        ...this.healthPotions, ...this.attackPotions, ...this.speedPotions, this.player, this.foreground];
                }
            });
            this.speedPotions.forEach((speedPotion, index) => {
                if ((this.player.direction === 'right' &&  rectangularCollision({...speedPotion, x: speedPotion.x - 3, y: speedPotion.y}, 
                    {...this.player.weaponHitBox, x: this.player.weaponHitBox.xRight, y: this.player.weaponHitBox.yRight})
                ) || (this.player.direction === 'left' &&  rectangularCollision({...speedPotion, x: speedPotion.x - 3, y: speedPotion.y}, 
                    {...this.player.weaponHitBox, x: this.player.weaponHitBox.xRight - this.player.weaponHitBox.width, y: this.player.weaponHitBox.yRight})
                )) {
                    console.log('Obtained a speed potion!');
                    this.speedPotions.splice(index, 1);
                    this.movables.forEach((movable) => {
                        movable.speed += 0.3;
                        if (movable.layer1) {
                            movable.layer1.speed += 0.3;
                        };
                    })
                    this.renderables = [this.background, ...this.enemies, ...this.doors,  this.doorSwitch, 
                        ...this.healthPotions, ...this.attackPotions, ...this.speedPotions, this.player, this.foreground];
                }
            });
            if (this.moving) {
                this.movables.forEach((movable) => {
                    movable.update(this.input.keys, deltaTime)
                })
            } else {
                this.enemies.forEach((enemy) => {
                    enemy.update([], deltaTime)
                })
            }
            if (!this.gameOver) this.player.update(this.input.keys, deltaTime);
        }

        draw(context) {
            //draw canvas black background
            context.fillStyle = 'black'
            context.fillRect(0, 0, this.width, this.height);
            //draw game items
            this.renderables.forEach((renderable) => {
                renderable.draw(context);
            })
            //draw player stats ui
            this.player.lives.forEach((life, index) => {
                life.draw(context, index * 40, 0)
            });
            context.save();
            context.fillStyle = 'white'
            context.font = '22px Open Sans, sans-serif'
            context.fillText(`Enemies killed: ${this.player.score}/45`, 0, 60)
            context.restore();

            if (this.gameOver) {
                if (this.enemies.length === 0) {
                    //draw Game won ui
                    context.save()
                    context.shadowOffsetX = 5;
                    context.shadowOffsetY = 5;
                    context.shadowColor = 'black';        
                    context.font = '60px Open Sans, sans-serif'
                    context.textAlign = 'center';
                    context.fillStyle = 'white'
                    context.fillText(`CONGRATULATIONS!`, this.width / 2, this.height / 2)
                    context.shadowOffsetX = 3;
                    context.shadowOffsetY = 3;
                    context.font = '30px Open Sans, sans-serif'
                    context.fillStyle = 'white'
                    context.fillText(`You won the game :)`, this.width / 2, this.height / 2 + 45)
                    context.shadowOffsetX = 2;
                    context.shadowOffsetY = 2;
                    context.font = '20px Open Sans, sans-serif'
                    context.fillText(`Press R for another game`, this.width / 2, this.height / 2 + 80)
                    context.restore()        
                } else {
                    //draw GameOver ui
                    context.save()
                    context.shadowOffsetX = 5;
                    context.shadowOffsetY = 5;
                    context.shadowColor = 'black';        
                    context.font = '60px Open Sans, sans-serif'
                    context.textAlign = 'center';
                    context.fillStyle = 'white'
                    context.fillText(`GAME OVER`, this.width / 2, this.height / 2)
                    context.shadowOffsetX = 3;
                    context.shadowOffsetY = 3;
                    context.font = '30px Open Sans, sans-serif'
                    context.fillStyle = 'white'
                    context.fillText(`Press R to try again...`, this.width / 2, this.height / 2 + 50)
                    context.restore()        
                }
            }

            if (this.gameSetup) {
                //draw class choosing menu
                context.save();
                context.fillStyle = 'white'
                context.fillRect(canvas.width / 3 - 40 - 5, canvas.height / 3.2 + 40 - 5, canvas.width / 2 - 80 + 10, canvas.height / 2 - 80 + 10)
                context.fillStyle = 'black'
                context.fillRect(canvas.width / 3 - 40, canvas.height / 3.2 + 40, canvas.width / 2 - 80, canvas.height / 2 - 80)

                context.shadowOffsetX = 2;
                context.shadowOffsetY = 2;
                context.font = '20px Open Sans, sans-serif'
                classTiles.forEach((classTile) => {
                    context.fillStyle = classTile.color;
                    context.fillRect(classTile.x - 3, classTile.y - 3, 80 + 6, 40 + 6)
                    context.fillStyle = 'black'
                    context.fillRect(classTile.x, classTile.y, 80, 40)
                    context.fillStyle = 'white'
                    context.fillText(`${classTile.name}`, classTile.textX, classTile.textY)
                })
                context.fillStyle = 'white'
                context.font = '40px Open Sans, sans-serif'
                context.fillText(`Choose your class!`, canvas.width / 2 - 175, canvas.width / 2 - 180)
                context.restore();
            }
        }
    }

    let game = new Game(canvas.width, canvas.height, tileObjects);
    let lastTime = 0;

    function animate(timestamp) {
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if ((game.input.keys.includes('r') || game.input.keys.includes('R')) && game.gameOver) {
            console.log('starting new game')
            console.log('old game: ', game);
            boundaries = [];
            collisionsMap.forEach((row, i) => {
                row.forEach((symbol, j) => {
                    if (symbol === 2049) {
                        boundaries.push(new Boundary((j * 40), (i * 40)))
                    }
                })
            })
            chosenClass = null;
            game = new Game(canvas.width, canvas.height, tileObjects);
            console.log('new game: ', game);
        }
        game.update(deltaTime);
        game.draw(ctx);
        requestAnimationFrame(animate);
    }
    animate(0);
});

export function handleInput(input, object) {
    if (input.includes('ArrowLeft') && input.includes('ArrowUp')) {
        object.x += 2 * object.speed;
        object.y += 2 * object.speed;
        object.movementTargetX += 2 * object.speed;
        object.movementTargetY += 2 * object.speed;
        object.healthBar = {...object.healthBar,
            x: object.x + 10,
            y: object.y + 7,
            width: (object.spriteWidth * 2.5 - 16) * (object.health / object.maxHealth),
        }
    } else if (input.includes('ArrowLeft') && input.includes('ArrowDown')) {
        object.x += 2 * object.speed;
        object.y -= 2 * object.speed;
        object.movementTargetX += 2 * object.speed;
        object.movementTargetY -= 2 * object.speed;
        object.healthBar = {...object.healthBar,
            x: object.x + 10,
            y: object.y + 7,
            width: (object.spriteWidth * 2.5 - 16) * (object.health / object.maxHealth),
        }
    } else if (input.includes('ArrowRight') && input.includes('ArrowUp')) {
        object.x -= 2 * object.speed;
        object.y += 2 * object.speed;
        object.movementTargetX -= 2 * object.speed;
        object.movementTargetY += 2 * object.speed;
        object.healthBar = {...object.healthBar,
            x: object.x + 10,
            y: object.y + 7,
            width: (object.spriteWidth * 2.5 - 16) * (object.health / object.maxHealth),
        }
    } else if (input.includes('ArrowRight') && input.includes('ArrowDown')) {
        object.x -= 2 * object.speed;
        object.y -= 2 * object.speed;
        object.movementTargetX -= 2 * object.speed;
        object.movementTargetY -= 2 * object.speed;
        object.healthBar = {...object.healthBar,
            x: object.x + 10,
            y: object.y + 7,
            width: (object.spriteWidth * 2.5 - 16) * (object.health / object.maxHealth),
        }
    } else {
        if (input.includes('ArrowLeft')) {
            object.x += 3 * object.speed;
            object.movementTargetX += 3 * object.speed;
            object.healthBar = {...object.healthBar,
                x: object.x + 10,
                y: object.y + 7,
                width: (object.spriteWidth * 2.5 - 16) * (object.health / object.maxHealth),
            }
        } 
        if (input.includes('ArrowRight')) {
            object.x -= 3 * object.speed;
            object.movementTargetX -= 3 * object.speed;    
            object.healthBar = {...object.healthBar,
                x: object.x + 10,
                y: object.y + 7,
                width: (object.spriteWidth * 2.5 - 16) * (object.health / object.maxHealth),
            }
        }
        if (input.includes('ArrowUp')) {
            object.y += 3 * object.speed;
            object.movementTargetY += 3 * object.speed;    
            object.healthBar = {...object.healthBar,
                x: object.x + 10,
                y: object.y + 7,
                width: (object.spriteWidth * 2.5 - 16) * (object.health / object.maxHealth),
            }
        }
        if (input.includes('ArrowDown')) {
            object.y -= 3 * object.speed;
            object.movementTargetY -= 3 * object.speed;    
            object.healthBar = {...object.healthBar,
                x: object.x + 10,
                y: object.y + 7,
                width: (object.spriteWidth * 2.5 - 16) * (object.health / object.maxHealth),
            }
        }
    }
}