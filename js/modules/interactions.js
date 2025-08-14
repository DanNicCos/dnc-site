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
        this.terminal = document.getElementById('terminal-output');
        this.capabilities = document.querySelectorAll('.capability');
        this.showcaseSection = document.getElementById('showcase');
        this.interactBtn = document.getElementById('interact-btn');
        this.isTyping = false;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.interactBtn.addEventListener('click', () => this.startDemo());
        
        this.capabilities.forEach(cap => {
            cap.addEventListener('click', (e) => {
                const capability = e.currentTarget.dataset.capability;
                this.demonstrateCapability(capability);
            });
        });
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