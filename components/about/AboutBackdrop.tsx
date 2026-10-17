/**
 * Soft ambient lighting behind the About content: a very faint lavender glow, a second fainter pool of
 * light toward the photo for depth, and a vignette that keeps the outer edges dark so the content stays
 * the focus. It is only gradients (no particles, no animation) and it blends into the #100F17 background.
 *
 * Put it first inside a `relative` container; the content that sits above it must be `relative` too.
 */

export default function AboutBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Very subtle ambient purple glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_45%,rgba(184,160,255,0.035),transparent_72%)]" />

      {/* Keep the edges naturally dark */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(16,15,23,0.55)_100%)]" />
    </div>
  );
}
