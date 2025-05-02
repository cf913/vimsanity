import React from "react"

/**
 * ExplosionEffect renders a white ring and purple glow explosion with optional particles.
 * It is absolutely positioned to fill its parent.
 * Usage: <ExplosionEffect />
 */
const ExplosionEffect: React.FC = () => (
  <div className="absolute inset-0 z-20 pointer-events-none">
    <div
      className="absolute inset-0 rounded-md bg-white"
      style={{
        animation: "explosion-ring 0.3s forwards ease-out",
      }}
    />
    <div
      className="absolute inset-0 rounded-md bg-purple-500"
      style={{
        animation: "explosion-glow 0.3s forwards ease-out",
      }}
    />
    {/* Optional: Particles (hidden for now for performance) */}
    {/* {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="absolute w-2 h-2 bg-white rounded-full"
        style={{
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-15px)`,
          animation: 'explosion-particle 0.3s forwards ease-out',
        }}
      />
    ))} */}
    <style>{`
      @keyframes explosion-ring {
        0% { transform: scale(0.8); opacity: 0.9; }
        60% { transform: scale(1.8); opacity: 0.7; }
        100% { transform: scale(2.5); opacity: 0; }
      }
      @keyframes explosion-glow {
        0% { transform: scale(0.8); opacity: 0.9; box-shadow: 0 0 30px 20px rgba(168, 85, 247, 0.8); }
        100% { transform: scale(1.5); opacity: 0; box-shadow: 0 0 0 0 rgba(168, 85, 247, 0); }
      }
      @keyframes explosion-particle {
        0% { opacity: 1; transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-15px) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-40px) scale(0); }
      }
    `}</style>
  </div>
)

export default ExplosionEffect
