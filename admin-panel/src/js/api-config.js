// API Configuration and Client
class APIClient {
    constructor() {
        this.baseURL = 'http://localhost:8000/api';
        this.isOfflineMode = false; // Now using real backend
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
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                // Handle token expiration
                if (response.status === 401 && adminSession.token) {
                    localStorage.removeItem('adminSession');
                    window.location.href = 'login.html';
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

// Export for ES modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIClient, apiClient };
}