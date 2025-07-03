const canvas = document.getElementById("canvas");
const c = canvas.getContext("2d");

class Breadcrum {

    constructor() {
        // position has to be multiple of the snake size 
        // in order to fit in the same path than the snake
        this.x = Math.floor(Math.random() * canvas.width / 30) * 30;
        this.y = Math.floor(Math.random() * canvas.height / 30) * 30;

        this.xRange = [this.x, this.x + 30];
        this.yRange = [this.y, this.y + 30];
    }

    add() {
        c.fillStyle = "green";
        c.fillRect(this.x, this.y, 30, 30); 
        c.fillStyle = snake.color;
    }
}

class Snake {

    constructor() {
        this.x = 10;
        this.y = 10;
        this.color = "blue";

        this.xOrientation = 0;
        this.yOrientation = 1;
    }

    move() {
        c.fillRect(snake.x, snake.y, 30, 30);

        // take into account limit collision
        if (snake.y <= 0 && snake.yOrientation == -1) {
            snake.y = canvas.height;
        } else if (snake.y >= canvas.height && snake.yOrientation == 1) {
            snake.y = 0;
        } else if (snake.x >= canvas.width) {
            snake.x = 0;
        } else if (snake.x <= 0 && this.xOrientation == -1) {
            snake.x = canvas.width;
        }

        snake.y += snake.yOrientation * 10;
        snake.x += snake.xOrientation * 10;
    }

    moveToLeft() {
        snake.xOrientation = -1;
        snake.yOrientation = 0;
    }

    moveToRight() {
        snake.xOrientation = 1;
        snake.yOrientation = 0;
    }

    moveToUp() {
        snake.xOrientation = 0;
        snake.yOrientation = -1;
    }

    moveToDown() {
        snake.xOrientation = 0;
        snake.yOrientation = 1;
    }
}

const FPS = 1000/20;
const snake = new Snake();
var bread = new Breadcrum();

var init = true;
var interval;

window.onload = resumeOrStop;
canvas.onclick = resumeOrStop;

function resumeOrStop() {
    if (init) {
        interval = setInterval(show, FPS);
        init = false;
    } else {
        clearInterval(interval);
        init = true;
    }
}

window.addEventListener('keydown', (key) => {
    switch(key.code) {
        case "ArrowUp": {
            snake.moveToUp();
            break;
        }
        case "ArrowDown" : {
            snake.moveToDown();
            break;
        } 
        case "ArrowRight" : {
            snake.moveToRight();
            break;
        } 
        case "ArrowLeft" : {
            snake.moveToLeft();
            break;
        }
    }
});

function show() {
    // clear and redraw the background
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.fillStyle = "black";
    c.strokeRect(0, 0, canvas.width, canvas.height);

    c.fillStyle = snake.color;
    snake.move();
    bread.add();

    if ((snake.x == bread.x && snake.y == bread.y) || (snake.x + 30 == bread.x && snake.y + 30 == bread.y)) {
        bread = new Breadcrum();
    }
}