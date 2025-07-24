'use client';

import { useState, useEffect } from 'react';
import * as api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function MessagingPage() {
    const [batches, setBatches] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);

    const [selectedBatch, setSelectedBatch] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [message, setMessage] = useState('');
    // File upload is not implemented in the backend, so this is just for UI demonstration
    const [file, setFile] = useState<File | null>(null);

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
                toast.error(`Failed to load data: ${error.message}`);
            }
        };
        fetchData();
    }, [token]);
    
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !selectedBatch || !selectedSubject || !message) {
            toast.error("Please select batch, subject, and enter a message.");
            return;
        }

        const toastId = toast.loading('Sending message...');
        try {
            const messageData = {
                batchId: parseInt(selectedBatch),
                subjectId: parseInt(selectedSubject),
                message,
            };
            const response = await api.sendMessage(messageData, token);
            toast.success(response, { id: toastId });
            // Clear form
            setMessage('');
            setFile(null);

        } catch (error: any) {
            toast.error(`Failed to send message: ${error.message}`, { id: toastId });
        }
    };
    
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Send Common Message</h1>
            <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
                <form onSubmit={handleSendMessage} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                             <label className="block text-sm font-medium">Batch</label>
                             <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} className="w-full mt-1 p-2 border rounded-md">
                                 <option value="">Select Batch</option>
                                 {batches.map(b => <option key={b.id} value={b.id}>{b.year}</option>)}
                             </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium">Subject</label>
                             <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full mt-1 p-2 border rounded-md">
                                 <option value="">Select Subject</option>
                                 {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                             </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Message</label>
                        <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            rows={6}
                            required
                            className="w-full mt-1 p-2 border rounded-md"
                            placeholder="Type your message to students..."
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium">Attach File (Optional)</label>
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                            className="w-full mt-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                         <p className="text-xs text-gray-500 mt-1">Note: File upload is for demonstration. Backend logic for attachments is not yet implemented.</p>
                    </div>

                    <button type="submit" className="w-full px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                        Send Message to Group
                    </button>
                </form>
            </div>
        </div>
    );
}