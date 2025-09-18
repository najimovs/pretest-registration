// Network Helper for Mobile Compatibility
class NetworkHelper {
    constructor() {
        this.isOnline = navigator.onLine;
        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showNetworkStatus('Connected', 'success');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showNetworkStatus('No internet connection', 'error');
        });
    }

    async checkConnection() {
        // Try to fetch a small resource to verify connectivity
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            await fetch('/favicon.ico', {
                method: 'HEAD',
                cache: 'no-cache',
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            return true;
        } catch (error) {
            return false;
        }
    }

    async testBackendConnection() {
        try {
            // Use the same base URL as APIClient
            const deploymentConfig = window.DEPLOYMENT_CONFIG || {};
            const baseURL = deploymentConfig.BACKEND_URL || 'http://localhost:8000';


            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            const response = await fetch(`${baseURL}/api/health`, {
                method: 'GET',
                cache: 'no-cache',
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                return { success: true, data };
            } else {
                console.error('Backend responded with error:', response.status, response.statusText);
                return { success: false, error: `Server error: ${response.status}` };
            }
        } catch (error) {
            console.error('Backend connection failed:', error);

            let errorMessage = 'Connection failed';
            if (error.name === 'AbortError') {
                errorMessage = 'Connection timeout - server may be slow or unreachable';
            } else if (error.name === 'TypeError') {
                errorMessage = 'Network error - check your internet connection';
            }

            return { success: false, error: errorMessage };
        }
    }

    showNetworkStatus(message, type = 'info') {
        // Remove existing network status
        const existingStatus = document.querySelector('.network-status');
        if (existingStatus) {
            existingStatus.remove();
        }

        // Create network status element
        const statusElement = document.createElement('div');
        statusElement.className = `network-status ${type}`;
        statusElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
            transition: all 0.3s ease;
            transform: translateX(100%);
        `;
        statusElement.textContent = message;

        document.body.appendChild(statusElement);

        // Animate in
        setTimeout(() => {
            statusElement.style.transform = 'translateX(0)';
        }, 100);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (statusElement.parentNode) {
                statusElement.style.transform = 'translateX(100%)';
                setTimeout(() => statusElement.remove(), 300);
            }
        }, 3000);
    }

    // Utility method to get connection info
    getConnectionInfo() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

        if (connection) {
            return {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData
            };
        }

        return null;
    }

    // Method to retry failed requests
    async retryOperation(operation, maxRetries = 3, delay = 1000) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {

                if (attempt === maxRetries) {
                    throw error;
                }

                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, delay * attempt));
            }
        }
    }
}

// Create global instance
const networkHelper = new NetworkHelper();

// Export for use in other modules
window.networkHelper = networkHelper;

// Test backend connection on load
document.addEventListener('DOMContentLoaded', async () => {
    const result = await networkHelper.testBackendConnection();

    if (!result.success) {
        networkHelper.showNetworkStatus(`Server connection failed: ${result.error}`, 'error');
    } else {
    }
});