'use client';

import { useState, useEffect } from 'react';
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
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalBatches: 0,
    todayAttendance: 0,
    totalSubjects: 2 // Chemistry and Physics
  });
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token found:', !!token);
      
      if (token) {
        try {
          console.log('Fetching dashboard stats...');
          // Fetch real dashboard stats from the new endpoint
          const statsResponse = await api.getDashboardStats(token);
          console.log('Stats response:', statsResponse);
          
          console.log('Fetching batches...');
          const batchesResponse = await api.getBatches(token);
          console.log('Batches response:', batchesResponse);
          
          // Store debug info
          setDebugInfo({
            statsResponse,
            batchesResponse,
            timestamp: new Date().toISOString()
          });
          
          setStats({
            totalStudents: statsResponse.totalStudents || 0,
            totalBatches: batchesResponse.length || 0,
            todayAttendance: 0, // This would need a separate endpoint for today's attendance
            totalSubjects: statsResponse.totalSubjects || 2
          });
          
          console.log('Final stats set:', {
            totalStudents: statsResponse.totalStudents || 0,
            totalBatches: batchesResponse.length || 0,
            todayAttendance: 0,
            totalSubjects: statsResponse.totalSubjects || 2
          });
        } catch (error) {
          console.error('Error fetching real stats:', error);
          // Fallback to fetching just batches if stats endpoint fails
          try {
            const batchesResponse = await api.getBatches(token);
            console.log('Fallback - batches response:', batchesResponse);
            setStats({
              totalStudents: 0, // Will show 0 if stats endpoint fails
              totalBatches: batchesResponse.length || 0,
              todayAttendance: 0,
              totalSubjects: 2
            });
          } catch (batchError) {
            console.error('Error fetching batches:', batchError);
            // Use fallback data if all API calls fail
            setStats({
              totalStudents: 0,
              totalBatches: 0,
              todayAttendance: 0,
              totalSubjects: 2
            });
          }
        }
      } else {
        console.log('No token found');
      }
    } catch (error) {
      console.error('Error in fetchStats:', error);
      setStats({
        totalStudents: 0,
        totalBatches: 0,
        todayAttendance: 0,
        totalSubjects: 2
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statsCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents.toString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Active Batches',
      value: stats.totalBatches.toString(),
      icon: GraduationCap,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: "Today's Check-ins",
      value: stats.todayAttendance.toString(),
      icon: UserCheck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Total Subjects',
      value: stats.totalSubjects.toString(),
      icon: BookOpen,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <br></br>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setIsLoading(true);
              fetchStats();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Stats
          </button>
          <div className="text-right">
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString(undefined, { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <BarChart3 className="text-blue-600" size={28} />
          Quick Actions
        </h2> <br></br>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{cardLinks.map(link => (
            <Link 
                key={link.title}
                href={link.href} 
                target={link.isExternal ? "_blank" : "_self"}
                className={`group p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between border-l-4 ${link.borderColor} hover:scale-105`}
            >
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`w-12 h-12 ${link.bgColor} rounded-lg flex items-center justify-center`}>
                          <link.icon className={`w-6 h-6 ${link.color}`} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800">{link.title}</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{link.description}</p>
                </div>
                <div className="flex justify-end mt-6 text-gray-400 group-hover:text-gray-800 transition-colors">
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </div>
            </Link>
        ))}
        </div>
      </div><br></br>

     
      {/* Debug Info */}
      {debugInfo && (
        <div className="bg-gray-100 rounded-xl p-4 mt-8">
          <h3 className="text-lg font-semibold mb-2">Debug Information</h3>
          <p className="text-sm text-gray-600 mb-2">Last updated: {debugInfo.timestamp}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium">Stats API Response:</h4>
              <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                {JSON.stringify(debugInfo.statsResponse, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-medium">Batches API Response:</h4>
              <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                {JSON.stringify(debugInfo.batchesResponse, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}