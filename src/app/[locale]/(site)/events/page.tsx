import type { Metadata } from "next";
import Image from "next/image";
import { PageContainer } from "@/components/common/page-container";
import { SectionHeader } from "@/components/common/section-header";
import { EventCard } from "@/features/home/components/event-card";
import { FEATURED_EVENTS } from "@/features/home/constants/events";
import { useTranslations } from "next-intl";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Discover upcoming spiritual gatherings, festivals, and sacred ceremonies at Neeliyampathi Pillaiyar Kovil.",
};

const currentEvents = FEATURED_EVENTS.en


export default function EventsPage() {

  const tEvents = useTranslations("Events");

  return (
    <>
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/festival-navaratri.png"
          alt="Temple festival celebration"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#8B0000]/60 to-black/50" />
        <div className="relative z-10 text-center px-4">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            {tEvents("title")}
          </h1>
          <p className="text-white/80 text-lg font-sans max-w-xl mx-auto">
            {tEvents("subtitle")}
          </p>
        </div>
      </section>

      <PageContainer className="bg-[#FAF9F6]">
        <SectionHeader
          subtitle={tEvents("section1.subtitle")}
          title={tEvents("section1.title")}
          description={tEvents("section1.description")}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {currentEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </PageContainer>
    </>
  );
}