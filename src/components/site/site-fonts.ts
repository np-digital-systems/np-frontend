import { Abhaya_Libre, Arima, Lora, Mukta_Malar } from "next/font/google";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";

const tamilHeading = localFont({
  src: "../../styles/fonts/Heading.ttf",
  variable: "--font-site-tamil-heading",
  display: "swap",
  declarations: [{ prop: "unicode-range", value: "U+0B80-0BFF, U+200C-200D, U+25CC" }],
  adjustFontFallback: false,
});

const tamilPara = localFont({
  src: "../../styles/fonts/Para.ttf",
  variable: "--font-site-tamil-para",
  display: "swap",
  declarations: [
    { prop: "unicode-range", value: "U+0B80-0BFF, U+200C-200D, U+25CC" },
    { prop: "size-adjust", value: "122%" },
  ],
  adjustFontFallback: false,
});

const tamilDisplay = Arima({
  variable: "--font-site-tamil-display",
  subsets: ["tamil", "latin"],
  display: "swap",
});

const tamilText = Mukta_Malar({
  variable: "--font-site-tamil-text",
  subsets: ["tamil", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const display = Abhaya_Libre({
  variable: "--font-site-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const sans = Lora({
  variable: "--font-site-sans",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const siteFontClassName = cn(
  tamilHeading.variable,
  tamilPara.variable,
  tamilDisplay.variable,
  tamilText.variable,
  display.variable,
  sans.variable
);
