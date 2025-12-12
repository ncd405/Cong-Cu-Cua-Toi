// ===== CONFIGURATION =====
const CONFIG = {
    APP_NAME: 'Công Cụ Của Tôi',
    VERSION: '2.0.0',
    API_BASE: '/api',
    CACHE_TTL: 5 * 60 * 1000, // 5 phút
    MAX_RETRIES: 3,
    ENABLE_ANALYTICS: true,
    ENABLE_CACHE: true,
    ENABLE_PWA: false,
    THEME: 'dark' // dark | light | auto
};

// ===== STATE MANAGEMENT =====
class AppState {
    constructor() {
        this.state = {
            user: null,
            settings: {
                theme: CONFIG.THEME,
                notifications: true,
                autoDownload: false,
                quality: 'best',
                format: 'mp4'
            },
            downloads: [],
            cache: {},
            apiStatus: 'unknown',
            isLoading: false,
            currentView: 'home'
        };
        
        this.subscribers = [];
    }
    
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
    }
    
    getState() {
        return { ...this.state };
    }
    
    subscribe(callback) {
        this.subscribers.push(callback);
        return () => {
            this.subscribers = this.subscribers.filter(cb => cb !== callback);
        };
    }
    
    notify() {
        this.subscribers.forEach(callback => callback(this.state));
    }
    
    // Persistence
    saveToStorage() {
        try {
            const data = {
                settings: this.state.settings,
                downloads: this.state.downloads.slice(-50) // Lưu 50 download gần nhất
            };
            localStorage.setItem(CONFIG.APP_NAME, JSON.stringify(data));
        } catch (error) {
            console.error('Lỗi khi lưu trạng thái:', error);
        }
    }
    
    loadFromStorage() {
        try {
            const data = localStorage.getItem(CONFIG.APP_NAME);
            if (data) {
                const parsed = JSON.parse(data);
                this.setState({
                    settings: { ...this.state.settings, ...parsed.settings },
                    downloads: parsed.downloads || []
                });
            }
        } catch (error) {
            console.error('Lỗi khi tải trạng thái:', error);
        }
    }
}

// ===== UTILITIES =====
class Utils {
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    static formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    
    static formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        const parts = [];
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
        
        return parts.join(' ');
    }
    
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    static isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
    
    static copyToClipboard(text) {
        return navigator.clipboard.writeText(text)
            .then(() => true)
            .catch(() => false);
    }
    
    static share(data) {
        if (navigator.share) {
            return navigator.share(data);
        }
        return false;
    }
}

// ===== API CLIENT =====
class ApiClient {
    constructor() {
        this.baseUrl = CONFIG.API_BASE;
        this.cache = new Map();
    }
    
    async request(endpoint, options = {}) {
        const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
        
        // Check cache
        if (CONFIG.ENABLE_CACHE) {
            const cached = this.cache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < CONFIG.CACHE_TTL) {
                return cached.data;
            }
        }
        
        const url = `${this.baseUrl}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'X-App-Version': CONFIG.VERSION
            },
            timeout: 30000
        };
        
        const config = { ...defaultOptions, ...options };
        
        for (let i = 0; i < CONFIG.MAX_RETRIES; i++) {
            try {
                const response = await fetch(url, config);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                const data = await response.json();
                
                // Cache response
                if (CONFIG.ENABLE_CACHE) {
                    this.cache.set(cacheKey, {
                        data,
                        timestamp: Date.now()
                    });
                }
                
                return data;
            } catch (error) {
                if (i === CONFIG.MAX_RETRIES - 1) {
                    throw error;
                }
                // Wait before retry (exponential backoff)
                await new Promise(resolve => 
                    setTimeout(resolve, 1000 * Math.pow(2, i))
                );
            }
        }
    }
    
    async get(endpoint, params = {}) {
        const query = new URLSearchParams(params).toString();
        const url = query ? `${endpoint}?${query}` : endpoint;
        return this.request(url, { method: 'GET' });
    }
    
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    // Health check
    async checkHealth() {
        try {
            const data = await this.get('/health');
            return { status: 'healthy', data };
        } catch (error) {
            return { status: 'unhealthy', error: error.message };
        }
    }
    
    // Video download endpoints
    async downloadFacebook(url, options = {}) {
        return this.post('/facebook/download', {
            url,
            quality: options.quality || 'best',
            format: options.format || 'mp4'
        });
    }
    
    async downloadTikTok(url, options = {}) {
        return this.post('/tiktok/download', {
            url,
            quality: options.quality || 'best',
            format: options.format || 'mp4',
            audioOnly: options.audioOnly || false
        });
    }
    
    // Clear cache
    clearCache() {
        this.cache.clear();
    }
}

// ===== UI MANAGER =====
class UIManager {
    constructor() {
        this.elements = new Map();
        this.modals = new Map();
        this.toasts = [];
        this.initElements();
    }
    
    initElements() {
        // Cache common elements
        const selectors = {
            // Header
            'header': 'header',
            'navbar': '.navbar',
            'themeToggle': '#themeToggle',
            
            // Forms
            'fbUrl': '#fbUrl',
            'ttUrl': '#ttUrl',
            'fbForm': '#fbForm',
            'ttForm': '#ttForm',
            
            // Buttons
            'downloadFbBtn': '#downloadFbBtn',
            'downloadTtBtn': '#downloadTtBtn',
            
            // Modals
            'downloadModal': '#downloadModal',
            'settingsModal': '#settingsModal',
            
            // Status
            'apiStatus': '#apiStatus',
            'loadingOverlay': '#loadingOverlay'
        };
        
        Object.entries(selectors).forEach(([key, selector]) => {
            const element = document.querySelector(selector);
            if (element) {
                this.elements.set(key, element);
            }
        });
    }
    
    showLoading(show = true) {
        const overlay = this.elements.get('loadingOverlay');
        if (overlay) {
            overlay.classList.toggle('show', show);
        }
    }
    
    showToast(message, type = 'info', duration = 5000) {
        const container = document.querySelector('.toast-container') || 
                         this.createToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                ${this.getToastIcon(type)}
            </div>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                &times;
            </button>
        `;
        
        container.appendChild(toast);
        
        // Auto remove
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, duration);
        
        return toast;
    }
    
    getToastIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || 'ℹ';
    }
    
    createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }
    
    showModal(modalId, options = {}) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            this.modals.set(modalId, modal);
            
            // Close on backdrop click
            if (options.closeOnBackdrop !== false) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        this.hideModal(modalId);
                    }
                });
            }
            
            // Close on Escape key
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    this.hideModal(modalId);
                }
            };
            modal.dataset.escapeHandler = handleEscape;
            document.addEventListener('keydown', handleEscape);
        }
    }
    
    hideModal(modalId) {
        const modal = this.modals.get(modalId);
        if (modal) {
            modal.classList.remove('show');
            
            // Remove escape handler
            const handler = modal.dataset.escapeHandler;
            if (handler) {
                document.removeEventListener('keydown', handler);
            }
        }
    }
    
    updateProgress(progress) {
        const progressBar = document.querySelector('.progress-fill');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }
    
    updateStats(stats) {
        const statsElement = document.querySelector('.stats-grid');
        if (statsElement && stats) {
            statsElement.innerHTML = `
                <div class="stat-card">
                    <div class="stat-number">${stats.totalDownloads || 0}</div>
                    <div>Tổng lượt tải</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.successRate || 0}%</div>
                    <div>Tỷ lệ thành công</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${Utils.formatBytes(stats.totalSize || 0)}</div>
                    <div>Tổng dung lượng</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.activeUsers || 0}</div>
                    <div>Người dùng hiện tại</div>
                </div>
            `;
        }
    }
    
    showDownloadOptions(data) {
        const modalContent = `
            <div class="modal-header">
                <h4>Chọn chất lượng video</h4>
                <button class="btn btn-sm btn-outline" onclick="ui.hideModal('downloadModal')">
                    &times;
                </button>
            </div>
            <div class="modal-body">
                ${data.qualities ? this.renderQualityOptions(data.qualities) : ''}
                ${data.info ? this.renderVideoInfo(data.info) : ''}
            </div>
        `;
        
        const modal = this.elements.get('downloadModal');
        if (modal) {
            modal.querySelector('.modal-content').innerHTML = modalContent;
            this.showModal('downloadModal');
        }
    }
    
    renderQualityOptions(qualities) {
        return `
            <div class="quality-options">
                ${qualities.map(q => `
                    <div class="quality-option" onclick="app.downloadVideo('${q.url}', '${q.quality}')">
                        <div class="quality-info">
                            <span class="quality-label">${q.quality}</span>
                            <span class="quality-size">${q.size}</span>
                        </div>
                        <button class="btn btn-primary btn-sm">
                            <i class="fas fa-download"></i> Tải
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    renderVideoInfo(info) {
        return `
            <div class="video-info mt-4 p-4 rounded" style="background: var(--bg-tertiary);">
                <h5>Thông tin video</h5>
                <div class="info-grid">
                    <div><strong>Tiêu đề:</strong> ${info.title || 'Không có'}</div>
                    <div><strong>Thời lượng:</strong> ${info.duration || 'Không có'}</div>
                    <div><strong>Chất lượng:</strong> ${info.quality || 'Không có'}</div>
                    <div><strong>Tác giả:</strong> ${info.author || 'Không có'}</div>
                </div>
            </div>
        `;
    }
    
    // Form validation
    validateUrl(url, platform) {
        if (!url.trim()) {
            return { valid: false, message: 'Vui lòng nhập URL' };
        }
        
        if (!Utils.isValidUrl(url)) {
            return { valid: false, message: 'URL không hợp lệ' };
        }
        
        if (platform === 'facebook' && !url.includes('facebook.com') && !url.includes('fb.watch')) {
            return { valid: false, message: 'Vui lòng nhập URL Facebook hợp lệ' };
        }
        
        if (platform === 'tiktok' && !url.includes('tiktok.com')) {
            return { valid: false, message: 'Vui lòng nhập URL TikTok hợp lệ' };
        }
        
        return { valid: true };
    }
}

// ===== MAIN APPLICATION =====
class Application {
    constructor() {
        this.state = new AppState();
        this.api = new ApiClient();
        this.ui = new UIManager();
        this.utils = Utils;
        
        this.init();
    }
    
    async init() {
        console.log(`${CONFIG.APP_NAME} v${CONFIG.VERSION} đang khởi động...`);
        
        // Load saved state
        this.state.loadFromStorage();
        
        // Initialize UI
        this.initUI();
        
        // Check API status
        await this.checkApiStatus();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start background tasks
        this.startBackgroundTasks();
        
        console.log('✅ Ứng dụng đã khởi động thành công!');
    }
    
    initUI() {
        // Apply saved theme
        this.applyTheme(this.state.getState().settings.theme);
        
        // Update stats
        this.updateStats();
        
        // Setup form auto-save
        this.setupAutoSave();
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
    }
    
    async checkApiStatus() {
        const result = await this.api.checkHealth();
        this.state.setState({ apiStatus: result.status });
        
        this.ui.showToast(
            result.status === 'healthy' ? '✅ API đang hoạt động' : '⚠️ API đang bảo trì',
            result.status === 'healthy' ? 'success' : 'warning'
        );
    }
    
    setupEventListeners() {
        // Theme toggle
        const themeToggle = this.ui.elements.get('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('change', (e) => {
                const theme = e.target.checked ? 'light' : 'dark';
                this.toggleTheme(theme);
            });
        }
        
        // Form submissions
        const fbForm = this.ui.elements.get('fbForm');
        if (fbForm) {
            fbForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFacebookDownload();
            });
        }
        
        const ttForm = this.ui.elements.get('ttForm');
        if (ttForm) {
            ttForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleTikTokDownload();
            });
        }
        
        // Input validation
        const fbUrl = this.ui.elements.get('fbUrl');
        if (fbUrl) {
            fbUrl.addEventListener('input', this.utils.debounce(() => {
                this.validateUrl(fbUrl.value, 'facebook');
            }, 500));
        }
        
        // Header scroll effect
        window.addEventListener('scroll', this.utils.throttle(() => {
            const header = this.ui.elements.get('header');
            if (header) {
                header.classList.toggle('scrolled', window.scrollY > 50);
            }
        }, 100));
        
        // Online/offline detection
        window.addEventListener('online', () => {
            this.ui.showToast('📶 Đã kết nối lại Internet', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.ui.showToast('⚠️ Mất kết nối Internet', 'warning');
        });
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter to submit form
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                const activeElement = document.activeElement;
                if (activeElement.id === 'fbUrl') {
                    this.handleFacebookDownload();
                } else if (activeElement.id === 'ttUrl') {
                    this.handleTikTokDownload();
                }
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                this.ui.hideModal('downloadModal');
                this.ui.hideModal('settingsModal');
            }
        });
    }
    
    setupAutoSave() {
        // Auto-save form data
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.state.saveToStorage();
            });
        });
    }
    
    startBackgroundTasks() {
        // Update stats every minute
        setInterval(() => this.updateStats(), 60000);
        
        // Clear old cache every 5 minutes
        setInterval(() => this.api.clearCache(), 300000);
        
        // Check API status every 30 seconds
        setInterval(() => this.checkApiStatus(), 30000);
    }
    
    async handleFacebookDownload() {
        const url = this.ui.elements.get('fbUrl')?.value.trim();
        const validation = this.ui.validateUrl(url, 'facebook');
        
        if (!validation.valid) {
            this.ui.showToast(validation.message, 'error');
            return;
        }
        
        this.ui.showLoading(true);
        
        try {
            const options = this.state.getState().settings;
            const result = await this.api.downloadFacebook(url, options);
            
            if (result.success) {
                // Add to download history
                const downloads = this.state.getState().downloads;
                downloads.push({
                    id: this.utils.generateId(),
                    platform: 'facebook',
                    url,
                    date: new Date().toISOString(),
                    success: true
                });
                this.state.setState({ downloads });
                
                // Show download options
                this.ui.showDownloadOptions(result.data);
                
                this.ui.showToast('✅ Video đã sẵn sàng!', 'success');
            } else {
                this.ui.showToast(result.error || 'Lỗi khi xử lý video', 'error');
            }
        } catch (error) {
            console.error('Download error:', error);
            this.ui.showToast('❌ Lỗi kết nối đến server', 'error');
        } finally {
            this.ui.showLoading(false);
        }
    }
    
    async handleTikTokDownload() {
        const url = this.ui.elements.get('ttUrl')?.value.trim();
        const validation = this.ui.validateUrl(url, 'tiktok');
        
        if (!validation.valid) {
            this.ui.showToast(validation.message, 'error');
            return;
        }
        
        this.ui.showLoading(true);
        
        try {
            const options = this.state.getState().settings;
            const result = await this.api.downloadTikTok(url, options);
            
            if (result.success) {
                // Add to download history
                const downloads = this.state.getState().downloads;
                downloads.push({
                    id: this.utils.generateId(),
                    platform: 'tiktok',
                    url,
                    date: new Date().toISOString(),
                    success: true
                });
                this.state.setState({ downloads });
                
                // Show download options
                this.ui.showDownloadOptions(result.data);
                
                this.ui.showToast('✅ Video đã sẵn sàng!', 'success');
            } else {
                this.ui.showToast(result.error || 'Lỗi khi xử lý video', 'error');
            }
        } catch (error) {
            console.error('Download error:', error);
            this.ui.showToast('❌ Lỗi kết nối đến server', 'error');
        } finally {
            this.ui.showLoading(false);
        }
    }
    
    async downloadVideo(url, quality) {
        this.ui.showLoading(true);
        this.ui.updateProgress(0);
        
        try {
            // Simulate download progress
            const interval = setInterval(() => {
                const progress = this.ui.updateProgress;
                const current = parseInt(progress.style.width || '0');
                if (current < 90) {
                    progress(current + 10);
                }
            }, 300);
            
            // Actual download
            const response = await fetch(url);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            
            clearInterval(interval);
            this.ui.updateProgress(100);
            
            // Create download link
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `video_${quality}_${Date.now()}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Clean up
            window.URL.revokeObjectURL(downloadUrl);
            
            this.ui.showToast('📥 Đang tải video xuống...', 'success');
        } catch (error) {
            this.ui.showToast('❌ Lỗi khi tải video', 'error');
        } finally {
            this.ui.showLoading(false);
            setTimeout(() => this.ui.updateProgress(0), 1000);
        }
    }
    
    toggleTheme(theme) {
        this.state.setState({
            settings: { ...this.state.getState().settings, theme }
        });
        this.applyTheme(theme);
        this.state.saveToStorage();
    }
    
    applyTheme(theme) {
        const root = document.documentElement;
        if (theme === 'auto') {
            theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        root.setAttribute('data-theme', theme);
        
        // Update toggle state
        const toggle = this.ui.elements.get('themeToggle');
        if (toggle) {
            toggle.checked = theme === 'light';
        }
    }
    
    async updateStats() {
        try {
            const stats = await this.api.get('/stats');
            this.ui.updateStats(stats);
        } catch (error) {
            // Use local stats if API fails
            const state = this.state.getState();
            const localStats = {
                totalDownloads: state.downloads.length,
                successRate: state.downloads.filter(d => d.success).length / state.downloads.length * 100 || 0,
                totalSize: 0,
                activeUsers: 1
            };
            this.ui.updateStats(localStats);
        }
    }
    
    validateUrl(url, platform) {
        return this.ui.validateUrl(url, platform);
    }
    
    // Public methods for global access
    downloadFacebook() {
        this.handleFacebookDownload();
    }
    
    downloadTikTok() {
        this.handleTikTokDownload();
    }
    
    showSettings() {
        this.ui.showModal('settingsModal');
    }
    
    showHistory() {
        const downloads = this.state.getState().downloads;
        if (downloads.length === 0) {
            this.ui.showToast('Chưa có lịch sử tải về', 'info');
            return;
        }
        
        const historyContent = downloads.map(d => `
            <div class="history-item">
                <div class="platform">${d.platform === 'facebook' ? '🔵' : '⚫'} ${d.platform}</div>
                <div class="date">${new Date(d.date).toLocaleString()}</div>
                <div class="status ${d.success ? 'success' : 'error'}">
                    ${d.success ? '✅' : '❌'}
                </div>
            </div>
        `).join('');
        
        this.ui.showToast(`<strong>Lịch sử tải về</strong><br>${historyContent}`, 'info', 10000);
    }
    
    clearHistory() {
        this.state.setState({ downloads: [] });
        this.state.saveToStorage();
        this.ui.showToast('Đã xóa lịch sử tải về', 'success');
    }
}

// ===== SERVICE WORKER FOR PWA =====
if ('serviceWorker' in navigator && CONFIG.ENABLE_PWA) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

// ===== GLOBAL INITIALIZATION =====
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new Application();
    
    // Expose to global scope
    window.app = app;
    window.ui = app.ui;
    
    // Analytics
    if (CONFIG.ENABLE_ANALYTICS) {
        console.log('📊 Analytics enabled');
    }
});

// Error handling
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    app?.ui?.showToast('⚠️ Đã xảy ra lỗi không mong muốn', 'error');
});

// Unhandled promise rejection
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled rejection:', event.reason);
    app?.ui?.showToast('⚠️ Lỗi xử lý không đồng bộ', 'error');
});
