
export const states = {
    IDLE_LEFT: 0,
    IDLE_RIGHT: 1,
    RUNNING_LEFT: 2,
    RUNNING_RIGHT: 3,
    HIT: 4,
}

class State {
    constructor(state, game) {
        this.state = state;
        this.game = game;
    }
}

export class IdleLeft extends State {
    constructor(game) {
        super('IDLE_LEFT', game);
    }
    enter() {
        this.game.player.frame = 0;
        this.game.player.maxFrame = 3;
        this.game.player.state = 'idle'
        this.game.player.direction = 'left';
    }
    handleInput(input) {
        if (input.includes('ArrowLeft') || input.includes('ArrowUp') || input.includes('ArrowDown')) {
            this.game.player.setState(states.RUNNING_LEFT, 1);
        } else if (input.includes('ArrowRight')) {
            this.game.player.setState(states.RUNNING_RIGHT, 1);        
        } else if (input.includes(' ') && this.game.player.weapon.frame === 0) {
            this.game.player.weapon.attacking = true;
        }
    }
}

export class IdleRight extends State {
    constructor(game) {
        super('IDLE_RIGHT', game);
    }
    enter() {
        this.game.player.frame = 0;
        this.game.player.maxFrame = 3;
        this.game.player.state = 'idle';
        this.game.player.direction = 'right';
    }
    handleInput(input) {
        if (input.includes('ArrowLeft')) {
            this.game.player.setState(states.RUNNING_LEFT, 1);
        } else if (input.includes('ArrowRight') || input.includes('ArrowUp') || input.includes('ArrowDown')) {
            this.game.player.setState(states.RUNNING_RIGHT, 1);        
        } else if (input.includes(' ') && this.game.player.weapon.frame === 0) {
            this.game.player.weapon.attacking = true;
        }
    }
}

export class RunningLeft extends State {
    constructor(game) {
        super('RUNNING_LEFT', game);
    }
    enter() {
        this.game.player.frame = 0;
        this.game.player.maxFrame = 3;
        this.game.player.state = 'run'
        this.game.player.direction = 'left';

    }
    handleInput(input) {
        if (!(input.includes('ArrowLeft') || input.includes('ArrowRight') || input.includes('ArrowUp') || input.includes('ArrowDown'))) {
            this.game.player.setState(states.IDLE_LEFT, 1);
        } else if (input.includes('ArrowRight') && !input.includes('ArrowLeft')) {
            this.game.player.setState(states.RUNNING_RIGHT, 1);
        } else if (input.includes(' ') && this.game.player.weapon.frame === 0) {
            this.game.player.weapon.attacking = true;
        }
    }
}

export class RunningRight extends State {
    constructor(game) {
        super('RUNNING_RIGHT', game);
    }
    enter() {
        this.game.player.frame = 0;
        this.game.player.maxFrame = 3;
        this.game.player.state = 'run'
        this.game.player.direction = 'right';

    }
    handleInput(input) {
        if (!(input.includes('ArrowLeft') || input.includes('ArrowRight') || input.includes('ArrowUp') || input.includes('ArrowDown'))) {
            this.game.player.setState(states.IDLE_RIGHT, 1);
        } else if (input.includes('ArrowLeft') && !input.includes('ArrowRight')) {
            this.game.player.setState(states.RUNNING_LEFT, 1);
        } else if (input.includes(' ') && this.game.player.weapon.frame === 0) {
            this.game.player.weapon.attacking = true;
        }
    }
}

export class Hit extends State {
    constructor(game) {
        super('HIT', game);
    }
    enter(previousState) {
        this.game.player.frame = 0;
        this.game.player.maxFrame = 0;
        this.game.player.state = 'hit'
        this.game.moving = false
        this.timer = 0;
        this.interval = 500;
        this.previousState = previousState;
        this.game.player.weapon.offsetY -= 8;
    }
    handleInput(input, deltaTime) {
        if (this.timer > this.interval) {  
            this.game.player.setState(states[this.previousState], 1);
            this.game.moving = true;
            this.game.player.weapon.offsetY += 8;
        } else {
            this.timer += deltaTime;
        }
    }
}