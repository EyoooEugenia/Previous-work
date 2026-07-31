import { useState } from 'react';
import { useNotes, useTags, useFiles } from './hooks';
import {
  Header,
  NoteCard,
  NoteInput,
  NoteFilter,
  Sidebar,
  FileMatrix,
  FileManagerModal,
  TagManagerModal,
  FileDetailView,
} from './components';
import './styles/index.css';

const getFormattedDate = (timestamp) => {
  if (!timestamp) return '';
  const dateObj = new Date(timestamp);
  if (isNaN(dateObj.getTime())) return '';

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function App() {
  const { notes = [], handleAddNote, handleDeleteNote, handleUpdateNote, setNotes } = useNotes();
  const { tags = [], setTags, addTag, deleteTag, getTagDetails, updateTag } = useTags();
  const { files = [], setFiles, addFile, deleteFile, getFileDetails, updateFile } = useFiles();

  const [isFileManagerOpen, setIsFileManagerOpen] = useState(false);
  const [fileManagerDefaultParentId, setFileManagerDefaultParentId] = useState(null);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [createdFileForInput, setCreatedFileForInput] = useState(null);

  const [activeModule, setActiveModule] = useState('HOME');
  const [activeFileId, setActiveFileId] = useState(undefined);

  const [selectedTag, setSelectedTag] = useState('ALL');
  const [selectedFileFilter, setSelectedFileFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState('NEWEST');

  const handleOpenFileManager = (parentId = null) => {
    setFileManagerDefaultParentId(parentId);
    setIsFileManagerOpen(true);
  };

  const handleUpdateFile = (fileId, updatedData) => {
    if (updateFile) {
      updateFile(fileId, updatedData);
    } else if (setFiles) {
      setFiles((prev) =>
        (prev || []).map((f) => (f && String(f.id) === String(fileId) ? { ...f, ...updatedData } : f))
      );
    }
  };

  const handleUpdateTag = (tagId, updatedData) => {
    const oldTag = (tags || []).find((t) => t && String(t.id) === String(tagId));
    if (!oldTag) return;

    if (updatedData.name && updatedData.name !== oldTag.name) {
      setNotes((prev) =>
        (prev || []).map((n) => (n && n.tag === oldTag.name ? { ...n, tag: updatedData.name } : n))
      );
    }

    if (updateTag) {
      updateTag(tagId, updatedData);
    } else if (setTags) {
      setTags((prev) =>
        (prev || []).map((t) => (t && String(t.id) === String(tagId) ? { ...t, ...updatedData } : t))
      );
    }
  };

  const handleDeleteFile = (fileId, actionType = 'MOVE_TO_PARENT', targetFileId = null) => {
    const targetFile = (files || []).find((f) => f && String(f.id) === String(fileId));
    const targetParentId = targetFile?.parentId ? String(targetFile.parentId) : null;

    if (actionType === 'CASCADE_DELETE') {
      setNotes((prev) => (prev || []).filter((n) => n && String(n.fileId) !== String(fileId)));
      setFiles((prev) => (prev || []).filter((f) => f && String(f.parentId) !== String(fileId)));
    } else {
      let destinationId = null;

      if (actionType === 'MOVE_TO_PARENT' || actionType === 'MOVE_UP') {
        destinationId = targetParentId;
      } else if (actionType === 'MOVE_TO_UNCLASSIFIED') {
        destinationId = null;
      } else if (actionType === 'MOVE_TO_SPECIFIC') {
        destinationId = targetFileId ? String(targetFileId) : null;
      }

      setNotes((prev) =>
        (prev || []).map((n) => (n && String(n.fileId) === String(fileId) ? { ...n, fileId: destinationId } : n))
      );
      setFiles((prev) =>
        (prev || []).map((f) => (f && String(f.parentId) === String(fileId) ? { ...f, parentId: destinationId } : f))
      );
    }

    deleteFile(fileId);

    if (String(activeFileId) === String(fileId)) {
      setActiveFileId(undefined);
    }
  };

  const handleDeleteTag = (tagId, tagName, cascadeDeleteNotes) => {
    deleteTag(tagId);

    if (cascadeDeleteNotes) {
      const targetName = tagName || tagId;
      if (setNotes) {
        setNotes((prev) => (prev || []).filter((n) => n && n.tag !== targetName));
      } else {
        (notes || []).forEach((note) => {
          if (note?.tag === targetName) {
            handleDeleteNote(note.id);
          }
        });
      }
    }

    if (selectedTag === tagName || selectedTag === tagId) {
      setSelectedTag('ALL');
    }
  };

  const getFilteredNotes = (targetFileId, useFilterBar = true) => {
    return (notes || [])
      .filter((note) => {
        if (!note) return false;

        if (targetFileId !== undefined) {
          if (targetFileId === null) {
            if (note.fileId !== null && note.fileId !== undefined && note.fileId !== '') return false;
          } else {
            if (String(note.fileId) !== String(targetFileId)) return false;
          }
        }

        if (useFilterBar) {
          const matchesTag = selectedTag === 'ALL' || note.tag === selectedTag;
          const matchesFile = selectedFileFilter === 'ALL' || String(note.fileId) === String(selectedFileFilter);

          const titleText = (note.title || '').toLowerCase();
          const blocksArray = Array.isArray(note.blocks) ? note.blocks : [];
          const bodyText = blocksArray
            .map((b) => {
              if (!b) return '';
              if (b.type === 'text') {
                return b.content ? String(b.content).replace(/<[^>]*>/g, '') : '';
              }
              return '';
            })
            .join(' ')
            .toLowerCase();

          const query = (searchQuery || '').toLowerCase();
          const matchesSearch = titleText.includes(query) || bodyText.includes(query);

          const effectiveTimestamp = note.updatedAt || note.createdAt || note.id;
          const noteDateStr = getFormattedDate(effectiveTimestamp);
          const matchesFrom = !startDate || noteDateStr >= startDate;
          const matchesTo = !endDate || noteDateStr <= endDate;
          const matchesDateRange = matchesFrom && matchesTo;

          return matchesTag && matchesFile && matchesSearch && matchesDateRange;
        }

        return true;
      })
      .sort((a, b) => {
        if (!a || !b) return 0;
        const timeA = typeof a.updatedAt === 'number' ? a.updatedAt : (typeof a.createdAt === 'number' ? a.createdAt : a.id);
        const timeB = typeof b.updatedAt === 'number' ? b.updatedAt : (typeof b.createdAt === 'number' ? b.createdAt : b.id);
        return sortOrder === 'NEWEST' ? timeB - timeA : timeA - timeB;
      });
  };

  const activeFileObj = activeFileId === null
    ? { id: null, name: 'Unclassified', color: '#f1f5f9', textColor: '#64748b' }
    : (files || []).find((f) => f && String(f.id) === String(activeFileId)) || { id: undefined, name: activeModule, color: '#f1f5f9', textColor: '#0d9488' };

  return (
    <div className="dashboard-layout">
      <Sidebar
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        files={files || []}
        activeFileId={activeFileId}
        onSelectFile={(fId) => setActiveFileId(fId)}
        onOpenFileManager={() => handleOpenFileManager(activeFileId)}
      />

      <main className="middle-zone">
        <div className="app-container">
          <Header activeModule={activeModule} activeFile={activeFileObj} files={files || []} />

          <main className="app-main">
            {activeModule === 'HOME' && (
              <>
                <section className="input-section">
                  <NoteInput
                    onSave={handleAddNote}
                    tags={tags || []}
                    files={files || []}
                    defaultFileId={createdFileForInput}
                    onOpenFileManager={() => handleOpenFileManager()}
                    onOpenTagManager={() => setIsTagManagerOpen(true)}
                  />
                </section>

                <NoteFilter
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedTag={selectedTag}
                  onTagChange={setSelectedTag}
                  tags={tags || []}
                  selectedFile={selectedFileFilter}
                  onFileChange={setSelectedFileFilter}
                  files={files || []}
                  startDate={startDate}
                  onStartDateChange={setStartDate}
                  endDate={endDate}
                  onEndDateChange={setEndDate}
                  sortOrder={sortOrder}
                  onSortOrderChange={setSortOrder}
                  onOpenFileManager={() => handleOpenFileManager()}
                />

                <section className="list-section">
                  {getFilteredNotes(undefined, true).length === 0 ? (
                    <p className="empty-tip">No notes found on Home page.</p>
                  ) : (
                    getFilteredNotes(undefined, true).map((item) => (
                      <NoteCard
                        key={item.id}
                        note={item}
                        onDelete={handleDeleteNote}
                        onUpdate={handleUpdateNote}
                        getTagDetails={getTagDetails}
                        tags={tags || []}
                        getFileDetails={getFileDetails}
                        files={files || []}
                      />
                    ))
                  )}
                </section>
              </>
            )}

            {activeModule === 'NOTES' && activeFileId === undefined && (
              <FileMatrix
                files={files || []}
                notes={notes || []}
                onSelectFile={(fId) => setActiveFileId(fId)}
                onOpenFileManager={() => handleOpenFileManager()}
              />
            )}

            {activeModule === 'NOTES' && activeFileId !== undefined && (
              <FileDetailView
                activeFileId={activeFileId}
                files={files || []}
                notes={notes || []}
                tags={tags || []}
                onBack={() => setActiveFileId(undefined)}
                onSelectFile={(fId) => setActiveFileId(fId)}
                handleAddNote={handleAddNote}
                handleDeleteNote={handleDeleteNote}
                handleUpdateNote={handleUpdateNote}
                addTag={addTag}
                handleDeleteTag={handleDeleteTag}
                addFile={addFile}
                handleDeleteFile={handleDeleteFile}
                getTagDetails={getTagDetails}
                getFileDetails={getFileDetails}
                onOpenFileManager={(pId) => handleOpenFileManager(pId !== undefined ? pId : activeFileId)}
                getFilteredNotes={getFilteredNotes}
              />
            )}

            {activeModule === 'ANALYTICS' && (
              <div className="empty-state">📊 Analytics module coming soon...</div>
            )}

            {activeModule === 'SETTINGS' && (
              <div className="empty-state">⚙️ Settings module coming soon...</div>
            )}
          </main>
        </div>
      </main>

      <aside className="right-zone">
        <div className="widget-card">
          <h3>Widgets Panel</h3>
          <div className="widget-placeholder">+ Add Widget</div>
        </div>
      </aside>

      <FileManagerModal
        isOpen={isFileManagerOpen}
        onClose={() => setIsFileManagerOpen(false)}
        files={files || []}
        notes={notes || []}
        onAddFile={addFile}
        onUpdateFile={handleUpdateFile}
        onDeleteFile={handleDeleteFile}
        defaultParentId={fileManagerDefaultParentId}
        onFileCreated={(newFileId) => setCreatedFileForInput(newFileId)}
      />

      <TagManagerModal
        isOpen={isTagManagerOpen}
        onClose={() => setIsTagManagerOpen(false)}
        tags={tags || []}
        notes={notes || []}
        onAddTag={addTag}
        onUpdateTag={handleUpdateTag}
        onDeleteTag={handleDeleteTag}
      />
    </div>
  );
}