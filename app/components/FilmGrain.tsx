"use client";

/**
 * FilmGrain — a subtle analog texture overlay
 *
 * Sits above the starfield but below content, adding warmth
 * and a cinematic, slightly imperfect quality to the visuals.
 * Uses CSS gradient noise animated with keyframes.
 */
export default function FilmGrain() {
  return (
    <div
      className="fixed inset-0 z-10 pointer-events-none opacity-[0.04] animate-grain"
      aria-hidden="true"
      style={{
        backgroundImage: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 1px,
          rgba(255,255,255,0.03) 1px,
          rgba(255,255,255,0.03) 2px
        ),
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent 1px,
          rgba(255,255,255,0.03) 1px,
          rgba(255,255,255,0.03) 2px
        )`,
        backgroundSize: "4px 4px",
      }}
    />
  );
}
