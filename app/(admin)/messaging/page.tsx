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
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <MessageSquare className="text-blue-600" />
                        Common Messaging
                    </h1>
                    <p className="text-gray-600">Send messages to students by batch and subject</p>
                </div><br></br>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Message Composer */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <Send className="text-green-600" size={20} />
                                Compose Message
                            </h2>
                            <br></br>
                            <form onSubmit={handleSendMessage} className="space-y-6">
                                {/* Target Selection */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h3 className="text-sm font-medium text-blue-900 mb-3">Select Target Audience</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Batch *
                                            </label>
                                            <select 
                                                value={selectedBatch} 
                                                onChange={e => setSelectedBatch(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            >
                                                <option value="">Select Batch</option>
                                                {batches.map(b => (
                                                    <option key={b.id} value={b.id}>Batch {b.year}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Subject *
                                            </label>
                                            <select 
                                                value={selectedSubject} 
                                                onChange={e => setSelectedSubject(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                        <div className="mt-3 flex items-center gap-2 text-sm text-blue-700">
                                            <Users size={16} />
                                            Target: {getTargetAudience()}
                                        </div>
                                    )}
                                </div><br></br>

                                {/* Message Content */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Message Content *
                                    </label>
                                    <textarea
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                        rows={6}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        placeholder="Type your message here..."
                                    />
                                    <div className="flex justify-between mt-2">
                                        <p className="text-xs text-gray-500">Be clear and concise in your message</p>
                                        <p className="text-xs text-gray-500">{message.length} characters</p>
                                    </div>
                                </div>
                                
                                {/* Send Button */}
                                <div className="flex justify-end pt-4 border-t border-gray-200">
                                    <button
                                        type="submit"
                                        disabled={isLoading || !selectedBatch || !selectedSubject || !message.trim()}
                                        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Message History & Info */}
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="text-blue-600" size={16} />
                                        <span className="text-sm text-blue-900">Batches</span>
                                    </div>
                                    <span className="text-lg font-bold text-blue-600">{batches.length}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="text-green-600" size={16} />
                                        <span className="text-sm text-green-900">Subjects</span>
                                    </div>
                                    <span className="text-lg font-bold text-green-600">{subjects.length}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="text-purple-600" size={16} />
                                        <span className="text-sm text-purple-900">Messages Sent</span>
                                    </div>
                                    <span className="text-lg font-bold text-purple-600">{messageHistory.length}</span>
                                </div>
                            </div>
                        </div>

                        {/* Message History */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Clock className="text-gray-600" size={18} />
                                Recent Messages
                            </h3>
                            {messageHistory.length > 0 ? (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {messageHistory.slice(0, 5).map((msg) => (
                                        <div key={msg.id} className="p-3 border border-gray-200 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-medium text-gray-600">
                                                    Batch {msg.batchName} • {msg.subjectName}
                                                </span>
                                                <div className="flex items-center gap-1 text-xs text-green-600">
                                                    <Check size={12} />
                                                    Sent
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-700 line-clamp-2">{msg.message}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {msg.timestamp.toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No messages sent yet</p>
                                </div>
                            )}
                        </div>

                        {/* Message Tips */}
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                            <h3 className="text-lg font-semibold mb-3">💡 Messaging Tips</h3>
                            <ul className="space-y-2 text-sm text-blue-100">
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