import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup as signupApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { THEMES } from '../context/ThemeContext';
import { Loader, UserPlus, Building2, Mail, Lock, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Signup() {
    const navigate = useNavigate();
    const { loginUser } = useAuth();
    const [form, setForm] = useState({ name: '', email: '', password: '', company_name: '', theme_id: 'corporate' });
    const [loading, setLoading] = useState(false);

    const themes = Object.values(THEMES);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.password || !form.company_name) {
            toast.error('Please fill in all fields');
            return;
        }
        if (form.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            const res = await signupApi(form);
            loginUser(res.data.access_token, res.data.user);
            toast.success('Account created! Welcome to AttendTrack.');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-root">
            <div className="blob blob-1" />
            <div className="blob blob-2" />
            <div className="blob blob-3" />

            <div className="auth-container auth-container-wide">
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

                <h1 className="auth-title">Create Admin Account</h1>
                <p className="auth-subtitle">Set up your company and start tracking attendance</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-row">
                        <div className="auth-field">
                            <label><User size={14} /> Full Name</label>
                            <input
                                className="input"
                                placeholder="Your name"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                            />
                        </div>
                        <div className="auth-field">
                            <label><Building2 size={14} /> Company Name</label>
                            <input
                                className="input"
                                placeholder="Your company name"
                                value={form.company_name}
                                onChange={e => setForm({ ...form, company_name: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="auth-row">
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
                                placeholder="Minimum 6 characters"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Theme selector */}
                    <div className="auth-field">
                        <label>Choose a Theme</label>
                        <div className="theme-picker">
                            {themes.map((t) => (
                                <button
                                    key={t.id}
                                    type="button"
                                    className={`theme-pick-card ${form.theme_id === t.id ? 'active' : ''}`}
                                    onClick={() => setForm({ ...form, theme_id: t.id })}
                                >
                                    <div className="theme-pick-emoji" style={{ background: t.gradient }}>
                                        <span>{t.emoji}</span>
                                    </div>
                                    <span className="theme-pick-name">{t.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
                        {loading ? <><Loader size={14} className="spin" /> Creating account...</> : <><UserPlus size={14} /> Create Account</>}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
