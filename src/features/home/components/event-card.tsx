import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TempleEvent } from "../types/event.types";
import {useTranslations} from "next-intl";

interface EventCardProps {
  event: TempleEvent;
  className?: string;
}

export function EventCard({ event, className }: EventCardProps) {
  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const categoryStyles: Record<string, string> = {
    puja: "bg-[#FFF3E0] text-[#E65100]",
    festival: "bg-[#FDE8E4] text-[#8B0000]",
    special: "bg-[#FFF8E1] text-[#735C00]",
    monthly: "bg-[#F3E5F5] text-[#6A1B9A]",
  };

   const tEvents=useTranslations("Home.Events");


  return (

    <div
      className={cn(
        "group bg-white rounded-2xl overflow-hidden transition-all duration-500",
        "shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(212,175,55,0.15)]",
        "hover:-translate-y-1",
        className
      )}
    >
      {/* Image Container */}
      <div className="relative h-52 overflow-hidden">
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Category Badge */}
        {/* <span
          className={cn(
            "absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider",
            categoryStyles[event.category] || categoryStyles.special
          )}
        >
          {event.category}
        </span> */}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-heading text-xl font-semibold text-[#1A1C1C] mb-2 line-clamp-1">
          {event.title}
        </h3>
        <p className="text-sm text-[#4D4635] leading-relaxed mb-4 line-clamp-2">
          {event.description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center gap-4 mb-5 text-xs text-[#7F7663]">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
            {formattedDate}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
            {event.time}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* <Link
            href={`/events/${event.id}`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAF9F6] text-sm font-semibold text-[#735C00] hover:bg-[#D4AF37] hover:text-white transition-all duration-300"
          >
            Details
          </Link> */}
          <Link
            href={`/events/${event.id}#register`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F4C430] text-sm font-semibold text-white hover:shadow-[0_4px_16px_rgba(212,175,55,0.3)] transition-all duration-300"
          >
            {tEvents("details")}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
