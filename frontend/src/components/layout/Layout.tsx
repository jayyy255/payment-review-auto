import React from 'react';
import { ActivePage } from '../../types/ui';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  activePage: ActivePage;
  onSelectPage: (page: ActivePage) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ activePage, onSelectPage, children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Header />
      <div style={{ display: 'flex', flexGrow: 1 }}>
        <Sidebar activePage={activePage} onSelectPage={onSelectPage} />
        <main
          style={{
            flexGrow: 1,
            padding: '24px 32px',
            maxWidth: '1400px',
            width: '100%',
            margin: '0 auto',
            overflowY: 'auto',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
