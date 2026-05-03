'use client';

import { useSession } from 'next-auth/react';
import Navbar from './Navbar';
import TopNav from './TopNav/TopNav';
import { usePathname } from 'next/navigation';

export default function BentoWrapper({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/auth');

  if (status === 'loading') return children;

  if (!session || isAuthPage) {
    return (
      <>
        {!isAuthPage && <TopNav />}
        {children}
      </>
    );
  }

  return (
    <div className="app-layout">
      <TopNav />
      <main className="app-main">
        {children}
      </main>

      <style jsx global>{`
        .app-layout {
          min-height: 100vh;
          background: var(--bg-primary);
        }
        .app-main {
          padding-top: 64px; /* height of TopNav */
          min-height: 100vh;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding-left: 2rem;
          padding-right: 2rem;
          padding-bottom: 3rem;
        }
        @media (max-width: 768px) {
          .app-main {
            padding-left: 1rem;
            padding-right: 1rem;
            padding-top: 64px;
          }
        }
      `}</style>
    </div>
  );
}
