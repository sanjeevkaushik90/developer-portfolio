"use client";

import { useState } from "react";
import type { ResolvedImage } from "../../lib/projects";
import ProjectImage from "./ProjectImage";

/**
 * Large preview plus thumbnails. With no images at all it shows one clearly labelled placeholder;
 * with a single image there are no thumbnails. Images that fail to load fall back to a placeholder.
 */
export default function ProjectGallery({
  images,
  title,
  category,
}: {
  images: readonly ResolvedImage[];
  title: string;
  category: string;
}) {
  const [index, setIndex] = useState(0);
  const current = images[index];

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-[#343044] bg-[#1B1926] shadow-[0_0_48px_-16px_rgba(184,160,255,0.30)]">
        <ProjectImage
          key={current?.src ?? "none"}
          src={current?.src}
          alt={current?.alt ?? `${title} screenshot`}
          sizes="(min-width: 1024px) 760px, 92vw"
          category={category}
          title={title}
          isPlaceholder={current?.isPlaceholder}
          priority
        />
      </div>

      {current?.caption && <p className="mt-3 text-sm text-[#A6A0B5]">{current.caption}</p>}

      {images.length > 1 && (
        <ul aria-label="Project images" className="mt-4 flex flex-wrap gap-3">
          {images.map((img, i) => (
            <li key={img.src}>
              <button
                type="button"
                aria-pressed={i === index}
                aria-label={`Show image ${i + 1} of ${images.length}: ${img.alt}`}
                onClick={() => setIndex(i)}
                className={`relative block aspect-[16/10] w-24 overflow-hidden rounded-lg border transition-[border-color,opacity] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8A0FF] sm:w-28 ${
                  i === index ? "border-[#B8A0FF]" : "border-[#343044] opacity-70 hover:opacity-100"
                }`}
              >
                <ProjectImage
                  src={img.src}
                  alt=""
                  sizes="112px"
                  category={category}
                  title={title}
                  isPlaceholder={img.isPlaceholder}
                  compact
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}