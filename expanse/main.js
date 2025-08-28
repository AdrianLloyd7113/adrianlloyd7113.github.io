const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

ctx.font = "18px monospace";
ctx.fillStyle = "lime";
ctx.textBaseline = "top";

let lines = ["The Expanse", "Developed by Adrian Lloyd, 2025\n", " ", "Main Menu"];
let input = "";
let cursorVisible = true;

// Cursor blinking
setInterval(() => {
    cursorVisible = !cursorVisible;
    draw();
}, 500);

// handle keypresses
document.addEventListener("keydown", (e) => {
    if (e.key === "Backspace") {
        input = input.slice(0, -1);
    } else if (e.key === "Enter") {
        processCommand(input);
        input = "";
    } else if (e.key.length === 1) {
        input += e.key;
    }
    draw();
});

function processCommand(cmd) {
    lines.push("> " + cmd);
    if (cmd.toLowerCase() === "look") {
        lines.push("You are in a dark room.");
    } else if (cmd.toLowerCase() === "help") {
        lines.push("Try 'look', 'go north', or 'quit'.");
    } else if (cmd.toLowerCase() === "quit") {
        lines.push("Goodbye!");
    } else {
        lines.push("Unknown command: " + cmd);
    }
    // keep only last 20 lines
    if (lines.length > 20) lines.shift();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let y = 10;
    for (let line of lines) {
        ctx.fillText(line, 10, y);
        y += 22;
    }
    // draw input with blinking cursor
    ctx.fillText("> " + input + (cursorVisible ? "_" : ""), 10, y);
}