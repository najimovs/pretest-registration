// DOM Elements
const alertOverlay = document.getElementById('alertOverlay');
const profilePage = document.getElementById('profilePage');
const resultsPage = document.getElementById('resultsPage');
const userDetailsOverlay = document.getElementById('userDetailsOverlay');

// Store original user data for cancel functionality
let originalUserData = {};

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
    toast.innerHTML = `
        <svg class="toast-icon" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
        </svg>
        <span class="toast-message">${message}</span>
    `;
    
    // Add to body
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Hide toast after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, 5000);
}

// Alert Functions
function showLogoutAlert() {
    alertOverlay.style.display = 'block';
}

function closeAlert() {
    alertOverlay.style.display = 'none';
}

function confirmLogout() {
    // Clear user session data
    localStorage.removeItem('currentUser');
    // Redirect to home page (correct path from user folder)
    window.location.href = '../../index.html';
}

// Page Navigation Functions
function showResults() {
    profilePage.style.display = 'none';
    resultsPage.style.display = 'block';
}

function backToProfile() {
    resultsPage.style.display = 'none';
    profilePage.style.display = 'block';
}

function startTest() {
    // Check if user has test scheduled (new simplified format)
    const testSchedule = JSON.parse(localStorage.getItem('testSchedule') || '{}');

    if (testSchedule.date && testSchedule.time) {
        // Check if test date has passed
        const testDate = new Date(testSchedule.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (testDate >= today) {
            // Test date hasn't passed yet - show test details with restriction message
            showTestDetails(testSchedule, true);
        } else {
            // Test date has passed - clear old schedule and allow new enrollment
            localStorage.removeItem('testSchedule');
            window.location.href = 'enrollment.html';
        }
    } else {
        // No test scheduled, redirect to enrollment page
        window.location.href = 'enrollment.html';
    }
}

// Show test details modal (updated for simplified format)
function showTestDetails(scheduleData, isRestricted = false) {
    const testDate = new Date(scheduleData.date);
    const testDateStr = formatTestDate(testDate);

    // Add restriction message if test is still scheduled
    const restrictionMessage = isRestricted ? `
        <div class="test-restriction">
            <div class="restriction-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#F59E0B" stroke-width="2" fill="#F59E0B"/>
                    <text x="12" y="17" text-anchor="middle" fill="white" font-size="14" font-weight="bold">!</text>
                </svg>
            </div>
            <div class="restriction-content">
                <h4 style="color: #F59E0B; margin: 0 0 5px 0;">Test Restriction</h4>
                <p style="margin: 0; color: #64748B;">You cannot enroll in a new test until your scheduled test date has passed.</p>
            </div>
        </div>
    ` : '';

    const testDetailsModal = `
        <div class="test-details-overlay" id="testDetailsOverlay">
            <div class="test-details-modal">
                <div class="modal-header">
                    <h3 class="modal-title">Your Scheduled Test</h3>
                    <button class="modal-close" onclick="closeTestDetails()">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 6L18 18M6 18L18 6"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-content">
                    ${restrictionMessage}
                    <div class="test-session">
                        <h4>IELTS Test Session</h4>
                        <div class="test-info">
                            <p><strong>Tests:</strong> Writing, Reading & Listening</p>
                            <p><strong>Date:</strong> ${testDateStr}</p>
                            <p><strong>Time:</strong> ${scheduleData.time}</p>
                            <p><strong>Duration:</strong> 3 hours</p>
                            <p><strong>Test Center:</strong> ${scheduleData.center || 'Pretest Center'}</p>
                        </div>
                    </div>
                    <div class="test-session">
                        <h4>Speaking Test Information</h4>
                        <div style="background: linear-gradient(135deg, #dbeafe 0%, rgba(59, 130, 246, 0.1) 100%); border-radius: 12px; padding: 20px; border-left: 4px solid #3B82F6;">
                            <div style="display: flex; align-items: flex-start; gap: 15px;">
                                <div style="width: 40px; height: 40px; background: #3B82F6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0;">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                                        <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </div>
                                <div style="flex: 1;">
                                    <strong style="color: #2c3e50; font-size: 1rem; display: block; margin-bottom: 8px;">Speaking Test Schedule</strong>
                                    <p style="color: #666; line-height: 1.5; margin: 0; font-size: 0.9rem;">Your speaking test schedule will be provided on your main exam day. Please arrive 30 minutes early to receive your speaking test time slot.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="test-status">
                        <p><strong>Status:</strong> <span class="status-scheduled">Scheduled</span></p>
                    </div>
                </div>
                <div class="modal-buttons">
                    <button class="modal-btn modal-btn-primary" onclick="closeTestDetails()">Got it</button>
                </div>
            </div>
        </div>
    `;

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', testDetailsModal);

    // Show modal
    document.getElementById('testDetailsOverlay').style.display = 'block';
}

// Close test details modal
function closeTestDetails() {
    const modal = document.getElementById('testDetailsOverlay');
    if (modal) {
        modal.remove();
    }
}

// Format date for display
function formatTestDate(date) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Close alert when clicking outside the modal
    alertOverlay.addEventListener('click', function(e) {
        if (e.target === alertOverlay) {
            closeAlert();
        }
    });

    // ESC key to close alert
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAlert();
        }
    });
});

// Additional utility functions (if needed in the future)
function showNotification(message, type = 'info') {
    // This function can be used to show notifications
    // You can implement a notification system here
}

function validateForm(formData) {
    // This function can be used for form validation
    // Implement validation logic here
    return true;
}

// Initialize the page
function initializePage() {
    // Any initialization code can go here
}

// User Details Modal Functions - ONLY triggered by clicking avatar
async function showUserDetails() {

    try {
        // Get current user from localStorage (simple and fast)
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

        // Display user details in modal (read-only)
        document.getElementById('modalFirstName').textContent = currentUser.firstName || 'N/A';
        document.getElementById('modalLastName').textContent = currentUser.lastName || 'N/A';
        document.getElementById('modalPhone').textContent = currentUser.phone || 'N/A';

    } catch (error) {
        console.error('Failed to load user profile:', error);
        // Show error state
        document.getElementById('modalFirstName').textContent = 'Error loading data';
        document.getElementById('modalLastName').textContent = 'Error loading data';
        document.getElementById('modalPhone').textContent = 'Error loading data';
    }

    // Show modal
    const overlay = document.getElementById('userDetailsOverlay');
    if (overlay) {
        overlay.style.display = 'block';
        overlay.classList.add('show');
    }
}

function closeUserDetails() {
    const overlay = document.getElementById('userDetailsOverlay');
    if (overlay) {
        overlay.classList.remove('show');
        overlay.style.display = 'none';
    }
}

// Removed edit functionality - keeping function stubs for compatibility
function enableEdit() {
}

function cancelEdit() {
}

function resetToViewMode() {
}

function sendForgotPasswordSMS() {
}

async function saveDetails() {
    return;
    const currentPassword = document.getElementById('modalCurrentPassword').value.trim();
    const newPassword = document.getElementById('modalNewPassword').value.trim();
    const confirmPassword = document.getElementById('modalConfirmPassword').value.trim();
    
    const updatedData = {
        firstName: document.getElementById('modalFirstName').value.trim(),
        lastName: document.getElementById('modalLastName').value.trim(),
        phone: document.getElementById('modalPhone').value.trim()
    };
    
    // Validate inputs
    if (updatedData.firstName.length < 2) {
        showCustomAlert('First name must be at least 2 characters', 'error', 'Validation Error');
        return;
    }
    
    if (updatedData.lastName.length < 2) {
        showCustomAlert('Last name must be at least 2 characters', 'error', 'Validation Error');
        return;
    }
    
    // Password validation - only if user wants to change password
    if (currentPassword || newPassword || confirmPassword) {
        // If any password field is filled, all must be filled
        if (!currentPassword) {
            showCustomAlert('Please enter your current password', 'error', 'Password Required');
            return;
        }
        if (!newPassword) {
            showCustomAlert('Please enter your new password', 'error', 'Password Required');
            return;
        }
        if (!confirmPassword) {
            showCustomAlert('Please confirm your new password', 'error', 'Password Required');
            return;
        }
        
        // Validate new password
        if (newPassword.length < 6) {
            showCustomAlert('New password must be at least 6 characters long', 'error', 'Password Too Short');
            return;
        }
        
        // Check if new password matches confirmation
        if (newPassword !== confirmPassword) {
            showCustomAlert('New password and confirmation do not match', 'error', 'Password Mismatch');
            return;
        }
        
        // Add password change data
        updatedData.currentPassword = currentPassword;
        updatedData.newPassword = newPassword;
    }
    
    try {
        // Show loading state
        const saveBtn = document.getElementById('saveBtn');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;
        
        // Call API to update user profile
        const response = await apiClient.put('/user/profile/update', updatedData);
        
        if (response.success) {
            // Update localStorage with new data
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const updatedUser = {
                ...currentUser,
                ...response.data.user
            };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            
            // Update original data
            originalUserData = { ...updatedUser };
            
            // Reset to view mode
            resetToViewMode();
            
            // Close modal automatically
            closeUserDetails();
            
            // Show success toast
            showToast('Profile updated successfully!');
            
        } else {
            showCustomAlert('Failed to update profile: ' + (response.message || 'Unknown error'), 'error', 'Update Failed');
        }
        
    } catch (error) {
        console.error('Update profile error:', error);
        showCustomAlert('Error updating profile: ' + (error.message || 'Network error'), 'error', 'Network Error');
    } finally {
        // Reset button state
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.textContent = 'Save';
            saveBtn.disabled = false;
        }
    }
}

function resetToViewMode() {
    // Make inputs readonly
    document.getElementById('modalFirstName').readOnly = true;
    document.getElementById('modalLastName').readOnly = true;
    document.getElementById('modalPhone').readOnly = true;
    
    // Hide and clear password change fields
    document.getElementById('currentPasswordGroup').style.display = 'none';
    document.getElementById('newPasswordGroup').style.display = 'none';
    document.getElementById('confirmPasswordGroup').style.display = 'none';
    document.getElementById('forgotPasswordGroup').style.display = 'none';
    document.getElementById('modalCurrentPassword').value = '';
    document.getElementById('modalNewPassword').value = '';
    document.getElementById('modalConfirmPassword').value = '';
    
    // Reset button visibility
    document.getElementById('editBtn').style.display = 'inline-block';
    document.getElementById('saveBtn').style.display = 'none';
    document.getElementById('cancelBtn').style.display = 'none';
}

// Close modal when clicking outside
if (userDetailsOverlay) {
    userDetailsOverlay.addEventListener('click', function(e) {
        if (e.target === userDetailsOverlay) {
            closeUserDetails();
        }
    });
}

// ESC key to close user details modal
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && userDetailsOverlay && userDetailsOverlay.classList.contains('show')) {
        closeUserDetails();
    }
});

// Forgot password SMS function (placeholder)
function sendForgotPasswordSMS() {
    showCustomAlert('Forgot password SMS functionality will be available once SMS API is integrated. Please contact admin for password reset assistance.', 'info', 'Coming Soon');
}





// Custom Alert Function
function showCustomAlert(message, type = 'error', title = null) {
    // Remove existing alert if any
    const existingAlert = document.querySelector('.custom-alert-overlay');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Determine alert icon and title based on type
    let icon, alertTitle;
    if (type === 'error') {
        icon = '<i class="fas fa-exclamation-triangle"></i>';
        alertTitle = title || 'Error';
    } else if (type === 'success') {
        icon = '<i class="fas fa-check-circle"></i>';
        alertTitle = title || 'Success';
    } else if (type === 'warning') {
        icon = '<i class="fas fa-exclamation-circle"></i>';
        alertTitle = title || 'Warning';
    } else {
        icon = '<i class="fas fa-info-circle"></i>';
        alertTitle = title || 'Information';
    }
    
    // Create alert modal
    const alertOverlay = document.createElement('div');
    alertOverlay.className = 'custom-alert-overlay';
    alertOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
        animation: fadeIn 0.3s ease-out;
    `;
    
    const alertModal = document.createElement('div');
    alertModal.className = 'custom-alert-modal';
    alertModal.style.cssText = `
        background: linear-gradient(135deg, #1A2B6C 0%, #0f1729 50%, #000000 100%);
        border-radius: 12px;
        padding: 30px;
        max-width: 400px;
        width: 90%;
        color: white;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        text-align: center;
        animation: slideInUp 0.3s ease-out;
        border: 1px solid rgba(255, 255, 255, 0.1);
    `;
    
    alertModal.innerHTML = `
        <style>
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideInUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .alert-icon {
                font-size: 48px;
                margin-bottom: 20px;
                color: ${type === 'error' ? '#e74c3c' : type === 'success' ? '#27ae60' : type === 'warning' ? '#f39c12' : '#3498db'};
            }
            .alert-title {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 15px;
                color: white;
            }
            .alert-message {
                font-size: 16px;
                line-height: 1.5;
                margin-bottom: 30px;
                color: rgba(255, 255, 255, 0.9);
            }
            .alert-button {
                background: linear-gradient(135deg, #3498db, #2980b9);
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .alert-button:hover {
                background: linear-gradient(135deg, #2980b9, #21618c);
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(52, 152, 219, 0.4);
            }
        </style>
        <div class="alert-icon">${icon}</div>
        <div class="alert-title">${alertTitle}</div>
        <div class="alert-message">${message}</div>
        <button class="alert-button" onclick="this.closest('.custom-alert-overlay').remove()">
            OK
        </button>
    `;
    
    alertOverlay.appendChild(alertModal);
    document.body.appendChild(alertOverlay);
    
    // Auto close after 10 seconds for non-error alerts
    if (type !== 'error') {
        setTimeout(() => {
            if (alertOverlay.parentNode) {
                alertOverlay.remove();
            }
        }, 10000);
    }
}


// Navigation functions
function scheduleTest() {
    // Check for existing test schedule (simplified format)
    const testSchedule = JSON.parse(localStorage.getItem('testSchedule') || '{}');

    if (testSchedule.date && testSchedule.time) {
        // Check if test date has passed
        const testDate = new Date(testSchedule.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (testDate >= today) {
            // Test date hasn't passed yet - show restriction
            const testDateStr = testDate.toLocaleDateString('en-GB');

            showCustomAlert(
                'Test Already Scheduled',
                `You already have a scheduled IELTS test on ${testDateStr} at ${testSchedule.time}. Please complete your current test before scheduling a new one.`,
                'View Test Details',
                () => viewTestDetails()
            );
            return;
        } else {
            // Test date has passed - clear old schedule
            localStorage.removeItem('testSchedule');
        }
    }

    // No active test or test date has passed - allow scheduling
    window.location.href = './ofline-schedule.html';
}

function viewTestDetails() {
    // Check for test schedule (simplified format)
    const testSchedule = JSON.parse(localStorage.getItem('testSchedule') || '{}');

    if (testSchedule.date && testSchedule.time) {
        // User has scheduled test - show details modal
        showTestDetails(testSchedule, false); // false = no restriction, just view
        return;
    }

    // No test data found - redirect to test details page
    window.location.href = './test-details.html';
}

// Custom alert function for profile page
function showCustomAlert(title, message, buttonText = 'OK', onButtonClick = null) {
    // Remove existing alert if any
    const existingAlert = document.querySelector('.profile-alert-overlay');
    if (existingAlert) {
        existingAlert.remove();
    }

    // Create custom alert
    const alertHTML = `
        <div class="profile-alert-overlay" id="profileAlertOverlay">
            <div class="profile-alert-modal">
                <div class="alert-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="#1A2B6C" stroke-width="2" fill="#1A2B6C"/>
                        <text x="12" y="17" text-anchor="middle" fill="white" font-size="14" font-weight="bold">!</text>
                    </svg>
                </div>
                <h3 class="alert-title">${title}</h3>
                <p class="alert-message">${message}</p>
                <div class="alert-buttons">
                    <button class="alert-button" onclick="closeProfileAlert(${onButtonClick ? 'true' : 'false'})">${buttonText}</button>
                </div>
            </div>
        </div>
    `;

    // Add to body
    document.body.insertAdjacentHTML('beforeend', alertHTML);

    // Show alert with animation
    setTimeout(() => {
        document.getElementById('profileAlertOverlay').classList.add('show');
    }, 100);
    
    // Store callback function
    if (onButtonClick) {
        window.profileAlertCallback = onButtonClick;
    }
}

function closeProfileAlert(hasCallback = false) {
    const modal = document.querySelector('.profile-alert-overlay');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
            
            // Execute callback if exists
            if (hasCallback && window.profileAlertCallback) {
                window.profileAlertCallback();
                delete window.profileAlertCallback;
            }
        }, 300);
    }
}

// Update schedule button based on user's test status
function updateScheduleButton() {
    const scheduleCard = document.querySelector('.action-card[onclick="scheduleTest()"]');

    if (!scheduleCard) return;

    const cardTitle = scheduleCard.querySelector('.card-title');
    const cardDescription = scheduleCard.querySelector('.card-description');
    const cardButton = scheduleCard.querySelector('.card-button');

    // Check test schedule (simplified format)
    const testSchedule = JSON.parse(localStorage.getItem('testSchedule') || '{}');
    let hasActiveTest = false;

    if (testSchedule.date && testSchedule.time) {
        const testDate = new Date(testSchedule.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (testDate >= today) {
            hasActiveTest = true;
            // User has active test scheduled
            cardTitle.textContent = 'Test Scheduled';
            cardDescription.textContent = 'You have an active IELTS test scheduled';
            cardButton.textContent = 'View Details';
            cardButton.style.backgroundColor = '#F59E0B';
        }
    }

    // If no active test, keep default text
    if (!hasActiveTest) {
        cardTitle.textContent = 'Schedule Test';
        cardDescription.textContent = 'Book your offline IELTS exam slots';
        cardButton.textContent = 'Schedule now';
        cardButton.style.backgroundColor = ''; // Reset to default
    }
}

// Force scroll to top function
function forceScrollToTop() {
    // Try multiple methods to ensure scroll to top works
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Additional force for stubborn browsers
    setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, 0);
}

// Call initialization when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Force scroll to top when page loads
    forceScrollToTop();

    initializePage();
    updateScheduleButton();

    // Check if we should show results page
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('showResults') === 'true') {
        showResults();
        // Clean up URL by removing the parameter
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});

// Also handle page show event (back/forward navigation)
window.addEventListener('pageshow', function() {
    forceScrollToTop();
});