// Offline Payment JavaScript

let selectedPaymentMethod = '';

// Load schedule data and display
function loadScheduleData() {
    // Get schedule data from our new simplified format
    const scheduleData = JSON.parse(localStorage.getItem('testSchedule') || '{}');

    if (scheduleData.date && scheduleData.time) {
        const testDate = new Date(scheduleData.date);

        document.getElementById('main-test-date').textContent = formatDate(testDate);
        document.getElementById('main-test-time').textContent = scheduleData.time;
    }

    // Speaking test info (will be provided on exam day)
    document.getElementById('speaking-test-date').textContent = 'Will be provided on exam day';
    document.getElementById('speaking-test-time').textContent = 'TBD';
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
    const clickedOption = event.currentTarget;
    clickedOption.classList.add('selected');
    
    // Check the radio button
    const radio = clickedOption.querySelector('input[type="radio"]');
    radio.checked = true;
    
    selectedPaymentMethod = method;
    checkFormComplete();
}

// Check if form is complete
function checkFormComplete() {
    const nextBtn = document.getElementById('payment-next-btn');
    nextBtn.disabled = !selectedPaymentMethod;
}

// Proceed to payment success
function proceedToConfirmation() {
    // Show loading state
    const nextBtn = document.getElementById('payment-next-btn');
    nextBtn.textContent = 'Processing...';
    nextBtn.disabled = true;

    // Store payment method
    const scheduleData = JSON.parse(localStorage.getItem('testSchedule') || '{}');
    scheduleData.paymentMethod = selectedPaymentMethod;
    scheduleData.paymentAmount = '50,000 UZS';
    scheduleData.paymentStatus = 'completed';
    scheduleData.paidAt = new Date().toISOString();
    localStorage.setItem('testSchedule', JSON.stringify(scheduleData));

    // Simulate payment processing
    setTimeout(() => {
        // Redirect to success page
        window.location.href = 'payment-success.html';
    }, 2000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load and display schedule data
    loadScheduleData();
    
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
        label.addEventListener('click', function() {
            const radio = document.getElementById(label.getAttribute('for'));
            const option = label.closest('.payment-option-offline');
            const method = option.dataset.payment;
            selectPaymentMethod(method);
        });
    });
});