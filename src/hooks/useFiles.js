import { useState, useEffect } from 'react';

const DEFAULT_FILES = [
  { id: 'GENERAL', name: 'GENERAL', color: '#3b82f6', textColor: '#ffffff', parentId: null },
  { id: 'WORK', name: 'WORK', color: '#ef4444', textColor: '#ffffff', parentId: null },
  { id: 'PERSONAL', name: 'PERSONAL', color: '#10b981', textColor: '#ffffff', parentId: null },
  { id: 'PROJECTS', name: 'PROJECTS', color: '#f59e0b', textColor: '#ffffff', parentId: null }, 
];

export function useFiles() {
  const [files, setFiles] = useState(() => {
    const saved = localStorage.getItem('productivity_files');
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
    return DEFAULT_FILES;
  });

  useEffect(() => {
    localStorage.setItem('productivity_files', JSON.stringify(files));
  }, [files]);

  const addFile = ({ name, color, textColor, parentId = null }) => {
    if (!name) return null;
    const trimmed = name.trim().toUpperCase();
    if (!trimmed) return null;
    if ((files || []).some((f) => f && f.name === trimmed)) return null;

    const mainColor = color || '#3b82f6';
    const mainTextColor = textColor || '#ffffff';

    const newFile = {
      id: Date.now().toString(),
      name: trimmed,
      color: mainColor,
      textColor: mainTextColor,
      parentId: parentId ? String(parentId) : null
    };

    setFiles((prev) => [...(prev || []), newFile]);
    return newFile;
  };

  const updateFile = (fileId, updatedData) => {
    setFiles((prev) =>
      (prev || []).map((f) => (f && String(f.id) === String(fileId) ? { ...f, ...updatedData } : f))
    );
  };

  const deleteFile = (id) => {
    setFiles((prev) => (prev || []).filter((f) => f && String(f.id) !== String(id)));
  };

  const getFileDetails = (fileName) => {
    return (files || []).find((f) => f && (f.name === fileName || String(f.id) === String(fileName))) || {
      name: fileName,
      color: '#e2e8f0',
      textColor: '#334155',
    };
  };

  return { files, setFiles, addFile, updateFile, deleteFile, getFileDetails };
}