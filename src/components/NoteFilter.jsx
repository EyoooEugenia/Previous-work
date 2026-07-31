import React from 'react';
import { Search, Folder, Tag, Calendar, ArrowUpDown } from 'lucide-react';

export function NoteFilter({
  searchQuery,
  onSearchChange,
  selectedTag,
  onTagChange,
  tags = [],
  selectedFile,
  onFileChange,
  files = [],
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  sortOrder,
  onSortOrderChange,
}) {
  return (
    <div className="filter-toolbar">
      <div className="filter-item search-box">
        <Search size={16} className="filter-icon" />
        <input
          type="text"
          placeholder="Search title/content..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="filter-item">
        <Folder size={16} className="filter-icon" />
        <select
          value={selectedFile}
          onChange={(e) => onFileChange(e.target.value)}
        >
          <option value="ALL">All Files</option>
          {files.map((file) => (
            <option key={file.id} value={file.id}>
              {file.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-item">
        <Tag size={16} className="filter-icon" />
        <select
          value={selectedTag}
          onChange={(e) => onTagChange(e.target.value)}
        >
          <option value="ALL">All Tags</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.name}>
              {tag.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-item date-range-group">
        <Calendar size={16} className="filter-icon" />
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="date-filter-input"
        />
        <span className="date-range-separator">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="date-filter-input"
        />
      </div>

      <div className="filter-item">
        <ArrowUpDown size={16} className="filter-icon" />
        <select
          value={sortOrder}
          onChange={(e) => onSortOrderChange(e.target.value)}
        >
          <option value="NEWEST">Newest Modified</option>
          <option value="OLDEST">Oldest Modified</option>
        </select>
      </div>
    </div>
  );
}