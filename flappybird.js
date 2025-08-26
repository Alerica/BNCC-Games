/**
 * Flappy Bird Clone
 * @author Alexander
 * @link https://github.com/Alerica
 */

/* Game Config*/ 

// Board
let board;
let boardWidth = 480;   
let boardHeight = 720; 
let context;

// Bird
let birdWidth = 68;
let birdHeight = 48;
let birdX = boardWidth/8;
let birdY = boardHeight/2;
let birdImg;
let bird = { x : birdX, y : birdY, width : birdWidth, height : birdHeight };

// Pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg, bottomPipeImg;

// Physics
let velocityX = -4;
let velocityY = 0;
let gravity = 0.3;

let gameOver = false;
let score = 0;
let highScore = 0;
let playerName = "Player";
let leaderboard = [];

let gameStarted = false;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    birdImg = new Image();
    birdImg.src = "./flappybird.png";
    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";
    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    document.addEventListener("keydown", handleKey);
    document.getElementById("retry-btn").addEventListener("click", resetGame);
    document.getElementById("start-btn").addEventListener("click", startGame);

    document.getElementById("name-field").addEventListener("change", (e) => {
        playerName = e.target.value || "Player";
    });
}

function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        requestAnimationFrame(update);
        setInterval(placePipes, 1500);
    }
    document.getElementById("start-btn").style.display = "none";
}

function update() {
    requestAnimationFrame(update);
    if (gameOver || !gameStarted) return;

    context.clearRect(0, 0, board.width, board.height);

    // Bird
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
        showGameOver();
    }

    // Pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
            showGameOver();
        }
    }

    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    // Score
    context.fillStyle = "white";
    context.font="bold 32px sans-serif";
    context.strokeStyle = "black";
    context.lineWidth = 3;
    context.strokeText(score, 10, 40);
    context.fillText(score, 10, 40);
}

function placePipes() {
    if (gameOver || !gameStarted) return;

    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/4;

    let topPipe = { img : topPipeImg, x : pipeX, y : randomPipeY, width : pipeWidth, height : pipeHeight, passed : false };
    pipeArray.push(topPipe);

    let bottomPipe = { img : bottomPipeImg, x : pipeX, y : randomPipeY + pipeHeight + openingSpace, width : pipeWidth, height : pipeHeight, passed : false };
    pipeArray.push(bottomPipe);
}

function handleKey(e) {
    if ((e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyX") && gameStarted && !gameOver) {
        velocityY = -6;
    }

    if (gameOver && e.code === "Enter") {
        resetGame();
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function showGameOver() {
    if (score > highScore) highScore = Math.floor(score);

    leaderboard.push({ name: playerName, score: Math.floor(score) });
    leaderboard.sort((a,b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 5); 
    updateLeaderboard();

    context.fillStyle = "red";
    context.font="bold 40px sans-serif";
    context.fillText("GAME OVER", boardWidth/4, boardHeight/2 - 40);

    context.fillStyle = "white";
    context.font="20px sans-serif";
    context.fillText("Press Enter to Retry", boardWidth/4.5 + 40, boardHeight/2);

    document.getElementById("retry-btn").style.display = "inline-block";
}

function resetGame() {
    bird.y = birdY;
    velocityY = 0;
    pipeArray = [];
    score = 0;
    gameOver = false;
    document.getElementById("retry-btn").style.display = "none";
}

function updateLeaderboard() {
    let tbody = document.querySelector("#leaderboard tbody");
    tbody.innerHTML = "";
    leaderboard.forEach(entry => {
        let row = document.createElement("tr");
        row.innerHTML = `<td>${entry.name}</td><td>${entry.score}</td>`;
        tbody.appendChild(row);
    });
}

