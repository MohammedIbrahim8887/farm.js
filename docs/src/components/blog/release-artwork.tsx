// A deterministic character field keeps the illustration crisp in SSR and costs
// no canvas, animation loop, image request, or client-side dependency.
const field = Array.from({ length: 34 }, (_, row) =>
  Array.from({ length: 92 }, (_, column) => {
    const x = (column - 45.5) / 23;
    const y = (row - 16.5) / 10;
    const distance = Math.sqrt(x * x + y * y);
    const wave = Math.sin(distance * 8 - Math.atan2(y, x) * 2);
    const grain = ((column * 17 + row * 31) % 11) / 11;
    const edge = Math.max(0, 1 - Math.abs(distance - 1.28) / 0.9);
    const density = Math.max(0, (wave * 0.3 + 0.55 + grain * 0.15) * edge);
    return " .:;+xX#"[Math.min(7, Math.floor(density * 8))];
  }).join(""),
).join("\n");

export function ReleaseArtwork({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`blog-release-art${compact ? " blog-release-art--compact" : ""}`}
      aria-hidden="true"
    >
      <div className="blog-art-corner blog-art-corner--tl" />
      <div className="blog-art-corner blog-art-corner--tr" />
      <div className="blog-art-corner blog-art-corner--bl" />
      <div className="blog-art-corner blog-art-corner--br" />
      <div className="blog-art-label">
        <span>FARM.JS</span>
        <span>RELEASE / 001</span>
      </div>
      <pre className="blog-ascii-field">{field}</pre>
      <div className="blog-art-version">
        v0.1.0<span className="blog-art-cursor">_</span>
      </div>
      <div className="blog-art-caption">
        <span>BUILT TO BUILD ON.</span>
        <span>[ STABLE ]</span>
      </div>
    </div>
  );
}
