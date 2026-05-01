#!/usr/bin/env node
/**
 * generate-graph-data.js
 *
 * Walks the repository root (one level up from web/) and builds a
 * nodes-and-links graph that represents the file/directory structure.
 * The result is written to web/public/graph-data.json so Vite serves
 * it automatically as a static asset.
 */

import { readdirSync, statSync, writeFileSync, mkdirSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Repo root is one directory above this file
const REPO_ROOT = join(__dirname, '..');
const OUTPUT_DIR = join(__dirname, 'public');
const OUTPUT_FILE = join(OUTPUT_DIR, 'graph-data.json');

// Directories / files to skip when scanning
const IGNORE = new Set(['.git', 'node_modules', 'dist', '.DS_Store']);

let nodeId = 0;
const nodes = [];
const links = [];

function scan(dirPath, parentId) {
  let entries;
  try {
    entries = readdirSync(dirPath);
  } catch {
    return;
  }

  for (const entry of entries) {
    if (IGNORE.has(entry)) continue;

    const fullPath = join(dirPath, entry);
    let stat;
    try {
      stat = statSync(fullPath);
    } catch {
      continue;
    }

    const id = ++nodeId;
    const relPath = relative(REPO_ROOT, fullPath);
    const isDir = stat.isDirectory();

    nodes.push({
      id,
      label: entry,
      path: relPath,
      type: isDir ? 'directory' : 'file',
      size: isDir ? 12 : 8,
    });

    if (parentId !== null) {
      links.push({ source: parentId, target: id });
    }

    if (isDir) {
      scan(fullPath, id);
    }
  }
}

// Root node for the repo itself
const rootId = ++nodeId;
nodes.push({ id: rootId, label: 'gokouopenclaw', path: '.', type: 'root', size: 18 });

scan(REPO_ROOT, rootId);

// Ensure output directory exists
mkdirSync(OUTPUT_DIR, { recursive: true });

writeFileSync(OUTPUT_FILE, JSON.stringify({ nodes, links }, null, 2), 'utf8');

console.log(`✅  graph-data.json generated — ${nodes.length} nodes, ${links.length} links → ${OUTPUT_FILE}`);
