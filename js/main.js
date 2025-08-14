import { AIEntity } from './modules/entity.js';
import { InteractionManager, DemoController } from './modules/interactions.js';
import { AnimationController } from './modules/animations.js';
import { throttle, isMobile, requestIdleCallback } from './utils/helpers.js';

class Portfolio {
    constructor() {
        this.entity = null;
        this.interactionManager = null;
        this.demoController = null;
        this.animationController = null;
        this.initialized = false;
        
        this.init();
    }
    
    async init() {
        try {
            await this.domReady();
            this.initializeComponents();
            this.setupPerformanceOptimizations();
            this.initialized = true;
            
            console.log('Portfolio initialized successfully');
        } catch (error) {
            console.error('Failed to initialize portfolio:', error);
        }
    }
    
    domReady() {
        return new Promise(resolve => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }
    
    initializeComponents() {
        const canvas = document.getElementById('ai-entity');
        
        if (canvas) {
            this.entity = new AIEntity(canvas);
            this.interactionManager = new InteractionManager(this.entity);
        }
        
        this.demoController = new DemoController();
        this.animationController = new AnimationController();
        
        this.animationController.createFloatingParticles(
            document.querySelector('.entity-container')
        );
        
        this.setupSmoothReveal();
    }
    
    setupSmoothReveal() {
        // Setup powering on effect for hero header
        const heroHeader = document.querySelector('.hero-header-clean');
        if (heroHeader) {
            // Add event listeners for mouse enter
            document.addEventListener('mousemove', this.triggerPowerOn.bind(this), { once: true });
            
            // Also trigger after 1 second delay
            setTimeout(() => {
                this.triggerPowerOn();
            }, 1000);
        }
        
        const elements = [
            '.hero-name',
            '.hero-title',
            '.hero-tagline',
            '.interaction-prompt'
        ];
        
        elements.forEach((selector, index) => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.opacity = '0';
                element.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    element.style.transition = 'all 0.8s ease';
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, 300 + index * 150);
            }
        });
        
        if (this.entity) {
            setTimeout(() => {
                const container = document.querySelector('.entity-container');
                container.classList.add('active');
            }, 1000);
        }
    }
    
    triggerPowerOn() {
        const heroHeader = document.querySelector('.hero-header-clean');
        if (heroHeader && !heroHeader.classList.contains('powered-on')) {
            heroHeader.classList.add('powered-on');
        }
    }
    
    setupPerformanceOptimizations() {
        const handleResize = throttle(() => {
            if (this.entity) {
                this.entity.resize();
            }
        }, 250);
        
        window.addEventListener('resize', handleResize);
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
        
        requestIdleCallback(() => {
            this.prefetchResources();
        });
        
        if (isMobile()) {
            this.optimizeForMobile();
        }
    }
    
    prefetchResources() {
        const links = [
            'https://github.com/yourusername',
            'https://linkedin.com/in/yourusername'
        ];
        
        links.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = href;
            document.head.appendChild(link);
        });
    }
    
    optimizeForMobile() {
        document.body.classList.add('mobile');
        
        const canvas = document.getElementById('ai-entity');
        if (canvas && this.entity) {
            canvas.style.cursor = 'default';
        }
        
        const showcaseSection = document.getElementById('showcase');
        if (showcaseSection) {
            showcaseSection.style.minHeight = 'auto';
        }
    }
    
    handleVisibilityChange() {
        if (document.hidden) {
            if (this.entity) {
                this.entity.isActive = false;
            }
        } else {
            if (this.entity && this.interactionManager.isInteracting) {
                this.entity.isActive = true;
            }
        }
    }
}

const portfolio = new Portfolio();

document.addEventListener('visibilitychange', () => {
    portfolio.handleVisibilityChange();
});

if ('serviceWorker' in navigator && location.hostname !== 'localhost') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
}

window.addEventListener('beforeunload', () => {
    if (portfolio.animationController) {
        portfolio.animationController.destroy();
    }
});

export default portfolio;