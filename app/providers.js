'use client';

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./context/ThemeContext";

export function Providers({ children }) {
  return (
    <ThemeProvider>
      <SessionProvider>
        {children}
      </SessionProvider>
    </ThemeProvider>
  );
}
