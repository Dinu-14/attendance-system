// This file centralizes all API calls to your Spring Boot backend.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Helper function to handle API responses
async function handleResponse(response: Response) {
    if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = 'An unknown error occurred';
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const error = await response.json().catch(() => ({ message: errorMessage }));
            errorMessage = error.error || error.message || errorMessage;
        } else {
            // Try to get plain text error
            errorMessage = await response.text();
        }
        throw new Error(errorMessage);
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    }
    return response.text();
}

// === PUBLIC ENDPOINTS ===
export const getPublicBatches = () => 
    fetch(`${API_BASE_URL}/api/attendance/public/batches`)
        .then(handleResponse)
        .catch(error => {
            console.error('Error fetching batches:', error);
            throw error;
        });

// === AUTH ===
export const login = (username: string, password: string): Promise<{ token: string }> => 
    fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    }).then(handleResponse);

// === ADMIN - BATCHES ===
export const getBatches = (token: string) => 
    fetch(`${API_BASE_URL}/api/admin/batches`, {
        headers: { 'Authorization': `Bearer ${token}` }
    }).then(handleResponse);

export const addBatch = (year: string, token: string) =>
    fetch(`${API_BASE_URL}/api/admin/batches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ year }),
    }).then(handleResponse);

// === ADMIN - SUBJECTS ===
export const getSubjects = (token: string) =>
    fetch(`${API_BASE_URL}/api/admin/subjects`, {
        headers: { 'Authorization': `Bearer ${token}` }
    }).then(handleResponse);

// === ADMIN - STUDENTS ===
interface StudentData {
    studentId: string;
    fullName: string;
    studentPhoneNumber: string;
    parentPhoneNumber: string;
    batchId: number;
    subjectIds: number[];
}
export const getStudents = (batchId?: number, subjectId?: number, token?: string) => {
    const params = new URLSearchParams();
    if (batchId) params.append('batchId', batchId.toString());
    if (subjectId) params.append('subjectId', subjectId.toString());
    
    const url = `${API_BASE_URL}/api/admin/students${params.toString() ? `?${params.toString()}` : ''}`;
    return fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
    }).then(handleResponse);
};

export const addStudent = (studentData: StudentData, token: string) =>
    fetch(`${API_BASE_URL}/api/admin/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(studentData),
    }).then(handleResponse);

export const importStudents = (file: File, token: string) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${API_BASE_URL}/api/admin/students/import`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
    }).then(handleResponse);
};
    
// === ADMIN - MESSAGING ===
interface MessageData {
    batchId: number;
    subjectId: number;
    message: string;
}
export const sendMessage = (messageData: MessageData, token: string) =>
    fetch(`${API_BASE_URL}/api/admin/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(messageData),
    }).then(handleResponse);

// === PUBLIC ATTENDANCE ===
export const markAttendance = (studentId: string, subjectId: number, batchId: number) =>
    fetch(`${API_BASE_URL}/api/attendance/mark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, subjectId, batchId }),
    }).then(handleResponse);

// === ADMIN - ATTENDANCE REPORTS ===
export const getAttendanceReport = (subjectId: number, batchId: number, date: string, token: string) => 
    fetch(`${API_BASE_URL}/api/attendance/report?subjectId=${subjectId}&batchId=${batchId}&date=${date}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    }).then(handleResponse);

// === ADMIN - DASHBOARD STATS ===
export const getDashboardStats = (token: string) =>
    fetch(`${API_BASE_URL}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
    }).then(handleResponse);