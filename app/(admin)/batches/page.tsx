'use client';

import { useState, useEffect } from 'react';
import * as api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

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
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Batches</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Batch</h2>
        <form onSubmit={handleAddBatch} className="flex gap-4">
          <input
            type="text"
            value={newBatchYear}
            onChange={(e) => setNewBatchYear(e.target.value)}
            placeholder="Enter batch year (e.g., 2028)"
            required
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500"
          />
          <button type="submit" className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Add Batch
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Existing Batches</h2>
        {isLoading ? (
          <p>Loading batches...</p>
        ) : (
          <ul className="space-y-2">
            {batches.map((batch) => (
              <li key={batch.id} className="p-3 bg-gray-50 rounded-md border">
                {batch.year}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}