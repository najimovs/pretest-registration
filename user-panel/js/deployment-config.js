// Deployment Configuration
const DEPLOYMENT_CONFIG = {
    production: {
        BACKEND_URL: 'https://pretest-registration.onrender.com',
        ADMIN_PANEL_URL: 'https://whimsical-sprite-8f17d6.netlify.app',
        USER_PANEL_URL: 'https://pretest-registration-j57f.vercel.app'
    },
    development: {
        BACKEND_URL: 'http://localhost:8000',
        ADMIN_PANEL_URL: 'http://localhost:3001',
        USER_PANEL_URL: 'http://localhost:3000'
    }
};

// Auto-detect environment
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const config = isDevelopment ? DEPLOYMENT_CONFIG.development : DEPLOYMENT_CONFIG.production;

// Export configuration
window.DEPLOYMENT_CONFIG = config;

// Update API base URL dynamically
if (typeof apiClient !== 'undefined') {
    apiClient.baseURL = config.BACKEND_URL + '/api';
}

console.log('Deployment Config Loaded:', config);