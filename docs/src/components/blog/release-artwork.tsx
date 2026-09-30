// A deterministic character field keeps the illustration crisp in SSR and costs
// no canvas, animation loop, image request, or client-side dependency.
const field = Array.from({ length: 56 }, (_, row) =>
  Array.from({ length: 112 }, (_, column) => {
    const x = column / 14;
    const y = row / 9;
    // Layered contours: a woven landscape instead of the previous circular field.
    const contour = Math.sin(y * 3.8 + Math.sin(x * 0.9) * 2.4 + x * 0.65);
    const crosswind = Math.cos(x * 1.4 - y * 0.8) * 0.18;
    const density = Math.max(0, Math.min(1, (contour + 1) * 0.4 + crosswind));
    return " .:-=+*#"[Math.min(7, Math.floor(density * 8))];
  }).join(""),
).join("\n");

export function ReleaseArtwork({ fullBleed = false }: { fullBleed?: boolean }) {
  return (
    <div
      className={`blog-release-art${fullBleed ? " blog-release-art--full-bleed" : ""}`}
      aria-hidden="true"
    >
      {!fullBleed && (
        <>
          <div className="blog-art-corner blog-art-corner--tl" />
          <div className="blog-art-corner blog-art-corner--tr" />
          <div className="blog-art-corner blog-art-corner--bl" />
          <div className="blog-art-corner blog-art-corner--br" />
        </>
      )}
      <div className="blog-art-label">
        <span>FARM.JS</span>
        <span>RELEASE / 001</span>
      </div>
      <pre className="blog-ascii-field">{field}</pre>
      <div className="blog-art-version">
        v 0.1.0<span className="blog-art-cursor">_</span>
      </div>
      <div className="blog-art-caption">
        <span>BUILT TO BUILD ON.</span>
        <span>[ STABLE ]</span>
      </div>
    </div>
  );
}
