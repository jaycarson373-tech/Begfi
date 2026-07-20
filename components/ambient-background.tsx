"use client";

import { motion } from "framer-motion";

const particles = [
  { left: "6%", top: "18%", size: 2, delay: 0.2, duration: 8 },
  { left: "13%", top: "61%", size: 3, delay: 1.4, duration: 10 },
  { left: "20%", top: "36%", size: 2, delay: 2.1, duration: 7 },
  { left: "29%", top: "76%", size: 2, delay: 0.8, duration: 11 },
  { left: "37%", top: "24%", size: 3, delay: 2.8, duration: 9 },
  { left: "44%", top: "66%", size: 2, delay: 1.2, duration: 8 },
  { left: "53%", top: "15%", size: 2, delay: 3.1, duration: 10 },
  { left: "61%", top: "48%", size: 3, delay: 0.4, duration: 12 },
  { left: "69%", top: "79%", size: 2, delay: 2.4, duration: 9 },
  { left: "76%", top: "29%", size: 2, delay: 1.7, duration: 8 },
  { left: "84%", top: "57%", size: 3, delay: 3.4, duration: 11 },
  { left: "93%", top: "21%", size: 2, delay: 0.9, duration: 9 }
];

export function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="hero-grid absolute inset-0" />
      <div className="hero-radial absolute inset-0" />
      <motion.div
        className="light-beam absolute -left-[16%] top-[8%] h-[52rem] w-[34rem]"
        animate={{ x: [0, 90, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="light-beam light-beam-right absolute -right-[18%] top-[3%] h-[48rem] w-[30rem]"
        animate={{ x: [0, -70, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
      />
      {particles.map((particle, index) => (
        <motion.span
          key={`${particle.left}-${particle.top}`}
          className="absolute rounded-full bg-[#79a5ff] shadow-[0_0_12px_rgba(25, 118, 255,0.9)]"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size
          }}
          animate={{ y: [0, -24 - (index % 3) * 6, 0], opacity: [0.12, 0.72, 0.12] }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}
