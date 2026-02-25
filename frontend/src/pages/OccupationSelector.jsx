import React, { useState } from 'react';
import { useTheme, OCCUPATIONS } from '../context/ThemeContext';
import './OccupationSelector.css';

export default function OccupationSelector() {
    const { setOccupationType } = useTheme();
    const [hovered, setHovered] = useState(null);

    const cards = Object.values(OCCUPATIONS);

    return (
        <div className="selector-root">
            {/* Ambient background blobs */}
            <div className="blob blob-1" />
            <div className="blob blob-2" />
            <div className="blob blob-3" />

            <div className="selector-container">
                {/* Header */}
                <div className="selector-header">
                    <div className="selector-logo">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <rect width="32" height="32" rx="10" fill="url(#lg)" />
                            <path d="M8 16h16M16 8v16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                            <defs>
                                <linearGradient id="lg" x1="0" y1="0" x2="32" y2="32">
                                    <stop stopColor="#6366f1" />
                                    <stop offset="1" stopColor="#8b5cf6" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <span>AttendTrack</span>
                    </div>
                    <div className="selector-badge">Powered by AI</div>
                </div>

                {/* Hero text */}
                <div className="selector-hero">
                    <h1 className="selector-title">
                        Smart Attendance,<br />
                        <span className="gradient-text">Built for Every Sector</span>
                    </h1>
                    <p className="selector-subtitle">
                        Choose your occupation type to get a tailored attendance experience — with the right terminology, theme, and workflow for your organization.
                    </p>
                </div>

                {/* Occupation cards */}
                <div className="occupation-grid">
                    {cards.map((occ) => (
                        <button
                            key={occ.id}
                            className={`occ-card occ-${occ.id} ${hovered === occ.id ? 'hovered' : ''}`}
                            onMouseEnter={() => setHovered(occ.id)}
                            onMouseLeave={() => setHovered(null)}
                            onClick={() => setOccupationType(occ.id)}
                        >
                            <div className="occ-glow" style={{ background: occ.gradient }} />
                            <div className="occ-content">
                                <div className="occ-emoji-wrap" style={{ background: occ.gradient }}>
                                    <span className="occ-emoji">{occ.emoji}</span>
                                </div>
                                <div className="occ-text">
                                    <h3 className="occ-name">{occ.fullName}</h3>
                                    <p className="occ-tagline">{occ.tagline}</p>
                                </div>
                                <div className="occ-pills">
                                    <span className="occ-pill">{occ.memberLabelPlural}</span>
                                    <span className="occ-pill">{occ.groupLabel}</span>
                                </div>
                            </div>
                            <div className="occ-arrow" style={{ color: occ.accentColor }}>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M5 10h10M11 6l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Footer */}
                <p className="selector-footer">
                    Your preference is saved locally. You can switch anytime from the sidebar.
                </p>
            </div>
        </div>
    );
}
