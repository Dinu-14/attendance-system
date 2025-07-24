import Link from 'next/link';
import { ArrowRight, GraduationCap, Users, CalendarCheck, MessageSquare, MonitorPlay } from 'lucide-react';

const cardLinks = [
    { 
        href: "/batches", 
        title: "Manage Batches", 
        description: "View and add new academic batches.",
        icon: GraduationCap,
        color: "text-blue-600",
        borderColor: "border-blue-200"
    },
    { 
        href: "/students", 
        title: "Manage Students", 
        description: "View, add, or import students via CSV.",
        icon: Users,
        color: "text-green-600",
        borderColor: "border-green-200"
    },
    { 
        href: "/attendance/reports", 
        title: "Attendance Reports", 
        description: "Check daily attendance for any class.",
        icon: CalendarCheck,
        color: "text-purple-600",
        borderColor: "border-purple-200"
    },
    { 
        href: "/messaging", 
        title: "Send Messages", 
        description: "Send common messages to students.",
        icon: MessageSquare,
        color: "text-yellow-600",
        borderColor: "border-yellow-200"
    },
    { 
        href: "/attendance-checkin", 
        title: "Open Check-in Terminal", 
        description: "Launch the public page for student check-ins.",
        icon: MonitorPlay,
        color: "text-red-600",
        borderColor: "border-red-200",
        isExternal: true
    },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {cardLinks.map(link => (
            <Link 
                key={link.title}
                href={link.href} 
                target={link.isExternal ? "_blank" : "_self"}
                className={`group p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between border-t-4 ${link.borderColor}`}
            >
                <div>
                    <div className="flex items-center gap-4 mb-3">
                        <link.icon className={`w-8 h-8 ${link.color}`} />
                        <h2 className="text-xl font-semibold text-gray-700">{link.title}</h2>
                    </div>
                    <p className="text-gray-600">{link.description}</p>
                </div>
                <div className="flex justify-end mt-4 text-gray-400 group-hover:text-gray-800 transition-colors">
                    <ArrowRight />
                </div>
            </Link>
        ))}
      </div>
    </div>
  );
}