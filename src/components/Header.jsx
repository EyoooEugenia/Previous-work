import React from 'react';
import '../styles/header.css';

export function Header({ activeModule, activeFile, files = [] }) {
  const getBreadcrumbChain = (file) => {
    if (!file) return [];
    const chain = [];
    let current = file;
    while (current) {
      chain.unshift(current);
      if (!current.parentId) break;
      current = files.find((f) => String(f.id) === String(current.parentId));
    }
    return chain;
  };

  const breadcrumbs = activeFile ? getBreadcrumbChain(activeFile) : [];

  return (
    <header className="app-header">
      <div className="header-title-container">
        <h1 className="header-main-title">Productivity Hub</h1>

        {activeModule === 'HOME' && (
          <span className="header-breadcrumb">
            <span className="breadcrumb-muted">/</span>
            <span className="breadcrumb-active">Home</span>
          </span>
        )}

        {activeModule === 'NOTES' && !activeFile && (
          <span className="header-breadcrumb">
            <span className="breadcrumb-muted">/</span>
            <span className="breadcrumb-active">Notes</span>
          </span>
        )}

        {activeModule === 'NOTES' && activeFile && (
          <span className="header-breadcrumb">
            <span className="breadcrumb-muted">/ Notes</span>
            {breadcrumbs.map((f, index) => {
              const isCurrent = index === breadcrumbs.length - 1;
              return (
                <React.Fragment key={f.id}>
                  <span className="breadcrumb-muted">/</span>
                  <span
                    className={isCurrent ? 'breadcrumb-active' : 'breadcrumb-muted'}
                    title={f.name}
                  >
                    {f.name}
                  </span>
                </React.Fragment>
              );
            })}
          </span>
        )}

        {activeModule === 'ANALYTICS' && (
          <span className="header-breadcrumb">
            <span className="breadcrumb-muted">/</span>
            <span className="breadcrumb-active">Analytics</span>
          </span>
        )}

        {activeModule === 'SETTINGS' && (
          <span className="header-breadcrumb">
            <span className="breadcrumb-muted">/</span>
            <span className="breadcrumb-active">Settings</span>
          </span>
        )}
      </div>
    </header>
  );
}