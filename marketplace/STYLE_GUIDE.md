# Kira LC - Design System & Style Guide

A comprehensive guide to the Kira LC marketplace design system, component library, and development practices.

## Color System

### Primary Palette
- **Primary Purple**: `#635bff` - Main brand color
- **Primary Light**: `#8b7fff` - Lighter variant for hover states
- **Primary Dark**: `#4a41d6` - Darker variant for active states
- **Primary Glow**: `rgba(99, 91, 255, 0.3)` - Glow effects

### Accent Colors
- **Cyan**: `#00d9ff` - Pricing and highlights
- **Magenta**: `#ff006e` - Call-to-action elements
- **Lime**: `#00ff41` - Success states and code
- **Cyan Dark**: `#00a8cc` - Hover state for cyan

### Semantic Colors
- **Success**: `#10b981` - Positive states
- **Warning**: `#f59e0b` - Alert states
- **Error**: `#ef4444` - Error states
- **Info**: `#3b82f6` - Information states

### Neutral Scale
```
Dark 900:  #0a0a0a  - Main background
Dark 800:  #1a1a1a  - Card backgrounds
Dark 700:  #2d2d2d  - Interactive elements
Dark 600:  #404040  - Borders
Dark 500:  #525252  - Disabled states
Dark 400:  #737373  - Muted text
Dark 300:  #a3a3a3  - Secondary text
Dark 200:  #d4d4d4  - Primary text
Dark 100:  #e5e5e5  - Light text
```

## Typography

### Font Stack
```css
--font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
--font-mono: 'Fira Code', 'IBM Plex Mono', monospace;
```

### Font Sizes
| Size | Value | Usage |
|------|-------|-------|
| xs | 12px | Labels, badges, captions |
| sm | 14px | Secondary text |
| base | 16px | Body text |
| lg | 18px | Subheadings |
| xl | 20px | Section titles |
| 2xl | 24px | Card titles |
| 3xl | 30px | Page sections |
| 4xl | 36px | Major headings |
| 5xl | 48px | Hero titles |

### Font Weights
- **Light**: 300 - Supporting text
- **Regular**: 400 - Body text
- **Medium**: 500 - Emphasized text
- **Semibold**: 600 - Labels and buttons
- **Bold**: 700 - Headings
- **ExtraBold**: 800 - Hero text

### Line Heights
- **Headings**: 1.2
- **Body**: 1.6
- **Compact**: 1.4

## Spacing Scale

Base unit: **8px**

| Name | Value | Usage |
|------|-------|-------|
| xs | 4px | Micro spacing |
| sm | 8px | Tight spacing |
| md | 16px | Normal spacing |
| lg | 24px | Generous spacing |
| xl | 32px | Large spacing |
| 2xl | 40px | Extra large |
| 3xl | 48px | Section spacing |
| 4xl | 64px | Major spacing |

## Border Radius

| Name | Value | Usage |
|------|-------|-------|
| sm | 6px | Small elements |
| md | 8px | Input fields |
| lg | 12px | Card corners |
| xl | 16px | Cards and modals |
| 2xl | 24px | Large components |
| full | 9999px | Pills and circles |

## Shadows

### Elevation System
```css
--shadow-sm:  0 1px 2px 0 rgba(0,0,0,0.05);
--shadow-md:  0 4px 6px -1px rgba(0,0,0,0.1);
--shadow-lg:  0 10px 15px -3px rgba(0,0,0,0.1);
--shadow-xl:  0 20px 25px -5px rgba(0,0,0,0.1);
--shadow-2xl: 0 25px 50px -12px rgba(0,0,0,0.25);
```

### Glow Effects
```css
--shadow-primary-glow:  0 0 20px var(--color-primary-glow);
--shadow-neon-cyan:     0 0 20px rgba(0, 217, 255, 0.3);
--shadow-neon-magenta:  0 0 20px rgba(255, 0, 110, 0.3);
```

## Component Library

### Buttons

#### Primary Button
```html
<button class="btn btn-primary">Click Me</button>
```
- Background: Linear gradient (purple to light purple)
- Text: White
- Hover: Elevated shadow, scale up
- Size: md (default), sm, lg

#### Secondary Button
```html
<button class="btn btn-secondary">Click Me</button>
```
- Background: Dark gray
- Border: Dark border
- Text: Light gray
- Hover: Lighten background

#### Outline Button
```html
<button class="btn btn-outline">Click Me</button>
```
- Background: Transparent
- Border: Purple
- Text: Purple
- Hover: Fill with purple

#### Ghost Button
```html
<button class="btn btn-ghost">Click Me</button>
```
- Background: Transparent
- Text: Light gray
- Hover: Dark background

### Cards

#### Basic Card
```html
<div class="card">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</div>
```
- Dark background with subtle border
- Hover: Border lightens, shadow increases
- Rounded corners (xl)

#### Product Card
```html
<div class="product-card">
  <div class="product-image-container">
    <img src="..." alt="..." class="product-image">
  </div>
  <div class="product-info">
    <!-- Content -->
  </div>
</div>
```
- Four-column grid (desktop)
- Hover: Scale up, shadow increases
- Aspect ratio: 1:1 for images

### Forms

#### Input Fields
```html
<div class="form-group">
  <label for="field">Field Label</label>
  <input type="text" id="field" placeholder="Placeholder text">
</div>
```
- Dark background
- Light text
- Purple focus state with glow
- Rounded corners (lg)

#### Select Dropdowns
```html
<select>
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```
- Styled to match input fields
- Purple focus state
- Arrow indicator

### Badges

#### Primary Badge
```html
<span class="badge badge-primary">Badge</span>
```
- Solid purple background
- White text
- Pill shape
- Uppercase text

### Modals

#### Basic Modal
```html
<div class="modal-backdrop">
  <div class="modal">
    <div class="modal-header">
      <h2>Modal Title</h2>
      <button class="modal-close">&times;</button>
    </div>
    <div class="modal-body">
      <!-- Content -->
    </div>
    <div class="modal-footer">
      <!-- Actions -->
    </div>
  </div>
</div>
```
- Centered on screen
- Semi-transparent backdrop
- Rounded corners
- Smooth entrance animation

### Toast Notifications

#### Success Toast
```html
<div class="toast success">
  <div class="toast-icon">✓</div>
  <div class="toast-message">Success message</div>
  <button class="toast-close">&times;</button>
</div>
```
- Bottom-right position
- Green left border
- Auto-dismiss after 4 seconds
- Slide-in animation

## Animations

### Timing
- **Fast**: 150ms - Subtle micro-interactions
- **Base**: 250ms - Standard animations
- **Slow**: 350ms - Attention-getting
- **Smooth**: 300ms - Special easing

### Easing Curves
- **ease-out**: `cubic-bezier(0.4, 0, 0.2, 1)` - Entrance
- **ease-in-out**: `cubic-bezier(0.4, 0, 0.2, 1)` - Standard
- **cubic**: `cubic-bezier(0.25, 0.46, 0.45, 0.94)` - Smooth

### Common Animations
- **fadeIn**: Opacity change (0 → 1)
- **slideInUp**: Slide from bottom with fade
- **slideInDown**: Slide from top with fade
- **scaleIn**: Zoom from center (0.95 → 1)
- **rotateIn**: Rotate entrance (-10° → 0°)
- **glow**: Pulsing shadow effect
- **shimmer**: Loading skeleton effect

### Animation Usage
```html
<!-- Add animation class -->
<div class="slide-in-up">Content</div>

<!-- Or use inline style with custom timing -->
<div style="animation: slideInUp 300ms ease-out;">Content</div>
```

## Responsive Design

### Breakpoints
- **Mobile**: 320px - 639px
- **Tablet**: 640px - 1023px
- **Desktop**: 1024px - 1399px
- **Wide**: 1400px+

### Grid System
- **Mobile**: 1 column
- **Tablet**: 2 columns
- **Desktop**: 3-4 columns
- **Wide**: 4-5 columns

### Media Queries
```css
/* Mobile first approach */
@media (min-width: 768px) {
  /* Tablet styles */
}

@media (min-width: 1024px) {
  /* Desktop styles */
}

@media (min-width: 1400px) {
  /* Wide styles */
}
```

## Accessibility Guidelines

### Color Contrast
- All text must meet WCAG AA standards (4.5:1 for body text)
- Test with contrast checker tools

### Focus States
- All interactive elements have visible focus indicators
- Focus outline: 2px solid with color and glow

### Semantic HTML
```html
<!-- Good -->
<button>Click me</button>
<input type="email">
<label for="email">Email</label>

<!-- Avoid -->
<div role="button">Click me</div>
<div contenteditable>Email</div>
```

### ARIA Labels
```html
<button aria-label="Close dialog">×</button>
<div aria-live="polite" aria-label="Notifications"></div>
```

### Motion
```css
/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; }
}
```

## Performance Tips

1. **CSS Optimization**
   - Use CSS Grid for layouts (not floats)
   - Minimize CSS specificity
   - Use CSS variables for theming

2. **Animation Performance**
   - Only animate `transform` and `opacity`
   - Avoid animating `left`, `top`, `width`, etc.
   - Use `will-change` sparingly

3. **JavaScript Performance**
   - Debounce scroll and resize events
   - Use event delegation
   - Minimize DOM queries

4. **Image Optimization**
   - Use WebP with fallbacks
   - Lazy load below-the-fold images
   - Optimize image sizes

## Code Examples

### Creating a New Component

```css
/* In components.css */
.my-component {
  padding: var(--spacing-lg);
  background-color: var(--color-dark-800);
  border: 1px solid var(--color-dark-700);
  border-radius: var(--radius-lg);
  transition: all var(--transition-smooth);
}

.my-component:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-lg), var(--shadow-primary-glow);
}
```

### Responsive Images
```html
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description" loading="lazy">
</picture>
```

### Form Validation
```javascript
const email = value;
const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
field.style.borderColor = isValid ? 'green' : 'red';
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS 14+, Android 11+)

## Tools & Resources

- **Color Tool**: https://color.adobe.com
- **Typography**: Google Fonts, Font Pairing
- **Animation**: https://easings.net
- **Accessibility**: WAVE, Axe DevTools
- **Performance**: Lighthouse, WebPageTest

---

*Last Updated: April 2024*
