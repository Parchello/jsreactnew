import { useEffect, useRef, useState } from "react";

const TetrisGame = () => {
  const canvasRef = useRef(null);
  const [context, setContext] = useState(null);
  const [score, setScore] = useState(0);
  const [speedLevel, setSpeedLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);

  const grid = 32;
  const rows = 20;
  const cols = 10;
  const speedUpThreshold = 100;
  const initialSpeed = 1000;
  let speed = initialSpeed;

  const tetrominoes = [
    [[1, 1, 1, 1]], // I
    [
      [1, 1, 1],
      [0, 1],
    ], // T
    [
      [1, 1, 0],
      [0, 1, 1],
    ], // Z
    [
      [0, 1, 1],
      [1, 1],
    ], // S
    [[1, 1, 1], [1]], // L
    [
      [1, 1, 1],
      [0, 0, 1],
    ], // J
    [
      [1, 1],
      [1, 1],
    ], // O
    [
      [1, 1, 1, 1],
      [0, 1, 1],
    ], // Custom
    [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ], // Custom
    [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 1],
    ], // Custom
    [[0, 0, 1], [1, 1, 1], [1]], // Custom
  ];

  const gameCharacteristics = [
    "Повна шляпа",
    "Невдалець",
    "Середнього рівня",
    "Кращий за середній рівень",
    "Солідний гравець",
    "Досвідчений",
    "Майстер гри",
    "Кращий серед найкращих",
    "Винахідник стратегій",
    "Елітний гравець",
    "Майстер стратегії",
    "Геній гри",
    "Легенда гри",
    "Віртуоз гри",
    "Неодолимий",
    "Непереможний",
    "Владар гри",
    "Імператор гри",
    "Божество гри",
    "Абсолютний Бог Гри",
  ];

  let board = Array.from({ length: rows }, () => Array(cols).fill(0));
  let currentTetromino = {
    shape: tetrominoes[Math.floor(Math.random() * tetrominoes.length)],
    x: Math.floor(cols / 2) - 1,
    y: 0,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    setContext(canvas.getContext("2d"));

    const handleKeyDown = (event) => {
      if (!gameOver) {
        if (event.key === "ArrowLeft") moveTetromino(-1, 0);
        if (event.key === "ArrowRight") moveTetromino(1, 0);
        if (event.key === "ArrowDown") moveTetromino(0, 1);
        if (event.key === "ArrowUp") rotateTetromino();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameOver]);

  useEffect(() => {
    if (context) {
      drawBoard();
      gameLoop();
    }
  }, [context]);

  const drawBoard = () => {
    if (context) {
      context.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (board[row][col]) {
            context.fillStyle = "blue";
            context.fillRect(col * grid, row * grid, grid - 1, grid - 1);
          }
        }
      }
      drawTetromino();
    }
  };

  const drawTetromino = () => {
    currentTetromino.shape.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        if (value) {
          let x = currentTetromino.x + colIndex;
          let y = currentTetromino.y + rowIndex;
          context.fillStyle = "orange";
          context.fillRect(x * grid, y * grid, grid - 1, grid - 1);
        }
      });
    });
  };

  const moveTetromino = (dx, dy) => {
    if (!collision(currentTetromino, dx, dy)) {
      currentTetromino.x += dx;
      currentTetromino.y += dy;
      drawBoard();
    } else if (dy === 1) {
      freezeTetromino();
      clearLines();
      if (currentTetromino.y === 0) {
        endGame();
        return;
      }
      resetTetromino();
      drawBoard();
    }
  };

  const collision = (tetromino, dx, dy) => {
    for (let row = 0; row < tetromino.shape.length; row++) {
      for (let col = 0; col < tetromino.shape[row].length; col++) {
        if (tetromino.shape[row][col]) {
          let newX = tetromino.x + col + dx;
          let newY = tetromino.y + row + dy;

          if (
            newX < 0 ||
            newX >= cols ||
            newY >= rows ||
            (newY >= 0 && board[newY][newX])
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const freezeTetromino = () => {
    currentTetromino.shape.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        if (value) {
          let x = currentTetromino.x + colIndex;
          let y = currentTetromino.y + rowIndex;
          if (y >= 0) {
            board[y][x] = value;
          }
        }
      });
    });
  };

  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const clearLines = () => {
    let linesCleared = 0;

    for (let row = rows - 1; row >= 0; row--) {
      if (board[row].every((cell) => cell)) {
        board.splice(row, 1);
        board.unshift(new Array(cols).fill(0));
        linesCleared++;
        row++;
      }
    }

    if (linesCleared > 0) {
      const scoreMultipliers = [0, 10, 30, 50, 80];
      setScore((prevScore) => prevScore + scoreMultipliers[linesCleared]);
      if (score >= speedUpThreshold * speedLevel) {
        setSpeedLevel((prevLevel) => prevLevel + 1);
        speed = initialSpeed - speedLevel * 50;
      }
    }
  };

  const resetTetromino = () => {
    currentTetromino = {
      shape: tetrominoes[Math.floor(Math.random() * tetrominoes.length)],
      x: Math.floor(cols / 2) - 1,
      y: 0,
    };
  };

  const rotateTetromino = () => {
    const rotatedShape = currentTetromino.shape[0].map((val, index) =>
      currentTetromino.shape.map((row) => row[index]).reverse()
    );

    const originalX = currentTetromino.x;
    const originalY = currentTetromino.y;

    let offset = 1;
    while (
      collision(
        { shape: rotatedShape, x: currentTetromino.x, y: currentTetromino.y },
        0,
        0
      )
    ) {
      currentTetromino.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > rotatedShape[0].length) {
        currentTetromino.x = originalX;
        currentTetromino.y = originalY;
        return;
      }
    }
    currentTetromino.shape = rotatedShape;
    drawBoard();
  };

  const endGame = () => {
    setGameOver(true);
    clearCanvas();
    drawEndGameMessage();
  };

  const clearCanvas = () => {
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const drawEndGameMessage = () => {
    context.fillStyle = "black";
    context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    context.font = "30px Arial";
    context.fillStyle = "white";
    context.textAlign = "center";

    const message =
      "Гру закінчено!\n Ваш рахунок: " +
      score +
      "\nВаш рівень: " +
      speedLevel +
      "\n" +
      gameCharacteristics[speedLevel - 1];

    const lines = message.split("\n");
    const lineHeight = 30;
    const startY = (canvasRef.current.height - lines.length * lineHeight) / 2;
    lines.forEach((line, index) => {
      context.fillText(
        line,
        canvasRef.current.width / 2,
        startY + index * lineHeight
      );
    });
  };

  const gameLoop = () => {
    if (!gameOver) {
      moveTetromino(0, 1);
      setTimeout(gameLoop, speed);
    }
  };

  return (
    <div>
      <div className="canv-container">
        <canvas id="gameCanvas" ref={canvasRef} width="320" height="640" />
      </div>
      <div className="score-container">
        <div id="score">Score: {score}</div>
        <div id="level">Level: {speedLevel}</div>
      </div>
    </div>
  );
};

export default TetrisGame;
