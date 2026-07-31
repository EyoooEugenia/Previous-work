import { useState, useEffect } from 'react';

const DEFAULT_TAGS = [
  { id: 'IDEA', name: 'IDEA', color: '#6366f1', textColor: '#ffffff' },
  { id: 'URGENT', name: 'URGENT', color: '#ef4444', textColor: '#ffffff' },
  { id: 'SCHEDULE', name: 'SCHEDULE', color: '#10b981', textColor: '#ffffff' },
  { id: 'LATER', name: 'LATER', color: '#f59e0b', textColor: '#ffffff' },
];

export function useTags() {
  const [tags, setTags] = useState(() => {
    const saved = localStorage.getItem('productivity_tags');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(Boolean);
        }
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_TAGS;
  });

  useEffect(() => {
    localStorage.setItem('productivity_tags', JSON.stringify(tags));
  }, [tags]);

  const addTag = (tagName, color, textColor) => {
    const trimmed = tagName.trim().toUpperCase();
    if (!trimmed) return false;
    if (tags.some((t) => t.name === trimmed)) return false;

    const mainColor = color || '#3b82f6';
    const mainTextColor = textColor || '#ffffff';

    const newTag = {
      id: Date.now().toString(),
      name: trimmed,
      color: mainColor,
      textColor: mainTextColor,
    };

    setTags((prev) => [...prev, newTag]);
    return newTag;
  };

  const updateTag = (tagId, updatedData) => {
    setTags((prev) =>
      (prev || []).map((t) => (t && String(t.id) === String(tagId) ? { ...t, ...updatedData } : t))
    );
  };

  const deleteTag = (id) => {
    setTags((prev) => prev.filter((t) => t.id !== id));
  };

  const getTagDetails = (tagName) => {
    return tags.find((t) => t.name === tagName) || {
      name: tagName,
      color: '#e2e8f0',
      textColor: '#334155',
    };
  };

  return { tags, setTags, addTag, updateTag, deleteTag, getTagDetails };
}