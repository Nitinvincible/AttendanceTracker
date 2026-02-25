import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as loginApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { Loader, LogIn, Building2, Mail, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Login() {
    const navigate = useNavigate();
    const { loginUser } = useAuth();
    const [form, setForm] = useState({ email: '', password: '', company_name: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password || !form.company_name) {
            toast.error('Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            const res = await loginApi(form);
            loginUser(res.data.access_token, res.data.user);
            toast.success(`Welcome back, ${res.data.user.name}!`);
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-root">
            <div className="blob blob-1" />
            <div className="blob blob-2" />
            <div className="blob blob-3" />

            <div className="auth-container">
                <div className="auth-header">
                    <div className="selector-logo">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <rect width="32" height="32" rx="10" fill="url(#lg)" />
                            <path d="M8 16h16M16 8v16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                            <defs>
                                <linearGradient id="lg" x1="0" y1="0" x2="32" y2="32">
                                    <stop stopColor="#6366f1" />
                                    <stop offset="1" stopColor="#8b5cf6" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <span>AttendTrack</span>
                    </div>
                </div>

                <h1 className="auth-title">Welcome Back</h1>
                <p className="auth-subtitle">Sign in to your account</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-field">
                        <label><Building2 size={14} /> Company Name</label>
                        <input
                            className="input"
                            placeholder="Enter your company name"
                            value={form.company_name}
                            onChange={e => setForm({ ...form, company_name: e.target.value })}
                        />
                    </div>
                    <div className="auth-field">
                        <label><Mail size={14} /> Email</label>
                        <input
                            className="input"
                            type="email"
                            placeholder="admin@company.com"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                        />
                    </div>
                    <div className="auth-field">
                        <label><Lock size={14} /> Password</label>
                        <input
                            className="input"
                            type="password"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
                        {loading ? <><Loader size={14} className="spin" /> Signing in...</> : <><LogIn size={14} /> Sign In</>}
                    </button>
                </form>

                <p className="auth-footer">
                    Don't have an account? <Link to="/signup" className="auth-link">Sign up as Admin</Link>
                </p>
            </div>
        </div>
    );
}
