// Auth JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Scroll to top when page loads
    window.scrollTo(0, 0);

    // Initialize auth functionality
    initAuthForms();
    setupPhoneInputs();
    setupNameInputs();
    setupCountryDropdowns();
});

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

// Initialize form handlers
function initAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
}

// Phone input setup
function setupPhoneInputs() {
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            formatPhoneNumber(e.target);
        });
        
        input.addEventListener('blur', function(e) {
            validatePhoneNumber(e.target);
        });
    });
}

// Name input setup - only allow letters
function setupNameInputs() {
    const nameInputs = document.querySelectorAll('input[name="firstName"], input[name="lastName"]');
    
    nameInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            // Only allow letters, spaces, and common name characters
            let value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\u0100-\u017F\u0400-\u04FF\s'-]/g, '');
            e.target.value = value;
        });
        
        input.addEventListener('keypress', function(e) {
            // Block non-letter characters from being typed
            const char = String.fromCharCode(e.which);
            if (!/[a-zA-ZÀ-ÿ\u0100-\u017F\u0400-\u04FF\s'-]/.test(char)) {
                e.preventDefault();
            }
        });
    });
}

// Format phone number input
function formatPhoneNumber(input) {
    // Get cursor position before formatting
    const cursorStart = input.selectionStart;
    const cursorEnd = input.selectionEnd;
    const oldValue = input.value;
    
    // Extract only digits
    let value = input.value.replace(/\D/g, '');
    
    // Limit to 9 digits (after +998)
    if (value.length > 9) {
        value = value.substring(0, 9);
    }
    
    // Format the number progressively
    let formattedValue = '';
    
    if (value.length === 0) {
        formattedValue = '';
    } else if (value.length <= 2) {
        // First 2 digits: "90"
        formattedValue = value;
    } else if (value.length <= 5) {
        // Next 3 digits: "90 123"
        formattedValue = value.substring(0, 2) + ' ' + value.substring(2);
    } else if (value.length <= 7) {
        // Next 2 digits: "90 123 45"
        formattedValue = value.substring(0, 2) + ' ' + value.substring(2, 5) + ' ' + value.substring(5);
    } else {
        // Last 2 digits: "90 123 45 67"
        formattedValue = value.substring(0, 2) + ' ' + value.substring(2, 5) + ' ' + value.substring(5, 7) + ' ' + value.substring(7);
    }
    
    input.value = formattedValue;
    
    // Calculate new cursor position
    let newCursorPos = cursorStart;
    
    // Count spaces before the cursor position in the old value
    const oldSpacesBefore = (oldValue.substring(0, cursorStart).match(/\s/g) || []).length;
    const oldDigitsBefore = cursorStart - oldSpacesBefore;
    
    // Count spaces before the same digit position in the new value
    let newSpacesBefore = 0;
    let digitCount = 0;
    
    for (let i = 0; i < formattedValue.length && digitCount < oldDigitsBefore; i++) {
        if (formattedValue[i] === ' ') {
            newSpacesBefore++;
        } else {
            digitCount++;
        }
    }
    
    newCursorPos = oldDigitsBefore + newSpacesBefore;
    
    // Ensure cursor position is within bounds
    if (newCursorPos > formattedValue.length) {
        newCursorPos = formattedValue.length;
    }
    
    // Set cursor position
    setTimeout(() => {
        input.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
}

// Validate phone number
function validatePhoneNumber(input) {
    const value = input.value.replace(/\D/g, '');
    const phoneContainer = input.closest('.phone-input');
    const errorSpan = input.closest('.form-group').querySelector('.error-message');
    
    if (value.length !== 9) {
        showFieldError(input, phoneContainer, errorSpan, 'Please enter a valid phone number. Our test center will contact you regarding your exam schedule.');
        return false;
    } else {
        showFieldSuccess(input, phoneContainer, errorSpan);
        return true;
    }
}

// Password toggle functionality
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggle = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        toggle.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="2" fill="none"/>
                <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2"/>
            </svg>
        `;
    } else {
        input.type = 'password';
        toggle.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" fill="none"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
        `;
    }
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const phone = formData.get('userContact').replace(/\D/g, '');
    const password = formData.get('userSecret');
    
    // Reset previous errors
    clearFormErrors();
    
    // Validate inputs
    let isValid = true;
    
    if (!validatePhoneNumber(document.getElementById('loginPhone'))) {
        isValid = false;
    }
    
    if (password.length < 6) {
        const passwordInput = document.getElementById('loginPassword');
        const errorSpan = document.getElementById('passwordError');
        showFieldError(passwordInput, null, errorSpan, 'Password must be at least 6 characters');
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Show loading state
    const submitBtn = e.target.querySelector('.auth-btn');
    setLoadingState(submitBtn, true);
    
    try {
        // Call backend API
        const response = await apiClient.login({
            phone: `+998${phone}`,
            password: password
        });
        
        if (response.success) {
            // Store user data and registration info
            localStorage.setItem('currentUser', JSON.stringify(response.data.user));
            localStorage.setItem('currentRegistration', JSON.stringify(response.data.registration));

            // Check if user has scheduled test
            const hasScheduledTest = response.data.registration.schedule &&
                response.data.registration.schedule.mainTest &&
                response.data.registration.schedule.mainTest.date;

            if (hasScheduledTest) {
                // User has scheduled test - store the test data and redirect to profile
                const testData = {
                    mainTest: response.data.registration.schedule.mainTest,
                    speakingTest: response.data.registration.schedule.speakingTest
                };
                localStorage.setItem('offlineTestData', JSON.stringify(testData));

                showToast('Welcome back! Your test is scheduled.');

                setTimeout(() => {
                    // Redirect to profile page
                    window.location.href = './profile.html';
                }, 1500);
            } else {
                showToast('Login successful!');

                setTimeout(() => {
                    window.location.href = './profile.html';
                }, 1500);
            }
        } else {
            showFormError(response.message || 'Login failed');
        }
    } catch (error) {
        const errorMessage = apiClient.handleError(error);
        showFormError(errorMessage);
    } finally {
        setLoadingState(submitBtn, false);
    }
}

// Handle signup form submission
async function handleSignup(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const firstName = formData.get('firstName').trim();
    const lastName = formData.get('lastName').trim();
    const phone = formData.get('phone').replace(/\D/g, '');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    // Reset previous errors
    clearFormErrors();
    
    // Validate inputs
    let isValid = true;
    
    if (firstName.length < 3 || firstName.length > 16) {
        showFieldError(
            document.getElementById('firstName'),
            null,
            document.getElementById('firstNameError'),
            'First name must be between 3 and 16 characters'
        );
        isValid = false;
    }
    
    if (lastName.length < 3 || lastName.length > 16) {
        showFieldError(
            document.getElementById('lastName'),
            null,
            document.getElementById('lastNameError'),
            'Last name must be between 3 and 16 characters'
        );
        isValid = false;
    }
    
    if (!validatePhoneNumber(document.getElementById('signupPhone'))) {
        isValid = false;
    }
    
    if (password.length < 6) {
        showFieldError(
            document.getElementById('signupPassword'),
            null,
            document.getElementById('signupPasswordError'),
            'Please enter at least 6 characters'
        );
        isValid = false;
    }
    
    if (password !== confirmPassword) {
        showFieldError(
            document.getElementById('confirmPassword'),
            null,
            document.getElementById('confirmPasswordError'),
            'Passwords do not match'
        );
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Show loading state
    const submitBtn = e.target.querySelector('.auth-btn');
    setLoadingState(submitBtn, true);
    
    try {
        // Ensure phone number has proper country code
        let formattedPhone = phone;
        if (!phone.startsWith('+')) {
            // If phone doesn't start with +, assume it's Uzbekistan and add +998
            if (phone.startsWith('998')) {
                formattedPhone = `+${phone}`;
            } else {
                formattedPhone = `+998${phone}`;
            }
        }
        
        // Call backend API
        const response = await apiClient.register({
            firstName: firstName,
            lastName: lastName,
            phone: formattedPhone,
            email: `${formattedPhone.replace('+', '')}@temp.pretest.uz`, // Temporary email to satisfy backend requirements
            password: password,
            confirmPassword: confirmPassword
        });
        
        if (response.success) {
            // Store user data
            localStorage.setItem('currentUser', JSON.stringify(response.data.user));
            showToast('Account created successfully!');

            // Redirect to schedule page after toast
            setTimeout(() => {
                window.location.href = './ofline-schedule.html';
            }, 1500);
        } else {
            showFormError(response.message || 'Registration failed');
        }
    } catch (error) {
        const errorMessage = apiClient.handleError(error);
        showFormError(errorMessage);
    } finally {
        setLoadingState(submitBtn, false);
    }
}

// Utility functions
function showFieldError(input, container, errorSpan, message) {
    input.classList.add('error');
    input.classList.remove('success');
    
    if (container) {
        container.classList.add('error');
        container.classList.remove('success');
    }
    
    if (errorSpan) {
        errorSpan.textContent = message;
    }
}

function showFieldSuccess(input, container, errorSpan) {
    input.classList.add('success');
    input.classList.remove('error');
    
    if (container) {
        container.classList.add('success');
        container.classList.remove('error');
    }
    
    if (errorSpan) {
        errorSpan.textContent = '';
    }
}

function showFormError(message) {
    // Create error toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    toast.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
    toast.innerHTML = `
        <svg class="toast-icon" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
        </svg>
        <span class="toast-message">${message}</span>
    `;
    
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
    }, 5000);
}

function clearFormErrors() {
    const errorInputs = document.querySelectorAll('.error');
    const errorMessages = document.querySelectorAll('.error-message');
    
    errorInputs.forEach(input => {
        input.classList.remove('error', 'success');
    });
    
    errorMessages.forEach(span => {
        span.textContent = '';
    });
}

function setLoadingState(button, loading) {
    if (loading) {
        button.classList.add('loading');
        button.textContent = 'Processing...';
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.textContent = button.closest('form').id === 'loginForm' ? 'Login' : 'Sign up';
        button.disabled = false;
    }
}

// Country dropdown functionality
function setupCountryDropdowns() {
    // Setup country option clicks
    document.querySelectorAll('.country-option').forEach(option => {
        option.addEventListener('click', function() {
            const dropdown = this.closest('.country-dropdown');
            const phoneInput = dropdown.closest('.phone-input');
            const isLogin = phoneInput.closest('#loginForm') !== null;
            const prefix = isLogin ? 'login' : 'signup';
            
            // Update selected country
            selectCountry(prefix, this.dataset.code, this.dataset.flag, this.dataset.country);
            
            // Hide dropdown
            toggleCountryDropdown(prefix);
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.phone-input')) {
            document.querySelectorAll('.country-dropdown').forEach(dropdown => {
                dropdown.classList.remove('show');
            });
            document.querySelectorAll('.country-select').forEach(select => {
                select.classList.remove('active');
            });
        }
    });
}

function toggleCountryDropdown(prefix) {
    const dropdown = document.getElementById(prefix + 'CountryDropdown');
    const select = dropdown.previousElementSibling;
    
    // Close all other dropdowns first
    document.querySelectorAll('.country-dropdown').forEach(d => {
        if (d !== dropdown) {
            d.classList.remove('show');
        }
    });
    document.querySelectorAll('.country-select').forEach(s => {
        if (s !== select) {
            s.classList.remove('active');
        }
    });
    
    // Toggle current dropdown
    dropdown.classList.toggle('show');
    select.classList.toggle('active');
}

function selectCountry(prefix, code, flagSrc, country) {
    const selectedFlag = document.getElementById(prefix + 'SelectedFlag');
    const selectedCode = document.getElementById(prefix + 'SelectedCode');
    
    selectedFlag.src = flagSrc;
    selectedFlag.alt = country;
    selectedCode.textContent = code;
    
    // Clear phone input and update placeholder
    const phoneInput = document.getElementById(prefix === 'login' ? 'loginPhone' : 'signupPhone');
    phoneInput.value = '';
    
    // Set country-specific placeholder
    const placeholders = {
        '+998': '90 123 45 67',
        '+1': '555 123 4567',
        '+44': '7911 123456',
        '+7': '900 123 45 67',
        '+992': '93 123 4567',
        '+90': '532 123 45 67',
        '+93': '70 123 4567',
        '+993': '65 12 34 56',
        '+86': '138 0013 8000',
        '+81': '90 1234 5678'
    };
    
    phoneInput.placeholder = placeholders[code] || '123 456 789';
}

// Custom modal alert function
function showModalAlert(title, message, buttonText = 'OK') {
    // Remove existing modal if any
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal elements
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.innerHTML = `
        <div class="modal-alert">
            <div class="modal-icon">
                <svg viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z"/>
                </svg>
            </div>
            <h3 class="modal-title">${title}</h3>
            <p class="modal-message">${message}</p>
            <button class="modal-button" onclick="closeModalAlert()">${buttonText}</button>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(modalOverlay);
    
    // Show modal with animation
    setTimeout(() => {
        modalOverlay.classList.add('show');
    }, 10);
    
    // Close on overlay click
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeModalAlert();
        }
    });
    
    // Close on escape key
    const handleEscape = function(e) {
        if (e.key === 'Escape') {
            closeModalAlert();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

function closeModalAlert() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
    }
}

// Real-time validation
document.addEventListener('input', function(e) {
    if (e.target.matches('input[name="firstName"]')) {
        const firstName = e.target.value;
        const errorSpan = e.target.closest('.form-group').querySelector('.error-message');
        
        if (firstName.length > 0 && firstName.length < 3) {
            showFieldError(e.target, null, errorSpan, 'First name must be at least 3 characters');
        } else if (firstName.length > 16) {
            showFieldError(e.target, null, errorSpan, 'First name must be no more than 16 characters');
        } else if (firstName.length >= 3 && firstName.length <= 16) {
            showFieldSuccess(e.target, null, errorSpan);
        }
    }
    
    if (e.target.matches('input[name="lastName"]')) {
        const lastName = e.target.value;
        const errorSpan = e.target.closest('.form-group').querySelector('.error-message');
        
        if (lastName.length > 0 && lastName.length < 3) {
            showFieldError(e.target, null, errorSpan, 'Last name must be at least 3 characters');
        } else if (lastName.length > 16) {
            showFieldError(e.target, null, errorSpan, 'Last name must be no more than 16 characters');
        } else if (lastName.length >= 3 && lastName.length <= 16) {
            showFieldSuccess(e.target, null, errorSpan);
        }
    }
    
    if (e.target.matches('input[name="password"]')) {
        const password = e.target.value;
        const errorSpan = e.target.closest('.form-group').querySelector('.error-message');
        
        if (password.length > 0 && password.length < 6) {
            showFieldError(e.target, null, errorSpan, 'Please enter at least 6 characters');
        } else if (password.length >= 6) {
            showFieldSuccess(e.target, null, errorSpan);
        }
    }
    
    if (e.target.matches('input[name="confirmPassword"]')) {
        const confirmPassword = e.target.value;
        const password = document.querySelector('input[name="password"]').value;
        const errorSpan = e.target.closest('.form-group').querySelector('.error-message');
        
        if (confirmPassword.length > 0 && confirmPassword !== password) {
            showFieldError(e.target, null, errorSpan, 'Passwords do not match');
        } else if (confirmPassword === password && confirmPassword.length >= 6) {
            showFieldSuccess(e.target, null, errorSpan);
        }
    }
});