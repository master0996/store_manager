import React, { useState } from 'react';
import { FileText, Folder, Download, Link, Trash2, Eye, Calendar, HardDrive, ChevronUp, ChevronDown } from 'lucide-react';
import { FileItem } from '../types';
import { formatFileSize, formatDate, getFileIcon } from '../utils/fileUtils';

interface FileExplorerProps {
  files: FileItem[];
  loading: boolean;
  onNavigate: (path: string) => void;
  onDelete: (item: FileItem) => void;
  onCopyUrl: (item: FileItem) => void;
  currentPath: string;
}

type SortField = 'name' | 'size' | 'lastModified' | 'type';
type SortDirection = 'asc' | 'desc';

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  loading,
  onNavigate,
  onDelete,
  onCopyUrl,
  currentPath,
}) => {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedFiles = [...files].sort((a, b) => {
    // Directories first
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;

    let aValue: string | number;
    let bValue: string | number;

    switch (sortField) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'size':
        aValue = a.size || 0;
        bValue = b.size || 0;
        break;
      case 'lastModified':
        aValue = new Date(a.lastModified || 0).getTime();
        bValue = new Date(b.lastModified || 0).getTime();
        break;
      case 'type':
        aValue = a.type || '';
        bValue = b.type || '';
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const SortButton: React.FC<{ field: SortField; children: React.ReactNode }> = ({ field, children }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
    >
      <span>{children}</span>
      {sortField === field && (
        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-300">Loading files...</span>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
        <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          This folder is empty
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Drag and drop files here or create a new folder to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                <SortButton field="name">Name</SortButton>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                <SortButton field="size">Size</SortButton>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                <SortButton field="lastModified">Modified</SortButton>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedFiles.map((file) => (
              <FileRow
                key={file.path}
                file={file}
                onNavigate={onNavigate}
                onDelete={onDelete}
                onCopyUrl={onCopyUrl}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface FileRowProps {
  file: FileItem;
  onNavigate: (path: string) => void;
  onDelete: (item: FileItem) => void;
  onCopyUrl: (item: FileItem) => void;
}

const FileRow: React.FC<FileRowProps> = ({ file, onNavigate, onDelete, onCopyUrl }) => {
  const FileIcon = getFileIcon(file.name, file.isDirectory);

  const handleClick = () => {
    if (file.isDirectory) {
      onNavigate(file.path);
    }
  };

  const handleDownload = async () => {
    if (file.isDirectory) return;
    
    try {
      const { apiService } = await import('../services/apiService');
      await apiService.downloadFile(file.path);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <FileIcon className={`w-5 h-5 mr-3 ${file.isDirectory ? 'text-blue-500' : 'text-gray-400'}`} />
          <div>
            <button
              onClick={handleClick}
              className={`font-medium ${file.isDirectory ? 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300' : 'text-gray-900 dark:text-gray-100'} transition-colors`}
            >
              {file.name}
            </button>
            {file.type && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {file.type}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {file.isDirectory ? '—' : formatFileSize(file.size || 0)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {file.lastModified ? formatDate(file.lastModified) : '—'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-2">
          {!file.isDirectory && (
            <>
              <button
                onClick={handleDownload}
                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 p-1 rounded transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => onCopyUrl(file)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded transition-colors"
                title="Copy public URL"
              >
                <Link className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={() => onDelete(file)}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};