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

//INIT CODE

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

//Define physics values
const force = 6;
const acceleration = 0.1;

let fGravity = 0;
let fJump = force;

const moveSpeed = 5;

const keys = {
    left: false,
    right: false,
    up: false,
};

//Define images
const background = new Image(width, height);
const playerImage = new Image(20, 100);
const platform = new Image(500, 100);

//Set image sources
background.src = "game-assets/images/background1.png";
playerImage.src = "game-assets/images/character.png";
platform.src = "game-assets/images/platform.png";

//Define game entities
const platforms = []
let player = new Player(0, 0);

mainScreen();

//START SCREEN CODE

function mainScreen(){

    mainScreenElement.style.display = 'block';
    deathScreenElement.style.display = 'none';
    winScreenElement.style.display = 'none';
    canvasElement.style.display = 'none';

    const startButton = document.getElementById('startButton');
    startButton.addEventListener('click', function() {
        mainScreenElement.style.display = 'none';
        start();
    });

    const instructionsButton = document.getElementById('instructionsButton');
    instructionsButton.addEventListener('click', function() {
        //TODO: Add instructions
    });
}

function deathScreen(){

    mainScreenElement.style.display = 'none';
    deathScreenElement.style.display = 'block';
    winScreenElement.style.display = 'none';
    canvasElement.style.display = 'none';

    const startButton = document.getElementById('tryAgainButton');
    startButton.addEventListener('click', function() {
        player.isDead = false;
        deathScreenElement.style.display = 'none';
        start();
    });

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
    player = new Player(0, 0);

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
    checkCollision();
    checkDeath();
    movePlayer();
    panCamera();

    drawGame();

    if (!player.isDead) requestAnimationFrame(loop);
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

//PLAYER CONTROL

document.addEventListener('keydown', function(e) {
    switch(e.key) {
        case 'ArrowLeft':
        case 'a':
            //Flip sprite
            playerImage.src = "game-assets/images/characterflipped.png";
            keys.left = true;
            break;
        case 'ArrowRight':
        case 'd':
            playerImage.src = "game-assets/images/character.png";
            keys.right = true;
            break;
        case 'ArrowUp':
        case 'w':
        case 'Space':
            if (!player.falling && !player.jumping) keys.up = true;
            else {
                keys.up = false;
            }
            break;
    }
});

document.addEventListener('keyup', function(e) {
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
});

function movePlayer() {
    if (keys.left) {
        player.x -= moveSpeed;
    }
    if (keys.right) {
        player.x += moveSpeed;
    }

    if (keys.up) {
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

//Player death
function die(){
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
    // Clear canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.drawImage(background, 0, 0, width, height, 0, 0, canvas.width, canvas.height);

    // Draw platforms
    for (i = 0; i < platforms.length; i++) {
        ctx.drawImage(platform, 0, 0, 500, 100, platforms[i].x, platforms[i].y,
            platforms[i].width, platforms[i].height);
    }

    // Draw player
    ctx.drawImage(playerImage, 0, 0, 128, 256, player.x, player.y, 27, 54);

}

//Camera movement
function panCamera(){
    if (player.boundX > playerRange) {
        player.x = playerRange - player.width;

        //Move platform entities
        for (let i = 0; i < platforms.length; i++) {
            platforms[i].x = platforms[i].x - moveSpeed;
        }
    } else if (player.x < 1) {
        player.x = 1;

        //Move platform entities
        for (let i = 0; i < platforms.length; i++) {
            platforms[i].x = platforms[i].x + moveSpeed;
        }
    }


}

//LEVEL LOADING

function currentDayNumber(){
    let one_day = 1000 * 60 * 60 * 24;

    let present_date = new Date();
    let dayOne = new Date(2025, 0, 2);

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
            }
        }
    }else{
        console.log("Bad level data!");
    }

}
