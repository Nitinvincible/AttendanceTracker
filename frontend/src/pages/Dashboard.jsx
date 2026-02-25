import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getWeeklyData, getAttendanceHistory } from '../api';
import { useTheme } from '../context/ThemeContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Users, UserCheck, UserX, TrendingUp, Loader, CheckCircle2, XCircle, CalendarDays, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-accent)',
                borderRadius: '10px',
                padding: '12px 16px',
                fontSize: '0.8rem',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}>
                <p style={{ fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>{label}</p>
                {payload.map(p => (
                    <p key={p.name} style={{ color: p.color, marginBottom: 4 }}>
                        {p.name}: <strong>{p.value}</strong>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// CSV export helper
function exportCSV(history, occupation) {
    const idLabel = occupation?.idLabel ?? 'ID';
    const groupLabel = occupation?.groupLabel ?? 'Group';
    const header = ['Date', 'Name', idLabel, groupLabel, 'Status'];
    const rows = history.map(rec => [
        rec.date,
        rec.student?.name ?? '',
        rec.student?.roll_number ?? '',
        rec.student?.department ?? '',
        rec.status,
    ]);
    const csv = [header, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.08, duration: 0.3, ease: 'easeOut' },
    }),
};

export default function Dashboard() {
    const { occupation } = useTheme();

    const { data: statsData, isLoading: loadingStats } = useQuery({
        queryKey: ['dashboard', 'stats'],
        queryFn: getDashboardStats,
    });
    const { data: weeklyData, isLoading: loadingWeekly } = useQuery({
        queryKey: ['dashboard', 'weekly'],
        queryFn: getWeeklyData,
    });
    const { data: historyData, isLoading: loadingHistory } = useQuery({
        queryKey: ['attendance', 'history'],
        queryFn: getAttendanceHistory,
    });

    const loading = loadingStats || loadingWeekly || loadingHistory;

    if (loading) {
        return (
            <div className="loader">
                <Loader size={20} className="spin" />
                Loading dashboard...
            </div>
        );
    }

    const stats = statsData?.data;
    const weekly = weeklyData?.data ?? [];
    const history = historyData?.data ?? [];

    const statCards = [
        { icon: Users, label: `Total ${occupation?.memberLabelPlural ?? 'Members'}`, value: stats?.total_students ?? 0, color: 'var(--blue)', bg: 'var(--blue-bg)' },
        { icon: UserCheck, label: 'Present Today', value: stats?.present_today ?? 0, color: 'var(--green)', bg: 'var(--green-bg)' },
        { icon: UserX, label: 'Absent Today', value: stats?.absent_today ?? 0, color: 'var(--red)', bg: 'var(--red-bg)' },
        { icon: TrendingUp, label: 'Attendance Rate', value: `${stats?.attendance_percentage ?? 0}%`, color: 'var(--accent-light)', bg: 'var(--accent-glow)' },
    ];

    // Group history by date
    const byDate = {};
    history.forEach(rec => {
        if (!byDate[rec.date]) byDate[rec.date] = [];
        byDate[rec.date].push(rec);
    });
    const sortedDates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

    return (
        <div>
            <div className="page-header">
                <div className="accent-line" />
                <h1>Dashboard</h1>
                <p>
                    {occupation?.fullName} · {new Date().toLocaleDateString('en-IN', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                </p>
            </div>

            {/* Stat cards — animated */}
            <div className="stats-grid">
                {statCards.map(({ icon: Icon, label, value, color, bg }, i) => (
                    <motion.div
                        className="card stat-card"
                        key={label}
                        custom={i}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="stat-icon" style={{ background: bg }}>
                            <Icon size={18} color={color} />
                        </div>
                        <div>
                            <div className="stat-label">{label}</div>
                            <div className="stat-value" style={{ color }}>{value}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts */}
            <div className="chart-section">
                {/* Bar chart */}
                <div className="card" style={{ padding: '24px' }}>
                    <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>
                        7-Day Attendance
                    </h2>
                    {weekly.length === 0 || weekly.every(d => d.total === 0) ? (
                        <div className="empty-state" style={{ padding: '32px 0' }}>
                            <p style={{ fontSize: '0.85rem' }}>No records yet — start marking attendance!</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={weekly} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                                <Legend wrapperStyle={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} />
                                <Bar dataKey="present" name="Present" fill="var(--green)" radius={[4, 4, 0, 0]} maxBarSize={32} />
                                <Bar dataKey="absent" name="Absent" fill="var(--red)" radius={[4, 4, 0, 0]} maxBarSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Summary panel */}
                <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Today's Summary</h2>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <SummaryRow label="Present" value={stats?.present_today ?? 0} total={stats?.total_students || 1} color="var(--green)" />
                        <SummaryRow label="Absent" value={stats?.absent_today ?? 0} total={stats?.total_students || 1} color="var(--red)" />
                        <SummaryRow label="Not Marked" value={(stats?.total_students ?? 0) - (stats?.present_today ?? 0) - (stats?.absent_today ?? 0)} total={stats?.total_students || 1} color="var(--text-muted)" />
                    </div>
                    <div style={{ padding: '16px', background: 'var(--accent-glow)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-accent)', textAlign: 'center' }}>
                        <div style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--accent-light)', letterSpacing: '-0.04em' }}>
                            {stats?.attendance_percentage ?? 0}%
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 4, fontWeight: 500 }}>
                            Overall Attendance Rate
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Attendance Records ── */}
            <div className="card" style={{ padding: '24px', marginTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <CalendarDays size={17} color="var(--accent-light)" />
                        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                            Recent Attendance Records
                        </h2>
                    </div>
                    {history.length > 0 && (
                        <button
                            className="btn btn-ghost"
                            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', border: '1px solid var(--border)' }}
                            onClick={() => exportCSV(history, occupation)}
                        >
                            <Download size={13} /> Export CSV
                        </button>
                    )}
                </div>

                {history.length === 0 ? (
                    <div className="empty-state" style={{ padding: '28px 0' }}>
                        <p style={{ fontSize: '0.85rem' }}>No attendance records yet — start marking attendance!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {sortedDates.map(dateStr => {
                            const recs = byDate[dateStr];
                            const presentCount = recs.filter(r => r.status === 'present').length;
                            const absentCount = recs.filter(r => r.status === 'absent').length;
                            const label = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
                                weekday: 'long', day: 'numeric', month: 'short', year: 'numeric'
                            });
                            return (
                                <div key={dateStr}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{label}</span>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: 'var(--green-bg)', color: 'var(--green)' }}>✓ {presentCount} Present</span>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: 'var(--red-bg)', color: 'var(--red)' }}>✗ {absentCount} Absent</span>
                                    </div>
                                    <div className="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Name</th>
                                                    <th>{occupation?.idLabel ?? 'ID'}</th>
                                                    <th>{occupation?.groupLabel ?? 'Group'}</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recs.map((rec, idx) => (
                                                    <tr key={rec.id}>
                                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{idx + 1}</td>
                                                        <td style={{ fontWeight: 600 }}>{rec.student?.name ?? '—'}</td>
                                                        <td>
                                                            <span className="badge" style={{ background: 'var(--accent-glow)', color: 'var(--accent-light)', border: '1px solid var(--border-accent)' }}>
                                                                {rec.student?.roll_number ?? '—'}
                                                            </span>
                                                        </td>
                                                        <td style={{ color: 'var(--text-secondary)' }}>{rec.student?.department ?? '—'}</td>
                                                        <td>
                                                            {rec.status === 'present' ? (
                                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, background: 'var(--green-bg)', color: 'var(--green)', fontSize: '0.75rem', fontWeight: 700 }}>
                                                                    <CheckCircle2 size={12} /> Present
                                                                </span>
                                                            ) : (
                                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, background: 'var(--red-bg)', color: 'var(--red)', fontSize: '0.75rem', fontWeight: 700 }}>
                                                                    <XCircle size={12} /> Absent
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

function SummaryRow({ label, value, total, color }) {
    const pct = total > 0 ? Math.max(0, (value / total) * 100) : 0;
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{label}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color }}>{value}</span>
            </div>
            <div style={{ height: 4, background: 'var(--border)', borderRadius: 999 }}>
                <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 999, transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)' }} />
            </div>
        </div>
    );
}
