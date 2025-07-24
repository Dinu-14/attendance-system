'use client';
// This is a simplified version. A real-world component would have more robust forms, validation, and modals.
// This example focuses on fetching and displaying data, and the CSV import functionality.

import { useState, useEffect } from 'react';
import * as api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function StudentsPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);

    const [selectedBatch, setSelectedBatch] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const { token } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            try {
                const [batchesData, subjectsData] = await Promise.all([
                    api.getBatches(token),
                    api.getSubjects(token),
                ]);
                setBatches(batchesData);
                setSubjects(subjectsData);
            } catch (error: any) {
                toast.error(`Failed to load initial data: ${error.message}`);
            }
        };
        fetchData();
    }, [token]);

    const handleFetchStudents = async () => {
        if (!token || !selectedBatch || !selectedSubject) {
            toast.error('Please select both a batch and a subject.');
            return;
        }
        setIsLoading(true);
        try {
            const data = await api.getStudents(parseInt(selectedBatch), parseInt(selectedSubject), token);
            setStudents(data);
        } catch (error: any) {
            toast.error(`Failed to fetch students: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleImport = async () => {
        if (!file || !token) {
            toast.error('Please select a CSV file to import.');
            return;
        }
        const toastId = toast.loading('Importing students...');
        try {
            const response = await api.importStudents(file, token);
            toast.success(response, { id: toastId });
            setFile(null);
            // Optionally, refresh the student list
        } catch (error: any) {
            toast.error(`Import failed: ${error.message}`, { id: toastId });
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Manage Students</h1>
            
            <div className="bg-white p-6 rounded-lg shadow-md mb-8 space-y-4">
                <h2 className="text-xl font-semibold">View Students</h2>
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium">Batch</label>
                        <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} className="w-full mt-1 p-2 border rounded-md">
                            <option value="">Select Batch</option>
                            {batches.map(b => <option key={b.id} value={b.id}>{b.year}</option>)}
                        </select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium">Subject</label>
                        <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full mt-1 p-2 border rounded-md">
                            <option value="">Select Subject</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <button onClick={handleFetchStudents} className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
                        Show Students
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                 <h2 className="text-xl font-semibold mb-4">Import Students from CSV</h2>
                 <p className="text-sm text-gray-500 mb-2">CSV must have headers: studentId, fullName, studentPhoneNumber, parentPhoneNumber, batchId, subjectIds (comma-separated, e.g., "1,2")</p>
                 <div className="flex gap-4">
                    <input type="file" accept=".csv" onChange={handleFileChange} className="flex-grow p-2 border rounded-md"/>
                    <button onClick={handleImport} disabled={!file} className="px-4 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-300">
                        Import
                    </button>
                 </div>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4">Student List</h2>
                {isLoading ? <p>Loading...</p> : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg shadow">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="py-2 px-4 text-left">ID</th>
                                    <th className="py-2 px-4 text-left">Full Name</th>
                                    <th className="py-2 px-4 text-left">Phone</th>
                                    <th className="py-2 px-4 text-left">Parent Phone</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.length > 0 ? students.map(student => (
                                    <tr key={student.studentId} className="border-b">
                                        <td className="py-2 px-4">{student.studentId}</td>
                                        <td className="py-2 px-4">{student.fullName}</td>
                                        <td className="py-2 px-4">{student.studentPhoneNumber}</td>
                                        <td className="py-2 px-4">{student.parentPhoneNumber}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-4">No students to display. Select filters and click "Show Students".</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}