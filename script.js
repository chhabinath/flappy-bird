const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let frames = 0;

const state = {
  current: 0,
  getReady: 0,
  game: 1,
  over: 2,
};

const birdImg = new Image();
birdImg.src = "bird.png";

const bgImg = new Image();
bgImg.src = "backgroung.jpg";

const bird = {
  x: 50,
  y: 150,
  radius: 12,
  gravity: 0.25,
  jump: 4.6,
  velocity: 0,

  draw() {
    ctx.drawImage(birdImg, this.x - 20, this.y - 15, 40, 30); // Adjust size/offset as needed
  },

  flap() {
    this.velocity = -this.jump;
  },

  update() {
    if (state.current === state.getReady) return;

    this.velocity += this.gravity;
    this.y += this.velocity;

    if (this.y + this.radius >= canvas.height - 40) {
      this.y = canvas.height - 40 - this.radius;
      if (state.current === state.game) {
        state.current = state.over;
      }
    }
  },

  reset() {
    this.velocity = 0;
    this.y = 150;
  },
};

const pipes = {
  position: [],
  width: 50,
  height: 400,
  gap: 120,
  dx: 2,

  draw() {
    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];
      ctx.fillStyle = "green";

      // Top pipe
      ctx.fillRect(p.x, p.y, this.width, this.height);

      // Bottom pipe
      ctx.fillRect(p.x, p.y + this.height + this.gap, this.width, this.height);
    }
  },

  update() {
    if (state.current !== state.game) return;

    if (frames % 100 === 0) {
      this.position.push({
        x: canvas.width,
        y: -Math.floor(Math.random() * this.height),
      });
    }

    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];
      p.x -= this.dx;

      // Collision detection
      if (
        bird.x + bird.radius > p.x &&
        bird.x - bird.radius < p.x + this.width &&
        (bird.y - bird.radius < p.y + this.height ||
          bird.y + bird.radius > p.y + this.height + this.gap)
      ) {
        state.current = state.over;
      }

      if (p.x + this.width <= 0) {
        this.position.shift();
        score.value += 1;
      }
    }
  },

  reset() {
    this.position = [];
  },
};

const score = {
  value: 0,
  best: parseInt(localStorage.getItem("bestScore")) || 0,

  draw() {
    ctx.fillStyle = "#000";
    ctx.font = "24px Arial";
    ctx.fillText("Score: " + this.value, 10, 30);
    ctx.fillText("Best: " + this.best, 10, 60);
  },

  reset() {
    if (this.value > this.best) {
      this.best = this.value;
      localStorage.setItem("bestScore", this.best);
    }
    this.value = 0;
  },
};

// Control with click
canvas.addEventListener("click", function () {
  handleInput();
});

// Control with spacebar
document.addEventListener("keydown", function (e) {
  if (e.code === "Space") {
    handleInput();
  }
});

function handleInput() {
  switch (state.current) {
    case state.getReady:
      state.current = state.game;
      break;
    case state.game:
      bird.flap();
      break;
    case state.over:
      pipes.reset();
      bird.reset();
      score.reset();
      state.current = state.getReady;
      break;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //background
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  // Ground
  ctx.fillStyle = "#ded895";
  ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

  bird.draw();
  pipes.draw();
  score.draw();

  // UI messages
  ctx.fillStyle = "#000";
  ctx.font = "28px Arial";
  if (state.current === state.getReady) {
    ctx.fillText("Click or Space to Start", 50, 300);
  }
  if (state.current === state.over) {
    ctx.fillStyle = "red";
    ctx.fillText("Game Over!", 120, 280);
    ctx.fillStyle = "#000";
    ctx.fillText("Click or Space to Restart", 40, 320);
  }
}

function update() {
  bird.update();
  pipes.update();
}

function loop() {
  update();
  draw();
  frames++;
  requestAnimationFrame(loop);
}

loop();
