"use client";

import { HeroSection } from "@/features/home/sections/hero-section";
import { AboutSection } from "@/features/home/sections/about-section";
import { EventsSection } from "@/features/home/sections/events-section";
import { GallerySection } from "@/features/home/sections/gallery-section";
import { DonationSection } from "@/features/home/sections/donation-section";
import { ContactSection } from "@/features/home/sections/contact-section";
import { SpiritualDivider } from "@/components/common/spiritual-divider";
import { useHome } from "@/features/home/hooks/use-home";

export default function HomePage() {
  useHome();

  return (
    <>
      <HeroSection />
      <AboutSection />
      <SpiritualDivider variant="om" />
      <EventsSection />
      <SpiritualDivider variant="lotus" />
      <GallerySection />
      <SpiritualDivider variant="om" />
      <DonationSection />
      <SpiritualDivider variant="lotus" />
      <ContactSection />
    </>
  );
}