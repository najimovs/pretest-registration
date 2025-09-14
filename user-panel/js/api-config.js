// API Configuration and Client
class APIClient {
    constructor() {
        this.baseURL = 'https://pretest-registration.onrender.com/api';
        this.isOfflineMode = false; // Now using real backend
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
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
        console.error('API Error:', error);

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