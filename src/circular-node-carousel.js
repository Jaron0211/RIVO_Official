/**
 * Circular Node Carousel
 * A 1/3 circular carousel component for displaying RIVO node connection examples
 */

class CircularNodeCarousel {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentSection = 0; // Current active section (0, 1, or 2)
    this.nodeCount = 3; // Number of sections
    this.rotationStep = 120; // degrees to rotate per section
    this.isAnimating = false;
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.carouselCircle = null;

    this.init();
  }

  init() {
    this.setupDOM();
    this.attachEventListeners();
  }

  setupDOM() {
    // Create carousel structure
    const carouselHTML = `
      <div class="carousel-wrapper">
        <!-- Navigation buttons -->
        <button class="carousel-btn carousel-btn-prev" aria-label="Previous">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <!-- Main carousel circle -->
        <div class="carousel-viewport">
          <div class="carousel-circle" id="carouselCircle" data-section="0">
            <!-- Rivo Center (always in middle) -->
            <div class="carousel-center">
              <div class="center-content">
                <svg class="center-icon" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="6" fill="white"/>
                  <circle cx="12" cy="12" r="2" fill="currentColor"/>
                </svg>
                <p class="center-label">Rivo Center</p>
              </div>
            </div>

            <!-- Node sections (3 sections for 1/3 circle display) -->
            <div class="carousel-section carousel-section-1 active" data-section="0">
              <div class="section-node">
                <div class="node-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="1"/>
                    <circle cx="12" cy="12" r="5"/>
                    <circle cx="12" cy="12" r="9"/>
                  </svg>
                </div>
                <h4 class="node-title">Sensor Input</h4>
                <p class="node-desc">Temperature, Humidity, Pressure sensors via I²C/SPI</p>
              </div>
            </div>

            <div class="carousel-section carousel-section-2" data-section="1">
              <div class="section-node">
                <div class="node-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <line x1="12" y1="7" x2="12" y2="17"/>
                    <line x1="7" y1="12" x2="17" y2="12"/>
                  </svg>
                </div>
                <h4 class="node-title">Data Processing</h4>
                <p class="node-desc">Local edge computing and AI inference</p>
              </div>
            </div>

            <div class="carousel-section carousel-section-3" data-section="2">
              <div class="section-node">
                <div class="node-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2v20M2 12h20"/>
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                </div>
                <h4 class="node-title">Cloud Integration</h4>
                <p class="node-desc">Real-time data sync with RIVO server</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation button -->
        <button class="carousel-btn carousel-btn-next" aria-label="Next">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      <!-- Dot indicators -->
      <div class="carousel-indicators">
        <button class="indicator active" data-index="0"></button>
        <button class="indicator" data-index="1"></button>
        <button class="indicator" data-index="2"></button>
      </div>
    `;

    this.container.innerHTML = carouselHTML;
    this.carouselCircle = document.getElementById('carouselCircle');
  }

  attachEventListeners() {
    // Previous and Next buttons
    const prevBtn = this.container.querySelector('.carousel-btn-prev');
    const nextBtn = this.container.querySelector('.carousel-btn-next');

    prevBtn.addEventListener('click', () => this.rotate(-1));
    nextBtn.addEventListener('click', () => this.rotate(1));

    // Indicators
    const indicators = this.container.querySelectorAll('.indicator');
    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => this.goToSection(index));
    });

    // Touch events for swiping
    const viewport = this.container.querySelector('.carousel-viewport');
    viewport.addEventListener('touchstart', (e) => this.handleTouchStart(e), false);
    viewport.addEventListener('touchend', (e) => this.handleTouchEnd(e), false);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (this.container.querySelector(':focus') !== null) {
        if (e.key === 'ArrowLeft') this.rotate(-1);
        if (e.key === 'ArrowRight') this.rotate(1);
      }
    });
  }

  handleTouchStart(e) {
    this.touchStartX = e.changedTouches[0].screenX;
  }

  handleTouchEnd(e) {
    this.touchEndX = e.changedTouches[0].screenX;
    this.handleSwipe();
  }

  handleSwipe() {
    const swipeThreshold = 50;
    const diff = this.touchStartX - this.touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swiped left, show next
        this.rotate(1);
      } else {
        // Swiped right, show previous
        this.rotate(-1);
      }
    }
  }

  rotate(direction) {
    if (this.isAnimating) return;

    this.isAnimating = true;
    const nextSection = (this.currentSection + direction + this.nodeCount) % this.nodeCount;

    // Update the data-section attribute
    this.carouselCircle.setAttribute('data-section', nextSection);

    // Calculate rotation
    const rotation = nextSection * this.rotationStep;
    this.carouselCircle.style.transform = `rotate(${-rotation}deg)`;

    // Update active section
    this.currentSection = nextSection;

    // Update indicators
    this.updateIndicators(nextSection);

    // Update section visibility
    this.updateSectionVisibility(nextSection);

    // Add animation delay
    setTimeout(() => {
      this.isAnimating = false;
    }, 600);
  }

  goToSection(index) {
    if (index >= 0 && index < this.nodeCount && !this.isAnimating) {
      const direction = index > this.currentSection ? 1 : -1;
      const steps = Math.abs(index - this.currentSection);

      for (let i = 0; i < steps; i++) {
        setTimeout(() => this.rotate(direction), i * 250);
      }
    }
  }

  updateIndicators(activeIndex) {
    const indicators = this.container.querySelectorAll('.indicator');
    indicators.forEach((indicator, index) => {
      if (index === activeIndex) {
        indicator.classList.add('active');
      } else {
        indicator.classList.remove('active');
      }
    });
  }

  updateSectionVisibility(activeIndex) {
    const sections = this.container.querySelectorAll('.carousel-section');
    sections.forEach((section, index) => {
      if (index === activeIndex) {
        section.classList.add('active');
      } else {
        section.classList.remove('active');
      }
    });
  }
}

// Initialize carousel when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const carousel = new CircularNodeCarousel('circular-carousel-container');
});
