"use client";

import { useState } from "react";
import Header from "@/app/component/Header";

export default function AttendancePage() {
  const [batch, setBatch] = useState("");
  const [subject, setSubject] = useState("");
  const [indexNumber, setIndexNumber] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (batch && subject) {
      setConfirmed(true);
    } else {
      alert("Please select both Batch and Subject before confirming.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batch, subject, indexNumber }),
      });

      let result = await response.text();
      if (!result) {
        result = response.statusText || "Unknown error";
      }

      if (response.ok) {
        alert(result);
        setIndexNumber("");
      } else {
        console.error("Error submitting attendance:", response.status, result);
        alert("Error submitting attendance: " + result);
      }
    } catch (error) {
      console.error("Network or server error:", error);
      alert("Network or server error: " + error);
    }
  };

  const handleReset = () => {
    setBatch("");
    setSubject("");
    setIndexNumber("");
    setConfirmed(false);
  };

  return (
    <div>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">
            Record Attendance
          </h2>

          {/* Badge for Current Batch & Subject */}
          {confirmed && (
            <div className="mb-6 text-center">
              <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-3 py-1 rounded-full">
                Batch: {batch}
              </span>
              <span className="inline-block bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                Subject: {subject}
              </span>
            </div>
          )}

          {/* Batch Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Select Batch
            </label>
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
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Select Subject
            </label>
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

          {/* Confirm + Reset Buttons */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={handleConfirm}
              className="w-28 bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Confirm
            </button>
            <button
              onClick={handleReset}
              className="w-28 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
            >
              Reset
            </button>
          </div>

          {/* Index Number Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Index Number
              </label>
              <input
                type="text"
                value={indexNumber}
                onChange={(e) => setIndexNumber(e.target.value)}
                placeholder="e.g., 2000"
                required
                disabled={!confirmed}
                className={`w-full border ${
                  confirmed
                    ? "border-gray-300"
                    : "border-gray-400 bg-gray-200 cursor-not-allowed"
                } rounded px-3 py-2 mt-1`}
              />
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={!confirmed}
                className={`w-32 ${
                  confirmed
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 cursor-not-allowed"
                } text-white py-2 rounded`}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
