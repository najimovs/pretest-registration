// Offline Confirmation JavaScript

// Load and display final booking details
function loadBookingDetails() {
    const scheduleData = JSON.parse(localStorage.getItem('tempOfflineSchedule') || '{}');
    
    if (scheduleData.mainTest) {
        const mainDate = new Date(scheduleData.mainTest.date);
        const mainTime = scheduleData.mainTest.time;
        
        document.getElementById('confirm-main-date').textContent = formatDate(mainDate);
        document.getElementById('confirm-main-time').textContent = mainTime;
    }
    
    if (scheduleData.speakingTest) {
        const speakingDate = new Date(scheduleData.speakingTest.date);
        const speakingTime = scheduleData.speakingTest.time;
        
        document.getElementById('confirm-speaking-date').textContent = formatDate(speakingDate);
        document.getElementById('confirm-speaking-time').textContent = speakingTime;
    }
    
    if (scheduleData.paymentMethod) {
        const paymentMethodNames = {
            'click': 'Click',
            'payme': 'Payme'
        };
        document.getElementById('confirm-payment-method').textContent = paymentMethodNames[scheduleData.paymentMethod];
    }
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

// Navigation functions
function goToProfile() {
    window.location.href = 'profile.html';
}

function goToHome() {
    window.location.href = '../../index.html';
}

// Save booking to user data (optional - for future reference)
function saveBookingToUserData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const scheduleData = JSON.parse(localStorage.getItem('tempOfflineSchedule') || '{}');
    
    // Add user ID to the schedule data to bind it to this specific user
    if (currentUser.id && scheduleData.mainTest && scheduleData.speakingTest) {
        scheduleData.userId = currentUser.id; // Bind to current user
        localStorage.setItem('offlineSchedule', JSON.stringify(scheduleData));
    }
    
    if (currentUser.id && scheduleData.mainTest && scheduleData.speakingTest) {
        // Initialize bookings array if it doesn't exist
        if (!currentUser.bookings) {
            currentUser.bookings = [];
        }
        
        // Add new booking
        const booking = {
            id: 'BK' + Date.now(),
            type: 'offline',
            mainTest: {
                date: scheduleData.mainTest.date,
                time: scheduleData.mainTest.time,
                tests: ['Writing', 'Reading', 'Listening']
            },
            speakingTest: {
                date: scheduleData.speakingTest.date,
                time: scheduleData.speakingTest.time
            },
            paymentMethod: scheduleData.paymentMethod,
            amount: 79000,
            currency: 'UZS',
            status: 'confirmed',
            bookedAt: new Date().toISOString()
        };
        
        currentUser.bookings.push(booking);
        
        // Update localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Also update in users array
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem('users', JSON.stringify(users));
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    // Load and display booking details
    loadBookingDetails();
    
    // Save booking immediately when page loads (user reached congratulations)
    saveBookingToUserData();
    
    // Clear temp storage after saving
    localStorage.removeItem('tempOfflineSchedule');
    
    // Add confetti animation effect (optional)
    setTimeout(() => {
        createConfettiEffect();
    }, 1000);
});

// Simple confetti effect (optional visual enhancement)
function createConfettiEffect() {
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
    
    // Add CSS animation
    if (!document.getElementById('confetti-styles')) {
        const style = document.createElement('style');
        style.id = 'confetti-styles';
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