import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../api';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';
import { Building2, Plus, Pencil, Trash2, Loader, X, Check } from 'lucide-react';

export default function Departments() {
    const { theme } = useTheme();
    const queryClient = useQueryClient();
    const [showAdd, setShowAdd] = useState(false);
    const [newName, setNewName] = useState('');
    const [editId, setEditId] = useState(null);
    const [editName, setEditName] = useState('');

    const groupLabel = theme?.groupLabel ?? 'Department';

    const { data, isLoading } = useQuery({
        queryKey: ['departments'],
        queryFn: getDepartments,
    });
    const departments = data?.data || [];

    const createMutation = useMutation({
        mutationFn: createDepartment,
        onSuccess: () => {
            queryClient.invalidateQueries(['departments']);
            toast.success(`${groupLabel} created!`);
            setNewName('');
            setShowAdd(false);
        },
        onError: (err) => toast.error(err.response?.data?.detail || 'Failed to create'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => updateDepartment(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['departments']);
            toast.success(`${groupLabel} updated!`);
            setEditId(null);
        },
        onError: (err) => toast.error(err.response?.data?.detail || 'Failed to update'),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteDepartment,
        onSuccess: () => {
            queryClient.invalidateQueries(['departments']);
            toast.success(`${groupLabel} deleted`);
        },
        onError: (err) => toast.error(err.response?.data?.detail || 'Failed to delete'),
    });

    const handleCreate = (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        createMutation.mutate({ name: newName.trim() });
    };

    const handleUpdate = (id) => {
        if (!editName.trim()) return;
        updateMutation.mutate({ id, data: { name: editName.trim() } });
    };

    const handleDelete = (id, name) => {
        toast((t) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>Delete "{name}"? Members in this {groupLabel.toLowerCase()} will be unassigned.</p>
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
                    <h1><Building2 size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />{groupLabel}s</h1>
                    <p>Create and manage {groupLabel.toLowerCase()}s / teams for your organization</p>
                </div>
                {!showAdd && (
                    <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                        <Plus size={15} /> Add {groupLabel}
                    </button>
                )}
            </div>

            {/* Add form */}
            {showAdd && (
                <div className="card" style={{ marginBottom: 16, padding: '16px 20px' }}>
                    <form onSubmit={handleCreate} style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        <input
                            className="input"
                            style={{ flex: 1, minWidth: 200 }}
                            placeholder={`e.g. Engineering, HR, Finance…`}
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            autoFocus
                        />
                        <button type="submit" className="btn btn-primary" disabled={createMutation.isPending || !newName.trim()}>
                            {createMutation.isPending ? <><Loader size={13} className="spin" /> Creating...</> : <><Plus size={14} /> Create</>}
                        </button>
                        <button type="button" className="btn btn-ghost" onClick={() => { setShowAdd(false); setNewName(''); }}>
                            <X size={14} /> Cancel
                        </button>
                    </form>
                </div>
            )}

            <div className="card">
                {isLoading ? (
                    <div className="loader"><Loader size={18} className="spin" /> Loading {groupLabel.toLowerCase()}s...</div>
                ) : departments.length === 0 ? (
                    <div className="empty-state">
                        <Building2 size={40} />
                        <p>No {groupLabel.toLowerCase()}s yet. Add your first one to start organizing members.</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>{groupLabel} Name</th>
                                    <th>Created</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {departments.map((dept, i) => (
                                    <tr key={dept.id}>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{i + 1}</td>
                                        <td style={{ fontWeight: 600 }}>
                                            {editId === dept.id ? (
                                                <input
                                                    className="input"
                                                    style={{ padding: '4px 10px', fontSize: '0.88rem', maxWidth: 260 }}
                                                    value={editName}
                                                    onChange={e => setEditName(e.target.value)}
                                                    autoFocus
                                                    onKeyDown={e => { if (e.key === 'Enter') handleUpdate(dept.id); if (e.key === 'Escape') setEditId(null); }}
                                                />
                                            ) : (
                                                <span>{dept.name}</span>
                                            )}
                                        </td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                                            {new Date(dept.created_at).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                                {editId === dept.id ? (
                                                    <>
                                                        <button
                                                            className="btn btn-primary"
                                                            style={{ padding: '6px 10px' }}
                                                            onClick={() => handleUpdate(dept.id)}
                                                            disabled={updateMutation.isPending}
                                                        >
                                                            <Check size={13} />
                                                        </button>
                                                        <button className="btn btn-ghost" style={{ padding: '6px 10px' }} onClick={() => setEditId(null)}>
                                                            <X size={13} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            className="btn btn-ghost"
                                                            style={{ padding: '6px 10px', border: '1px solid var(--border)' }}
                                                            title="Rename"
                                                            onClick={() => { setEditId(dept.id); setEditName(dept.name); }}
                                                        >
                                                            <Pencil size={13} />
                                                        </button>
                                                        <button
                                                            className="btn btn-danger"
                                                            style={{ padding: '6px 10px' }}
                                                            title="Delete"
                                                            onClick={() => handleDelete(dept.id, dept.name)}
                                                            disabled={deleteMutation.isPending}
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
