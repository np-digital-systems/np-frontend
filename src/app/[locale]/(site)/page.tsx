import { HeroSection } from "@/features/home/sections/hero-section";
import { AboutSection } from "@/features/home/sections/about-section";
import { EventsSection } from "@/features/home/sections/events-section";
import { GallerySection } from "@/features/home/sections/gallery-section";
import { DonationSection } from "@/features/home/sections/donation-section";
import { ContactSection } from "@/features/home/sections/contact-section";
import { ScrollReveal } from "@/features/home/components/scroll-reveal";
import { SpiritualDivider } from "@/components/site/spiritual-divider";
import { getUpcomingPublicEvents } from "@/features/events/lib/public-event-service";
import type { PublicEvent } from "@/features/events/types";

/** How many occurrences the home page previews before "view all". */
const PREVIEW_COUNT = 3;

export default async function HomePage() {
  // The calendar is one section of the page; it must not be able to take the
  // other five down with it when the API is unreachable.
  const events = await getUpcomingPublicEvents(PREVIEW_COUNT).catch(
    () => null as readonly PublicEvent[] | null,
  );

  return (
    <>
      <ScrollReveal />
      <HeroSection />
      <AboutSection />
      <SpiritualDivider variant="om" />
      <EventsSection events={events ?? []} unavailable={events === null} />
      <SpiritualDivider variant="lotus" />
      <GallerySection />
      <SpiritualDivider variant="om" />
      <DonationSection />
      <SpiritualDivider variant="lotus" />
      <ContactSection />
    </>
  );
}
