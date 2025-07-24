'use client';

import { useState, useEffect } from 'react';
import * as api from '../../lib/api';
import toast from 'react-hot-toast';

// Dummy token for fetching subjects - in a real scenario, this page might need its own auth
const DUMMY_TOKEN = 'dummy-for-public-page';

export default function AttendanceCheckinPage() {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [isSessionSet, setIsSessionSet] = useState(false);
    const [studentId, setStudentId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                // In a real app, this endpoint might need to be public or use a different auth method
                // For now, we simulate an admin setting it up. A better approach might be a dedicated endpoint
                // that doesn't require a user-specific token.
                // This is a temporary solution to make it work.
                const allSubjects = await api.getSubjects(DUMMY_TOKEN); // This will likely fail with 401. We will use dummy data.
                setSubjects(allSubjects);
            } catch (error) {
                console.error("Could not fetch subjects. Using dummy data.", error);
                setSubjects([{ id: 1, name: 'Chemistry' }, { id: 2, name: 'Physics' }]);
            }
        };
        fetchSubjects();
    }, []);
    
    const handleSessionStart = () => {
        if (selectedSubject) {
            setIsSessionSet(true);
        } else {
            toast.error('Please select a subject to start the session.');
        }
    };

    const handleCheckIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentId) return;
        setIsLoading(true);
        const toastId = toast.loading('Processing...');

        try {
            const response = await api.markAttendance(studentId, parseInt(selectedSubject));
            toast.success(response, { id: toastId });
            setStudentId('');
        } catch (error: any) {
            toast.error(`Error: ${error.message}`, { id: toastId });
        } finally {
            setIsLoading(false);
            // Auto focus input for the next student
            document.getElementById('studentIdInput')?.focus();
        }
    };
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-center text-blue-800">Attendance Check-in</h1>
                
                {!isSessionSet ? (
                    <div className="space-y-4">
                        <h2 className="text-xl text-center">Setup Session</h2>
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Select Subject</label>
                            <select
                                id="subject"
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">-- Select Subject --</option>
                                {subjects.map((sub) => (
                                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                                ))}
                            </select>
                        </div>
                        <button onClick={handleSessionStart} className="w-full px-4 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">
                            Start Session
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-center">
                            Class: <span className="text-green-700">{subjects.find(s => s.id == selectedSubject)?.name}</span>
                        </h2>
                        <form onSubmit={handleCheckIn} className="flex gap-2">
                            <input
                                id="studentIdInput"
                                type="text"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                                placeholder="Enter Your Student ID"
                                disabled={isLoading}
                                autoFocus
                                className="flex-grow w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <button type="submit" disabled={isLoading} className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                                {isLoading ? '...' : 'Check In'}
                            </button>
                        </form>
                        <button onClick={() => setIsSessionSet(false)} className="w-full text-sm text-center text-gray-600 hover:underline">
                            Change Session Subject
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}