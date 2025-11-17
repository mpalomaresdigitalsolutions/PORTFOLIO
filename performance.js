// Performance Monitoring and Optimization
(function() {
    'use strict';
    
    // Performance metrics collection
    function collectPerformanceMetrics() {
        if (!window.performance || !window.performance.timing) return;
        
        const timing = window.performance.timing;
        const metrics = {
            domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
            loadComplete: timing.loadEventEnd - timing.navigationStart,
            firstPaint: null,
            firstContentfulPaint: null
        };
        
        // Get paint timing metrics if available
        if (window.performance.getEntriesByType) {
            const paintEntries = window.performance.getEntriesByType('paint');
            paintEntries.forEach(entry => {
                if (entry.name === 'first-paint') {
                    metrics.firstPaint = entry.startTime;
                } else if (entry.name === 'first-contentful-paint') {
                    metrics.firstContentfulPaint = entry.startTime;
                }
            });
        }
        
        // Log metrics for debugging
        console.log('Performance Metrics:', metrics);
        
        // Send to analytics if available
        if (window.gtag) {
            window.gtag('event', 'page_performance', metrics);
        }
    }
    
    // Optimize image loading
    function optimizeImageLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            images.forEach(img => {
                img.src = img.dataset.src;
                img.classList.add('loaded');
            });
        }
    }
    
    // Optimize font loading
    function optimizeFontLoading() {
        if ('fonts' in document) {
            document.fonts.ready.then(() => {
                document.documentElement.classList.add('font-loaded');
                console.log('Fonts loaded successfully');
            }).catch(error => {
                console.warn('Font loading failed:', error);
            });
        }
    }
    
    // Resource hints optimization
    function addResourceHints() {
        const criticalResources = [
            { href: 'Profile.png', as: 'image' },
            { href: 'critical.css', as: 'style' }
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            document.head.appendChild(link);
        });
    }
    
    // Lazy load non-critical CSS
    function lazyLoadCSS() {
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"][media="print"]');
        stylesheets.forEach(link => {
            link.addEventListener('load', () => {
                link.media = 'all';
            });
        });
    }
    
    // Monitor Core Web Vitals
    function monitorCoreWebVitals() {
        function measureCoreWebVitals() {
            // Measure Largest Contentful Paint (LCP)
            if ('PerformanceObserver' in window) {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    console.log('LCP:', lastEntry.startTime);
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
                
                // Measure First Input Delay (FID)
                const fidObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        console.log('FID:', entry.processingStart - entry.startTime);
                    });
                });
                fidObserver.observe({ entryTypes: ['first-input'] });
                
                // Measure Cumulative Layout Shift (CLS)
                let clsValue = 0;
                const clsObserver = new PerformanceObserver((list) => {
                    list.getEntries().forEach(entry => {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    });
                    console.log('CLS:', clsValue);
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });
            }
        }
        
        // Measure when page is stable
        window.addEventListener('load', measureCoreWebVitals);
    }
    
    // Register service worker
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('sw.js')
                    .then(registration => {
                        console.log('ServiceWorker registration successful:', registration.scope);
                        
                        // Handle updates
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // New content available, show update notification
                                    console.log('New content available, please refresh.');
                                }
                            });
                        });
                        registration.update();
                        if (registration.waiting) {
                            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                        }
                        navigator.serviceWorker.addEventListener('controllerchange', () => {
                            window.location.reload();
                        });
                    })
                    .catch(error => {
                        console.log('ServiceWorker registration failed:', error);
                    });
            });
        }
    }
    
    // Initialize performance optimizations
    function initializePerformanceOptimizations() {
        // Collect metrics when page is fully loaded
        window.addEventListener('load', collectPerformanceMetrics);
        
        // Optimize image loading
        optimizeImageLoading();
        
        // Optimize font loading
        optimizeFontLoading();
        
        // Add resource hints
        addResourceHints();
        
        // Lazy load CSS
        lazyLoadCSS();
        
        // Monitor Core Web Vitals
        monitorCoreWebVitals();
        
        // Register service worker
        registerServiceWorker();
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePerformanceOptimizations);
    } else {
        initializePerformanceOptimizations();
    }
    
    // Expose performance utilities globally
    window.performanceUtils = {
        collectMetrics: collectPerformanceMetrics,
        optimizeImages: optimizeImageLoading,
        optimizeFonts: optimizeFontLoading
    };
})();