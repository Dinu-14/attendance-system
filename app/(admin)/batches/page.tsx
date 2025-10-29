'use client';

import { useState, useEffect } from 'react';
import * as api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Users, 
  GraduationCap,
  BookOpen,
  Edit3
} from 'lucide-react';

export default function BatchesPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [newBatchYear, setNewBatchYear] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  const fetchBatches = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await api.getBatches(token);
      setBatches(data);
    } catch (error: any) {
      toast.error(`Failed to fetch batches: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [token]);

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newBatchYear) return;

    const toastId = toast.loading('Adding batch...');
    try {
      await api.addBatch(newBatchYear, token);
      toast.success('Batch added successfully!', { id: toastId });
      setNewBatchYear('');
      fetchBatches(); // Refresh the list
    } catch (error: any) {
      toast.error(`Failed to add batch: ${error.message}`, { id: toastId });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-green-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10 flex items-center gap-4">
          <div className="bg-white/70 backdrop-blur-md rounded-full p-3 shadow-lg">
            <GraduationCap className="text-blue-600 animate-bounce" size={36} />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 tracking-tight drop-shadow-sm">Batch Management</h1>
        </div><br></br>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-7 shadow-xl flex items-center justify-between border-l-4 border-blue-300">
            <div>
              <p className="text-blue-500 font-semibold">Total Batches</p>
              <p className="text-3xl font-bold text-gray-900">{batches.length}</p>
            </div>
            <GraduationCap size={40} className="text-blue-400" />
          </div>
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-7 shadow-xl flex items-center justify-between border-l-4 border-green-300">
            <div>
              <p className="text-green-500 font-semibold">Active Years</p>
              <p className="text-3xl font-bold text-gray-900">{batches.length}</p>
            </div>
            <Calendar size={40} className="text-green-400" />
          </div>
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-7 shadow-xl flex items-center justify-between border-l-4 border-purple-300">
            <div>
              <p className="text-purple-500 font-semibold">Latest Batch</p>
              <p className="text-3xl font-bold text-gray-900">
                {batches.length > 0 ? Math.max(...batches.map(b => parseInt(b.year))) : 'N/A'}
              </p>
            </div>
            <BookOpen size={40} className="text-purple-400" />
          </div>
        </div><br></br>

        {/* Add New Batch */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-blue-100 p-8 mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Plus className="text-green-600 animate-pulse" size={28} />
            Add New Batch
          </h2>
          <form onSubmit={handleAddBatch} className="flex flex-col md:flex-row gap-4 items-center">
            <input
              type="text"
              value={newBatchYear}
              onChange={(e) => setNewBatchYear(e.target.value)}
              placeholder="Enter batch year (e.g., 2028)"
              required
              pattern="[0-9]{4}"
              className="flex-1 px-5 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-lg shadow-sm bg-white/80"
            />
            <button 
              type="submit" 
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold rounded-lg hover:from-blue-600 hover:to-green-600 transition-all flex items-center gap-2 text-lg shadow-md"
            >
              <Plus size={22} />
              Add Batch
            </button>
          </form>
        </div><br></br>

        {/* Existing Batches */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="text-blue-600 animate-spin-slow" size={28} />
              <h2 className="text-2xl font-bold text-gray-900">Existing Batches</h2>
            </div>
            <span className="text-sm text-gray-500">{batches.length} batch{batches.length !== 1 ? 'es' : ''} available</span>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <span className="ml-4 text-lg text-gray-600">Loading batches...</span>
            </div>
          ) : batches.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {batches.map((batch) => (
                <div key={batch.id} className="p-8 hover:bg-blue-50/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center shadow-md">
                        <GraduationCap className="text-blue-600" size={28} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Batch {batch.year}</h3>
                        <p className="text-sm text-gray-500">Academic Year {batch.year}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-base font-semibold text-green-600">Active</div>
                        <div className="text-xs text-gray-400">Status</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-blue-600 hover:text-white hover:bg-blue-500 rounded-lg transition-colors shadow">
                          <Edit3 size={18} />
                        </button>
                        <button className="p-2 text-red-600 hover:text-white hover:bg-red-500 rounded-lg transition-colors shadow">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <GraduationCap size={56} className="mx-auto text-gray-300 mb-4 animate-bounce" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No batches found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first batch</p>
              <button 
                onClick={() => (document.querySelector('input[placeholder*="batch year"]') as HTMLInputElement | null)?.focus()}
                className="inline-flex items-center px-6 py-3 border border-blue-300 shadow-md text-lg font-semibold rounded-lg text-blue-700 bg-white hover:bg-blue-50 gap-2"
              >
                <Plus size={20} className="mr-2" />
                Add Your First Batch
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}