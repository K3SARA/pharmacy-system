'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  // Do not render sidebar on print pages
  if (pathname.startsWith('/print')) {
    return null;
  }

  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Billing (POS)', path: '/billing' },
    { name: 'Inventory', path: '/inventory' },
    { name: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="sidebar">
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}>
          <path d="M12 5v14M5 12h14" />
        </svg>
        Pharmacy System
      </h2>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
