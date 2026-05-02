import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTimelapse } from '@/hooks/useTimelapse';
import GraphCanvas from '@/components/GraphCanvas';
import TimelineBar from '@/components/TimelineBar';
import StatsDashboard from '@/components/StatsDashboard';
import NodeTooltip from '@/components/NodeTooltip';
import type { RenderNode } from '@/types';

export default function App() {
  const {
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
  } = useTimelapse();

  const previousSnapshot = snapshots[currentIndex - 1] ?? null;

  const [hoveredNode, setHoveredNode] = useState<RenderNode | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hoveredNodeRef = useRef<RenderNode | null>(null);
  hoveredNodeRef.current = hoveredNode;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
      if (hoveredNodeRef.current) {
        setMousePos({ x: e.clientX, y: e.clientY });
      }
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  // Empty deps intentional: mousePosRef is a ref, so reading .current never causes stale closure.
  const handleNodeHoverWithPos = useCallback((node: RenderNode | null) => {
    setHoveredNode(node);
    if (node) {
      setMousePos(mousePosRef.current);
    } else {
      setMousePos(null);
    }
  }, []);

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-full border-2 animate-spin"
            style={{ borderColor: 'rgba(0,212,255,0.2)', borderTopColor: '#00d4ff' }}
          />
          <p className="text-cyber-blue font-mono text-sm">Loading graph data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black">
        <div
          className="p-8 rounded-2xl max-w-md text-center"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,80,80,0.3)',
          }}
        >
          <p className="text-red-400 font-mono text-sm mb-2">Failed to load graph data</p>
          <p className="text-white/40 font-mono text-xs">{error}</p>
        </div>
      </div>
    );
  }

  if (snapshots.length === 0) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black">
        <div
          className="p-8 rounded-2xl max-w-md text-center"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(0,212,255,0.15)',
          }}
        >
          <p className="text-cyber-blue font-mono text-sm">No graph snapshots found</p>
          <p className="text-white/30 font-mono text-xs mt-2">
            Add some markdown files with [[wikilinks]] and commit them.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{
        background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #000000 70%)',
      }}
    >
      {/* Background grid decoration */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Title bar */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className="fixed top-6 right-6 z-20 flex items-center gap-3"
      >
        <div className="flex flex-col items-end">
          <span className="text-white/80 font-mono text-sm font-medium tracking-wide">
            Graph Timelapse
          </span>
          <span className="text-white/25 font-mono text-xs">Knowledge Galaxy</span>
        </div>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: 'rgba(0,212,255,0.08)',
            border: '1px solid rgba(0,212,255,0.25)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="3" cy="3" r="2" fill="#00d4ff" />
            <circle cx="13" cy="5" r="2" fill="#00d4ff" />
            <circle cx="8" cy="13" r="2" fill="#00d4ff" />
            <line x1="3" y1="3" x2="13" y2="5" stroke="rgba(0,212,255,0.4)" strokeWidth="1" />
            <line x1="13" y1="5" x2="8" y2="13" stroke="rgba(0,212,255,0.4)" strokeWidth="1" />
            <line x1="3" y1="3" x2="8" y2="13" stroke="rgba(0,212,255,0.4)" strokeWidth="1" />
          </svg>
        </div>
      </motion.div>

      {/* Graph */}
      <GraphCanvas
        currentSnapshot={currentSnapshot}
        previousSnapshot={previousSnapshot}
        onNodeHover={handleNodeHoverWithPos}
      />

      {/* Stats overlay */}
      <StatsDashboard snapshot={currentSnapshot} />

      {/* Timeline */}
      <TimelineBar
        snapshots={snapshots}
        currentIndex={currentIndex}
        isPlaying={isPlaying}
        speed={speed}
        onPlay={play}
        onPause={pause}
        onSeek={seek}
        onSetSpeed={setSpeed}
      />

      {/* Tooltip */}
      <NodeTooltip
        node={hoveredNode}
        mousePos={mousePos}
        snapshot={currentSnapshot}
      />
    </div>
  );
}
