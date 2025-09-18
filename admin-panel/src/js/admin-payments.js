// Admin Payment Dashboard functionality
class AdminPaymentDashboard {
    constructor() {
        this.payments = [];
        this.filteredPayments = [];
        this.init();
    }

    async init() {
        await this.loadPaymentData();
        this.updateAnalytics();
        this.populatePaymentTable();
    }

    async loadPaymentData() {
        try {
            console.log('Loading payment data...');
            const response = await apiClient.getAllRegistrations();
            console.log('Payment data response:', response);
            // Loading payment data

            // Extract payment data from registrations
            this.payments = response.data.registrations
                .filter(registration => {
                    // Only include registrations that have completed payment
                    return registration.paymentStatus === 'completed' && registration.schedule;
                })
                .map(registration => {
                    const schedule = registration.schedule;
                    const testDate = schedule?.date || (schedule?.mainTest ? schedule.mainTest.date : null);
                    const paymentDate = registration.paymentInfo?.completedAt || schedule?.paidAt || registration.createdAt;

                    return {
                        id: registration._id,
                        student: {
                            firstName: registration.user.firstName,
                            lastName: registration.user.lastName,
                            phone: registration.user.phone
                        },
                        testDate: testDate,
                        planName: schedule.planName || 'N/A',
                        amount: schedule.price || 0,
                        paymentStatus: registration.paymentStatus,
                        paymentDate: paymentDate,
                        createdAt: registration.createdAt
                    };
                })
                .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

            this.filteredPayments = [...this.payments];
            // Payment data processed

        } catch (error) {
            console.error('Failed to load payment data:', error);
            this.payments = [];
            this.filteredPayments = [];
            this.showError(`Failed to load payment data: ${error.message}`);
        }
    }

    updateAnalytics() {
        const completedPayments = this.payments; // Already filtered in loadPaymentData
        
        const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);
        document.getElementById('totalRevenue').textContent = `${totalRevenue.toLocaleString()} UZS`;

        // Payment method breakdown (only Click now)
        const clickPayments = completedPayments.length;
        const totalTransactions = completedPayments.length;

        document.getElementById('clickPayments').textContent = clickPayments;
        document.getElementById('totalTransactions').textContent = totalTransactions;
    }

    populatePaymentTable() {
        const loadingState = document.getElementById('loadingState');
        const table = document.getElementById('paymentsTable');
        const emptyState = document.getElementById('emptyState');
        const tbody = document.getElementById('paymentsBody');

        loadingState.style.display = 'none';

        if (this.filteredPayments.length === 0) {
            table.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        table.style.display = 'table';
        emptyState.style.display = 'none';
        tbody.innerHTML = '';

        this.filteredPayments.forEach((payment, index) => {
            const row = this.createPaymentRow(payment, index + 1);
            tbody.appendChild(row);
        });
    }

    createPaymentRow(payment, rowNumber) {
        const row = document.createElement('tr');

        const formatDate = (dateStr) => {
            if (!dateStr) return 'Not set';
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        };

        const formatDateTime = (dateStr) => {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        const getStatusBadge = (status) => {
            const statusClasses = {
                'completed': 'completed',
                'pending': 'pending',
                'failed': 'failed'
            };
            return `<span class="payment-status ${statusClasses[status] || 'pending'}">${status || 'pending'}</span>`;
        };

        row.innerHTML = `
            <td style="font-weight: bold; text-align: center;">${rowNumber}</td>
            <td>
                <div class="student-info">${payment.student.firstName} ${payment.student.lastName}</div>
                <div class="student-phone">${payment.student.phone}</div>
            </td>
            <td class="date-cell">${formatDate(payment.testDate)}</td>
            <td>${payment.planName}</td>
            <td class="amount-cell">${payment.amount.toLocaleString()} UZS</td>
            <td>${getStatusBadge(payment.paymentStatus)}</td>
            <td class="date-cell">${formatDateTime(payment.paymentDate)}</td>
        `;

        return row;
    }

    exportToExcel() {
        if (this.filteredPayments.length === 0) {
            this.showToast('No payment data to export', 'error');
            return;
        }

        const data = this.filteredPayments.map((payment, index) => {
            return {
                '#': index + 1,
                'Student Name': `${payment.student.firstName} ${payment.student.lastName}`,
                'Phone': payment.student.phone,
                'Test Date': payment.testDate ? new Date(payment.testDate).toLocaleDateString() : 'Not set',
                'Amount': payment.amount,
                'Payment Method': 'Click',
                'Status': payment.paymentStatus,
                'Payment Date': new Date(payment.paymentDate).toLocaleDateString(),
                'Payment Time': new Date(payment.paymentDate).toLocaleTimeString()
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Payment Transactions');

        const fileName = `IELTS_Payment_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);

        this.showToast('Payment report exported successfully!');
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

        const tbody = document.getElementById('paymentsBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: #ef4444;">
                        <div style="font-size: 18px; margin-bottom: 10px;">⚠️ Error Loading Payment Data</div>
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

// Global functions
let paymentDashboard;

function refreshPayments() {
    if (paymentDashboard) {
        paymentDashboard.loadPaymentData().then(() => {
            paymentDashboard.updateAnalytics();
            paymentDashboard.populatePaymentTable();
        });
    }
}


function exportPaymentsToExcel() {
    if (paymentDashboard) {
        paymentDashboard.exportToExcel();
    }
}

function adminLogout() {
    localStorage.removeItem('adminSession');
    window.location.href = 'login.html';
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure deployment-config.js loads first
    setTimeout(() => {
        // Check admin authentication
        const adminSession = JSON.parse(localStorage.getItem('adminSession') || '{}');
        console.log('Admin session data:', adminSession);

        if (!adminSession.token) {
            console.log('No admin token found, redirecting to login');
            window.location.href = 'login.html';
            return;
        }

        // Check if token is expired (temporarily disabled like in admin-dashboard.js)
        if (false && adminSession.expiresAt && new Date() > new Date(adminSession.expiresAt)) {
            console.log('Admin token expired, redirecting to login');
            localStorage.removeItem('adminSession');
            window.location.href = 'login.html';
            return;
        }

        console.log('Admin authenticated, initializing payment dashboard');
        paymentDashboard = new AdminPaymentDashboard();
    }, 100);
});