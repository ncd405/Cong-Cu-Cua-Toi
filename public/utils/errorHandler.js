// Error handling for Công Cụ Của Tôi
export class ErrorHandler {
    static handleError(error, context = '') {
        console.error(`[Error${context ? ' in ' + context : ''}]:`, error);
        
        // Log to console with more details
        if (process.env.NODE_ENV === 'development') {
            console.group('Error Details');
            console.log('Timestamp:', new Date().toISOString());
            console.log('Context:', context);
            console.log('Error Object:', error);
            console.log('Stack:', error.stack);
            console.groupEnd();
        }
        
        // Return user-friendly message
        return this.getUserFriendlyMessage(error, context);
    }
    
    static getUserFriendlyMessage(error, context = '') {
        const errorType = error?.name || 'UnknownError';
        
        const errorMessages = {
            // Network errors
            'NetworkError': 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn.',
            'TimeoutError': 'Yêu cầu đã hết thời gian chờ. Vui lòng thử lại.',
            
            // API errors
            'HttpError': 'Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.',
            'ApiError': 'Lỗi xử lý dữ liệu từ máy chủ.',
            
            // Validation errors
            'ValidationError': 'Dữ liệu nhập không hợp lệ. Vui lòng kiểm tra lại.',
            'InvalidUrlError': 'URL không hợp lệ. Vui lòng kiểm tra lại đường link.',
            
            // Download errors
            'DownloadError': 'Không thể tải video. Vui lòng thử lại với video khác.',
            'VideoNotFoundError': 'Không tìm thấy video. Vui lòng kiểm tra lại URL.',
            'UnsupportedFormatError': 'Định dạng video không được hỗ trợ.',
            
            // Browser errors
            'QuotaExceededError': 'Bộ nhớ đã đầy. Vui lòng xóa bớt dữ liệu.',
            'SecurityError': 'Lỗi bảo mật. Vui lòng thử lại.',
            
            // General errors
            'UnknownError': 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.',
            'ServerError': 'Lỗi máy chủ. Vui lòng thử lại sau.'
        };
        
        // Check if we have a specific message for this error
        if (errorMessages[errorType]) {
            return errorMessages[errorType];
        }
        
        // Check error message for common patterns
        const errorMessage = error?.message?.toLowerCase() || '';
        
        if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
            return 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.';
        }
        
        if (errorMessage.includes('timeout')) {
            return 'Yêu cầu đã hết thời gian chờ. Vui lòng thử lại.';
        }
        
        if (errorMessage.includes('404') || errorMessage.includes('not found')) {
            return 'Không tìm thấy tài nguyên. Vui lòng kiểm tra lại URL.';
        }
        
        if (errorMessage.includes('500') || errorMessage.includes('server')) {
            return 'Lỗi máy chủ. Vui lòng thử lại sau.';
        }
        
        if (errorMessage.includes('quota') || errorMessage.includes('storage')) {
            return 'Bộ nhớ đã đầy. Vui lòng xóa bớt dữ liệu.';
        }
        
        // Default message
        return 'Đã xảy ra lỗi. Vui lòng thử lại.';
    }
    
    static isNetworkError(error) {
        const networkErrors = [
            'NetworkError',
            'TypeError', // Often occurs with fetch
            'AbortError'
        ];
        
        return networkErrors.includes(error?.name) || 
               error?.message?.toLowerCase().includes('network') ||
               error?.message?.toLowerCase().includes('fetch') ||
               error?.message?.toLowerCase().includes('failed to fetch');
    }
    
    static isClientError(error) {
        const clientErrors = [
            'ValidationError',
            'InvalidUrlError',
            'QuotaExceededError'
        ];
        
        return clientErrors.includes(error?.name) ||
               (error?.status >= 400 && error?.status < 500);
    }
    
    static isServerError(error) {
        return error?.status >= 500 || 
               error?.message?.toLowerCase().includes('server') ||
               error?.message?.toLowerCase().includes('500');
    }
    
    static createError(name, message, originalError = null) {
        const error = new Error(message);
        error.name = name;
        
        if (originalError) {
            error.originalError = originalError;
            error.stack = originalError.stack || error.stack;
        }
        
        return error;
    }
    
    static logToServer(error, context = '') {
        // This would send error to your error tracking service
        // For now, just log to console
        const errorData = {
            timestamp: new Date().toISOString(),
            context,
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            userAgent: navigator.userAgent,
            url: window.location.href,
            platform: navigator.platform
        };
        
        console.log('Error logged:', errorData);
        
        // In a real app, you would send this to your error tracking service
        // Example:
        // fetch('/api/logs/error', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(errorData)
        // });
    }
    
    static setupGlobalErrorHandling() {
        // Handle uncaught errors
        window.addEventListener('error', (event) => {
            this.handleError(event.error, 'global');
            this.logToServer(event.error, 'global');
        });
        
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, 'unhandled-rejection');
            this.logToServer(event.reason, 'unhandled-rejection');
        });
        
        // Handle offline/online events
        window.addEventListener('offline', () => {
            console.log('App is offline');
            // You could show a notification here
        });
        
        window.addEventListener('online', () => {
            console.log('App is back online');
            // You could show a notification here
        });
    }
}
