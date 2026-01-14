import React from 'react';
import Sidebar from './Sidebar';

const MainLayout = ({ children, activeItem, onItemClick }) => {
  return (
    <div className="main-layout-root">
      <style>{`
                /* Font Imports - Inter as primary */
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                
                :root {
                  --font-primary: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
                                  Roboto, "Helvetica Neue", Arial, sans-serif;
                  
                  --fs-xxs: 0.65rem;  /* 10px */
                  --fs-xs:  0.75rem;  /* 12px */
                  --fs-sm:  0.8125rem;/* 13px */
                  --fs-md:  0.875rem; /* 14px */
                  --fs-lg:  1rem;     /* 16px */
                  --fs-xl:  1.125rem; /* 18px */
                  --fs-2xl: 1.25rem;  /* 20px */
                }

                html { 
                  font-size: 16px; 
                }

                body {
                    font-family: var(--font-primary);
                    font-size: var(--fs-md);
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    -webkit-font-smoothing: antialiased;
                    color: #334155;
                }

                input, textarea, select, button, .dashboard-container {
                  font-family: var(--font-primary);
                }

                /* Global Form Modal Overlay */
                .form-modal-overlay {
                  position: fixed;
                  inset: 0;
                  background: rgba(0, 0, 0, 0.55);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  z-index: 9999;
                  backdrop-filter: blur(2px);
                }

                .form-modal-container {
                  background: #ffffff;
                  width: 90%;
                  max-width: 1100px;
                  max-height: 90vh;
                  border-radius: 14px;
                  display: flex;
                  flex-direction: column;
                  overflow: hidden;
                  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                  animation: modalScaleIn 0.2s ease-out;
                }

                @keyframes modalScaleIn {
                  from { opacity: 0; transform: scale(0.95); }
                  to { opacity: 1; transform: scale(1); }
                }

                .form-modal-header {
                  padding: 18px 24px;
                  border-bottom: 1px solid #e5e7eb;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  background: #ffffff;
                }

                .form-modal-header-title {
                  font-size: var(--fs-xl);
                  font-weight: 600;
                  color: #111827;
                }

                .form-modal-close {
                  background: transparent;
                  border: none;
                  color: #6b7280;
                  cursor: pointer;
                  padding: 4px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  border-radius: 6px;
                  transition: all 0.2s;
                }

                .form-modal-close:hover {
                  background: #f3f4f6;
                  color: #111827;
                }

                .form-modal-body {
                  padding: 24px;
                  overflow-y: auto;
                  flex: 1;
                  background: #ffffff;
                }

                .form-modal-footer {
                  padding: 16px 24px;
                  border-top: 1px solid #e5e7eb;
                  display: flex;
                  justify-content: flex-end;
                  gap: 12px;
                  background: #f9fafb;
                }

                /* Usage Rules */
                table, th, td {
                  font-size: var(--fs-sm);
                }
                th {
                  font-weight: 600;
                }

                .section-title {
                  font-size: var(--fs-md) !important;
                  font-weight: 600 !important;
                }
                
                .card-title, h2 {
                  font-size: var(--fs-xl) !important;
                  font-weight: 600 !important;
                }

                label {
                  font-size: var(--fs-sm);
                  font-weight: 600;
                }

                input, select, textarea {
                  font-size: var(--fs-sm);
                }

                .text-sm, .hint, .subtext, .hint-text {
                  font-size: var(--fs-xs) !important;
                  color: #6b7280;
                }

                /* Global Checkbox Style */
                input[type="checkbox"] {
                  appearance: none;
                  -webkit-appearance: none;
                  width: 14px;
                  height: 14px;
                  border: 1.5px solid #9ca3af;
                  border-radius: 3px;
                  background: #ffffff;
                  cursor: pointer;
                  display: grid;
                  place-content: center;
                  transition: border-color 0.1s ease-in-out;
                  margin: 0;
                  padding: 0;
                }

                input[type="checkbox"]::before {
                  content: "";
                  width: 8px;
                  height: 8px;
                  transform: scale(0);
                  transition: transform 0.1s ease-in-out;
                  background-color: #21808d;
                  clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
                }

                input[type="checkbox"]:checked::before {
                  transform: scale(1);
                }

                input[type="checkbox"]:hover {
                  border-color: #21808d;
                }

                /* Table Layout Root Defaults */
                .table-wrapper {
                  background: #ffffff;
                  border-radius: 14px;
                  border: 1px solid #e5e7eb;
                  overflow: hidden;
                  margin-bottom: 24px;
                }

                table {
                  width: 100%;
                  border-collapse: collapse;
                }
                .main-layout-root {
                    display: flex;
                    min-height: 100vh;
                    background: #f8fafc;
                }
                .main-content-wrapper {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                    height: 100vh;
                    overflow: hidden;
                }
                .main-header {
                    height: 56px;
                    background: white;
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    padding: 0 20px;
                    gap: 16px;
                    flex-shrink: 0;
                }
                .main-content {
                    padding: 24px;
                    overflow-y: auto;
                    flex: 1;
                }

                /* Responsive Scaling */
                @media (max-width: 768px) {
                  html { font-size: 15px; }
                  .main-layout-root {
                      flex-direction: column;
                  }
                  .main-content-wrapper {
                      height: auto;
                      min-height: 0;
                      flex: 1;
                      overflow: visible;
                  }
                  .main-content {
                      padding: 12px;
                      overflow: visible;
                  }
                }

                @media (max-width: 480px) {
                  html { font-size: 14px; }
                }
            `}</style>

      <Sidebar activeItem={activeItem} onItemClick={onItemClick} />

      <div className="main-content-wrapper">
        {/* Top Header */}
        <header className="main-header">
          <div style={{ fontSize: 'var(--fs-xs)', color: '#64748b' }}>
            {new Date().toLocaleString('en-IN', { dateStyle: 'medium' })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#006064',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--fs-xs)',
              fontWeight: 'bold'
            }}>E</div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
              <span style={{ fontSize: 'var(--fs-xs)', fontWeight: '600', color: '#334155' }}>Employee One</span>
            </div>
          </div>
          <button style={{
            border: '1px solid #e2e8f0',
            background: 'white',
            padding: '4px 12px',
            borderRadius: '4px',
            fontSize: 'var(--fs-xxs)',
            cursor: 'pointer',
            color: '#475569'
          }}>Logout</button>
        </header>

        <main className="main-content">
          {children}
        </main>
      </div>
    </div >
  );
};

export default MainLayout;
