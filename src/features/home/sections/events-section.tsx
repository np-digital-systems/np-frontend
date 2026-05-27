import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageContainer } from "@/components/common/page-container";
import { SectionHeader } from "@/components/common/section-header";
import { EventCard } from "../components/event-card";
import { FEATURED_EVENTS } from "../constants/events";

export function EventsSection() {
  return (
    <PageContainer id="events-section" className="bg-white">
      <SectionHeader
        subtitle="Sacred Calendar"
        title="Spiritual Gatherings"
        description="Join us in celebrating sacred festivals and special pujas that connect our community in divine worship."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 reveal">
        {FEATURED_EVENTS.map((event, index) => (
          <EventCard
            key={event.id}
            event={event}
            className={`delay-${(index + 1) * 100}`}
          />
        ))}
      </div>

      <div className="flex justify-center mt-12 reveal">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-[#D4AF37] text-sm font-semibold text-[#735C00] hover:bg-[#D4AF37] hover:text-white transition-all duration-300 group"
        >
          View All Events
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </PageContainer>
  );
}
