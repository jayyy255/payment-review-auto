import React from 'react';
import {
  Activity,
  BarChart3,
  BookOpen,
  CheckSquare,
  FileSearch,
  Info,
  Layers,
} from 'lucide-react';
import { ActivePage } from '../../types/ui';

interface SidebarProps {
  activePage: ActivePage;
  onSelectPage: (page: ActivePage) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onSelectPage }) => {
  const navItems = [
    { id: 'dashboard' as ActivePage, label: 'Overview', icon: <BarChart3 size={18} /> },
    { id: 'analysis' as ActivePage, label: 'Payment Analysis', icon: <FileSearch size={18} /> },
    { id: 'queue' as ActivePage, label: 'Review Queue', icon: <CheckSquare size={18} /> },
    { id: 'rules' as ActivePage, label: 'Risk Rules', icon: <BookOpen size={18} /> },
    { id: 'compare' as ActivePage, label: 'Scenario Comparison', icon: <Layers size={18} /> },
    { id: 'activity' as ActivePage, label: 'API Activity', icon: <Activity size={18} /> },
    { id: 'system' as ActivePage, label: 'System Information', icon: <Info size={18} /> },
  ];

  return (
    <aside
      style={{
        width: '240px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      <div style={{ padding: '16px 12px', flexGrow: 1 }}>
        <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 12px 8px' }}>
          Operations Console
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectPage(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  fontWeight: isActive ? 600 : 500,
                  backgroundColor: isActive ? '#eff6ff' : 'transparent',
                  color: isActive ? '#1d4ed8' : '#475569',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease, color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.color = '#0f172a';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#475569';
                  }
                }}
              >
                <span style={{ color: isActive ? '#2563eb' : '#64748b' }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Integration readiness footer */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          fontSize: '0.75rem',
          color: '#64748b',
        }}
      >
        <div style={{ fontWeight: 600, color: '#334155', marginBottom: '2px' }}>
          Intelligent Automation
        </div>
        <div>Ready for Power Automate & Dataverse connectors</div>
      </div>
    </aside>
  );
};
