// extract-graph.js — builds graph-data.json from git history
// CommonJS, no external deps

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../../');
const OUT_DIR = path.resolve(__dirname, '../public');
const OUT_FILE = path.join(OUT_DIR, 'graph-data.json');

function git(cmd) {
  try {
    return execSync(cmd, { cwd: REPO_ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch {
    return '';
  }
}

// Parse [[wikilinks]] and [[alias|link]] from markdown content
function parseWikilinks(content) {
  const links = new Set();
  const pattern = /\[\[([^\]]+)\]\]/g;
  let m;
  while ((m = pattern.exec(content)) !== null) {
    const raw = m[1];
    // Support [[target|alias]] — target is the first part
    const target = raw.includes('|') ? raw.split('|')[0].trim() : raw.trim();
    if (target) links.add(target);
  }
  return Array.from(links);
}

// Parse frontmatter tags
function parseTags(content) {
  const tags = [];
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const fm = frontmatterMatch[1];
    // tags: [a, b] or tags: a
    const tagLine = fm.match(/tags:\s*\[([^\]]*)\]/);
    if (tagLine) {
      tags.push(...tagLine[1].split(',').map(t => t.trim()).filter(Boolean));
    } else {
      const tagSimple = fm.match(/tags:\s*(.+)/);
      if (tagSimple) {
        tags.push(...tagSimple[1].split(',').map(t => t.trim()).filter(Boolean));
      }
    }
  }
  return tags;
}

// Get all commits that touched .md files, oldest first
const rawLog = git('git log --all --reverse --pretty=format:"%H|%aI|%s" -- "*.md"');
if (!rawLog) {
  // No commits yet — write empty data
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify([], null, 2));
  console.log('[extract-graph] No markdown commits found, wrote empty graph-data.json');
  process.exit(0);
}

const commits = rawLog.split('\n').map(line => {
  const [hash, timestamp, ...msgParts] = line.replace(/^"|"$/g, '').split('|');
  return { hash: hash.trim(), timestamp: timestamp.trim(), message: msgParts.join('|').trim() };
}).filter(c => c.hash);

console.log(`[extract-graph] Processing ${commits.length} commits...`);

// Cumulative state
const nodeMap = new Map(); // id → { id, label, created, tags }
const edgeMap = new Map(); // "src→tgt" → { source, target, created }

const snapshots = [];

for (const commit of commits) {
  // Get all .md files present at this commit (tree listing)
  const treeOutput = git(`git ls-tree -r --name-only ${commit.hash}`);
  const mdFiles = treeOutput.split('\n').filter(f => f.endsWith('.md') && f.trim());

  // Update node and edge maps
  for (const filePath of mdFiles) {
    const nodeId = filePath.replace(/\.md$/i, '').replace(/\\/g, '/');
    const label = path.basename(nodeId);

    // Get file content at this commit
    const content = git(`git show ${commit.hash}:"${filePath}"`);
    const tags = parseTags(content);

    if (!nodeMap.has(nodeId)) {
      nodeMap.set(nodeId, {
        id: nodeId,
        label,
        created: commit.timestamp,
        tags,
      });
    } else {
      // Update tags if they've been added
      if (tags.length > 0) {
        nodeMap.get(nodeId).tags = tags;
      }
    }

    // Parse wikilinks and add edges
    const links = parseWikilinks(content);
    for (const linkTarget of links) {
      // Normalise target: strip .md if present, normalise separators
      const targetId = linkTarget.replace(/\.md$/i, '').replace(/\\/g, '/');

      // Create ghost node if target doesn't exist
      if (!nodeMap.has(targetId)) {
        nodeMap.set(targetId, {
          id: targetId,
          label: path.basename(targetId),
          created: commit.timestamp,
          tags: [],
        });
      }

      const edgeKey = `${nodeId}→${targetId}`;
      if (!edgeMap.has(edgeKey)) {
        edgeMap.set(edgeKey, {
          source: nodeId,
          target: targetId,
          created: commit.timestamp,
        });
      }
    }
  }

  snapshots.push({
    commit: commit.hash,
    timestamp: commit.timestamp,
    message: commit.message,
    nodes: Array.from(nodeMap.values()).map(n => ({ ...n })),
    edges: Array.from(edgeMap.values()).map(e => ({ ...e })),
  });
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(snapshots, null, 2));
console.log(`[extract-graph] Wrote ${snapshots.length} snapshots → ${OUT_FILE}`);
