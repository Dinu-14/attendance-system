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
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <BarChart3 className="text-blue-600" size={40} />
                        Attendance Reports
                    </h1>
                    <p className="text-gray-600 text-lg">Generate detailed attendance reports for any subject and date</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Filter className="text-blue-600" size={24} />
                    Report Filters
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Batch
                        </label>
                        <div className="relative">
                            <Users className="absolute left-3 top-3 text-gray-400" size={20} />
                            <select 
                                value={selectedBatch} 
                                onChange={e => setSelectedBatch(e.target.value)} 
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                <option value="">Select Batch</option>
                                {batches.map(b => (
                                    <option key={b.id} value={b.id}>{b.year}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subject
                        </label>
                        <div className="relative">
                            <BookOpen className="absolute left-3 top-3 text-gray-400" size={20} />
                            <select 
                                value={selectedSubject} 
                                onChange={e => setSelectedSubject(e.target.value)} 
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                <option value="">Select Subject</option>
                                {subjects.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input 
                                type="date" 
                                value={selectedDate} 
                                onChange={e => setSelectedDate(e.target.value)} 
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                            />
                        </div>
                    </div>
                    <div className="flex items-end">
                        <button 
                            onClick={handleFetchReport} 
                            disabled={isLoading || !selectedSubject || !selectedDate} 
                            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <BarChart3 size={20} />
                                    Generate Report
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            
            {reportData && (
                <div className="space-y-6">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {reportData.attendedStudents.length + reportData.absentStudents.length}
                                    </p>
                                </div>
                                <Users className="text-blue-600" size={32} />
                            </div>
                        </div>
                        
                        <div className="bg-green-50 border-green-200 border rounded-xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-600">Present</p>
                                    <p className="text-3xl font-bold text-green-700">
                                        {reportData.attendedStudents.length}
                                    </p>
                                </div>
                                <UserCheck className="text-green-600" size={32} />
                            </div>
                        </div>
                        
                        <div className="bg-red-50 border-red-200 border rounded-xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-red-600">Absent</p>
                                    <p className="text-3xl font-bold text-red-700">
                                        {reportData.absentStudents.length}
                                    </p>
                                </div>
                                <UserX className="text-red-600" size={32} />
                            </div>
                        </div>
                        
                        <div className="bg-purple-50 border-purple-200 border rounded-xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-purple-600">Attendance Rate</p>
                                    <p className="text-3xl font-bold text-purple-700">
                                        {attendanceRate}%
                                    </p>
                                </div>
                                <TrendingUp className="text-purple-600" size={32} />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-900">Detailed Report</h2>
                        <button
                            onClick={handleDownloadReport}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                        >
                            <Download size={16} />
                            Download CSV
                        </button>
                    </div>

                    {/* Student Lists */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                            <div className="bg-green-50 border-b border-green-200 p-6">
                                <h3 className="text-xl font-semibold text-green-900 flex items-center gap-2">
                                    <CheckCircle className="text-green-600" size={24} />
                                    Present Students ({reportData.attendedStudents.length})
                                </h3>
                            </div>
                            <div className="p-6">
                                {reportData.attendedStudents.length > 0 ? (
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {reportData.attendedStudents.map(s => (
                                            <div key={s.studentId} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                                <div>
                                                    <div className="font-medium text-green-900">{s.fullName}</div>
                                                    <div className="text-sm text-green-600">{s.studentId}</div>
                                                </div>
                                                <CheckCircle className="text-green-600" size={20} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <UserCheck size={48} className="mx-auto mb-4 opacity-50" />
                                        <p>No students present</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                            <div className="bg-red-50 border-b border-red-200 p-6">
                                <h3 className="text-xl font-semibold text-red-900 flex items-center gap-2">
                                    <XCircle className="text-red-600" size={24} />
                                    Absent Students ({reportData.absentStudents.length})
                                </h3>
                            </div>
                            <div className="p-6">
                                {reportData.absentStudents.length > 0 ? (
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {reportData.absentStudents.map(s => (
                                            <div key={s.studentId} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                                                <div>
                                                    <div className="font-medium text-red-900">{s.fullName}</div>
                                                    <div className="text-sm text-red-600">{s.studentId}</div>
                                                </div>
                                                <XCircle className="text-red-600" size={20} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <UserX size={48} className="mx-auto mb-4 opacity-50" />
                                        <p>No students absent</p>
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