// Mobile Debug Helper
class MobileDebugger {
    constructor() {
        this.logContainer = null;
        this.createDebugInterface();
    }

    createDebugInterface() {
        // Only show debug on mobile or if debug=true in URL
        const urlParams = new URLSearchParams(window.location.search);
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const forceDebug = urlParams.get('debug') === 'true';

        // Also enable if triple-tapping anywhere on screen
        let tapCount = 0;
        let tapTimer = null;

        document.addEventListener('touchstart', () => {
            tapCount++;
            if (tapCount === 1) {
                tapTimer = setTimeout(() => {
                    tapCount = 0;
                }, 500);
            } else if (tapCount === 3) {
                clearTimeout(tapTimer);
                tapCount = 0;
                this.createDebugInterface(); // Force create if not already created
                if (this.logContainer) {
                    this.toggleDebugPanel();
                    this.log('Debug panel activated by triple-tap! 🎉', 'success');
                }
                return;
            }
        });

        if (!isMobile && !forceDebug) return;

        // Create floating debug button
        const debugBtn = document.createElement('button');
        debugBtn.innerHTML = '🐛';
        debugBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: #3B82F6;
            border: none;
            color: white;
            font-size: 20px;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            cursor: pointer;
        `;

        debugBtn.onclick = () => this.toggleDebugPanel();
        document.body.appendChild(debugBtn);

        // Create debug panel
        this.logContainer = document.createElement('div');
        this.logContainer.id = 'mobileDebugPanel';
        this.logContainer.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 20px;
            right: 20px;
            height: 300px;
            background: rgba(0,0,0,0.9);
            color: #00ff00;
            font-family: monospace;
            font-size: 12px;
            padding: 10px;
            border-radius: 8px;
            overflow-y: auto;
            z-index: 9998;
            display: none;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        `;

        // Add clear button
        const clearBtn = document.createElement('button');
        clearBtn.textContent = 'Clear';
        clearBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: #EF4444;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 10px;
            cursor: pointer;
        `;
        clearBtn.onclick = () => this.clearLogs();

        this.logContainer.appendChild(clearBtn);
        document.body.appendChild(this.logContainer);

        // Intercept console.log, console.error, etc.
        this.interceptConsole();

        // Log initial info
        this.log('Mobile Debugger Initialized');
        this.log('User Agent: ' + navigator.userAgent);
        this.log('URL: ' + window.location.href);
        this.log('Online: ' + navigator.onLine);

        if (navigator.connection) {
            this.log('Connection: ' + JSON.stringify({
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            }));
        }

        // Test API immediately
        this.testAPI();
    }

    toggleDebugPanel() {
        if (this.logContainer) {
            const isVisible = this.logContainer.style.display !== 'none';
            this.logContainer.style.display = isVisible ? 'none' : 'block';
        }
    }

    log(message, type = 'info') {
        if (!this.logContainer) return;

        const timestamp = new Date().toLocaleTimeString();
        const colors = {
            info: '#00ff00',
            error: '#ff0000',
            warn: '#ffff00',
            success: '#00ffff'
        };

        const logEntry = document.createElement('div');
        logEntry.style.color = colors[type] || colors.info;
        logEntry.style.marginBottom = '5px';
        logEntry.innerHTML = `[${timestamp}] ${message}`;

        this.logContainer.appendChild(logEntry);
        this.logContainer.scrollTop = this.logContainer.scrollHeight;

        // Limit to last 100 entries
        const entries = this.logContainer.querySelectorAll('div');
        if (entries.length > 100) {
            entries[0].remove();
        }
    }

    clearLogs() {
        if (this.logContainer) {
            // Keep only the clear button
            const clearBtn = this.logContainer.querySelector('button');
            this.logContainer.innerHTML = '';
            if (clearBtn) {
                this.logContainer.appendChild(clearBtn);
            }
        }
    }

    interceptConsole() {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        console.log = (...args) => {
            originalLog.apply(console, args);
            this.log(args.join(' '), 'info');
        };

        console.error = (...args) => {
            originalError.apply(console, args);
            this.log('ERROR: ' + args.join(' '), 'error');
        };

        console.warn = (...args) => {
            originalWarn.apply(console, args);
            this.log('WARN: ' + args.join(' '), 'warn');
        };
    }

    async testAPI() {
        this.log('Testing API connection...');

        try {
            // Get deployment config
            const config = window.DEPLOYMENT_CONFIG || window.deploymentConfig;
            const baseURL = config?.BACKEND_URL || 'http://localhost:8000';

            this.log('Backend URL: ' + baseURL);

            // Test health endpoint
            const response = await fetch(`${baseURL}/api/health`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const data = await response.json();
                this.log('API Health Check: SUCCESS', 'success');
                this.log('Response: ' + JSON.stringify(data));
            } else {
                this.log('API Health Check: FAILED - ' + response.status + ' ' + response.statusText, 'error');
            }

        } catch (error) {
            this.log('API Health Check: ERROR - ' + error.message, 'error');
        }
    }

    // Method to test specific endpoints
    async testEndpoint(endpoint, options = {}) {
        this.log(`Testing endpoint: ${endpoint}`);

        try {
            const config = window.DEPLOYMENT_CONFIG || window.deploymentConfig;
            const baseURL = config?.BACKEND_URL || 'http://localhost:8000';
            const url = `${baseURL}/api${endpoint}`;

            const response = await fetch(url, {
                headers: { 'Content-Type': 'application/json' },
                ...options
            });

            this.log(`${endpoint} response: ${response.status}`, response.ok ? 'success' : 'error');

            if (response.ok) {
                const data = await response.json();
                this.log(`${endpoint} data: ${JSON.stringify(data).substring(0, 200)}...`);
            }

            return response;
        } catch (error) {
            this.log(`${endpoint} error: ${error.message}`, 'error');
            throw error;
        }
    }
}

// Create global instance
const mobileDebugger = new MobileDebugger();
window.mobileDebugger = mobileDebugger;