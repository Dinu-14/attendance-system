'use client'

import { useState } from 'react'
import Header from '@/app/component/Header'

export default function AttendancePage() {
  const [batch, setBatch] = useState('')
  const [indexNumber, setIndexNumber] = useState('')
  const [subject, setSubject] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const response = await fetch('http://localhost:8080/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        batch,
        indexNumber,
        subject
      })
    })

    if (response.ok) {
      alert('Attendance recorded and SMS sent!')
      setBatch('')
      setIndexNumber('')
      setSubject('')
    } else {
      alert('Error submitting attendance')
    }
  }

  return (
    <div>
          <Header />
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">Record Attendance</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Batch Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Batch</label>
            <select
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
            >
              <option value="">-- Select Batch --</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>
          
          {/* Subject Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
            >
              <option value="">-- Select Subject --</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Physics">Physics</option>
            </select>
          </div>

          {/* Index Number Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Index Number</label>
            <input
              type="text"
              value={indexNumber}
              onChange={(e) => setIndexNumber(e.target.value)}
              placeholder="e.g., 2000"
              required
              className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
            />
          </div>

          

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="w-32 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
  )
}
