export class AIEntity {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.nodes = [];
        this.connections = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.isActive = false;
        this.morphProgress = 0;
        this.time = 0;
        this.tooltip = null;
        this.hoveredElement = null;
        this.isRevealed = false;
        this.nodeVisibility = 0; // 0 = hidden, 1 = fully visible
        this.onNodeClick = null; // Callback for node clicks
        this.nodeLabels = ['Bio', 'Project 1: [Full Agent]', 'Project 2: [TOF-Personal]', 'Project 3: [TOF-Learning]'];
        
        this.resize();
        this.initializeNodes();
        this.createTooltip();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
        
        // Add click event listener to canvas
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
    }
    
    resize() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.centerX = rect.width / 2;
        this.centerY = rect.height / 2;
        this.initializeNodes(); // Reinitialize nodes after resize
    }
    
    initializeNodes() {
        // Clear existing nodes and connections
        this.nodes = [];
        this.connections = [];
        
        const nodeCount = 4;
        const radius = Math.min(this.centerX, this.centerY) * 0.6;
        
        // Define colors for each node
        const nodeColors = [
            '#00ff88', // Bio - Green
            '#0099ff', // Project 1: [Full Agent] - Blue
            '#ff6b35', // Project 2: [TOF-Personal] - Orange
            '#ff3366'  // Project 3: [TOF-Learning] - Red
        ];
        
        for (let i = 0; i < nodeCount; i++) {
            const angle = (i / nodeCount) * Math.PI * 2;
            this.nodes.push({
                x: this.centerX + Math.cos(angle) * radius,
                y: this.centerY + Math.sin(angle) * radius,
                baseX: this.centerX + Math.cos(angle) * radius,
                baseY: this.centerY + Math.sin(angle) * radius,
                vx: 0,
                vy: 0,
                radius: 4,
                pulsePhase: Math.random() * Math.PI * 2,
                color: nodeColors[i],
                label: this.nodeLabels[i],
                index: i
            });
        }
        
        for (let i = 0; i < nodeCount; i++) {
            for (let j = i + 1; j < nodeCount; j++) {
                if (Math.random() > 0.3) {
                    this.connections.push({
                        from: i,
                        to: j,
                        strength: Math.random() * 0.5 + 0.5
                    });
                }
            }
        }
    }
    
    updateMousePosition(x, y) {
        const rect = this.canvas.getBoundingClientRect();
        this.targetX = x - rect.left;
        this.targetY = y - rect.top;
    }
    
    activate() {
        this.isActive = true;
        this.generateParticles();
    }
    
    deactivate() {
        this.isActive = false;
    }
    
    generateParticles() {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: this.centerX,
                y: this.centerY,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 1,
                maxLife: 1,
                size: Math.random() * 3 + 1
            });
        }
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.01;
            particle.vx *= 0.99;
            particle.vy *= 0.99;
            return particle.life > 0;
        });
    }
    
    updateNodes() {
        const easing = 0.05;
        this.mouseX += (this.targetX - this.mouseX) * easing;
        this.mouseY += (this.targetY - this.mouseY) * easing;
        
        const maxInfluence = 50;
        const influenceRadius = 150;
        
        this.nodes.forEach((node, i) => {
            const dx = this.mouseX - node.baseX;
            const dy = this.mouseY - node.baseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < influenceRadius) {
                const influence = (1 - distance / influenceRadius) * maxInfluence;
                const angle = Math.atan2(dy, dx);
                node.vx += Math.cos(angle + Math.PI) * influence * 0.01;
                node.vy += Math.sin(angle + Math.PI) * influence * 0.01;
            }
            
            const springX = (node.baseX - node.x) * 0.05;
            const springY = (node.baseY - node.y) * 0.05;
            node.vx += springX;
            node.vy += springY;
            
            node.vx *= 0.9;
            node.vy *= 0.9;
            
            node.x += node.vx;
            node.y += node.vy;
            
            const breathe = Math.sin(this.time * 0.001 + node.pulsePhase) * 5;
            node.x += Math.cos(i) * breathe * 0.1;
            node.y += Math.sin(i) * breathe * 0.1;
        });
    }
    
    drawConnections() {
        this.ctx.strokeStyle = 'rgba(0, 255, 136, 0.2)';
        this.ctx.lineWidth = 1;
        
        this.connections.forEach(conn => {
            const from = this.nodes[conn.from];
            const to = this.nodes[conn.to];
            
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 200;
            
            if (distance < maxDistance) {
                const opacity = (1 - distance / maxDistance) * conn.strength;
                this.ctx.strokeStyle = `rgba(0, 255, 136, ${opacity * 0.3})`;
                
                this.ctx.beginPath();
                this.ctx.moveTo(from.x, from.y);
                
                const pulse = Math.sin(this.time * 0.002 + conn.from) * 0.1;
                const midX = (from.x + to.x) / 2 + Math.sin(this.time * 0.001) * 10 * pulse;
                const midY = (from.y + to.y) / 2 + Math.cos(this.time * 0.001) * 10 * pulse;
                
                this.ctx.quadraticCurveTo(midX, midY, to.x, to.y);
                this.ctx.stroke();
            }
        });
    }
    
    drawNodes() {
        if (!this.isRevealed && this.nodeVisibility === 0) return;
        
        this.nodes.forEach((node, i) => {
            const pulse = Math.sin(this.time * 0.002 + node.pulsePhase);
            const baseRadius = node.radius + pulse * 2;
            
            // Scale up animation during reveal
            const scaleProgress = this.nodeVisibility;
            const radius = baseRadius * (0.3 + scaleProgress * 0.7); // Start at 30% scale
            
            // Convert hex color to RGB for gradient
            const hexToRgb = (hex) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : null;
            };
            
            const rgb = hexToRgb(node.color);
            const alpha = this.nodeVisibility;
            
            const gradient = this.ctx.createRadialGradient(
                node.x, node.y, 0,
                node.x, node.y, radius * 3
            );
            gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`);
            gradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha * 0.5})`);
            gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, radius * 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw node labels when revealed - they follow the nodes dynamically
            if (this.nodeVisibility > 0.5) {
                this.ctx.save();
                
                // Style the label text
                this.ctx.font = '12px "JetBrains Mono", monospace';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                
                // Position label offset from node - follows node movement
                const labelOffset = 40;
                const labelX = node.x;
                const labelY = node.y - labelOffset;
                
                // Add background with border like in the image
                const metrics = this.ctx.measureText(node.label);
                const padding = 6;
                const bgWidth = metrics.width + padding * 2;
                const bgHeight = 18;
                
                // Background with border
                this.ctx.fillStyle = `rgba(26, 26, 26, ${(this.nodeVisibility - 0.5) * 1.8})`;
                this.ctx.fillRect(
                    labelX - bgWidth/2, 
                    labelY - bgHeight/2, 
                    bgWidth, 
                    bgHeight
                );
                
                // Border
                this.ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(this.nodeVisibility - 0.5) * 1.5})`;
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(
                    labelX - bgWidth/2, 
                    labelY - bgHeight/2, 
                    bgWidth, 
                    bgHeight
                );
                
                // Label text with node's color
                this.ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(this.nodeVisibility - 0.5) * 2})`;
                this.ctx.fillText(node.label, labelX, labelY);
                this.ctx.restore();
            }
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            const opacity = particle.life / particle.maxLife;
            this.ctx.fillStyle = `rgba(0, 255, 136, ${opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    drawCore() {
        const coreRadius = 40 + Math.sin(this.time * 0.001) * 5;
        
        const gradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, coreRadius * 2
        );
        gradient.addColorStop(0, 'rgba(0, 255, 136, 0.8)');
        gradient.addColorStop(0.5, 'rgba(0, 204, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 255, 136, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, coreRadius * 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        if (this.isActive) {
            this.ctx.strokeStyle = 'rgba(0, 255, 136, 0.6)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(this.centerX, this.centerY, coreRadius + 10, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }
    
    animate() {
        this.time++;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.updateNodes();
        this.updateParticles();
        
        this.drawConnections();
        this.drawCore();
        this.drawNodes();
        this.drawParticles();
        
        requestAnimationFrame(() => this.animate());
    }
    
    triggerPulse() {
        this.generateParticles();
        this.nodes.forEach(node => {
            node.vx += (Math.random() - 0.5) * 10;
            node.vy += (Math.random() - 0.5) * 10;
        });
    }
    
    morph() {
        this.morphProgress = 0;
        const morphAnimation = () => {
            this.morphProgress += 0.02;
            if (this.morphProgress < 1) {
                this.nodes.forEach((node, i) => {
                    const angle = (i / this.nodes.length) * Math.PI * 2 + this.morphProgress * Math.PI;
                    const radius = Math.min(this.centerX, this.centerY) * 0.6 * (1 + Math.sin(this.morphProgress * Math.PI) * 0.3);
                    node.baseX = this.centerX + Math.cos(angle) * radius;
                    node.baseY = this.centerY + Math.sin(angle) * radius;
                });
                requestAnimationFrame(morphAnimation);
            }
        };
        morphAnimation();
    }
    
    reveal() {
        if (this.isRevealed) return;
        
        this.isRevealed = true;
        this.nodeVisibility = 0;
        
        const revealAnimation = () => {
            this.nodeVisibility += 0.03; // Smooth fade in
            if (this.nodeVisibility < 1) {
                requestAnimationFrame(revealAnimation);
            } else {
                this.nodeVisibility = 1;
            }
        };
        
        revealAnimation();
    }
    
    handleCanvasClick(e) {
        if (!this.isRevealed || this.nodeVisibility < 1) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        // Check if click is on any node
        this.nodes.forEach((node, index) => {
            const distance = Math.sqrt(
                Math.pow(clickX - node.x, 2) + Math.pow(clickY - node.y, 2)
            );
            
            // Include label area in click detection
            const clickRadius = 30; // Larger click area including labels
            
            if (distance <= clickRadius) {
                console.log(`Node ${index} (${node.label}) clicked!`);
                
                // Trigger visual feedback
                this.triggerPulse();
                
                // Call the callback if set
                if (this.onNodeClick) {
                    this.onNodeClick(index);
                }
            }
        });
    }
    
    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'tooltip';
        this.tooltip.style.position = 'absolute';
        this.tooltip.style.pointerEvents = 'none';
        this.tooltip.style.zIndex = '1000';
        document.body.appendChild(this.tooltip);
    }
    
    showTooltip(text, x, y) {
        if (!this.tooltip) return;
        
        this.tooltip.textContent = text;
        this.tooltip.style.left = `${x + 10}px`;
        this.tooltip.style.top = `${y - 10}px`;
        this.tooltip.classList.add('visible');
    }
    
    hideTooltip() {
        if (!this.tooltip) return;
        this.tooltip.classList.remove('visible');
    }
    
    checkHover(mouseX, mouseY) {
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = mouseX - rect.left;
        const canvasY = mouseY - rect.top;
        
        // Check core hover
        const coreDx = canvasX - this.centerX;
        const coreDy = canvasY - this.centerY;
        const coreDistance = Math.sqrt(coreDx * coreDx + coreDy * coreDy);
        const coreRadius = 40 + Math.sin(this.time * 0.001) * 5;
        
        if (coreDistance < coreRadius * 2) {
            if (this.hoveredElement !== 'core') {
                this.hoveredElement = 'core';
                this.showTooltip('Neural Core: Central processing unit managing all AI operations', mouseX, mouseY);
            }
            return;
        }
        
        // Check node hover
        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i];
            const dx = canvasX - node.x;
            const dy = canvasY - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const pulse = Math.sin(this.time * 0.002 + node.pulsePhase);
            const radius = (node.radius + pulse * 2) * 3;
            
            if (distance < radius) {
                const tooltipText = this.getNodeTooltipText(i);
                if (this.hoveredElement !== `node-${i}`) {
                    this.hoveredElement = `node-${i}`;
                    this.showTooltip(tooltipText, mouseX, mouseY);
                }
                return;
            }
        }
        
        // Check connection hover
        for (let i = 0; i < this.connections.length; i++) {
            const conn = this.connections[i];
            const from = this.nodes[conn.from];
            const to = this.nodes[conn.to];
            
            if (this.isPointNearLine(canvasX, canvasY, from.x, from.y, to.x, to.y, 15)) {
                if (this.hoveredElement !== `connection-${i}`) {
                    this.hoveredElement = `connection-${i}`;
                    this.showTooltip(`Neural pathway: ${conn.strength.toFixed(2)} strength connection`, mouseX, mouseY);
                }
                return;
            }
        }
        
        // No hover
        if (this.hoveredElement) {
            this.hoveredElement = null;
            this.hideTooltip();
        }
    }
    
    getNodeTooltipText(nodeIndex) {
        const tooltips = [
            'Bio',
            'Project 1: [Full Agent]',
            'Project 2: [TOF-Personal]',
            'Project 3: [TOF-Learning]'
        ];
        return tooltips[nodeIndex] || `Node ${nodeIndex + 1}`;
    }
    
    isPointNearLine(px, py, x1, y1, x2, y2, threshold) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length === 0) return false;
        
        const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (length * length)));
        const projection = {
            x: x1 + t * dx,
            y: y1 + t * dy
        };
        
        const distance = Math.sqrt(
            (px - projection.x) * (px - projection.x) + 
            (py - projection.y) * (py - projection.y)
        );
        
        return distance < threshold;
    }
}