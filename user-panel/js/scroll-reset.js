// Universal Scroll Reset Script
// This script forces pages to start from top when navigating

(function() {
    'use strict';

    // Force scroll to top function with multiple fallbacks
    function forceScrollToTop() {
        // Method 1: Standard scroll to top
        if (window.scrollTo) {
            window.scrollTo(0, 0);
        }

        // Method 2: Document element scroll
        if (document.documentElement) {
            document.documentElement.scrollTop = 0;
        }

        // Method 3: Body scroll (for older browsers)
        if (document.body) {
            document.body.scrollTop = 0;
        }

        // Method 4: Using scrollIntoView
        const firstElement = document.querySelector('body');
        if (firstElement && firstElement.scrollIntoView) {
            firstElement.scrollIntoView({ top: 0, behavior: 'instant' });
        }

        // Method 5: Force with setTimeout for stubborn cases
        setTimeout(function() {
            if (window.scrollTo) {
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }
            if (document.documentElement) {
                document.documentElement.scrollTop = 0;
            }
            if (document.body) {
                document.body.scrollTop = 0;
            }
        }, 10);
    }

    // Reset scroll history to prevent restoration
    function preventScrollRestoration() {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
    }

    // Execute immediately if document is already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            preventScrollRestoration();
            forceScrollToTop();
        });
    } else {
        preventScrollRestoration();
        forceScrollToTop();
    }

    // Handle page navigation (back/forward buttons)
    window.addEventListener('pageshow', function(event) {
        preventScrollRestoration();
        forceScrollToTop();
    });

    // Handle browser refresh
    window.addEventListener('beforeunload', function() {
        preventScrollRestoration();
        forceScrollToTop();
    });

    // Additional safety net - reset on window load
    window.addEventListener('load', function() {
        preventScrollRestoration();
        forceScrollToTop();
    });

    // Export function for manual use
    if (typeof window !== 'undefined') {
        window.forceScrollToTop = forceScrollToTop;
    }

})();