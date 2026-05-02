'use client';

import { useSession } from 'next-auth/react';
import HUD from './HUD/HUD';
import Navbar from './Navbar';
import { usePathname } from 'next/navigation';

export default function HUDWrapper({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Pages where we DON'T want the HUD (e.g., Auth pages)
  const isAuthPage = pathname.startsWith('/auth');
  
  if (status === 'loading') return children;

  if (!session || isAuthPage) {
    return (
      <>
        {!isAuthPage && <Navbar />}
        {children}
      </>
    );
  }

  return (
    <>
      <HUD />
      <div style={{ paddingTop: '100px', position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </>
  );
}
