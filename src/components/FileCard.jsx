import { Folder } from 'lucide-react';

export function FileCard({ file, noteCount, onClick }) {
  return (
    <div className="file-block-card" onClick={() => onClick && onClick(file.id)}>
      <div 
        className="file-card-icon" 
        style={{ 
          backgroundColor: file.color || '#e2e8f0', 
          color: file.textColor || '#0f172a' 
        }}
      >
        <Folder size={20} />
      </div>
      <div className="file-card-info" style={{ minWidth: 0, flex: 1 }}>
        <h4 style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {file.name}
        </h4>
        <p>{noteCount} Notes</p>
      </div>
    </div>
  );
}