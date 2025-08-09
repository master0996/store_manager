import React from 'react';
import { Search, Folder, Plus, Home } from 'lucide-react';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onCreateFolder: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPath,
  onNavigate,
  onCreateFolder,
  searchTerm,
  onSearchChange,
}) => {
  const pathParts = currentPath ? currentPath.split('/').filter(Boolean) : [];

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      onNavigate('');
    } else {
      const newPath = pathParts.slice(0, index + 1).join('/');
      onNavigate(newPath);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Folder className="w-8 h-8 mr-3 text-blue-600 dark:text-blue-400" />
            S3 Storage Manager
          </h1>
          
          <button
            onClick={onCreateFolder}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Folder
          </button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <nav className="flex items-center space-x-2 text-sm">
            <button
              onClick={() => handleBreadcrumbClick(-1)}
              className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              <Home className="w-4 h-4 mr-1" />
              Home
            </button>
            
            {pathParts.map((part, index) => (
              <React.Fragment key={index}>
                <span className="text-gray-400">/</span>
                <button
                  onClick={() => handleBreadcrumbClick(index)}
                  className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors truncate max-w-32"
                  title={part}
                >
                  {part}
                </button>
              </React.Fragment>
            ))}
          </nav>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search files and folders..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white bg-white text-gray-900 w-full lg:w-80"
            />
          </div>
        </div>
      </div>
    </header>
  );
};