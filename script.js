// Main ScrollTelling Class
class ScrollTelling {
    constructor() {
        this.container = document.getElementById('main-container');
        this.images = [];
        this.sections = [];
        
        this.currentSection = 0;
        this.scrollCount = 0;
        this.scrollThreshold = 2;
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
            
            // Preload images on mobile
            if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                setTimeout(() => this.preloadImages(), 1000);
            }
            
            // Add event listeners for orientation and resize
            window.addEventListener('orientationchange', () => {
                setTimeout(() => this.checkOrientation(), 100);
            });
            
            window.addEventListener('resize', () => {
                this.checkOrientation();
            });
            
            // Setup touch events
            this.setupTouchEvents();
            
            // Debug: Test image loading after a delay
            setTimeout(() => {
                console.log('Testing all image sources:');
                document.querySelectorAll('.section-image').forEach((img, index) => {
                    console.log(`Image ${index + 1}:`, img.src, 'loaded:', img.complete);
                });
            }, 2000);
            
            console.log('ScrollTelling initialized successfully');
        } catch (error) {
            console.error('Failed to initialize ScrollTelling:', error);
            this.showError('Failed to load the application.');
        }
    }
    
    createSections() {
        // Create 25 sections
        const totalImages = 25;
        this.container.style.width = `${totalImages * 100}vw`;
        
        for (let i = 0; i < totalImages; i++) {
            const imageNumber = i + 1;
            // Try different path formats - adjust based on your directory structure
            const imagePath = `images/image${imageNumber}.png`; // Changed from ./images/
            
            console.log(`Loading image from: ${imagePath}`); // Debug log
            
            const section = document.createElement('section');
            section.className = `section ${i === 0 ? 'active' : ''}`;
            section.id = `section-${imageNumber}`;
            
            section.innerHTML = `
                <div class="image-container">
                    <div class="image-loading" id="loading-${imageNumber}">
                        Loading Image ${imageNumber}...
                    </div>
                    <img src="${imagePath}" 
                         alt="Image ${imageNumber}" 
                         class="section-image"
                         loading="lazy"
                         data-src="${imagePath}"
                         onload="this.previousElementSibling.style.display='none'; console.log('Image ${imageNumber} loaded')"
                         onerror="handleImageError(this, ${imageNumber})">
                </div>
            `;
            
            this.container.appendChild(section);
            this.images.push({ 
                src: imagePath, 
                alt: `Image ${imageNumber}`,
                element: null
            });
        }
        
        this.sections = document.querySelectorAll('.section');
        
        // Add global error handler
        window.handleImageError = function(img, number) {
            console.error(`Failed to load image ${number} from: ${img.src}`);
            img.style.display = 'none';
            const loadingEl = document.getElementById(`loading-${number}`);
            if (loadingEl) {
                loadingEl.textContent = `Image ${number} failed to load`;
                loadingEl.style.color = '#ff4444';
            }
        };
    }
    
    preloadImages() {
        console.log('Preloading images for mobile...');
        
        for (let i = 0; i < this.images.length; i++) {
            const img = new Image();
            const imageNumber = i + 1;
            const imagePath = `images/image${imageNumber}.png`;
            
            img.onload = () => {
                console.log(`Preloaded image ${imageNumber}`);
                // Update the actual image element if it exists
                const imgElement = document.querySelector(`#section-${imageNumber} .section-image`);
                if (imgElement && imgElement.getAttribute('src') !== imagePath) {
                    imgElement.src = imagePath;
                }
            };
            
            img.onerror = () => {
                console.error(`Failed to preload image ${imageNumber}`);
                // Try alternative paths
                const alternativePaths = [
                    `./images/image${imageNumber}.png`,
                    `/images/image${imageNumber}.png`,
                    `./image${imageNumber}.png`,
                    `image${imageNumber}.png`
                ];
                
                // Try each alternative path
                for (let altPath of alternativePaths) {
                    console.log(`Trying alternative: ${altPath}`);
                    const testImg = new Image();
                    testImg.onload = () => {
                        console.log(`Found image at: ${altPath}`);
                        const imgElement = document.querySelector(`#section-${imageNumber} .section-image`);
                        if (imgElement) {
                            imgElement.src = altPath;
                        }
                    };
                    testImg.src = altPath;
                }
            };
            
            img.src = imagePath;
        }
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
            
            // Reload images on orientation change for mobile
            if (isMobile) {
                this.reloadImagesForOrientation();
            }
        }
    }
    
    reloadImagesForOrientation() {
        // Force image reload for current section
        const currentImage = document.querySelector(`#section-${this.currentSection + 1} .section-image`);
        if (currentImage) {
            const src = currentImage.src;
            currentImage.src = '';
            setTimeout(() => {
                currentImage.src = src;
                console.log(`Reloaded image for orientation change: ${src}`);
            }, 100);
        }
    }
    
    updateImageDisplayForLandscape() {
        if (window.innerWidth <= 768 && window.innerWidth > window.innerHeight) {
            // Mobile landscape mode
            document.querySelectorAll('.section-image').forEach(img => {
                img.style.objectFit = 'contain';
            });
        } else {
            // Desktop or portrait mode
            document.querySelectorAll('.section-image').forEach(img => {
                img.style.objectFit = 'cover';
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
                
                // Force reload images when continuing in portrait
                this.reloadAllImages();
            });
        }
    }
    
    reloadAllImages() {
        document.querySelectorAll('.section-image').forEach(img => {
            const src = img.src;
            img.src = '';
            setTimeout(() => {
                img.src = src;
            }, 50);
        });
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
    
    // Test image accessibility
    testImageAccessibility() {
        console.log('Testing image accessibility...');
        fetch('images/image1.png')
            .then(response => {
                console.log('Image 1 status:', response.status);
                return response.blob();
            })
            .then(blob => {
                console.log('Image 1 size:', blob.size, 'bytes');
            })
            .catch(error => {
                console.error('Image 1 fetch error:', error);
                console.log('Trying alternative paths...');
                // Test alternative paths
                this.testAlternativePaths();
            });
    }
    
    testAlternativePaths() {
        const paths = [
            './images/image1.png',
            '/images/image1.png',
            './image1.png',
            'image1.png'
        ];
        
        paths.forEach(path => {
            fetch(path)
                .then(response => {
                    console.log(`${path} status:`, response.status);
                })
                .catch(error => {
                    console.log(`${path} failed:`, error.message);
                });
        });
    }
}

// TouchHandler Class (optional)
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
    
    // Test image accessibility after initialization
    setTimeout(() => {
        scrollTelling.testImageAccessibility();
    }, 1000);
    
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