// API Configuration and Client
class APIClient {
    constructor() {
        // Use deployment config or fallback to production
        const deploymentConfig = window.DEPLOYMENT_CONFIG || window.deploymentConfig || {};
        this.baseURL = deploymentConfig.BACKEND_URL ?
            `${deploymentConfig.BACKEND_URL}/api` :
            'https://pretest-registration.onrender.com/api'; // Fallback to production
        this.isOfflineMode = false; // Now using real backend
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        // Get JWT token from localStorage
        const token = this.getToken();

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers,
            },
            // Add timeout for mobile networks
            signal: AbortSignal.timeout(30000), // 30 seconds timeout
            ...options,
        };


        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                console.error('Response not OK:', { status: response.status, statusText: response.statusText });
            }

            const data = await response.json();

            if (!response.ok) {
                // For registration conflicts (409), return the error data instead of throwing
                if (response.status === 409 && data.code === 'PHONE_EXISTS') {
                    return data; // Return error response with user data
                }

                // For login errors with specific codes, return the error data
                if ((response.status === 404 && data.code === 'USER_NOT_FOUND') ||
                    (response.status === 401 && data.code === 'INVALID_PASSWORD') ||
                    (response.status === 400 && data.code === 'NO_PASSWORD_SET')) {
                    return data; // Return error response with specific code
                }

                console.error('API Error Details:', {
                    status: response.status,
                    statusText: response.statusText,
                    data: data,
                    url: url
                });
                throw new Error(data.message || `API request failed (${response.status})`);
            }

            return data;
        } catch (error) {

            // Handle specific mobile network errors
            if (error.name === 'AbortError') {
                throw new Error('Request timeout. Please check your internet connection and try again.');
            }

            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error. Please check your internet connection.');
            }

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

    // Health check
    async healthCheck() {
        return this.request('/health');
    }

    // Authentication methods
    async login(credentials) {
        return this.request('/registrations/login', {
            method: 'POST',
            body: JSON.stringify({
                phone: credentials.phone,
                password: credentials.password
            })
        });
    }

    // Legacy methods for backward compatibility
    async register(userData) {
        return this.createRegistration({
            user: userData,
            schedule: null
        });
    }

    async get(endpoint) {
        return this.request(endpoint, {
            method: 'GET'
        });
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }

    async saveTestSchedule(userId, scheduleData) {
        // For existing users, we need to update registration
        // This will need to be implemented based on your flow
        return this.createRegistration({
            user: this.getCurrentUser(),
            schedule: scheduleData
        });
    }

    // Error handler
    handleError(error) {

        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return 'Network error. Please check your connection and make sure backend is running.';
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

    setCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
    }

    isAuthenticated() {
        return !!this.getCurrentUser() && !!this.getToken();
    }

    // Token management methods
    getToken() {
        try {
            return localStorage.getItem('authToken');
        } catch {
            return null;
        }
    }

    setToken(token) {
        localStorage.setItem('authToken', token);
    }

    clearToken() {
        localStorage.removeItem('authToken');
    }
}

// Create global instance
const apiClient = new APIClient();

// Export for ES modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIClient, apiClient };
}