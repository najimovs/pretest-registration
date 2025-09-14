// Admin dashboard functionality
class AdminDashboard {
    constructor() {
        this.registrations = [];
        this.init();
    }

    async init() {
        await this.loadRegistrations();
        this.updateStatistics();
        this.populateTable();
    }

    async loadRegistrations() {
        try {
            const response = await apiClient.getAllRegistrations();
            // Filter to only show scheduled registrations and sort by creation date (oldest first, newest last)
            this.registrations = response.data.registrations
                .filter(r => r.status === 'scheduled')
                .sort((a, b) => {
                    const dateA = new Date(a.createdAt);
                    const dateB = new Date(b.createdAt);
                    return dateA.getTime() - dateB.getTime(); // Oldest first, newest last
                });
            console.log('Loaded scheduled registrations successfully:', this.registrations.length);
        } catch (error) {
            console.error('Failed to load registrations:', error);
            this.registrations = [];
            this.showError(`Failed to load registrations: ${error.message}`);
        }
    }

    updateStatistics() {
        // Since we're only showing scheduled registrations, the count is just the length
        const scheduled = this.registrations.length;
        document.getElementById('scheduledTests').textContent = scheduled;
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

        this.registrations.forEach((registration, index) => {
            const row = this.createTableRow(registration, index + 1);
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

        row.innerHTML = `
            <td style="font-weight: bold; text-align: center;">${rowNumber}</td>
            <td>${user.firstName} ${user.lastName}</td>
            <td>${user.phone}</td>
            <td>${schedule ? formatDateTime(schedule.mainTest?.date, schedule.mainTest?.time) : 'Not scheduled'}</td>
            <td>${schedule ? formatDateTime(schedule.speakingTest?.date, schedule.speakingTest?.time) : 'Not scheduled'}</td>
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

        const data = this.registrations.map((reg, index) => ({
            '#': index + 1,
            'Student Name': `${reg.user.firstName} ${reg.user.lastName}`,
            'Phone': reg.user.phone,
            'Email': reg.user.email,
            'Main Test Date': reg.schedule?.mainTest?.date || 'Not scheduled',
            'Main Test Time': reg.schedule?.mainTest?.time || 'Not scheduled',
            'Speaking Test Date': reg.schedule?.speakingTest?.date || 'Not scheduled',
            'Speaking Test Time': reg.schedule?.speakingTest?.time || 'Not scheduled',
            'Registration Date': new Date(reg.createdAt).toLocaleDateString(),
            'Status': reg.status || 'scheduled'
        }));

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
                            <th>Main Test</th>
                            <th>Speaking Test</th>
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

            htmlContent += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${reg.user.firstName} ${reg.user.lastName}</td>
                    <td>${reg.user.phone}</td>
                    <td>${reg.schedule ? formatDateTime(reg.schedule.mainTest?.date, reg.schedule.mainTest?.time) : 'Not scheduled'}</td>
                    <td>${reg.schedule ? formatDateTime(reg.schedule.speakingTest?.date, reg.schedule.speakingTest?.time) : 'Not scheduled'}</td>
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
                    <td colspan="7" style="text-align: center; padding: 40px; color: #ef4444;">
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