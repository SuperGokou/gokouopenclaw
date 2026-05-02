import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RenderNode, TimelapseSnapshot } from '@/types';

interface Props {
  node: RenderNode | null;
  mousePos: { x: number; y: number } | null;
  snapshot: TimelapseSnapshot | null;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function NodeTooltip({ node, mousePos, snapshot }: Props) {
  const connectionCount = useMemo(() => {
    if (!node || !snapshot) return 0;
    return snapshot.edges.filter(e => {
      const src = typeof e.source === 'string' ? e.source : (e.source as { id: string }).id;
      const tgt = typeof e.target === 'string' ? e.target : (e.target as { id: string }).id;
      return src === node.id || tgt === node.id;
    }).length;
  }, [node, snapshot]);

  const visible = node !== null && mousePos !== null;
  const left = (mousePos?.x ?? 0) + 16;
  const top = (mousePos?.y ?? 0) + 16;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={node!.id}
          initial={{ opacity: 0, scale: 0.9, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 4 }}
          transition={{ duration: 0.15 }}
          className="fixed z-50 pointer-events-none p-4 w-52"
          style={{
            left,
            top,
            backdropFilter: 'blur(16px)',
            background: 'rgba(0,0,0,0.75)',
            border: '1px solid rgba(0,212,255,0.25)',
            borderRadius: '12px',
          }}
        >
          <p className="text-cyber-blue font-mono font-medium text-sm leading-tight mb-2 truncate">
            {node!.label}
          </p>
          <div className="space-y-1.5">
            <TooltipRow label="Created" value={formatDate(node!.created)} />
            <TooltipRow label="Connections" value={String(connectionCount)} />
            {node!.tags.length > 0 && (
              <div className="pt-1">
                <span className="text-white/30 font-mono text-xs block mb-1">Tags</span>
                <div className="flex flex-wrap gap-1">
                  {node!.tags.slice(0, 5).map(t => (
                    <span
                      key={t}
                      className="px-1.5 py-0.5 rounded font-mono text-xs"
                      style={{
                        background: 'rgba(168,85,247,0.15)',
                        border: '1px solid rgba(168,85,247,0.3)',
                        color: '#a855f7',
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TooltipRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-white/30 font-mono text-xs">{label}</span>
      <span className="text-white/80 font-mono text-xs text-right">{value}</span>
    </div>
  );
}
