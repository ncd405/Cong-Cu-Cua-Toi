// LocalStorage manager for Công Cụ Của Tôi
export class StorageManager {
    constructor(prefix = 'cct_') {
        this.prefix = prefix;
    }
    
    // Generate storage key
    _getKey(key) {
        return `${this.prefix}${key}`;
    }
    
    // Check if localStorage is available
    static isAvailable() {
        try {
            const testKey = '__test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    // Set item
    set(key, value, ttl = null) {
        if (!StorageManager.isAvailable()) {
            console.warn('localStorage is not available');
            return false;
        }
        
        try {
            const data = {
                value: value,
                timestamp: Date.now(),
                ttl: ttl
            };
            
            localStorage.setItem(this._getKey(key), JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }
    
    // Get item
    get(key, defaultValue = null) {
        if (!StorageManager.isAvailable()) {
            return defaultValue;
        }
        
        try {
            const item = localStorage.getItem(this._getKey(key));
            
            if (!item) {
                return defaultValue;
            }
            
            const data = JSON.parse(item);
            
            // Check if item has expired
            if (data.ttl && Date.now() - data.timestamp > data.ttl) {
                this.remove(key);
                return defaultValue;
            }
            
            return data.value;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    }
    
    // Remove item
    remove(key) {
        if (!StorageManager.isAvailable()) {
            return false;
        }
        
        try {
            localStorage.removeItem(this._getKey(key));
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }
    
    // Clear all app data
    clear() {
        if (!StorageManager.isAvailable()) {
            return false;
        }
        
        try {
            const keysToRemove = [];
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(this.prefix)) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });
            
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
    
    // Get all keys
    keys() {
        if (!StorageManager.isAvailable()) {
            return [];
        }
        
        const keys = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.prefix)) {
                keys.push(key.replace(this.prefix, ''));
            }
        }
        
        return keys;
    }
    
    // Get storage usage
    static getUsage() {
        if (!StorageManager.isAvailable()) {
            return { used: 0, total: 0, percent: 0 };
        }
        
        let total = 0;
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            total += key.length + value.length;
        }
        
        // Convert to KB
        total = total / 1024;
        
        // Most browsers have 5-10MB limit
        const limit = 5 * 1024; // 5MB in KB
        const percent = (total / limit) * 100;
        
        return {
            used: Math.round(total * 100) / 100,
            total: limit,
            percent: Math.round(percent * 100) / 100
        };
    }
    
    // Save user settings
    saveSettings(settings) {
        return this.set('settings', settings);
    }
    
    // Load user settings
    loadSettings(defaultSettings = {}) {
        return this.get('settings', defaultSettings);
    }
    
    // Save download history
    saveHistory(history) {
        // Keep only last 100 items to prevent storage overflow
        const limitedHistory = history.slice(-100);
        return this.set('download_history', limitedHistory);
    }
    
    // Load download history
    loadHistory() {
        return this.get('download_history', []);
    }
    
    // Add to download history
    addToHistory(item) {
        const history = this.loadHistory();
        history.push({
            ...item,
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            timestamp: new Date().toISOString()
        });
        return this.saveHistory(history);
    }
    
    // Clear download history
    clearHistory() {
        return this.set('download_history', []);
    }
    
    // Save theme preference
    saveTheme(theme) {
        return this.set('theme', theme);
    }
    
    // Load theme preference
    loadTheme(defaultTheme = 'dark') {
        return this.get('theme', defaultTheme);
    }
}

// Create default instance
const storage = new StorageManager();

export default storage;
