export class InteractionManager {
    constructor(entity) {
        this.entity = entity;
        this.canvas = entity.canvas;
        this.isInteracting = false;
        this.touchStartTime = 0;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mouseenter', (e) => this.handleMouseEnter(e));
        this.canvas.addEventListener('mouseleave', (e) => this.handleMouseLeave(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        document.addEventListener('mousemove', (e) => {
            if (!this.isInteracting) {
                this.entity.updateMousePosition(e.clientX, e.clientY);
            }
        });
    }
    
    handleMouseEnter(e) {
        this.isInteracting = true;
        this.entity.activate();
        this.canvas.classList.add('interacting');
        this.showCodeFloats();
    }
    
    handleMouseLeave(e) {
        this.isInteracting = false;
        this.entity.deactivate();
        this.entity.hideTooltip();
        this.canvas.classList.remove('interacting');
    }
    
    handleMouseMove(e) {
        if (this.isInteracting) {
            this.entity.updateMousePosition(e.clientX, e.clientY);
            this.entity.checkHover(e.clientX, e.clientY);
        }
    }
    
    handleClick(e) {
        this.entity.triggerPulse();
        this.createRipple(e.clientX, e.clientY);
        
        if (Math.random() > 0.5) {
            this.entity.morph();
        }
    }
    
    handleTouchStart(e) {
        this.touchStartTime = Date.now();
        const touch = e.touches[0];
        this.entity.updateMousePosition(touch.clientX, touch.clientY);
        this.entity.activate();
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.entity.updateMousePosition(touch.clientX, touch.clientY);
    }
    
    handleTouchEnd(e) {
        const touchDuration = Date.now() - this.touchStartTime;
        if (touchDuration < 200) {
            this.entity.triggerPulse();
        }
        this.entity.deactivate();
    }
    
    showCodeFloats() {
        const codeFloats = document.querySelectorAll('.code-float');
        codeFloats.forEach((float, index) => {
            const delay = parseInt(float.dataset.delay) || index * 100;
            setTimeout(() => {
                float.classList.add('visible');
            }, delay);
        });
    }
    
    hideCodeFloats() {
        const codeFloats = document.querySelectorAll('.code-float');
        codeFloats.forEach(float => {
            float.classList.remove('visible');
        });
    }
    
    createRipple(x, y) {
        const container = document.querySelector('.entity-container');
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        
        const rect = container.getBoundingClientRect();
        ripple.style.left = `${x - rect.left - 150}px`;
        ripple.style.top = `${y - rect.top - 150}px`;
        
        container.appendChild(ripple);
        ripple.classList.add('active');
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
}

export class DemoController {
    constructor() {
        console.log('DemoController constructor called');
        this.terminal = document.getElementById('terminal-output');
        this.capabilities = document.querySelectorAll('.capability');
        this.showcaseSection = document.getElementById('showcase');
        this.interactBtn = document.getElementById('interact-btn');
        this.isTyping = false;
        this.isRevealed = false;
        this.entity = null; // Will be set from main.js
        
        console.log('Elements found:', {
            terminal: this.terminal,
            showcaseSection: this.showcaseSection,
            interactBtn: this.interactBtn,
            capabilities: this.capabilities.length
        });
        
        this.setupEventListeners();
        this.hideCodeFloatsInitially();
    }
    
    setEntity(entity) {
        this.entity = entity;
    }
    
    hideCodeFloatsInitially() {
        const codeFloats = document.querySelectorAll('.code-float');
        codeFloats.forEach(float => {
            float.style.opacity = '0';
            float.style.transform = 'translateY(20px)';
            float.style.transition = 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
        });
    }
    
    setupEventListeners() {
        console.log('Setting up event listeners, interact button:', this.interactBtn);
        
        if (this.interactBtn) {
            this.interactBtn.addEventListener('click', (e) => {
                console.log('Tagline clicked!');
                e.preventDefault();
                this.handleTaglineClick();
            });
        } else {
            console.error('Interact button not found!');
        }
        
        this.capabilities.forEach(cap => {
            cap.addEventListener('click', (e) => {
                const capability = e.currentTarget.dataset.capability;
                this.demonstrateCapability(capability);
            });
        });
    }
    
    handleTaglineClick() {
        console.log('handleTaglineClick called, isRevealed:', this.isRevealed);
        if (!this.isRevealed) {
            console.log('Triggering reveal...');
            this.triggerReveal();
        } else {
            console.log('Starting demo...');
            this.startDemo();
        }
    }
    
    triggerReveal() {
        console.log('=== TRIGGER REVEAL CALLED ===');
        this.isRevealed = true;
        
        // Shrink the name/role text
        const nameRole = document.querySelector('.hero-name-role');
        console.log('Found nameRole element:', nameRole);
        if (nameRole) {
            console.log('Adding compact class to nameRole');
            nameRole.classList.add('compact');
            console.log('nameRole classes after adding compact:', nameRole.className);
            // Force style change for debugging
            nameRole.style.fontSize = '1rem';
            nameRole.style.transition = 'all 0.8s ease';
        } else {
            console.error('NAME ROLE ELEMENT NOT FOUND!');
        }
        
        // Transform the button to text-only "Explore →" state
        const taglineButton = this.interactBtn;
        const taglineText = taglineButton.querySelector('.tagline-text');
        
        console.log('Found taglineButton:', taglineButton);
        console.log('Found taglineText:', taglineText);
        
        // Change text content
        if (taglineText) {
            console.log('Changing button text to Explore →');
            taglineText.innerHTML = '<span class="discover-cta">Explore →</span>';
            console.log('New button innerHTML:', taglineText.innerHTML);
        } else {
            console.error('TAGLINE TEXT ELEMENT NOT FOUND!');
        }
        
        // Apply text-only styling
        if (taglineButton) {
            console.log('Adding text-only class to button');
            taglineButton.classList.add('text-only');
            taglineButton.style.transition = 'all 0.8s ease';
            // Force inline styles to override everything
            taglineButton.style.background = 'transparent';
            taglineButton.style.border = 'none';
            taglineButton.style.padding = '0';
            taglineButton.style.boxShadow = 'none';
            taglineButton.style.color = 'var(--color-accent)';
            taglineButton.style.fontWeight = '500';
            console.log('Button classes after adding text-only:', taglineButton.className);
        }
        
        // Trigger entity reveal animation
        if (this.entity) {
            console.log('Entity found, triggering reveal after 400ms');
            setTimeout(() => {
                this.entity.reveal();
            }, 400); // Start entity reveal after tagline starts transforming
        } else {
            console.error('No entity found!');
        }
        
        // Reveal the code floats as navigation
        setTimeout(() => {
            console.log('Revealing code floats');
            this.revealCodeFloats();
        }, 800);
        
        console.log('=== TRIGGER REVEAL COMPLETE ===');
    }
    
    revealCodeFloats() {
        const codeFloats = document.querySelectorAll('.code-float');
        codeFloats.forEach((float, index) => {
            setTimeout(() => {
                float.style.opacity = '1';
                float.style.transform = 'translateY(0)';
                float.style.cursor = 'pointer';
                
                // Add click handler for navigation
                float.addEventListener('click', () => this.handleNodeClick(index));
            }, index * 200);
        });
    }
    
    handleNodeClick(nodeIndex) {
        const nodeNames = ['Bio', 'Project 1: [Full Agent]', 'Project 2: [TOF-Personal]', 'Project 3: [TOF-Learning]'];
        console.log(`Clicked on: ${nodeNames[nodeIndex]}`);
        
        // Trigger pulse effect on entity
        if (this.entity) {
            this.entity.triggerPulse();
        }
        
        // Here you can add navigation logic for each node
        switch(nodeIndex) {
            case 0: // Bio
                this.navigateToBio();
                break;
            case 1: // Project 1: [Full Agent]
                this.navigateToProject1();
                break;
            case 2: // Project 2: [TOF-Personal]
                this.navigateToProject2();
                break;
            case 3: // Project 3: [TOF-Learning]
                this.navigateToProject3();
                break;
        }
    }
    
    navigateToBio() {
        // For now, scroll to about section
        const aboutSection = document.getElementById('about');
        if (aboutSection) {
            aboutSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    navigateToProject1() {
        // Navigate to Full Agent project
        this.startDemo(); // For now, show the demo
    }
    
    navigateToProject2() {
        // Navigate to TOF-Personal project
        console.log('Navigate to TOF-Personal');
    }
    
    navigateToProject3() {
        // Navigate to TOF-Learning project  
        console.log('Navigate to TOF-Learning');
    }
    
    startDemo() {
        this.showcaseSection.classList.add('active');
        this.showcaseSection.setAttribute('aria-hidden', 'false');
        
        setTimeout(() => {
            this.typeTerminalMessage('Initializing AI Agent Blueprint...\n');
            setTimeout(() => {
                this.demonstrateCapability('rag');
            }, 2000);
        }, 500);
    }
    
    demonstrateCapability(type) {
        const demos = {
            rag: [
                '> agent.rag.initialize()',
                'Loading vector database...',
                'Indexing documents: 1,247 files',
                'Embeddings generated: 15,832 chunks',
                'RAG pipeline ready.',
                '',
                '> agent.rag.query("How to implement custom tools?")',
                'Searching knowledge base...',
                'Found 12 relevant documents',
                'Generating response with context...',
                'Response: Custom tools can be implemented by extending the BaseTool class...'
            ],
            memory: [
                '> agent.memory.initialize()',
                'Setting up memory systems...',
                'Short-term memory: Active',
                'Long-term memory: Connected to PostgreSQL',
                'Episodic buffer: Ready',
                '',
                '> agent.memory.store({context: "user_preference", data: {...}})',
                'Storing in short-term memory...',
                'Creating embeddings...',
                'Persisting to long-term storage...',
                'Memory stored with ID: mem_7f3a9c2d'
            ],
            tools: [
                '> agent.tools.list()',
                'Available tools:',
                '  - WebSearch: Search the internet',
                '  - CodeExecutor: Run Python code',
                '  - DatabaseQuery: Query SQL databases',
                '  - FileSystem: Read/write files',
                '  - APIClient: Make HTTP requests',
                '',
                '> agent.tools.execute("WebSearch", {query: "latest AI papers"})',
                'Executing WebSearch...',
                'Found 47 results',
                'Filtering by relevance...'
            ],
            deploy: [
                '> npm run deploy',
                'Building production bundle...',
                'Optimizing assets...',
                'Creating Docker container...',
                '',
                '> docker push ai-agent:latest',
                'Pushing to registry...',
                'Layer 1/5: ████████████ 100%',
                'Layer 2/5: ████████████ 100%',
                'Layer 3/5: ████████████ 100%',
                'Layer 4/5: ████████████ 100%',
                'Layer 5/5: ████████████ 100%',
                '',
                'Deployment successful! 🚀',
                'Agent available at: https://api.your-agent.ai/v1'
            ]
        };
        
        const messages = demos[type] || demos.rag;
        this.clearTerminal();
        this.typeMultipleMessages(messages);
    }
    
    typeTerminalMessage(message, callback) {
        if (this.isTyping) return;
        
        this.isTyping = true;
        let index = 0;
        
        const typeChar = () => {
            if (index < message.length) {
                this.terminal.textContent += message[index];
                index++;
                setTimeout(typeChar, 30 + Math.random() * 20);
            } else {
                this.isTyping = false;
                if (callback) callback();
            }
        };
        
        typeChar();
    }
    
    typeMultipleMessages(messages) {
        let messageIndex = 0;
        
        const typeNext = () => {
            if (messageIndex < messages.length) {
                const message = messages[messageIndex] + '\n';
                this.typeTerminalMessage(message, () => {
                    messageIndex++;
                    setTimeout(typeNext, 200);
                });
            }
        };
        
        typeNext();
    }
    
    clearTerminal() {
        this.terminal.textContent = '';
    }
}