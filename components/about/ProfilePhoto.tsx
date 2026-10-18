"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import { FiUser } from "react-icons/fi";
import { PROFILE_PHOTO } from "../../app/about/aboutCopy";

type ProfilePhotoProps = {
  sizes: string;
  className?: string;
  style?: CSSProperties;
};

export default function ProfilePhoto({ sizes, className = "", style }: ProfilePhotoProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative w-full">
      <div
        style={style}
        className={`relative aspect-[3/4] w-full overflow-visible ${className}`}
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
          <>
            {/* Glow layer (behind the real image) */}
            <Image
              src={PROFILE_PHOTO}
              alt=""
              fill
              sizes={sizes}
              aria-hidden="true"
              className="object-[center_60%] scale-20 opacity-70 blur-sm"
              style={{
                filter: "drop-shadow(0 0 20px rgba(184, 160, 255, 0.55))",
              }}
            />

            {/* Main sharp image */}
            <Image
              src={PROFILE_PHOTO}
              alt="Portrait of Sanjeev Kaushik"
              fill
              priority
              sizes={sizes}
              className="object-cover object-[center_-10%]"
              style={{
                filter: "drop-shadow(0 0 12px rgba(184, 160, 255, 0.35))",
              }}
              onError={() => setFailed(true)}
            />
          </>
        )}
      </div>
    </div>
  );
}