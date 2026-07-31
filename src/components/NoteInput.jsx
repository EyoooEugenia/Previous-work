import { useState, useEffect } from 'react';
import { FolderCog, Tags } from 'lucide-react';
import { TextEditor } from './TextEditor';

export function NoteInput({ 
  files = [], 
  tags = [], 
  onSave, 
  defaultFileId = null, 
  onOpenFileManager, 
  onOpenTagManager 
}) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [selectedFileId, setSelectedFileId] = useState(defaultFileId);
  const [selectedTag, setSelectedTag] = useState('');

  useEffect(() => {
    setSelectedFileId(defaultFileId);
  }, [defaultFileId]);

  const getFallbackTitle = () => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    return `Untitled - ${dateStr}`;
  };

  const handleSave = () => {
    if (!text.trim() && !title.trim()) return;

    const finalTitle = title.trim() ? title.trim() : getFallbackTitle();
    
    onSave({
      title: finalTitle,
      blocks: [{ type: 'text', content: text }],
      fileId: selectedFileId || null,
      tag: selectedTag || null
    });
    
    setTitle('');
    setText('');
    setSelectedFileId(defaultFileId);
    setSelectedTag('');
  };

  return (
    <div className="input-box">
      <div className="blocks-editor">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="title-input-field"
        />

        <TextEditor 
          value={text}
          onChange={setText}
          placeholder="What's on your mind?"
        />
      </div>
      
      <div className="input-actions">
        <div className="action-select-wrapper">
          <select 
            value={selectedFileId || ''} 
            onChange={(e) => setSelectedFileId(e.target.value || null)}
          >
            <option value="">(Optional) Select File</option>
            {files.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <button 
            type="button" 
            className="manage-btn icon-btn" 
            onClick={onOpenFileManager}
            title="File Management"
          >
            <FolderCog size={16} />
          </button>
        </div>

        <div className="action-select-wrapper">
          <select 
            value={selectedTag} 
            onChange={(e) => setSelectedTag(e.target.value)}
          >
            <option value="">(Optional) Select Tag</option>
            {tags.map(t => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
          </select>
          <button 
            type="button" 
            className="manage-btn icon-btn" 
            onClick={onOpenTagManager}
            title="Tag Management"
          >
            <Tags size={16} />
          </button>
        </div>
        
        <button type="button" className="save-btn" onClick={handleSave}>
          Save Note
        </button>
      </div>
    </div>
  );
}