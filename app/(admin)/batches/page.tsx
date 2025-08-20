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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <GraduationCap className="text-blue-600" />
            Batch Management
          </h1>
        </div>

        {/* Add New Batch */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Plus className="text-green-600" size={20} />
            Add New Batch
          </h2>
          <br></br>
          <form onSubmit={handleAddBatch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                
                <input
                  type="text"
                  value={newBatchYear}
                  onChange={(e) => setNewBatchYear(e.target.value)}
                  placeholder="Enter batch year (e.g., 2028)"
                  required
                  pattern="[0-9]{4}"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <br></br>
              </div>
              <div className="flex items-end">
                <button 
                  type="submit" 
                  className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Add Batch
                </button>
              </div>
            </div>
          </form>
        </div><br></br>

        {/* Existing Batches */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="text-blue-600" size={20} />
              Existing Batches
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {batches.length} batch{batches.length !== 1 ? 'es' : ''} available
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading batches...</span>
            </div>
          ) : batches.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {batches.map((batch) => (
                <div key={batch.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <GraduationCap className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Batch {batch.year}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Academic Year {batch.year}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {/* Stats could be added here in the future */}
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-900">Active</div>
                        <div className="text-xs text-gray-500">Status</div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit3 size={16} />
                        </button>
                        <button className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <GraduationCap size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No batches found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first batch</p>
              <button 
                onClick={() => document.querySelector('input[placeholder*="batch year"]')?.focus()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Plus size={16} className="mr-2" />
                Add Your First Batch
              </button>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Batches</p>
                <p className="text-2xl font-bold">{batches.length}</p>
              </div>
              <GraduationCap size={32} className="text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Active Years</p>
                <p className="text-2xl font-bold">{batches.length}</p>
              </div>
              <Calendar size={32} className="text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Latest Batch</p>
                <p className="text-2xl font-bold">
                  {batches.length > 0 ? Math.max(...batches.map(b => parseInt(b.year))) : 'N/A'}
                </p>
              </div>
              <BookOpen size={32} className="text-purple-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}