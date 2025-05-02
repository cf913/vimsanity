import React from "react";

/**
 * ConfettiBurst renders a burst of confetti particles falling down.
 * Usage: <ConfettiBurst />
 */
const ConfettiBurst: React.FC = () => (
  <div className="absolute left-1/2 transform -translate-x-1/2">
    {Array.from({ length: 30 }).map((_, i) => (
      <div
        key={i}
        className="absolute"
        style={{
          left: `${Math.random() * 200 - 100}px`,
          top: `${Math.random() * 10}px`,
          width: `${Math.random() * 8 + 2}px`,
          height: `${Math.random() * 8 + 2}px`,
          borderRadius: "50%",
          background: [
            "#FF5555",
            "#55FF55",
            "#5555FF",
            "#FFFF55",
            "#FF55FF",
            "#55FFFF",
          ][Math.floor(Math.random() * 6)],
          animation: `confetti-fall ${Math.random() * 2 + 1}s linear forwards`,
          transform: `rotate(${Math.random() * 360}deg)`,
        }}
      />
    ))}
    <style>
      {`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100px) rotate(360deg);
            opacity: 0;
          }
        }
      `}
    </style>
  </div>
);

export default ConfettiBurst;
