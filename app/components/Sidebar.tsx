'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, GraduationCap, CalendarCheck, MessageSquare, LogOut } from 'lucide-react';

const navLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Batches', href: '/batches', icon: GraduationCap },
  { name: 'Students', href: '/students', icon: Users },
  { name: 'Attendance Reports', href: '/attendance/reports', icon: CalendarCheck },
  { name: 'Messaging', href: '/messaging', icon: MessageSquare },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { setToken } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    setToken(null);
    router.push('/login');
  };
  
  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-center">Admin Panel</h2>
      </div>
      <nav className="flex-grow p-2">
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 my-1 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <link.icon className="w-5 h-5" />
              {link.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center w-full gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}