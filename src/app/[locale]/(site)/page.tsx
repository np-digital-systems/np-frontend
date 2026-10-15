import { HeroSection } from "@/features/home/sections/hero-section";
import { AboutSection } from "@/features/home/sections/about-section";
import { EventsSection } from "@/features/home/sections/events-section";
import { GallerySection } from "@/features/home/sections/gallery-section";
import { DonationSection } from "@/features/home/sections/donation-section";
import { ContactSection } from "@/features/home/sections/contact-section";
import { ScrollReveal } from "@/features/home/components/scroll-reveal";
import { SpiritualDivider } from "@/components/site/spiritual-divider";
import {
  getUpcomingPublicEvents,
  readPublicEvents,
} from "@/features/events/lib/public-event-service";

const PREVIEW_COUNT = 3;

export default async function HomePage() {
  // An unreachable API must not fail the rest of the page.
  const preview = await readPublicEvents(
    () => getUpcomingPublicEvents(PREVIEW_COUNT),
    "the home page preview",
  );

  return (
    <>
      <ScrollReveal />
      <HeroSection />
      <AboutSection />
      <SpiritualDivider variant="om" />
      <EventsSection
        events={preview.events}
        unavailable={preview.unavailable}
      />
      <SpiritualDivider variant="lotus" />
      <GallerySection />
      <SpiritualDivider variant="om" />
      <DonationSection />
      <SpiritualDivider variant="lotus" />
      <ContactSection />
    </>
  );
}
