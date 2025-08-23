'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck,
  MessageSquare,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Batches', href: '/batches', icon: GraduationCap },
  { name: 'Students', href: '/students', icon: Users },
  { name: 'Attendance Reports', href: '/attendance/reports', icon: CalendarCheck },
  { name: 'Messaging', href: '/messaging', icon: MessageSquare },
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname();
  const { setToken } = useAuth();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      setToken(null);
      await router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const closeMobileMenu = () => setIsMobileOpen(false);

  return (
    <>
      {/* Mobile menu toggle button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded bg-blue-800 text-white shadow-md"
        aria-label="Toggle navigation menu"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          w-80 h-full bg-gradient-to-b from-blue-900 via-blue-800 to-blue-600 text-white flex flex-col justify-between
          border-r border-blue-800
          lg:relative lg:translate-x-0
          fixed inset-y-0 left-0 z-50
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${className}
        `}
      >
        {/* Header */}
        <div className="flex flex-row items-center gap-5 px-8 py-7 border-b border-blue-800">
          <img src="/logo.png" alt="Logo" className="w-20 h-20 rounded-full bg-white object-cover shadow-md" />
          <div className="leading-tight">
            <span className="block text-lg text-blue-200 tracking-widest font-semibold uppercase">Universal Science Academy</span>
            </div>
        </div>
<br></br>
        {/* Navigation */}
  <nav className="flex-grow px-2 py-6 space-y-3 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={closeMobileMenu}
                className={`
                  flex items-center gap-3 px-8 py-5 rounded-xl
                  text-lg font-medium transition-all duration-150
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 text-white border-l-4 border-blue-300 shadow-sm'
                      : 'text-blue-100 hover:bg-blue-700/80 hover:text-white'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <link.icon className="w-5 h-5 flex-shrink-0 opacity-80" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout section */}
        <div className="px-6 py-5 border-t border-blue-800">
          <button
            onClick={handleLogout}
            className="
              flex items-center gap-2 w-full px-4 py-2 rounded-md
              text-base font-medium text-blue-100 bg-blue-800
              hover:bg-red-600 hover:text-white transition-all duration-150
              focus:outline-none focus:ring-2 focus:ring-red-400
            "
            aria-label="Logout from admin panel"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
