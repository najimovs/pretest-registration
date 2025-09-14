// API Configuration and Client
class APIClient {
    constructor() {
        this.baseURL = 'http://localhost:8000/api';
        this.isOfflineMode = false; // Now using real backend
    }

    // Mock data for development
    getMockUsers() {
        return JSON.parse(localStorage.getItem('mockUsers') || '[]');
    }

    saveMockUsers(users) {
        localStorage.setItem('mockUsers', JSON.stringify(users));
    }

    getMockRegistrations() {
        return JSON.parse(localStorage.getItem('mockRegistrations') || '[]');
    }

    saveMockRegistrations(registrations) {
        localStorage.setItem('mockRegistrations', JSON.stringify(registrations));
    }

    // Auth methods
    async register(userData) {
        if (this.isOfflineMode) {
            return this.mockRegister(userData);
        }
        
        try {
            const response = await fetch(`${this.baseURL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }
            
            return data;
        } catch (error) {
            throw error;
        }
    }

    async login(credentials) {
        if (this.isOfflineMode) {
            return this.mockLogin(credentials);
        }
        
        try {
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }
            
            return data;
        } catch (error) {
            throw error;
        }
    }

    // Mock implementations for development
    mockRegister(userData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const users = this.getMockUsers();
                
                // Check if user already exists
                const existingUser = users.find(user => user.phone === userData.phone);
                if (existingUser) {
                    reject(new Error('User with this phone number already exists'));
                    return;
                }
                
                // Create new user
                const newUser = {
                    id: Date.now(),
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    phone: userData.phone,
                    email: userData.email,
                    password: userData.password, // In real app, this would be hashed
                    createdAt: new Date().toISOString(),
                    testSchedule: null
                };
                
                users.push(newUser);
                this.saveMockUsers(users);
                
                resolve({
                    success: true,
                    message: 'Registration successful',
                    data: {
                        user: {
                            id: newUser.id,
                            firstName: newUser.firstName,
                            lastName: newUser.lastName,
                            phone: newUser.phone,
                            email: newUser.email
                        }
                    }
                });
            }, 1000); // Simulate network delay
        });
    }

    mockLogin(credentials) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const users = this.getMockUsers();
                
                // Find user by phone
                const user = users.find(u => u.phone === credentials.phone && u.password === credentials.password);
                
                if (!user) {
                    reject(new Error('Invalid phone number or password'));
                    return;
                }
                
                resolve({
                    success: true,
                    message: 'Login successful',
                    data: {
                        user: {
                            id: user.id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            phone: user.phone,
                            email: user.email,
                            testSchedule: user.testSchedule
                        }
                    }
                });
            }, 1000); // Simulate network delay
        });
    }

    // Schedule methods
    async saveTestSchedule(userId, scheduleData) {
        if (this.isOfflineMode) {
            return this.mockSaveSchedule(userId, scheduleData);
        }
        
        try {
            const response = await fetch(`${this.baseURL}/schedule/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, ...scheduleData })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to save schedule');
            }
            
            return data;
        } catch (error) {
            throw error;
        }
    }

    mockSaveSchedule(userId, scheduleData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const users = this.getMockUsers();
                const userIndex = users.findIndex(u => u.id === userId);
                
                if (userIndex !== -1) {
                    users[userIndex].testSchedule = {
                        ...scheduleData,
                        registeredAt: new Date().toISOString()
                    };
                    this.saveMockUsers(users);
                    
                    // Also save to registrations for admin view
                    const registrations = this.getMockRegistrations();
                    registrations.push({
                        id: Date.now(),
                        user: users[userIndex],
                        schedule: users[userIndex].testSchedule,
                        status: 'scheduled',
                        createdAt: new Date().toISOString()
                    });
                    this.saveMockRegistrations(registrations);
                }
                
                resolve({
                    success: true,
                    message: 'Schedule saved successfully',
                    data: { schedule: scheduleData }
                });
            }, 500);
        });
    }

    // Get all registrations (for admin)
    async getAllRegistrations() {
        if (this.isOfflineMode) {
            return this.mockGetAllRegistrations();
        }

        try {
            const response = await fetch(`${this.baseURL}/registrations/all`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch registrations');
            }

            return data;
        } catch (error) {
            console.warn('Backend unavailable, falling back to mock data:', error);
            this.isOfflineMode = true;
            return this.mockGetAllRegistrations();
        }
    }

    mockGetAllRegistrations() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const registrations = this.getMockRegistrations();
                resolve({
                    success: true,
                    data: { registrations }
                });
            }, 300);
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