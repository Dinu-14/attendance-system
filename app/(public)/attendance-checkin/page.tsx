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
        <div className="justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="mb-4">
                        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <CheckCircle className="text-white" size={40} />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Student Attendance
                        </h1>
                        <p className="text-gray-600 text-lg">Check in to your class quickly and easily</p>
                    </div>

                    {/* Live Clock */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 inline-block">
                        <div className="flex items-center gap-3">
                            <Clock className="text-blue-600" size={24} />
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {mounted ? currentTime?.toLocaleTimeString() : '--:--:--'}
                                </div>
                                <div className="text-sm text-gray-600">
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
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                            <div className="text-center mb-6">
                                <BookOpen className="text-blue-600 mx-auto mb-4" size={48} />
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Admin: Start Attendance Session
                                </h2>
                                <p className="text-gray-600">
                                    Select the subject for today's attendance session
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Select Batch for Today's Session
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        {batches.map(batch => (
                                            <button
                                                key={batch.id}
                                                onClick={() => setSelectedBatch(batch.id.toString())}
                                                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                                                    selectedBatch === batch.id.toString()
                                                        ? 'border-green-500 bg-green-50 text-green-700'
                                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {subjects.map(subject => (
                                            <button
                                                key={subject.id}
                                                onClick={() => setSelectedSubject(subject.id.toString())}
                                                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                                                    selectedSubject === subject.id.toString()
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
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
                                    className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                >
                                    <LogIn size={20} />
                                    Start Attendance Session
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Student Check-in Interface */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Check-in Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                                {/* Session Info */}
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
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

                                <div className="text-center mb-8">
                                    <User className="text-blue-600 mx-auto mb-4" size={48} />
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                        Check In
                                    </h2>
                                    <p className="text-gray-600 text-lg">
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
                                            className="w-full px-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            disabled={isLoading}
                                            autoFocus
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading || !studentId.trim()}
                                        className="w-full py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-lg"
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
                                        className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <RefreshCw size={16} />
                                        End Session & Change Subject
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Session Stats */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Users className="text-blue-600" size={20} />
                                    Session Stats
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                        <span className="text-sm text-blue-900">Students Checked In</span>
                                        <span className="text-xl font-bold text-blue-600">{recentCheckIns.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                        <span className="text-sm text-green-900">Batch</span>
                                        <span className="text-sm font-semibold text-green-600">
                                            {batches.find(b => b.id === parseInt(selectedBatch))?.year || selectedBatch}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                        <span className="text-sm text-green-900">Subject</span>
                                        <span className="text-sm font-semibold text-green-600">
                                            {subjects.find(s => s.id === parseInt(selectedSubject))?.name}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Check-ins */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Clock className="text-green-600" size={20} />
                                    Recent Check-ins
                                </h3>
                                {recentCheckIns.length > 0 ? (
                                    <div className="space-y-3 max-h-80 overflow-y-auto">
                                        {recentCheckIns.map((checkIn) => (
                                            <div key={checkIn.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                                <div>
                                                    <div className="font-medium text-green-900">{checkIn.studentId}</div>
                                                    <div className="text-xs text-green-600">
                                                        {checkIn.time.toLocaleTimeString()}
                                                    </div>
                                                </div>
                                                <CheckCircle className="text-green-600" size={20} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No check-ins yet</p>
                                    </div>
                                )}
                            </div>

                            {/* Instructions */}
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <Smartphone size={20} />
                                    How to Check In
                                </h3>
                                <ul className="space-y-2 text-sm text-blue-100">
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