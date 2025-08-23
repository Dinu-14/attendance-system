'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowRight, 
  GraduationCap, 
  Users, 
  CalendarCheck, 
  MessageSquare, 
  MonitorPlay,
  TrendingUp,
  Clock,
  BookOpen,
  UserCheck,
  Calendar,
  BarChart3
} from 'lucide-react';
import * as api from '../../lib/api';

const cardLinks = [
    { 
        href: "/batches", 
        title: "Manage Batches", 
        description: "View and add new academic batches.",
        icon: GraduationCap,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200"
    },
    { 
        href: "/students", 
        title: "Manage Students", 
        description: "View, add, or import students via CSV.",
        icon: Users,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200"
    },
    { 
        href: "/attendance/reports", 
        title: "Attendance Reports", 
        description: "Check daily attendance for any class.",
        icon: CalendarCheck,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200"
    },
    { 
        href: "/messaging", 
        title: "Send Messages", 
        description: "Send common messages to students.",
        icon: MessageSquare,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200"
    },
    { 
        href: "/attendance-checkin", 
        title: "Open Check-in Terminal", 
        description: "Launch the public page for student check-ins.",
        icon: MonitorPlay,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        isExternal: true
    },
];

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalBatches: 0,
    todayAttendance: 0,
    totalSubjects: 2 // Chemistry and Physics
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.replace('/login');
    }
  }, [router]);

  useEffect(() => {
    // Replace with your actual API logic
    setStats({
      totalStudents: 120,
      totalBatches: 6,
      todayAttendance: 45,
      totalSubjects: 2
    });
    setIsLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 px-2 md:px-8 lg:px-16">
      
      

      

      {/* Quick Actions */}
      <div>
        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight drop-shadow-sm">
          <span className="flex items-center gap-3">
            <BarChart3 className="text-blue-600" size={32} />
            Quick Actions
          </span>
        </h2><br></br>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cardLinks.map(link => (
            <Link
              key={link.title}
              href={link.href}
              target={link.isExternal ? "_blank" : "_self"}
              className={`group p-7 bg-gradient-to-br from-white via-${link.bgColor.replace('bg-', '')} to-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between border-l-4 ${link.borderColor} hover:scale-105`}
              style={{ minHeight: '180px' }}
            >
              <div>
                <div className="flex items-center gap-5 mb-5">
                  <div className={`w-14 h-14 ${link.bgColor} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                    <link.icon className={`w-7 h-7 ${link.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors">{link.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed text-base md:text-lg">{link.description}</p>
              </div>
              <div className="flex justify-end mt-8 text-gray-400 group-hover:text-blue-700 transition-colors">
                <ArrowRight className="group-hover:translate-x-2 transition-transform" size={28} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
          
