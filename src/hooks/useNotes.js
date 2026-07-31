import { useState, useEffect } from 'react';

export function useNotes(initialNotes = []) {
  const [notes, setNotes] = useState(() => {
    try {
      const savedNotes = localStorage.getItem('app_notes');
      return savedNotes ? JSON.parse(savedNotes) : initialNotes;
    } catch (error) {
      console.error('Failed to load notes from localStorage:', error);
      return initialNotes;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('app_notes', JSON.stringify(notes));
    } catch (error) {
      console.error('Failed to save notes to localStorage:', error);
    }
  }, [notes]);

  const formatDisplayTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAddNote = ({ title, tag, blocks, fileId }) => {
    const now = Date.now();

    const newNote = {
      id: now,
      title: title || '',
      tag: tag || null,
      fileId: fileId || null,
      blocks: blocks || [],
      createdAt: now,
      updatedAt: null,
      displayTime: formatDisplayTime(now),
    };

    setNotes((prevNotes) => [newNote, ...prevNotes]);
  };

  const handleDeleteNote = (id) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
  };

  const handleUpdateNote = (id, updatedFields) => {
    const now = Date.now();

    setNotes((prevNotes) =>
      prevNotes.map((note) => {
        if (note.id === id) {
          return {
            ...note,
            title: updatedFields.title !== undefined ? updatedFields.title : note.title,
            tag: updatedFields.tag !== undefined ? updatedFields.tag : note.tag,
            fileId: updatedFields.fileId !== undefined ? updatedFields.fileId : note.fileId,
            blocks: updatedFields.blocks !== undefined ? updatedFields.blocks : note.blocks,
            updatedAt: now,
            displayTime: formatDisplayTime(now),
          };
        }
        return note;
      })
    );
  };

  const handleRemoveFileAssociation = (targetFileId) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.fileId === targetFileId ? { ...note, fileId: null } : note
      )
    );
  };

  return {
    notes,
    setNotes,
    handleAddNote,
    handleDeleteNote,
    handleUpdateNote,
    handleRemoveFileAssociation,
  };
}