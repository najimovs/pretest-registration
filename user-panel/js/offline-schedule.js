// Two-Step Calendar and Time Selection JavaScript

// Phone already exists alert function
function showPhoneExistsAlert(existingUser) {
    const alertHTML = `
        <div class="custom-alert-overlay" id="phoneExistsAlert">
            <div class="custom-alert-modal" style="max-width: 400px;">
                <div class="alert-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="#EF4444" stroke-width="2" fill="#EF4444"/>
                        <text x="12" y="17" text-anchor="middle" fill="white" font-size="14" font-weight="bold">!</text>
                    </svg>
                </div>
                <h3 class="alert-title">Phone Number Already Registered</h3>
                <p class="alert-message">
                    This phone number is already registered by:<br>
                    <strong>${existingUser.firstName} ${existingUser.lastName}</strong><br>
                    Registered: ${new Date(existingUser.registeredAt).toLocaleDateString()}
                </p>
                <div style="margin-top: 20px;">
                    <button onclick="redirectToLogin()" class="btn btn-primary" style="margin-right: 10px;">
                        Login Instead
                    </button>
                    <button onclick="closePhoneExistsAlert()" class="btn btn-secondary">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', alertHTML);

    setTimeout(() => {
        document.getElementById('phoneExistsAlert').classList.add('show');
    }, 100);
}

function redirectToLogin() {
    window.location.href = 'login.html';
}

function closePhoneExistsAlert() {
    const alert = document.getElementById('phoneExistsAlert');
    if (alert) {
        alert.remove();
    }
}

// Custom alert function
function showCustomAlert(message) {
    // Remove existing alert if any
    const existingAlert = document.querySelector('.custom-alert-overlay');
    if (existingAlert) {
        existingAlert.remove();
    }

    // Create custom alert
    const alertHTML = `
        <div class="custom-alert-overlay" id="customAlertOverlay">
            <div class="custom-alert-modal">
                <div class="alert-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="#F59E0B" stroke-width="2" fill="#F59E0B"/>
                        <text x="12" y="17" text-anchor="middle" fill="white" font-size="14" font-weight="bold">!</text>
                    </svg>
                </div>
                <h3 class="alert-title">Test Already Scheduled</h3>
                <p class="alert-message">${message}</p>
                <div class="alert-progress">
                    <div class="progress-line-alert"></div>
                </div>
                <p class="redirect-message">Redirecting to your profile...</p>
            </div>
        </div>
    `;

    // Add to body
    document.body.insertAdjacentHTML('beforeend', alertHTML);

    // Show alert with animation
    setTimeout(() => {
        document.getElementById('customAlertOverlay').classList.add('show');
    }, 100);
}

let mainTestSchedule = {
    date: null,
    time: null
};

let currentMainMonth = new Date();

// Generate time slots from 9:00 to 18:00
function generateTimeSlots() {
    const timeSlots = [];
    for (let hour = 9; hour <= 18; hour++) {
        timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return timeSlots;
}

// Check if date is valid (Monday to Saturday only)
function isValidDate(date) {
    const day = date.getDay();
    return day >= 1 && day <= 6; // Monday (1) to Saturday (6)
}

// Check if date is within allowed booking period (14 days for main test)
function isDateWithinBookingPeriod(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDays = 14; // 14 days for main test
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + maxDays);

    return date >= today && date <= maxDate;
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

// Generate calendar days
function generateCalendarDays(date, containerId) {
    const container = document.getElementById(containerId);
    const year = date.getFullYear();
    const month = date.getMonth();

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Get the day of week for first day (0 = Sunday, but we want Monday = 0)
    let startDay = firstDay.getDay();
    startDay = startDay === 0 ? 6 : startDay - 1; // Convert Sunday (0) to 6, and shift others

    container.innerHTML = '';

    // Add empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.classList.add('calendar-day', 'empty');
        container.appendChild(emptyDay);
    }

    // Add days of the month
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = new Date(year, month, day);
        const dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day');
        dayElement.textContent = day;

        // For main test, check valid days, not in past, and within 14-day booking period
        const isAvailable = isValidDate(dayDate) &&
                           dayDate >= today &&
                           isDateWithinBookingPeriod(dayDate);

        if (isAvailable) {
            dayElement.classList.add('available');
            dayElement.addEventListener('click', () => selectDate(dayDate, containerId));
        } else {
            dayElement.classList.add('disabled');
        }

        container.appendChild(dayElement);
    }
}

// Select date
function selectDate(date, containerId) {
    // Remove previous selection
    document.querySelectorAll(`#${containerId} .calendar-day`).forEach(day => {
        day.classList.remove('selected');
    });

    // Add selection to clicked date
    event.target.classList.add('selected');

    // Update schedule object
    mainTestSchedule.date = date;
    updateSelectedInfo('main-selected');
    checkMainStepComplete();
}

// Select time
function selectTime(time) {
    // Remove previous selection
    document.querySelectorAll('#main-time-slots .time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });

    // Add selection to clicked time
    event.target.classList.add('selected');

    // Update schedule object
    mainTestSchedule.time = time;
    updateSelectedInfo('main-selected');
    checkMainStepComplete();
}

// Update selected info display
function updateSelectedInfo(elementId) {
    const element = document.getElementById(elementId);
    const selectedValue = element.querySelector('.selected-value');

    if (mainTestSchedule.date && mainTestSchedule.time) {
        selectedValue.textContent = `${formatDate(mainTestSchedule.date)} at ${mainTestSchedule.time}`;
        selectedValue.style.color = '#10B981';
    } else if (mainTestSchedule.date) {
        selectedValue.textContent = `${formatDate(mainTestSchedule.date)} - Select time`;
        selectedValue.style.color = '#F59E0B';
    } else if (mainTestSchedule.time) {
        selectedValue.textContent = `${mainTestSchedule.time} - Select date`;
        selectedValue.style.color = '#F59E0B';
    } else {
        selectedValue.textContent = 'Please select date and time';
        selectedValue.style.color = '#64748B';
    }
}

// Check if main step is complete
function checkMainStepComplete() {
    const nextBtn = document.getElementById('main-next-btn');
    const isComplete = mainTestSchedule.date && mainTestSchedule.time;
    nextBtn.disabled = !isComplete;
}

// Generate time slots for main test
function generateTimeSlotsForSection() {
    const container = document.getElementById('main-time-slots');
    const timeSlots = generateTimeSlots();

    container.innerHTML = '';

    timeSlots.forEach(time => {
        const timeElement = document.createElement('div');
        timeElement.classList.add('time-slot');
        timeElement.textContent = time;
        timeElement.addEventListener('click', () => selectTime(time));
        container.appendChild(timeElement);
    });
}

// Navigate months
function navigateMonth(direction) {
    const today = new Date();
    const maxMonthsAhead = 1; // Only allow current month and next month

    const newMonth = new Date(currentMainMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);

    // Check if new month is within allowed range
    const monthsDiff = (newMonth.getFullYear() - today.getFullYear()) * 12 +
                      (newMonth.getMonth() - today.getMonth());

    if (monthsDiff >= 0 && monthsDiff <= maxMonthsAhead) {
        currentMainMonth = newMonth;
        updateCalendarDisplay();
    }
}

// Update calendar display
function updateCalendarDisplay() {
    const monthYearElement = document.getElementById('current-month-year');
    monthYearElement.textContent = currentMainMonth.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });
    generateCalendarDays(currentMainMonth, 'main-calendar-days');
}

// Proceed to test details (renamed from proceedToSpeakingStep)
async function proceedToTestDetails() {
    // Prepare schedule data (simplified without speaking test)
    // Fix date formatting to avoid timezone issues
    const formatDateLocal = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Get selected plan for pricing
    const selectedPlan = JSON.parse(localStorage.getItem('selectedPlan') || '{}');
    const planPrice = selectedPlan.price || 250000; // Default to Standard price if no plan selected

    const scheduleData = {
        date: formatDateLocal(mainTestSchedule.date), // Format as YYYY-MM-DD without timezone issues
        time: mainTestSchedule.time,
        center: 'Pretest Center',
        planType: selectedPlan.type || 'standard',
        planName: selectedPlan.name || 'Standard',
        price: planPrice,
        registeredAt: new Date().toISOString()
    };

    try {
        // Get current user to get user data for backend
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        console.log('DEBUG: Current user data:', currentUser);

        // Check if user exists (use firstName as indicator since id might not exist)
        if (currentUser.firstName && currentUser.phone) {
            console.log('DEBUG: User validation passed, sending to backend...');

            try {
                // First, try to update existing registration for this phone number
                console.log('DEBUG: Attempting to update existing registration...');

                const updateResponse = await apiClient.request('/registrations/schedule/by-phone', {
                    method: 'PUT',
                    body: JSON.stringify({
                        phone: currentUser.phone,
                        schedule: scheduleData
                    })
                });

                console.log('DEBUG: Update response:', updateResponse);

                if (updateResponse.success) {
                    // Existing registration updated successfully
                    scheduleData.registrationId = updateResponse.data.user.id;
                    localStorage.setItem('registrationId', updateResponse.data.user.id);
                    localStorage.setItem('pendingSchedule', JSON.stringify(scheduleData));

                    showToast('Schedule updated successfully! Proceeding to payment...');

                    setTimeout(() => {
                        window.location.href = 'payment.html';
                    }, 1500);

                    return;
                }

            } catch (updateError) {
                console.log('DEBUG: Update failed, trying to create new registration...', updateError.message);

                // If update fails (user doesn't exist), try to create new registration
                try {
                    const requestData = {
                        user: {
                            firstName: currentUser.firstName,
                            lastName: currentUser.lastName,
                            phone: currentUser.phone,
                            email: currentUser.email || `${currentUser.phone.replace('+', '')}@temp.pretest.uz`
                        },
                        schedule: scheduleData
                    };
                    console.log('DEBUG: Sending new registration request data:', requestData);

                    const response = await apiClient.post('/registrations/register', requestData);
                    console.log('DEBUG: New registration response:', response);

                    if (response.success) {
                        // Backend registration successful - save registration ID for payment
                        scheduleData.registrationId = response.data.user.id;
                        localStorage.setItem('registrationId', response.data.user.id);

                        // Store schedule temporarily until payment (not as final schedule)
                        localStorage.setItem('pendingSchedule', JSON.stringify(scheduleData));

                        // Show success message and redirect to payment
                        showToast('Registration successful! Proceeding to payment...');

                        // Redirect to payment page
                        setTimeout(() => {
                            window.location.href = 'payment.html';
                        }, 1500);

                        return;
                    } else {
                        // Handle specific error cases
                        if (response.code === 'PHONE_EXISTS') {
                            // Phone number already registered - check if we can get existing registration
                            const existingUser = response.data?.existingUser;
                            if (existingUser) {
                                // Show phone exists modal with user info
                                showPhoneExistsAlert(existingUser);
                                return;
                            } else {
                                // Fallback: redirect to login
                                showToast('This phone number is already registered. Please login instead.', 'error');
                                setTimeout(() => {
                                    window.location.href = 'login.html';
                                }, 2000);
                                return;
                            }
                        } else {
                            console.error('❌ Backend registration failed:', response.message);
                            showToast('Registration failed: ' + response.message);
                            return;
                        }
                    }
                } catch (backendError) {
                    console.error('❌ Exception during new registration call:', backendError);
                    // Fall through to localStorage approach if backend fails
                }
            }
        } else {
            console.warn('❌ No current user found or incomplete user data:', {
                hasFirstName: !!currentUser.firstName,
                hasPhone: !!currentUser.phone,
                currentUser: currentUser
            });
        }

        // Fallback: Store schedule temporarily (backend failed or no user)
        localStorage.setItem('pendingSchedule', JSON.stringify(scheduleData));

        // Show error message for fallback
        showToast('Registration requires internet connection. Please check connection and try again.');

        // Don't proceed to payment without successful backend registration
        return;
    } catch (error) {
        console.error('Error saving schedule:', error);
        alert('Failed to save your test schedule. Please try again.');
    }
}


// Toast notification function
function showToast(message, type = 'success') {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast';

    // Different colors for different types
    const styles = {
        success: `
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        `,
        error: `
            background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        `
    };

    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        ${styles[type] || styles.success}
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        z-index: 1000;
        max-width: 300px;
    `;
    toast.textContent = message;
    
    // Add to body
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Hide toast after 5 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, 5000);
}

// Check if user already has paid test scheduled
function checkOfflineTestRestriction() {
    const testSchedule = JSON.parse(localStorage.getItem('testSchedule') || '{}');

    // Only block if user has PAID test scheduled (not just pending payment)
    if (testSchedule.date && testSchedule.time && testSchedule.paymentStatus === 'completed') {
        // Check if test date has passed
        const testDate = new Date(testSchedule.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (testDate >= today) {
            // Paid test date hasn't passed yet - show custom alert and redirect to profile
            const formattedDate = testDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            showCustomAlert(`You already have a scheduled test on ${formattedDate} at ${testSchedule.time}. Please complete your scheduled test before enrolling in a new one.`);
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 2000);
            return true;
        }
    }

    // Also check if user has pending payment - redirect to payment page
    const pendingSchedule = JSON.parse(localStorage.getItem('pendingSchedule') || '{}');
    if (pendingSchedule.date && pendingSchedule.time && pendingSchedule.registrationId) {
        const formattedDate = new Date(pendingSchedule.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        showCustomAlert(`You have an unpaid scheduled test on ${formattedDate} at ${pendingSchedule.time}. Please complete payment or cancel to schedule a new test.`);
        setTimeout(() => {
            window.location.href = 'payment.html';
        }, 2000);
        return true;
    }

    return false;
}

// Display selected plan
function displaySelectedPlan() {
    const selectedPlan = JSON.parse(localStorage.getItem('selectedPlan') || '{}');

    if (selectedPlan.name && selectedPlan.price) {
        const planSummary = document.getElementById('planSummary');
        const planName = document.getElementById('selectedPlanName');
        const planPrice = document.getElementById('selectedPlanPrice');

        planName.textContent = selectedPlan.name + ' Package';
        planPrice.textContent = formatPrice(selectedPlan.price) + ' UZS';

        planSummary.style.display = 'block';
    }
}

// Format price with proper thousand separators
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Scroll to top when page loads
    window.scrollTo(0, 0);

    // Display selected plan if available
    displaySelectedPlan();

    // Check for offline test restriction first
    if (checkOfflineTestRestriction()) {
        return; // Stop execution if user is restricted
    }
    // Generate time slots for main test
    generateTimeSlotsForSection();

    // Initialize main calendar
    updateCalendarDisplay();

    // Add navigation event listeners for main calendar
    document.getElementById('prev-month').addEventListener('click', () => {
        navigateMonth(-1);
    });

    document.getElementById('next-month').addEventListener('click', () => {
        navigateMonth(1);
    });
});

// Admin contact alert function
function showAdminContactAlert() {
    // Remove existing alert if any
    const existingAlert = document.querySelector('.admin-contact-alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    // Create alert overlay
    const alertOverlay = document.createElement('div');
    alertOverlay.className = 'admin-contact-alert';
    alertOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    // Create alert modal
    const alertModal = document.createElement('div');
    alertModal.style.cssText = `
        background: white;
        border-radius: 20px;
        padding: 40px 30px;
        max-width: 400px;
        width: 90%;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        transform: scale(0.9);
        transition: transform 0.3s ease;
    `;

    alertModal.innerHTML = `
        <h3 style="
            color: #1f2937;
            margin-bottom: 15px;
            font-size: 1.5rem;
            font-weight: 600;
        ">Test Scheduled Successfully!</h3>
        <p style="
            color: #6b7280;
            margin-bottom: 25px;
            line-height: 1.6;
            font-size: 1rem;
        ">Your IELTS test has been scheduled. Please proceed to payment to complete your registration.</p>
        <button onclick="closeAdminAlert()" style="
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s ease;
        " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">Proceed to Payment</button>
    `;

    alertOverlay.appendChild(alertModal);
    document.body.appendChild(alertOverlay);

    // Show alert with animation
    setTimeout(() => {
        alertOverlay.style.opacity = '1';
        alertModal.style.transform = 'scale(1)';
    }, 100);
}

// Close admin alert and redirect to payment
function closeAdminAlert() {
    const alert = document.querySelector('.admin-contact-alert');
    if (alert) {
        alert.style.opacity = '0';
        setTimeout(() => {
            alert.remove();
            // Redirect to payment page instead of test details
            window.location.href = './payment.html';
        }, 300);
    }
}