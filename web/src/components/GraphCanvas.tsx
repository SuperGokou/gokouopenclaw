import { useRef, useEffect, useState, useCallback } from 'react';
import ForceGraph2D, { type ForceGraphMethods } from 'react-force-graph-2d';
import type { TimelapseSnapshot, RenderNode, RenderEdge } from '@/types';

interface Props {
  currentSnapshot: TimelapseSnapshot | null;
  previousSnapshot: TimelapseSnapshot | null;
  onNodeHover: (node: RenderNode | null, coords: { x: number; y: number } | null) => void;
}

const CYBER_BLUE = '#00d4ff';
const ELECTRIC_PURPLE = '#a855f7';
const OLD_EDGE_COLOR = 'rgba(0,212,255,0.25)';
const SPAWN_DURATION = 600;
const EDGE_PULSE_DURATION = 1000;

function toRenderNodes(
  snapshot: TimelapseSnapshot,
  previous: TimelapseSnapshot | null,
  existingNodes: Map<string, RenderNode>
): RenderNode[] {
  const prevIds = new Set(previous?.nodes.map(n => n.id) ?? []);
  const now = performance.now();
  return snapshot.nodes.map(n => {
    const existing = existingNodes.get(n.id);
    const isNew = !prevIds.has(n.id);
    return {
      ...n,
      isNew,
      spawnTime: isNew ? now : (existing?.spawnTime ?? 0),
      x: existing?.x,
      y: existing?.y,
      vx: existing?.vx,
      vy: existing?.vy,
    };
  });
}

function toRenderEdges(
  snapshot: TimelapseSnapshot,
  previous: TimelapseSnapshot | null
): RenderEdge[] {
  const now = performance.now();
  const prevKeys = new Set(
    previous?.edges.map(e => `${e.source}→${e.target}`) ?? []
  );
  return snapshot.edges.map(e => {
    const key = `${e.source}→${e.target}`;
    const isNew = !prevKeys.has(key);
    return { ...e, isNew, spawnTime: isNew ? now : 0 };
  });
}

export default function GraphCanvas({ currentSnapshot, previousSnapshot, onNodeHover }: Props) {
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);
  const nodeMapRef = useRef<Map<string, RenderNode>>(new Map());
  const hoveredNodeRef = useRef<string | null>(null);

  const [graphData, setGraphData] = useState<{ nodes: RenderNode[]; links: RenderEdge[] }>({
    nodes: [],
    links: [],
  });

  // Update graph data when snapshot changes
  useEffect(() => {
    if (!currentSnapshot) return;
    const nodes = toRenderNodes(currentSnapshot, previousSnapshot, nodeMapRef.current);
    const links = toRenderEdges(currentSnapshot, previousSnapshot);

    // Update nodeMap for position preservation
    nodeMapRef.current = new Map(nodes.map(n => [n.id, n]));
    setGraphData({ nodes, links });
  }, [currentSnapshot, previousSnapshot]);

  // Force layout config after mount
  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge')?.strength(-180);
    }
  }, []);

  const drawNode = useCallback((node: object, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const n = node as RenderNode;
    const now = performance.now();
    const elapsed = now - n.spawnTime;
    const spawnProgress = n.isNew ? Math.min(elapsed / SPAWN_DURATION, 1) : 1;

    // Size: start 3× and ease to 1×
    const baseR = Math.max(4, 6 / Math.max(globalScale * 0.5, 0.5));
    const spawnScale = n.isNew ? 3 - 2 * spawnProgress : 1;
    const r = baseR * spawnScale;

    const isHovered = hoveredNodeRef.current === n.id;
    const color = isHovered ? ELECTRIC_PURPLE : CYBER_BLUE;
    const glowR = isHovered ? r * 3.5 : r * 2.5;
    const glowAlpha = n.isNew ? (0.6 + 0.4 * (1 - spawnProgress)) : 0.5;

    const x = n.x ?? 0;
    const y = n.y ?? 0;

    // Outer glow
    const gradient = ctx.createRadialGradient(x, y, r * 0.3, x, y, glowR);
    gradient.addColorStop(0, color + Math.round(glowAlpha * 255).toString(16).padStart(2, '0'));
    gradient.addColorStop(1, color + '00');
    ctx.beginPath();
    ctx.arc(x, y, glowR, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Core circle
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = isHovered ? 20 : 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Label (only when zoomed in enough)
    if (globalScale > 1.5 || isHovered) {
      const label = n.label;
      const fontSize = Math.max(8, 10 / globalScale);
      ctx.font = `${fontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = isHovered ? ELECTRIC_PURPLE : 'rgba(0,212,255,0.85)';
      ctx.fillText(label, x, y + r + fontSize + 1);
    }
  }, []);

  const getLinkColor = useCallback((link: object) => {
    const l = link as RenderEdge;
    if (!l.isNew) return OLD_EDGE_COLOR;
    const elapsed = performance.now() - l.spawnTime;
    const t = Math.min(elapsed / EDGE_PULSE_DURATION, 1);
    // Fade from bright to dim
    const alpha = Math.round((0.9 - 0.65 * t) * 255).toString(16).padStart(2, '0');
    return `#00d4ff${alpha}`;
  }, []);

  const handleNodeHover = useCallback((node: object | null, _prev: object | null) => {
    const n = node as RenderNode | null;
    hoveredNodeRef.current = n?.id ?? null;
    onNodeHover(n, n ? { x: n.x ?? 0, y: n.y ?? 0 } : null);
  }, [onNodeHover]);

  // Re-render continuously while new nodes are spawning
  const [, forceRedraw] = useState(0);
  useEffect(() => {
    let raf: number;
    const tick = () => {
      const hasNew = graphData.nodes.some(n => {
        return n.isNew && performance.now() - n.spawnTime < SPAWN_DURATION;
      });
      const hasNewEdge = graphData.links.some(e => {
        return e.isNew && performance.now() - e.spawnTime < EDGE_PULSE_DURATION;
      });
      if (hasNew || hasNewEdge) {
        forceRedraw(v => v + 1);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [graphData]);

  return (
    <div className="w-full h-full">
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeId="id"
        nodeCanvasObject={drawNode}
        nodeCanvasObjectMode={() => 'replace'}
        linkColor={getLinkColor}
        linkWidth={1}
        linkDirectionalArrowLength={0}
        onNodeHover={handleNodeHover}
        backgroundColor="#000000"
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        warmupTicks={50}
        width={typeof window !== 'undefined' ? window.innerWidth : 1920}
        height={typeof window !== 'undefined' ? window.innerHeight : 1080}
      />
    </div>
  );
}
