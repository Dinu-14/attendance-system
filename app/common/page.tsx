'use client'

import { useState } from 'react'
import Header from '@/app/component/Header'
import ConfirmationOverlay from '@/app/component/confirmation'

export default function CommonMessagePage() {
  const [batch, setBatch] = useState('')
  const [message, setMessage] = useState('')
  const [showOverlay, setShowOverlay] = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await fetch('http://localhost:8080/api/common-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batch, message })
    })

    if (res.ok) {
      setShowOverlay(true) // show confirmation
    } else {
      alert('Failed to send message')
    }
  }

  return (
    <div>
      <Header />
      {showOverlay && (
        <ConfirmationOverlay
          message="Message sent successfully!"
          onClose={() => setShowOverlay(false)}
        />
      )}

      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">Send Common Message</h2>
          <form onSubmit={handleSend} className="space-y-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter message to send..."
                rows={4}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
              />
            </div>

            <button
              type="submit"
              className="w-32 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              aria-label="Send Message"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
