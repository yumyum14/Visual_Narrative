// Main ScrollTelling Class
class ScrollTelling {
    constructor() {
        this.container = document.getElementById('main-container');
        this.images = [];
        this.sections = [];
        
        this.currentSection = 0;
        this.scrollCount = 0;
        this.scrollThreshold = 1;
        this.isScrolling = false;
        this.scrollDelay = 800;
        
        // Touch handling
        this.touchStartX = 0;
        this.touchStartY = 0;
        
        this.init();
    }
    
    init() {
        try {
            this.createSections();
            this.createGlobalProgressBar();
            this.createScrollHint();
            this.setupScrollHandler();
            this.createSectionCounter();
            this.checkOrientation();
            this.setupContinueButton();
            
            // Add event listeners for orientation and resize
            window.addEventListener('orientationchange', () => {
                setTimeout(() => this.checkOrientation(), 100);
            });
            
            window.addEventListener('resize', () => {
                this.checkOrientation();
            });
            
            // Setup touch events
            this.setupTouchEvents();
            
            console.log('ScrollTelling initialized successfully');
        } catch (error) {
            console.error('Failed to initialize ScrollTelling:', error);
            this.showError('Failed to load the application.');
        }
    }
    
    createSections() {
        // Create 19 sections
        const totalImages = 25;
        this.container.style.width = `${totalImages * 100}vw`;
        
        for (let i = 0; i < totalImages; i++) {
            const imageNumber = i + 1;
            const imagePath = `./images/image${imageNumber}.png`;
            
            const section = document.createElement('section');
            section.className = `section ${i === 0 ? 'active' : ''}`;
            section.id = `section-${imageNumber}`;
            
            section.innerHTML = `
                <div class="image-container">
                    <div class="image-loading">Loading Image ${imageNumber}...</div>
                    <img src="${imagePath}" 
                         alt="Image ${imageNumber}" 
                         class="section-image"
                         loading="lazy"
                         onload="this.previousElementSibling.style.display='none'"
                         onerror="this.style.display='none'; this.previousElementSibling.textContent='Image ${imageNumber} failed to load'">
                </div>
            `;
            
            this.container.appendChild(section);
            this.images.push({ src: imagePath, alt: `Image ${imageNumber}` });
        }
        
        this.sections = document.querySelectorAll('.section');
    }
    
    createGlobalProgressBar() {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'global-progress-container';
        progressContainer.innerHTML = '<div class="global-progress-bar" id="global-progress-bar"></div>';
        document.body.appendChild(progressContainer);
        this.globalProgressBar = document.getElementById('global-progress-bar');
    }
    
    createScrollHint() {
        const scrollHint = document.createElement('div');
        scrollHint.className = 'scroll-hint';
        scrollHint.textContent = 'Scroll to navigate →';
        scrollHint.id = 'scroll-hint';
        document.body.appendChild(scrollHint);
        this.scrollHint = scrollHint;
    }
    
    createSectionCounter() {
        const counter = document.createElement('div');
        counter.className = 'section-counter';
        counter.id = 'section-counter';
        counter.textContent = `1 / ${this.images.length}`;
        document.body.appendChild(counter);
    }
    
    updateSectionCounter() {
        const counter = document.getElementById('section-counter');
        if (counter) {
            counter.textContent = `${this.currentSection + 1} / ${this.images.length}`;
        }
    }
    
    updateGlobalProgress() {
        if (this.globalProgressBar) {
            const totalProgress = ((this.currentSection * this.scrollThreshold + this.scrollCount) / 
                                 (this.images.length * this.scrollThreshold)) * 100;
            this.globalProgressBar.style.width = `${totalProgress}%`;
        }
    }
    
    // ORIENTATION CHECK METHOD
    checkOrientation() {
        const rotateOverlay = document.getElementById('rotate-overlay');
        const mainContainer = document.getElementById('main-container');
        const isMobile = window.innerWidth <= 768;
        const isPortrait = window.innerHeight > window.innerWidth;
        
        if (isMobile && isPortrait) {
            // Show rotate message in portrait
            if (rotateOverlay) {
                rotateOverlay.style.display = 'flex';
            }
            document.body.style.overflow = 'hidden';
            
            // Hide main content elements
            document.querySelectorAll('.global-progress-container, .section-counter, .scroll-hint')
                .forEach(el => el.style.display = 'none');
            
            if (mainContainer) mainContainer.style.display = 'none';
        } else {
            // Hide rotate message
            if (rotateOverlay) {
                rotateOverlay.style.display = 'none';
            }
            document.body.style.overflow = '';
            
            // Show main content elements
            document.querySelectorAll('.global-progress-container, .section-counter, .scroll-hint')
                .forEach(el => el.style.display = 'block');
            
            if (mainContainer) mainContainer.style.display = 'flex';
            
            // Update image display for landscape
            this.updateImageDisplayForLandscape();
        }
    }
    
    updateImageDisplayForLandscape() {
        if (window.innerWidth <= 768 && window.innerWidth > window.innerHeight) {
            // Mobile landscape mode
            document.querySelectorAll('.section-image').forEach(img => {
                img.style.objectFit = 'contain';
                img.style.filter = 'brightness(0.85)';
            });
        } else {
            // Desktop or portrait mode
            document.querySelectorAll('.section-image').forEach(img => {
                img.style.objectFit = 'cover';
                img.style.filter = 'brightness(0.7)';
            });
        }
    }
    
    setupContinueButton() {
        const continueBtn = document.getElementById('continue-portrait');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                const rotateOverlay = document.getElementById('rotate-overlay');
                if (rotateOverlay) {
                    rotateOverlay.style.display = 'none';
                }
                
                document.body.style.overflow = '';
                
                // Show all content elements
                document.querySelectorAll('.container, .global-progress-container, .section-counter, .scroll-hint')
                    .forEach(el => el.style.display = 'block');
                
                // Force show content even in portrait
                document.body.classList.add('force-show-content');
            });
        }
    }
    
    setupScrollHandler() {
        let lastScrollTime = 0;
        
        window.addEventListener('wheel', (e) => {
            const currentTime = Date.now();
            
            if (currentTime - lastScrollTime < this.scrollDelay || this.isScrolling) {
                return;
            }
            
            lastScrollTime = currentTime;
            
            if (e.deltaY > 0) {
                this.handleScrollDown();
            } else if (e.deltaY < 0) {
                this.handleScrollUp();
            }
        });
        
        window.addEventListener('keydown', (e) => {
            if (this.isScrolling) return;
            
            if (e.key === 'ArrowDown' || e.key === ' ') {
                this.handleScrollDown();
            } else if (e.key === 'ArrowUp') {
                this.handleScrollUp();
            }
        });
        
        // Hide scroll hint after first interaction
        const hideHint = () => {
            if (this.scrollHint) {
                this.scrollHint.style.opacity = '0';
                setTimeout(() => {
                    if (this.scrollHint) {
                        this.scrollHint.style.display = 'none';
                    }
                }, 500);
            }
            window.removeEventListener('wheel', hideHint);
            window.removeEventListener('keydown', hideHint);
            document.removeEventListener('click', hideHint);
        };
        
        window.addEventListener('wheel', hideHint, { once: true });
        window.addEventListener('keydown', hideHint, { once: true });
        document.addEventListener('click', hideHint, { once: true });
    }
    
    setupTouchEvents() {
        this.container.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        });
        
        this.container.addEventListener('touchend', (e) => {
            if (this.isScrolling) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const diffX = this.touchStartX - touchEndX;
            const diffY = this.touchStartY - touchEndY;
            
            // Check if it's more horizontal than vertical swipe
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    this.handleScrollDown();
                } else {
                    this.handleScrollUp();
                }
            }
        });
    }
    
    handleScrollDown() {
        if (this.currentSection >= this.images.length - 1) {
            return;
        }
        
        this.scrollCount++;
        this.updateGlobalProgress();
        
        if (this.scrollCount >= this.scrollThreshold) {
            this.moveToNextSection();
            this.scrollCount = 0;
        }
    }
    
    handleScrollUp() {
        if (this.currentSection <= 0) {
            return;
        }
        
        this.scrollCount--;
        this.updateGlobalProgress();
        
        if (this.scrollCount < 0) {
            this.moveToPreviousSection();
            this.scrollCount = this.scrollThreshold - 1;
        }
    }
    
    moveToNextSection() {
        this.currentSection++;
        this.animateTransition();
    }
    
    moveToPreviousSection() {
        this.currentSection--;
        this.animateTransition();
    }
    
    animateTransition() {
        if (this.isScrolling) return;
        
        this.isScrolling = true;
        
        // Update active section
        this.sections.forEach((section, index) => {
            section.classList.toggle('active', index === this.currentSection);
        });
        
        // Calculate and apply transform
        const translateX = -this.currentSection * 100;
        this.container.style.transform = `translateX(${translateX}vw)`;
        
        // Update UI elements
        this.updateGlobalProgress();
        this.updateSectionCounter();
        
        // Reset scrolling flag
        setTimeout(() => {
            this.isScrolling = false;
        }, this.scrollDelay);
    }
    
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 2rem;
            border-radius: 10px;
            z-index: 1000;
            text-align: center;
            max-width: 80%;
        `;
        errorDiv.innerHTML = `
            <h3>Error</h3>
            <p>${message}</p>
            <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: white; color: red; border: none; border-radius: 5px; cursor: pointer;">
                Reload Page
            </button>
        `;
        document.body.appendChild(errorDiv);
    }
}

// TouchHandler Class (optional - you can remove this if not needed)
class TouchHandler {
    constructor(scrollTelling) {
        this.scrollTelling = scrollTelling;
        this.startY = 0;
        this.isScrolling = false;
        
        this.init();
    }
    
    init() {
        document.addEventListener('touchstart', (e) => {
            this.startY = e.touches[0].clientY;
            this.isScrolling = true;
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!this.isScrolling) return;
            
            const currentY = e.touches[0].clientY;
            const diffY = this.startY - currentY;
            
            if (Math.abs(diffY) > 50) {
                if (diffY > 0) {
                    this.scrollTelling.handleScrollDown();
                } else {
                    this.scrollTelling.handleScrollUp();
                }
                this.isScrolling = false;
            }
        });
        
        document.addEventListener('touchend', () => {
            this.isScrolling = false;
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on a mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Initialize ScrollTelling
    const scrollTelling = new ScrollTelling();
    
    // Only initialize TouchHandler on mobile devices
    if (isMobile) {
        new TouchHandler(scrollTelling);
    }
    
    // Add a class to body for device detection
    if (isMobile) {
        document.body.classList.add('is-mobile');
    } else {
        document.body.classList.add('is-desktop');
    }
    
    // Add loading state
    document.body.classList.add('loaded');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // Page is visible again, recheck orientation
        const scrollTelling = window.scrollTelling;
        if (scrollTelling && scrollTelling.checkOrientation) {
            setTimeout(() => scrollTelling.checkOrientation(), 100);
        }
    }
});

// Make scrollTelling globally accessible for debugging
window.scrollTelling = null;
document.addEventListener('DOMContentLoaded', () => {
    window.scrollTelling = new ScrollTelling();
});