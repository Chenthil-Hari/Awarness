import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export const metadata = {
  title: "Awareness Pro | Simulation-Based Learning",
  description: "Master real-world challenges through interactive, scenario-driven simulations in cybersecurity, finance, and life skills.",
};

import { Providers } from "./providers";
import ChatBot from "./components/ChatBot";
import GhostBanner from "./components/GhostBanner";
import SupportWidget from "./components/SupportWidget";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${plusJakarta.variable}`} suppressHydrationWarning>
      <body>
        <Providers>
          <GhostBanner />
          <SupportWidget />
          {children}
          <ChatBot />
        </Providers>
      </body>
    </html>
  );
}
