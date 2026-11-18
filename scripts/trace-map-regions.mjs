/**
 * Traces region outlines from a regional map image, for src/content/reach-artwork.ts.
 *
 *   node scripts/trace-map-regions.mjs <image> <layoutWidth>x<layoutHeight> <id>:<x>,<y>[+<x>,<y>] ...
 *
 * Each region is given one or more seed points (layout units) inside it. The map's
 * coloured region outlines and its white background are treated as walls; each
 * region is flood-filled from its seeds, the walls are then shared out to the
 * nearest region, and the outer edge of each region is simplified into an SVG path
 * in layout units. The output is keyed by the image's SHA-256, so the outlines only
 * ever appear on the exact file they were traced from.
 *
 * Example (the client's map supplied on 14 November 2026):
 *   node scripts/trace-map-regions.mjs public/assets/website/pakistan-regional-map-outlined.png 478x412 \
 *     north:300,45+395,110 central:280,195 south:120,280
 *
 * Check the result visually before committing it: pass --preview <file.png> to
 * write the outlines over the map.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import sharp from "sharp";

const args = process.argv.slice(2);
const previewAt = args.indexOf("--preview");
const preview = previewAt >= 0 ? args.splice(previewAt, 2)[1] : null;
const [image, layout, ...seedArgs] = args;
if (!image || !/^\d+x\d+$/.test(layout ?? "") || seedArgs.length === 0) {
  console.error("Usage: node scripts/trace-map-regions.mjs <image> <W>x<H> <id>:<x>,<y>[+<x>,<y>] ... [--preview out.png]");
  process.exit(1);
}
const [LW, LH] = layout.split("x").map(Number);
const S = 4; // trace at 4 px per layout unit
const W = LW * S;
const H = LH * S;
const N = W * H;

const bytes = fs.readFileSync(image);
const fingerprint = "sha256:" + crypto.createHash("sha256").update(bytes).digest("hex");
const data = await sharp(bytes).removeAlpha().resize(W, H, { kernel: "lanczos3", fit: "fill" }).raw().toBuffer();

// Walls: white background, and strongly coloured pixels (the region outlines and city dots).
// Cream land, grey district lines and dark labels are not walls.
const WALL_GROW = 3;
const kind = new Uint8Array(N); // 0 land, 1 background, 2 colour
for (let p = 0; p < N; p++) {
  const r = data[p * 3], g = data[p * 3 + 1], b = data[p * 3 + 2];
  if (Math.min(r, g, b) > 232) kind[p] = 1;
  // Coloured, and not in the land's yellow–grey family (where red and green are about equal).
  else if (Math.max(r, g, b) - Math.min(r, g, b) > 60 && Math.abs(r - g) > 25) kind[p] = 2;
}
const wall = new Uint8Array(N);
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const p = y * W + x;
    if (kind[p] === 1) wall[p] = 1;
    if (kind[p] !== 2) continue;
    for (let dy = -WALL_GROW; dy <= WALL_GROW; dy++)
      for (let dx = -WALL_GROW; dx <= WALL_GROW; dx++) {
        const xx = x + dx, yy = y + dy;
        if (xx >= 0 && yy >= 0 && xx < W && yy < H) wall[yy * W + xx] = 1;
      }
  }

const neighbours = (p) => {
  const x = p % W;
  return [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, p >= W ? p - W : -1, p < N - W ? p + W : -1];
};

const regions = seedArgs.map((arg, i) => {
  const [id, pts] = arg.split(":");
  return { id, label: i + 1, seeds: pts.split("+").map((s) => s.split(",").map(Number)) };
});
const label = new Uint8Array(N);
for (const region of regions) {
  for (const [sx, sy] of region.seeds) {
    const start = Math.round(sy * S) * W + Math.round(sx * S);
    if (wall[start]) throw new Error(`Seed ${region.id} ${sx},${sy} is on an outline or the background; move it.`);
    if (label[start] && label[start] !== region.label) {
      const other = regions.find((r) => r.label === label[start]).id;
      throw new Error(`Seed ${region.id} ${sx},${sy} is already inside ${other}: the outline between them has a gap.`);
    }
    const stack = [start];
    label[start] = region.label;
    while (stack.length) for (const q of neighbours(stack.pop())) if (q >= 0 && !wall[q] && !label[q]) { label[q] = region.label; stack.push(q); }
  }
}

// Share the walls (outlines, dots) between neighbouring regions: nearest region wins.
let frontier = [];
for (let p = 0; p < N; p++) if (label[p]) frontier.push(p);
for (let d = 0; d < 14 && frontier.length; d++) {
  const next = [];
  for (const p of frontier) for (const q of neighbours(p)) if (q >= 0 && !label[q] && kind[q] !== 1) { label[q] = label[p]; next.push(q); }
  frontier = next;
}

/** Outer boundary of the largest connected part of a region (Moore-neighbour tracing). */
function outline(regionLabel) {
  const part = new Int32Array(N).fill(-1);
  let best = { id: -1, size: 0, start: -1 };
  for (let p = 0, id = 0; p < N; p++) {
    if (label[p] !== regionLabel || part[p] >= 0) continue;
    let size = 0;
    const stack = [p];
    part[p] = id;
    while (stack.length) {
      size++;
      for (const q of neighbours(stack.pop())) if (q >= 0 && label[q] === regionLabel && part[q] < 0) { part[q] = id; stack.push(q); }
    }
    if (size > best.size) best = { id, size, start: p };
    id++;
  }
  const inside = (x, y) => x >= 0 && y >= 0 && x < W && y < H && part[y * W + x] === best.id;
  const dirs = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  const sx = best.start % W, sy = (best.start - sx) / W;
  const pts = [[sx, sy]];
  let x = sx, y = sy, back = 4;
  for (;;) {
    let moved = false;
    for (let k = 1; k <= 8; k++) {
      const d = (back + k) % 8;
      if (inside(x + dirs[d][0], y + dirs[d][1])) {
        x += dirs[d][0];
        y += dirs[d][1];
        back = (d + 4) % 8;
        moved = true;
        break;
      }
    }
    if (!moved || (x === sx && y === sy)) break;
    pts.push([x, y]);
  }
  return pts;
}

/** Douglas–Peucker simplification of an open polyline. */
function simplify(pts, eps) {
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, ay] = pts[a], [bx, by] = pts[b];
    const len = Math.hypot(bx - ax, by - ay) || 1;
    let max = 0, at = -1;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs((bx - ax) * (ay - pts[i][1]) - (ax - pts[i][0]) * (by - ay)) / len;
      if (d > max) [max, at] = [d, i];
    }
    if (max > eps) {
      keep[at] = 1;
      stack.push([a, at], [at, b]);
    }
  }
  return pts.filter((_, i) => keep[i]);
}

const result = regions.map((region) => {
  const ring = outline(region.label);
  // Split the closed ring at its farthest point so each half simplifies as a line.
  const far = ring.reduce((m, p, i) => (Math.hypot(p[0] - ring[0][0], p[1] - ring[0][1]) > Math.hypot(ring[m][0] - ring[0][0], ring[m][1] - ring[0][1]) ? i : m), 0);
  const simple = [...simplify(ring.slice(0, far + 1), 2.2).slice(0, -1), ...simplify([...ring.slice(far), ring[0]], 2.2).slice(0, -1)];
  const units = simple.map(([x, y]) => [((x + 0.5) / S).toFixed(1).replace(/\.0$/, ""), ((y + 0.5) / S).toFixed(1).replace(/\.0$/, "")]);
  return { id: region.id, path: `M${units.map((p) => p.join(" ")).join("L")}Z` };
});

console.log(JSON.stringify({ fingerprint, layoutWidth: LW, layoutHeight: LH, regions: result }, null, 2));

if (preview) {
  const colours = ["#00b000", "#0050ff", "#ff0000", "#ff00ff", "#00b0b0"];
  const shapes = result.map((r, i) => `<path d="${r.path}" fill="${colours[i % 5]}" fill-opacity="0.2" stroke="${colours[i % 5]}" stroke-width="0.6" stroke-dasharray="2 1"/>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${LW} ${LH}">${shapes}</svg>`;
  await sharp(bytes).resize(W, H, { fit: "fill" }).composite([{ input: Buffer.from(svg) }]).png().toFile(preview);
  console.error(`Preview written to ${preview}`);
}
