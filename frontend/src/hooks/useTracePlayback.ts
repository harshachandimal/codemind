import { useState, useEffect, useCallback, useRef } from 'react';
import { TracePlayerStep } from '../types/tracePlayer';

export function useTracePlayback(steps: TracePlayerStep[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(600);
  
  const timerRef = useRef<number | null>(null);

  // Reset when steps change
  useEffect(() => {
    setCurrentIndex(0);
    setIsPlaying(false);
  }, [steps]);

  const canGoNext = currentIndex < steps.length - 1;
  const canGoPrevious = currentIndex > 0;

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const next = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev < steps.length - 1) {
        return prev + 1;
      }
      pause();
      return prev;
    });
  }, [steps.length, pause]);

  const previous = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const play = useCallback(() => {
    if (currentIndex >= steps.length - 1) {
      // If at the end, reset to beginning before playing
      setCurrentIndex(0);
    }
    setIsPlaying(true);
  }, [currentIndex, steps.length]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const reset = useCallback(() => {
    pause();
    setCurrentIndex(0);
  }, [pause]);

  // Handle auto-advance
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev < steps.length - 1) {
            return prev + 1;
          }
          // Stop when reaching the end
          setIsPlaying(false);
          if (timerRef.current !== null) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return prev;
        });
      }, speedMs);
    } else if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, speedMs, steps.length]);

  const jumpTo = useCallback((index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentIndex(index);
    }
  }, [steps.length]);

  return {
    currentStep: steps[currentIndex] || null,
    currentIndex,
    isPlaying,
    speedMs,
    canGoNext,
    canGoPrevious,
    play,
    pause,
    togglePlay,
    next,
    previous,
    reset,
    jumpTo,
    setSpeedMs,
  };
}
