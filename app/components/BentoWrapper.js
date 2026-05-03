'use client';

import { useSession } from 'next-auth/react';
import Navbar from './Navbar';
import CommandPill from './CommandPill/CommandPill';
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
    <div className="luxury-workspace">
      <main className="luxury-content">
        {children}
      </main>
      <CommandPill />

      <style jsx global>{`
        .luxury-workspace {
          position: relative;
          min-height: 100vh;
          background: var(--bg-primary);
          overflow-x: hidden;
        }
        .luxury-content {
          width: 100%;
          min-height: 100vh;
          padding: 5.5rem 3rem 8rem 3rem;
          max-width: 1400px;
          margin: 0 auto;
        }
        @media (max-width: 1024px) {
          .luxury-content {
            padding: 5rem 2rem 7rem 2rem;
          }
        }
        @media (max-width: 768px) {
          .luxury-content {
            padding: 4.5rem 1.25rem 7rem 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}
