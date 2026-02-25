import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

// --- Students ---
export const getStudents = () => api.get('/api/students/');
export const createStudent = (data) => api.post('/api/students/', data);
export const deleteStudent = (id) => api.delete(`/api/students/${id}`);

// --- Attendance ---
export const markAttendance = (data) => api.post('/api/attendance/', data);
export const getAttendanceByDate = (date) => api.get('/api/attendance/', { params: { date } });
export const getAttendanceHistory = () => api.get('/api/attendance/history');

// --- Dashboard ---
export const getDashboardStats = () => api.get('/api/dashboard/stats');
export const getWeeklyData = () => api.get('/api/dashboard/weekly');

export default api;
