import { useState } from 'react';
import { TextEditor } from './TextEditor';

export function NoteCard({ 
  note, 
  onDelete, 
  onUpdate, 
  getTagDetails, 
  getFileDetails,
  tags = [], 
  files = [] 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(note.title || '');
  const [editedTag, setEditedTag] = useState(note.tag || '');
  const [editedFileId, setEditedFileId] = useState(note.fileId || '');
  const [editedBlocks, setEditedBlocks] = useState(note.blocks || []);

  const currentTag = isEditing ? editedTag : note.tag;
  const tagInfo = (currentTag && getTagDetails)
    ? getTagDetails(currentTag)
    : { color: '#e6fffa', textColor: '#234e52' };

  const currentFileId = isEditing ? editedFileId : note.fileId;
  
  const fileInfo = currentFileId
    ? (files.find((f) => String(f.id) === String(currentFileId) || f.name === currentFileId) || 
       (getFileDetails ? getFileDetails(currentFileId) : null))
    : null;

  const handleStartEdit = () => {
    setEditedTitle(note.title || '');
    setEditedTag(note.tag || '');
    setEditedFileId(note.fileId || '');
    setEditedBlocks(JSON.parse(JSON.stringify(note.blocks || [])));
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const getFallbackTitle = () => {
    return `Untitled - ${note.displayTime || note.createdAt || 'Date'}`;
  };

  const handleSaveEdit = () => {
    onUpdate(note.id, {
      title: editedTitle.trim() ? editedTitle.trim() : getFallbackTitle(),
      tag: editedTag || null,
      fileId: editedFileId || null,
      blocks: editedBlocks,
    });
    setIsEditing(false);
  };

  const handleBlockContentChange = (idx, newHtml) => {
    setEditedBlocks((prev) =>
      prev.map((block, i) => (i === idx ? { ...block, content: newHtml } : block))
    );
  };

  const handleRemoveBlock = (idx) => {
    setEditedBlocks((prev) => prev.filter((_, i) => i !== idx));
  };

  const displayTitle = note.title && note.title.trim() !== '' 
    ? note.title 
    : getFallbackTitle();

  return (
    <div className={`note-card ${isEditing ? 'editing-mode' : ''}`}>
      <div className="card-header">
        <div className="card-badges-group" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {isEditing ? (
            <>
              <select
                className="edit-tag-select"
                value={editedTag}
                onChange={(e) => setEditedTag(e.target.value)}
              >
                <option value="">None (No Tag)</option>
                {tags.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>

              <select
                className="edit-file-select"
                value={editedFileId}
                onChange={(e) => setEditedFileId(e.target.value)}
              >
                <option value="">None (No File)</option>
                {files.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <>
              {note.tag && (
                <span
                  className="tag-badge"
                  style={{ backgroundColor: tagInfo.color, color: tagInfo.textColor }}
                >
                  {note.tag}
                </span>
              )}

              {fileInfo && (
                <span
                  className="file-badge"
                  style={{
                    backgroundColor: fileInfo.color || '#e0e7ff',
                    color: fileInfo.textColor || '#3730a3',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
                >
                  {fileInfo.name}
                </span>
              )}
            </>
          )}
        </div>

        <div className="card-header-right">
          <span className="card-time">
            {note.displayTime || note.createdAt}
          </span>

          {!isEditing ? (
            <>
              <button
                className="edit-btn"
                onClick={handleStartEdit}
                title="Edit Note"
              >
                Edit
              </button>
              <button
                className="delete-btn"
                onClick={() => onDelete(note.id)}
                title="Delete Note"
              >
                ✕
              </button>
            </>
          ) : (
            <div className="edit-card-actions">
              <button className="cancel-edit-btn" onClick={handleCancelEdit}>
                Cancel
              </button>
              <button className="save-edit-btn" onClick={handleSaveEdit}>
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card-title-container">
        {isEditing ? (
          <input
            type="text"
            className="edit-title-input"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            placeholder="Note Title..."
          />
        ) : (
          <h3 className="card-title">{displayTitle}</h3>
        )}
      </div>

      <div className="card-blocks-content">
        {(isEditing ? editedBlocks : note.blocks || []).map((block, idx) => {
          if (block.type === 'text') {
            return isEditing ? (
              <div key={idx} className="edit-block-wrapper">
                <TextEditor
                  value={block.content}
                  onChange={(html) => handleBlockContentChange(idx, html)}
                  placeholder="Edit text..."
                />
              </div>
            ) : (
              <div
                key={idx}
                className="card-text rich-card-text"
                dangerouslySetInnerHTML={{ __html: block.content }}
              />
            );
          }

          if (block.type === 'file' && block.file) {
            const isImage = block.file.type?.startsWith('image/');

            return (
              <div key={idx} className="card-file-block">
                {isEditing && (
                  <button
                    type="button"
                    className="remove-file-block-btn"
                    onClick={() => handleRemoveBlock(idx)}
                    title="Remove attachment"
                  >
                    ✕
                  </button>
                )}

                {isImage ? (
                  <div className="image-block-wrapper">
                    <img
                      src={block.file.url}
                      alt={block.file.name}
                      className="inline-card-img"
                    />
                    <a
                      href={block.file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="image-btn-link"
                    >
                      Open({block.file.name})
                    </a>
                  </div>
                ) : (
                  <a
                    href={block.file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="doc-file-link"
                  >
                    {block.file.name}
                  </a>
                )}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}