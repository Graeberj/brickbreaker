import { useEffect, useRef, useState } from "react";

const Game = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ballRef = useRef({
    x: 200,
    y: 150,
    dx: 0.5,
    dy: -1.5,
    radius: 10,
  });
  const [mouseX, setMouseX] = useState(0); // Store the mouseX position
  const paddleWidth = 75;
  const paddleHeight = 10;
  const brickRowCount = 6;
  const brickColumnCount = 6;
  const brickWidth = 75;
  const brickHeight = 20;
  const brickPadding = 10;
  const [bricks, setBricks] = useState(
    Array.from({ length: brickRowCount }, () =>
      Array(brickColumnCount).fill(true)
    )
  );
  const [score, setScore] = useState(0);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Colors
  const brickColors = ["green", "orange", "purple", "black"];
  const paddleColor = "black";
  const ballColor = "black";
  const backColor = "grey";

  // Handle mouse movement
  const handleMouseMove = (event: MouseEvent) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const canvasPos = canvas.getBoundingClientRect();
      setMouseX(event.clientX - canvasPos.left);
    }
  };
  const handleKeyPress = () => {
    setPaused((prevPaused) => !prevPaused);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || paused || gameOver) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId: number;

    if (!ctx) return;

    const draw = () => {
      if (paused || gameOver) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = backColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate paddle position based on mouseX
      const paddleX = Math.min(
        Math.max(mouseX - paddleWidth / 2, 0),
        canvas.width - paddleWidth
      );

      // Draw paddle
      ctx.fillStyle = paddleColor;
      ctx.fillRect(
        paddleX,
        canvas.height - paddleHeight,
        paddleWidth,
        paddleHeight
      );

      // Draw ball
      const ball = ballRef.current;
      ctx.fillStyle = ballColor;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, true);
      ctx.fill();

      // Draw bricks
      bricks.forEach((row, rowIndex) => {
        row.forEach((brick, columnIndex) => {
          if (brick) {
            ctx.fillStyle =
              brickColors[(rowIndex + columnIndex) % brickColors.length];
            let brickX =
              columnIndex * (brickWidth + brickPadding) + brickPadding;
            let brickY = rowIndex * (brickHeight + brickPadding) + brickPadding;
            ctx.fillRect(brickX, brickY, brickWidth, brickHeight);
          }
        });
      });

      // Update ball position
      ball.x += ball.dx;
      ball.y += ball.dy;

      // Wall collision logic for ball
      if (
        ball.x + ball.dx > canvas.width - ball.radius ||
        ball.x + ball.dx < ball.radius
      ) {
        ball.dx = -ball.dx;
      }
      if (ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
      } else if (
        ball.y + ball.dy >
        canvas.height - paddleHeight - ball.radius
      ) {
        if (ball.x > paddleX && ball.x < paddleX + paddleWidth) {
          ball.dy = -ball.dy;
        } else if (ball.y + ball.dy > canvas.height - ball.radius) {
          setGameOver(true);
          return; // Stop the game loop
        }
      }

      // Check brick collisions
      bricks.forEach((row, rowIndex) => {
        row.forEach((brick, columnIndex) => {
          if (brick) {
            let brickX =
              columnIndex * (brickWidth + brickPadding) + brickPadding;
            let brickY = rowIndex * (brickHeight + brickPadding) + brickPadding;
            if (
              ball.x > brickX &&
              ball.x < brickX + brickWidth &&
              ball.y > brickY &&
              ball.y < brickY + brickHeight
            ) {
              ball.dy = -ball.dy;
              bricks[rowIndex][columnIndex] = false;
              setScore((prevScore) => prevScore + 1);
            }
          }
        });
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [bricks, paused, gameOver, mouseX]);

  // Reload game
  const reload = () => {
    ballRef.current = {
      x: 200,
      y: 150,
      dx: 0.4,
      dy: -1,
      radius: 10,
    };
    setBricks(
      Array.from({ length: brickRowCount }, () =>
        Array(brickColumnCount).fill(true)
      )
    );
    setScore(0);
    setPaused(false);
    setGameOver(false);
  };

  // Toggle pause
  const togglePause = () => {
    setPaused(!paused);
  };

  return (
    <div>
      <canvas ref={canvasRef} width="500" height="300" />
      <p>Mouse moves platform &bull; Press any key to pause</p>
      <button onClick={reload}>Play again</button>
      <button onClick={togglePause}>{paused ? "Resume" : "Pause"}</button>
      <div>Score: {score}</div>
      {gameOver && <div>Game Over</div>}
    </div>
  );
};

export default Game;
