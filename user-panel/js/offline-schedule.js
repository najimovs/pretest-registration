// Two-Step Calendar and Time Selection JavaScript

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

let speakingSchedule = {
    date: null,
    time: null
};

let currentMainMonth = new Date();
let currentSpeakingMonth = new Date();
let currentStep = 1; // 1 = main test, 2 = speaking test

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
function isDateWithinBookingPeriod(date, isForSpeaking = false) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const maxDays = isForSpeaking ? 17 : 14; // 17 days for speaking (14+3), 14 for main test
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + maxDays);
    
    return date >= today && date <= maxDate;
}

// Check if speaking date is within allowed range (3 days before/after main test)
function isSpeakingDateValid(speakingDate, mainDate) {
    const timeDiff = Math.abs(speakingDate.getTime() - mainDate.getTime());
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff <= 3;
}

// Check if speaking time conflicts with main test (same day + during 3-hour test duration)
function isSpeakingTimeValid(speakingTime, mainTime, speakingDate, mainDate) {
    // If different dates, no time conflict
    if (speakingDate.toDateString() !== mainDate.toDateString()) {
        return true;
    }
    
    // Same date - speaking cannot be during the 3-hour main test period
    const mainHour = parseInt(mainTime.split(':')[0]);
    const speakingHour = parseInt(speakingTime.split(':')[0]);
    
    // Block speaking during main test hours (mainHour, mainHour+1, mainHour+2, mainHour+3)
    // 3-hour test: if starts at 12:00, blocks 12:00, 13:00, 14:00, 15:00
    // Allow speaking before main test OR after main test completely finishes (mainHour+4 and later)
    return speakingHour < mainHour || speakingHour > mainHour + 3;
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
function generateCalendarDays(date, containerId, isForSpeaking = false) {
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
        
        let isAvailable = false;
        
        if (isForSpeaking && mainTestSchedule.date) {
            // For speaking test, check 3-day range, valid days, and booking period
            isAvailable = isValidDate(dayDate) && 
                         dayDate >= today && 
                         isDateWithinBookingPeriod(dayDate, true) &&
                         isSpeakingDateValid(dayDate, mainTestSchedule.date);
        } else {
            // For main test, check valid days, not in past, and within 14-day booking period
            isAvailable = isValidDate(dayDate) && 
                         dayDate >= today && 
                         isDateWithinBookingPeriod(dayDate, false);
        }
        
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
    
    // Update schedule object and regenerate time slots
    if (containerId === 'main-calendar-days') {
        mainTestSchedule.date = date;
        updateSelectedInfo('main-selected');
        checkMainStepComplete();
    } else {
        speakingSchedule.date = date;
        speakingSchedule.time = null; // Reset time selection when date changes
        updateSelectedInfo('speaking-selected');
        generateTimeSlotsForSection('speaking'); // Regenerate with conflict checking
        checkSpeakingStepComplete();
    }
}

// Select time
function selectTime(time, sectionType) {
    // Remove previous selection
    document.querySelectorAll(`#${sectionType}-time-slots .time-slot`).forEach(slot => {
        slot.classList.remove('selected');
    });
    
    // Add selection to clicked time
    event.target.classList.add('selected');
    
    // Update schedule object
    if (sectionType === 'main') {
        mainTestSchedule.time = time;
        updateSelectedInfo('main-selected');
        checkMainStepComplete();
    } else {
        speakingSchedule.time = time;
        updateSelectedInfo('speaking-selected');
        checkSpeakingStepComplete();
    }
}

// Update selected info display
function updateSelectedInfo(elementId) {
    const element = document.getElementById(elementId);
    const selectedValue = element.querySelector('.selected-value');
    
    let schedule;
    if (elementId === 'main-selected') {
        schedule = mainTestSchedule;
    } else {
        schedule = speakingSchedule;
    }
    
    if (schedule.date && schedule.time) {
        selectedValue.textContent = `${formatDate(schedule.date)} at ${schedule.time}`;
        selectedValue.style.color = '#10B981';
    } else if (schedule.date) {
        selectedValue.textContent = `${formatDate(schedule.date)} - Select time`;
        selectedValue.style.color = '#F59E0B';
    } else if (schedule.time) {
        selectedValue.textContent = `${schedule.time} - Select date`;
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

// Check if speaking step is complete
function checkSpeakingStepComplete() {
    const nextBtn = document.getElementById('speaking-next-btn');
    const isComplete = speakingSchedule.date && speakingSchedule.time;
    nextBtn.disabled = !isComplete;
}

// Generate time slots for sections with conflict checking
function generateTimeSlotsForSection(sectionType) {
    const container = document.getElementById(`${sectionType}-time-slots`);
    const timeSlots = generateTimeSlots();
    
    container.innerHTML = '';
    
    timeSlots.forEach(time => {
        const timeElement = document.createElement('div');
        timeElement.classList.add('time-slot');
        timeElement.textContent = time;
        
        let isTimeAvailable = true;
        
        // For speaking test, check time conflicts
        if (sectionType === 'speaking' && mainTestSchedule.date && mainTestSchedule.time && speakingSchedule.date) {
            isTimeAvailable = isSpeakingTimeValid(time, mainTestSchedule.time, speakingSchedule.date, mainTestSchedule.date);
        }
        
        if (isTimeAvailable) {
            timeElement.addEventListener('click', () => selectTime(time, sectionType));
        } else {
            timeElement.classList.add('disabled');
            timeElement.style.opacity = '0.4';
            timeElement.style.cursor = 'not-allowed';
        }
        
        container.appendChild(timeElement);
    });
}

// Navigate months
function navigateMonth(direction, calendarType) {
    const today = new Date();
    const maxMonthsAhead = 1; // Only allow current month and next month
    
    if (calendarType === 'main') {
        const newMonth = new Date(currentMainMonth);
        newMonth.setMonth(newMonth.getMonth() + direction);
        
        // Check if new month is within allowed range
        const monthsDiff = (newMonth.getFullYear() - today.getFullYear()) * 12 + 
                          (newMonth.getMonth() - today.getMonth());
        
        if (monthsDiff >= 0 && monthsDiff <= maxMonthsAhead) {
            currentMainMonth = newMonth;
            updateCalendarDisplay('main');
        }
    } else {
        const newMonth = new Date(currentSpeakingMonth);
        newMonth.setMonth(newMonth.getMonth() + direction);
        
        // Check if new month is within allowed range
        const monthsDiff = (newMonth.getFullYear() - today.getFullYear()) * 12 + 
                          (newMonth.getMonth() - today.getMonth());
        
        if (monthsDiff >= 0 && monthsDiff <= maxMonthsAhead) {
            currentSpeakingMonth = newMonth;
            updateCalendarDisplay('speaking');
        }
    }
}

// Update calendar display
function updateCalendarDisplay(calendarType) {
    if (calendarType === 'main') {
        const monthYearElement = document.getElementById('current-month-year');
        monthYearElement.textContent = currentMainMonth.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        });
        generateCalendarDays(currentMainMonth, 'main-calendar-days', false);
    } else {
        const monthYearElement = document.getElementById('speaking-current-month-year');
        monthYearElement.textContent = currentSpeakingMonth.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        });
        generateCalendarDays(currentSpeakingMonth, 'speaking-calendar-days', true);
    }
}

// Proceed to speaking step
function proceedToSpeakingStep() {
    // Hide main step
    document.getElementById('main-schedule-step').style.display = 'none';
    
    // Show speaking step
    document.getElementById('speaking-schedule-step').style.display = 'block';
    
    // Update reminder text
    const reminderElement = document.getElementById('main-test-reminder');
    reminderElement.textContent = `${formatDate(mainTestSchedule.date)} at ${mainTestSchedule.time}`;
    
    // Set speaking month to same as main test month initially
    currentSpeakingMonth = new Date(mainTestSchedule.date);
    updateCalendarDisplay('speaking');
    generateTimeSlotsForSection('speaking');
    
    currentStep = 2;
}

// Go back to main step
function backToMainStep() {
    // Show main step
    document.getElementById('main-schedule-step').style.display = 'block';
    
    // Hide speaking step
    document.getElementById('speaking-schedule-step').style.display = 'none';
    
    currentStep = 1;
}

// Proceed to save schedule and show test details
async function proceedToTestDetails() {
    // Get current user to bind schedule to specific user
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (!currentUser.id) {
        alert('Please log in to schedule your test.');
        window.location.href = './login.html';
        return;
    }
    
    // Prepare schedule data
    const scheduleData = {
        mainTest: mainTestSchedule,
        speakingTest: speakingSchedule,
        userId: currentUser.id,
        center: 'Pretest Center',
        registeredAt: new Date().toISOString()
    };
    
    try {
        // Save schedule via API
        const response = await apiClient.saveTestSchedule(currentUser.id, scheduleData);
        
        if (response.success) {
            // Update current user data
            currentUser.testSchedule = scheduleData;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Store in legacy format for compatibility
            localStorage.setItem('offlineSchedule', JSON.stringify(scheduleData));
            
            // Show success message
            showToast('Test scheduled successfully!');

            // Show admin contact alert after short delay
            setTimeout(() => {
                showAdminContactAlert();
            }, 1500);
        } else {
            throw new Error(response.message || 'Failed to save schedule');
        }
    } catch (error) {
        console.error('Error saving schedule:', error);
        alert('Failed to save your test schedule. Please try again.');
    }
}

// Toast notification function
function showToast(message) {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
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

// Check if user already has offline test scheduled
function checkOfflineTestRestriction() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const offlineSchedule = JSON.parse(localStorage.getItem('offlineSchedule') || '{}');
    
    // Check if offline schedule exists AND belongs to current user
    if (offlineSchedule.mainTest && offlineSchedule.speakingTest && 
        offlineSchedule.userId && currentUser.id && 
        offlineSchedule.userId === currentUser.id) {
        
        // Check if test dates have passed
        const mainTestDate = new Date(offlineSchedule.mainTest.date);
        const speakingTestDate = new Date(offlineSchedule.speakingTest.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Get the later date between main and speaking test
        const lastTestDate = mainTestDate > speakingTestDate ? mainTestDate : speakingTestDate;
        
        if (lastTestDate >= today) {
            // Test dates haven't passed yet - show custom alert and redirect to profile
            showCustomAlert('You already have a scheduled offline test. Please complete your scheduled test before enrolling in a new one.');
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 2000);
            return true;
        }
    }
    return false;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Scroll to top when page loads
    window.scrollTo(0, 0);

    // Check for offline test restriction first
    if (checkOfflineTestRestriction()) {
        return; // Stop execution if user is restricted
    }
    // Generate time slots for main test
    generateTimeSlotsForSection('main');
    
    // Initialize main calendar
    updateCalendarDisplay('main');
    
    // Add navigation event listeners for main calendar
    document.getElementById('prev-month').addEventListener('click', () => {
        navigateMonth(-1, 'main');
    });
    
    document.getElementById('next-month').addEventListener('click', () => {
        navigateMonth(1, 'main');
    });
    
    // Add navigation event listeners for speaking calendar
    document.getElementById('speaking-prev-month').addEventListener('click', () => {
        navigateMonth(-1, 'speaking');
    });
    
    document.getElementById('speaking-next-month').addEventListener('click', () => {
        navigateMonth(1, 'speaking');
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
        ">Successfully Registered!</h3>
        <p style="
            color: #6b7280;
            margin-bottom: 25px;
            line-height: 1.6;
            font-size: 1rem;
        ">Your test has been scheduled successfully. Our admins will contact you soon with additional details.</p>
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
        " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">Continue</button>
    `;

    alertOverlay.appendChild(alertModal);
    document.body.appendChild(alertOverlay);

    // Show alert with animation
    setTimeout(() => {
        alertOverlay.style.opacity = '1';
        alertModal.style.transform = 'scale(1)';
    }, 100);
}

// Close admin alert and redirect
function closeAdminAlert() {
    const alert = document.querySelector('.admin-contact-alert');
    if (alert) {
        alert.style.opacity = '0';
        setTimeout(() => {
            alert.remove();
            // Use URL with hash to force scroll to top
            window.location.href = './test-details.html#top';
        }, 300);
    }
}