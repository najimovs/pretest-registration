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
            const response = await apiClient.getAllRegistrations();
            console.log('Loading payment data from registrations:', response);

            // Extract payment data from registrations (all scheduled tests are paid)
            this.payments = response.data.registrations
                .filter(registration => {
                    // Only include registrations with scheduled tests
                    return (registration.schedule &&
                           ((registration.schedule.date && registration.schedule.time) ||
                            (registration.schedule.mainTest && registration.schedule.mainTest.date)));
                })
                .map(registration => {
                    // Transform registration data to payment format
                    const schedule = registration.schedule;
                    const testDate = schedule.date ||
                                   (schedule.mainTest ? schedule.mainTest.date : null);

                    return {
                        id: registration._id,
                        student: {
                            firstName: registration.user.firstName,
                            lastName: registration.user.lastName,
                            phone: registration.user.phone
                        },
                        testDate: testDate,
                        amount: '50,000 UZS',
                        paymentMethod: schedule.paymentMethod || 'click',
                        paymentStatus: 'completed', // All scheduled tests are paid
                        paymentDate: schedule.paidAt || registration.createdAt,
                        createdAt: registration.createdAt
                    };
                })
                .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

            this.filteredPayments = [...this.payments];
            console.log('Processed payment data:', this.payments);

        } catch (error) {
            console.error('Failed to load payment data:', error);
            this.payments = [];
            this.filteredPayments = [];
            this.showError(`Failed to load payment data: ${error.message}`);
        }
    }

    updateAnalytics() {
        // All scheduled tests are paid (50,000 UZS each)
        const totalRevenue = this.payments.length * 50000;
        document.getElementById('totalRevenue').textContent = `${totalRevenue.toLocaleString()} UZS`;

        // Payment method breakdown
        const clickPayments = this.payments.filter(p => p.paymentMethod === 'click').length;
        const paymePayments = this.payments.filter(p => p.paymentMethod === 'payme').length;

        document.getElementById('clickPayments').textContent = clickPayments;
        document.getElementById('paymePayments').textContent = paymePayments;
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

        const getMethodBadge = (method) => {
            const methodName = method === 'click' ? 'Click' : 'Payme';
            return `<span class="payment-method-badge ${method}">${methodName}</span>`;
        };

        row.innerHTML = `
            <td style="font-weight: bold; text-align: center;">${rowNumber}</td>
            <td>
                <div class="student-info">${payment.student.firstName} ${payment.student.lastName}</div>
                <div class="student-phone">${payment.student.phone}</div>
            </td>
            <td class="date-cell">${payment.testDate ? formatDate(payment.testDate) : 'Not set'}</td>
            <td class="amount-cell">${payment.amount}</td>
            <td>${getMethodBadge(payment.paymentMethod)}</td>
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
                'Payment Method': payment.paymentMethod === 'click' ? 'Click' : 'Payme',
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
    // Check admin authentication
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) {
        window.location.href = 'login.html';
        return;
    }

    paymentDashboard = new AdminPaymentDashboard();
});