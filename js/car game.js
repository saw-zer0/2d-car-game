class CarGame {
    constructor(canvas, width, height) {
        this.self = this;
        this.canvas = canvas;
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d');
        this.init();
        this.speed = 3;
        this.level = 5;
    }

    init() {
        this.score = 0;
        this.laneArr = [];
        this.bgImg = new Image();
        this.bgImg.src = './assets/Asphalt-Textures.jpg';
        this.bgImg.onload = () => {
            this.drawBg();
        }
        document.getElementById('start-btn').addEventListener('click', () => {
            document.getElementById('start-menu').style.display = 'none';
            this.loadAssets();
        })

    }

    loadAssets() {
        this.carArr = [];

        this.playerImage = new Image();
        this.playerImage.src = './assets/car-12.png';
        this.otherCar = new Image();
        this.otherCar.src = './assets/car-10.png';

        this.playerImage.onload = () => {
            this.otherCar.onload = () => {
                this.player1 = new Player(this.ctx, this.playerImage, 205, 530, 1);
                /* 
                left lane x value = 55 
                mid lane x value = 205
                right lane x value = 355
                player car y value = 530
                car size w = 70, h = 150
                */
                this.generateRandomCars();
                let y = this.canvas.height;
                while(y >= 0){
                    this.generateLanes(y, this.speed);
                    y -= 70;
                }
                this.drawBg();
                this.player1.addEvents();
                this.player1.drawPlayer();
                this.reloadScreen();
            }
        }

    }

    drawBg() {
        this.ctx.drawImage(this.bgImg, 0, 0, this.canvas.width, this.canvas.height);
    }

    generateRandomCars() {
        let randx = Math.floor(getRandom(0, 3));
        let randy = getRandom(150, 300);
        let lane = { x: 150 * randx + 55, y: -(randy) };
        let newCar1 = new Car(this.ctx, lane, this.otherCar, this.speed);
        this.carArr.push(newCar1);
    }

    generateLanes(y, dy) {
        let leftLaneX = 161;
        let rightLaneX = 324;
        let lane = new Lanes(this.ctx, leftLaneX, rightLaneX, y, 5, 20, 0, dy);
        this.laneArr.push(lane);
    }

    displayCrashed(messageElement) {
        messageElement.style.display = 'block';
        this.scoremanager();
        document.getElementById('score').innerText = this.score;
        document.getElementById('high-score').innerText = Store.getData()['high-score'];
        document.getElementById('restart-btn').addEventListener('click', () => {
            messageElement.style.display = 'none';
            document.getElementById('start-menu').style.display = 'block';
            window.cancelAnimationFrame(this.animate);
            this.init();
        })
    };

    scoremanager(){
        let prevScore = Store.getData();
        console.log(prevScore)
        if(this.score > prevScore['high-score']){
            Store.addData(this.score);
        }
    };

    reloadScreen() {
        if(this.score%this.level === 0 && this.score !==0){
            this.speed += 2;
            this.level += 10
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBg();
        this.laneArr.forEach(elem => {
            elem.updateLane(this.speed);
        })
        if(this.laneArr[this.laneArr.length - 1].y > 50){
            this.generateLanes(0, this.speed);
        }
        if(this.laneArr[0].y > this.canvas.height){
            this.laneArr.shift();
        }
        this.player1.updatePlayer();
        // let addCar = false;
        let crashed = false;
        for (let i = 0; i < this.carArr.length; i++) {
            this.carArr[i].updateCar(this.speed);
            let collision = this.carArr[i].checkCollision(this.player1);
            if (collision) {
                window.cancelAnimationFrame(this.animate);
                this.displayCrashed(document.getElementById('game-over-message'));
                crashed = true;
                break;
            }
        }
        if (this.carArr[this.carArr.length - 1].lane.y > 155) {
            this.generateRandomCars();
        }
        if (this.carArr[0].lane.y > this.canvas.height) {
            this.carArr.shift();
            this.score++;
        }
        if (!crashed) {
            window.requestAnimationFrame(this.reloadScreen.bind(this.self));
        }
    }
}

class Car {
    constructor(ctx, lane, img, dy) {
        this.ctx = ctx;
        this.lane = lane;
        this.img = img;
        this.width = 70;
        this.height = 150;
        this.dy = dy;

    }

    moveCar(dy) {
        this.lane.y += dy;
    }

    drawCar() {
        this.ctx.drawImage(this.img, this.lane.x, this.lane.y, this.width, this.height)
    }

    updateCar(dy) {
        this.drawCar();
        this.moveCar(dy);
    }

    checkCollision(player) {
        let x1 = this.lane.x;
        let y1 = this.lane.y;
        let x2 = player.x;
        let y2 = player.y;
        if (x2 > this.width + x1 || x1 > player.width + x2 || y2 > this.height + y1 || y1 > player.height + y2) {
            return;
        } else {
            return true;
        }
    }

}


class Player {
    constructor(ctx, img, x, y, dx) {
        this.ctx = ctx;
        this.img = img;
        this.x = x;
        this.y = y;
        this.width = 70;
        this.height = 150;
        this.dx = dx;
        this.lane;
    }

    drawPlayer() {
        this.ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    movePlayer() {
        this.x += dx;
    }

    updatePlayer() {
        this.drawPlayer();
    }

    addEvents() {
        window.addEventListener('keypress', (event) => {
            if (event.key === 'a') {
                if (this.x > 55) {
                    this.x -= 150;
                }
            }
            else if (event.key === 'd') {
                if (this.x < 355) {
                    this.x += 150;
                }
            }
        });
    }
}


class Lanes {
    constructor(ctx, leftx, rightx, y, width, height, dx, dy) {
        this.ctx = ctx;
        this.y = y;
        this.leftx = leftx;
        this.rightx = rightx;
        this.width = width;
        this.height = height;
        this.dx = 0;
        this.dy = dy;
    }

    moveLane(dy) {
        this.y += dy;
    }

    drawLane() {
        this.ctx.fillStyle = '#fad201';
        this.ctx.fillRect(this.leftx, this.y, this.width, this.height);
        this.ctx.fillRect(this.rightx, this.y, this.width, this.height);
    }

    updateLane(dy) {
        this.drawLane();
        this.moveLane(dy);
    }
}