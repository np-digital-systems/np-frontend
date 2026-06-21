import Image from "next/image";
import { PageContainer } from "@/components/common/page-container";
import { SectionHeader } from "@/components/common/section-header";
import { DonationCard } from "../components/donation-card";
import { DONATION_TIERS } from "../constants/temple-info";
import { useLocale, useTranslations } from "next-intl";

export function DonationSection() {
  const tDonation = useTranslations("Home.Donation");

  const locale = useLocale() as 'en' | 'ta';
  const currentTiers = DONATION_TIERS[locale] || DONATION_TIERS.ta;
  return (
    <PageContainer id="donation-section" className="bg-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'url(\'data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="1.5" fill="%23D4AF37"/></svg>\')',
            backgroundRepeat: "repeat",
          }}
        />
      </div>

      <div className="relative z-10">
        <SectionHeader
          subtitle={tDonation("subtitle")}
          title={tDonation("title")}
          description={tDonation("description")}
        />

        {/* Central temple image */}
        <div className="flex justify-center mb-16 reveal">
          <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-3xl overflow-hidden shadow-[0_16px_48px_rgba(212,175,55,0.15)] border-2 border-[#D4AF37]/10">
            <Image
              src="/images/temple-rangoli.png"
              alt="Sacred flower rangoli"
              fill
              className="object-cover"
              sizes="320px"
            />
            {/* Glass overlay card */}
            <div className="absolute inset-x-4 bottom-4 p-4 rounded-xl bg-white/90 backdrop-blur-md shadow-lg">
              <p className="text-center text-sm font-heading font-semibold text-[#735C00]">
                {tDonation("tag")}
              </p>
            </div>
          </div>
        </div>

        {/* Donation Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start reveal">
          {currentTiers.map((tier, index) => (
            <DonationCard
              key={tier.id}
              title={tier.title}
              amount={tier.amount}
              description={tier.description}
              features={tier.features}
              isFeatured={tier.isFeatured}
              className={`delay-${(index + 1) * 100}`}
            />
          ))}
        </div>


      </div>
    </PageContainer>
  );
}
