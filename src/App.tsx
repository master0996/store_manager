import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FileExplorer } from './components/FileExplorer';
import { UploadZone } from './components/UploadZone';
import { CreateFolderModal } from './components/CreateFolderModal';
import { ConfirmModal } from './components/ConfirmModal';
import { apiService } from './services/apiService';
import { FileItem } from './types';

function App() {
  const [currentPath, setCurrentPath] = useState<string>('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showCreateFolder, setShowCreateFolder] = useState<boolean>(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<FileItem | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    loadFiles(currentPath);
  }, [currentPath]);

  const loadFiles = async (path: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.listFiles(path);
      setFiles(response.files || []);
    } catch (err) {
      setError('Error loading files. Please check your connection.');
      console.error('Error loading files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  const handleUpload = async (files: File[], targetPath: string) => {
    for (const file of files) {
      const fileKey = `${file.name}-${Date.now()}`;
      setUploadProgress(prev => ({ ...prev, [fileKey]: 0 }));
      
      try {
        await apiService.uploadFile(file, targetPath, (progress) => {
          setUploadProgress(prev => ({ ...prev, [fileKey]: progress }));
        });
        
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileKey];
          return newProgress;
        });
      } catch (err) {
        console.error('Upload error:', err);
        setError(`Failed to upload ${file.name}`);
      }
    }
    loadFiles(currentPath);
  };

  const handleCreateFolder = async (folderName: string) => {
    try {
      await apiService.createFolder(currentPath, folderName);
      setShowCreateFolder(false);
      loadFiles(currentPath);
    } catch (err) {
      setError('Failed to create folder');
      console.error('Create folder error:', err);
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    
    try {
      await apiService.deleteItem(itemToDelete.path);
      setShowConfirmDelete(false);
      setItemToDelete(null);
      loadFiles(currentPath);
    } catch (err) {
      setError('Failed to delete item');
      console.error('Delete error:', err);
    }
  };

  const handleCopyPublicUrl = async (item: FileItem) => {
    try {
      const url = await apiService.getPublicUrl(item.path);
      await navigator.clipboard.writeText(url);
      // You could add a toast notification here
    } catch (err) {
      setError('Failed to copy URL');
      console.error('Copy URL error:', err);
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        currentPath={currentPath}
        onNavigate={handleNavigate}
        onCreateFolder={() => setShowCreateFolder(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={() => setError('')}
              className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
            >
              Dismiss
            </button>
          </div>
        )}

        <UploadZone
          onUpload={(files) => handleUpload(files, currentPath)}
          uploadProgress={uploadProgress}
        />

        <FileExplorer
          files={filteredFiles}
          loading={loading}
          onNavigate={handleNavigate}
          onDelete={(item) => {
            setItemToDelete(item);
            setShowConfirmDelete(true);
          }}
          onCopyUrl={handleCopyPublicUrl}
          currentPath={currentPath}
        />
      </main>

      <CreateFolderModal
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        onConfirm={handleCreateFolder}
      />

      <ConfirmModal
        isOpen={showConfirmDelete}
        onClose={() => {
          setShowConfirmDelete(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDeleteItem}
        title="Delete Item"
        message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}

export default App;