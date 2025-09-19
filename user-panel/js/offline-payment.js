// Click Payment Integration JavaScript

let selectedPaymentMethod = 'click-button'; // Default to Click button
let registrationId = null;

// API configuration
const API_BASE_URL = window.deploymentConfig?.BACKEND_URL ?
    `${window.deploymentConfig.BACKEND_URL}/api` :
    'http://localhost:8000/api';

// Format price with proper thousand separators
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Load schedule data and display
function loadScheduleData() {
    // Get schedule data from pending schedule (not final until paid)
    const scheduleData = JSON.parse(localStorage.getItem('pendingSchedule') || '{}');

    // Get selected plan for pricing
    const selectedPlan = JSON.parse(localStorage.getItem('selectedPlan') || '{}');
    const planPrice = selectedPlan.price || scheduleData.price || 250000; // Default to Standard if no plan

    // Update the total amount display
    const totalAmountElement = document.getElementById('total-amount');
    if (totalAmountElement) {
        totalAmountElement.textContent = formatPrice(planPrice) + ' UZS';
    }

    if (scheduleData.date && scheduleData.time) {
        // Fix timezone issue - add 'T00:00:00' to treat as local date
        const testDate = new Date(scheduleData.date + 'T00:00:00');

        document.getElementById('main-test-date').textContent = formatDate(testDate);
        document.getElementById('main-test-time').textContent = scheduleData.time;
    }

    // Speaking test info (will be provided on exam day)
    document.getElementById('speaking-test-date').textContent = 'Will be provided on exam day';
    document.getElementById('speaking-test-time').textContent = 'TBD';

    // Get registration ID if available
    registrationId = scheduleData.registrationId || localStorage.getItem('registrationId');

    // Validate registration ID exists
    if (!registrationId) {
        alert('Registration not found. Please complete your registration first.');
        window.location.href = '../index.html';
        return;
    }

    // Registration ID loaded
}

// Format date for display
function formatDate(date) {
    const options = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
}

// Handle payment method selection
function selectPaymentMethod(method) {
    // Remove previous selection
    document.querySelectorAll('.payment-option-offline').forEach(option => {
        option.classList.remove('selected');
    });

    // Remove checked state from all radios
    document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
        radio.checked = false;
    });

    // Add selection to clicked option
    const clickedOption = document.querySelector(`[data-payment="${method}"]`);
    clickedOption.classList.add('selected');

    // Check the radio button
    const radio = clickedOption.querySelector('input[type="radio"]');
    radio.checked = true;

    selectedPaymentMethod = method;
    // Payment method selected
    checkFormComplete();
}

// Check if form is complete
function checkFormComplete() {
    const nextBtn = document.getElementById('payment-next-btn');
    nextBtn.disabled = !selectedPaymentMethod || !registrationId;
}

// Create payment URL via backend API
async function createPaymentURL() {
    try {
        // Get selected plan for pricing
        const selectedPlan = JSON.parse(localStorage.getItem('selectedPlan') || '{}');
        const scheduleData = JSON.parse(localStorage.getItem('pendingSchedule') || '{}');
        const planPrice = selectedPlan.price || scheduleData.price || 250000; // Default to Standard if no plan

        const response = await fetch(`${API_BASE_URL}/payments/click/create-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                registrationId: registrationId,
                amount: planPrice // Send the actual amount to backend
            })
        });

        const result = await response.json();
        // Payment URL created

        if (!result.success) {
            throw new Error(result.message || 'Failed to create payment URL');
        }

        return result; // Return the full result, not just result.data
    } catch (error) {
        console.error('Error creating payment URL:', error);
        throw error;
    }
}

// Proceed to Click payment
async function proceedToConfirmation() {
    const nextBtn = document.getElementById('payment-next-btn');

    // Validate registration ID
    if (!registrationId) {
        alert('Registration not found. Please go back and complete registration first.');
        return;
    }

    try {
        // Show loading state
        nextBtn.textContent = 'Creating Payment...';
        nextBtn.disabled = true;

        // Create payment URL
        const paymentData = await createPaymentURL();

        // Store payment info in pending schedule
        const scheduleData = JSON.parse(localStorage.getItem('pendingSchedule') || '{}');
        const selectedPlan = JSON.parse(localStorage.getItem('selectedPlan') || '{}');
        const planPrice = selectedPlan.price || scheduleData.price || 250000; // Default to Standard if no plan

        scheduleData.paymentMethod = selectedPaymentMethod;
        scheduleData.paymentAmount = formatPrice(planPrice) + ' UZS';
        scheduleData.paymentStatus = 'initiated';
        scheduleData.registrationId = registrationId;
        localStorage.setItem('pendingSchedule', JSON.stringify(scheduleData));

        // Handle different payment methods
        if (selectedPaymentMethod === 'click-button') {
            // Click Button - redirect to Click portal
            const clickButtonUrl = paymentData.data.paymentData.clickButton.url;
            // Redirecting to Click payment
            window.location.href = clickButtonUrl;

        } else if (selectedPaymentMethod === 'pay-by-card') {
            // Pay by Card - use JavaScript SDK
            const config = paymentData.data.paymentData.payByCard.config;
            // Opening Click card payment

            // Reset button text
            nextBtn.textContent = 'Pay Now';
            nextBtn.disabled = false;

            // Use Click JavaScript SDK with updated API
            if (typeof window.CLICK !== 'undefined' && window.CLICK.checkout) {
                // New Click SDK v2 API
                const checkoutParams = {
                    merchant_id: config.merchant_id,
                    service_id: config.service_id,
                    transaction_param: config.transaction_param,
                    amount: config.amount,
                    merchant_user_id: config.merchant_user_id
                };

                console.log('Starting Click checkout with params:', checkoutParams);

                window.CLICK.checkout.start(checkoutParams, function(result) {
                    console.log('Click payment result:', result);

                    if (result.status === 0) {
                        // Payment successful
                        updatePaymentStatusInBackend('completed').then(() => {
                            // Move from pending to final schedule
                            const finalSchedule = JSON.parse(localStorage.getItem('pendingSchedule') || '{}');
                            finalSchedule.paymentStatus = 'completed';
                            finalSchedule.paidAt = new Date().toISOString();

                            // Save as final schedule and remove pending
                            localStorage.setItem('testSchedule', JSON.stringify(finalSchedule));
                            localStorage.removeItem('pendingSchedule');

                            window.location.href = 'payment-success.html';
                        }).catch((error) => {
                            console.error('Failed to update payment status:', error);
                            // Still redirect to success page since payment was successful
                            window.location.href = 'payment-success.html';
                        });
                    } else {
                        // Payment failed or cancelled
                        console.error('Payment failed with status:', result.status);
                        alert('Payment failed. Please try again.');
                    }
                });
            } else if (typeof createPaymentRequest !== 'undefined') {
                // Fallback to old SDK
                const clickConfig = {
                    service_id: config.service_id,
                    merchant_id: config.merchant_id,
                    amount: config.amount,
                    transaction_param: config.transaction_param,
                    merchant_user_id: config.merchant_user_id
                };

                createPaymentRequest(clickConfig, function(result) {
                    console.log('Click payment result (old SDK):', result);

                    if (result.status === 2 || result.status === 0) {
                        // Payment successful
                        updatePaymentStatusInBackend('completed').then(() => {
                            const finalSchedule = JSON.parse(localStorage.getItem('pendingSchedule') || '{}');
                            finalSchedule.paymentStatus = 'completed';
                            finalSchedule.paidAt = new Date().toISOString();

                            localStorage.setItem('testSchedule', JSON.stringify(finalSchedule));
                            localStorage.removeItem('pendingSchedule');

                            window.location.href = 'payment-success.html';
                        }).catch((error) => {
                            console.error('Failed to update payment status:', error);
                            window.location.href = 'payment-success.html';
                        });
                    } else {
                        console.error('Payment failed with result:', result);
                        alert('Payment failed. Please try again.');
                    }
                });
            } else {
                // Show designed notification and redirect
                const notification = document.createElement('div');
                notification.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 20px 30px;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    text-align: center;
                    z-index: 10000;
                    min-width: 300px;
                `;

                notification.innerHTML = `
                    <div style="font-size: 18px; font-weight: 600; margin-bottom: 10px;">
                        🔄 Redirecting to Payment
                    </div>
                    <div style="font-size: 14px; opacity: 0.9;">
                        Click saytiga o'tkazilmoqda...
                    </div>
                `;

                document.body.appendChild(notification);

                // Fallback: Use Click Button URL for card payments too
                const clickButtonUrl = paymentData.data.paymentData.clickButton.url;

                // Store payment info before redirect
                const scheduleData = JSON.parse(localStorage.getItem('pendingSchedule') || '{}');
                scheduleData.paymentMethod = 'pay-by-card-redirect';
                scheduleData.paymentStatus = 'initiated';
                localStorage.setItem('pendingSchedule', JSON.stringify(scheduleData));

                // Redirect after showing notification
                setTimeout(() => {
                    window.location.href = clickButtonUrl;
                }, 1500);
            }
        }

    } catch (error) {
        console.error('Payment initiation error:', error);
        alert('Failed to initiate payment: ' + error.message);

        // Reset button
        nextBtn.textContent = 'Pay Now';
        nextBtn.disabled = false;
    }
}

// Update payment status in backend
async function updatePaymentStatusInBackend(status) {
    if (!registrationId) {
        throw new Error('No registration ID found');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/payments/update-status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                registrationId: registrationId,
                paymentStatus: status,
                paidAt: new Date().toISOString()
            })
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || 'Failed to update payment status');
        }

        return result;
    } catch (error) {
        console.error('Error updating payment status:', error);
        throw error;
    }
}

// Check payment status (for when user returns)
async function checkPaymentStatus() {
    if (!registrationId) {
        return false;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/payments/status/${registrationId}`);
        const result = await response.json();

        if (result.success && result.data.paymentStatus === 'completed') {
            // Payment completed, update backend and finalize schedule
            updatePaymentStatusInBackend('completed').then(() => {
                // Move from pending to final schedule
                const finalSchedule = JSON.parse(localStorage.getItem('pendingSchedule') || '{}');
                finalSchedule.paymentStatus = 'completed';
                finalSchedule.paidAt = new Date().toISOString();

                // Save as final schedule and remove pending
                localStorage.setItem('testSchedule', JSON.stringify(finalSchedule));
                localStorage.removeItem('pendingSchedule');

                window.location.href = 'payment-success.html';
            }).catch((error) => {
                console.error('Failed to update payment status:', error);
                // Still redirect since payment was successful
                window.location.href = 'payment-success.html';
            });
            return true;
        }

        return false;
    } catch (error) {
        console.error('Error checking payment status:', error);
        return false;
    }
}

// Handle payment return from Click
function handlePaymentReturn() {
    // Check URL parameters for payment result
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const transactionId = urlParams.get('transaction_id');

    if (status || transactionId) {
        // Check payment status and redirect accordingly
        setTimeout(checkPaymentStatus, 1000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load and display schedule data
    loadScheduleData();

    // Handle payment return from Click
    handlePaymentReturn();

    // Auto-enable payment button since Click is pre-selected
    checkFormComplete();

    // Add click handlers to payment options
    document.querySelectorAll('.payment-option-offline').forEach(option => {
        option.addEventListener('click', function() {
            const method = this.dataset.payment;
            selectPaymentMethod(method);
        });
    });

    // Also handle radio button clicks directly
    document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                selectPaymentMethod(this.value);
            }
        });
    });

    // Handle label clicks
    document.querySelectorAll('.payment-radio label').forEach(label => {
        label.addEventListener('click', function(e) {
            e.preventDefault();
            const radio = document.getElementById(label.getAttribute('for'));
            const option = label.closest('.payment-option-offline');
            const method = option.dataset.payment;
            selectPaymentMethod(method);
        });
    });

    // Periodically check payment status if payment was initiated
    const scheduleData = JSON.parse(localStorage.getItem('pendingSchedule') || '{}');
    if (scheduleData.paymentStatus === 'initiated') {
        const checkInterval = setInterval(async () => {
            const completed = await checkPaymentStatus();
            if (completed) {
                clearInterval(checkInterval);
            }
        }, 5000); // Check every 5 seconds

        // Clear interval after 10 minutes
        setTimeout(() => clearInterval(checkInterval), 600000);
    }
});

// Cancel payment and clear pending schedule
function cancelPayment() {
    // Clear ALL schedule and plan data since user cancelled
    localStorage.removeItem('pendingSchedule');
    localStorage.removeItem('registrationId');
    localStorage.removeItem('selectedPlan');
    localStorage.removeItem('tempOfflineSchedule');
    localStorage.removeItem('testSchedule');
    localStorage.removeItem('offlineSchedule');

    // Redirect to profile page
    window.location.href = 'profile.html';
}

// Global functions for button clicks
window.proceedToConfirmation = proceedToConfirmation;
window.cancelPayment = cancelPayment;