// Deployment Configuration
const DEPLOYMENT_CONFIG = {
    production: {
        BACKEND_URL: 'https://pretest-registration.onrender.com',
        ADMIN_PANEL_URL: 'https://whimsical-sprite-8f17d6.netlify.app',
        USER_PANEL_URL: 'https://fantastic-seahorse-9ee1ac.netlify.app'
    },
    development: {
        BACKEND_URL: 'http://localhost:8000',
        ADMIN_PANEL_URL: 'http://localhost:3001',
        USER_PANEL_URL: 'http://localhost:3000'
    }
};

// Navigation helper functions
window.navigateToUserPanel = function() {
    window.open(config.USER_PANEL_URL, '_blank');
};

window.navigateToAdminPanel = function() {
    window.open(config.ADMIN_PANEL_URL, '_blank');
};

// Force production config for now since localhost backend isn't running
// Auto-detect environment
const isDevelopment = false; // Temporarily forced to false
// const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const config = isDevelopment ? DEPLOYMENT_CONFIG.development : DEPLOYMENT_CONFIG.production;


// Export configuration
window.DEPLOYMENT_CONFIG = config;

// Update API base URL dynamically
if (typeof apiClient !== 'undefined') {
    apiClient.baseURL = config.BACKEND_URL + '/api';
}

// Also set it for when APIClient is initialized later
window.deploymentConfig = config;

