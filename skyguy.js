class Platform {

    constructor(x, y, w, h){
        this.x = parseFloat(x);
        this.y = parseFloat(y);
        this.width = parseFloat(w);
        this.height = parseFloat(h);
        this.boundX = this.x + this.width;
        this.boundY = this.y + this.height;
    }

}

class Player {

    constructor(x, y){
        this.x = parseFloat(x);
        this.y = parseFloat(y);

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

class BadGuy {

    constructor(x, y){
        this.x = x;
        this.y = y;

        this.speed = 2;

        this.startY = y;
        this.limitY = y - 25;
        this.upward = true;

        this.width = 50;
        this.height = 50;
        this.boundX = x + 50;
        this.boundY = y + 50;
    }

}

//INIT CODE

let dayOne = new Date(2025, 0, 12);
let currentDate = new Date();

//User Stats
let dateLastWon = currentDate;
let winCount = 0;

let attempts = 0;

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

let lastTime = performance.now();
let deltaTime = 1/1000;

//Define audio constants
// const jump = new Audio('game-assets/audio/jump.mp3');
// const deathSound = new Audio('game-assets/audio/death.wav');

let canPlayJump = true;

//Define game objective values
let finishX = 10000;

//Define physics values
let force = 480;
let acceleration = 18;
let fireballSpeed = 180;

let fGravity = 0;
let fJump = force;

let moveSpeed = 300;

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
            playerImage.src = "game-assets/images/characterflipped.png";
            keys.left = true;
            checkCollision();
            break;
        case 'ArrowRight':
        case 'd':
            playerImage.src = "game-assets/images/character.png";
            keys.right = true;
            checkCollision();
            break;
        case 'ArrowUp':
        case 'w':
        case 'Space':
            keys.up = !player.falling && !player.jumping;
            checkCollision();
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
            checkCollision();
            break;
        case 'ArrowUp':
        case 'w':
        case 'Space':
            canPlayJump = true;
            player.jumping = false;
            player.falling = true;
            fJump = force;
            keys.up = false;
            checkCollision();
            break;
    }
}

const startButtonHandler = function(e) {
    audio.play().catch(error => {
        console.log('Background music playback failed:', error);
    });

    player.isDead = false;
    mainScreenElement.style.display = 'none';

    if (player.x === 0 && player.y === 0) start();
    else {
        start()
    };
}

//Define images
const background = new Image(width, height);
const playerImage = new Image(20, 100);
const platform = new Image(500, 100);
const fireball = new Image(25, 25);
const badGuy = new Image(50, 50);
const finishLine = new Image(100, 1000);

//Set image sources
background.src = "game-assets/images/background3.png";
playerImage.src = "game-assets/images/character.png";
platform.src = "game-assets/images/platform1.png";
fireball.src = "game-assets/images/fireball.png";
badGuy.src = "game-assets/images/badguy.png";
finishLine.src = "game-assets/images/finish.png";

//Define game entities
let platforms = [];
let fireColumns = [];
let badGuys = [];
let player = new Player(0, 0);

mainScreen();

//START SCREEN CODE

function mainScreen(){

    mainScreenElement.style.display = 'block';
    deathScreenElement.style.display = 'none';
    winScreenElement.style.display = 'none';
    canvasElement.style.display = 'none';

    let dateDisplay = document.getElementById('date');
    dateDisplay.textContent = "Level " + currentDayNumber() + ": " + currentDate.toLocaleDateString('en-US');

    startButton.addEventListener('click', startButtonHandler);

    const instructionsButton = document.getElementById('instructionsButton');
    instructionsButton.addEventListener('click', function() {
        alert("Use WASD or the arrow keys to move.\n Hold jump (W/Up arrow) to double-jump.\nAvoid the red guys and Fireballs.\nDon't fall off the screen.\nMake it to the finish line to win!")
    });

    const creditsButton = document.getElementById('creditsButton');
    creditsButton.addEventListener('click', function() {
        alert("Music:\n\"Cyborg Ninja\" Kevin MacLeod (incompetech.com)\nLicensed under Creative Commons: By Attribution 4.0 License\nhttp://creativecommons.org/licenses/by/4.0/" +
            "\n\nEverything else by Adrian Lloyd.")
    });
}

function deathScreen(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    mainScreenElement.style.display = 'none';
    deathScreenElement.style.display = 'block';
    winScreenElement.style.display = 'none';
    canvasElement.style.display = 'none';

    attempts++;

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

    const timesWon = document.getElementById('timesWon');
    timesWon.textContent = "You died " + attempts + " times on today's level.\nDaily levels you've beaten: " + winCount + " \n";

    const startButton = document.getElementById('finishButton');
    startButton.addEventListener('click', function() {
        winScreenElement.style.display = 'none';
        mainScreen();
    });

    const shareButton = document.getElementById('shareButton');
    shareButton.addEventListener('click', function() {
        const message = "I beat today’s level on Sky Guy! \n\nI died " + attempts + " times today.\nI’ve beaten " + winCount + " daily levels!\nThink you can do better than me? Play now at:\nhttp://adrianlloyd.xyz/skyguy\n"
        navigator.clipboard.writeText(message);
        alert("Copied the following to your clipboard: \n\n" + message);
    });

}


//CORE GAME CODE

//Start game
function start(){
    lastTime = performance.now();
    retrieveUserStats();

    mainScreenElement.style.display = 'none';
    deathScreenElement.style.display = 'none';
    winScreenElement.style.display = 'none';

    document.removeEventListener('keydown', keyDownHandler);
    document.removeEventListener('keyup', keyUpHandler);

    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);

    platforms = [];
    fireColumns = [];
    badGuys = [];

    retrieveLevel();

    if (platforms.length > 0) {
        player.x = platforms[0].x;
        player.y = platforms[0].y - player.height;
    } else {
        player.x = 0;
        player.y = 0;
    }

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

    if (player.x === 0 && player.y === 0) requestAnimationFrame(loop);
    else {
        if (platforms.length > 0) {
            player.x = platforms[0].x;
            player.y = platforms[0].y - player.height;
        } else {
            player.x = 0;
            player.y = 0;
        }
        requestAnimationFrame(loop);
    }
}

//Main game loop
function loop(currentTime){
    updateDeltaTime(currentTime)

    gravity();
    updateFireColumn();
    badGuyJump();

    if (!player.isDead) checkCollision();
    checkDeath();
    checkFinish();
    if (!player.isDead) movePlayer();
    panCamera();

    drawGame();

    if (!player.isDead) animationFrameId = requestAnimationFrame(loop);
    else return;
}

//ENTITIES

function updateFireColumn(){
    for (let i = 0; i < fireColumns.length; i++){
        for (let j = 0; j < fireColumns[i].fireballs.length; j++){
            if (fireColumns[i].fireballs[j].y < height){
                fireColumns[i].fireballs[j].y += fireballSpeed * deltaTime;
            }else{
                fireColumns[i].fireballs[j] = new Fireball(fireColumns[i].x, 0, 25, 25);
            }
        }
    }
}

function badGuyJump(){
    for (let i = 0; i < badGuys.length; i++){
        if (badGuys[i].upward){
            if (badGuys[i].y > badGuys[i].limitY){
                badGuys[i].y -= badGuys[i].speed;
            } else {
                badGuys[i].upward = false;
            }
        } else {
            if (badGuys[i].y < badGuys[i].startY){
                badGuys[i].y += badGuys[i].speed;
            } else {
                badGuys[i].upward = true;
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
        player.y += fGravity * deltaTime;
    } else if (player.jumping){
        if (fJump > 0){
            player.y -= fJump * deltaTime;
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

    //Fireball collision
    for (let i = 0; i < fireColumns.length; i++) {
        if (player.boundX > fireColumns[i].x && player.x < (fireColumns[i].x + 25)) {
            for (let fireball of fireColumns[i].fireballs){
                if ((fireball.y + 25) > player.y && fireball.y < player.boundY) {
                    die();
                }
            }
        }
    }

    //Bad guy collision
    for (let i = 0; i < badGuys.length; i++) {
        if (player.boundX > badGuys[i].x && player.x < (badGuys[i].x + badGuys[i].width) &&
            player.y < (badGuys[i].y + badGuys[i].height + 50) && player.boundY > badGuys[i].y) {
            die();
        }
    }

    //Platform collision
    for (let platform of platforms) {
        // platform.boundX = platform.x + platform.width;
        // platform.boundY = platform.y + platform.height;

        if (player.boundX > platform.x &&
            player.x < platform.boundX &&
            player.boundY > platform.y &&
            (player.y + 4*(player.height/5)) < platform.boundY) {

            // WIP Collision fixes...

            // if (player.falling && !keys.right && !keys.left && !keys.up){
            //     let deviation = player.boundY - platform.y;
            //     if (deviation > 0) player.y -= deviation;
            // }

            player.falling = false;
            fGravity = 0;
            return;

        }
    }

    if (!player.jumping) player.falling = true;
}

function movePlayer() {
    if (keys.left) {
        player.x -= moveSpeed * deltaTime;
    }
    if (keys.right) {
        player.x += moveSpeed * deltaTime;
    }

    if (keys.up) {
        // jump.load();
        // if (canPlayJump){
        //     jump.play().then(() => {
        //         console.log("Jump sound played!");
        //     }).catch((error) => {
        //         console.error("Error playing audio:", error);
        //     });
        //     canPlayJump = false;
        // }

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
    document.removeEventListener('keydown', keyDownHandler);
    document.removeEventListener('keyup', keyUpHandler);

    keys.left = false;
    keys.up = false;
    keys.right = false;

    player = new Player(0,0);

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    // deathSound.play().then(() => {
    //     console.log("Jump sound played!");
    // }).catch((error) => {
    //     console.error("Error playing audio:", error);
    // });

    player.isDead = true;
    deathScreen();
}

//Player victory
function finish(){

    if (dateLastWon !== currentDate || winCount === 0){
        winCount++;
        localStorage.setItem('winCount', winCount);
    }
    winScreen();
}

//GRAPHICS

//deltaTime update
function updateDeltaTime(currentTime){
    deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    //
    // moveSpeed *= deltaTime;
    // fireballSpeed *= deltaTime;
    // acceleration *= deltaTime;
    // force *= deltaTime;

}

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

    for (let i = 0; i < badGuys.length; i++) {
        ctx.drawImage(badGuy, 0, 0, 100, 100, badGuys[i].x, badGuys[i].y, 50, 50);
    }

    //Draw fireballs
    for (let i = 0; i < fireColumns.length; i++) {
        for (let j = 0; j < fireColumns[i].fireballs.length; j++) {
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
            platforms[i].x = platforms[i].x - moveSpeed  * deltaTime;
            platforms[i].boundX = platforms[i].boundX - moveSpeed  * deltaTime;
        }

        //Move fire columns
        for (let i = 0; i < fireColumns.length; i++) {
            fireColumns[i].x = fireColumns[i].x - moveSpeed  * deltaTime;
        }

        //Move bad guys
        for (let i = 0; i < badGuys.length; i++) {
            badGuys[i].x = badGuys[i].x - moveSpeed * deltaTime;
        }

        //Move finish line
        finishX -= moveSpeed  * deltaTime;

    } else if (player.x < 1) {
        player.x = 1;

        console.log(deltaTime);

        //Move platform entities
        for (let i = 0; i < platforms.length; i++) {
            platforms[i].x = platforms[i].x + moveSpeed * deltaTime;
            platforms[i].boundX = platforms[i].boundX + moveSpeed * deltaTime;
        }

        //Move fire columns
        for (let i = 0; i < fireColumns.length; i++) {
            fireColumns[i].x = fireColumns[i].x + moveSpeed * deltaTime;
        }

        //Move bad guys
        for (let i = 0; i < badGuys.length; i++) {
            badGuys[i].x = badGuys[i].x + moveSpeed  * deltaTime;
        }

        //Move finish line
        finishX += moveSpeed  * deltaTime;
    }


}

//LEVEL LOADING

function currentDayNumber(){
    let one_day = 1000 * 60 * 60 * 24;

    let present_date = new Date();

    return Math.floor((present_date.getTime() - dayOne.getTime()) / one_day).
    toFixed(0);

}

function retrieveLevel(){
    levelSrc = "game-assets/levels/level" + currentDayNumber() + ".level";

    fetch(levelSrc)
        .then(response => response.text())
        .then(data => {
            loadLevel(data)
        })
        .catch(error => console.error('Error loading level:', error));
}

function retrieveUserStats(){

    //Win count
    winCount = localStorage.getItem('winCount') ? parseInt(localStorage.getItem('winCount')) : 0;

    //Date last won
    let date = localStorage.getItem('lastPlayed');
    if (date){
        dateLastWon = new Date(date);
    }

    localStorage.setItem('lastPlayed', dateLastWon);

}

//Load level data into object arrays
function loadLevel(levelData){

    if (levelData !== undefined && levelData !== null && levelData !== "") {
        const ents = levelData.split(";")
        for (let i = 0; i < ents.length; i++) {
            let entData = ents[i].split(",");
            if (entData[0] === "platform"){
                platforms.push(new Platform(entData[1], entData[2], entData[3], entData[4]));
                if (entData[5] === "badguy"){
                    let guyX = parseFloat(entData[1]) + parseFloat(entData[3])/2 - 25;
                    badGuys.push(new BadGuy(guyX, entData[2] - 50));
                }
            } else if (entData[0] === "firecol"){
                let newColumn = new FireColumn(entData[1]);

                let firstBall = new Fireball(entData[1], 0, 25, 25);
                let secondBall = new Fireball(entData[1], -(height/2), 25, 25);
                let thirdBall = new Fireball(entData[1], -height, 25, 25);

                newColumn.fireballs.push(firstBall, secondBall, thirdBall);

                fireColumns.push(newColumn);
            } else if (entData[0] === "finish"){
                finishX = parseInt(entData[1]);
            } else if (entData[0] === "theme"){
                background.src =  "game-assets/images/background" + entData[1] + ".png";
                platform.src = "game-assets/images/platform" + entData[1] + ".png";
            }
        }
    } else {
        console.log("Bad level data!");
    }

}

