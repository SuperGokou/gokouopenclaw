import * as d3 from 'd3';

const tooltip = document.getElementById('tooltip');

async function init() {
  // graph-data.json is served from public/ by Vite
  const data = await fetch('/graph-data.json').then((r) => r.json());

  const container = document.getElementById('graph');
  const W = container.clientWidth;
  const H = container.clientHeight;

  const svg = d3
    .select('#graph')
    .append('svg')
    .attr('viewBox', [0, 0, W, H]);

  // Zoom & pan
  const g = svg.append('g');
  svg.call(
    d3.zoom()
      .scaleExtent([0.1, 8])
      .on('zoom', (event) => g.attr('transform', event.transform))
  );

  // Clone nodes/links so d3 can mutate them
  const nodes = data.nodes.map((n) => ({ ...n }));
  const links = data.links.map((l) => ({ ...l }));

  const simulation = d3
    .forceSimulation(nodes)
    .force('link', d3.forceLink(links).id((d) => d.id).distance(60).strength(0.6))
    .force('charge', d3.forceManyBody().strength(-120))
    .force('center', d3.forceCenter(W / 2, H / 2))
    .force('collision', d3.forceCollide().radius((d) => d.size + 4));

  // Links
  const link = g
    .append('g')
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('class', 'link');

  // Nodes
  const node = g
    .append('g')
    .selectAll('g')
    .data(nodes)
    .join('g')
    .attr('class', 'node')
    .call(drag(simulation));

  node
    .append('circle')
    .attr('r', (d) => d.size)
    .attr('class', (d) => d.type)
    .on('mouseover', (event, d) => {
      tooltip.style.opacity = '1';
      tooltip.innerHTML = `<strong>${d.label}</strong><br/><code>${d.path}</code><br/><em>${d.type}</em>`;
    })
    .on('mousemove', (event) => {
      tooltip.style.left = event.clientX + 14 + 'px';
      tooltip.style.top = event.clientY - 28 + 'px';
    })
    .on('mouseout', () => {
      tooltip.style.opacity = '0';
    });

  node
    .append('text')
    .attr('x', (d) => d.size + 4)
    .attr('y', 4)
    .text((d) => d.label);

  simulation.on('tick', () => {
    link
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);

    node.attr('transform', (d) => `translate(${d.x},${d.y})`);
  });
}

function drag(simulation) {
  return d3
    .drag()
    .on('start', (event, d) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    })
    .on('drag', (event, d) => {
      d.fx = event.x;
      d.fy = event.y;
    })
    .on('end', (event, d) => {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    });
}

init();
