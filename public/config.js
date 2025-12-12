// Configuration for Công Cụ Của Tôi
const CONFIG = {
    // App Info
    APP_NAME: 'Công Cụ Của Tôi',
    VERSION: '2.0.0',
    AUTHOR: 'ncd405',
    REPOSITORY: 'https://github.com/ncd405/Cong-Cu-Cua-Toi',
    
    // API Configuration
    API_BASE: '/api',
    API_TIMEOUT: 30000,
    API_RETRY_ATTEMPTS: 3,
    
    // Cache Configuration
    CACHE_ENABLED: true,
    CACHE_TTL: 5 * 60 * 1000, // 5 minutes
    CACHE_PREFIX: 'cct_',
    
    // Download Settings
    DEFAULT_QUALITY: 'best',
    DEFAULT_FORMAT: 'mp4',
    MAX_FILE_SIZE: 500 * 1024 * 1024, // 500MB
    
    // UI Settings
    THEME: 'dark', // dark, light, auto
    ANIMATIONS: true,
    NOTIFICATIONS: true,
    
    // Analytics (optional)
    ANALYTICS_ENABLED: false,
    ANALYTICS_ID: null,
    
    // PWA Settings
    PWA_ENABLED: true,
    PWA_CACHE_NAME: 'cong-cu-cua-toi-v2',
    
    // Feature Flags
    FEATURES: {
        FACEBOOK_DOWNLOAD: true,
        TIKTOK_DOWNLOAD: true,
        AUDIO_EXTRACT: true,
        HISTORY: true,
        SETTINGS: true,
        SHARE: true
    }
};

export default CONFIG;
