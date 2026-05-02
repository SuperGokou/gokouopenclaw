import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { TimelapseSnapshot } from '@/types';

interface Props {
  snapshot: TimelapseSnapshot | null;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function StatsDashboard({ snapshot }: Props) {
  const mostLinked = useMemo(() => {
    if (!snapshot || snapshot.edges.length === 0) return null;
    const counts = new Map<string, number>();
    for (const e of snapshot.edges) {
      const src = typeof e.source === 'string' ? e.source : (e.source as { id: string }).id;
      const tgt = typeof e.target === 'string' ? e.target : (e.target as { id: string }).id;
      counts.set(src, (counts.get(src) ?? 0) + 1);
      counts.set(tgt, (counts.get(tgt) ?? 0) + 1);
    }
    let best = '';
    let bestCount = 0;
    for (const [id, count] of counts) {
      if (count > bestCount) {
        bestCount = count;
        best = id;
      }
    }
    const node = snapshot.nodes.find(n => n.id === best);
    return node ? `${node.label} (${bestCount})` : null;
  }, [snapshot]);

  const glassStyle: React.CSSProperties = {
    backdropFilter: 'blur(16px)',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(0,212,255,0.2)',
    borderRadius: '16px',
  };

  return (
    <motion.div
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.1 }}
      className="fixed top-6 left-6 z-20 p-5 w-64"
      style={glassStyle}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ background: '#00d4ff', boxShadow: '0 0 8px #00d4ff' }}
        />
        <span className="text-cyber-blue font-mono text-xs uppercase tracking-widest font-medium">
          Knowledge Graph
        </span>
      </div>

      {/* Metrics */}
      <div className="space-y-3">
        <MetricRow emoji="📄" label="Total Notes" value={snapshot?.nodes.length ?? 0} />
        <MetricRow emoji="🔗" label="Connections" value={snapshot?.edges.length ?? 0} />
        <div
          className="h-px w-full my-1"
          style={{ background: 'rgba(0,212,255,0.15)' }}
        />
        <div className="flex flex-col gap-0.5">
          <span className="text-white/40 font-mono text-xs">📅 Date</span>
          <span className="text-white/90 font-mono text-xs leading-tight">
            {snapshot ? formatDate(snapshot.timestamp) : '—'}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-white/40 font-mono text-xs">🔥 Most Linked</span>
          <span className="text-cyber-blue font-mono text-xs font-medium leading-tight truncate">
            {mostLinked ?? '—'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function MetricRow({ emoji, label, value }: { emoji: string; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/50 font-mono text-xs">
        {emoji} {label}
      </span>
      <motion.span
        key={value}
        initial={{ scale: 1.4, color: '#00d4ff' }}
        animate={{ scale: 1, color: '#ffffff' }}
        transition={{ duration: 0.4 }}
        className="font-mono text-sm font-medium"
        style={{ color: '#fff' }}
      >
        {value}
      </motion.span>
    </div>
  );
}
