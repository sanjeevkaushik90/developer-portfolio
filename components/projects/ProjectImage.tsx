"use client";

import { useState } from "react";
import Image from "next/image";
import {
  FiFolder,
  FiGlobe,
  FiServer,
  FiShield,
  FiTool,
} from "react-icons/fi";

const CATEGORY_ICON_COMPONENTS = {
  "Web Development": FiGlobe,
  Backend: FiServer,
  Cybersecurity: FiShield,
  "Developer Tools": FiTool,
} as const;

type ProjectImageProps = {
  /** Path inside /public. If it is missing or the file cannot be loaded, a labelled placeholder is shown. */
  src?: string;
  alt: string;
  sizes: string;
  category: string;
  title: string;
  /** The image is an illustration, not a real screenshot: it is then labelled as a placeholder. */
  isPlaceholder?: boolean;
  priority?: boolean;
  /** Smaller placeholder with no text, for thumbnails. */
  compact?: boolean;
};

/**
 * Fills its (relatively positioned) parent. It never shows a broken image: with no file, or a file that
 * fails to load, it shows an honest placeholder that says it is not a real screenshot.
 */
export default function ProjectImage({
  src,
  alt,
  sizes,
  category,
  title,
  isPlaceholder = false,
  priority = false,
  compact = false,
}: ProjectImageProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;
  const Icon =
    CATEGORY_ICON_COMPONENTS[category as keyof typeof CATEGORY_ICON_COMPONENTS] ??
    FiFolder;

  if (!showImage) {
    return (
      <div
        role="img"
        aria-label={`Placeholder for ${title}: no screenshot yet`}
        className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[radial-gradient(ellipse_at_30%_20%,rgba(184,160,255,0.16),transparent_60%),linear-gradient(135deg,#1B1926,#14121D)] text-[#A6A0B5]"
      >
        <Icon aria-hidden="true" className={compact ? "size-5 opacity-70" : "size-10 opacity-70"} />
        {!compact && (
          <span className="px-4 text-center text-[11px] font-medium uppercase tracking-[0.16em]">
            Placeholder &middot; screenshot coming soon
          </span>
        )}
      </div>
    );
  }

  return (
    <>
      <Image
        src={src as string}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover object-top"
        onError={() => {
          if (process.env.NODE_ENV === "development") {
            console.warn(`[projects] Could not load "${src}". Check the file exists in /public and the path in data/projects.ts.`);
          }
          setFailed(true);
        }}
      />
      {isPlaceholder && !compact && (
        <span className="absolute bottom-3 left-3 rounded-full border border-[#343044] bg-[#100F17]/85 px-2.5 py-1 text-[11px] font-medium text-[#A6A0B5] backdrop-blur">
          Illustrative placeholder
        </span>
      )}
    </>
  );
}