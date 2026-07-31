import { useState, useEffect } from 'react';
import { X, Folder, Trash2, Plus, AlertTriangle, Pencil, Check } from 'lucide-react';
import '../styles/modal.css';

function getContrastTextColor(hex) {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return '#ffffff';
  const cleanHex = hex.replace('#', '');
  const fullHex = cleanHex.length === 3 
    ? cleanHex.split('').map((c) => c + c).join('') 
    : cleanHex;
  const r = parseInt(fullHex.substring(0, 2), 16) || 0;
  const g = parseInt(fullHex.substring(2, 4), 16) || 0;
  const b = parseInt(fullHex.substring(4, 6), 16) || 0;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 160 ? '#0f172a' : '#ffffff';
}

export function FileManagerModal({
  isOpen,
  onClose,
  files = [],
  notes = [],
  onAddFile,
  onUpdateFile,
  onDeleteFile,
  defaultParentId = null,
  onFileCreated
}) {
  const safeFiles = Array.isArray(files) ? files : [];
  const safeNotes = Array.isArray(notes) ? notes : [];

  const [fileName, setFileName] = useState('');
  const [fileColor, setFileColor] = useState('#3b82f6');
  const [parentId, setParentId] = useState(
    defaultParentId !== null && defaultParentId !== undefined ? String(defaultParentId) : ''
  );
  const [editingFileId, setEditingFileId] = useState(null);

  const [deletingTarget, setDeletingTarget] = useState(null);
  const [deleteOption, setDeleteOption] = useState('PARENT');
  const [specificFolderId, setSpecificFolderId] = useState('');

  useEffect(() => {
    if (isOpen) {
      setParentId(defaultParentId !== null && defaultParentId !== undefined ? String(defaultParentId) : '');
      setFileName('');
      setFileColor('#3b82f6');
      setEditingFileId(null);
      setDeletingTarget(null);
      setDeleteOption('PARENT');
      setSpecificFolderId('');
    }
  }, [isOpen, defaultParentId]);

  if (!isOpen) return null;

  const handleStartEdit = (file) => {
    if (!file) return;
    setEditingFileId(String(file.id));
    setFileName(file.name || '');
    setFileColor(file.color || '#3b82f6');
    setParentId(file.parentId !== null && file.parentId !== undefined ? String(file.parentId) : '');
  };

  const handleCancelEdit = () => {
    setEditingFileId(null);
    setFileName('');
    setFileColor('#3b82f6');
    setParentId(defaultParentId !== null && defaultParentId !== undefined ? String(defaultParentId) : '');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    const computedTextColor = getContrastTextColor(fileColor);

    if (editingFileId) {
      if (onUpdateFile) {
        onUpdateFile(editingFileId, {
          name: fileName.trim(),
          color: fileColor,
          textColor: computedTextColor,
          parentId: parentId ? parentId : null
        });
      }
      handleCancelEdit();
    } else {
      const created = onAddFile && onAddFile({
        name: fileName.trim(),
        color: fileColor,
        textColor: computedTextColor,
        parentId: parentId || null
      });

      if (created && onFileCreated) {
        onFileCreated(created.id);
      }
      setFileName('');
    }
  };

  const handleStartDelete = (f) => {
    if (!f) return;
    const noteCount = safeNotes.filter((n) => n && String(n.fileId) === String(f.id)).length;
    const subFileCount = safeFiles.filter((sub) => sub && String(sub.parentId) === String(f.id)).length;

    const otherFolders = safeFiles.filter((item) => item && String(item.id) !== String(f.id));
    
    if (noteCount > 0 || subFileCount > 0) {
      setDeletingTarget({ file: f, noteCount, subFileCount });
      setDeleteOption('PARENT');
      setSpecificFolderId(otherFolders.length > 0 ? String(otherFolders[0].id) : '');
    } else {
      if (onDeleteFile) onDeleteFile(f.id, 'DELETE_FILE_ONLY');
    }
  };

  const handleConfirmDelete = () => {
    if (!deletingTarget || !onDeleteFile) return;

    let actionType = 'MOVE_TO_PARENT';
    let targetId = null;

    if (deleteOption === 'PARENT') {
      actionType = 'MOVE_TO_PARENT';
    } else if (deleteOption === 'UNCLASSIFIED') {
      actionType = 'MOVE_TO_UNCLASSIFIED';
    } else if (deleteOption === 'SPECIFIC') {
      actionType = 'MOVE_TO_SPECIFIC';
      targetId = specificFolderId || null;
    } else if (deleteOption === 'CASCADE') {
      actionType = 'CASCADE_DELETE';
    }

    onDeleteFile(deletingTarget.file.id, actionType, targetId);
    setDeletingTarget(null);
  };

  const getParentName = (file) => {
    if (!file || !file.parentId) return 'Unclassified (Root)';
    const parent = safeFiles.find((f) => f && String(f.id) === String(file.parentId));
    return parent ? parent.name : 'Unclassified (Root)';
  };

  const getDescendantIds = (targetId) => {
    const descendants = new Set();
    const stack = [String(targetId)];
    while (stack.length > 0) {
      const curr = stack.pop();
      safeFiles.forEach((f) => {
        if (f && String(f.parentId) === curr) {
          descendants.add(String(f.id));
          stack.push(String(f.id));
        }
      });
    }
    return descendants;
  };

  const invalidParentIds = editingFileId
    ? new Set([editingFileId, ...Array.from(getDescendantIds(editingFileId))])
    : new Set();

  const selectableParents = safeFiles.filter((f) => f && !invalidParentIds.has(String(f.id)));

  const availableFolders = safeFiles.filter(
    (f) => f && deletingTarget && String(f.id) !== String(deletingTarget.file.id)
  );

  const previewTextColor = getContrastTextColor(fileColor);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Manage Files</h3>
          <button type="button" className="close-modal-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {deletingTarget ? (
          <div className="delete-warning-box">
            <div className="delete-warning-header">
              <AlertTriangle size={20} />
              <span>Delete Folder Options</span>
            </div>
            <p className="delete-warning-text">
              <strong>{deletingTarget.file.name}</strong> contains {deletingTarget.noteCount} note(s){' '}
              {deletingTarget.subFileCount > 0 ? `and ${deletingTarget.subFileCount} subfolder(s)` : ''}. Choose what to
              do with its contents:
            </p>

            <div className="delete-options-list">
              <label className="delete-option-label">
                <input
                  type="radio"
                  name="deleteOption"
                  value="PARENT"
                  checked={deleteOption === 'PARENT'}
                  onChange={() => setDeleteOption('PARENT')}
                />
                <span>Move contents to parent: <strong>{getParentName(deletingTarget.file)}</strong></span>
              </label>

              <label className="delete-option-label">
                <input
                  type="radio"
                  name="deleteOption"
                  value="UNCLASSIFIED"
                  checked={deleteOption === 'UNCLASSIFIED'}
                  onChange={() => setDeleteOption('UNCLASSIFIED')}
                />
                <span>Move contents to <strong>Unclassified (Root)</strong></span>
              </label>

              <label className="delete-option-label">
                <div className="delete-option-inline">
                  <input
                    type="radio"
                    name="deleteOption"
                    value="SPECIFIC"
                    checked={deleteOption === 'SPECIFIC'}
                    onChange={() => setDeleteOption('SPECIFIC')}
                    disabled={availableFolders.length === 0}
                  />
                  <span>Move contents to a specific folder:</span>
                </div>
                {deleteOption === 'SPECIFIC' && availableFolders.length > 0 && (
                  <select
                    className="modal-select"
                    value={specificFolderId}
                    onChange={(e) => setSpecificFolderId(e.target.value)}
                  >
                    {availableFolders.map((f) => (
                      <option key={f.id} value={String(f.id)}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                )}
              </label>

              <label className="delete-option-label danger-text">
                <input
                  type="radio"
                  name="deleteOption"
                  value="CASCADE"
                  checked={deleteOption === 'CASCADE'}
                  onChange={() => setDeleteOption('CASCADE')}
                />
                <span><strong>Delete folder & all contents inside</strong></span>
              </label>
            </div>

            <div className="action-btn-group">
              <button
                type="button"
                className="modal-submit-btn btn-secondary full-width"
                onClick={() => setDeletingTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-submit-btn btn-danger full-width"
                onClick={handleConfirmDelete}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        ) : (
          <>
            <form className="add-file-form" onSubmit={handleSubmit}>
              <div className="form-row align-center">
                <input
                  type="text"
                  className="modal-input"
                  placeholder="Folder name..."
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                />
                
                <div className="color-picker-wrapper">
                  <span className="color-picker-label">Color</span>
                  <div className="color-swatch-box" style={{ backgroundColor: fileColor }}>
                    <input
                      type="color"
                      className="color-swatch-input"
                      value={fileColor}
                      onChange={(e) => setFileColor(e.target.value)}
                      title="Folder Representative Color"
                    />
                  </div>
                </div>
              </div>

              <div className="preview-row">
                <span className="preview-label">Preview:</span>
                <span
                  className="file-badge"
                  style={{ backgroundColor: fileColor, color: previewTextColor }}
                >
                  <Folder size={14} color={previewTextColor} />
                  {fileName.trim() || 'Folder Preview'}
                </span>
              </div>

              <div className="form-row">
                <select
                  className="modal-select"
                  value={String(parentId)}
                  onChange={(e) => setParentId(e.target.value)}
                >
                  <option value="">(Root level / No parent)</option>
                  {selectableParents.map((f) =>
                    f ? (
                      <option key={f.id} value={String(f.id)}>
                        {f.name}
                      </option>
                    ) : null
                  )}
                </select>

                {editingFileId ? (
                  <div className="action-btn-group">
                    <button
                      type="button"
                      className="modal-submit-btn btn-secondary"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="modal-submit-btn">
                      <Check size={16} /> Save
                    </button>
                  </div>
                ) : (
                  <button type="submit" className="modal-submit-btn">
                    <Plus size={16} /> Add Folder
                  </button>
                )}
              </div>
            </form>

            <div className="file-list-manage">
              <h4>Existing Folders</h4>
              {safeFiles.length === 0 ? (
                <p className="empty-tip">No folders created yet.</p>
              ) : (
                safeFiles.map((f) => {
                  if (!f) return null;
                  const noteCount = safeNotes.filter((n) => n && String(n.fileId) === String(f.id)).length;
                  const isEditing = String(editingFileId) === String(f.id);
                  const bgColor = f.color || '#3b82f6';
                  const txtColor = getContrastTextColor(bgColor);

                  return (
                    <div
                      key={f.id}
                      className={`file-manage-item ${isEditing ? 'editing-manage-item' : ''}`}
                    >
                      <div className="file-manage-info">
                        <span
                          className="file-badge"
                          style={{ backgroundColor: bgColor, color: txtColor }}
                        >
                          <Folder size={13} color={txtColor} />
                          {f.name}
                        </span>
                        <span className="file-manage-count">({noteCount} notes)</span>
                      </div>
                      <div className="action-btn-group">
                        <button
                          type="button"
                          className="delete-file-btn"
                          onClick={() => handleStartEdit(f)}
                          title="Edit Folder"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          className="delete-file-btn"
                          onClick={() => handleStartDelete(f)}
                          title="Delete Folder"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}