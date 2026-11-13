import { ArrowRight, CalendarX2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { PageContainer } from "@/components/site/page-container";
import { SectionHeader } from "@/components/site/section-header";
import { KolamMandala } from "@/components/site/kolam";
import { SiteEventCard } from "@/features/events/sections/site";
import type { PublicEvent } from "@/features/events/types";
import { Link } from "@/i18n/routing";

interface EventsSectionProps {
  events: readonly PublicEvent[];
  /** The calendar could not be reached (distinct from empty). */
  unavailable?: boolean;
}

export function EventsSection({ events, unavailable }: EventsSectionProps) {
  const tEvents = useTranslations("Home.Events");
  const tUpcoming = useTranslations("Events.upcoming");

  return (
    <PageContainer
      id="events-section"
      className="relative isolate overflow-hidden bg-temple-maroon"
    >
      <div className="absolute inset-0 -z-10 temple-kolam-dots text-temple-gold/10" />
      <KolamMandala className="temple-spin-reverse absolute -right-48 -top-48 -z-10 w-[520px] text-temple-gold/15" />
      <KolamMandala className="temple-spin-slow absolute -bottom-56 -left-56 -z-10 w-[560px] text-temple-gold/10" />
      <SectionHeader
        tone="dark"
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
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-temple-gold/20 bg-temple-night/40 px-6 py-14 text-center">
          <CalendarX2 className="h-10 w-10 text-temple-gold/50" />
          <p className="text-base text-temple-paper/75">
            {unavailable ? tUpcoming("unavailable") : tUpcoming("empty")}
          </p>
        </div>
      )}

      <div className="mt-12 flex justify-center reveal">
        <Link
          href="/events"
          className="group inline-flex items-center gap-2 rounded-full border-2 border-temple-gold px-8 py-3.5 text-sm font-semibold text-temple-gold-soft transition-all duration-300 hover:bg-temple-gold hover:text-temple-night"
        >
          {tEvents("viewAll")}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </PageContainer>
  );
}
