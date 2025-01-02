class Platform {

    constructor(x, y, w, h){
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.boundX = this.x + w;
        this.boundY = this.y + h;
    }

}

class Player {

    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = 27;
        this.height = 54;
        this.boundX = x + this.width;
        this.boundY = y + this.height;
        this.falling = true;
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

//Define physics constants
const fGravity = 5;

const moveSpeed = 5;
const keys = {
    left: false,
    right: false
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
const player = new Player(0, 0);

mainScreen();

//START SCREEN CODE

function mainScreen(){
    //TODO: add screen
    start();
}

//CORE GAME CODE

//Start game
function start(){
    retrieveLevel();

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
    movePlayer();
    drawGame();

    requestAnimationFrame(loop);
}

//PHYSICS SYSTEM

//Gravity
function gravity(){
    if (player.falling){
        player.y += fGravity;
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

            // player.y = platform.y - player.height;
            player.falling = false;
            return;
        }
    }

    player.falling = true;
}

//PLAYER CONTROL

document.addEventListener('keydown', function(e) {
    switch(e.key) {
        case 'ArrowLeft':
        case 'a':
            keys.left = true;
            break;
        case 'ArrowRight':
        case 'd':
            keys.right = true;
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
    }
});

function movePlayer() {
    if (keys.left) {
        player.x -= moveSpeed;
    }
    if (keys.right) {
        player.x += moveSpeed;
    }
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



//Player death
function die(){

}

//Player victory
function finish(){

}

function currentDayNumber(){
    let one_day = 1000 * 60 * 60 * 24;

    let present_date = new Date();
    let dayOne = new Date(2025, 0, 1);

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