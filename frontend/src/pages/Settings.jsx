import React, { useState, useEffect } from 'react';
import { useTheme, THEMES } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getSettings, updateSettings, getDepartments, createDepartment,
    updateDepartment as updateDeptApi, deleteDepartment
} from '../api';
import { toast } from 'react-hot-toast';
import {
    Settings as SettingsIcon, Palette, Tag, Building, Plus,
    Pencil, Trash2, Loader, Save, X, Download
} from 'lucide-react';

export default function Settings() {
    const { theme, setThemeId, setCustomLabels } = useTheme();
    const { isAdmin } = useAuth();
    const queryClient = useQueryClient();

    // --- Settings ---
    const { data: settingsData } = useQuery({
        queryKey: ['settings'],
        queryFn: getSettings,
    });
    const settings = settingsData?.data;

    const [labels, setLabels] = useState({
        member_label: '', member_label_plural: '', id_label: '',
        group_label: '', name_placeholder: '', id_placeholder: '', group_placeholder: '',
    });
    const [selectedTheme, setSelectedTheme] = useState('');

    useEffect(() => {
        if (settings) {
            setSelectedTheme(settings.theme_id || 'corporate');
            if (settings.custom_labels) {
                setLabels(settings.custom_labels);
            } else {
                const base = THEMES[settings.theme_id] || THEMES.corporate;
                setLabels({
                    member_label: base.memberLabel,
                    member_label_plural: base.memberLabelPlural,
                    id_label: base.idLabel,
                    group_label: base.groupLabel,
                    name_placeholder: base.namePlaceholder,
                    id_placeholder: base.idPlaceholder,
                    group_placeholder: base.groupPlaceholder,
                });
            }
        }
    }, [settings]);

    const saveMutation = useMutation({
        mutationFn: (data) => updateSettings(data),
        onSuccess: (res) => {
            queryClient.invalidateQueries(['settings']);
            if (res.data.theme_id) setThemeId(res.data.theme_id);
            if (res.data.custom_labels) setCustomLabels(res.data.custom_labels);
            toast.success('Settings saved!');
        },
        onError: () => toast.error('Failed to save settings'),
    });

    const handleSaveSettings = () => {
        saveMutation.mutate({ theme_id: selectedTheme, custom_labels: labels });
    };

    const handleThemeSelect = (id) => {
        setSelectedTheme(id);
        const base = THEMES[id];
        setLabels({
            member_label: base.memberLabel,
            member_label_plural: base.memberLabelPlural,
            id_label: base.idLabel,
            group_label: base.groupLabel,
            name_placeholder: base.namePlaceholder,
            id_placeholder: base.idPlaceholder,
            group_placeholder: base.groupPlaceholder,
        });
    };

    // --- Departments ---
    const { data: deptData, isLoading: deptLoading } = useQuery({
        queryKey: ['departments'],
        queryFn: getDepartments,
    });
    const departments = deptData?.data || [];

    const [newDept, setNewDept] = useState('');
    const [editingDept, setEditingDept] = useState(null);
    const [editDeptName, setEditDeptName] = useState('');

    const addDeptMutation = useMutation({
        mutationFn: createDepartment,
        onSuccess: () => {
            queryClient.invalidateQueries(['departments']);
            setNewDept('');
            toast.success('Department added');
        },
        onError: (err) => toast.error(err.response?.data?.detail || 'Failed to add'),
    });

    const updateDeptMutation = useMutation({
        mutationFn: ({ id, data }) => updateDeptApi(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['departments']);
            setEditingDept(null);
            toast.success('Department renamed');
        },
        onError: (err) => toast.error(err.response?.data?.detail || 'Failed to rename'),
    });

    const delDeptMutation = useMutation({
        mutationFn: deleteDepartment,
        onSuccess: () => {
            queryClient.invalidateQueries(['departments']);
            toast.success('Department deleted');
        },
        onError: () => toast.error('Failed to delete'),
    });

    return (
        <div>
            <div className="page-header">
                <div className="accent-line" />
                <h1><SettingsIcon size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} /> Settings</h1>
                <p>Customize your workspace theme, labels, and departments</p>
            </div>

            {/* Theme selector */}
            <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Palette size={16} /> Theme
                </h2>
                <div className="theme-picker" style={{ marginBottom: 20 }}>
                    {Object.values(THEMES).map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            className={`theme-pick-card ${selectedTheme === t.id ? 'active' : ''}`}
                            onClick={() => handleThemeSelect(t.id)}
                        >
                            <div className="theme-pick-emoji" style={{ background: t.gradient }}>
                                <span>{t.emoji}</span>
                            </div>
                            <span className="theme-pick-name">{t.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Custom labels */}
            <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Tag size={16} /> Custom Labels
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                    Override the default labels to match your organization's terminology
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                    {[
                        { key: 'member_label', label: 'Member Label', ph: 'e.g. Doctor, Employee' },
                        { key: 'member_label_plural', label: 'Members (Plural)', ph: 'e.g. Doctors, Employees' },
                        { key: 'id_label', label: 'ID Label', ph: 'e.g. Staff ID, Badge No.' },
                        { key: 'group_label', label: 'Group Label', ph: 'e.g. Ward, Team, Class' },
                    ].map(({ key, label, ph }) => (
                        <div key={key} className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '0.75rem' }}>{label}</label>
                            <input
                                className="input"
                                placeholder={ph}
                                value={labels[key]}
                                onChange={e => setLabels({ ...labels, [key]: e.target.value })}
                            />
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary" onClick={handleSaveSettings} disabled={saveMutation.isPending}>
                        {saveMutation.isPending ? <><Loader size={13} className="spin" /> Saving...</> : <><Save size={14} /> Save Settings</>}
                    </button>
                </div>
            </div>

            {/* Departments */}
            <div className="card" style={{ padding: 24 }}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Building size={16} /> Departments
                </h2>

                {/* Add department */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                    <input
                        className="input"
                        placeholder="New department name"
                        value={newDept}
                        onChange={e => setNewDept(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && newDept.trim()) addDeptMutation.mutate({ name: newDept.trim() }); }}
                        style={{ flex: 1 }}
                    />
                    <button
                        className="btn btn-primary"
                        onClick={() => { if (newDept.trim()) addDeptMutation.mutate({ name: newDept.trim() }); }}
                        disabled={addDeptMutation.isPending || !newDept.trim()}
                    >
                        <Plus size={14} /> Add
                    </button>
                </div>

                {/* Department list */}
                {deptLoading ? (
                    <div className="loader"><Loader size={16} className="spin" /> Loading...</div>
                ) : departments.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: 20 }}>
                        No departments yet. Add your first department above.
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {departments.map(dept => (
                            <div key={dept.id} style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '10px 14px', background: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                            }}>
                                {editingDept === dept.id ? (
                                    <>
                                        <input
                                            className="input"
                                            value={editDeptName}
                                            onChange={e => setEditDeptName(e.target.value)}
                                            style={{ flex: 1 }}
                                            autoFocus
                                        />
                                        <button className="btn btn-primary" style={{ padding: '6px 10px' }}
                                            onClick={() => updateDeptMutation.mutate({ id: dept.id, data: { name: editDeptName } })}>
                                            <Save size={13} />
                                        </button>
                                        <button className="btn btn-ghost" style={{ padding: '6px 10px' }}
                                            onClick={() => setEditingDept(null)}>
                                            <X size={13} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span style={{ flex: 1, fontWeight: 500, fontSize: '0.875rem' }}>{dept.name}</span>
                                        <button className="btn btn-ghost" style={{ padding: '6px 10px', border: '1px solid var(--border)' }}
                                            onClick={() => { setEditingDept(dept.id); setEditDeptName(dept.name); }}>
                                            <Pencil size={13} />
                                        </button>
                                        <button className="btn btn-danger" style={{ padding: '6px 10px' }}
                                            onClick={() => delDeptMutation.mutate(dept.id)}>
                                            <Trash2 size={13} />
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
