function fileManager() {
    return {
        // Authentication
        isAuthenticated: false,
        loginForm: {
            username: '',
            password: ''
        },
        loginLoading: false,
        token: null,

        // File management
        currentPath: '',
        files: [],
        loading: false,
        dragOver: false,

        // UI state
        notifications: [],
        showCreateFolderModal: false,
        showDeleteModal: false,
        newFolderName: '',
        fileToDelete: null,

        // Initialize the application
        init() {
            this.token = localStorage.getItem('authToken');
            if (this.token) {
                this.isAuthenticated = true;
                this.loadFiles();
            }
        },

        // Authentication methods
        async login() {
            this.loginLoading = true;
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.loginForm)
                });

                if (response.ok) {
                    const data = await response.json();
                    this.token = data.token;
                    localStorage.setItem('authToken', this.token);
                    this.isAuthenticated = true;
                    this.showNotification('Sesión iniciada correctamente', 'success');
                    this.loadFiles();
                } else {
                    const error = await response.json();
                    this.showNotification(error.message || 'Error al iniciar sesión', 'error');
                }
            } catch (error) {
                this.showNotification('Error de conexión', 'error');
            } finally {
                this.loginLoading = false;
            }
        },

        logout() {
            localStorage.removeItem('authToken');
            this.token = null;
            this.isAuthenticated = false;
            this.currentPath = '';
            this.files = [];
            this.loginForm = { username: '', password: '' };
        },

        // API helper method
        async apiCall(url, options = {}) {
            const headers = {
                'Authorization': `Bearer ${this.token}`,
                ...options.headers
            };

            const response = await fetch(url, {
                ...options,
                headers
            });

            if (response.status === 401) {
                this.logout();
                throw new Error('Sesión expirada');
            }

            return response;
        },

        // File operations
        async loadFiles() {
            this.loading = true;
            try {
                const response = await this.apiCall(`/api/list?prefix=${encodeURIComponent(this.currentPath)}`);
                if (response.ok) {
                    const data = await response.json();
                    this.files = data.files || [];
                } else {
                    this.showNotification('Error al cargar archivos', 'error');
                }
            } catch (error) {
                this.showNotification(error.message || 'Error al cargar archivos', 'error');
            } finally {
                this.loading = false;
            }
        },

        async createFolder() {
            if (!this.newFolderName.trim()) return;

            try {
                const folderPath = this.currentPath ? 
                    `${this.currentPath}/${this.newFolderName}` : 
                    this.newFolderName;

                const response = await this.apiCall('/api/mkdir', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ path: folderPath })
                });

                if (response.ok) {
                    this.showNotification('Carpeta creada correctamente', 'success');
                    this.showCreateFolderModal = false;
                    this.newFolderName = '';
                    this.loadFiles();
                } else {
                    const error = await response.json();
                    this.showNotification(error.message || 'Error al crear carpeta', 'error');
                }
            } catch (error) {
                this.showNotification(error.message || 'Error al crear carpeta', 'error');
            }
        },

        async uploadFile(file) {
            try {
                // Get presigned URL
                const fileName = this.currentPath ? 
                    `${this.currentPath}/${file.name}` : 
                    file.name;

                const presignResponse = await this.apiCall('/api/presign-upload', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        filename: fileName,
                        contentType: file.type 
                    })
                });

                if (!presignResponse.ok) {
                    throw new Error('Error al obtener URL de subida');
                }

                const { uploadUrl } = await presignResponse.json();

                // Upload file to presigned URL
                const uploadResponse = await fetch(uploadUrl, {
                    method: 'PUT',
                    body: file,
                    headers: {
                        'Content-Type': file.type
                    }
                });

                if (uploadResponse.ok) {
                    this.showNotification(`${file.name} subido correctamente`, 'success');
                    this.loadFiles();
                } else {
                    throw new Error('Error al subir archivo');
                }
            } catch (error) {
                this.showNotification(`Error al subir ${file.name}: ${error.message}`, 'error');
            }
        },

        confirmDelete(file) {
            this.fileToDelete = file;
            this.showDeleteModal = true;
        },

        async deleteFile() {
            if (!this.fileToDelete) return;

            try {
                const response = await this.apiCall(`/api/object?key=${encodeURIComponent(this.fileToDelete.key)}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    this.showNotification(`${this.fileToDelete.name} eliminado correctamente`, 'success');
                    this.showDeleteModal = false;
                    this.fileToDelete = null;
                    this.loadFiles();
                } else {
                    const error = await response.json();
                    this.showNotification(error.message || 'Error al eliminar', 'error');
                }
            } catch (error) {
                this.showNotification(error.message || 'Error al eliminar', 'error');
            }
        },

        async copyPublicUrl(fileKey) {
            try {
                // Assuming your API provides a way to get public URLs
                // This might need to be adjusted based on your actual API
                const publicUrl = `${window.location.origin}/api/public/${encodeURIComponent(fileKey)}`;
                
                await navigator.clipboard.writeText(publicUrl);
                this.showNotification('URL copiada al portapapeles', 'success');
            } catch (error) {
                this.showNotification('Error al copiar URL', 'error');
            }
        },

        // Navigation
        navigateToPath(path) {
            this.currentPath = path;
            this.loadFiles();
        },

        goBack() {
            if (this.currentPath === '') return;
            
            const pathParts = this.currentPath.split('/');
            pathParts.pop();
            this.currentPath = pathParts.join('/');
            this.loadFiles();
        },

        get breadcrumbs() {
            if (!this.currentPath) return [];
            
            const parts = this.currentPath.split('/');
            const breadcrumbs = [];
            let currentPath = '';
            
            parts.forEach((part, index) => {
                currentPath += (index > 0 ? '/' : '') + part;
                breadcrumbs.push({
                    name: part,
                    path: currentPath
                });
            });
            
            return breadcrumbs;
        },

        // File handling
        handleFileSelect(event) {
            const files = Array.from(event.target.files);
            files.forEach(file => this.uploadFile(file));
        },

        handleDrop(event) {
            this.dragOver = false;
            const files = Array.from(event.dataTransfer.files);
            files.forEach(file => this.uploadFile(file));
        },

        // Utility methods
        formatFileSize(bytes) {
            if (bytes === 0) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        },

        showNotification(message, type = 'info') {
            const id = Date.now();
            const notification = {
                id,
                message,
                type,
                show: true
            };
            
            this.notifications.push(notification);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                this.removeNotification(id);
            }, 5000);
        },

        removeNotification(id) {
            const index = this.notifications.findIndex(n => n.id === id);
            if (index > -1) {
                this.notifications[index].show = false;
                setTimeout(() => {
                    this.notifications.splice(index, 1);
                }, 300);
            }
        }
    };
}