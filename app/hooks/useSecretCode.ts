"use client";

import { useState, useEffect, useCallback } from "react";

type EffectType = "snow" | "newyear" | null;

const SECRET_CODES: Record<string, EffectType> = {
  XMAS: "snow",
  NEWYEAR: "newyear",
  KONAMI: null, // Will randomly select
};

const BUFFER_TIMEOUT = 2000; // Clear buffer after 2 seconds of inactivity
const MAX_BUFFER_LENGTH = 10;

export function useSecretCode() {
  const [activeEffect, setActiveEffect] = useState<EffectType>(null);
  const [keyBuffer, setKeyBuffer] = useState<string>("");
  const [lastKeyTime, setLastKeyTime] = useState<number>(0);

  // Clear buffer after timeout
  useEffect(() => {
    if (keyBuffer.length === 0) return;

    const timeSinceLastKey = Date.now() - lastKeyTime;
    const remainingTime = BUFFER_TIMEOUT - timeSinceLastKey;

    if (remainingTime <= 0) {
      setKeyBuffer("");
      return;
    }

    const timeout = setTimeout(() => {
      setKeyBuffer("");
    }, remainingTime);

    return () => clearTimeout(timeout);
  }, [keyBuffer, lastKeyTime]);

  const handleKeyPress = useCallback(
    (key: string) => {
      const now = Date.now();
      setLastKeyTime(now);

      // Update buffer
      const newBuffer = (keyBuffer + key.toUpperCase()).slice(-MAX_BUFFER_LENGTH);
      setKeyBuffer(newBuffer);

      // Check for secret codes
      for (const [code, effect] of Object.entries(SECRET_CODES)) {
        if (newBuffer.endsWith(code)) {
          // Toggle effect if same code is entered again
          if (activeEffect === effect) {
            setActiveEffect(null);
          } else {
            // Handle KONAMI code - random effect
            if (code === "KONAMI") {
              const effects: EffectType[] = ["snow", "newyear"];
              const randomEffect = effects[Math.floor(Math.random() * effects.length)];
              setActiveEffect(randomEffect);
            } else {
              setActiveEffect(effect);
            }
          }
          setKeyBuffer(""); // Clear buffer after successful code
          break;
        }
      }
    },
    [keyBuffer, activeEffect]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Only track letter keys
      if (event.key.length === 1 && event.key.match(/[a-z]/i)) {
        handleKeyPress(event.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress]);

  return { activeEffect, setActiveEffect };
}