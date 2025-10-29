'use client';

import { useState, useEffect } from 'react';
import * as api from '../../lib/api';
import toast from 'react-hot-toast';
import { 
  CheckCircle, 
  Clock, 
  User, 
  BookOpen, 
  Calendar,
  Users,
  LogIn,
  AlertCircle,
  Smartphone,
  CheckSquare,
  RefreshCw
} from 'lucide-react';

// Dummy token for fetching subjects - in a real scenario, this page might need its own auth
const DUMMY_TOKEN = 'dummy-for-public-page';

export default function AttendanceCheckinPage() {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [isSessionSet, setIsSessionSet] = useState(false);
    const [studentId, setStudentId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [recentCheckIns, setRecentCheckIns] = useState<any[]>([]);
    const [currentTime, setCurrentTime] = useState<Date | null>(null);
    const [mounted, setMounted] = useState(false);

    // Only start updating time after component is mounted on client
    useEffect(() => {
        setMounted(true);
        setCurrentTime(new Date());
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchBatchesAndSubjects = async () => {
            try {
                // Fetch batches first
                const allBatches = await fetch('http://localhost:8080/api/attendance/public/batches')
                    .then(async (response) => {
                        if (!response.ok) {
                            const errorData = await response.json().catch(() => ({ message: 'Failed to fetch batches' }));
                            throw new Error(errorData.message || 'Failed to fetch batches');
                        }
                        return response.json();
                    });
                setBatches(allBatches);
            } catch (error: any) {
                console.error('Could not fetch batches:', error.message);
                toast.error(`Failed to load batches: ${error.message}`);
                setBatches([]);
            }

            // Fetch subjects
            try {
                const response = await fetch('http://localhost:8080/api/attendance/public/subjects');
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch subjects' }));
                    throw new Error(errorData.message || 'Failed to fetch subjects');
                }
                const allSubjects = await response.json();
                setSubjects(allSubjects);
            } catch (error: any) {
                console.error('Could not fetch subjects:', error.message);
                toast.error(`Failed to load subjects: ${error.message}`);
                // Fallback to dummy data
                setSubjects([{ id: 1, name: 'Chemistry' }, { id: 2, name: 'Physics' }]);
            }
        };
        fetchBatchesAndSubjects();
    }, []);
    
    const handleSessionStart = () => {
        if (selectedBatch && selectedSubject) {
            setIsSessionSet(true);
            toast.success('Attendance session started!');
        } else {
            toast.error('Please select a batch and a subject to start the session.');
        }
    };

    const handleCheckIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentId.trim()) {
            toast.error('Please enter your Student ID');
            return;
        }
        
        setIsLoading(true);
        const toastId = toast.loading('Checking you in...');

        try {
            const response = await api.markAttendance(
                studentId.trim(), 
                parseInt(selectedSubject), 
                parseInt(selectedBatch)
            );
            toast.success('✅ Attendance marked successfully!', { id: toastId });
            
            // Add to recent check-ins
            const newCheckIn = {
                id: Date.now(),
                studentId: studentId.trim(),
                subject: subjects.find(s => s.id === parseInt(selectedSubject))?.name,
                time: new Date()
            };
            setRecentCheckIns(prev => [newCheckIn, ...prev.slice(0, 9)]);
            
            setStudentId('');
        } catch (error: any) {
            toast.error(`❌ ${error.message}`, { id: toastId });
        } finally {
            setIsLoading(false);
            // Auto focus input for the next student
            document.getElementById('studentIdInput')?.focus();
        }
    };
    
    const resetSession = () => {
        setIsSessionSet(false);
    setSelectedBatch('');
        setSelectedSubject('');
        setStudentId('');
        setRecentCheckIns([]);
        toast.success('Session reset successfully');
    };
    
    return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-100 via-white to-green-100 p-4 lg:p-10 xl:p-16 relative font-sans">
            {/* Decorative SVG wave background */}
            <svg className="hidden xl:block absolute top-0 left-0 w-full h-64 z-0" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill="#60a5fa" fillOpacity="0.12" d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,133.3C840,107,960,85,1080,101.3C1200,117,1320,171,1380,197.3L1440,224L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z" />
            </svg>
            {/* Decorative glassmorphism blob */}
            <div className="hidden xl:block absolute right-0 top-0 w-1/2 h-3/4 bg-white/30 backdrop-blur-2xl rounded-bl-[8rem] shadow-2xl opacity-70 pointer-events-none z-0" />
            <div className="relative z-10 flex flex-col items-center justify-center flex-1 min-h-[80vh]">
                {/* Header */}
                <div className="text-center mb-8 xl:mb-12 flex flex-col items-center">
                    <div className="flex flex-row items-center justify-center gap-4 mb-2">
                        <div className="w-16 h-16 xl:w-24 xl:h-24 bg-gradient-to-br from-blue-500 to-blue-400 rounded-full flex items-center justify-center shadow-2xl border-8 border-white animate-bounce-slow">
                            <CheckCircle className="text-white drop-shadow-lg" size={40} />
                        </div>
                        <h1 className="text-4xl xl:text-5xl font-extrabold text-gray-900 tracking-tight font-[Poppins,sans-serif]">
                            Student Attendance
                        </h1>
                    </div>
                    <p className="text-gray-600 text-lg xl:text-xl mb-2 font-[Inter,sans-serif] mt-2">Check in to your class quickly and easily</p>
                    {/* Live Clock */}
                    <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-xl border border-blue-100 p-4 xl:p-6 mb-6 inline-block mt-2">
                        <div className="flex items-center gap-3 xl:gap-5">
                            <Clock className="text-blue-600 animate-spin-slow" size={28} />
                            <div>
                                <div className="text-2xl xl:text-3xl font-bold text-gray-900">
                                    {mounted ? currentTime?.toLocaleTimeString() : '--:--:--'}
                                </div>
                                <div className="text-sm xl:text-base text-gray-600">
                                    {mounted && currentTime ? currentTime.toLocaleDateString('en-US', { 
                                        weekday: 'long', 
                                        day: 'numeric',
                                        month: 'long', 
                                        year: 'numeric'
                                    }).replace(',', '') : '--'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {!isSessionSet ? (
                    /* Admin Session Setup */
                    <div className="w-full max-w-2xl xl:max-w-3xl mx-auto">
                        <div className="bg-white/80 backdrop-blur-2xl rounded-2xl shadow-2xl border border-blue-100 p-8 xl:p-12 transition-all duration-300">
                            <div className="text-center mb-6 xl:mb-10">
                                <BookOpen className="text-blue-600 mx-auto mb-4" size={56} />
                                <h2 className="text-2xl xl:text-3xl font-bold text-gray-900 mb-2">
                                    Admin: Start Attendance Session
                                </h2>
                                <p className="text-gray-600 xl:text-lg">
                                    Select the subject for today's attendance session
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Select Batch for Today's Session
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-6 mb-4">
                                        {batches.map(batch => (
                                            <button
                                                key={batch.id}
                                                onClick={() => setSelectedBatch(batch.id.toString())}
                                                className={`p-4 rounded-xl border-2 transition-all duration-200 shadow-sm hover:shadow-lg hover:scale-[1.03] ${
                                                    selectedBatch === batch.id.toString()
                                                        ? 'border-green-500 bg-green-50 text-green-700'
                                                        : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/40'
                                                }`}
                                            >
                                                <Users className="mx-auto mb-2" size={24} />
                                                <div className="font-semibold">Batch {batch.year || batch.id}</div>
                                            </button>
                                        ))}
                                    </div>

                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Select Subject for Today's Session
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-6">
                                        {subjects.map(subject => (
                                            <button
                                                key={subject.id}
                                                onClick={() => setSelectedSubject(subject.id.toString())}
                                                className={`p-4 rounded-xl border-2 transition-all duration-200 shadow-sm hover:shadow-lg hover:scale-[1.03] ${
                                                    selectedSubject === subject.id.toString()
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                        : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/40'
                                                }`}
                                            >
                                                <BookOpen className="mx-auto mb-2" size={24} />
                                                <div className="font-semibold">{subject.name}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handleSessionStart}
                                    disabled={!selectedBatch || !selectedSubject}
                                    className="w-full py-4 xl:py-5 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-lg xl:text-xl shadow-md hover:shadow-xl"
                                >
                                    <LogIn size={20} />
                                    Start Attendance Session
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Student Check-in Interface */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12 w-full max-w-6xl mx-auto">
                        {/* Check-in Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white/80 backdrop-blur-2xl rounded-xl shadow-2xl border border-blue-100 p-8 xl:p-12">
                                {/* Session Info */}
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 xl:p-6 mb-6">
                                    <div className="flex items-center gap-3">
                                        <CheckSquare className="text-green-600" size={24} />
                                        <div>
                                            <h3 className="font-semibold text-green-900">
                                                Attendance Session Active
                                            </h3>
                                            <div className="text-sm text-green-700 space-y-1">
                                                <p>
                                                    Batch: {batches.find(b => b.id === parseInt(selectedBatch))?.year || selectedBatch}
                                                </p>
                                                <p>
                                                    Subject: {subjects.find(s => s.id === parseInt(selectedSubject))?.name}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center mb-8 xl:mb-12">
                                    <User className="text-blue-600 mx-auto mb-4" size={56} />
                                    <h2 className="text-3xl xl:text-4xl font-bold text-gray-900 mb-2">
                                        Check In
                                    </h2>
                                    <p className="text-gray-600 text-lg xl:text-xl">
                                        Enter your Student ID to mark your attendance
                                    </p>
                                </div>

                                <form onSubmit={handleCheckIn} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Student ID
                                        </label>
                                        <input
                                            id="studentIdInput"
                                            type="text"
                                            value={studentId}
                                            onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                                            placeholder="Enter your student ID (e.g., ST001)"
                                            className="w-full px-4 py-4 xl:py-5 text-lg xl:text-xl border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/70 backdrop-blur-md shadow-sm"
                                            disabled={isLoading}
                                            autoFocus
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading || !studentId.trim()}
                                        className="w-full py-4 xl:py-5 bg-gradient-to-r from-green-600 to-green-400 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-lg xl:text-xl shadow-md hover:shadow-xl"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                Checking In...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle size={24} />
                                                Mark Attendance
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <button
                                        onClick={resetSession}
                                        className="w-full py-3 xl:py-4 bg-gray-100/80 backdrop-blur font-medium rounded-xl hover:bg-gray-200/90 transition-all duration-200 flex items-center justify-center gap-2 text-base xl:text-lg shadow-sm hover:shadow-md"
                                    >
                                        <RefreshCw size={16} />
                                        End Session & Change Subject
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6 xl:space-y-10">
                            {/* Session Stats */}
                            <div className="bg-white/80 backdrop-blur-2xl rounded-xl shadow-xl border border-blue-100 p-6 xl:p-8">
                                <h3 className="text-lg xl:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Users className="text-blue-600" size={24} />
                                    Session Stats
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 xl:p-4 bg-blue-50 rounded-lg">
                                        <span className="text-sm xl:text-base text-blue-900">Students Checked In</span>
                                        <span className="text-xl xl:text-2xl font-bold text-blue-600">{recentCheckIns.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 xl:p-4 bg-green-50 rounded-lg">
                                        <span className="text-sm xl:text-base text-green-900">Batch</span>
                                        <span className="text-sm xl:text-base font-semibold text-green-600">
                                            {batches.find(b => b.id === parseInt(selectedBatch))?.year || selectedBatch}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 xl:p-4 bg-green-50 rounded-lg">
                                        <span className="text-sm xl:text-base text-green-900">Subject</span>
                                        <span className="text-sm xl:text-base font-semibold text-green-600">
                                            {subjects.find(s => s.id === parseInt(selectedSubject))?.name}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Check-ins */}
                            <div className="bg-white/80 backdrop-blur-2xl rounded-xl shadow-xl border border-blue-100 p-6 xl:p-8">
                                <h3 className="text-lg xl:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Clock className="text-green-600" size={24} />
                                    Recent Check-ins
                                </h3>
                                {recentCheckIns.length > 0 ? (
                                    <div className="space-y-3 max-h-80 xl:max-h-96 overflow-y-auto">
                                        {recentCheckIns.map((checkIn) => (
                                            <div key={checkIn.id} className="flex items-center justify-between p-3 xl:p-4 bg-green-50 rounded-lg">
                                                <div>
                                                    <div className="font-medium text-green-900 text-base xl:text-lg">{checkIn.studentId}</div>
                                                    <div className="text-xs xl:text-sm text-green-600">
                                                        {checkIn.time.toLocaleTimeString()}
                                                    </div>
                                                </div>
                                                <CheckCircle className="text-green-600" size={22} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <AlertCircle size={36} className="mx-auto mb-2 opacity-50" />
                                        <p className="text-sm xl:text-base">No check-ins yet</p>
                                    </div>
                                )}
                            </div>

                            {/* Instructions */}
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600/90 rounded-xl p-6 xl:p-8 text-white shadow-lg">
                                <h3 className="text-lg xl:text-xl font-semibold mb-3 flex items-center gap-2">
                                    <Smartphone size={24} />
                                    How to Check In
                                </h3>
                                <ul className="space-y-2 text-sm xl:text-base text-blue-100">
                                    <li>• Enter your Student ID exactly as provided</li>
                                    <li>• Press "Mark Attendance" button</li>
                                    <li>• Wait for confirmation message</li>
                                    <li>• Your parents will receive SMS notification</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Custom animation for slow bounce and spin
// Add to your global CSS (e.g., globals.css):
// .animate-bounce-slow { animation: bounce 2.5s infinite; }
// .animate-spin-slow { animation: spin 3s linear infinite; }