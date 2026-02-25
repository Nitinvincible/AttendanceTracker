import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEmployees, createEmployee, deleteEmployee, getDepartments } from '../api';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';
import {
    Zap, Plus, Trash2, Loader, Users, Mail, User, Building,
    Eye, EyeOff, Copy, X
} from 'lucide-react';

export default function Advanced() {
    const { theme } = useTheme();
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);

    const { data: empData, isLoading } = useQuery({
        queryKey: ['employees'],
        queryFn: getEmployees,
    });
    const employees = empData?.data || [];

    const { data: deptData } = useQuery({
        queryKey: ['departments'],
        queryFn: getDepartments,
    });
    const departments = deptData?.data || [];

    const deleteMutation = useMutation({
        mutationFn: deleteEmployee,
        onSuccess: () => {
            queryClient.invalidateQueries(['employees']);
            toast.success('Employee account deleted');
        },
        onError: () => toast.error('Failed to delete'),
    });

    const handleDelete = (id, name) => {
        toast((t) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>Delete employee account "{name}"?</p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => toast.dismiss(t.id)}>Cancel</button>
                    <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => { toast.dismiss(t.id); deleteMutation.mutate(id); }}>Delete</button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div className="accent-line" />
                    <h1><Zap size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} /> Advanced</h1>
                    <p>Manage employee login accounts for your organization</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={15} /> Create Employee Account
                </button>
            </div>

            <div className="card">
                {isLoading ? (
                    <div className="loader"><Loader size={18} className="spin" /> Loading employees...</div>
                ) : employees.length === 0 ? (
                    <div className="empty-state">
                        <Users size={40} />
                        <p>No employee accounts yet. Create one to let team members log in.</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Department</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((emp, i) => (
                                    <tr key={emp.id}>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{i + 1}</td>
                                        <td style={{ fontWeight: 600 }}>{emp.name}</td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{emp.email}</td>
                                        <td>
                                            {emp.department_name ? (
                                                <span className="badge" style={{ background: 'var(--accent-glow)', color: 'var(--accent-light)', border: '1px solid var(--border-accent)' }}>
                                                    {emp.department_name}
                                                </span>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)' }}>—</span>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                                <button
                                                    className="btn btn-danger"
                                                    style={{ padding: '6px 10px' }}
                                                    onClick={() => handleDelete(emp.id, emp.name)}
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <CreateEmployeeModal
                    departments={departments}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
}

function CreateEmployeeModal({ departments, onClose }) {
    const queryClient = useQueryClient();
    const [form, setForm] = useState({ name: '', email: '', department_id: '' });
    const [generatedPassword, setGeneratedPassword] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const mutation = useMutation({
        mutationFn: createEmployee,
        onSuccess: (res) => {
            queryClient.invalidateQueries(['employees']);
            setGeneratedPassword(res.data.generated_password);
            toast.success('Employee account created!');
        },
        onError: (err) => toast.error(err.response?.data?.detail || 'Failed to create account'),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name || !form.email) {
            toast.error('Name and email are required');
            return;
        }
        const data = { ...form };
        if (data.department_id) {
            data.department_id = parseInt(data.department_id);
        } else {
            data.department_id = null;
        }
        mutation.mutate(data);
    };

    const copyPassword = () => {
        navigator.clipboard.writeText(generatedPassword);
        toast.success('Password copied!');
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ margin: 0 }}>Create Employee Account</h2>
                    <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>

                {generatedPassword ? (
                    <div>
                        <div style={{
                            padding: 20, background: 'var(--green-bg)', border: '1px solid rgba(34,197,94,0.3)',
                            borderRadius: 'var(--radius-sm)', marginBottom: 20, textAlign: 'center'
                        }}>
                            <p style={{ color: 'var(--green)', fontWeight: 700, marginBottom: 12, fontSize: '0.9rem' }}>
                                ✓ Account Created Successfully
                            </p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 12 }}>
                                Share these credentials with the employee:
                            </p>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center',
                                padding: '12px 16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)'
                            }}>
                                <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
                                    {showPassword ? generatedPassword : '••••••••••'}
                                </span>
                                <button className="btn btn-ghost" style={{ padding: '4px 6px' }} onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                                <button className="btn btn-ghost" style={{ padding: '4px 6px' }} onClick={copyPassword}>
                                    <Copy size={14} />
                                </button>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="btn btn-primary" onClick={onClose}>Done</button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label><User size={14} style={{ verticalAlign: 'middle' }} /> Full Name</label>
                            <input className="input" placeholder="Employee name" value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label><Mail size={14} style={{ verticalAlign: 'middle' }} /> Email</label>
                            <input className="input" type="email" placeholder="employee@company.com" value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label><Building size={14} style={{ verticalAlign: 'middle' }} /> Department</label>
                            <select className="input" value={form.department_id}
                                onChange={e => setForm({ ...form, department_id: e.target.value })}>
                                <option value="">No department</option>
                                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16, padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                            A random password will be generated automatically. You'll see it after creation.
                        </p>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
                                {mutation.isPending ? <><Loader size={13} className="spin" /> Creating...</> : <><Plus size={14} /> Create Account</>}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
