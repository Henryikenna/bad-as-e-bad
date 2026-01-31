"use client";

import { useEffect, useRef, useCallback } from "react";
import * as Tone from "tone";

/**
 * AmbientAudio — a warm, restrained soundscape
 *
 * Starts only after user interaction (Scene 0 click → Scene 1).
 * Music begins once and never restarts on scene changes.
 * Provides subtle sound effects for interactions.
 */

// Chord progression — 4 chords, 8 seconds each, looping
// Chosen for warmth and gentle emotional movement
const CHORDS = [
  ["C4", "E4", "G4"],   // C major — open, warm
  ["A3", "C4", "E4"],   // A minor — tender, reflective
  ["F3", "A3", "C4"],   // F major — gentle, grounded
  ["G3", "B3", "D4"],   // G major — hopeful, resolving
];

const CHORD_DURATION = 8; // seconds per chord

type SfxType = "transition" | "yes" | "no";

interface AmbientAudioProps {
  scene: number;
  lastInteraction?: SfxType | null;
  isPlaying?: boolean;
}

export default function AmbientAudio({ scene, lastInteraction, isPlaying = true }: AmbientAudioProps) {
  const musicStartedRef = useRef(false);
  const synthRef = useRef<Tone.PolySynth | null>(null);
  // Two separate SFX synths to avoid start-time collisions when
  // a button click triggers both a scene change and an interaction SFX
  const transitionSynthRef = useRef<Tone.Synth | null>(null);
  const buttonSynthRef = useRef<Tone.Synth | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);
  const loopRef = useRef<Tone.Loop | null>(null);
  const chordIndexRef = useRef(0);
  const prevSceneRef = useRef(0);

  // Initialize audio nodes (lazy, once)
  const ensureNodes = useCallback(() => {
    if (synthRef.current) return;

    const reverb = new Tone.Reverb({ decay: 6, wet: 0.7 }).toDestination();
    reverbRef.current = reverb;

    // Ambient pad — soft sine tones, long envelopes
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: {
        attack: 2,
        decay: 1,
        sustain: 0.6,
        release: 4,
      },
      volume: -22,
    }).connect(reverb);
    synthRef.current = synth;

    // Transition SFX — quiet ping on scene changes
    const transitionSynth = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.05, decay: 0.3, sustain: 0, release: 0.8 },
      volume: -28,
    }).connect(reverb);
    transitionSynthRef.current = transitionSynth;

    // Button SFX — separate voice so it never collides with transition pings
    const buttonSynth = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.05, decay: 0.3, sustain: 0, release: 0.8 },
      volume: -28,
    }).connect(reverb);
    buttonSynthRef.current = buttonSynth;
  }, []);

  // Start the ambient chord loop (called once at Scene 1)
  const startMusic = useCallback(async () => {
    if (musicStartedRef.current) return;
    musicStartedRef.current = true;

    await Tone.start();
    ensureNodes();

    const synth = synthRef.current!;
    chordIndexRef.current = 0;

    // Play first chord immediately
    synth.triggerAttackRelease(CHORDS[0], CHORD_DURATION - 0.5);

    // Loop through chords
    const loop = new Tone.Loop((time) => {
      chordIndexRef.current = (chordIndexRef.current + 1) % CHORDS.length;
      const chord = CHORDS[chordIndexRef.current];
      synth.triggerAttackRelease(chord, CHORD_DURATION - 0.5, time);
    }, CHORD_DURATION);

    loop.start(Tone.now() + CHORD_DURATION);
    loopRef.current = loop;

    Tone.getTransport().start();
  }, [ensureNodes]);

  // Start music when entering Scene 1
  useEffect(() => {
    if (scene >= 1 && !musicStartedRef.current) {
      startMusic();
    }
  }, [scene, startMusic]);

  // Scene transition SFX
  useEffect(() => {
    if (scene === prevSceneRef.current) return;
    prevSceneRef.current = scene;

    if (!musicStartedRef.current || scene <= 1) return;

    ensureNodes();
    const sfx = transitionSynthRef.current;
    if (!sfx) return;

    // Quiet transition ping
    sfx.triggerAttackRelease("C4", "8n", undefined, 0.3);
  }, [scene, ensureNodes]);

  // Button SFX
  useEffect(() => {
    if (!lastInteraction || !musicStartedRef.current) return;

    ensureNodes();
    const sfx = buttonSynthRef.current;
    if (!sfx) return;

    if (lastInteraction === "yes") {
      sfx.triggerAttackRelease("E4", "4n", undefined, 0.4);
    } else if (lastInteraction === "no") {
      sfx.triggerAttackRelease("A3", "8n", undefined, 0.2);
    }
  }, [lastInteraction, ensureNodes]);

  // Mute/unmute all synths when toggled
  useEffect(() => {
    if (!musicStartedRef.current) return;
    const muted = !isPlaying;
    if (synthRef.current) synthRef.current.volume.value = muted ? -Infinity : -22;
    if (transitionSynthRef.current) transitionSynthRef.current.volume.value = muted ? -Infinity : -28;
    if (buttonSynthRef.current) buttonSynthRef.current.volume.value = muted ? -Infinity : -28;
  }, [isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      loopRef.current?.dispose();
      synthRef.current?.dispose();
      transitionSynthRef.current?.dispose();
      buttonSynthRef.current?.dispose();
      reverbRef.current?.dispose();
      Tone.getTransport().stop();
    };
  }, []);

  // This component renders nothing — it's purely behavioral
  return null;
}
