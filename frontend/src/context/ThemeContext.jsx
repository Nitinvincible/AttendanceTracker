import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSettings } from '../api';
import { useAuth } from './AuthContext';

export const THEMES = {
    medical: {
        id: 'medical',
        name: 'Medical',
        fullName: 'Healthcare & Medical',
        emoji: '🏥',
        tagline: 'Manage staff attendance across wards & departments',
        memberLabel: 'Staff Member',
        memberLabelPlural: 'Staff Members',
        idLabel: 'Staff ID',
        groupLabel: 'Ward / Department',
        groupPlaceholder: 'e.g. Cardiology, ICU, Emergency',
        namePlaceholder: 'e.g. Dr. Ananya Krishnan',
        idPlaceholder: 'e.g. MED-2024-001',
        gradient: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #0891b2 100%)',
        accentColor: '#0ea5e9',
    },
    corporate: {
        id: 'corporate',
        name: 'Corporate',
        fullName: 'Corporate & Business',
        emoji: '💼',
        tagline: 'Track employee attendance across teams & divisions',
        memberLabel: 'Employee',
        memberLabelPlural: 'Employees',
        idLabel: 'Employee ID',
        groupLabel: 'Team / Division',
        groupPlaceholder: 'e.g. Engineering, Product, Sales',
        namePlaceholder: 'e.g. Priya Mehta',
        idPlaceholder: 'e.g. EMP-2024-042',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
        accentColor: '#f59e0b',
    },
    government: {
        id: 'government',
        name: 'Government',
        fullName: 'Government & Public Sector',
        emoji: '🏛️',
        tagline: 'Official attendance tracking for government departments',
        memberLabel: 'Officer',
        memberLabelPlural: 'Officers',
        idLabel: 'Employee No.',
        groupLabel: 'Department / Ministry',
        groupPlaceholder: 'e.g. Revenue, Health, Education',
        namePlaceholder: 'e.g. Rajesh Kumar Singh',
        idPlaceholder: 'e.g. GOV-IAS-2024-007',
        gradient: 'linear-gradient(135deg, #16a34a 0%, #15803d 40%, #f97316 100%)',
        accentColor: '#16a34a',
    },
    learning: {
        id: 'learning',
        name: 'Education',
        fullName: 'Education & Learning',
        emoji: '🎓',
        tagline: 'Attendance for students across courses & institutions',
        memberLabel: 'Student',
        memberLabelPlural: 'Students',
        idLabel: 'Roll Number',
        groupLabel: 'Class / Course',
        groupPlaceholder: 'e.g. B.Tech CSE, NEET Batch, MBA Finance',
        namePlaceholder: 'e.g. Arjun Sharma',
        idPlaceholder: 'e.g. CS2024001',
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)',
        accentColor: '#8b5cf6',
    },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const { user } = useAuth();
    const [themeId, setThemeIdState] = useState(() => {
        return localStorage.getItem('att_theme') || 'corporate';
    });
    const [customLabels, setCustomLabels] = useState(null);

    // Load settings from API when user is logged in
    useEffect(() => {
        if (!user) return;
        getSettings()
            .then((res) => {
                const data = res.data;
                if (data.theme_id) {
                    setThemeIdState(data.theme_id);
                    localStorage.setItem('att_theme', data.theme_id);
                    document.body.setAttribute('data-theme', data.theme_id);
                }
                if (data.custom_labels) {
                    setCustomLabels(data.custom_labels);
                }
            })
            .catch(() => { });
    }, [user]);

    const setThemeId = (id) => {
        setThemeIdState(id);
        localStorage.setItem('att_theme', id);
        document.body.setAttribute('data-theme', id);
    };

    const clearTheme = () => {
        setThemeIdState('corporate');
        localStorage.removeItem('att_theme');
        document.body.removeAttribute('data-theme');
    };

    useEffect(() => {
        if (themeId) {
            document.body.setAttribute('data-theme', themeId);
        }
    }, []);

    // Merge preset theme with custom labels
    const baseTheme = THEMES[themeId] || THEMES.corporate;
    const theme = customLabels
        ? {
            ...baseTheme,
            memberLabel: customLabels.member_label || baseTheme.memberLabel,
            memberLabelPlural: customLabels.member_label_plural || baseTheme.memberLabelPlural,
            idLabel: customLabels.id_label || baseTheme.idLabel,
            groupLabel: customLabels.group_label || baseTheme.groupLabel,
            namePlaceholder: customLabels.name_placeholder || baseTheme.namePlaceholder,
            idPlaceholder: customLabels.id_placeholder || baseTheme.idPlaceholder,
            groupPlaceholder: customLabels.group_placeholder || baseTheme.groupPlaceholder,
        }
        : baseTheme;

    return (
        <ThemeContext.Provider
            value={{
                themeId,
                theme,
                setThemeId,
                clearTheme,
                customLabels,
                setCustomLabels,
                // backward compat aliases
                occupationType: themeId,
                occupation: theme,
                setOccupationType: setThemeId,
                clearOccupation: clearTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
