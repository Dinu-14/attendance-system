'use client';

import { useState, useEffect } from 'react';
import * as api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

export default function AttendanceReportPage() {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [reportData, setReportData] = useState<{ attendedStudents: any[], absentStudents: any[] } | null>(null);

    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    
    const [isLoading, setIsLoading] = useState(false);
    const { token } = useAuth();

    useEffect(() => {
        const fetchSubjects = async () => {
            if (!token) return;
            try {
                setSubjects(await api.getSubjects(token));
            } catch (error: any) {
                toast.error(`Failed to load subjects: ${error.message}`);
            }
        };
        fetchSubjects();
    }, [token]);

    const handleFetchReport = async () => {
        if (!token || !selectedSubject || !selectedDate) {
            toast.error('Please select a subject and a date.');
            return;
        }
        setIsLoading(true);
        setReportData(null);
        try {
            const data = await api.getAttendanceReport(parseInt(selectedSubject), selectedDate, token);
            setReportData(data);
        } catch (error: any) {
            toast.error(`Failed to fetch report: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Attendance Reports</h1>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium">Subject</label>
                        <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full mt-1 p-2 border rounded-md">
                            <option value="">Select Subject</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium">Date</label>
                        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full mt-1 p-2 border rounded-md" />
                    </div>
                    <button onClick={handleFetchReport} disabled={isLoading} className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
                        {isLoading ? "Loading..." : "Generate Report"}
                    </button>
                </div>
            </div>
            
            {reportData && (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-2xl font-semibold mb-4 text-green-700">Attended Students ({reportData.attendedStudents.length})</h2>
                        <div className="bg-white p-4 rounded-lg shadow">
                            <ul className="space-y-2">
                                {reportData.attendedStudents.map(s => <li key={s.studentId} className="p-2 bg-green-50 rounded">{s.fullName} ({s.studentId})</li>)}
                            </ul>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold mb-4 text-red-700">Absent Students ({reportData.absentStudents.length})</h2>
                         <div className="bg-white p-4 rounded-lg shadow">
                            <ul className="space-y-2">
                                {reportData.absentStudents.map(s => <li key={s.studentId} className="p-2 bg-red-50 rounded">{s.fullName} ({s.studentId})</li>)}
                            </ul>
                        </div>
                    </div>
                 </div>
            )}
        </div>
    );
}