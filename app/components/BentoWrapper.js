'use client';

import { useSession } from 'next-auth/react';
import Navbar from './Navbar';
import BottomDock from './BottomDock/BottomDock';
import { usePathname } from 'next/navigation';

export default function BentoWrapper({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

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
    <div className="glass-os-layout">
      <main className="glass-os-main">
        {children}
      </main>
      <BottomDock />
      
      <style jsx global>{`
        .glass-os-layout {
          position: relative;
          min-height: 100vh;
          background: var(--bg-primary);
          overflow-x: hidden;
        }
        .glass-os-main {
          width: 100%;
          min-height: 100vh;
          padding: 6rem 2rem 8rem 2rem;
          transition: all 0.5s ease;
        }
        @media (max-width: 768px) {
          .glass-os-main {
            padding: 5rem 1rem 7rem 1rem;
          }
        }
      `}</style>
    </div>
  );
}
