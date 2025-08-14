export class AnimationController {
    constructor() {
        this.observers = new Map();
        this.animatedElements = new Set();
        this.setupIntersectionObservers();
        this.setupScrollAnimations();
    }
    
    setupIntersectionObservers() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: [0, 0.25, 0.5, 0.75, 1]
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.25) {
                    this.animateElement(entry.target);
                }
            });
        }, options);
        
        document.querySelectorAll('[data-animate]').forEach(element => {
            observer.observe(element);
        });
        
        this.observers.set('main', observer);
    }
    
    setupScrollAnimations() {
        let ticking = false;
        
        const updateAnimations = () => {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            
            document.querySelectorAll('[data-parallax]').forEach(element => {
                const speed = parseFloat(element.dataset.parallax) || 0.5;
                const yPos = -(scrollY * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
            
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateAnimations);
                ticking = true;
            }
        });
    }
    
    animateElement(element) {
        if (this.animatedElements.has(element)) return;
        
        const animationType = element.dataset.animate;
        element.classList.add('animate', animationType);
        this.animatedElements.add(element);
        
        if (element.classList.contains('stagger-animation')) {
            this.animateStaggerChildren(element);
        }
    }
    
    animateStaggerChildren(parent) {
        const children = parent.children;
        Array.from(children).forEach((child, index) => {
            setTimeout(() => {
                child.classList.add('animate');
            }, index * 100);
        });
    }
    
    createFloatingParticles(container) {
        const particleCount = 20;
        const particlesContainer = container.querySelector('.entity-particles');
        
        if (!particlesContainer) return;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.setProperty('--tx', `${(Math.random() - 0.5) * 200}px`);
            particle.style.setProperty('--ty', `${(Math.random() - 0.5) * 200}px`);
            particle.style.animationDelay = `${Math.random() * 3}s`;
            particle.style.animationDuration = `${3 + Math.random() * 2}s`;
            
            particlesContainer.appendChild(particle);
            
            setTimeout(() => {
                particle.classList.add('active');
            }, 100);
        }
    }
    
    animateOnScroll(element, animation, options = {}) {
        const defaultOptions = {
            threshold: 0.5,
            rootMargin: '0px',
            once: true
        };
        
        const mergedOptions = { ...defaultOptions, ...options };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    element.style.animation = animation;
                    
                    if (mergedOptions.once) {
                        observer.unobserve(element);
                    }
                }
            });
        }, {
            threshold: mergedOptions.threshold,
            rootMargin: mergedOptions.rootMargin
        });
        
        observer.observe(element);
    }
    
    typewriterEffect(element, text, speed = 50) {
        element.textContent = '';
        let index = 0;
        
        const type = () => {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(type, speed);
            }
        };
        
        type();
    }
    
    countUp(element, start, end, duration = 2000) {
        const startTime = performance.now();
        const range = end - start;
        
        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(start + range * easeOutQuart);
            
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        
        requestAnimationFrame(update);
    }
    
    shimmer(element) {
        element.style.background = `
            linear-gradient(
                90deg,
                transparent 0%,
                rgba(255, 255, 255, 0.1) 50%,
                transparent 100%
            )
        `;
        element.style.backgroundSize = '200% 100%';
        element.style.animation = 'shimmer 2s infinite';
    }
    
    glitch(element, duration = 100) {
        const originalText = element.textContent;
        const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
        
        let iterations = 0;
        const maxIterations = 10;
        
        const glitchInterval = setInterval(() => {
            element.textContent = originalText
                .split('')
                .map((char, index) => {
                    if (Math.random() > 0.7) {
                        return glitchChars[Math.floor(Math.random() * glitchChars.length)];
                    }
                    return char;
                })
                .join('');
            
            iterations++;
            
            if (iterations >= maxIterations) {
                clearInterval(glitchInterval);
                element.textContent = originalText;
            }
        }, duration / maxIterations);
    }
    
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        this.animatedElements.clear();
    }
}