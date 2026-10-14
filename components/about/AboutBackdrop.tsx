/**
 * Soft ambient lighting behind the About content: a very faint lavender glow, a second fainter pool of
 * light toward the photo for depth, and a vignette that keeps the outer edges dark so the content stays
 * the focus. It is only gradients (no particles, no animation) and it blends into the #100F17 background.
 *
 * Put it first inside a `relative` container; the content that sits above it must be `relative` too.
 */
export default function AboutBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Main glow, centred behind the content */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_62%_52%_at_50%_46%,rgba(184,160,255,0.11),rgba(184,160,255,0.045)_45%,transparent_72%)]" />
      {/* A fainter second pool toward the photo, so the light is not perfectly symmetrical */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_52%,rgba(184,160,255,0.07),transparent_38%)]" />
      {/* Keeps the outer edges dark */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_52%,rgba(16,15,23,0.85)_100%)]" />
    </div>
  );
}