import { ArrowRight, CalendarX2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { PageContainer } from "@/components/site/page-container";
import { SectionHeader } from "@/components/site/section-header";
import { SiteEventCard } from "@/features/events/sections/site";
import type { PublicEvent } from "@/features/events/types";
import { Link } from "@/i18n/routing";

interface EventsSectionProps {
  events: readonly PublicEvent[];
  /** True when the calendar could not be reached, as opposed to being empty. */
  unavailable?: boolean;
}

/**
 * The home page's glimpse of the temple calendar.
 *
 * The same cards the events page uses, so the two stay in step, and the same
 * live data — the section used to render a hand-written constant, which drifted
 * from the calendar the moment anybody scheduled something.
 */
export function EventsSection({ events, unavailable }: EventsSectionProps) {
  const tEvents = useTranslations("Home.Events");
  const tUpcoming = useTranslations("Events.upcoming");

  return (
    <PageContainer id="events-section" className="bg-white">
      <SectionHeader
        subtitle={tEvents("subtitle")}
        title={tEvents("title")}
        description={tEvents("discription")}
      />

      {events.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3 reveal">
          {events.map((event, index) => (
            <SiteEventCard
              key={event.id}
              event={event}
              className={`delay-${(index + 1) * 100}`}
            />
          ))}
        </div>
      ) : (
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-[#E8E0CC] bg-[#FAF9F6] px-6 py-14 text-center">
          <CalendarX2 className="h-10 w-10 text-[#D4AF37]/50" />
          <p className="text-base text-[#4D4635]">
            {unavailable ? tUpcoming("unavailable") : tUpcoming("empty")}
          </p>
        </div>
      )}

      <div className="mt-12 flex justify-center reveal">
        <Link
          href="/events"
          className="group inline-flex items-center gap-2 rounded-full border-2 border-[#D4AF37] px-8 py-3.5 text-sm font-semibold text-[#735C00] transition-all duration-300 hover:bg-[#D4AF37] hover:text-white"
        >
          {tEvents("viewAll")}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </PageContainer>
  );
}
