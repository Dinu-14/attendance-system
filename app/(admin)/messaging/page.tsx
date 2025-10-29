'use client';

import { useState, useEffect } from 'react';
import * as api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Users, 
  BookOpen,
  Calendar,
  X,
  FileText,
  Image,
  Download,
  Check,
  Clock
} from 'lucide-react';

export default function MessagingPage() {
    const [batches, setBatches] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [message, setMessage] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [messageHistory, setMessageHistory] = useState<any[]>([]);

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
        if (!token || !selectedBatch || !selectedSubject || !message.trim()) {
            toast.error("Please select batch, subject, and enter a message.");
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading('Sending message...');
        try {
            const messageData = {
                batchId: parseInt(selectedBatch),
                subjectId: parseInt(selectedSubject),
                message: message.trim(),
            };
            const response = await api.sendMessage(messageData, token);
            toast.success(response, { id: toastId });
            
            // Add to message history (mock)
            const newMessage = {
                id: Date.now(),
                ...messageData,
                batchName: batches.find(b => b.id === parseInt(selectedBatch))?.year,
                subjectName: subjects.find(s => s.id === parseInt(selectedSubject))?.name,
                timestamp: new Date(),
                status: 'sent'
            };
            setMessageHistory(prev => [newMessage, ...prev]);
            
            // Clear form
            setMessage('');
            setFile(null);
            setSelectedBatch('');
            setSelectedSubject('');

        } catch (error: any) {
            toast.error(`Failed to send message: ${error.message}`, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    const removeFile = () => setFile(null);
    
    const getTargetAudience = () => {
        if (!selectedBatch || !selectedSubject) return '';
        const batch = batches.find(b => b.id === parseInt(selectedBatch));
        const subject = subjects.find(s => s.id === parseInt(selectedSubject));
        return `${batch?.year} batch - ${subject?.name} students`;
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-10 flex items-center gap-5">
                    <div className="bg-white/70 backdrop-blur-md rounded-full p-4 shadow-lg">
                        <MessageSquare className="text-blue-600 animate-bounce" size={40} />
                    </div>
                    <div>
                        <h1 className="text-5xl font-bold text-gray-900 tracking-tight drop-shadow-sm">Common Messaging</h1><br></br>
                        <p className="text-gray-600 text-lg mt-2">Send messages to students by batch and subject</p>
                    </div>
                </div><br></br>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Message Composer */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-blue-100 p-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                                <Send className="text-green-600 animate-pulse" size={24} />
                                Compose Message
                            </h2><br></br>
                            <form onSubmit={handleSendMessage} className="space-y-8">
                                {/* Target Selection */}
                                <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-6">
                                    <h3 className="text-base font-semibold text-blue-900 mb-4">Select Target Audience</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-base font-semibold text-gray-700 mb-2">Batch *</label>
                                            <select 
                                                value={selectedBatch} 
                                                onChange={e => setSelectedBatch(e.target.value)}
                                                className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-lg shadow-sm bg-white/80"
                                                required
                                            >
                                                <option value="">Select Batch</option>
                                                {batches.map(b => (
                                                    <option key={b.id} value={b.id}>Batch {b.year}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-base font-semibold text-gray-700 mb-2">Subject *</label>
                                            <select 
                                                value={selectedSubject} 
                                                onChange={e => setSelectedSubject(e.target.value)}
                                                className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-lg shadow-sm bg-white/80"
                                                required
                                            >
                                                <option value="">Select Subject</option>
                                                {subjects.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    {getTargetAudience() && (
                                        <div className="mt-4 text-blue-700 text-base font-medium">
                                            Target: {getTargetAudience()}
                                        </div>
                                    )}
                                </div>

                                {/* Message Content */}
                                <div>
                                    <label className="block text-base font-semibold text-gray-700 mb-2">Message Content *</label>
                                    <textarea
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                        rows={6}
                                        required
                                        className="w-full px-5 py-4 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-lg shadow-sm bg-white/80 resize-none"
                                        placeholder="Type your message here..."
                                    />
                                    <div className="flex justify-between mt-2">
                                        <p className="text-xs text-gray-500">Be clear and concise in your message</p>
                                        <p className="text-xs text-gray-500">{message.length} characters</p>
                                    </div>
                                </div>

                                {/* Send Button */}
                                <div className="flex justify-end pt-6 border-t border-blue-100">
                                    <button
                                        type="submit"
                                        disabled={isLoading || !selectedBatch || !selectedSubject || !message.trim()}
                                        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold rounded-xl hover:from-blue-600 hover:to-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center gap-3 text-lg shadow-lg"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={20} />
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Message History & Info */}
                    <div className="space-y-8">
                        {/* Quick Stats */}
                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border-l-4 border-blue-300 p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Stats</h3>
                            <div className="space-y-5">
                                <div className="flex items-center justify-between p-4 bg-blue-50/80 rounded-xl">
                                    <span className="text-base font-semibold text-blue-900">Batches</span>
                                    <span className="text-2xl font-bold text-blue-600">{batches.length}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-green-50/80 rounded-xl">
                                    <span className="text-base font-semibold text-green-900">Subjects</span>
                                    <span className="text-2xl font-bold text-green-600">{subjects.length}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-purple-50/80 rounded-xl">
                                    <span className="text-base font-semibold text-purple-900">Messages Sent</span>
                                    <span className="text-2xl font-bold text-purple-600">{messageHistory.length}</span>
                                </div>
                            </div>
                        </div>

                        {/* Message History */}
                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border-l-4 border-green-300 p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Messages</h3>
                            {messageHistory.length > 0 ? (
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {messageHistory.slice(0, 5).map((msg) => (
                                        <div key={msg.id} className="p-4 border border-green-100 rounded-xl bg-green-50/80">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-semibold text-gray-700">
                                                    Batch {msg.batchName} • {msg.subjectName}
                                                </span>
                                                <span className="text-xs font-bold text-green-600">Sent</span>
                                            </div>
                                            <p className="text-base text-gray-800 line-clamp-2">{msg.message}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {msg.timestamp.toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-gray-500">
                                    <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-base">No messages sent yet</p>
                                </div>
                            )}
                        </div>

                        {/* Message Tips */}
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
                            <h3 className="text-xl font-bold mb-4">💡 Messaging Tips</h3>
                            <ul className="space-y-3 text-base text-blue-100">
                                <li>• Keep messages clear and concise</li>
                                <li>• Include important dates and times</li>
                                <li>• Use professional language</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}