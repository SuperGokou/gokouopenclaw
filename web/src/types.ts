// Shared TypeScript types for the Graph Timelapse app

export interface GraphNode {
  id: string;
  label: string;
  created: string;
  tags: string[];
}

export interface GraphEdge {
  source: string;
  target: string;
  created: string;
}

export interface TimelapseSnapshot {
  commit: string;
  timestamp: string;
  message: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export type PlaybackSpeed = 0.5 | 1 | 2 | 5;

// Runtime graph node with animation state
export interface RenderNode extends GraphNode {
  isNew: boolean;
  spawnTime: number; // ms timestamp when this node was "born" in the current playback
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | undefined;
  fy?: number | undefined;
}

// Runtime graph edge with animation state
export interface RenderEdge {
  source: string | RenderNode;
  target: string | RenderNode;
  created: string;
  isNew: boolean;
  spawnTime: number;
}
