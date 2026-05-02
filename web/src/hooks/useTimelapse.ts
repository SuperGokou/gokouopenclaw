import { useState, useEffect, useRef, useCallback } from 'react';
import type { TimelapseSnapshot, PlaybackSpeed } from '@/types';

export function useTimelapse() {
  const [snapshots, setSnapshots] = useState<TimelapseSnapshot[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeedState] = useState<PlaybackSpeed>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const indexRef = useRef(currentIndex);
  useEffect(() => {
    indexRef.current = currentIndex;
  }, [currentIndex]);

  // Load graph data
  useEffect(() => {
    fetch('/graph-data.json')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<TimelapseSnapshot[]>;
      })
      .then(data => {
        setSnapshots(data);
        setLoading(false);
      })
      .catch(e => {
        setError(String(e));
        setLoading(false);
      });
  }, []);

  const stopInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Manage playback interval
  useEffect(() => {
    stopInterval();
    if (!isPlaying || snapshots.length === 0) return;

    const delay = 2000 / speed;
    intervalRef.current = setInterval(() => {
      const next = indexRef.current + 1;
      if (next >= snapshots.length) {
        setIsPlaying(false);
        return;
      }
      setCurrentIndex(next);
    }, delay);

    return stopInterval;
  }, [isPlaying, speed, snapshots.length, stopInterval]);

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const seek = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, snapshots.length - 1)));
  }, [snapshots.length]);
  const setSpeed = useCallback((s: PlaybackSpeed) => setSpeedState(s), []);

  const currentSnapshot = snapshots[currentIndex] ?? null;

  return {
    snapshots,
    currentIndex,
    currentSnapshot,
    isPlaying,
    speed,
    loading,
    error,
    play,
    pause,
    seek,
    setSpeed,
  };
}
