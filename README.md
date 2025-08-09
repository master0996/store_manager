# S3 Storage Management Platform

A modern, responsive web application for managing S3-compatible storage buckets (MinIO) with an intuitive interface and comprehensive file management capabilities.

## Features

### Core Functionality
- **Folder Navigation**: Browse through folders with breadcrumb navigation and path history
- **File Upload**: Drag & drop multiple files with progress tracking
- **Directory Management**: Create new folders and organize your storage
- **File Operations**: Download, delete, and copy public URLs for files
- **Search & Filter**: Find files and folders quickly with real-time search
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### User Interface
- Modern, clean design inspired by leading cloud storage platforms
- Dark/light mode support with system preference detection
- Smooth animations and micro-interactions for enhanced user experience
- Accessible design following WCAG guidelines
- Loading states and error handling with user-friendly messages

### Technical Features
- Built with React 18 and TypeScript for type safety
- TailwindCSS for responsive design and consistent styling
- Modular component architecture for maintainability
- RESTful API integration with progress tracking
- Optimized for performance with efficient state management

## Prerequisites

- Node.js 18+ and npm
- FastAPI backend server running on port 8000
- MinIO instance configured and accessible

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd s3-storage-platform
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set your API base URL:
```
VITE_API_BASE_URL=http://localhost:8000
```

4. Start the development server:
```bash
npm run dev
```

## API Integration

This application expects a FastAPI backend with the following endpoints:

### Files Management
- `GET /files?path={path}` - List files and folders
- `POST /upload` - Upload files (multipart/form-data)
- `DELETE /files?path={path}` - Delete files or folders
- `GET /download?path={path}` - Download files
- `GET /public-url?path={path}` - Get public download URLs

### Directory Management
- `POST /folder` - Create new folders

### Expected API Response Format

```typescript
// List files response
{
  "files": [
    {
      "name": "example.txt",
      "path": "folder/example.txt",
      "isDirectory": false,
      "size": 1024,
      "lastModified": "2024-01-15T10:30:00Z",
      "type": "text/plain"
    }
  ],
  "currentPath": "folder"
}

// Public URL response
{
  "url": "https://minio.example.com/bucket/folder/example.txt?expires=3600"
}
```

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx      # Navigation and breadcrumbs
│   ├── FileExplorer.tsx # File listing and actions
│   ├── UploadZone.tsx  # Drag & drop upload
│   ├── CreateFolderModal.tsx # Folder creation
│   └── ConfirmModal.tsx # Confirmation dialogs
├── services/           # API integration
│   └── apiService.ts   # HTTP client and API calls
├── types/             # TypeScript definitions
│   └── index.ts       # Shared interfaces
├── utils/             # Helper functions
│   └── fileUtils.ts   # File formatting and icons
└── App.tsx            # Main application component
```

## Building for Production

```bash
npm run build
```

The build output will be in the `dist/` directory, ready for deployment to any static hosting service.

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers with ES2020 support

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.