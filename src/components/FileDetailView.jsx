import { useState } from 'react';
import { ArrowLeft, Plus, LayoutGrid, List, Search, X, Tags } from 'lucide-react';
import { NoteCard } from './NoteCard';
import { NoteInput } from './NoteInput';
import { FileCard } from './FileCard';
import '../styles/file-matrix.css';

export function FileDetailView({
  activeFileId,
  files = [],
  notes = [],
  tags = [],
  onBack,
  onSelectFile,
  handleAddNote,
  handleDeleteNote,
  handleUpdateNote,
  getTagDetails,
  getFileDetails,
  onOpenFileManager,
  getFilteredNotes
}) {
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState('matrix');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const safeFiles = files || [];
  const safeNotes = notes || [];
  const safeTags = tags || [];

  const activeFile = activeFileId === null
    ? { id: null, name: 'Unclassified', color: '#f1f5f9', textColor: '#64748b' }
    : safeFiles.find((f) => String(f.id) === String(activeFileId));

  const parentFile = activeFile?.parentId ? safeFiles.find((f) => String(f.id) === String(activeFile.parentId)) : null;

  const subFiles = activeFileId === null ? [] : safeFiles.filter((f) => String(f.parentId) === String(activeFileId));
  const baseNotes = getFilteredNotes ? getFilteredNotes(activeFileId, false) : safeNotes.filter((n) => String(n?.fileId) === String(activeFileId));

  const displayedNotes = (baseNotes || []).filter((note) => {
    if (!note) return false;

    if (selectedTag) {
      if (note.tag !== selectedTag) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const titleMatch = note.title ? note.title.toLowerCase().includes(q) : false;
      const contentMatch = note.content ? note.content.toLowerCase().includes(q) : false;
      
      let blocksMatch = false;
      if (note.blocks && Array.isArray(note.blocks)) {
        blocksMatch = note.blocks.some(b => b && b.content && String(b.content).toLowerCase().includes(q));
      }

      if (!titleMatch && !contentMatch && !blocksMatch) return false;
    }

    return true;
  });

  const handleBackClick = () => {
    if (parentFile) {
      onSelectFile(parentFile.id);
    } else {
      onBack();
    }
  };

  return (
    <div className="file-detail-view">
      <div className="file-detail-action-bar">
        <button
          type="button"
          className="action-btn back-btn"
          onClick={handleBackClick}
          title={parentFile ? `Back to ${parentFile.name}` : 'Back to Notes'}
        >
          <ArrowLeft size={16} style={{ flexShrink: 0 }} />
          <span className="back-btn-text">
            {parentFile ? `Back to ${parentFile.name}` : 'Back to Notes'}
          </span>
        </button>

        <div className="add-action-wrapper">
          <button
            type="button"
            className="action-btn add-btn"
            onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
          >
            <Plus size={16} />
          </button>

          {isAddMenuOpen && (
            <div className="add-dropdown-menu">
              <button
                type="button"
                className="dropdown-option"
                onClick={() => {
                  setShowNoteInput(true);
                  setIsAddMenuOpen(false);
                }}
              >
                Add Note
              </button>
              <button
                type="button"
                className="dropdown-option"
                onClick={() => {
                  if (onOpenFileManager) onOpenFileManager(activeFileId);
                  setIsAddMenuOpen(false);
                }}
              >
                Add Subfolder
              </button>
            </div>
          )}
        </div>

        <div className="action-bar-search">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="file-search-input"
            placeholder="Search title/content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="action-bar-tag-select-wrapper">
          <Tags size={16} className="tag-select-icon" />
          <select
            className="file-tag-select"
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
          >
            <option value="">All Tags</option>
            {safeTags.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="view-toggle-group">
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'matrix' ? 'active' : ''}`}
            onClick={() => setViewMode('matrix')}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {subFiles.length > 0 && (
        <div className={`files-display-container mode-${viewMode}`} style={{ marginBottom: '20px' }}>
          {subFiles.map((subFile) => {
            const count = safeNotes.filter((n) => String(n?.fileId) === String(subFile.id)).length;
            return (
              <FileCard
                key={subFile.id}
                file={subFile}
                noteCount={count}
                onClick={() => onSelectFile(subFile.id)}
              />
            );
          })}
        </div>
      )}

      {showNoteInput && (
        <section className="input-section" style={{ marginBottom: '20px' }}>
          <NoteInput
            onSave={(noteData) => {
              handleAddNote(noteData);
              setShowNoteInput(false);
            }}
            tags={safeTags}
            files={safeFiles}
            defaultFileId={activeFileId}
            onOpenFileManager={() => onOpenFileManager && onOpenFileManager(activeFileId)}
          />
        </section>
      )}

      <section className="list-section">
        {displayedNotes.length === 0 ? (
          <div className="empty-file-tip">
            {searchQuery || selectedTag ? 'No matching notes found.' : 'No notes in this file yet.'}
          </div>
        ) : (
          displayedNotes.map((item) => (
            <NoteCard
              key={item.id}
              note={item}
              onDelete={handleDeleteNote}
              onUpdate={handleUpdateNote}
              getTagDetails={getTagDetails}
              tags={safeTags}
              getFileDetails={getFileDetails}
              files={safeFiles}
            />
          ))
        )}
      </section>
    </div>
  );
}