import React, { useEffect, useState } from 'react';
import { getDashboardStats, getWeeklyData } from '../api';
import { useTheme } from '../context/ThemeContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Users, UserCheck, UserX, TrendingUp, Loader } from 'lucide-react';

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

export default function Dashboard() {
    const { occupation } = useTheme();
    const [stats, setStats] = useState(null);
    const [weekly, setWeekly] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [s, w] = await Promise.all([getDashboardStats(), getWeeklyData()]);
                setStats(s.data);
                setWeekly(w.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="loader">
                <Loader size={20} className="spin" />
                Loading dashboard...
            </div>
        );
    }

    const statCards = [
        {
            icon: Users,
            label: `Total ${occupation?.memberLabelPlural ?? 'Members'}`,
            value: stats?.total_students ?? 0,
            color: 'var(--blue)',
            bg: 'var(--blue-bg)',
        },
        {
            icon: UserCheck,
            label: 'Present Today',
            value: stats?.present_today ?? 0,
            color: 'var(--green)',
            bg: 'var(--green-bg)',
        },
        {
            icon: UserX,
            label: 'Absent Today',
            value: stats?.absent_today ?? 0,
            color: 'var(--red)',
            bg: 'var(--red-bg)',
        },
        {
            icon: TrendingUp,
            label: 'Attendance Rate',
            value: `${stats?.attendance_percentage ?? 0}%`,
            color: 'var(--accent-light)',
            bg: 'var(--accent-glow)',
        },
    ];

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

            {/* Stat cards */}
            <div className="stats-grid">
                {statCards.map(({ icon: Icon, label, value, color, bg }) => (
                    <div className="card stat-card" key={label}>
                        <div className="stat-icon" style={{ background: bg }}>
                            <Icon size={18} color={color} />
                        </div>
                        <div>
                            <div className="stat-label">{label}</div>
                            <div className="stat-value" style={{ color }}>{value}</div>
                        </div>
                    </div>
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
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                                    axisLine={false} tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                                    axisLine={false} tickLine={false}
                                />
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
                        <SummaryRow
                            label="Present"
                            value={stats?.present_today ?? 0}
                            total={stats?.total_students || 1}
                            color="var(--green)"
                        />
                        <SummaryRow
                            label="Absent"
                            value={stats?.absent_today ?? 0}
                            total={stats?.total_students || 1}
                            color="var(--red)"
                        />
                        <SummaryRow
                            label="Not Marked"
                            value={(stats?.total_students ?? 0) - (stats?.present_today ?? 0) - (stats?.absent_today ?? 0)}
                            total={stats?.total_students || 1}
                            color="var(--text-muted)"
                        />
                    </div>
                    {/* Big percentage */}
                    <div style={{
                        padding: '16px',
                        background: 'var(--accent-glow)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-accent)',
                        textAlign: 'center',
                    }}>
                        <div style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--accent-light)', letterSpacing: '-0.04em' }}>
                            {stats?.attendance_percentage ?? 0}%
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 4, fontWeight: 500 }}>
                            Overall Attendance Rate
                        </div>
                    </div>
                </div>
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
                <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: color,
                    borderRadius: 999,
                    transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)'
                }} />
            </div>
        </div>
    );
}
