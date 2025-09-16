// Admin dashboard functionality
class AdminDashboard {
    constructor() {
        this.registrations = [];
        this.refreshInterval = null;
        this.nextRowNumber = 1; // Track the next row number to assign
        this.init();
    }

    async init() {
        await this.loadRegistrations();
        this.updateStatistics();
        this.populateTable();
        this.startAutoRefresh();
    }

    startAutoRefresh() {
        // Refresh every 30 seconds to show new registrations
        this.refreshInterval = setInterval(async () => {
            console.log('Auto-refreshing registrations...');
            await this.loadRegistrations();
            this.updateStatistics();
            this.populateTable();
        }, 30000); // 30 seconds
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    async loadRegistrations() {
        try {
            const response = await apiClient.getAllRegistrations();
            console.log('All registrations from API:', response.data.registrations);

            // Store previous registrations to preserve row numbers
            const previousRegistrations = [...this.registrations];

            // Show all registrations that have a test scheduled
            // Handle both old format (mainTest/speakingTest) and new format (date/time)
            const newFilteredRegistrations = response.data.registrations
                .filter(r => {
                    if (r.schedule) {
                        // New format: check if date and time exist directly
                        if (r.schedule.date && r.schedule.time) {
                            return true;
                        }
                        // Old format: check if mainTest has date and time
                        if (r.schedule.mainTest && r.schedule.mainTest.date && r.schedule.mainTest.time) {
                            return true;
                        }
                    }
                    return false;
                })
                .sort((a, b) => {
                    const dateA = new Date(a.createdAt);
                    const dateB = new Date(b.createdAt);
                    return dateA.getTime() - dateB.getTime(); // Oldest first, newest last
                });

            // Preserve existing row numbers and assign new ones for new registrations
            this.registrations = newFilteredRegistrations.map(registration => {
                const existing = previousRegistrations.find(prev => prev._id === registration._id);
                if (existing) {
                    // Keep existing row number
                    registration.rowNumber = existing.rowNumber;
                }
                // New registrations will get row numbers assigned in populateTable
                return registration;
            });

            console.log('Filtered registrations with scheduled tests:', this.registrations.length);
        } catch (error) {
            console.error('Failed to load registrations:', error);
            this.registrations = [];
            this.showError(`Failed to load registrations: ${error.message}`);
        }
    }

    updateStatistics() {
        // Count registrations with scheduled tests (have date and time)
        const scheduled = this.registrations.length;
        document.getElementById('scheduledTests').textContent = scheduled;

        // All scheduled tests are paid (50,000 UZS each)
        const totalRevenue = scheduled * 50000;
        document.getElementById('totalRevenue').textContent = `${totalRevenue.toLocaleString()} UZS`;
    }

    populateTable() {
        const loadingState = document.getElementById('loadingState');
        const table = document.getElementById('registrationsTable');
        const emptyState = document.getElementById('emptyState');
        const tbody = document.getElementById('registrationsBody');

        loadingState.style.display = 'none';

        if (this.registrations.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        table.style.display = 'table';
        tbody.innerHTML = '';

        // Assign continuous row numbers to new registrations
        this.registrations.forEach((registration) => {
            // If registration doesn't have a row number, assign the next available one
            if (!registration.rowNumber) {
                registration.rowNumber = this.nextRowNumber++;
            }

            const row = this.createTableRow(registration, registration.rowNumber);
            tbody.appendChild(row);
        });
    }

    createTableRow(registration, rowNumber) {
        const row = document.createElement('tr');
        const user = registration.user;
        const schedule = registration.schedule;

        const formatDateTime = (dateStr, timeStr) => {
            if (!dateStr || !timeStr) return 'Not scheduled';
            const date = new Date(dateStr);
            return `${date.toLocaleDateString()} at ${timeStr}`;
        };

        const getStatusBadge = (status) => {
            const statusClasses = {
                'scheduled': 'status-scheduled',
                'completed': 'status-completed',
                'cancelled': 'status-cancelled'
            };
            return `<span class="status-badge ${statusClasses[status] || 'status-scheduled'}">${status || 'scheduled'}</span>`;
        };

        // Handle both old and new schedule formats
        let testScheduleDisplay = 'Not scheduled';
        if (schedule) {
            // New format: direct date/time
            if (schedule.date && schedule.time) {
                testScheduleDisplay = formatDateTime(schedule.date, schedule.time);
            }
            // Old format: mainTest object
            else if (schedule.mainTest && schedule.mainTest.date && schedule.mainTest.time) {
                testScheduleDisplay = formatDateTime(schedule.mainTest.date, schedule.mainTest.time);
            }
        }

        // All scheduled tests are paid (no pending payments for scheduled tests)
        const getPaymentBadge = () => {
            return '<span style="background: #d1fae5; color: #065f46; padding: 4px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">✓ Paid</span>';
        };

        row.innerHTML = `
            <td style="font-weight: bold; text-align: center;">${rowNumber}</td>
            <td>${user.firstName} ${user.lastName}</td>
            <td>${user.phone}</td>
            <td>${testScheduleDisplay}</td>
            <td>${getPaymentBadge()}</td>
            <td>${new Date(registration.createdAt).toLocaleDateString()}</td>
            <td>${getStatusBadge(registration.status)}</td>
        `;

        return row;
    }

    exportToExcel() {
        if (this.registrations.length === 0) {
            this.showToast('No data to export', 'error');
            return;
        }

        const data = this.registrations.map((reg, index) => {
            // Handle both old and new schedule formats
            let testDate = 'Not scheduled';
            let testTime = 'Not scheduled';

            if (reg.schedule) {
                // New format: direct date/time
                if (reg.schedule.date && reg.schedule.time) {
                    testDate = reg.schedule.date;
                    testTime = reg.schedule.time;
                }
                // Old format: mainTest object
                else if (reg.schedule.mainTest && reg.schedule.mainTest.date && reg.schedule.mainTest.time) {
                    testDate = reg.schedule.mainTest.date;
                    testTime = reg.schedule.mainTest.time;
                }
            }

            return {
                '#': index + 1,
                'Student Name': `${reg.user.firstName} ${reg.user.lastName}`,
                'Phone': reg.user.phone,
                'Email': reg.user.email,
                'Test Date': testDate,
                'Test Time': testTime,
                'Registration Date': new Date(reg.createdAt).toLocaleDateString(),
                'Status': reg.status || 'scheduled'
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'IELTS Registrations');

        const fileName = `IELTS_Registrations_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);

        this.showToast('Excel file downloaded successfully!');
    }

    exportToWord() {
        if (this.registrations.length === 0) {
            this.showToast('No data to export', 'error');
            return;
        }

        let htmlContent = `
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    h1 { color: #333; text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                </style>
            </head>
            <body>
                <h1>IELTS Test Registrations</h1>
                <p>Generated on: ${new Date().toLocaleDateString()}</p>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Student Name</th>
                            <th>Phone</th>
                            <th>Test Schedule</th>
                            <th>Registration Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        this.registrations.forEach((reg, index) => {
            const formatDateTime = (dateStr, timeStr) => {
                if (!dateStr || !timeStr) return 'Not scheduled';
                const date = new Date(dateStr);
                return `${date.toLocaleDateString()} at ${timeStr}`;
            };

            // Handle both old and new schedule formats
            let testScheduleDisplay = 'Not scheduled';
            if (reg.schedule) {
                // New format: direct date/time
                if (reg.schedule.date && reg.schedule.time) {
                    testScheduleDisplay = formatDateTime(reg.schedule.date, reg.schedule.time);
                }
                // Old format: mainTest object
                else if (reg.schedule.mainTest && reg.schedule.mainTest.date && reg.schedule.mainTest.time) {
                    testScheduleDisplay = formatDateTime(reg.schedule.mainTest.date, reg.schedule.mainTest.time);
                }
            }

            htmlContent += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${reg.user.firstName} ${reg.user.lastName}</td>
                    <td>${reg.user.phone}</td>
                    <td>${testScheduleDisplay}</td>
                    <td>${new Date(reg.createdAt).toLocaleDateString()}</td>
                    <td>${reg.status || 'scheduled'}</td>
                </tr>
            `;
        });

        htmlContent += `
                    </tbody>
                </table>
            </body>
            </html>
        `;

        const blob = new Blob([htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `IELTS_Registrations_${new Date().toISOString().split('T')[0]}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showToast('Word document downloaded successfully!');
    }

    showToast(message, type = 'success') {
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'toast';
        if (type === 'error') {
            toast.style.background = '#ef4444';
        }
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 3000);
    }

    showError(message) {
        this.showToast(message, 'error');

        // Also show error in the table area
        const tbody = document.getElementById('registrationsBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: #ef4444;">
                        <div style="font-size: 18px; margin-bottom: 10px;">⚠️ Error Loading Data</div>
                        <div style="font-size: 14px;">${message}</div>
                        <button onclick="location.reload()" style="margin-top: 15px; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Retry
                        </button>
                    </td>
                </tr>
            `;
        }
    }
}

// Global functions for export buttons
let dashboard;

function exportToExcel() {
    dashboard.exportToExcel();
}

function exportToWord() {
    dashboard.exportToWord();
}

function adminLogout() {
    localStorage.removeItem('adminSession');
    window.location.href = 'login.html';
}

// Manual refresh function
function refreshDashboard() {
    if (dashboard) {
        console.log('Manual refresh triggered...');
        dashboard.loadRegistrations().then(() => {
            dashboard.updateStatistics();
            dashboard.populateTable();
        });
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check admin authentication
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) {
        window.location.href = 'login.html';
        return;
    }

    dashboard = new AdminDashboard();
});

// Stop auto-refresh when page is unloaded
window.addEventListener('beforeunload', () => {
    if (dashboard) {
        dashboard.stopAutoRefresh();
    }
});