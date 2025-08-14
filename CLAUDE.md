# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI Engineer portfolio website designed for GitHub Pages hosting. It features an interactive animated AI entity visualization built with vanilla JavaScript and CSS only - no build tools or frameworks required.

## Development Commands

Since this is a static site with no build process:
- **Run locally**: Use any static server (e.g., `python3 -m http.server 8000` or VS Code Live Server extension)
- **Deploy**: Push to GitHub and enable GitHub Pages in repository settings
- **No build/lint/test commands** - vanilla JS/CSS only

## Architecture

### Core Interactive System
The site centers around an animated AI entity that responds to user interaction:

1. **Entity Visualization** (`js/modules/entity.js`):
   - Canvas-based neural network visualization with nodes, connections, and particles
   - Mouse/touch tracking with physics-based node movement
   - Morphing animations and pulse effects
   - Core rendering loop using requestAnimationFrame

2. **Interaction Layer** (`js/modules/interactions.js`):
   - `InteractionManager`: Handles mouse/touch events for the entity
   - `DemoController`: Manages terminal demonstrations and capability showcases
   - Triggers visual feedback (ripples, code floats, glow effects)

3. **Animation Controller** (`js/modules/animations.js`):
   - Intersection Observer for scroll-triggered animations
   - Parallax effects and staggered animations
   - Performance-optimized with throttling

### Module Structure
- **ES6 Modules**: All JS uses native ES6 imports (no bundler)
- **Entry Point**: `js/main.js` initializes all components
- **Utilities**: `js/utils/helpers.js` provides common functions (debounce, throttle, easing)

### Styling Architecture
- **CSS Custom Properties**: All theme values in `:root` (colors, spacing, transitions)
- **Separated Concerns**:
  - `main.css`: Base styles and layout
  - `components.css`: Entity and UI component styles
  - `animations.css`: Keyframes and animation classes
  - `responsive.css`: Media queries and mobile optimizations

### Key Design Patterns
- **Mobile-first responsive design** with progressive enhancement
- **Performance optimizations**: Throttled handlers, lazy loading, requestIdleCallback
- **Accessibility**: ARIA labels, semantic HTML, keyboard navigation support
- **No external dependencies**: Pure vanilla implementation for GitHub Pages

## Important Customization Points

1. **Contact Links**: Update GitHub/LinkedIn URLs in `index.html` (search for "yourusername")
2. **Color Scheme**: Modify CSS custom properties in `main.css` `:root` section
3. **Entity Behavior**: Adjust physics parameters in `entity.js` constructor
4. **Demo Content**: Update terminal demonstrations in `interactions.js` `demonstrateCapability()`

## Performance Considerations

- Entity canvas renders at 60fps - avoid adding heavy computations to the animation loop
- All animations use CSS transforms/opacity for GPU acceleration
- Mobile devices get reduced particle counts and simplified effects automatically