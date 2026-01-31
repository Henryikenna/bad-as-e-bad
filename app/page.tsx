"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StarfieldCanvas from "./components/StarfieldCanvas";
import FilmGrain from "./components/FilmGrain";
import AmbientAudio from "./components/AmbientAudio";

/**
 * Valentine's Proposal - A cinematic, scene-based experience
 *
 * This component orchestrates a sequence of scenes that unfold like a short film.
 * No scrolling, no navigation—just intentional pacing and emotional storytelling.
 */

// Shared transition config for cinematic feel
const sceneTransition = {
  duration: 0.8,
  ease: [0.43, 0.13, 0.23, 0.96] as const,
};

// Montage lines - displayed one at a time to build emotional momentum
const montageLines = [
  "Your random 'I love you' texts make my whole day.",
  "You want to stay in touch even when there's nothing new to say.",
  "You make the distance feel smaller than it is.",
  "Missing you is easier because I know you're thinking of me too.",
  "You show up in every way you can from where you are.",
  "Talking to you feels like coming home.",
];

export default function ValentineProposal() {
  const [scene, setScene] = useState(0);
  const [montageIndex, setMontageIndex] = useState(0);
  const [typingComplete, setTypingComplete] = useState(false);
  // Tracks the most recent button interaction for SFX triggering
  const [lastInteraction, setLastInteraction] = useState<"yes" | "no" | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(true);

  // Scene advancement helper
  const advanceTo = useCallback((nextScene: number) => {
    setScene(nextScene);
  }, []);

  // Send email notification for the Valentine answer
  // Fire-and-forget: don't block the scene transition
  const notifyAnswer = useCallback((answer: "yes" | "no") => {
    fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer }),
    }).catch(() => {
      // Silently fail — the experience matters more than the notification
    });
  }, []);

  // Scene 0: Click anywhere to begin
  const handleStart = useCallback(() => {
    if (scene === 0) {
      advanceTo(1);
    }
  }, [scene, advanceTo]);

  // Keyboard support for Scene 0
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (scene === 0 && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        advanceTo(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scene, advanceTo]);

  // Auto-advance logic for timed scenes
  useEffect(() => {
    let timer: NodeJS.Timeout;

    // Scene 1, 2 & 3: Auto-advance after 4 seconds
    // This pacing allows the text to breathe and sink in
    if (scene === 1 || scene === 2 || scene === 3) {
      timer = setTimeout(() => {
        advanceTo(scene + 1);
      }, 4000);
    }

    return () => clearTimeout(timer);
  }, [scene, advanceTo]);

  // Scene 5: Montage progression
  // Wait for typing to complete, then wait 4 seconds before advancing
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (scene === 5 && typingComplete) {
      if (montageIndex < montageLines.length - 1) {
        // After typing completes, wait 4 seconds then advance to next line
        timer = setTimeout(() => {
          setTypingComplete(false);
          setMontageIndex((prev) => prev + 1);
        }, 4000);
      } else {
        // After final line typing completes, wait 4 seconds for emotional landing
        // Then advance to the dramatic pause
        timer = setTimeout(() => {
          advanceTo(6);
        }, 4000);
      }
    }

    return () => clearTimeout(timer);
  }, [scene, montageIndex, typingComplete, advanceTo]);

  // Reset montage index and typing state when entering Scene 5
  useEffect(() => {
    if (scene === 5) {
      setMontageIndex(0);
      setTypingComplete(false);
    }
  }, [scene]);

  // Handler for when typewriter finishes typing a line
  const handleTypingComplete = useCallback(() => {
    setTypingComplete(true);
  }, []);

  return (
    <div
      className="fixed inset-0 bg-midnight overflow-hidden"
      onClick={handleStart}
      role={scene === 0 ? "button" : undefined}
      tabIndex={scene === 0 ? 0 : undefined}
      aria-label={scene === 0 ? "Click or press Enter to begin" : undefined}
    >
      {/* Atmosphere layers */}
      <StarfieldCanvas />
      <FilmGrain />
      <AmbientAudio scene={scene} lastInteraction={lastInteraction} isPlaying={isAudioPlaying} />

      {/* Audio toggle — top-right, only visible after the experience begins */}
      {scene >= 1 && (
        <button
          className="fixed top-6 right-6 z-30 flex justify-end h-4 mt-2 items-end gap-0.5 cursor-pointer p-2"
          onClick={(e) => {
            e.stopPropagation();
            setIsAudioPlaying((prev) => !prev);
          }}
          aria-label={isAudioPlaying ? "Mute audio" : "Unmute audio"}
        >
          {[1, 2, 3, 4].map((bar) => (
            <div
              key={bar}
              className={`indicator-line ${isAudioPlaying ? "active" : ""}`}
              style={{ animationDelay: `${bar * 0.1}s` }}
            />
          ))}
        </button>
      )}

      {/* Centered content wrapper — z-20 sits above stars and grain */}
      <div className="relative z-20 flex items-center justify-center min-h-screen px-6">
        <div className="max-w-2xl mx-auto text-center">
          <AnimatePresence mode="wait">
            {/* Scene 0: Start screen */}
            {scene === 0 && (
              <Scene key="scene-0">
                <p className="font-body text-lg text-muted-slate font-light animate-pulse cursor-pointer">
                  Click anywhere to begin
                </p>
              </Scene>
            )}

            {/* Scene 1: Personalized greeting */}
            {scene === 1 && (
              <Scene key="scene-1">
                <Headline>Hey, Alexis</Headline>
              </Scene>
            )}

            {/* Scene 2: Opening line - sets the tone */}
            {scene === 2 && (
              <Scene key="scene-2">
                <Headline>I have a question.</Headline>
              </Scene>
            )}

            {/* Scene 3: Building anticipation */}
            {scene === 3 && (
              <Scene key="scene-3">
                <Headline>But before that, I need to ask something first.</Headline>
              </Scene>
            )}

            {/* Scene 4: First decision point - vulnerability check */}
            {scene === 4 && (
              <Scene key="scene-4">
                {/* <Headline>Can I tell you what you mean to me?</Headline> */}
                <Headline>Can I be a little honest with you?</Headline>
                <ButtonGroup>
                  {/* <YesButton onClick={() => advanceTo(5)}>Tell me</YesButton> */}
                  <YesButton onClick={() => { setLastInteraction("yes"); advanceTo(5); }}>Yes</YesButton>
                  <NoButton onClick={() => { setLastInteraction("no"); advanceTo(9); }}>Not now</NoButton>
                </ButtonGroup>
              </Scene>
            )}

            {/* Scene 5: Montage - the emotional core with typewriter effect */}
            {scene === 5 && (
              <Scene key="scene-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={montageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={sceneTransition}
                  >
                    <Typewriter
                      text={montageLines[montageIndex]}
                      onComplete={handleTypingComplete}
                      speed={60}
                    />
                  </motion.div>
                </AnimatePresence>
              </Scene>
            )}

            {/* Scene 6: Dramatic pause - building tension before the question */}
            {scene === 6 && (
              <Scene key="scene-6">
                <DramaticPause onComplete={() => advanceTo(7)} />
              </Scene>
            )}

            {/* Scene 7: The proposal */}
            {scene === 7 && (
              <Scene key="scene-7">
                <Headline>Will you be my Valentine?</Headline>
                <ButtonGroup>
                  <YesButton onClick={() => { setLastInteraction("yes"); notifyAnswer("yes"); advanceTo(8); }}>Yesss, baby!</YesButton>
                  <NoButton onClick={() => { setLastInteraction("no"); notifyAnswer("no"); advanceTo(9); }}>Nah nga, tf?</NoButton>
                </ButtonGroup>
              </Scene>
            )}

            {/* Scene 8: YES ending - celebration with restraint */}
            {scene === 8 && (
              <Scene key="scene-8">
                <YesEnding />
              </Scene>
            )}

            {/* Scene 9: NO ending - graceful acceptance */}
            {scene === 9 && (
              <Scene key="scene-9">
                <NoEnding />
              </Scene>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/**
 * Scene wrapper - handles enter/exit animations
 */
function Scene({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={sceneTransition}
      className="flex flex-col items-center gap-12"
    >
      {children}
    </motion.div>
  );
}

/**
 * Headline text - the primary emotional voice
 */
function Headline({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-soft-white font-normal tracking-wide">
      {children}
    </h1>
  );
}

/**
 * Typewriter effect - types out text character by character
 * Slow pace (~100ms per character) for emotional weight
 */
function Typewriter({
  text,
  onComplete,
  speed = 100,
}: {
  text: string;
  onComplete: () => void;
  speed?: number;
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
  }, [text]);

  // Type out characters one by one
  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (currentIndex === text.length && text.length > 0) {
      // Typing complete
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <p className="font-body text-xl md:text-2xl lg:text-3xl text-soft-white font-light">
      {displayedText}
      {/* Blinking cursor while typing */}
      {currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </p>
  );
}

/**
 * Button container with appropriate spacing
 */
function ButtonGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row gap-6 mt-4">
      {children}
    </div>
  );
}

/**
 * YES button - crimson, visually dominant, inviting
 */
function YesButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className="px-12 md:px-20 py-4 md:py-6 cursor-pointer bg-crimson text-soft-white rounded shadow-[0_0_20px_rgba(230,57,70,0.3)] hover:scale-105 transition-all font-body text-lg md:text-xl font-light tracking-widest focus:outline-none focus:ring-2 focus:ring-crimson focus:ring-offset-2 focus:ring-offset-midnight"
    >
      {children}
    </motion.button>
  );
}

/**
 * NO button - muted, respectful, never pushy
 */
function NoButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ opacity: 0.8 }}
      whileTap={{ scale: 0.98 }}
      className="px-12 md:px-20 py-4 md:py-6 cursor-pointer bg-transparent text-muted-slate border border-muted-slate opacity-50 hover:opacity-80 rounded font-body text-lg md:text-xl font-light tracking-widest focus:outline-none focus:ring-2 focus:ring-muted-slate focus:ring-offset-2 focus:ring-offset-midnight"
    >
      {children}
    </motion.button>
  );
}

/**
 * YES ending - staged reveal with gentle celebration
 * Line 1 appears immediately, Line 2 after 1s, heart after 2s
 */
function YesEnding() {
  const [showSecondLine, setShowSecondLine] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

  useEffect(() => {
    // Second line appears after 1 second - letting the first line land
    const secondLineTimer = setTimeout(() => setShowSecondLine(true), 1500);
    // Heart appears after 2 seconds - the final emotional punctuation
    const heartTimer = setTimeout(() => setShowHeart(true), 3000);

    return () => {
      clearTimeout(secondLineTimer);
      clearTimeout(heartTimer);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-8">
      <Headline>I was hoping you'd say that.</Headline>

      <AnimatePresence>
        {showSecondLine && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={sceneTransition}
            className="font-body text-xl md:text-2xl lg:text-3xl text-soft-white font-light"
          >
            I love you baby.
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHeart && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={sceneTransition}
            className="text-6xl animate-pulse"
          >
            🤍
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Dramatic pause - "So here goes my question..." with dots appearing one by one
 * Each dot appears 1 second apart, building anticipation before the proposal
 */
function DramaticPause({ onComplete }: { onComplete: () => void }) {
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    if (dotCount < 3) {
      // Each dot appears 1 second after the previous
      const timer = setTimeout(() => {
        setDotCount((prev) => prev + 1);
      }, 1350);
      return () => clearTimeout(timer);
    } else {
      // After all three dots, wait a moment then advance
      const timer = setTimeout(() => {
        onComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [dotCount, onComplete]);

  return (
    <div className="flex flex-col items-center gap-4">
      <Headline>
        Okay, so the actual question
        <span className="inline-block w-[1.5ch]">
          {/* Dots appear one by one for dramatic effect */}
          {Array.from({ length: dotCount }).map((_, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              .
            </motion.span>
          ))}
        </span>
      </Headline>
    </div>
  );
}

/**
 * NO ending - graceful, warm, no guilt
 * The tone here matters—respect their honesty, maintain dignity
 */
function NoEnding() {
  const [showSecondLine, setShowSecondLine] = useState(false);

  useEffect(() => {
    // Second line after 1 second - reinforcing that it's truly okay
    const timer = setTimeout(() => setShowSecondLine(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center gap-8">
      <Headline>That's okay. I'm really glad you were honest.</Headline>

      <AnimatePresence>
        {showSecondLine && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={sceneTransition}
            className="font-body text-xl md:text-2xl lg:text-3xl text-soft-white font-light"
          >
            Nothing changes, I still appreciate you.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}


