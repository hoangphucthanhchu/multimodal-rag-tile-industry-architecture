#!/usr/bin/env node
/**
 * Convert .mmd files to .svg using mermaid.ink API, then apply dark theme
 * (VS Code / GitHub Dark: background #1e1e1e, light text, subtle borders, light arrows).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const diagramsDir = path.join(__dirname, '..', 'diagrams');

const files = [
  'architecture-overview',
  'data-ingestion-flow',
  'retrieval-search-flow',
  'authorization-inventory-flow',
  'draft-order-creation-flow',
];

const BG_COLOR = '#1e1e1e';

function applyDarkTheme(svg) {
  // 1. Light arrowheads (match lineColor #8b949e / industry dark theme)
  svg = svg.replace(/arrowheadPath\{fill:#b5b5b5;?\}/g, 'arrowheadPath{fill:#8b949e}');

  // 2. Keep cluster labels and edge labels light gray
  const clusterEdgeOverride =
    '<style>#mermaid-svg .cluster-label text,#mermaid-svg .cluster-label span,#mermaid-svg .cluster text,#mermaid-svg .cluster span{fill:#d4d4d4 !important;color:#d4d4d4 !important;}#mermaid-svg .edgeLabel,#mermaid-svg .edgeLabel span,#mermaid-svg .edgeLabel p,#mermaid-svg .labelBkg span{fill:#d4d4d4 !important;color:#d4d4d4 !important;}</style>';
  if (!svg.includes('cluster-label text{fill:#d4d4d4')) {
    svg = svg.replace(/(<\/style>)(<g>)/, `$1${clusterEdgeOverride}$2`);
  }

  // 3. Extract viewBox and add background rect after first <g>
  const viewBoxMatch = svg.match(/viewBox="0 0 ([0-9.]+) ([0-9.]+)"/);
  if (viewBoxMatch) {
    const [, w, h] = viewBoxMatch;
    const rect = `<rect x="0" y="0" width="${w}" height="${h}" fill="${BG_COLOR}"/>`;
    svg = svg.replace(/(<g>)(<marker)/, `$1${rect}$2`);
  }

  return svg;
}

async function convert(name) {
  const mmdPath = path.join(diagramsDir, `${name}.mmd`);
  const svgPath = path.join(diagramsDir, `${name}.svg`);
  const code = fs.readFileSync(mmdPath, 'utf8');
  const encoded = Buffer.from(code).toString('base64url');
  const url = `https://mermaid.ink/svg/${encoded}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${name}: ${res.status} ${await res.text()}`);
  }
  let svg = await res.text();
  svg = applyDarkTheme(svg);
  fs.writeFileSync(svgPath, svg, 'utf8');
  console.log(`OK ${name}.svg`);
}

(async () => {
  for (const name of files) {
    try {
      await convert(name);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }
})();
