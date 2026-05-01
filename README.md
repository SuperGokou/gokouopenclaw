# gokouopenclaw

A repository graph explorer built with Vite + D3.

## Getting started

```bash
cd web
npm install
npm run dev   # auto-generates graph-data.json, starts Vite dev server
```

`npm run dev` first runs `generate-graph-data.js`, which walks the repository tree and writes `web/public/graph-data.json`, then starts the Vite dev server at <http://localhost:5173>.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Generate graph data and start the Vite dev server |
| `npm run build` | Generate graph data and build for production |
| `npm run generate` | Only regenerate `graph-data.json` |
| `npm run preview` | Preview the production build |
