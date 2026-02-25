import React, { useState, useEffect } from 'react';
import { getStudents, markAttendance, getAttendanceByDate } from '../api';
import { useTheme } from '../context/ThemeContext';
import { CalendarDays, CheckCircle, XCircle, Save, Loader, ClipboardCheck } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

export default function Attendance() {
    const { occupation } = useTheme();
    const queryClient = useQueryClient();
    const memberLabelPlural = occupation?.memberLabelPlural ?? 'Members';
    const idLabel = occupation?.idLabel ?? 'ID';
    const groupLabel = occupation?.groupLabel ?? 'Group';

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [statuses, setStatuses] = useState({});

    const { data: studentsData, isLoading: loadingStudents } = useQuery({
        queryKey: ['students'],
        queryFn: getStudents,
    });
    const students = studentsData?.data || [];

    const { data: historyData, isLoading: loadingHistory } = useQuery({
        queryKey: ['attendance', date],
        queryFn: () => getAttendanceByDate(date),
        enabled: students.length > 0,
    });

    useEffect(() => {
        if (!students.length) return;
        const history = historyData?.data || [];
        const map = {};
        if (history.length > 0) {
            history.forEach(r => { map[r.student_id] = r.status; });
            students.forEach(s => { if (!map[s.id]) map[s.id] = 'present'; });
        } else {
            students.forEach(s => { map[s.id] = 'present'; });
        }
        setStatuses(map);
    }, [students, historyData]);

    const loading = loadingStudents || loadingHistory;

    const toggle = (id) => {
        setStatuses(prev => ({ ...prev, [id]: prev[id] === 'present' ? 'absent' : 'present' }));
    };

    const mutation = useMutation({
        mutationFn: (records) => markAttendance({ date, records }),
        onSuccess: () => {
            queryClient.invalidateQueries(['attendance']);
            queryClient.invalidateQueries(['dashboard']);
            toast.success('Attendance saved successfully!');
        },
        onError: () => {
            toast.error('Failed to save attendance.');
        }
    });

    const handleSubmit = () => {
        const records = students.map(s => ({ student_id: s.id, status: statuses[s.id] }));
        mutation.mutate(records);
    };

    const markAll = (status) => {
        const updated = {};
        students.forEach(s => { updated[s.id] = status; });
        setStatuses(updated);
    };

    const presentCount = Object.values(statuses).filter(v => v === 'present').length;
    const absentCount = Object.values(statuses).filter(v => v === 'absent').length;

    return (
        <div>
            {/* Header */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <div className="accent-line" />
                    <h1>Mark Attendance</h1>
                    <p>Toggle status for each {occupation?.memberLabel?.toLowerCase() ?? 'member'}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    {/* Date picker */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '9px 14px',
                    }}>
                        <CalendarDays size={15} color="var(--accent-light)" />
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            style={{
                                background: 'none', border: 'none', color: 'var(--text-primary)',
                                fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', outline: 'none', cursor: 'pointer',
                            }}
                        />
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={mutation.isPending || students.length === 0}
                    >
                        {mutation.isPending
                            ? <><Loader size={13} className="spin" /> Saving...</>
                            : <><Save size={14} /> Save Attendance</>}
                    </button>
                </div>
            </div>

            {/* Summary strip */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
                <div className="card" style={{ padding: '14px 20px', display: 'flex', gap: 24, flex: 1, minWidth: 280, alignItems: 'center' }}>
                    <Pill icon={CheckCircle} label="Present" count={presentCount} color="var(--green)" />
                    <div style={{ width: 1, height: 28, background: 'var(--border)' }} />
                    <Pill icon={XCircle} label="Absent" count={absentCount} color="var(--red)" />
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                        <button className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '6px 12px' }} onClick={() => markAll('present')}>
                            All Present
                        </button>
                        <button className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '6px 12px' }} onClick={() => markAll('absent')}>
                            All Absent
                        </button>
                    </div>
                </div>
            </div>

            {/* Student list */}
            <div className="card">
                {loading ? (
                    <div className="loader"><Loader size={18} className="spin" /> Loading...</div>
                ) : students.length === 0 ? (
                    <div className="empty-state">
                        <ClipboardCheck size={40} />
                        <p>No {memberLabelPlural.toLowerCase()} yet. Add them first from the Members page.</p>
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
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((s, i) => {
                                    const isPresent = statuses[s.id] === 'present';
                                    return (
                                        <tr key={s.id}>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{i + 1}</td>
                                            <td style={{ fontWeight: 600 }}>{s.name}</td>
                                            <td>
                                                <span className="badge" style={{ background: 'var(--accent-glow)', color: 'var(--accent-light)', border: '1px solid var(--border-accent)' }}>
                                                    {s.roll_number}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{s.department}</td>
                                            <td>
                                                <button
                                                    className={`toggle-btn ${isPresent ? 'toggle-present' : 'toggle-absent'}`}
                                                    onClick={() => toggle(s.id)}
                                                >
                                                    {isPresent ? '✓ Present' : '✗ Absent'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

function Pill({ icon: Icon, label, count, color }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <Icon size={18} color={color} />
            <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color, lineHeight: 1.1 }}>{count}</div>
            </div>
        </div>
    );
}
