import React, { useEffect, useState } from 'react';
import { getStudents, createStudent, deleteStudent } from '../api';
import { useTheme } from '../context/ThemeContext';
import { Plus, Trash2, Search, Loader, Users } from 'lucide-react';

export default function Students() {
    const { occupation } = useTheme();
    const [students, setStudents] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', roll_number: '', department: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const memberLabel = occupation?.memberLabel ?? 'Member';
    const memberLabelPlural = occupation?.memberLabelPlural ?? 'Members';
    const idLabel = occupation?.idLabel ?? 'ID';
    const groupLabel = occupation?.groupLabel ?? 'Group';

    const load = async () => {
        try {
            const res = await getStudents();
            setStudents(res.data);
            setFiltered(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    useEffect(() => {
        const q = search.toLowerCase();
        setFiltered(students.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.roll_number.toLowerCase().includes(q) ||
            s.department.toLowerCase().includes(q)
        ));
    }, [search, students]);

    const handleAdd = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            await createStudent(form);
            setShowModal(false);
            setForm({ name: '', roll_number: '', department: '' });
            await load();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to add. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Remove "${name}" from the system?`)) return;
        try {
            await deleteStudent(id);
            await load();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div className="accent-line" />
                    <h1>{memberLabelPlural}</h1>
                    <p>{students.length} {memberLabelPlural.toLowerCase()} enrolled in {occupation?.fullName}</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setShowModal(true); setError(''); }}>
                    <Plus size={15} /> Add {memberLabel}
                </button>
            </div>

            {/* Search bar */}
            <div className="card" style={{ padding: '11px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Search size={15} color="var(--text-muted)" />
                <input
                    className="input"
                    style={{ border: 'none', background: 'transparent', padding: 0, boxShadow: 'none' }}
                    placeholder={`Search by name, ${idLabel}, or ${groupLabel}...`}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="card">
                {loading ? (
                    <div className="loader"><Loader size={18} className="spin" /> Loading {memberLabelPlural.toLowerCase()}...</div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <Users size={40} />
                        <p>{search ? `No matching ${memberLabelPlural.toLowerCase()} found.` : `No ${memberLabelPlural.toLowerCase()} yet. Add your first!`}</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>{idLabel}</th>
                                    <th>{groupLabel}</th>
                                    <th>Added</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((s, i) => (
                                    <tr key={s.id}>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{i + 1}</td>
                                        <td style={{ fontWeight: 600 }}>{s.name}</td>
                                        <td>
                                            <span className="badge" style={{ background: 'var(--accent-glow)', color: 'var(--accent-light)', border: '1px solid var(--border-accent)' }}>
                                                {s.roll_number}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{s.department}</td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                                            {new Date(s.created_at).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-danger"
                                                style={{ padding: '6px 10px' }}
                                                onClick={() => handleDelete(s.id, s.name)}
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2>Add {memberLabel}</h2>
                        <form onSubmit={handleAdd}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    className="input"
                                    required
                                    placeholder={occupation?.namePlaceholder ?? 'Enter full name'}
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>{idLabel}</label>
                                <input
                                    className="input"
                                    required
                                    placeholder={occupation?.idPlaceholder ?? 'Enter ID'}
                                    value={form.roll_number}
                                    onChange={e => setForm({ ...form, roll_number: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>{groupLabel}</label>
                                <input
                                    className="input"
                                    required
                                    placeholder={occupation?.groupPlaceholder ?? 'Enter group'}
                                    value={form.department}
                                    onChange={e => setForm({ ...form, department: e.target.value })}
                                />
                            </div>
                            {error && (
                                <p style={{ color: 'var(--red)', fontSize: '0.8rem', marginBottom: 14, padding: '8px 12px', background: 'var(--red-bg)', borderRadius: '8px' }}>
                                    {error}
                                </p>
                            )}
                            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? <><Loader size={13} className="spin" /> Saving...</> : `Add ${memberLabel}`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
