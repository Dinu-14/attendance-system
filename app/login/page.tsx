'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import * as api from '../lib/api';
import toast from 'react-hot-toast';
import Image from 'next/image'; // Make sure to import the Image component

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setToken, token: authToken } = useAuth();
  const router = useRouter();

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (authToken) {
      router.replace('/dashboard');
    }
  }, [authToken, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
        toast.error("Please enter both username and password.");
        return;
    }
    setIsLoading(true);
    const toastId = toast.loading('Logging in...');

    try {
      const response = await api.login(username, password);
      setToken(response.token);
      toast.dismiss(toastId);
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(`Login failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Main container for the full-screen black background and centering
    <main className="flex min-h-screen items-center justify-center bg-black p-4">
      
      {/* The floating white card */}
      <div className="w-60 max-w-sm rounded-2xl bg-white p-8 shadow-2xl space-y-8">
        
        {/* Logo */}
        <div className="flex justify-center">
            <Image 
                src="/logo.png" 
                alt="Universal Science Academy Logo"
                width={150}
                height={150}
                priority // Helps load the logo faster
            />
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Authenticating...' : 'Login'}
          </button>
        </form>
      </div>
    </main>
  );
}