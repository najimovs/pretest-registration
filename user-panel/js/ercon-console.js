// Ercon Mobile Console - Mobil uchun console replacement
class ErconConsole {
    constructor() {
        this.isVisible = false;
        this.logs = [];
        this.maxLogs = 200;
        this.createConsole();
        this.setupGestures();
        this.interceptConsole();
    }

    createConsole() {
        // Console container
        this.container = document.createElement('div');
        this.container.id = 'ercon-console';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            color: #00ff41;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            z-index: 999999;
            display: none;
            flex-direction: column;
            overflow: hidden;
        `;

        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            background: #1a1a1a;
            padding: 10px;
            border-bottom: 1px solid #333;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        const title = document.createElement('div');
        title.textContent = '🐛 Ercon Console';
        title.style.color = '#00ff41';
        title.style.fontWeight = 'bold';

        // Control buttons
        const controls = document.createElement('div');
        controls.style.display = 'flex';
        controls.style.gap = '10px';

        const clearBtn = this.createButton('Clear', () => this.clear());
        const testBtn = this.createButton('Test API', () => this.testAPI());
        const closeBtn = this.createButton('✕', () => this.hide());

        controls.appendChild(clearBtn);
        controls.appendChild(testBtn);
        controls.appendChild(closeBtn);

        header.appendChild(title);
        header.appendChild(controls);

        // Log area
        this.logArea = document.createElement('div');
        this.logArea.style.cssText = `
            flex: 1;
            padding: 10px;
            overflow-y: auto;
            white-space: pre-wrap;
            line-height: 1.4;
        `;

        // Command input
        this.setupCommandInput();

        this.container.appendChild(header);
        this.container.appendChild(this.logArea);
        this.container.appendChild(this.commandContainer);

        document.body.appendChild(this.container);
    }

    createButton(text, onClick) {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.style.cssText = `
            background: #333;
            color: #00ff41;
            border: 1px solid #555;
            padding: 5px 10px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 10px;
        `;
        btn.onclick = onClick;
        return btn;
    }

    setupCommandInput() {
        this.commandContainer = document.createElement('div');
        this.commandContainer.style.cssText = `
            background: #1a1a1a;
            border-top: 1px solid #333;
            padding: 10px;
            display: flex;
            align-items: center;
        `;

        const prompt = document.createElement('span');
        prompt.textContent = '> ';
        prompt.style.color = '#00ff41';

        this.commandInput = document.createElement('input');
        this.commandInput.style.cssText = `
            flex: 1;
            background: transparent;
            border: none;
            color: #00ff41;
            font-family: inherit;
            font-size: inherit;
            outline: none;
        `;

        this.commandInput.placeholder = 'Type JavaScript command...';
        this.commandInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.executeCommand(this.commandInput.value);
                this.commandInput.value = '';
            }
        });

        this.commandContainer.appendChild(prompt);
        this.commandContainer.appendChild(this.commandInput);
    }

    setupGestures() {
        // Four-finger tap to toggle console
        let touchCount = 0;
        let gestureTimer = null;

        document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 4) {
                touchCount++;
                if (touchCount === 1) {
                    gestureTimer = setTimeout(() => {
                        touchCount = 0;
                    }, 1000);
                } else if (touchCount === 2) {
                    clearTimeout(gestureTimer);
                    touchCount = 0;
                    this.toggle();
                }
            }
        });

        // Konami code for desktop/keyboard
        const konamiCode = [
            'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
            'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
            'KeyB', 'KeyA'
        ];
        let konamiIndex = 0;

        document.addEventListener('keydown', (e) => {
            if (e.code === konamiCode[konamiIndex]) {
                konamiIndex++;
                if (konamiIndex === konamiCode.length) {
                    konamiIndex = 0;
                    this.toggle();
                    this.log('🎮 Konami Code activated!', 'success');
                }
            } else {
                konamiIndex = 0;
            }
        });

        // URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('console') === 'true') {
            setTimeout(() => this.show(), 1000);
        }
    }

    interceptConsole() {
        const originalMethods = {
            log: console.log,
            error: console.error,
            warn: console.warn,
            info: console.info
        };

        console.log = (...args) => {
            originalMethods.log.apply(console, args);
            this.addLog('LOG', args.join(' '), '#00ff41');
        };

        console.error = (...args) => {
            originalMethods.error.apply(console, args);
            this.addLog('ERROR', args.join(' '), '#ff4444');
        };

        console.warn = (...args) => {
            originalMethods.warn.apply(console, args);
            this.addLog('WARN', args.join(' '), '#ffaa00');
        };

        console.info = (...args) => {
            originalMethods.info.apply(console, args);
            this.addLog('INFO', args.join(' '), '#44aaff');
        };

        // Catch unhandled errors
        window.addEventListener('error', (e) => {
            this.addLog('UNCAUGHT', `${e.message} at ${e.filename}:${e.lineno}`, '#ff4444');
        });

        window.addEventListener('unhandledrejection', (e) => {
            this.addLog('PROMISE', `Unhandled promise rejection: ${e.reason}`, '#ff4444');
        });
    }

    addLog(type, message, color = '#00ff41') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = {
            type,
            message,
            color,
            timestamp
        };

        this.logs.push(logEntry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        this.renderLogs();
    }

    renderLogs() {
        if (!this.logArea) return;

        this.logArea.innerHTML = '';
        this.logs.forEach(log => {
            const logElement = document.createElement('div');
            logElement.style.color = log.color;
            logElement.innerHTML = `[${log.timestamp}] ${log.type}: ${log.message}`;
            this.logArea.appendChild(logElement);
        });

        this.logArea.scrollTop = this.logArea.scrollHeight;
    }

    executeCommand(command) {
        this.addLog('CMD', `> ${command}`, '#ffff00');

        try {
            const result = eval(command);
            this.addLog('RESULT', JSON.stringify(result, null, 2), '#00ffaa');
        } catch (error) {
            this.addLog('ERROR', error.message, '#ff4444');
        }
    }

    async testAPI() {
        this.addLog('TEST', 'Testing API connection...', '#00aaff');

        try {
            // Get API config
            const config = window.DEPLOYMENT_CONFIG || {};
            const baseURL = config.BACKEND_URL || 'http://localhost:8000';

            this.addLog('TEST', `Backend URL: ${baseURL}`, '#00aaff');

            // Test health endpoint
            const response = await fetch(`${baseURL}/api/health`);

            if (response.ok) {
                const data = await response.json();
                this.addLog('SUCCESS', `API Health: OK (${response.status})`, '#00ff00');
                this.addLog('DATA', JSON.stringify(data, null, 2), '#00ffaa');
            } else {
                this.addLog('ERROR', `API Health: Failed (${response.status})`, '#ff4444');
            }
        } catch (error) {
            this.addLog('ERROR', `API Test failed: ${error.message}`, '#ff4444');
        }
    }

    show() {
        this.container.style.display = 'flex';
        this.isVisible = true;
        if (this.commandInput) {
            setTimeout(() => this.commandInput.focus(), 100);
        }
    }

    hide() {
        this.container.style.display = 'none';
        this.isVisible = false;
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    clear() {
        this.logs = [];
        this.renderLogs();
    }

    // Public API
    log(message, type = 'info') {
        const colors = {
            info: '#00ff41',
            error: '#ff4444',
            warn: '#ffaa00',
            success: '#00ff00'
        };
        this.addLog(type.toUpperCase(), message, colors[type]);
    }
}

// Initialize Ercon Console
const erconConsole = new ErconConsole();
window.erconConsole = erconConsole;

// Show instructions
erconConsole.log('🎮 Ercon Console Ready!');
erconConsole.log('👆 4-finger double-tap to toggle');
erconConsole.log('⌨️ Konami code: ↑↑↓↓←→←→BA');
erconConsole.log('🌐 Or add ?console=true to URL');
erconConsole.log('💡 Type JavaScript commands below!');