import { FolderPlus, Inbox } from 'lucide-react';
import { FileCard } from './FileCard';
import '../styles/file-matrix.css';

export function FileMatrix({ files = [], notes = [], onSelectFile, onOpenFileManager }) {
  const safeFiles = Array.isArray(files) ? files : [];
  const safeNotes = Array.isArray(notes) ? notes : [];

  const rootFiles = safeFiles.filter((f) => f && !f.parentId);

  return (
    <div className="file-matrix-view">
      <div className="file-matrix-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>All Files</h2>
        <button 
          className="add-file-btn"
          onClick={() => onOpenFileManager && onOpenFileManager(null)}
        >
          <FolderPlus size={18} />
          New File
        </button>
      </div>

      <div className="files-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        <div 
          className="file-block-card unclassified-card"
          style={{ borderColor: '#cbd5e1', cursor: 'pointer', padding: '12px', border: '1px dashed', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}
          onClick={() => onSelectFile && onSelectFile(null)}
        >
          <div 
            className="file-card-icon"
            style={{ backgroundColor: '#f1f5f9', color: '#64748b', padding: '8px', borderRadius: '6px', display: 'flex' }}
          >
            <Inbox size={24} />
          </div>
          <div className="file-card-info">
            <h4 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>Unclassified</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
              {safeNotes.filter((n) => n && !n.fileId).length} Notes
            </p>
          </div>
        </div>

        {rootFiles.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            noteCount={safeNotes.filter((n) => n && String(n.fileId) === String(file.id)).length}
            onClick={onSelectFile}
          />
        ))}
      </div>
    </div>
  );
}