'use client';

import { useState, useEffect } from 'react';
import * as api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  UserPlus, 
  Upload, 
  Search, 
  Users, 
  Phone, 
  Mail, 
  Edit3, 
  Trash2,
  X,
  FileText,
  Download
} from 'lucide-react';

export default function StudentsPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);

    const [selectedBatch, setSelectedBatch] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [activeTab, setActiveTab] = useState('view');
    
    // Form state for adding students
    const [newStudent, setNewStudent] = useState({
        studentId: '',
        fullName: '',
        studentPhoneNumber: '',
        parentPhoneNumber: '',
        batchId: '',
        subjectIds: [] as number[]
    });

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
                
                // Also fetch all students on initial load
                try {
                    const allStudents = await api.getStudents(undefined, undefined, token);
                    setStudents(allStudents);
                } catch (error: any) {
                    console.log('Could not fetch all students initially:', error.message);
                }
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

    const handleFetchAllStudents = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const data = await api.getStudents(undefined, undefined, token);
            setStudents(data);
            // Clear filters
            setSelectedBatch('');
            setSelectedSubject('');
        } catch (error: any) {
            toast.error(`Failed to fetch all students: ${error.message}`);
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
            // Refresh the student list - show all students after import
            await handleFetchAllStudents();
        } catch (error: any) {
            toast.error(`Import failed: ${error.message}`, { id: toastId });
        }
    };

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        
        const toastId = toast.loading('Adding student...');
        try {
            await api.addStudent({
                ...newStudent,
                batchId: parseInt(newStudent.batchId)
            }, token);
            
            toast.success('Student added successfully!', { id: toastId });
            
            // Reset form
            setNewStudent({
                studentId: '',
                fullName: '',
                studentPhoneNumber: '',
                parentPhoneNumber: '',
                batchId: '',
                subjectIds: []
            });
            
            setShowAddForm(false);
            
            // Refresh student list if filters are selected
            if (selectedBatch && selectedSubject) {
                handleFetchStudents();
            }
        } catch (error: any) {
            toast.error(`Failed to add student: ${error.message}`, { id: toastId });
        }
    };

    const handleSubjectToggle = (subjectId: number) => {
        setNewStudent(prev => ({
            ...prev,
            subjectIds: prev.subjectIds.includes(subjectId)
                ? prev.subjectIds.filter(id => id !== subjectId)
                : [...prev.subjectIds, subjectId]
        }));
    };

    const downloadSampleCSV = () => {
        const csvContent = `studentId,fullName,studentPhoneNumber,parentPhoneNumber,batchId,subjectIds
ST001,John Doe,1234567890,0987654321,1,"1,2"
ST002,Jane Smith,1234567891,0987654322,1,"1"
ST003,Bob Wilson,1234567892,0987654323,2,"2"`;
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sample_students.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <Users className="text-blue-600" />
                        Student Management
                    </h1>
                    <p className="text-gray-600">Add, view, and manage students in your institute</p>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('view')}
                            className={`px-6 py-4 font-medium text-sm flex items-center gap-5 ${
                                activeTab === 'view'
                                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Search size={18} />
                            View Students
                        </button>
                        <button
                            onClick={() => setActiveTab('add')}
                            className={`px-6 py-4 font-medium text-sm flex items-center gap-5 ${
                                activeTab === 'add'
                                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <UserPlus size={18} />
                            Add Student
                        </button>
                        <button
                            onClick={() => setActiveTab('import')}
                            className={`px-6 py-4 font-medium text-sm flex items-center gap-5 ${
                                activeTab === 'import'
                                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Upload size={18} />
                            Import CSV
                        </button>
                    </div>
                </div><br></br>

                {/* Tab Content */}
                {activeTab === 'view' && (
                    <div className="space-y-6">
                        {/* Filter Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Search className="text-blue-600" size={20} />
                                Filter Students
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Batch
                                    </label>
                                    <select 
                                        value={selectedBatch} 
                                        onChange={e => setSelectedBatch(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    >
                                        <option value="">Choose a batch...</option>
                                        {batches.map(b => (
                                            <option key={b.id} value={b.id}>Batch {b.year}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Subject
                                    </label>
                                    <select 
                                        value={selectedSubject} 
                                        onChange={e => setSelectedSubject(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    >
                                        <option value="">Choose a subject...</option>
                                        {subjects.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-end gap-2">
                                    <button 
                                        onClick={handleFetchStudents}
                                        disabled={!selectedBatch || !selectedSubject}
                                        className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Search size={18} />
                                        Filter Students
                                    </button>
                                    <button 
                                        onClick={handleFetchAllStudents}
                                        className="flex-1 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Users size={18} />
                                        Show All
                                    </button>
                                </div>
                            </div>
                        </div><br></br>

                        {/* Students Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Student List</h3>
                                <p className="text-sm text-gray-600">
                                    {students.length} student{students.length !== 1 ? 's' : ''} found
                                </p>
                            </div>
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <span className="ml-3 text-gray-600">Loading students...</span>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Student ID
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Full Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Student Phone
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Parent Phone
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Batch
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {students.length > 0 ? students.map(student => (
                                                <tr key={student.studentId} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{student.studentId}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{student.fullName}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900 flex items-center gap-2">
                                                            <Phone size={14} className="text-gray-400" />
                                                            {student.studentPhoneNumber}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900 flex items-center gap-2">
                                                            <Phone size={14} className="text-gray-400" />
                                                            {student.parentPhoneNumber}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {student.batch?.year}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <button className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50">
                                                                <Edit3 size={16} />
                                                            </button>
                                                            <button className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-12 text-center">
                                                        <div className="text-gray-400">
                                                            <Users size={48} className="mx-auto mb-4 opacity-50" />
                                                            <p className="text-lg font-medium">No students found</p>
                                                            <p className="text-sm">Select a batch and subject to view students</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'add' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <UserPlus className="text-blue-600" size={20} />
                            Add New Student
                        </h2>
                        
                        <form onSubmit={handleAddStudent} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Student ID *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newStudent.studentId}
                                        onChange={(e) => setNewStudent({...newStudent, studentId: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="e.g., ST001"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newStudent.fullName}
                                        onChange={(e) => setNewStudent({...newStudent, fullName: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Enter full name"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Student Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={newStudent.studentPhoneNumber}
                                        onChange={(e) => setNewStudent({...newStudent, studentPhoneNumber: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="1234567890"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Parent Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={newStudent.parentPhoneNumber}
                                        onChange={(e) => setNewStudent({...newStudent, parentPhoneNumber: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="0987654321"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Batch *
                                    </label>
                                    <select
                                        required
                                        value={newStudent.batchId}
                                        onChange={(e) => setNewStudent({...newStudent, batchId: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    >
                                        <option value="">Select Batch</option>
                                        {batches.map(batch => (
                                            <option key={batch.id} value={batch.id}>Batch {batch.year}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subjects *
                                    </label>
                                    <div className="space-y-2">
                                        {subjects.map(subject => (
                                            <label key={subject.id} className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={newStudent.subjectIds.includes(subject.id)}
                                                    onChange={() => handleSubjectToggle(subject.id)}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <span className="text-sm text-gray-700">{subject.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setNewStudent({
                                        studentId: '',
                                        fullName: '',
                                        studentPhoneNumber: '',
                                        parentPhoneNumber: '',
                                        batchId: '',
                                        subjectIds: []
                                    })}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Reset Form
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <UserPlus size={18} />
                                    Add Student
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === 'import' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <Upload className="text-blue-600" size={20} />
                            Import Students from CSV
                        </h2><br></br>
                        
                        <div className="space-y-6">
                            {/* Instructions */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="text-sm font-medium text-blue-900 mb-2">CSV Format Instructions</h3>
                                <p className="text-sm text-blue-700 mb-3">
                                    Your CSV file must contain the following columns in this exact order:
                                </p>
                                <div className="text-xs font-mono bg-white border border-blue-200 rounded p-2 text-blue-800">
                                    studentId, fullName, studentPhoneNumber, parentPhoneNumber, batchId, subjectIds
                                </div>
                                <p className="text-xs text-blue-600 mt-2">
                                    Note: subjectIds should be comma-separated numbers in quotes, e.g., "1,2"
                                </p>
                            </div><br></br>

                            
                            {/* File Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select CSV File
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                </div><br></br>
                                {file && (
                                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                        <FileText size={16} />
                                        Selected: {file.name}
                                    </div>
                                )}
                            </div><br></br>

                            {/* Import Button */}
                            <div className="flex justify-end">
                                <button
                                    onClick={handleImport}
                                    disabled={!file}
                                    className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    <Upload size={18} />
                                    Import Students
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}