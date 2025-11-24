/**
 * POA CAPS - LANDING PAGE JAVASCRIPT
 * Bonés Personalizados - Funcionalidades e Interatividade
 */

// ========================================
// 1. NAVIGATION
// ========================================

class Navigation {
    constructor() {
        this.header = document.getElementById('header');
        this.navToggle = document.getElementById('navToggle');
        this.navMenu = document.getElementById('navMenu');
        this.navLinks = document.querySelectorAll('.nav__link');

        this.init();
    }

    init() {
        this.handleScroll();
        this.setupMobileMenu();
        this.setupSmoothScroll();

        window.addEventListener('scroll', () => this.handleScroll());
    }

    handleScroll() {
        if (window.scrollY > 50) {
            this.header.classList.add('scrolled');
        } else {
            this.header.classList.remove('scrolled');
        }
    }

    setupMobileMenu() {
        if (this.navToggle) {
            this.navToggle.addEventListener('click', () => {
                this.navMenu.classList.toggle('active');
                this.navToggle.classList.toggle('active');
            });

            // Close menu when clicking on a link
            this.navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    this.navMenu.classList.remove('active');
                    this.navToggle.classList.remove('active');
                });
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.nav') && this.navMenu.classList.contains('active')) {
                    this.navMenu.classList.remove('active');
                    this.navToggle.classList.remove('active');
                }
            });
        }
    }

    setupSmoothScroll() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        const headerHeight = this.header.offsetHeight;
                        const targetPosition = target.offsetTop - headerHeight;
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }
}

// ========================================
// 2. PRICE CALCULATOR
// ========================================

class PriceCalculator {
    constructor() {
        this.modeloSelect = document.getElementById('calcModelo');
        this.quantidadeInput = document.getElementById('calcQuantidade');
        this.modalidadeSelect = document.getElementById('calcModalidade');
        this.btnCalcular = document.getElementById('btnCalcular');
        this.resultDiv = document.getElementById('calculatorResult');

        // Pricing data based on POA Caps real prices
        this.prices = {
            trucker: { base: 44.90, premium30: 34.90, premium50: 29.90, premium100: 26.90 },
            americano: { base: 59.90, premium30: 39.90, premium50: 34.90, premium100: 31.90 },
            camurca: { base: 80.00, premium30: 50.00, premium50: 45.00, premium100: 40.00 }
        };

        this.init();
    }

    init() {
        if (this.btnCalcular) {
            this.btnCalcular.addEventListener('click', () => this.calculate());

            // Also calculate on input change
            this.quantidadeInput.addEventListener('input', () => this.updateModalidadeHint());
            this.modalidadeSelect.addEventListener('change', () => this.updateModalidadeHint());
        }
    }

    updateModalidadeHint() {
        const quantidade = parseInt(this.quantidadeInput.value) || 1;
        const modalidade = this.modalidadeSelect.value;

        if (modalidade === 'premium' && quantidade < 30) {
            this.showNotification('Modalidade Premium requer mínimo de 30 unidades', 'warning');
        }
    }

    calculate() {
        const modelo = this.modeloSelect.value;
        const quantidade = parseInt(this.quantidadeInput.value) || 1;
        const modalidade = this.modalidadeSelect.value;

        // Validation
        if (quantidade < 1) {
            this.showNotification('Quantidade deve ser maior que zero', 'error');
            return;
        }

        if (modalidade === 'premium' && quantidade < 30) {
            this.showNotification('Modalidade Premium requer mínimo de 30 unidades', 'error');
            return;
        }

        // Calculate price
        let pricePerUnit;
        const modelPrices = this.prices[modelo];

        if (modalidade === 'express') {
            pricePerUnit = modelPrices.base;
        } else {
            // Premium pricing
            if (quantidade >= 100) {
                pricePerUnit = modelPrices.premium100;
            } else if (quantidade >= 50) {
                pricePerUnit = modelPrices.premium50;
            } else {
                pricePerUnit = modelPrices.premium30;
            }
        }

        const totalPrice = pricePerUnit * quantidade;

        // Display results
        this.displayResults(totalPrice, pricePerUnit, modelo, quantidade, modalidade);
    }

    displayResults(total, perUnit, modelo, quantidade, modalidade) {
        const resultTotal = document.getElementById('resultTotal');
        const resultUnit = document.getElementById('resultUnit');
        const detailModelo = document.getElementById('detailModelo');
        const detailQuantidade = document.getElementById('detailQuantidade');
        const detailModalidade = document.getElementById('detailModalidade');
        const btnWhatsAppOrcamento = document.getElementById('btnWhatsAppOrcamento');

        // Format prices
        resultTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        resultUnit.textContent = `R$ ${perUnit.toFixed(2).replace('.', ',')} / unidade`;

        // Model name
        const modeloNames = {
            'trucker': 'Trucker',
            'americano': 'Americano',
            'camurca': 'Camurça'
        };
        detailModelo.textContent = modeloNames[modelo];

        // Quantity
        detailQuantidade.textContent = `${quantidade} ${quantidade === 1 ? 'unidade' : 'unidades'}`;

        // Modalidade
        const modalidadeNames = {
            'express': 'Express',
            'premium': 'Premium'
        };
        detailModalidade.textContent = modalidadeNames[modalidade];

        // Update WhatsApp link
        const message = `Olá! Gostaria de um orçamento para:\n\n` +
                       `Modelo: ${modeloNames[modelo]}\n` +
                       `Quantidade: ${quantidade} unidades\n` +
                       `Modalidade: ${modalidadeNames[modalidade]}\n` +
                       `Valor estimado: R$ ${total.toFixed(2)}`;

        btnWhatsAppOrcamento.href = `https://wa.me/5551992940182?text=${encodeURIComponent(message)}`;

        // Show result div with animation
        this.resultDiv.style.opacity = '0';
        this.resultDiv.style.display = 'flex';
        setTimeout(() => {
            this.resultDiv.style.opacity = '1';
        }, 10);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <div class="notification__content">
                <span class="notification__message">${message}</span>
                <button class="notification__close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Add styles if not exist
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    max-width: 400px;
                    padding: 1rem 1.5rem;
                    background: white;
                    border-left: 4px solid #00D98E;
                    border-radius: 8px;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
                    z-index: 10000;
                    animation: slideIn 0.3s ease-out;
                }
                .notification--error {
                    border-left-color: #FF4757;
                }
                .notification--warning {
                    border-left-color: #FFA502;
                }
                .notification__content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                    color: #2C3E50;
                }
                .notification__close {
                    background: none;
                    border: none;
                    color: #7F8C8D;
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0;
                    line-height: 1;
                }
                .notification__close:hover {
                    color: #2C3E50;
                }
                @keyframes slideIn {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @media (max-width: 768px) {
                    .notification {
                        right: 10px;
                        left: 10px;
                        max-width: none;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// ========================================
// 3. CONTACT FORM
// ========================================

class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));

            // Phone mask
            const phoneInput = document.getElementById('telefone');
            if (phoneInput) {
                phoneInput.addEventListener('input', (e) => this.phoneMask(e));
            }
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);

        // Build WhatsApp message
        const message = `*Nova solicitação de contato*\n\n` +
                       `*Nome:* ${data.nome}\n` +
                       `*Email:* ${data.email}\n` +
                       `*Telefone:* ${data.telefone}\n` +
                       `*Tipo:* ${this.getAssuntoText(data.assunto)}\n` +
                       `*Mensagem:* ${data.mensagem}`;

        const whatsappUrl = `https://wa.me/5551992940182?text=${encodeURIComponent(message)}`;

        // Open WhatsApp
        window.open(whatsappUrl, '_blank');

        // Show success message
        this.showNotification('Abrindo WhatsApp para enviar sua mensagem!', 'success');

        // Reset form
        this.form.reset();
    }

    getAssuntoText(value) {
        const assuntos = {
            'express': 'Modalidade Express',
            'premium': 'Modalidade Premium (30+ un)',
            'duvida': 'Dúvida sobre personalização',
            'orcamento': 'Solicitar orçamento',
            'outro': 'Outro assunto'
        };
        return assuntos[value] || value;
    }

    phoneMask(e) {
        let value = e.target.value.replace(/\D/g, '');

        if (value.length <= 11) {
            value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
            value = value.replace(/(\d)(\d{4})$/, '$1-$2');
        }

        e.target.value = value;
    }

    showNotification(message, type = 'info') {
        const calculator = new PriceCalculator();
        calculator.showNotification(message, type);
    }
}

// ========================================
// 4. SCROLL ANIMATIONS
// ========================================

class ScrollAnimations {
    constructor() {
        this.animatedElements = document.querySelectorAll('[data-aos]');
        this.init();
    }

    init() {
        this.observeElements();
    }

    observeElements() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.aosDelay || 0;
                    setTimeout(() => {
                        entry.target.classList.add('aos-animate');
                    }, delay);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        this.animatedElements.forEach(element => {
            observer.observe(element);
        });
    }
}

// ========================================
// 5. ANALYTICS & TRACKING
// ========================================

class Analytics {
    constructor() {
        this.init();
    }

    init() {
        this.trackPageView();
        this.trackClicks();
        this.trackScrollDepth();
    }

    trackPageView() {
        console.log('📊 Page view tracked');

        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href
            });
        }

        // Meta Pixel
        if (typeof fbq !== 'undefined') {
            fbq('track', 'PageView');
        }
    }

    trackClicks() {
        // Track CTA buttons
        document.querySelectorAll('.btn--primary').forEach(button => {
            button.addEventListener('click', () => {
                const buttonText = button.textContent.trim();
                this.sendEvent('cta_click', { button_text: buttonText });
            });
        });

        // Track WhatsApp clicks
        document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
            link.addEventListener('click', () => {
                this.sendEvent('whatsapp_click', { source: link.className });
            });
        });

        // Track calculator usage
        const btnCalcular = document.getElementById('btnCalcular');
        if (btnCalcular) {
            btnCalcular.addEventListener('click', () => {
                this.sendEvent('calculator_used');
            });
        }

        // Track contact form submission
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', () => {
                this.sendEvent('contact_form_submit');
            });
        }
    }

    trackScrollDepth() {
        const depths = [25, 50, 75, 100];
        const tracked = new Set();

        window.addEventListener('scroll', () => {
            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

            depths.forEach(depth => {
                if (scrollPercent >= depth && !tracked.has(depth)) {
                    tracked.add(depth);
                    this.sendEvent('scroll_depth', { depth: `${depth}%` });
                }
            });
        }, { passive: true });
    }

    sendEvent(eventName, params = {}) {
        console.log(`📊 Event: ${eventName}`, params);

        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, params);
        }

        // Meta Pixel
        if (typeof fbq !== 'undefined') {
            fbq('trackCustom', eventName, params);
        }
    }
}

// ========================================
// 6. PERFORMANCE OPTIMIZATION
// ========================================

class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.lazyLoadImages();
    }

    lazyLoadImages() {
        // Native lazy loading is already in HTML, but add observer for older browsers
        if ('loading' in HTMLImageElement.prototype) {
            return; // Browser supports native lazy loading
        }

        const images = document.querySelectorAll('img[loading="lazy"]');

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                    }
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
}

// ========================================
// 7. UTILITY FUNCTIONS
// ========================================

const Utils = {
    formatPrice(value) {
        return `R$ ${value.toFixed(2).replace('.', ',')}`;
    },

    formatPhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11) {
            return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
        }
        return phone;
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// ========================================
// 8. MODALS
// ========================================

class Modals {
    constructor() {
        this.init();
    }

    init() {
        // Close modal when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Close modal on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.active').forEach(modal => {
                    this.closeModal(modal.id);
                });
            }
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
}

// Global functions for onclick handlers
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function closeExitIntent() {
    const modal = document.getElementById('exitIntentModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        sessionStorage.setItem('exitIntentShown', 'true');
    }
}

// ========================================
// 7.5 LOGO PREVIEW TOOL
// ========================================

class LogoPreview {
    constructor() {
        this.uploadInput = document.getElementById('logoUpload');
        this.logoPreview = document.getElementById('logoPreview');
        this.logoOverlay = document.getElementById('logoOverlay');
        this.sizeSlider = document.getElementById('logoSize');
        this.xSlider = document.getElementById('logoX');
        this.ySlider = document.getElementById('logoY');
        this.sizeValue = document.getElementById('sizeValue');
        this.resetBtn = document.getElementById('resetPreview');
        this.uploadArea = document.getElementById('uploadArea');

        if (!this.uploadInput) return;

        this.init();
    }

    init() {
        // File upload
        this.uploadInput.addEventListener('change', (e) => this.handleUpload(e));

        // Drag and drop
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.style.borderColor = 'var(--color-primary)';
        });

        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.style.borderColor = 'var(--color-border)';
        });

        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.style.borderColor = 'var(--color-border)';
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.processImage(file);
            }
        });

        // Sliders
        this.sizeSlider?.addEventListener('input', (e) => {
            this.sizeValue.textContent = `${e.target.value}%`;
            this.updatePreview();
        });

        this.xSlider?.addEventListener('input', () => this.updatePreview());
        this.ySlider?.addEventListener('input', () => this.updatePreview());

        // Reset
        this.resetBtn?.addEventListener('click', () => this.reset());
    }

    handleUpload(e) {
        const file = e.target.files[0];
        if (file) {
            this.processImage(file);
        }
    }

    processImage(file) {
        // Check file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            alert('Arquivo muito grande! Máximo 5MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.logoPreview.src = e.target.result;
            this.logoPreview.style.display = 'block';
            this.updatePreview();
        };
        reader.readAsDataURL(file);
    }

    updatePreview() {
        const size = this.sizeSlider.value;
        const x = this.xSlider.value;
        const y = this.ySlider.value;

        this.logoPreview.style.transform = `scale(${size / 100})`;
        this.logoOverlay.style.alignItems = y < 33 ? 'flex-start' : y > 66 ? 'flex-end' : 'center';
        this.logoOverlay.style.justifyContent = x < 33 ? 'flex-start' : x > 66 ? 'flex-end' : 'center';
    }

    reset() {
        this.logoPreview.style.display = 'none';
        this.logoPreview.src = '';
        this.uploadInput.value = '';
        this.sizeSlider.value = 100;
        this.xSlider.value = 50;
        this.ySlider.value = 40;
        this.sizeValue.textContent = '100%';
    }
}

// ========================================
// 8.1 URGENCY TIMER
// ========================================

class UrgencyTimer {
    constructor() {
        this.timerElement = document.getElementById('urgencyTimer');
        if (!this.timerElement) return;

        this.init();
    }

    init() {
        // Set timer to end of day (midnight)
        this.updateTimer();
        setInterval(() => this.updateTimer(), 1000);
    }

    updateTimer() {
        const now = new Date();
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0);

        const diff = midnight - now;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        this.timerElement.textContent =
            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
}

// ========================================
// 8.2 SCROLL PROGRESS INDICATOR
// ========================================

class ScrollProgress {
    constructor() {
        this.progressBar = document.querySelector('.scroll-progress-bar');
        if (!this.progressBar) return;

        this.init();
    }

    init() {
        window.addEventListener('scroll', () => this.updateProgress());
        this.updateProgress(); // Initial call
    }

    updateProgress() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY;

        const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;
        this.progressBar.style.width = `${Math.min(scrollPercentage, 100)}%`;
    }
}

// ========================================
// 8.3 TESTIMONIALS CAROUSEL
// ========================================

class TestimonialsCarousel {
    constructor() {
        this.track = document.querySelector('.testimonials-track');
        this.prevBtn = document.querySelector('.testimonial-prev');
        this.nextBtn = document.querySelector('.testimonial-next');
        this.dotsContainer = document.querySelector('.testimonials-dots');

        if (!this.track) return;

        this.cards = Array.from(document.querySelectorAll('.testimonial-card'));
        this.currentIndex = 0;
        this.autoplayInterval = null;

        this.init();
    }

    init() {
        // Create dots
        this.createDots();

        // Add event listeners
        this.prevBtn?.addEventListener('click', () => this.prev());
        this.nextBtn?.addEventListener('click', () => this.next());

        // Auto-play
        this.startAutoplay();

        // Pause on hover
        this.track.addEventListener('mouseenter', () => this.stopAutoplay());
        this.track.addEventListener('mouseleave', () => this.startAutoplay());
    }

    createDots() {
        this.cards.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('testimonial-dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.goTo(index));
            this.dotsContainer.appendChild(dot);
        });
        this.dots = Array.from(this.dotsContainer.querySelectorAll('.testimonial-dot'));
    }

    goTo(index) {
        this.currentIndex = index;
        this.track.style.transform = `translateX(-${index * 100}%)`;

        // Update dots
        this.dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });

        // Update buttons
        this.updateButtons();
    }

    next() {
        if (this.currentIndex < this.cards.length - 1) {
            this.goTo(this.currentIndex + 1);
        } else {
            this.goTo(0); // Loop back to start
        }
    }

    prev() {
        if (this.currentIndex > 0) {
            this.goTo(this.currentIndex - 1);
        } else {
            this.goTo(this.cards.length - 1); // Loop to end
        }
    }

    updateButtons() {
        // Always enable for infinite loop
        this.prevBtn.disabled = false;
        this.nextBtn.disabled = false;
    }

    startAutoplay() {
        this.stopAutoplay();
        this.autoplayInterval = setInterval(() => this.next(), 5000);
    }

    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }
}

// ========================================
// 8.5 EXIT INTENT DETECTION
// ========================================

class ExitIntent {
    constructor() {
        this.hasShown = sessionStorage.getItem('exitIntentShown') === 'true';
        this.delay = 3000; // Wait 3 seconds before activating
        this.isActive = false;

        if (!this.hasShown) {
            setTimeout(() => {
                this.isActive = true;
                this.init();
            }, this.delay);
        }
    }

    init() {
        document.addEventListener('mouseleave', (e) => {
            // Detect mouse leaving from top of page (attempting to close tab/navigate away)
            if (e.clientY <= 0 && this.isActive && !this.hasShown) {
                this.showExitIntent();
            }
        });

        // Also trigger on mobile when user tries to go back
        window.addEventListener('popstate', () => {
            if (this.isActive && !this.hasShown) {
                this.showExitIntent();
                // Push state back so user doesn't navigate away
                history.pushState(null, null, window.location.href);
            }
        });
    }

    showExitIntent() {
        const modal = document.getElementById('exitIntentModal');
        if (modal && !this.hasShown) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            this.hasShown = true;

            // Track event
            if (typeof gtag !== 'undefined') {
                gtag('event', 'exit_intent_shown', {
                    event_category: 'engagement',
                    event_label: 'Exit Intent Modal'
                });
            }
        }
    }
}

// ========================================
// 9. INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('%c🎯 POA Caps - Landing Page Loaded!', 'color: #00D98E; font-size: 16px; font-weight: bold;');

    // Initialize all modules
    new Navigation();
    new PriceCalculator();
    new ContactForm();
    new ScrollAnimations();
    new Analytics();
    new PerformanceOptimizer();
    new Modals();
    new LogoPreview();
    new UrgencyTimer();
    new ScrollProgress();
    new TestimonialsCarousel();
    new ExitIntent();

    console.log('%c✅ All systems operational', 'color: #00D98E; font-size: 12px;');
});

// ========================================
// 9. ERROR HANDLING
// ========================================

window.addEventListener('error', (e) => {
    console.error('Error occurred:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

// ========================================
// 10. EXPORTS (if needed)
// ========================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Navigation,
        PriceCalculator,
        ContactForm,
        ScrollAnimations,
        Analytics,
        Utils
    };
}