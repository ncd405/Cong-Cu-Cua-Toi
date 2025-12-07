// Main JavaScript for ToolHub
console.log('ToolHub JavaScript loaded');

// API Configuration
const API_BASE = window.location.origin;

// Common Functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' năm trước';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' tháng trước';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' ngày trước';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' giờ trước';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' phút trước';
    
    return Math.floor(seconds) + ' giây trước';
}

// Mobile Navigation
function initMobileNav() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.innerHTML = navLinks.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }
}

// API Status Check
async function checkAPIStatus(selector = '#apiStatus') {
    try {
        const response = await fetch(`${API_BASE}/api/health`);
        const data = await response.json();
        
        const element = document.querySelector(selector);
        if (element) {
            element.innerHTML = `
                <i class="fas fa-circle" style="color:#10b981"></i>
                <span>API: ${data.status} (v${data.version})</span>
            `;
        }
        
        return data;
    } catch (error) {
        const element = document.querySelector(selector);
        if (element) {
            element.innerHTML = `
                <i class="fas fa-circle" style="color:#ef4444"></i>
                <span>API: Không kết nối</span>
            `;
        }
        return null;
    }
}

// Download History (using localStorage)
function saveToHistory(platform, url, title) {
    try {
        const history = JSON.parse(localStorage.getItem('downloadHistory') || '[]');
        
        const entry = {
            platform,
            url,
            title: title || 'Unknown',
            timestamp: new Date().toISOString(),
            id: Date.now()
        };
        
        history.unshift(entry); // Add to beginning
        if (history.length > 50) history.pop(); // Keep only 50 items
        
        localStorage.setItem('downloadHistory', JSON.stringify(history));
        return entry;
    } catch (error) {
        console.error('Error saving to history:', error);
        return null;
    }
}

function getHistory() {
    try {
        return JSON.parse(localStorage.getItem('downloadHistory') || '[]');
    } catch (error) {
        console.error('Error getting history:', error);
        return [];
    }
}

// Theme Toggle
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    
    // Check saved theme or prefer-color-scheme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        html.classList.add('dark-theme');
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            html.classList.toggle('dark-theme');
            const isDark = html.classList.contains('dark-theme');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            themeToggle.innerHTML = isDark 
                ? '<i class="fas fa-sun"></i>' 
                : '<i class="fas fa-moon"></i>';
        });
        
        // Set initial icon
        const isDark = html.classList.contains('dark-theme');
        themeToggle.innerHTML = isDark 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing ToolHub...');
    
    // Initialize components
    initMobileNav();
    initTheme();
    checkAPIStatus();
    
    // Add dark theme CSS if needed
    if (!document.querySelector('#dark-theme-style')) {
        const darkThemeCSS = `
            .dark-theme {
                --dark: #f9fafb;
                --light: #1f2937;
                --gray: #9ca3af;
                --gray-light: #374151;
                background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
                color: #f9fafb;
            }
            
            .dark-theme .navbar {
                background: rgba(31, 41, 55, 0.95);
            }
            
            .dark-theme .tool-card,
            .dark-theme .downloader-container,
            .dark-theme .url-input,
            .dark-theme .video-info,
            .dark-theme .result {
                background: #374151;
                color: #f9fafb;
            }
            
            .dark-theme .url-input {
                border-color: #4b5563;
                background: #1f2937;
                color: #f9fafb;
            }
            
            .dark-theme .footer {
                background: #111827;
            }
        `;
        
        const style = document.createElement('style');
        style.id = 'dark-theme-style';
        style.textContent = darkThemeCSS;
        document.head.appendChild(style);
    }
    
    // Analytics (optional)
    console.log('ToolHub initialized successfully');
    
    // Show welcome message for first-time visitors
    if (!localStorage.getItem('welcomeShown')) {
        setTimeout(() => {
            console.log('Chào mừng đến với ToolHub!');
            localStorage.setItem('welcomeShown', 'true');
        }, 1000);
    }
});

// Export for use in other scripts
window.ToolHub = {
    API_BASE,
    formatFileSize,
    getTimeAgo,
    saveToHistory,
    getHistory,
    checkAPIStatus
};
