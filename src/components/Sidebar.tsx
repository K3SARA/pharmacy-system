'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen to handle layout differences
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Do not render sidebar on print pages
  if (pathname.startsWith('/print')) {
    return null;
  }

  const navItems = [
    { name: 'Dashboard', path: '/', icon: '📊' },
    { name: 'Billing (POS)', path: '/billing', icon: '🛒' },
    { name: 'Billing History', path: '/history', icon: '📜' },
    { name: 'Inventory', path: '/inventory', icon: '💊' },
    { name: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  return (
    <aside className={`sidebar ${isCollapsed && !isMobile ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)', flexShrink: 0 }}>
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span className="sidebar-text">Pharmacy</span>
        </h2>
        
        {/* Toggle Button (Mobile: Dropdown, Desktop: Collapse) */}
        <button className="menu-btn" onClick={() => isMobile ? setIsOpen(!isOpen) : setIsCollapsed(!isCollapsed)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {(isMobile && isOpen) ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </>
            )}
          </svg>
        </button>
      </div>

      <nav className={isMobile && isOpen ? 'open' : ''} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`nav-link ${isActive ? 'active' : ''}`}
              onClick={() => { if (isMobile) setIsOpen(false); }}
              title={isCollapsed && !isMobile ? item.name : undefined}
            >
              <span style={{ fontSize: '1.25rem', width: '24px', textAlign: 'center' }}>{item.icon}</span>
              <span className="sidebar-text" style={{ whiteSpace: 'nowrap' }}>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
