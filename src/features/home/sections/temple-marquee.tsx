import { useTranslations } from "next-intl";

const ITEM_KEYS = [
  "ganeshaya",
  "gamGanapataye",
  "vinayakaya",
  "vighneshwaraya",
  "ekadantaya",
] as const;

export function TempleMarquee() {
  const t = useTranslations("Home.Marquee");
  const items = ITEM_KEYS.map((key) => t(key));

  return (
    <div className="temple-marquee relative overflow-hidden border-y border-temple-gold/40 bg-gradient-to-r from-temple-gold via-temple-saffron to-temple-gold py-4">
      <div className="temple-marquee-track flex w-max">
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            className="flex shrink-0 items-center"
            aria-hidden={copy === 1 ? true : undefined}
          >
            {items.map((item) => (
              <li
                key={item}
                className="flex items-center gap-8 px-4 font-heading text-xl font-semibold text-temple-night md:text-2xl"
              >
                {item}
                <span className="text-base text-temple-maroon/70">✦</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
