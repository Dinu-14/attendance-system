'use client'
import { useRouter } from 'next/navigation'
import Header from '@/app/component/Header'
import React, { useRef, useState } from 'react'

export default function Dashboard() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0]
    if (!file) {
      setMessage('Please select a CSV file.')
      return
    }
    setUploading(true)
    setMessage('')
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('http://localhost:8080/api/students/upload-csv', {
        method: 'POST',
        body: formData,
      })
      const text = await res.text()
      setMessage(text)
    } catch (err) {
      setMessage('Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/w.jpg')" }}
    >
      <Header />
      <div className="flex items-center justify-center mt-10">
        <div className="bg-white bg-opacity-80 backdrop-blur-lg rounded-2xl p-10 shadow-xl w-full max-w-lg mx-4">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Welcome to Dashboard</h1>
          {/* CSV Uploader */}
          <div className="flex flex-col gap-2 mb-6">
            <label className="font-medium text-gray-700">Upload Student CSV</label>
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              className="border rounded px-3 py-2"
              disabled={uploading}
            />
            <button
              onClick={handleUpload}
              className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-medium mt-2 disabled:opacity-50"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload CSV'}
            </button>
            {message && <div className="text-sm mt-2 text-gray-800">{message}</div>}
          </div>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => router.push('/attendance')}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-lg font-medium shadow-md transition"
            >
              Attendance
            </button>
            <button
              onClick={() => router.push('/attendancedetails')}
              className="bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl text-lg font-medium shadow-md transition"
            >
              View Attendance Details
            </button>
            <button
              onClick={() => router.push('/common')}
              className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-lg font-medium shadow-md transition"
            >
              Common
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
