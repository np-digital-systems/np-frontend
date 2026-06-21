import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageContainer } from "@/components/common/page-container";
import { SectionHeader } from "@/components/common/section-header";
import { EventCard } from "../components/event-card";
import { FEATURED_EVENTS } from "../constants/events";
import {useLocale, useTranslations} from "next-intl";
import {type Locale} from "@/i18n/routing";

export function EventsSection() {

  const tEvents=useTranslations("Home.Events");

  const locale = useLocale() as Locale;
  const currentEvents = FEATURED_EVENTS[locale] || FEATURED_EVENTS.ta;


  return (
    <PageContainer id="events-section" className="bg-white">
      <SectionHeader
        subtitle={tEvents("subtitle")}
        title={tEvents("title")}
        description={tEvents("discription")}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 reveal">
        {currentEvents.map((event, index) => (
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
          {tEvents("viewAll")}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </PageContainer>
  );
}
