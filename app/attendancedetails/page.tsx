"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import Header from "@/app/component/Header";

interface Student {
  indexNumber: string;
  name: string;
  phoneNo: string;
  batch: string;
  chemistryTaken: boolean;
  physicsTaken: boolean;
}

interface Attendance {
  id: number;
  batch: string;
  indexNumber: string;
  subject: string;
  recordedAt: string;
}

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [present, setPresent] = useState<{ [index: string]: boolean }>({});
  const [batch, setBatch] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [attendance, setAttendance] = useState<Attendance[]>([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/students")
      .then((res) => res.json())
      .then((data) => {
        setStudents(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch students");
        setLoading(false);
      });
  }, []);

  const markPresent = async (student: Student) => {
    // You can adjust this to call your attendance API if needed
    const batch = student.batch;
    const subject = student.chemistryTaken
      ? "Chemistry"
      : student.physicsTaken
      ? "Physics"
      : "";
    if (!subject) return;
    const response = await fetch("http://localhost:8080/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        batch,
        subject,
        indexNumber: student.indexNumber,
      }),
    });
    if (response.ok) {
      setPresent((prev) => ({ ...prev, [student.indexNumber]: true }));
    } else {
      alert("Failed to mark present");
    }
  };

  const fetchAttendance = async () => {
    if (!batch || !subject || !date) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `http://localhost:8080/api/attendance/records?batch=${batch}&subject=${subject}&date=${date}`
      );
      if (!res.ok) throw new Error("Failed to fetch attendance");
      const data = await res.json();
      setAttendance(data);
    } catch (err) {
      setError("Failed to fetch attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl">
          <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">
            Attendance Records
          </h2>
          <div className="flex gap-4 mb-6 justify-center">
            <select
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">Select Batch</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">Select Subject</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Physics">Physics</option>
            </select>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded px-3 py-2"
            />
            <button
              onClick={fetchAttendance}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Show Attendance
            </button>
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : attendance.length > 0 ? (
            <table className="min-w-full border text-center">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Index Number</th>
                  <th className="border px-4 py-2">Batch</th>
                  <th className="border px-4 py-2">Subject</th>
                  <th className="border px-4 py-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((a) => (
                  <tr key={a.id}>
                    <td className="border px-4 py-2">{a.indexNumber}</td>
                    <td className="border px-4 py-2">{a.batch}</td>
                    <td className="border px-4 py-2">{a.subject}</td>
                    <td className="border px-4 py-2">
                      {format(new Date(a.recordedAt), "hh:mm a")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-gray-500">No attendance records found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
