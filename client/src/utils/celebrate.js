import confetti from "canvas-confetti";

export function celebrate() {
  // Left cannon
  confetti({
    particleCount: 120,
    angle: 60,
    spread: 80,
    startVelocity: 60,
    origin: { x: 0, y: 0.75 },
  });

  // Right cannon
  confetti({
    particleCount: 120,
    angle: 120,
    spread: 80,
    startVelocity: 60,
    origin: { x: 1, y: 0.75 },
  });

  // Middle burst
  setTimeout(() => {
    confetti({
      particleCount: 200,
      spread: 360,
      startVelocity: 45,
      ticks: 250,
      origin: { x: 0.5, y: 0.4 },
    });
  }, 250);
}