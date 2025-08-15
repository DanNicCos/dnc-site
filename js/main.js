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
            console.log('DEBUG: Starting portfolio initialization...');
            await this.domReady();
            console.log('DEBUG: DOM ready, calling initializeComponents...');
            this.initializeComponents();
            console.log('DEBUG: Components initialized, setting up performance...');
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
        console.log('Initializing components...');
        const canvas = document.getElementById('ai-entity');
        console.log('Canvas found:', canvas);
        
        if (canvas) {
            console.log('Creating AIEntity...');
            this.entity = new AIEntity(canvas);
            console.log('Creating InteractionManager...');
            this.interactionManager = new InteractionManager(this.entity);
        }
        
        console.log('Creating DemoController...');
        try {
            this.demoController = new DemoController();
            console.log('DemoController created successfully');
            if (this.entity) {
                console.log('Setting entity on DemoController...');
                this.demoController.setEntity(this.entity);
            }
        } catch (error) {
            console.error('Error creating DemoController:', error);
        }
        
        console.log('Creating AnimationController...');
        this.animationController = new AnimationController();
        
        this.animationController.createFloatingParticles(
            document.querySelector('.entity-container')
        );
        
        console.log('DEBUG: About to call setupSmoothReveal...');
        this.setupSmoothReveal();
        console.log('DEBUG: setupSmoothReveal completed, calling setupTaglineReveal...');
        try {
            this.setupTaglineReveal();
            console.log('DEBUG: setupTaglineReveal completed successfully');
        } catch (error) {
            console.error('DEBUG: Error in setupTaglineReveal:', error);
        }
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
    
    setupTaglineReveal() {
        console.log('DEBUG: setupTaglineReveal method called');
        console.log('DEBUG: Looking for element with id interact-btn...');
        const taglineButton = document.getElementById('interact-btn');
        console.log('DEBUG: Tagline button found:', taglineButton);
        console.log('DEBUG: Button element details:', taglineButton ? taglineButton.outerHTML : 'NULL');
        
        if (taglineButton) {
            let isRevealed = false;
            
            // Enhanced navigation click handler
            taglineButton.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (!isRevealed) {
                    isRevealed = true;
                    
                    // Get the hero elements that need to be transformed
                    const heroHeaderClean = document.querySelector('.hero-header-clean');
                    const heroSection = document.querySelector('.hero');
                    const entityContainer = document.querySelector('.entity-container');
                    
                    if (heroHeaderClean && heroSection && entityContainer) {
                        // Add CSS class for styled centered state
                        heroHeaderClean.classList.add('centered-on-entity');
                        
                        // Center the entity container in the viewport
                        entityContainer.style.transition = 'all 1.2s cubic-bezier(0.23, 1, 0.32, 1)';
                        entityContainer.style.position = 'fixed';
                        entityContainer.style.top = '50%';
                        entityContainer.style.left = '50%';
                        entityContainer.style.transform = 'translate(-50%, -50%)';
                        entityContainer.style.zIndex = '25';
                        
                        // Update the hero section layout
                        heroSection.style.transition = 'all 1.2s cubic-bezier(0.23, 1, 0.32, 1)';
                        heroSection.style.position = 'relative';
                        
                        // Reveal the entity nodes
                        if (this.entity) {
                            setTimeout(() => {
                                this.entity.reveal();
                                this.setupNodeModals();
                            }, 600); // Wait for positioning animation
                        }
                    }
                }
            });
        } else {
            console.error('Tagline button not found!');
        }
    }
    
    setupNodeModals() {
        console.log('Setting up node modal system...');
        
        // Create modal HTML structure
        const modalHTML = `
            <div id="project-modal" class="modal-overlay" style="display: none;">
                <div class="modal-container">
                    <button class="modal-close" aria-label="Close modal">&times;</button>
                    <div class="modal-content">
                        <h2 class="modal-title"></h2>
                        <div class="modal-body"></div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Get modal elements
        const modal = document.getElementById('project-modal');
        const modalClose = modal.querySelector('.modal-close');
        const modalTitle = modal.querySelector('.modal-title');
        const modalBody = modal.querySelector('.modal-body');
        
        // Define project data
        const projectData = {
            0: { // Bio
                title: "About Me",
                content: `
                    <p>I'm an AI Engineer passionate about building systems that amplify human potential.</p>
                    <p>My focus is on creating transparent, explainable AI that humans can trust and collaborate with.</p>
                    <ul>
                        <li>🧠 Philosophy: AI should enhance human capabilities</li>
                        <li>🔬 Approach: Rigorous engineering with creative problem-solving</li>
                        <li>🌱 Mission: Democratize AI development through open-source tools</li>
                    </ul>
                `
            },
            1: { // Project 1: Full Agent
                title: "Project 1: Full Agent",
                content: `
                    <p>A comprehensive AI agent framework designed for complex task automation.</p>
                    <h3>Features:</h3>
                    <ul>
                        <li>Multi-modal reasoning capabilities</li>
                        <li>Dynamic tool integration</li>
                        <li>Memory persistence across sessions</li>
                        <li>Custom workflow orchestration</li>
                    </ul>
                    <p><a href="#" target="_blank">View on GitHub →</a></p>
                `
            },
            2: { // Project 2: TOF-Personal
                title: "Project 2: TOF-Personal",
                content: `
                    <p>Personal AI assistant focused on productivity and task management.</p>
                    <h3>Capabilities:</h3>
                    <ul>
                        <li>Intelligent scheduling and reminders</li>
                        <li>Document analysis and summarization</li>
                        <li>Email and communication management</li>
                        <li>Personal knowledge base integration</li>
                    </ul>
                    <p><a href="#" target="_blank">Learn More →</a></p>
                `
            },
            3: { // Project 3: TOF-Learning
                title: "Project 3: TOF-Learning",
                content: `
                    <p>Adaptive learning system that personalizes educational content.</p>
                    <h3>Key Features:</h3>
                    <ul>
                        <li>Personalized learning paths</li>
                        <li>Real-time progress tracking</li>
                        <li>Adaptive content difficulty</li>
                        <li>Multi-format content support</li>
                    </ul>
                    <p><a href="#" target="_blank">Explore Demo →</a></p>
                `
            }
        };
        
        // Close modal function
        const closeModal = () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        };
        
        // Open modal function
        const openModal = (nodeIndex) => {
            const data = projectData[nodeIndex];
            if (data) {
                modalTitle.textContent = data.title;
                modalBody.innerHTML = data.content;
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        };
        
        // Event listeners
        modalClose.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                closeModal();
            }
        });
        
        // Setup entity node click handlers
        if (this.entity) {
            this.entity.onNodeClick = (nodeIndex) => {
                console.log(`Node ${nodeIndex} clicked, opening modal...`);
                openModal(nodeIndex);
            };
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

console.log('Creating Portfolio instance...');
const portfolio = new Portfolio();
console.log('Portfolio created:', portfolio);

// Make portfolio available globally for debugging
window.portfolio = portfolio;
console.log('window.portfolio set to:', window.portfolio);

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