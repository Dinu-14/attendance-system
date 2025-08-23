'use client';

import { useState, useEffect } from 'react';
import * as api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  Calendar, 
  BarChart3, 
  Users, 
  UserCheck, 
  UserX, 
  Download, 
  Filter,
  Clock,
  TrendingUp,
  BookOpen,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function AttendanceReportPage() {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [reportData, setReportData] = useState<{ attendedStudents: any[], absentStudents: any[] } | null>(null);

    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    
    const [isLoading, setIsLoading] = useState(false);
    const { token } = useAuth();

    const [batches, setBatches] = useState<any[]>([]);
    const [selectedBatch, setSelectedBatch] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            try {
                const [subjectsData, batchesData] = await Promise.all([
                    api.getSubjects(token),
                    api.getBatches(token)
                ]);
                setSubjects(subjectsData);
                setBatches(batchesData);
            } catch (error: any) {
                toast.error(`Failed to load data: ${error.message}`);
            }
        };
        fetchData();
    }, [token]);

    const handleFetchReport = async () => {
        if (!token || !selectedSubject || !selectedDate || !selectedBatch) {
            toast.error('Please select a batch, subject, and date.');
            return;
        }
        setIsLoading(true);
        setReportData(null);
        try {
            const data = await api.getAttendanceReport(
                parseInt(selectedSubject),
                parseInt(selectedBatch),
                selectedDate,
                token
            );
            setReportData(data);
        } catch (error: any) {
            toast.error(`Failed to fetch report: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadReport = () => {
        if (!reportData) return;
        
        const csvContent = [
            ['Student ID', 'Full Name', 'Status'],
            ...reportData.attendedStudents.map(s => [s.studentId, s.fullName, 'Present']),
            ...reportData.absentStudents.map(s => [s.studentId, s.fullName, 'Absent'])
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-report-${selectedDate}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const attendanceRate = reportData ? 
        Math.round((reportData.attendedStudents.length / (reportData.attendedStudents.length + reportData.absentStudents.length)) * 100) : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-green-100 p-8 space-y-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="bg-white/70 backdrop-blur-md rounded-full p-4 shadow-lg">
                        <BarChart3 className="text-blue-600 animate-bounce" size={44} />
                    </div>
                    <h1 className="text-5xl font-bold text-gray-900 tracking-tight drop-shadow-sm">Attendance Reports</h1>
                </div>
            </div><br></br>

            {/* Filters */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-blue-100 p-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <Filter className="text-blue-600 animate-pulse" size={28} />
                    Report Filters
                </h2><br></br>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <label className="block text-base font-semibold text-gray-700 mb-2">Batch</label>
                        <select 
                            value={selectedBatch} 
                            onChange={e => setSelectedBatch(e.target.value)} 
                            className="w-full pr-4 py-4 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors text-lg shadow-sm bg-white/80"
                        >
                            <option value="">Select Batch</option>
                            {batches.map(b => (
                                <option key={b.id} value={b.id}>{b.year}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-base font-semibold text-gray-700 mb-2">Subject</label>
                        <select 
                            value={selectedSubject} 
                            onChange={e => setSelectedSubject(e.target.value)} 
                            className="w-full pr-4 py-4 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors text-lg shadow-sm bg-white/80"
                        >
                            <option value="">Select Subject</option>
                            {subjects.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-base font-semibold text-gray-700 mb-2">Date</label>
                        <input 
                            type="date" 
                            value={selectedDate} 
                            onChange={e => setSelectedDate(e.target.value)} 
                            className="w-full pr-4 py-4 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors text-lg shadow-sm bg-white/80" 
                        />
                    </div>
                    <div className="flex items-end">
                        <button 
                            onClick={handleFetchReport} 
                            disabled={isLoading || !selectedSubject || !selectedDate} 
                            className="w-full py-4 bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold rounded-xl hover:from-blue-600 hover:to-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 text-lg shadow-lg"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <BarChart3 size={24} />
                                    Generate Report
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {reportData && (
                <div className="space-y-10">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="bg-green-50/80 backdrop-blur-lg rounded-2xl shadow-xl border-l-4 border-green-300 p-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-500 font-semibold">Present</p>
                                    <p className="text-3xl font-bold text-green-700">
                                        {reportData.attendedStudents.length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-red-50/80 backdrop-blur-lg rounded-2xl shadow-xl border-l-4 border-red-300 p-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-red-500 font-semibold">Absent</p>
                                    <p className="text-3xl font-bold text-red-700">
                                        {reportData.absentStudents.length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-purple-50/80 backdrop-blur-lg rounded-2xl shadow-xl border-l-4 border-purple-300 p-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-500 font-semibold">Attendance Rate</p>
                                    <p className="text-3xl font-bold text-purple-700">
                                        {attendanceRate}%
                                    </p>
                                </div>
                                <TrendingUp className="text-purple-400" size={36} />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center mt-8">
                        <h2 className="text-3xl font-bold text-gray-900">Detailed Report</h2>
                        <button
                            onClick={handleDownloadReport}
                            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold rounded-xl hover:from-green-600 hover:to-blue-600 transition-all text-lg shadow-lg"
                        >
                            <Download size={22} />
                            Download CSV
                        </button>
                    </div>

                    {/* Student Lists */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-green-200 overflow-hidden">
                            <div className="bg-green-50/80 border-b border-green-200 p-8">
                                <h3 className="text-2xl font-bold text-green-900">Present Students ({reportData.attendedStudents.length})</h3>
                            </div>
                            <div className="p-8">
                                {reportData.attendedStudents.length > 0 ? (
                                    <div className="space-y-4 max-h-96 overflow-y-auto">
                                        {reportData.attendedStudents.map(s => (
                                            <div key={s.studentId} className="flex items-center justify-between p-4 bg-green-50/80 rounded-xl border border-green-200 shadow-sm">
                                                <div>
                                                    <div className="font-bold text-green-900 text-lg">{s.fullName}</div>
                                                    <div className="text-base text-green-600">{s.studentId}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-gray-500">
                                        <p className="text-lg">No students present</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-red-200 overflow-hidden">
                            <div className="bg-red-50/80 border-b border-red-200 p-8">
                                <h3 className="text-2xl font-bold text-red-900">Absent Students ({reportData.absentStudents.length})</h3>
                            </div>
                            <div className="p-8">
                                {reportData.absentStudents.length > 0 ? (
                                    <div className="space-y-4 max-h-96 overflow-y-auto">
                                        {reportData.absentStudents.map(s => (
                                            <div key={s.studentId} className="flex items-center justify-between p-4 bg-red-50/80 rounded-xl border border-red-200 shadow-sm">
                                                <div>
                                                    <div className="font-bold text-red-900 text-lg">{s.fullName}</div>
                                                    <div className="text-base text-red-600">{s.studentId}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-gray-500">
                                        <p className="text-lg">No students absent</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}