import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Users, ClipboardCheck, RefreshCw, ChevronRight
} from 'lucide-react';
import { useTheme, OCCUPATIONS } from '../context/ThemeContext';
import './Navbar.css';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/students', icon: Users, label: 'Members' },
    { to: '/attendance', icon: ClipboardCheck, label: 'Attendance' },
];

export default function Navbar() {
    const { occupation, setOccupationType, clearOccupation } = useTheme();
    const [showPicker, setShowPicker] = useState(false);

    return (
        <>
            <aside className="sidebar">
                {/* Brand */}
                <div className="sidebar-brand">
                    <div className="brand-icon">
                        <span style={{ fontSize: '1.1rem' }}>{occupation?.emoji}</span>
                    </div>
                    <div>
                        <span className="brand-name">AttendTrack</span>
                        <span className="brand-sub">{occupation?.name}</span>
                    </div>
                </div>

                {/* Nav */}
                <nav className="sidebar-nav">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <Icon size={17} />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Occupation Switcher */}
                <div className="sidebar-section-label">Occupation</div>
                <button className="occ-switch-btn" onClick={() => setShowPicker(!showPicker)}>
                    <span style={{ fontSize: '1rem' }}>{occupation?.emoji}</span>
                    <span className="occ-switch-name">{occupation?.fullName}</span>
                    <RefreshCw size={13} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                </button>

                {/* Inline occupation picker */}
                {showPicker && (
                    <div className="inline-picker">
                        {Object.values(OCCUPATIONS).map(occ => (
                            <button
                                key={occ.id}
                                className={`inline-occ-item ${occupation?.id === occ.id ? 'current' : ''}`}
                                onClick={() => { setOccupationType(occ.id); setShowPicker(false); }}
                            >
                                <span>{occ.emoji}</span>
                                <span>{occ.name}</span>
                                {occupation?.id === occ.id && <ChevronRight size={12} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
                            </button>
                        ))}
                    </div>
                )}

                {/* Footer status */}
                <div className="sidebar-footer">
                    <div className="status-dot" />
                    <span>System Online</span>
                </div>
            </aside>
        </>
    );
}
