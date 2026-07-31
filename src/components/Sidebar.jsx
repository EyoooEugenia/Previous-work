import React, { useState } from 'react';
import { 
  Home, 
  Folder, 
  ChevronDown, 
  ChevronRight, 
  BarChart2, 
  Settings, 
  Plus,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import '../styles/sidebar.css';

export function Sidebar({ 
  activeModule, 
  onModuleChange, 
  files = [], 
  activeFileId, 
  onSelectFile, 
  onOpenFileManager 
}) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isNotesExpanded, setIsNotesExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <aside className={`sidebar ${isSidebarExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-header">
        {isSidebarExpanded && <h2 className="sidebar-logo">Hub</h2>}
        <button 
          type="button" 
          className="sidebar-toggle-btn"
          onClick={toggleSidebar}
          title={isSidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isSidebarExpanded ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        <button
          type="button"
          className={`nav-item ${activeModule === 'HOME' ? 'active' : ''}`}
          onClick={() => {
            onModuleChange('HOME');
            onSelectFile(null);
          }}
          title="Home"
        >
          <div className="nav-item-content">
            <Home size={20} />
            {isSidebarExpanded && <span>Home</span>}
          </div>
        </button>

        <div className="nav-group">
          <button
            type="button"
            className={`nav-item ${activeModule === 'NOTES' && activeFileId === undefined ? 'active' : ''}`}
            onClick={() => {
              onModuleChange('NOTES');
              onSelectFile(undefined);
            }}
            title="Notes"
          >
            <div className="nav-item-content">
              <Folder size={20} />
              {isSidebarExpanded && <span>Notes</span>}
            </div>
            {isSidebarExpanded && (
              <span
                className="expand-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsNotesExpanded(!isNotesExpanded);
                }}
              >
                {isNotesExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </span>
            )}
          </button>

          {isSidebarExpanded && isNotesExpanded && (
            <div className="sub-nav-list">
              {files.map((file) => {
                const dotColor = file.color || '#0d9488';
                const isActive = activeModule === 'NOTES' && String(activeFileId) === String(file.id);

                return (
                  <button
                    key={file.id}
                    type="button"
                    className={`sub-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      onModuleChange('NOTES');
                      onSelectFile(file.id);
                    }}
                    title={file.name}
                  >
                    <span className="file-dot" style={{ backgroundColor: dotColor }} />
                    <span className="file-name">
                      {file.name}
                    </span>
                  </button>
                );
              })}
              <button
                type="button"
                className="sub-nav-item add-file-sub-btn"
                onClick={onOpenFileManager}
              >
                <Plus size={14} />
                <span>Manage Files</span>
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          className={`nav-item ${activeModule === 'ANALYTICS' ? 'active' : ''}`}
          onClick={() => {
            onModuleChange('ANALYTICS');
            onSelectFile(null);
          }}
          title="Analytics"
        >
          <div className="nav-item-content">
            <BarChart2 size={20} />
            {isSidebarExpanded && <span>Analytics</span>}
          </div>
        </button>

        <button
          type="button"
          className={`nav-item ${activeModule === 'SETTINGS' ? 'active' : ''}`}
          onClick={() => {
            onModuleChange('SETTINGS');
            onSelectFile(null);
          }}
          title="Settings"
        >
          <div className="nav-item-content">
            <Settings size={20} />
            {isSidebarExpanded && <span>Settings</span>}
          </div>
        </button>
      </nav>
    </aside>
  );
}