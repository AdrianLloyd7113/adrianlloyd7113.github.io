class Platform {

    constructor(x, y, w, h){
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.boundX = parseFloat(x) + parseFloat(w);
        this.boundY = parseFloat(y) + parseFloat(h);
    }

}

class Player {

    constructor(x, y){
        this.x = x;
        this.y = y;

        this.width = 27;
        this.height = 54;
        this.boundX = x + 27;
        this.boundY = y + 54;

        this.falling = true;
        this.jumping = false;

        this.isDead = false;
    }

}

class FireColumn {
    constructor(x){
        this.x = parseFloat(x);
        this.fireballs = [];
    }
}

class Fireball {
    constructor(x, y, w, h){
        this.x = parseFloat(x);
        this.y = parseFloat(y);
        this.w = parseFloat(w);
        this.h = parseFloat(h);
    }
}

//INIT CODE

let animationFrameId = null;
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

//Define canvas dimensions
const width = 1200;
const height = 675;
canvas.width = window.innerWidth/2;
canvas.height = window.innerHeight/2;

//Define graphics constants
const playerRange = canvas.width * 0.8;

const mainScreenElement = document.getElementById('mainScreen');
const deathScreenElement = document.getElementById('deathScreen');
const winScreenElement = document.getElementById('winScreen');
const canvasElement = document.getElementById('gameCanvas');

const startButton = document.getElementById('startButton');

//Define game objective values
let finishX = 10000;

//Define physics values
const force = 6;
const acceleration = 0.1;
const fireballSpeed = 3;

let fGravity = 0;
let fJump = force;

const moveSpeed = 5;

const keys = {
    left: false,
    right: false,
    up: false,
};

//PLAYER CONTROL

const keyDownHandler = function(e) {
    switch(e.key) {
        case 'ArrowLeft':
        case 'a':
            console.log("Pressed left key");
            playerImage.src = "game-assets/images/characterflipped.png";
            keys.left = true;
            break;
        case 'ArrowRight':
        case 'd':
            console.log("Pressed right key");
            playerImage.src = "game-assets/images/character.png";
            keys.right = true;
            break;
        case 'ArrowUp':
        case 'w':
        case 'Space':
            keys.up = !player.falling && !player.jumping;
            break;
    }
}

const keyUpHandler = function(e) {
    switch(e.key) {
        case 'ArrowLeft':
        case 'a':
            keys.left = false;
            break;
        case 'ArrowRight':
        case 'd':
            keys.right = false;
            break;
        case 'ArrowUp':
        case 'w':
        case 'Space':
            player.jumping = false;
            player.falling = true;
            fJump = force;
            keys.up = false;
            break;
    }
}

const startButtonHandler = function(e) {
    player.isDead = false;
    mainScreenElement.style.display = 'none';
    start();
}

//Define images
const background = new Image(width, height);
const playerImage = new Image(20, 100);
const platform = new Image(500, 100);
const fireball = new Image(25, 25);
const finishLine = new Image(100, 1000);

//Set image sources
background.src = "game-assets/images/background1.png";
playerImage.src = "game-assets/images/character.png";
platform.src = "game-assets/images/platform.png";
fireball.src = "game-assets/images/fireball.png";
finishLine.src = "game-assets/images/finish.png";

//Define game entities
let platforms = [];
let fireColumns = [];
let player = new Player(0, 0);

mainScreen();

//START SCREEN CODE

function mainScreen(){

    mainScreenElement.style.display = 'block';
    deathScreenElement.style.display = 'none';
    winScreenElement.style.display = 'none';
    canvasElement.style.display = 'none';

    startButton.addEventListener('click', startButtonHandler);

    const instructionsButton = document.getElementById('instructionsButton');
    instructionsButton.addEventListener('click', function() {
        //TODO: Add instructions
    });
}

function deathScreen(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    mainScreenElement.style.display = 'none';
    deathScreenElement.style.display = 'block';
    winScreenElement.style.display = 'none';
    canvasElement.style.display = 'none';

    const startButton = document.getElementById('tryAgainButton');
    startButton.addEventListener('click', startButtonHandler);

    const instructionsButton = document.getElementById('mainScreenButton');
    instructionsButton.addEventListener('click', function() {
        deathScreenElement.style.display = 'none';
        mainScreen();
    });
}

function winScreen(){

    mainScreenElement.style.display = 'none';
    deathScreenElement.style.display = 'none';
    winScreenElement.style.display = 'block';
    canvasElement.style.display = 'none';

    const startButton = document.getElementById('finishButton');
    startButton.addEventListener('click', function() {
        winScreenElement.style.display = 'none';
        mainScreen();
    });

}


//CORE GAME CODE

//Start game
function start(){
    retrieveLevel();

    mainScreenElement.style.display = 'none';
    deathScreenElement.style.display = 'none';
    winScreenElement.style.display = 'none';

    document.removeEventListener('keydown', keyDownHandler);
    document.removeEventListener('keyup', keyUpHandler);

    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);

    platforms = [];
    fireColumns = [];

    player = new Player(0, 0);

    finishX = 10000;

    const canvasElement = document.getElementById('gameCanvas');
    canvasElement.style.display = 'block';

    let loadedImages = 0;
    const totalImages = 3;

    //RESOURCE LOADING

    //BG load handler
    background.onload = function() {
        loadedImages++;
        if (loadedImages === totalImages) {
            drawGame();
        }
    }

    //Platform load handler
    platform.onload = function() {
        loadedImages++;
        if (loadedImages === totalImages) {
            drawGame();
        }
    }
    playerImage.onload = function() {
        loadedImages++;
        if (loadedImages === totalImages) {
            drawGame();
        }
    }

    // In case images are already loaded
    if (background.complete && platform.complete && playerImage.complete) {
        drawGame();
    }

    requestAnimationFrame(loop);
}

//Main game loop
function loop(){

    gravity();
    updateFireColumn();

    checkCollision();
    checkDeath();
    checkFinish();
    movePlayer();
    panCamera();

    drawGame();

    if (!player.isDead) animationFrameId = requestAnimationFrame(loop);
}

//ENTITIES

function updateFireColumn(){
    for (let i = 0; i < fireColumns.length; i++){
        for (let j = 0; j < fireColumns[i].fireballs.length; j++){
            if (fireColumns[i].fireballs[j].y < height){
                fireColumns[i].fireballs[j].y += fireballSpeed;
                console.log(fireColumns[i].fireballs[j].y);
            }else{
                fireColumns[i].fireballs[j] = new Fireball(fireColumns[i].x, 0, 25, 25);
            }
        }
    }
}

//PHYSICS SYSTEM

//Gravity
function gravity(){
    if (player.falling){
        if (fGravity < force){
            fGravity += acceleration;
        }
        player.y += fGravity;
    } else if (player.jumping){
        if (fJump > 0){
            player.y -= fJump;
            fJump -= acceleration;
        }else{
            player.jumping = false;
            player.falling = true;
            fJump = force;
        }
    }
}

//Collision detection
function checkCollision(){
    player.boundX = player.x + player.width;
    player.boundY = player.y + player.height;

    for (let platform of platforms) {
        // platform.boundX = platform.x + platform.width;
        // platform.boundY = platform.y + platform.height;

        if (player.boundX > platform.x &&
            player.x < platform.boundX &&
            player.boundY > platform.y &&
            player.y < platform.boundY) {

            player.falling = false;
            fGravity = 0;
            return;

        }
    }

    if (!player.jumping) player.falling = true;
}

function movePlayer() {
    if (keys.left) {
        console.log("Moving left");
        player.x -= moveSpeed;
    }
    if (keys.right) {
        console.log("Moving right");
        player.x += moveSpeed;
    }

    if (keys.up) {
        console.log("Moving up");
        player.jumping = true;
        player.falling = false;
        fGravity = 0;
    }
    checkCollision();
}

function checkDeath() {
    if (player.y > height + player.height/2) {
        die();
    }
}

function checkFinish() {
    if (player.x > finishX) {
        player.isDead = true;
        finish();
    }
}

//Player death
function die(){
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    player.isDead = true;
    deathScreen();
}

//Player victory
function finish(){
    winScreen();
}

//GRAPHICS

//Draw game frame
function drawGame() {
    //Clear canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //Draw background
    ctx.drawImage(background, 0, 0, width, height, 0, 0, canvas.width, canvas.height);

    //Draw platforms
    for (let i = 0; i < platforms.length; i++) {
        ctx.drawImage(platform, 0, 0, 500, 100, platforms[i].x, platforms[i].y,
            platforms[i].width, platforms[i].height);
    }

    //Draw fireballs
    for (let i = 0; i < fireColumns.length; i++) {
        for (let j = 0; j < fireColumns[i].fireballs.length; j++) {
            console.log("Drawing Fireball " + fireColumns[i].x);
            ctx.drawImage(fireball, 0, 0, 25, 25, fireColumns[i].x, fireColumns[i].fireballs[j].y, 25, 25);
        }
    }

    //Draw finish line
    ctx.drawImage(finishLine, 0, 0, 100, 1000, finishX, 0, 50, 1000);

    //Draw player
    ctx.drawImage(playerImage, 0, 0, 128, 256, player.x, player.y, 27, 54);

}

//Camera movement
function panCamera(){
    if (player.boundX > playerRange) {
        player.x = playerRange - player.width;

        //Move platform entities
        for (let i = 0; i < platforms.length; i++) {
            platforms[i].x = platforms[i].x - moveSpeed;
            platforms[i].boundX = platforms[i].boundX - moveSpeed;
        }

        //Move fire columns
        for (let i = 0; i < fireColumns.length; i++) {
            fireColumns[i].x = fireColumns[i].x - moveSpeed;
        }

        //Move finish line
        finishX -= moveSpeed;

    } else if (player.x < 1) {
        player.x = 1;

        //Move platform entities
        for (let i = 0; i < platforms.length; i++) {
            platforms[i].x = platforms[i].x + moveSpeed;
            platforms[i].boundX = platforms[i].boundX + moveSpeed;
        }

        //Move fire columns
        for (let i = 0; i < fireColumns.length; i++) {
            fireColumns[i].x = fireColumns[i].x + moveSpeed;
        }


        //Move finish line
        finishX += moveSpeed;
    }


}

//LEVEL LOADING

function currentDayNumber(){
    let one_day = 1000 * 60 * 60 * 24;

    let present_date = new Date();
    let dayOne = new Date(2025, 0, 8);

    console.log("OG " + dayOne.getTime());
    console.log(present_date.getTime());

    return Math.floor((present_date.getTime() - dayOne.getTime()) / one_day).
    toFixed(0);

}

function retrieveLevel(){
    levelSrc = "game-assets/levels/level" + currentDayNumber() + ".level";
    console.log(levelSrc);

    fetch(levelSrc)
        .then(response => response.text())
        .then(data => {
            loadLevel(data)
        })
        .catch(error => console.error('Error loading level:', error));
}


//Load level data into object arrays
function loadLevel(levelData){

    if (levelData !== undefined && levelData !== null && levelData !== "") {
        const ents = levelData.split(";")
        for (let i = 0; i < ents.length; i++) {
            let entData = ents[i].split(",");
            if (entData[0] === "platform"){
                platforms.push(new Platform(entData[1], entData[2], entData[3], entData[4]));
            } else if (entData[0] === "firecol"){
                let newColumn = new FireColumn(entData[1]);

                let firstBall = new Fireball(entData[1], 0, 25, 25);
                let secondBall = new Fireball(entData[1], -(height/2), 25, 25);
                let thirdBall = new Fireball(entData[1], -height, 25, 25);

                newColumn.fireballs.push(firstBall, secondBall, thirdBall);

                console.log(newColumn.fireballs);
                fireColumns.push(newColumn);
            } else if (entData[0] === "finish"){
                finishX = parseInt(entData[1]);
            }
        }
    } else {
        console.log("Bad level data!");
    }

}
