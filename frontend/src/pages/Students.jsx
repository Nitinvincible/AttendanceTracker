import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Plus, Trash2, Pencil, Search, Loader, Users, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStudents, createStudent, updateStudent, deleteStudent, getDepartments } from '../api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const studentSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    roll_number: z.string().min(1, 'ID is required'),
    department_id: z.string().optional(),
});

const listVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
};

export default function Students() {
    const { theme } = useTheme();
    const [search, setSearch] = useState('');
    const queryClient = useQueryClient();
    const [showAdd, setShowAdd] = useState(false);
    const [editTarget, setEditTarget] = useState(null);

    const memberLabel = theme?.memberLabel ?? 'Member';
    const memberLabelPlural = theme?.memberLabelPlural ?? 'Members';
    const idLabel = theme?.idLabel ?? 'ID';
    const groupLabel = theme?.groupLabel ?? 'Department';

    const { data: studentsData, isLoading: loading } = useQuery({
        queryKey: ['students'],
        queryFn: getStudents,
    });
    const students = studentsData?.data || [];

    const { data: deptData } = useQuery({
        queryKey: ['departments'],
        queryFn: getDepartments,
    });
    const departments = deptData?.data || [];

    const filtered = students.filter(s => {
        const q = search.toLowerCase();
        return (
            s.name.toLowerCase().includes(q) ||
            s.roll_number.toLowerCase().includes(q) ||
            (s.department_name || '').toLowerCase().includes(q)
        );
    });

    const deleteMutation = useMutation({
        mutationFn: deleteStudent,
        onSuccess: () => {
            queryClient.invalidateQueries(['students']);
            queryClient.invalidateQueries(['dashboard']);
            toast.success(`${memberLabel} deleted successfully.`);
        },
        onError: () => toast.error(`Failed to delete ${memberLabel.toLowerCase()}.`),
    });

    const handleDelete = (id, name) => {
        toast((t) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>Remove "{name}" from the system?</p>
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
                    <h1>{memberLabelPlural}</h1>
                    <p>{students.length} {memberLabelPlural.toLowerCase()} enrolled</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                    <Plus size={15} /> Add {memberLabel}
                </button>
            </div>

            <div className="card" style={{ padding: '11px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Search size={15} color="var(--text-muted)" />
                <input className="input" style={{ border: 'none', background: 'transparent', padding: 0, boxShadow: 'none' }}
                    placeholder={`Search by name, ${idLabel}, or ${groupLabel}...`}
                    value={search} onChange={e => setSearch(e.target.value)} />
            </div>

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
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <motion.tbody variants={listVariants} initial="hidden" animate="show">
                                {filtered.map((s, i) => (
                                    <motion.tr key={s.id} variants={itemVariants}>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{i + 1}</td>
                                        <td style={{ fontWeight: 600 }}>{s.name}</td>
                                        <td>
                                            <span className="badge" style={{ background: 'var(--accent-glow)', color: 'var(--accent-light)', border: '1px solid var(--border-accent)' }}>
                                                {s.roll_number}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{s.department_name || '—'}</td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{new Date(s.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                                <button className="btn btn-ghost" style={{ padding: '6px 10px', border: '1px solid var(--border)' }} title="Edit" onClick={() => setEditTarget(s)}>
                                                    <Pencil size={13} />
                                                </button>
                                                <button className="btn btn-danger" style={{ padding: '6px 10px' }} title="Delete"
                                                    onClick={() => handleDelete(s.id, s.name)} disabled={deleteMutation.isPending}>
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </motion.tbody>
                        </table>
                    </div>
                )}
            </div>

            {showAdd && (
                <MemberModal
                    title={`Add ${memberLabel}`}
                    defaultValues={{ name: '', roll_number: '', department_id: '' }}
                    mutationFn={createStudent}
                    onClose={() => setShowAdd(false)}
                    submitLabel={`Add ${memberLabel}`}
                    theme={theme}
                    idLabel={idLabel}
                    groupLabel={groupLabel}
                    departments={departments}
                    successMessage={`${memberLabel} added successfully.`}
                />
            )}

            {editTarget && (
                <MemberModal
                    title={`Edit ${memberLabel}`}
                    defaultValues={{ name: editTarget.name, roll_number: editTarget.roll_number, department_id: editTarget.department_id ? String(editTarget.department_id) : '' }}
                    mutationFn={(data) => updateStudent(editTarget.id, data)}
                    onClose={() => setEditTarget(null)}
                    submitLabel="Save Changes"
                    theme={theme}
                    idLabel={idLabel}
                    groupLabel={groupLabel}
                    departments={departments}
                    successMessage={`${memberLabel} updated successfully.`}
                />
            )}
        </div>
    );
}

function MemberModal({ title, defaultValues, mutationFn, onClose, submitLabel, theme, idLabel, groupLabel, departments, successMessage }) {
    const queryClient = useQueryClient();
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(studentSchema),
        defaultValues,
    });

    const mutation = useMutation({
        mutationFn: (data) => {
            const payload = { ...data };
            payload.department_id = payload.department_id ? parseInt(payload.department_id) : null;
            return mutationFn(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['students']);
            queryClient.invalidateQueries(['dashboard']);
            toast.success(successMessage);
            onClose();
        },
        onError: (err) => toast.error(err.response?.data?.detail || 'An error occurred.'),
    });

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ margin: 0 }}>{title}</h2>
                    <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={onClose}><X size={16} /></button>
                </div>
                <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input className="input" placeholder={theme?.namePlaceholder ?? 'Enter full name'} {...register('name')} />
                        {errors.name && <span style={{ color: 'var(--red)', fontSize: '0.8rem', marginTop: 4 }}>{errors.name.message}</span>}
                    </div>
                    <div className="form-group">
                        <label>{idLabel}</label>
                        <input className="input" placeholder={theme?.idPlaceholder ?? 'Enter ID'} {...register('roll_number')} />
                        {errors.roll_number && <span style={{ color: 'var(--red)', fontSize: '0.8rem', marginTop: 4 }}>{errors.roll_number.message}</span>}
                    </div>
                    <div className="form-group">
                        <label>{groupLabel}</label>
                        <select className="input" {...register('department_id')}>
                            <option value="">Select {groupLabel.toLowerCase()}...</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                        {errors.department_id && <span style={{ color: 'var(--red)', fontSize: '0.8rem', marginTop: 4 }}>{errors.department_id.message}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
                            {mutation.isPending ? <><Loader size={13} className="spin" /> Saving...</> : submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
