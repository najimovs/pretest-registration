// API Configuration and Client
class APIClient {
    constructor() {
        // Use deployment config if available, otherwise fallback to localhost
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const backendUrl = isDevelopment ? 'http://localhost:8000' : 'https://pretest-registration.onrender.com';
        this.baseURL = `${backendUrl}/api`;
        this.isOfflineMode = false; // Now using real backend

        console.log('API Client initialized with baseURL:', this.baseURL);
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        // Get admin token from localStorage
        const adminSession = JSON.parse(localStorage.getItem('adminSession') || '{}');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        // Add authorization header if admin token exists
        if (adminSession.token) {
            headers.Authorization = `Bearer ${adminSession.token}`;
        }

        const config = {
            headers,
            ...options,
        };

        try {
            console.log('API Request:', {
                url,
                method: config.method || 'GET',
                headers: config.headers,
                baseURL: this.baseURL
            });

            const response = await fetch(url, config);
            const data = await response.json();

            console.log('API Response:', {
                status: response.status,
                ok: response.ok,
                data
            });

            if (!response.ok) {
                // Handle token expiration
                if (response.status === 401 && adminSession.token) {
                    console.log('401 Unauthorized - clearing session and redirecting to login');
                    localStorage.removeItem('adminSession');
                    window.location.href = './login.html';
                    return;
                }
                throw new Error(data.message || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }

    // Create registration (combines user registration and test scheduling)
    async createRegistration(registrationData) {
        return this.request('/registrations/register', {
            method: 'POST',
            body: JSON.stringify(registrationData),
        });
    }

    // Get all registrations (admin only)
    async getAllRegistrations() {
        return this.request('/registrations/all');
    }

    // Update registration status (admin only)
    async updateRegistrationStatus(registrationId, status) {
        return this.request(`/registrations/${registrationId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    }

    // Delete registration (admin only)
    async deleteRegistration(registrationId) {
        return this.request(`/registrations/${registrationId}`, {
            method: 'DELETE',
        });
    }

    // Admin login
    async adminLogin(username, password) {
        return this.request('/registrations/admin/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
    }

    // Health check
    async healthCheck() {
        return this.request('/health');
    }

    // Legacy methods for backward compatibility
    async register(userData) {
        return this.createRegistration({
            user: userData,
            schedule: null
        });
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Error handler
    handleError(error) {
        console.error('API Error:', error);
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return 'Network error. Please check your connection.';
        }
        
        return error.message || 'Something went wrong. Please try again.';
    }

    // Utility methods
    getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem('currentUser'));
        } catch {
            return null;
        }
    }

    logout() {
        localStorage.removeItem('currentUser');
    }

    isAuthenticated() {
        return !!this.getCurrentUser();
    }
}

// Create global instance
const apiClient = new APIClient();

// Update API base URL immediately if deployment config exists
if (window.DEPLOYMENT_CONFIG) {
    apiClient.baseURL = window.DEPLOYMENT_CONFIG.BACKEND_URL + '/api';
    console.log('API Client URL updated from deployment config (immediate):', apiClient.baseURL);
}

// Also update on load event as backup
window.addEventListener('load', () => {
    if (window.DEPLOYMENT_CONFIG && !apiClient.baseURL.includes(window.DEPLOYMENT_CONFIG.BACKEND_URL)) {
        apiClient.baseURL = window.DEPLOYMENT_CONFIG.BACKEND_URL + '/api';
        console.log('API Client URL updated from deployment config (on load):', apiClient.baseURL);
    }
});

// Update when deployment config script finishes loading
document.addEventListener('DOMContentLoaded', () => {
    if (window.DEPLOYMENT_CONFIG && !apiClient.baseURL.includes(window.DEPLOYMENT_CONFIG.BACKEND_URL)) {
        apiClient.baseURL = window.DEPLOYMENT_CONFIG.BACKEND_URL + '/api';
        console.log('API Client URL updated from deployment config (DOM ready):', apiClient.baseURL);
    }
});

// Export for ES modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIClient, apiClient };
}