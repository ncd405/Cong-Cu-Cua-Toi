// ===== CONFIGURATION =====
const CONFIG = {
    API_BASE: '/api',
    VERSION: '1.0.0'
};

// ===== STATE =====
let state = {
    apiStatus: 'unknown',
    notifications: []
};

// ===== DOM ELEMENTS =====
const elements = {
    fbUrl: null,
    ttUrl: null,
    toast: null
};

// ===== INITIALIZATION =====
function init() {
    console.log('🚀 Công Cụ Của Tôi đang khởi động...');
    
    // Cache DOM elements
    elements.fbUrl = document.getElementById('fbUrl');
    elements.ttUrl = document.getElementById('ttUrl');
    elements.toast = document.getElementById('toast');
    
    // Check API status
    checkApiStatus();
    
    // Set up event listeners
    setupEventListeners();
    
    // Auto-focus first input
    if (elements.fbUrl) {
        setTimeout(() => elements.fbUrl.focus(), 500);
    }
    
    console.log('✅ Ứng dụng đã khởi động!');
}

// ===== API FUNCTIONS =====
async function checkApiStatus() {
    try {
        const response = await fetch(`${CONFIG.API_BASE}/health`);
        const data = await response.json();
        
        state.apiStatus = 'healthy';
        updateApiStatusUI('✅ API đang hoạt động', 'success');
        
        return data;
    } catch (error) {
        state.apiStatus = 'unhealthy';
        updateApiStatusUI('⚠️ API đang bảo trì', 'warning');
        return null;
    }
}

function updateApiStatusUI(text, type) {
    const statusElement = document.getElementById('apiStatus');
    if (statusElement) {
        statusElement.textContent = text;
        statusElement.className = `api-status ${type}`;
    }
}

// ===== TOOL FUNCTIONS =====
async function downloadFacebook() {
    const url = elements.fbUrl?.value.trim();
    
    if (!url) {
        showToast('Thiếu thông tin', 'Vui lòng nhập URL video Facebook', 'warning');
        return;
    }
    
    if (!isValidFacebookUrl(url)) {
        showToast('URL không hợp lệ', 'Vui lòng nhập URL Facebook chính xác', 'error');
        return;
    }
    
    showToast('Đang xử lý', 'Đang phân tích video Facebook...', 'info');
    
    try {
        const response = await fetch(`${CONFIG.API_BASE}/facebook/download`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Thành công', data.message, 'success');
            showDownloadOptions('facebook', data.data);
        } else {
            showToast('Thất bại', data.error || 'Không thể xử lý video', 'error');
        }
    } catch (error) {
        showToast('Lỗi kết nối', 'Không thể kết nối đến server', 'error');
        console.error('Download error:', error);
    }
}

async function downloadTikTok() {
    const url = elements.ttUrl?.value.trim();
    
    if (!url) {
        showToast('Thiếu thông tin', 'Vui lòng nhập URL video TikTok', 'warning');
        return;
    }
    
    if (!isValidTikTokUrl(url)) {
        showToast('URL không hợp lệ', 'Vui lòng nhập URL TikTok chính xác', 'error');
        return;
    }
    
    showToast('Đang xử lý', 'Đang phân tích video TikTok...', 'info');
    
    try {
        const response = await fetch(`${CONFIG.API_BASE}/tiktok/download`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Thành công', data.message, 'success');
            showDownloadOptions('tiktok', data.data);
        } else {
            showToast('Thất bại', data.error || 'Không thể xử lý video', 'error');
        }
    } catch (error) {
        showToast('Lỗi kết nối', 'Không thể kết nối đến server', 'error');
        console.error('Download error:', error);
    }
}

// ===== UTILITY FUNCTIONS =====
function isValidFacebookUrl(url) {
    return url && (url.includes('facebook.com') || url.includes('fb.watch'));
}

function isValidTikTokUrl(url) {
    return url && url.includes('tiktok.com');
}

function showToast(title, message, type = 'info') {
    const toast = elements.toast;
    if (!toast) return;
    
    // Set icon based on type
    const iconMap = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">${iconMap[type] || 'ℹ️'}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="hideToast()">×</button>
    `;
    
    // Set color
    const colorMap = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    
    toast.style.borderLeft = `4px solid ${colorMap[type] || '#3b82f6'}`;
    
    // Show toast
    toast.style.display = 'flex';
    
    // Auto hide after 5 seconds
    setTimeout(hideToast, 5000);
}

function hideToast() {
    if (elements.toast) {
        elements.toast.style.display = 'none';
    }
}

function showDownloadOptions(platform, data) {
    // This would show a modal with download options
    console.log(`${platform} download options:`, data);
    
    // For now, just log to console
    setTimeout(() => {
        alert(`📥 ${platform.toUpperCase()} VIDEO READY\n\n` +
              `Chất lượng có sẵn:\n` +
              (data.qualities ? data.qualities.map(q => `• ${q.quality} (${q.size})`).join('\n') : 'HD, SD, 360p') +
              `\n\nAPI Demo - Phiên bản thực sẽ có tải về thực tế`);
    }, 1000);
}

function setupEventListeners() {
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            if (document.activeElement === elements.fbUrl) downloadFacebook();
            if (document.activeElement === elements.ttUrl) downloadTikTok();
        }
    });
    
    // URL validation on input
    if (elements.fbUrl) {
        elements.fbUrl.addEventListener('input', function() {
            this.style.borderColor = isValidFacebookUrl(this.value) ? '#10b981' : '';
        });
    }
    
    if (elements.ttUrl) {
        elements.ttUrl.addEventListener('input', function() {
            this.style.borderColor = isValidTikTokUrl(this.value) ? '#10b981' : '';
        });
    }
}

// ===== EXPORT FUNCTIONS TO GLOBAL SCOPE =====
window.downloadFacebook = downloadFacebook;
window.downloadTikTok = downloadTikTok;
window.hideToast = hideToast;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
