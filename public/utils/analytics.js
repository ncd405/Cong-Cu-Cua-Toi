// Analytics tracker for Công Cụ Của Tôi
export class Analytics {
    constructor(enabled = false) {
        this.enabled = enabled;
        this.events = [];
        this.maxQueueSize = 100;
    }
    
    // Enable/disable analytics
    setEnabled(enabled) {
        this.enabled = enabled;
        if (enabled) {
            this._sendQueuedEvents();
        }
    }
    
    // Track page view
    trackPageView(pageName, properties = {}) {
        if (!this.enabled) return;
        
        const event = {
            type: 'page_view',
            name: pageName,
            properties: {
                ...properties,
                url: window.location.href,
                referrer: document.referrer,
                timestamp: new Date().toISOString()
            }
        };
        
        this._addEvent(event);
        console.log('Page view tracked:', pageName);
    }
    
    // Track event
    trackEvent(eventName, properties = {}) {
        if (!this.enabled) return;
        
        const event = {
            type: 'event',
            name: eventName,
            properties: {
                ...properties,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                screen: `${window.screen.width}x${window.screen.height}`
            }
        };
        
        this._addEvent(event);
        console.log('Event tracked:', eventName, properties);
    }
    
    // Track download
    trackDownload(platform, url, success = true, error = null) {
        if (!this.enabled) return;
        
        const event = {
            type: 'download',
            name: `${platform}_download`,
            properties: {
                platform,
                url: this._sanitizeUrl(url),
                success,
                error: error ? error.message : null,
                timestamp: new Date().toISOString()
            }
        };
        
        this._addEvent(event);
    }
    
    // Track error
    trackError(error, context = '') {
        if (!this.enabled) return;
        
        const event = {
            type: 'error',
            name: 'app_error',
            properties: {
                errorName: error.name,
                errorMessage: error.message,
                context,
                stack: error.stack,
                timestamp: new Date().toISOString(),
                url: window.location.href
            }
        };
        
        this._addEvent(event);
    }
    
    // Add event to queue
    _addEvent(event) {
        this.events.push(event);
        
        // Keep queue size manageable
        if (this.events.length > this.maxQueueSize) {
            this.events = this.events.slice(-this.maxQueueSize);
        }
        
        // Try to send immediately
        this._sendEvent(event);
    }
    
    // Send event to server
    async _sendEvent(event) {
        try {
            // In a real app, you would send to your analytics endpoint
            // For now, we'll just log it
            if (process.env.NODE_ENV === 'development') {
                console.log('Analytics event:', event);
            }
            
            // Example of sending to an endpoint:
            // await fetch('/api/analytics/track', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(event)
            // });
            
            return true;
        } catch (error) {
            console.error('Failed to send analytics event:', error);
            return false;
        }
    }
    
    // Send queued events
    async _sendQueuedEvents() {
        const eventsToSend = [...this.events];
        this.events = [];
        
        for (const event of eventsToSend) {
            await this._sendEvent(event);
        }
    }
    
    // Sanitize URL (remove sensitive data)
    _sanitizeUrl(url) {
        try {
            const urlObj = new URL(url);
            
            // Remove query parameters that might contain sensitive data
            const safeParams = ['v', 'id', 'video_id'];
            const params = new URLSearchParams(urlObj.search);
            
            // Keep only safe parameters
            const safeSearch = [];
            for (const [key, value] of params) {
                if (safeParams.includes(key)) {
                    safeSearch.push(`${key}=${value}`);
                }
            }
            
            urlObj.search = safeSearch.length > 0 ? `?${safeSearch.join('&')}` : '';
            
            return urlObj.toString();
        } catch {
            // If URL parsing fails, return a sanitized version
            return url.replace(/[?&](token|auth|password|secret)=[^&]*/g, '');
        }
    }
    
    // Get analytics data
    getData() {
        return {
            enabled: this.enabled,
            eventCount: this.events.length,
            events: [...this.events]
        };
    }
    
    // Clear analytics data
    clear() {
        this.events = [];
    }
}

// Create default instance
const analytics = new Analytics(false); // Disabled by default

export default analytics;
