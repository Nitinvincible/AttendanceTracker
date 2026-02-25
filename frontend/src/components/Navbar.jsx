import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Users, ClipboardCheck, Settings, Zap,
    LogOut, ChevronRight, Building2
} from 'lucide-react';
import { useTheme, THEMES } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
    const { theme, themeId, setThemeId } = useTheme();
    const { user, isAdmin, logout } = useAuth();
    const [showPicker, setShowPicker] = useState(false);

    const navItems = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/students', icon: Users, label: theme?.memberLabelPlural || 'Members' },
        { to: '/attendance', icon: ClipboardCheck, label: 'Attendance' },
    ];

    const adminItems = [
        { to: '/departments', icon: Building2, label: 'Departments' },
        { to: '/settings', icon: Settings, label: 'Settings' },
        { to: '/advanced', icon: Zap, label: 'Advanced' },
    ];

    return (
        <aside className="sidebar">
            {/* Brand */}
            <div className="sidebar-brand">
                <div className="brand-icon">
                    <span style={{ fontSize: '1.1rem' }}>{theme?.emoji}</span>
                </div>
                <div>
                    <span className="brand-name">AttendTrack</span>
                    <span className="brand-sub">{theme?.name}</span>
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

                {isAdmin && (
                    <>
                        <div className="sidebar-section-label">Admin</div>
                        {adminItems.map(({ to, icon: Icon, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            >
                                <Icon size={17} />
                                <span>{label}</span>
                            </NavLink>
                        ))}
                    </>
                )}
            </nav>

            {/* Theme Switcher (admin only) */}
            {isAdmin && (
                <>
                    <div className="sidebar-section-label">Theme</div>
                    <button className="occ-switch-btn" onClick={() => setShowPicker(!showPicker)}>
                        <span style={{ fontSize: '1rem' }}>{theme?.emoji}</span>
                        <span className="occ-switch-name">{theme?.fullName}</span>
                        <ChevronRight size={13} style={{ marginLeft: 'auto', opacity: 0.5, transform: showPicker ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>
                    {showPicker && (
                        <div className="inline-picker">
                            {Object.values(THEMES).map(t => (
                                <button
                                    key={t.id}
                                    className={`inline-occ-item ${themeId === t.id ? 'current' : ''}`}
                                    onClick={() => { setThemeId(t.id); setShowPicker(false); }}
                                >
                                    <span>{t.emoji}</span>
                                    <span>{t.name}</span>
                                    {themeId === t.id && <ChevronRight size={12} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* User info & logout */}
            <div className="sidebar-user">
                <div className="user-info">
                    <Building2 size={14} style={{ opacity: 0.6 }} />
                    <div className="user-details">
                        <span className="user-name">{user?.name}</span>
                        <span className="user-company">{user?.company_name}</span>
                    </div>
                </div>
                <button className="btn btn-ghost logout-btn" onClick={logout} title="Logout">
                    <LogOut size={15} />
                </button>
            </div>
        </aside>
    );
}
