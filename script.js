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
        
        this.init();
    }
    
    init() {
        try {
            this.createSections();
            this.createGlobalProgressBar();
            this.createScrollHint();
            this.setupScrollHandler();
            this.createSectionCounter();
            
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
       // counter.textContent = `1 / ${this.images.length}`;
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
        
        // Update UI elements - THIS IS WHERE COUNTER GETS UPDATED
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

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize ScrollTelling
    const scrollTelling = new ScrollTelling();
    
    // Add loading state
    document.body.classList.add('loaded');
});

// Make scrollTelling globally accessible for debugging
window.scrollTelling = null;
document.addEventListener('DOMContentLoaded', () => {
    window.scrollTelling = new ScrollTelling();
});