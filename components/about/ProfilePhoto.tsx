"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import { FiUser } from "react-icons/fi";
import { PROFILE_PHOTO } from "../../app/about/aboutCopy";

type ProfilePhotoProps = {
  /** The `sizes` hint for next/image, matching how wide the photo is shown. */
  sizes: string;
  className?: string;
  style?: CSSProperties;
};

/** The framed profile photo, with a neutral placeholder until public/images/profile.jpg exists. */
export default function ProfilePhoto({ sizes, className = "", style }: ProfilePhotoProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative">
      {/* Soft lavender glow behind the frame (outside it, so the frame's rounded clipping does not cut it off) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-6 bg-[radial-gradient(closest-side,rgba(184,160,255,0.20),rgba(184,160,255,0.06)_60%,transparent)]"
      />
      <div
        style={style}
        className={`relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-[#B8A0FF]/25 bg-[#1B1926] shadow-[0_0_48px_-12px_rgba(184,160,255,0.30)] ${className}`}
      >
        {failed ? (
          <div
            role="img"
            aria-label="Profile photo placeholder"
            className="flex h-full w-full items-center justify-center text-[#A6A0B5]"
          >
            <FiUser aria-hidden="true" className="size-16 opacity-60" />
          </div>
        ) : (
          <Image
            src={PROFILE_PHOTO}
            alt="Portrait of Sanjeev Kaushik"
            fill
            priority
            sizes={sizes}
            className="object-cover"
            onError={() => setFailed(true)}
          />
        )}
      </div>
    </div>
  );
}