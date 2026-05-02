'use client';

import { useSession } from 'next-auth/react';
import Sidebar from './Sidebar/Sidebar';
import Navbar from './Navbar';
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
    <div className="bento-layout">
      <Sidebar />
      <main className="bento-main">
        {children}
      </main>
      
      <style jsx global>{`
        .bento-layout {
          display: flex;
          min-height: 100vh;
          background: var(--bg-primary);
        }
        .bento-main {
          flex: 1;
          margin-left: 260px; /* Default open width */
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 2rem;
          min-width: 0; /* Prevent flex overflow */
        }
        .bento-sidebar.closed + .bento-main {
          margin-left: 80px;
        }
        @media (max-width: 768px) {
          .bento-main {
            margin-left: 0 !important;
            padding: 1rem;
            padding-bottom: 5rem; /* For mobile nav */
          }
        }
      `}</style>
    </div>
  );
}
