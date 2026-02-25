import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

// JWT interceptor — attach token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('att_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auto-logout on 401
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('att_token');
            localStorage.removeItem('att_user');
            // Don't redirect if already on auth pages
            if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/signup')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(err);
    }
);

// --- Auth ---
export const signup = (data) => api.post('/api/auth/signup', data);
export const login = (data) => api.post('/api/auth/login', data);
export const getMe = () => api.get('/api/auth/me');

// --- Students ---
export const getStudents = () => api.get('/api/students/');
export const createStudent = (data) => api.post('/api/students/', data);
export const updateStudent = (id, data) => api.put(`/api/students/${id}`, data);
export const deleteStudent = (id) => api.delete(`/api/students/${id}`);

// --- Attendance ---
export const markAttendance = (data) => api.post('/api/attendance/', data);
export const getAttendanceByDate = (date) => api.get('/api/attendance/', { params: { date } });
export const getAttendanceHistory = () => api.get('/api/attendance/history');

// --- Dashboard ---
export const getDashboardStats = () => api.get('/api/dashboard/stats');
export const getWeeklyData = () => api.get('/api/dashboard/weekly');

// --- Departments ---
export const getDepartments = () => api.get('/api/departments/');
export const createDepartment = (data) => api.post('/api/departments/', data);
export const updateDepartment = (id, data) => api.put(`/api/departments/${id}`, data);
export const deleteDepartment = (id) => api.delete(`/api/departments/${id}`);

// --- Settings ---
export const getSettings = () => api.get('/api/settings/');
export const updateSettings = (data) => api.put('/api/settings/', data);

// --- Employees ---
export const getEmployees = () => api.get('/api/employees/');
export const createEmployee = (data) => api.post('/api/employees/', data);
export const deleteEmployee = (id) => api.delete(`/api/employees/${id}`);

export default api;
