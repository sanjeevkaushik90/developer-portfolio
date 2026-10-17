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
        className={`relative aspect-4/5 w-full overflow-hidden rounded-2xl bg-transparent shadow-xl shadow-black/20 ${className}`}
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
            className="object-cover object-[center_60%]"
            onError={() => setFailed(true)}
          />
        )}
      </div>
    </div>
  );
}