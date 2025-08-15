import * as THREE from 'https://cdn.jsdelivr.net/npm/three@latest/build/three.module.js';

export class AIEntity {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas, 
            antialias: true, 
            alpha: true 
        });
        
        // Initialize properties
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.isActive = false;
        this.time = 0;
        this.isRevealed = true;
        this.nodeVisibility = 1;
        this.onNodeClick = null;
        
        // Chameleonic properties
        this.colorState = 0;
        this.colorTransitionSpeed = 0.001;
        this.isHovered = false;
        this.hoveredNode = null;
        this.pulseIntensity = 1;
        this.morphPhase = 0;
        this.baseColors = [
            0x00ff88, // Green
            0x0099ff, // Blue
            0xff6b35, // Orange
            0xff3366, // Red
            0x9f4fff, // Purple
            0x00ffff, // Cyan
            0xffff00, // Yellow
            0xff00ff  // Magenta
        ];
        
        // Node and particle systems
        this.backgroundParticles = [];
        this.nodes = [];
        this.connections = [];
        this.nodeLabels = ['Bio', 'Project 1: [Full Agent]', 'Project 2: [TOF-Personal]', 'Project 3: [TOF-Learning]'];
        
        // Mouse interaction
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        
        console.log('Setting up AIEntity with THREE.js...');
        this.setupRenderer();
        console.log('Renderer setup complete');
        this.setupLights();
        this.createBackgroundParticles();
        console.log('Background particles created:', this.backgroundParticleSystem);
        this.initializeNodes();
        console.log('Nodes initialized:', this.nodes.length);
        this.setupPostProcessing();
        this.resize();
        console.log('Starting animation loop...');
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    }
    
    setupRenderer() {
        const rect = this.canvas.getBoundingClientRect();
        this.renderer.setSize(rect.width, rect.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.5;
        
        this.camera.aspect = rect.width / rect.height;
        this.camera.updateProjectionMatrix();
        this.camera.position.z = 5;
    }
    
    setupLights() {
        // Add ambient light for general illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Add point light for dramatic effect
        const pointLight = new THREE.PointLight(0xffffff, 1, 100);
        pointLight.position.set(0, 0, 10);
        this.scene.add(pointLight);
        
        // Add directional light for better visibility
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);
    }
    
    createBackgroundParticles() {
        // Create floating background particles that react to mouse
        const particleCount = 200;
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const originalPositions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const x = (Math.random() - 0.5) * 20;
            const y = (Math.random() - 0.5) * 20;
            const z = (Math.random() - 0.5) * 10;
            
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
            
            originalPositions[i * 3] = x;
            originalPositions[i * 3 + 1] = y;
            originalPositions[i * 3 + 2] = z;
            
            velocities[i * 3] = 0;
            velocities[i * 3 + 1] = 0;
            velocities[i * 3 + 2] = 0;
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        this.particleMaterial = new THREE.PointsMaterial({
            color: 0x00ff88,
            size: 0.05,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        this.backgroundParticleSystem = new THREE.Points(geometry, this.particleMaterial);
        this.scene.add(this.backgroundParticleSystem);
        
        // Store references for animation
        this.particlePositions = positions;
        this.particleVelocities = velocities;
        this.originalParticlePositions = originalPositions;
    }
    
    initializeNodes() {
        // Clear existing nodes
        this.nodes.forEach(node => {
            if (node.mesh) this.scene.remove(node.mesh);
            if (node.glow) this.scene.remove(node.glow);
        });
        this.nodes = [];
        this.connections = [];
        
        const nodeCount = 4;
        const radius = 2;
        
        const nodeColors = [
            0x00ff88, // Bio - Green
            0x0099ff, // Project 1 - Blue
            0xff6b35, // Project 2 - Orange
            0xff3366  // Project 3 - Red
        ];
        
        for (let i = 0; i < nodeCount; i++) {
            const angle = (i / nodeCount) * Math.PI * 2 - Math.PI / 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            // Create fragmented hexagon geometry
            const { fragmentGroup, fragments } = this.createFragmentedHexagon(0.15, nodeColors[i]);
            fragmentGroup.position.set(x, y, 0);
            
            // Create glow effect
            const glowGeometry = new THREE.SphereGeometry(0.4, 32, 32);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: nodeColors[i],
                transparent: true,
                opacity: 0.1,
                blending: THREE.AdditiveBlending
            });
            
            const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
            glowMesh.position.copy(fragmentGroup.position);
            
            // Create text label
            const textLabel = this.createTextLabel(this.nodeLabels[i], nodeColors[i]);
            textLabel.position.set(x, y - 0.5, 0);
            textLabel.visible = false; // Initially hidden
            
            this.scene.add(fragmentGroup);
            this.scene.add(glowMesh);
            this.scene.add(textLabel);
            
            this.nodes.push({
                mesh: fragmentGroup,
                fragments: fragments,
                glow: glowMesh,
                textLabel: textLabel,
                basePosition: { x, y, z: 0 },
                velocity: { x: 0, y: 0, z: 0 },
                pulsePhase: Math.random() * Math.PI * 2,
                spinSpeed: 0.001 + Math.random() * 0.002,
                color: nodeColors[i],
                baseColor: nodeColors[i],
                currentColor: nodeColors[i],
                targetColor: nodeColors[i],
                label: this.nodeLabels[i],
                index: i,
                targetScale: 1,
                currentScale: 1,
                targetGlowScale: 1,
                currentGlowScale: 1,
                morphOffset: Math.random() * Math.PI * 2,
                isCoalescing: false,
                textOpacity: 0,
                targetTextOpacity: 0
            });
        }
        
        // Create connections between nodes
        for (let i = 0; i < nodeCount; i++) {
            for (let j = i + 1; j < nodeCount; j++) {
                if (Math.random() > 0.3) {
                    this.createConnection(i, j);
                }
            }
        }
    }
    
    createConnection(fromIndex, toIndex) {
        const from = this.nodes[fromIndex];
        const to = this.nodes[toIndex];
        
        const points = [];
        points.push(new THREE.Vector3().copy(from.mesh.position));
        points.push(new THREE.Vector3().copy(to.mesh.position));
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending
        });
        
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);
        
        this.connections.push({
            line: line,
            from: fromIndex,
            to: toIndex,
            strength: Math.random() * 0.5 + 0.5,
            geometry: geometry,
            material: material
        });
    }
    
    createTextLabel(text, color) {
        // Create canvas for text rendering
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const fontSize = 32;
        
        canvas.width = 256;
        canvas.height = 64;
        
        context.fillStyle = 'rgba(0, 0, 0, 0)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.font = `${fontSize}px 'Courier New', monospace`;
        context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        
        // Create texture and material
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            side: THREE.DoubleSide
        });
        
        const geometry = new THREE.PlaneGeometry(1, 0.25);
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.userData = { canvas, context, texture, text, color };
        
        return mesh;
    }
    
    createFragmentedHexagon(size, color) {
        const fragmentGroup = new THREE.Group();
        const fragments = [];
        const fragmentCount = 12; // Number of fragments per hexagon
        
        // Create hexagon vertices
        const hexagonVertices = [];
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            hexagonVertices.push({
                x: Math.cos(angle) * size,
                y: Math.sin(angle) * size,
                z: 0
            });
        }
        
        // Create fragments around the hexagon shape
        for (let i = 0; i < fragmentCount; i++) {
            const fragmentSize = size * (0.15 + Math.random() * 0.1);
            const geometry = new THREE.BoxGeometry(fragmentSize, fragmentSize, fragmentSize * 0.5);
            
            const material = new THREE.MeshStandardMaterial({
                color: color,
                transparent: true,
                opacity: 0.8,
                emissive: color,
                emissiveIntensity: 0.2,
                metalness: 0.2,
                roughness: 0.6
            });
            
            const fragment = new THREE.Mesh(geometry, material);
            
            // Position fragments in a scattered hexagon pattern
            const baseAngle = (i / fragmentCount) * Math.PI * 2;
            const radius = size * (0.8 + Math.random() * 0.4);
            const scatter = (Math.random() - 0.5) * size * 0.3;
            
            fragment.userData = {
                basePosition: {
                    x: Math.cos(baseAngle) * radius + scatter,
                    y: Math.sin(baseAngle) * radius + scatter,
                    z: (Math.random() - 0.5) * size * 0.2
                },
                coalescedPosition: {
                    x: Math.cos(baseAngle) * size * 0.7,
                    y: Math.sin(baseAngle) * size * 0.7,
                    z: 0
                },
                isCoalesced: false,
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.02,
                    y: (Math.random() - 0.5) * 0.02,
                    z: (Math.random() - 0.5) * 0.02
                }
            };
            
            fragment.position.copy(fragment.userData.basePosition);
            fragmentGroup.add(fragment);
            fragments.push(fragment);
        }
        
        return { fragmentGroup, fragments };
    }
    
    setupPostProcessing() {
        // Basic setup for bloom effect - using simplified approach for compatibility
        this.bloomStrength = 1.5;
        this.bloomRadius = 0.4;
        this.bloomThreshold = 0.85;
    }
    
    updateMousePosition(x, y) {
        const rect = this.canvas.getBoundingClientRect();
        this.targetX = ((x - rect.left) / rect.width) * 2 - 1;
        this.targetY = -((y - rect.top) / rect.height) * 2 + 1;
    }
    
    handleMouseMove(event) {
        this.updateMousePosition(event.clientX, event.clientY);
        
        // Update mouse for raycasting
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Check for hover
        this.checkHoverInteraction();
    }
    
    checkHoverInteraction() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const nodeMeshes = this.nodes.map(node => node.mesh);
        const intersects = this.raycaster.intersectObjects(nodeMeshes);
        
        if (intersects.length > 0) {
            const hoveredMesh = intersects[0].object;
            const nodeIndex = this.nodes.findIndex(node => node.mesh === hoveredMesh);
            
            if (!this.isHovered || this.hoveredNode !== nodeIndex) {
                this.isHovered = true;
                this.hoveredNode = nodeIndex;
                this.triggerHoverEffect(nodeIndex);
            }
        } else {
            if (this.isHovered) {
                this.isHovered = false;
                this.hoveredNode = null;
                this.triggerHoverEnd();
            }
        }
    }
    
    triggerHoverEffect(nodeIndex) {
        this.pulseIntensity = 1; // Keep intensity at 1 to avoid scale effects
        this.colorTransitionSpeed = 0.005;
        
        // Fragment coalescence and text appearance only (no scaling)
        if (nodeIndex !== -1 && this.nodes[nodeIndex]) {
            const node = this.nodes[nodeIndex];
            node.isCoalescing = true;
            node.targetTextOpacity = 1; // Show text
            
            // Trigger fragment coalescence
            if (node.fragments) {
                node.fragments.forEach(fragment => {
                    fragment.userData.isCoalesced = true;
                });
            }
        }
    }
    
    triggerHoverEnd() {
        this.pulseIntensity = 1;
        this.colorTransitionSpeed = 0.001;
        
        // Return fragments and hide text (no scaling reset needed)
        this.nodes.forEach(node => {
            node.isCoalescing = false;
            node.targetTextOpacity = 0; // Hide text
            
            // Scatter fragments back
            if (node.fragments) {
                node.fragments.forEach(fragment => {
                    fragment.userData.isCoalesced = false;
                });
            }
        });
    }
    
    updateBackgroundParticles() {
        const positions = this.particlePositions;
        const velocities = this.particleVelocities;
        const originalPositions = this.originalParticlePositions;
        
        // Mouse influence on particles
        const mouseInfluence = 2;
        const influenceRadius = 3;
        
        for (let i = 0; i < positions.length / 3; i++) {
            const i3 = i * 3;
            
            // Calculate distance to mouse (in world coordinates)
            const mouseWorldX = this.targetX * 10;
            const mouseWorldY = this.targetY * 10;
            
            const dx = positions[i3] - mouseWorldX;
            const dy = positions[i3 + 1] - mouseWorldY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Push particles away from mouse
            if (distance < influenceRadius) {
                const force = (1 - distance / influenceRadius) * mouseInfluence;
                const angle = Math.atan2(dy, dx);
                velocities[i3] += Math.cos(angle) * force * 0.01;
                velocities[i3 + 1] += Math.sin(angle) * force * 0.01;
            }
            
            // Spring back to original position
            const springForce = 0.02;
            velocities[i3] += (originalPositions[i3] - positions[i3]) * springForce;
            velocities[i3 + 1] += (originalPositions[i3 + 1] - positions[i3 + 1]) * springForce;
            
            // Apply velocity and damping
            velocities[i3] *= 0.95;
            velocities[i3 + 1] *= 0.95;
            
            positions[i3] += velocities[i3];
            positions[i3 + 1] += velocities[i3 + 1];
            
            // Add gentle floating motion
            positions[i3 + 2] = originalPositions[i3 + 2] + Math.sin(this.time * 0.001 + i * 0.1) * 0.2;
        }
        
        this.backgroundParticleSystem.geometry.attributes.position.needsUpdate = true;
        
        // Update particle colors to match chameleonic theme
        if (this.particleMaterial) {
            const colorIndex = Math.floor(this.colorState) % this.baseColors.length;
            const particleColor = this.baseColors[colorIndex];
            this.particleMaterial.color.setHex(particleColor);
            this.particleMaterial.opacity = 0.4 + Math.sin(this.time * 0.001) * 0.2;
        }
    }
    
    updateNodes() {
        const easing = 0.05;
        this.mouseX += (this.targetX - this.mouseX) * easing;
        this.mouseY += (this.targetY - this.mouseY) * easing;
        
        // Update color state for chameleonic effect
        this.colorState += this.colorTransitionSpeed;
        this.morphPhase += 0.001;
        
        this.nodes.forEach((node, i) => {
            // Chameleonic color transitions
            this.updateNodeColors(node, i);
            
            // Scale animations disabled - no scaling effects
            node.currentScale = 1;
            node.currentGlowScale = 1;
            
            // Update text opacity
            node.textOpacity += (node.targetTextOpacity - node.textOpacity) * 0.1;
            if (node.textLabel && node.textLabel.material) {
                node.textLabel.material.opacity = node.textOpacity;
            }
            
            // Update fragment positions for coalescence effect
            if (node.fragments) {
                node.fragments.forEach(fragment => {
                    const targetPos = fragment.userData.isCoalesced ? 
                        fragment.userData.coalescedPosition : 
                        fragment.userData.basePosition;
                    
                    fragment.position.x += (targetPos.x - fragment.position.x) * 0.08;
                    fragment.position.y += (targetPos.y - fragment.position.y) * 0.08;
                    fragment.position.z += (targetPos.z - fragment.position.z) * 0.08;
                    
                    // Gentle rotation animation
                    fragment.rotation.x += fragment.userData.rotationSpeed.x;
                    fragment.rotation.y += fragment.userData.rotationSpeed.y;
                    fragment.rotation.z += fragment.userData.rotationSpeed.z;
                });
            }
            // Mouse influence on nodes
            const mouseWorldX = this.mouseX * 2;
            const mouseWorldY = this.mouseY * 2;
            
            const dx = mouseWorldX - node.basePosition.x;
            const dy = mouseWorldY - node.basePosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxInfluence = 0.5;
            const influenceRadius = 2;
            
            if (distance < influenceRadius) {
                const influence = (1 - distance / influenceRadius) * maxInfluence;
                const angle = Math.atan2(dy, dx);
                node.velocity.x += Math.cos(angle + Math.PI) * influence * 0.01;
                node.velocity.y += Math.sin(angle + Math.PI) * influence * 0.01;
            }
            
            // Spring back to base position
            const springForce = 0.05;
            node.velocity.x += (node.basePosition.x - node.mesh.position.x) * springForce;
            node.velocity.y += (node.basePosition.y - node.mesh.position.y) * springForce;
            
            // Apply damping
            node.velocity.x *= 0.9;
            node.velocity.y *= 0.9;
            
            // Update position
            node.mesh.position.x += node.velocity.x;
            node.mesh.position.y += node.velocity.y;
            
            // Animated effects
            const breathe = Math.sin(this.time * 0.001 + node.pulsePhase) * 0.02;
            const rotate = Math.sin(this.time * 0.0005 + node.pulsePhase * 0.7) * 0.03;
            
            node.mesh.position.x += Math.cos(i + this.time * 0.0003) * breathe;
            node.mesh.position.y += Math.sin(i + this.time * 0.0003) * breathe;
            
            // Rotation animation
            node.mesh.rotation.x += node.spinSpeed;
            node.mesh.rotation.y += node.spinSpeed * 0.7;
            
            // Scale effects removed - nodes maintain constant size
            node.mesh.scale.setScalar(this.nodeVisibility);
            node.glow.scale.setScalar(this.nodeVisibility);
            
            // Update glow position
            node.glow.position.copy(node.mesh.position);
            
            // Update text label position to follow the node
            if (node.textLabel) {
                node.textLabel.position.x = node.mesh.position.x;
                node.textLabel.position.y = node.mesh.position.y - 0.5;
                node.textLabel.position.z = node.mesh.position.z + 0.1;
                
                // Make text always face the camera
                node.textLabel.lookAt(this.camera.position);
            }
            
            // Enhanced glow opacity animation
            const glowPulse = Math.sin(this.time * 0.003 + node.pulsePhase) * 0.1 + 0.15;
            node.glow.material.opacity = glowPulse * this.nodeVisibility;
        });
        
        // Update connections
        this.connections.forEach((conn, i) => {
            const from = this.nodes[conn.from];
            const to = this.nodes[conn.to];
            
            const points = [
                new THREE.Vector3().copy(from.mesh.position),
                new THREE.Vector3().copy(to.mesh.position)
            ];
            
            conn.geometry.setFromPoints(points);
            
            // Animated connection opacity
            const pulse = Math.sin(this.time * 0.002 + i) * 0.1 + 0.2;
            conn.material.opacity = pulse * conn.strength * this.nodeVisibility;
        });
    }
    
    activate() {
        this.isActive = true;
        this.triggerPulse();
    }
    
    deactivate() {
        this.isActive = false;
    }
    
    updateNodeColors(node, index) {
        // Chameleonic color shifting based on time and interaction
        let colorIndex = Math.floor(this.colorState + index) % this.baseColors.length;
        let nextColorIndex = (colorIndex + 1) % this.baseColors.length;
        let blend = (this.colorState + index) % 1;
        
        // Enhanced blending for hover effects
        if (this.isHovered && this.hoveredNode === index) {
            // Faster color transitions when hovered
            blend = (blend + 0.5) % 1;
            // Add some sparkle colors
            if (Math.random() < 0.1) {
                colorIndex = Math.floor(Math.random() * this.baseColors.length);
            }
        }
        
        // Smooth color interpolation
        const currentHex = this.baseColors[colorIndex];
        const nextHex = this.baseColors[nextColorIndex];
        
        const r1 = (currentHex >> 16) & 255;
        const g1 = (currentHex >> 8) & 255;
        const b1 = currentHex & 255;
        
        const r2 = (nextHex >> 16) & 255;
        const g2 = (nextHex >> 8) & 255;
        const b2 = nextHex & 255;
        
        const r = Math.floor(r1 + (r2 - r1) * blend);
        const g = Math.floor(g1 + (g2 - g1) * blend);
        const b = Math.floor(b1 + (b2 - b1) * blend);
        
        const blendedColor = (r << 16) | (g << 8) | b;
        
        // Update fragment materials
        if (node.fragments) {
            node.fragments.forEach(fragment => {
                if (fragment.material) {
                    fragment.material.color.setHex(blendedColor);
                    fragment.material.emissive.setHex(blendedColor);
                }
            });
        }
        
        // Update glow
        if (node.glow && node.glow.material) {
            node.glow.material.color.setHex(blendedColor);
        }
        
        node.currentColor = blendedColor;
    }
    
    triggerPulse() {
        // Enhanced pulse effect with color burst (no scaling)
        this.pulseIntensity = 1; // Keep at 1 to avoid scale effects
        this.colorTransitionSpeed = 0.01;
        
        this.nodes.forEach(node => {
            node.velocity.x += (Math.random() - 0.5) * 0.2;
            node.velocity.y += (Math.random() - 0.5) * 0.2;
            
            // Add random color burst
            node.morphOffset = Math.random() * Math.PI * 2;
        });
        
        // Reset pulse intensity after animation
        setTimeout(() => {
            this.pulseIntensity = 1;
            this.colorTransitionSpeed = 0.001;
        }, 500);
    }
    
    reveal() {
        if (this.isRevealed) return;
        
        this.isRevealed = true;
        this.nodeVisibility = 0;
        
        const revealAnimation = () => {
            this.nodeVisibility += 0.03;
            if (this.nodeVisibility < 1) {
                requestAnimationFrame(revealAnimation);
            } else {
                this.nodeVisibility = 1;
            }
        };
        
        revealAnimation();
    }
    
    handleCanvasClick(event) {
        if (!this.isRevealed || this.nodeVisibility < 1) return;
        
        // Update raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Check for intersections with nodes
        const nodeMeshes = this.nodes.map(node => node.mesh);
        const intersects = this.raycaster.intersectObjects(nodeMeshes);
        
        if (intersects.length > 0) {
            // Find which node was clicked
            const clickedMesh = intersects[0].object;
            const nodeIndex = this.nodes.findIndex(node => node.mesh === clickedMesh);
            
            if (nodeIndex !== -1) {
                console.log(`Node ${nodeIndex} (${this.nodes[nodeIndex].label}) clicked!`);
                this.triggerClickEffect(nodeIndex);
                
                if (this.onNodeClick) {
                    this.onNodeClick(nodeIndex);
                }
            }
        } else {
            // Click on empty space - trigger global pulse
            this.triggerPulse();
        }
    }
    
    triggerClickEffect(nodeIndex) {
        // Individual node click effect with color explosion only
        this.colorTransitionSpeed = 0.02;
        this.pulseIntensity = 1; // Keep at 1 to avoid scale effects
        
        // Ripple effect to other nodes (movement only, no scaling)
        this.nodes.forEach((node, i) => {
            if (i !== nodeIndex) {
                const delay = i * 100;
                setTimeout(() => {
                    node.velocity.x += (Math.random() - 0.5) * 0.15;
                    node.velocity.y += (Math.random() - 0.5) * 0.15;
                }, delay);
            }
        });
        
        // Reset after animation
        setTimeout(() => {
            this.pulseIntensity = 1;
            this.colorTransitionSpeed = 0.001;
        }, 800);
    }
    
    resize() {
        const rect = this.canvas.getBoundingClientRect();
        
        this.camera.aspect = rect.width / rect.height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(rect.width, rect.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
    }
    
    animate() {
        this.time++;
        
        if (this.time % 60 === 0) { // Log every 60 frames (~1 second)
            console.log('Animation frame:', this.time, 'Particles:', this.backgroundParticleSystem?.geometry?.attributes?.position?.count, 'Nodes:', this.nodes.length);
        }
        
        this.updateBackgroundParticles();
        this.updateNodes();
        
        // Enhanced bloom effect through fragment materials
        this.nodes.forEach(node => {
            if (node.fragments) {
                const intensity = 0.3 + Math.sin(this.time * 0.005 + node.pulsePhase) * 0.2;
                node.fragments.forEach(fragment => {
                    if (fragment.material) {
                        fragment.material.emissive.setHex(node.currentColor);
                        if (fragment.material.emissiveIntensity !== undefined) {
                            fragment.material.emissiveIntensity = intensity;
                        }
                    }
                });
            }
        });
        
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => this.animate());
    }
    
    morph() {
        // Trigger morphing animation
        this.nodes.forEach((node, i) => {
            const angle = (i / this.nodes.length) * Math.PI * 2 + this.time * 0.001;
            const radius = 2 * (1 + Math.sin(this.time * 0.001) * 0.3);
            
            node.basePosition.x = Math.cos(angle) * radius;
            node.basePosition.y = Math.sin(angle) * radius;
        });
    }
    
    checkHover(mouseX, mouseY) {
        // Simple hover detection for Three.js version
        // This is a placeholder - we could enhance it later with raycasting
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = mouseX - rect.left;
        const canvasY = mouseY - rect.top;
        
        // For now, just update the mouse position for particle interaction
        this.updateMousePosition(mouseX, mouseY);
    }
    
    hideTooltip() {
        // Placeholder method for compatibility with InteractionManager
        // Could be enhanced later to show Three.js-based tooltips
    }
    
    createTooltip() {
        // Placeholder method for compatibility
    }
    
    showTooltip(text, x, y) {
        // Placeholder method for compatibility
    }
}