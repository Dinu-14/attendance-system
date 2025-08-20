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
  const { setToken, user } = useAuth();
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-900 text-white shadow-md"
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
          w-64 h-full bg-gray-900 text-white flex flex-col justify-between
          lg:relative lg:translate-x-0
          fixed inset-y-0 left-0 z-50
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${className}
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700 text-center">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
          {user && (
            <p className="text-sm text-gray-400 mt-1">
              Welcome, {user.name || 'Admin'}
            </p>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-grow px-4 py-6 space-y-5 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={closeMobileMenu}
                className={`
                  flex items-center gap-4 px-5 py-3 rounded-xl
                  text-sm font-medium transition-all duration-200 shadow-sm
                  ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md scale-105'
                      : 'bg-gray-800/70 text-gray-300 hover:bg-gray-800 hover:text-white hover:scale-[1.02]'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <link.icon className="w-5 h-5 flex-shrink-0" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout section */}
        <div className="p-6 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="
              flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl
              text-sm font-medium text-gray-300 bg-gray-800/80
              hover:bg-red-600 hover:text-white transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm
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
