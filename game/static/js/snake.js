let canvas, ctx, box, rows, cols;
let snake = [], food = {}, direction = "RIGHT", score = 0, highScore = 0;
let playerName = "", gameInterval;

function startGame() {
    console.log("Attempting to start game...");
    const nameDisplay = document.getElementById("nameDisplay");
    if (!nameDisplay) {
        console.error("nameDisplay element not found! Cannot start game.");
        alert("Error: Player name element missing. Please refresh the page.");
        return;
    }
    playerName = nameDisplay.innerText || "-";
    console.log("Player name:", playerName);
    if (!playerName || playerName === "-") {
        alert("You must be logged in to play.");
        console.warn("Game start aborted: User not logged in");
        return;
    }

    // Resize canvas
    resizeCanvas();
    snake = [{ x: Math.floor(cols/2) * box, y: Math.floor(rows/2) * box }];
    direction = "RIGHT";
    score = 0;
    const scoreElement = document.getElementById("score");
    if (scoreElement) {
        scoreElement.innerText = score;
        console.log("Score initialized to:", score);
    } else {
        console.error("score element not found! Cannot initialize score display.");
        alert("Error: Score display element missing. Please refresh the page.");
    }
    const gameOverMsg = document.getElementById("gameOverMsg");
    if (gameOverMsg) {
        gameOverMsg.style.display = "none";
        console.log("Game over message hidden");
    } else {
        console.error("gameOverMsg element not found!");
    }

    food = {
        x: Math.floor(Math.random() * cols) * box,
        y: Math.floor(Math.random() * rows) * box
    };
    console.log("Food spawned at:", food);

    if (gameInterval) {
        clearInterval(gameInterval);
        console.log("Cleared existing game interval");
    }
    gameInterval = setInterval(draw, 150);
    console.log("Game interval started");
}

function resizeCanvas() {
    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.7;
    const aspectRatio = 4 / 3; // Maintain 4:3 ratio
    let width = maxWidth;
    let height = width / aspectRatio;
    if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
    }
    canvas.width = Math.floor(width);
    canvas.height = Math.floor(height);
    box = Math.max(10, Math.floor(Math.min(canvas.width, canvas.height) / 40)); // Dynamic box size
    rows = Math.floor(canvas.height / box);
    cols = Math.floor(canvas.width / box);
    console.log(`Canvas resized: width=${canvas.width}, height=${canvas.height}, box=${box}, rows=${rows}, cols=${cols}`);
}

function draw() {
    console.log("🐍 Drawing frame... Current score:", score);
    if (!ctx) {
        console.error("Canvas context not available! Stopping game loop.");
        clearInterval(gameInterval);
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? "lime" : "green";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
    }

    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);

    let headX = snake[0].x;
    let headY = snake[0].y;

    if (direction === "LEFT") headX -= box;
    if (direction === "UP") headY -= box;
    if (direction === "RIGHT") headX += box;
    if (direction === "DOWN") headY += box;

    if (headX === food.x && headY === food.y) {
        score++;
        console.log("Food eaten, new score:", score);
        food = {
            x: Math.floor(Math.random() * cols) * box,
            y: Math.floor(Math.random() * rows) * box
        };
        console.log("New food spawned at:", food);
    } else {
        snake.pop();
    }

    const newHead = { x: headX, y: headY };

    if (
        headX < 0 || headX >= canvas.width ||
        headY < 0 || headY >= canvas.height ||
        snake.some(segment => segment.x === headX && segment.y === headY)
    ) {
        console.log("Game over! Final score:", score);
        clearInterval(gameInterval);
        const gameOverMsg = document.getElementById("gameOverMsg");
        if (gameOverMsg) {
            gameOverMsg.style.display = "block";
        } else {
            console.error("gameOverMsg element not found!");
        }

        if (score > highScore) {
            highScore = score;
            const highScoreElement = document.getElementById("highScore");
            if (highScoreElement) {
                highScoreElement.innerText = highScore;
                console.log("New high score:", highScore);
                saveScore(highScore);
            } else {
                console.error("highScore element not found!");
            }
        }
        return;
    }

    snake.unshift(newHead);
    const scoreElement = document.getElementById("score");
    if (scoreElement) {
        scoreElement.innerText = score;
        console.log("Score updated to:", score);
    } else {
        console.error("score element not found during update!");
    }
}

function saveScore(score) {
    console.log("Saving score:", score);
    fetch("/save_score/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken")
        },
        body: JSON.stringify({ score })
    }).then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    }).then(data => console.log("Save score response:", data))
      .catch(error => console.error("Save score error:", error));
}

function getCookie(name) {
    let value = "; " + document.cookie;
    let parts = value.split("; " + name + "=");
    if (parts.length === 2) {
        console.log(`Found cookie ${name}`);
        return parts.pop().split(";").shift();
    }
    console.warn(`Cookie ${name} not found`);
    return null;
}

window.onload = function () {
    console.log("🐍 JS Loaded Successfully");
    canvas = document.getElementById("gameCanvas");
    if (!canvas) {
        console.error("Canvas element not found! Game cannot initialize.");
        alert("Error: Game canvas missing. Please refresh the page.");
        return;
    }
    ctx = canvas.getContext("2d");
    if (!ctx) {
        console.error("Failed to get canvas context! Game cannot initialize.");
        alert("Error: Canvas context unavailable. Please refresh the page.");
        return;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const highScoreElement = document.getElementById("highScore");
    if (highScoreElement) {
        highScore = parseInt(highScoreElement.innerText) || 0;
        console.log("Initial high score:", highScore);
    } else {
        console.error("highScore element not found!");
    }
    const nameDisplay = document.getElementById("nameDisplay");
    if (nameDisplay) {
        playerName = nameDisplay.innerText || "-";
        console.log("Player name initialized:", playerName);
    } else {
        console.error("nameDisplay element not found!");
    }

    const startButton = document.getElementById("startButton");
    if (startButton) {
        console.log("Start button found and ready");
    } else {
        console.error("startButton element not found!");
    }

    document.addEventListener("keydown", event => {
        if (event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
        else if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
        else if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
        else if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
        console.log("Direction changed to:", direction);
    });
}