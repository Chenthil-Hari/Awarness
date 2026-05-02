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
  title: "Cyber Brain - AWRNESS | Neural Training Platform",
  description: "Next-generation simulation-based learning for digital operatives.",
  manifest: "/manifest.json",
};

import { Providers } from "./providers";
import ChatBot from "./components/ChatBot";
import GhostBanner from "./components/GhostBanner";
import SupportWidget from "./components/SupportWidget";
import ClickSpark from "./components/ClickSpark/ClickSpark";
import MobileBottomNav from "./components/MobileBottomNav";
import RealTimeDuelHandler from "./components/RealTimeDuelHandler";
import MaintenanceGuard from "./components/MaintenanceGuard";
import BentoWrapper from "./components/BentoWrapper";
import NeuralCursor from "./components/NeuralCursor";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${plusJakarta.variable}`} suppressHydrationWarning>
      <body>
        <Providers>
          <MaintenanceGuard>
            <ClickSpark
              sparkColor='var(--accent-primary)'
              sparkSize={10}
              sparkRadius={15}
              sparkCount={8}
              duration={400}
            >
              <NeuralCursor />
              <div className="crt-scanlines" />
              <BentoWrapper>
                <GhostBanner />
                {children}
              </BentoWrapper>
              <ChatBot />
              <MobileBottomNav />
              <RealTimeDuelHandler />
            </ClickSpark>
          </MaintenanceGuard>
        </Providers>
      </body>
    </html>
  );
}
