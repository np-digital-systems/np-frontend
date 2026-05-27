"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { GalleryImage } from "../types/gallery.types";

interface GalleryCardProps {
  image: GalleryImage;
  className?: string;
  priority?: boolean;
}

export function GalleryCard({ image, className, priority }: GalleryCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl cursor-pointer",
        "transition-all duration-500",
        "hover:shadow-[0_12px_40px_rgba(212,175,55,0.2)]",
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* Loading skeleton */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-[#E8E8E8] animate-pulse" />
        )}

        <Image
          src={image.src}
          alt={image.alt}
          fill
          className={cn(
            "object-cover transition-all duration-700",
            "group-hover:scale-110",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
          onLoad={() => setIsLoaded(true)}
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Caption */}
        <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
          {image.caption && (
            <p className="text-white font-heading text-lg font-medium">
              {image.caption}
            </p>
          )}
          <span className="inline-block mt-1 text-xs font-semibold uppercase tracking-wider text-[#F4C430]">
            {image.category}
          </span>
        </div>
      </div>
    </div>
  );
}
