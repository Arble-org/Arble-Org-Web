/**
 * Render Bit — the Arble mascot — to standalone SVGs in assets/.
 *
 * The sprite is NOT redrawn here. It is imported from the mobile app's own
 * sprite data, so the mascot on the website and the mascot in the app are the
 * same pixels by construction. That file lives in the app repository, which is
 * the one thing on this site that is not self-contained: pass its path in.
 *
 *   node --experimental-strip-types scripts/render-mascot.mjs ../arble-mobile-1.0
 *
 * Requires Node 22+ (for TypeScript stripping). Regenerate only when the sprite
 * changes; the committed SVGs are what the site actually serves.
 */
import { writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, "..", "assets");

const appRepo = process.argv[2];
if (!appRepo) {
  console.error("usage: node --experimental-strip-types scripts/render-mascot.mjs <path-to-app-repo>");
  process.exit(1);
}

const sprite = resolve(process.cwd(), appRepo, "src/components/mascots/bitSprite.ts");
if (!existsSync(sprite)) {
  console.error(`sprite not found: ${sprite}`);
  console.error("expected <app-repo>/src/components/mascots/bitSprite.ts");
  process.exit(1);
}

const {
  P, SPROUT, CHASSIS, SPROUT_H, PAD_X, GRID_H, FACES, MOOD_LEAVES, rowRuns,
} = await import(pathToFileURL(sprite).href);

function svg(mood) {
  const palette = { ...P, ...(MOOD_LEAVES[mood] || {}) };
  const px = [];
  const emit = (x, y, w, h, fill, opacity) =>
    px.push(
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"` +
      (opacity != null ? ` opacity="${opacity}"` : "") + "/>"
    );

  // body: the sprout rows, then the chassis below them
  SPROUT.forEach((row, y) =>
    rowRuns(row, palette).forEach((r) => emit(r.x + PAD_X, y, r.w, 1, r.fill))
  );
  CHASSIS.forEach((row, y) =>
    rowRuns(row, palette).forEach((r) => emit(r.x + PAD_X, y + SPROUT_H, r.w, 1, r.fill))
  );
  // face: the only pixels that differ between moods. y is already global.
  FACES[mood].forEach((b) => emit(b.x + PAD_X, b.y, b.w ?? 1, b.h ?? 1, b.fill, b.opacity));

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${GRID_H} ${GRID_H}" ` +
    `shape-rendering="crispEdges" role="img" aria-label="Bit, the Arble mascot">` +
    `<title>Bit &#8212; the Arble mascot (${mood})</title>${px.join("")}</svg>\n`;
}

for (const mood of ["happy", "working", "thinking", "celebrate", "idle"]) {
  const s = svg(mood);
  writeFileSync(`${OUT}/mascot-${mood}.svg`, s);
  console.log(`mascot-${mood}.svg  ${(s.length / 1024).toFixed(1)}KB  ${s.match(/<rect/g).length} px`);
}
