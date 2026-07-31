import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Tag, Pencil, Check } from 'lucide-react';
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

export function TagManagerModal({ isOpen, onClose, tags = [], notes = [], onAddTag, onUpdateTag, onDeleteTag }) {
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#3b82f6');
  const [editingTagId, setEditingTagId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setTagName('');
      setTagColor('#3b82f6');
      setEditingTagId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartEdit = (tag) => {
    if (!tag) return;
    setEditingTagId(String(tag.id));
    setTagName(tag.name || '');
    setTagColor(tag.color || '#3b82f6');
  };

  const handleCancelEdit = () => {
    setEditingTagId(null);
    setTagName('');
    setTagColor('#3b82f6');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tagName.trim()) return;

    const computedTextColor = getContrastTextColor(tagColor);

    if (editingTagId) {
      if (onUpdateTag) {
        onUpdateTag(editingTagId, {
          name: tagName.trim(),
          color: tagColor,
          textColor: computedTextColor
        });
      }
      handleCancelEdit();
    } else {
      if (onAddTag) {
        onAddTag(tagName.trim(), tagColor, computedTextColor);
      }
      setTagName('');
      setTagColor('#3b82f6');
    }
  };

  const previewTextColor = getContrastTextColor(tagColor);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Manage Tags</h3>
          <button type="button" className="close-modal-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="add-file-form" onSubmit={handleSubmit}>
          <div className="form-row align-center">
            <input
              type="text"
              placeholder="Tag Name"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              className="modal-input"
            />
            
            <div className="color-picker-wrapper">
              <span className="color-picker-label">Color</span>
              <div className="color-swatch-box" style={{ backgroundColor: tagColor }}>
                <input
                  type="color"
                  className="color-swatch-input"
                  value={tagColor}
                  onChange={(e) => setTagColor(e.target.value)}
                  title="Tag Representative Color"
                />
              </div>
            </div>
          </div>

          <div className="preview-row">
            <span className="preview-label">Preview:</span>
            <span
              className="tag-badge"
              style={{ backgroundColor: tagColor, color: previewTextColor }}
            >
              <Tag size={13} color={previewTextColor} />
              {tagName.trim() || 'Tag Preview'}
            </span>
          </div>

          <div className="form-row">
            {editingTagId ? (
              <div className="action-btn-group full-width justify-end">
                <button
                  type="button"
                  className="modal-submit-btn btn-secondary"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-submit-btn">
                  <Check size={16} /> Save Changes
                </button>
              </div>
            ) : (
              <button type="submit" className="modal-submit-btn full-width">
                <Plus size={16} /> Add Tag
              </button>
            )}
          </div>
        </form>

        <div className="file-list-manage">
          {tags.map((tag) => {
            if (!tag) return null;
            const count = (notes || []).filter((n) => n && n.tag === tag.name).length;
            const bgColor = tag.color || '#3b82f6';
            const txtColor = getContrastTextColor(bgColor);
            const isEditing = String(editingTagId) === String(tag.id);

            return (
              <div
                key={tag.id}
                className={`file-manage-item ${isEditing ? 'editing-manage-item' : ''}`}
              >
                <div className="file-manage-info">
                  <span
                    className="tag-badge"
                    style={{ backgroundColor: bgColor, color: txtColor }}
                  >
                    <Tag size={12} color={txtColor} />
                    {tag.name}
                  </span>
                  <span className="file-manage-count">({count} notes)</span>
                </div>
                <div className="action-btn-group">
                  <button
                    type="button"
                    className="delete-file-btn"
                    onClick={() => handleStartEdit(tag)}
                    title="Edit Tag"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    className="delete-file-btn"
                    onClick={() => onDeleteTag(tag.id, tag.name)}
                    title="Delete Tag"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}