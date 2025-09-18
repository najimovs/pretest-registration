let currentStep = 1;
let selectedTrainingType = '';
let selectedPlan = '';
let selectedPayment = '';


// B2B Contact Modal functionality (enrollment page specific)
function showB2BContactModal() {
    // Remove existing modal if any
    const existingModal = document.querySelector('.b2b-contact-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create B2B contact modal
    const modalHTML = `
        <div class="b2b-contact-overlay" id="b2bContactOverlay">
            <div class="b2b-contact-modal">
                <button class="close-modal" onclick="closeB2BContactModal()">&times;</button>
                
                <div class="b2b-contact-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="8" width="16" height="12" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity="0.1"/>
                        <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2"/>
                        <path d="M4 12h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <circle cx="12" cy="14" r="1" fill="currentColor"/>
                        <path d="M9 16h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>
                        <path d="M10 18h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
                        <rect x="6" y="10" width="2" height="2" rx="0.5" fill="currentColor" opacity="0.6"/>
                        <rect x="16" y="10" width="2" height="2" rx="0.5" fill="currentColor" opacity="0.6"/>
                    </svg>
                </div>
                
                <h2 class="b2b-contact-title">B2B Partnership</h2>
                <p class="b2b-contact-subtitle">
                    Ready to partner with us? Contact our business development team for corporate IELTS training solutions.
                </p>
                
                <div class="contact-details">
                    <div class="contact-item">
                        <div class="contact-item-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" stroke-width="2"/>
                                <polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </div>
                        <div class="contact-item-content">
                            <div class="contact-item-label">Email Address</div>
                            <div class="contact-item-value">
                                <a href="mailto:suxrob_erkabayoff@yahoo.com">suxrob_erkabayoff@yahoo.com</a>
                            </div>
                        </div>
                    </div>
                    
                    <div class="contact-item">
                        <div class="contact-item-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </div>
                        <div class="contact-item-content">
                            <div class="contact-item-label">Phone Numbers</div>
                            <div class="contact-item-value">
                                <div class="phone-numbers">
                                    <a href="tel:+998771015900">+998 77 101 5900</a>
                                    <a href="tel:+998771016900">+998 77 101 6900</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="b2b-contact-footer">
                    Available Monday - Saturday, 9:00 AM - 6:00 PM
                </div>
            </div>
        </div>
    `;
    
    // Add to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal with animation
    setTimeout(() => {
        document.getElementById('b2bContactOverlay').classList.add('show');
    }, 100);
    
    // Close on overlay click
    document.getElementById('b2bContactOverlay').addEventListener('click', function(e) {
        if (e.target === this) {
            closeB2BContactModal();
        }
    });
    
    // Close on escape key
    const handleEscape = function(e) {
        if (e.key === 'Escape') {
            closeB2BContactModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

function closeB2BContactModal() {
    const modal = document.querySelector('.b2b-contact-overlay');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
    }
}

// Training type selection
document.addEventListener('DOMContentLoaded', function() {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    // Training type selection
    document.querySelectorAll('.training-card').forEach(card => {
        card.addEventListener('click', function() {
            // Special handling for B2B card
            if (this.dataset.type === 'b2b') {
                showB2BContactModal();
                return;
            }
            
            document.querySelectorAll('.training-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            selectedTrainingType = this.dataset.type;
            document.getElementById('next-btn-1').disabled = false;
        });
    });

    // Plan selection
    document.querySelectorAll('.plan-card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            selectedPlan = this.dataset.plan;
            document.getElementById('next-btn-2').disabled = false;
        });
    });

    // Payment method selection (new design)
    document.querySelectorAll('.payment-option-online').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.payment-option-online').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            
            // Handle radio buttons
            document.querySelectorAll('input[name="payment-method-online"]').forEach(radio => {
                radio.checked = false;
            });
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;
            
            selectedPayment = this.dataset.payment;
            document.getElementById('next-btn-3').disabled = false;
        });
    });
    
    // Also handle radio button clicks directly
    document.querySelectorAll('input[name="payment-method-online"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                const option = this.closest('.payment-option-online');
                document.querySelectorAll('.payment-option-online').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                selectedPayment = this.value;
                document.getElementById('next-btn-3').disabled = false;
            }
        });
    });

    // Initialize
    updateProgressBar(1);
});

function updateProgressBar(step) {
    // Reset all steps
    for (let i = 1; i <= 4; i++) {
        const stepEl = document.getElementById(`step${i}-progress`);
        const lineEl = document.getElementById(`line${i}`);
        
        stepEl.classList.remove('active', 'completed');
        if (lineEl) lineEl.classList.remove('completed');
        
        if (i < step) {
            stepEl.classList.add('completed');
            if (lineEl) lineEl.classList.add('completed');
        } else if (i === step) {
            stepEl.classList.add('active');
        }
    }
}

function updatePaymentDetails() {
    document.getElementById('selected-type').textContent = selectedTrainingType.charAt(0).toUpperCase() + selectedTrainingType.slice(1);
    
    const planNames = {
        'free': 'Free',
        'standard': 'Standard',
        'premium': 'Premium',
        'pro': 'Pro'
    };
    document.getElementById('selected-plan').textContent = planNames[selectedPlan];
    
    const prices = {
        'free': 'Free',
        'standard': '50,000 UZS',
        'pro': '99,000 UZS',
        'premium': '350,000 UZS'
    };
    const priceText = prices[selectedPlan];
    document.getElementById('total-price').textContent = priceText;
    
    // Also update the big total display
    const totalDisplay = document.getElementById('total-price-display');
    if (totalDisplay) {
        totalDisplay.textContent = priceText;
    }
}

function nextStep() {
    // Handle offline flow routing
    if (currentStep === 1 && selectedTrainingType === 'offline') {
        // Redirect to offline schedule page
        window.location.href = 'offline-schedule.html';
        return;
    }
    
    if (currentStep < 4) {
        // Hide current step
        document.getElementById(`step${currentStep}`).classList.remove('active');
        
        // If free plan selected, skip payment step
        if (currentStep === 2 && selectedPlan === 'free') {
            currentStep = 4;
        } else {
            currentStep++;
        }
        
        // Show next step
        document.getElementById(`step${currentStep}`).classList.add('active');
        
        // Scroll to top of page
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Update progress bar
        updateProgressBar(currentStep);
        
        // Update payment details if on payment step
        if (currentStep === 3) {
            updatePaymentDetails();
        }
        
        // Update success page if on success step
        if (currentStep === 4) {
            updateSuccessDetails();
            // Trigger SVG animation by reloading it
            triggerSuccessAnimation();
            // Add confetti effect
            setTimeout(() => {
                createOnlineConfettiEffect();
            }, 1000);
        }
    }
}

function previousStep() {
    if (currentStep > 1) {
        document.getElementById(`step${currentStep}`).classList.remove('active');
        
        // If coming back from success page and was free plan, go back to step 2
        if (currentStep === 4 && selectedPlan === 'free') {
            currentStep = 2;
        } else {
            currentStep--;
        }
        
        document.getElementById(`step${currentStep}`).classList.add('active');
        
        // Scroll to top of page
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        updateProgressBar(currentStep);
    }
}

async function startTest() {
    // Only for Free Online plan - connect with admin-created tests
    if (selectedTrainingType === 'online' && selectedPlan === 'free') {
        try {
            // Show loading
            showTestPreparationLoading();
            
            // Get available tests from admin-created tests
            const response = await apiClient.get('/user/tests');
            
            // Debug logging to see what we're getting
            
            if (response.success && response.data.tests && response.data.tests.length > 0) {
                const availableTest = response.data.tests[0]; // Get first available test
                
                // Start test session
                const sessionResponse = await apiClient.post(`/user/tests/${availableTest._id}/start`);
                
                if (sessionResponse.success) {
                    // Store test session info
                    localStorage.setItem('currentTestSession', JSON.stringify({
                        testId: availableTest._id,
                        sessionId: sessionResponse.data.sessionId,
                        testType: 'full', // Full IELTS test
                        startTime: new Date().toISOString(),
                        testData: availableTest
                    }));
                    
                    hideTestPreparationLoading();
                    
                    // Start the test flow with listening instructions
                    window.location.href = 'listening-instructions.html';
                } else {
                    hideTestPreparationLoading();
                    showErrorMessage('Failed to start test session. Please try again.');
                }
            } else {
                hideTestPreparationLoading();
                if (!response.success) {
                    showErrorMessage(`Test service error: ${response.message || 'Unknown error'}`);
                } else if (!response.data?.tests) {
                    showErrorMessage('No tests data received from server. Please contact support.');
                } else if (response.data.tests.length === 0) {
                    showErrorMessage('⚠️ No active tests available at the moment.\n\n📝 Tests need to be created and published by administrators first.\n\n📞 Please contact support or try again later.');
                } else {
                    showErrorMessage('No tests available. Please contact support.');
                }
            }
            
        } catch (error) {
            console.error('Error starting test:', error);
            hideTestPreparationLoading();
            showErrorMessage('Error starting test. Please check your connection and try again.');
        }
    } else {
        // For other plans, show coming soon message
        showComingSoonMessage();
    }
}

function showTestPreparationLoading() {
    const loadingHTML = `
        <div id="testPrepLoading" class="loading-overlay">
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <h3>Preparing Your Test</h3>
                <p>Please wait while we set up your IELTS mock exam...</p>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', loadingHTML);
}

function hideTestPreparationLoading() {
    const loading = document.getElementById('testPrepLoading');
    if (loading) loading.remove();
}

function showErrorMessage(message) {
    const errorHTML = `
        <div id="errorModal" class="error-modal-overlay">
            <div class="error-modal">
                <div class="error-icon">⚠️</div>
                <h3>Test Setup Error</h3>
                <p>${message}</p>
                <button onclick="closeErrorModal()" class="btn btn-primary">OK</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', errorHTML);
}

function closeErrorModal() {
    const modal = document.getElementById('errorModal');
    if (modal) modal.remove();
}

function showComingSoonMessage() {
    const comingSoonHTML = `
        <div id="comingSoonModal" class="error-modal-overlay">
            <div class="error-modal">
                <div class="error-icon">🚀</div>
                <h3>Coming Soon</h3>
                <p>This plan will be available soon. Currently, only the Free Online plan is active.</p>
                <button onclick="closeComingSoonModal()" class="btn btn-primary">OK</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', comingSoonHTML);
}

function closeComingSoonModal() {
    const modal = document.getElementById('comingSoonModal');
    if (modal) modal.remove();
}

// Form data collection for backend integration
function collectFormData() {
    return {
        trainingType: selectedTrainingType,
        plan: selectedPlan,
        paymentMethod: selectedPayment,
        timestamp: new Date().toISOString()
    };
}

// Backend integration functions (to be implemented)
function submitRegistration() {
    const formData = collectFormData();
    
    // Example backend call:
    /*
    fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        nextStep();
    })
    .catch(error => {
        console.error('Registration failed:', error);
    });
    */
}

function processPayment() {
    const paymentData = {
        ...collectFormData(),
        amount: getPriceAmount(selectedPlan),
        currency: 'UZS'
    };
    
    
    // Payment processing logic for Payme/Click
    if (selectedPayment === 'payme') {
        // Integrate with Payme API
    } else if (selectedPayment === 'click') {
        // Integrate with Click API
    }
}

function getPriceAmount(plan) {
    const prices = {
        'free': 0,
        'standard': 50000,
        'pro': 99000,
        'premium': 350000
    };
    return prices[plan];
}

// Update success page details
function updateSuccessDetails() {
    const planNames = {
        'free': 'Free',
        'standard': 'Standard',
        'premium': 'Premium',
        'pro': 'Pro'
    };
    
    const prices = {
        'free': 'Free',
        'standard': '50,000 UZS',
        'pro': '99,000 UZS',
        'premium': '350,000 UZS'
    };
    
    const paymentNames = {
        'click': 'Click',
        'payme': 'Payme'
    };
    
    // Update success page elements
    const successType = document.getElementById('success-type');
    const successPlan = document.getElementById('success-plan');
    const successPayment = document.getElementById('success-payment');
    const successTotal = document.getElementById('success-total');
    
    if (successType) successType.textContent = selectedTrainingType.charAt(0).toUpperCase() + selectedTrainingType.slice(1);
    if (successPlan) successPlan.textContent = planNames[selectedPlan];
    if (successPayment) successPayment.textContent = paymentNames[selectedPayment] || 'Not selected';
    if (successTotal) successTotal.textContent = prices[selectedPlan];
}

// Navigate to profile
function goToProfile() {
    window.location.href = 'profile.html';
}

// Trigger success animation
function triggerSuccessAnimation() {
    const svg = document.querySelector('#step4 .checkmark');
    if (svg) {
        // Clone and replace the SVG to restart animations
        const newSvg = svg.cloneNode(true);
        svg.parentNode.replaceChild(newSvg, svg);
    }
}

// Confetti effect for online success
function createOnlineConfettiEffect() {
    const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];
    const confettiContainer = document.createElement('div');
    confettiContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1000;
    `;
    document.body.appendChild(confettiContainer);
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: absolute;
            width: 8px;
            height: 8px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            top: -10px;
            left: ${Math.random() * 100}%;
            animation: confetti-fall ${Math.random() * 2 + 2}s linear forwards;
        `;
        confettiContainer.appendChild(confetti);
    }
    
    // Add CSS animation if not exists
    if (!document.getElementById('online-confetti-styles')) {
        const style = document.createElement('style');
        style.id = 'online-confetti-styles';
        style.textContent = `
            @keyframes confetti-fall {
                0% {
                    transform: translateY(-100vh) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: translateY(100vh) rotate(720deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Clean up after animation
    setTimeout(() => {
        if (confettiContainer && confettiContainer.parentNode) {
            confettiContainer.parentNode.removeChild(confettiContainer);
        }
    }, 4000);
}