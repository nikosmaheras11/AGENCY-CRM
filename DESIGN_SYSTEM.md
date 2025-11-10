# Design System - Agency Dashboard OS

This design system defines the elevated, modern styling for the Agency Dashboard OS platform, based on the Vision UI design language from Figma.

## Color Palette

### Primary Colors
```css
--primary-purple-blue-500: #4318FF    /* Primary brand color */
--primary-purple-blue-400: #7551FF    /* Lighter variant */
--primary-white: #FFFFFF              /* Secondary color */
```

### Status Colors
```css
--success-green: #01B574              /* Success states */
--error-red: #E31A1A                  /* Error states */
```

### Accent Colors
```css
--teal-300: #4FD1C5                   /* Teal accent for graphs/highlights */
--blue-400: #4299E1                   /* Blue accent */
--orange-300: #F6AD55                 /* Orange accent for warnings/highlights */
```

### Grayscale
```css
--gray-300: #CBD5E0                   /* Light gray borders/text */
--gray-400: #A0AEC0                   /* Medium gray text */
--gray-500: #718096                   /* Dark gray text */
--gray-700: #2D3748                   /* Very dark gray backgrounds */
--white: #FFFFFF                      /* Pure white */
```

### Gradients & Backgrounds
```css
/* Dark gradient background for main dashboard */
background: linear-gradient(to bottom, #0F1535, #1A1F37);

/* Glass-morphism card backgrounds */
background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.1);

/* Elevated card shadow */
box-shadow: 0 20px 27px rgba(0, 0, 0, 0.05);
```

## Typography

### Font Family
Primary: `Helvetica Neue`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `Arial`, sans-serif

### Font Sizes & Weights
```css
/* Headings */
--text-5xl: 48px;      /* Hero headings */
--text-4xl: 36px;      /* Page titles */
--text-3xl: 28px;      /* Section headers */
--text-2xl: 24px;      /* Card titles */
--text-xl: 20px;       /* Subheadings */
--text-lg: 18px;       /* Large body text */

/* Body */
--text-base: 16px;     /* Regular body */
--text-sm: 14px;       /* Small text */
--text-xs: 12px;       /* Captions */

/* Font Weights */
--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--line-height-tight: 1.2;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
```

## Spacing System

Follow an 8px base grid system:
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
```

## Border Radius

```css
--radius-sm: 8px;      /* Small elements (badges, tags) */
--radius-md: 12px;     /* Buttons, inputs */
--radius-lg: 16px;     /* Cards */
--radius-xl: 20px;     /* Large cards, modals */
--radius-2xl: 24px;    /* Hero sections */
--radius-full: 9999px; /* Circular elements */
```

## Component Styles

### Cards

#### Elevated Glass Card (Primary)
```css
.card-elevated {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(40px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 20px 27px rgba(0, 0, 0, 0.05);
  padding: 24px;
}
```

#### Stats Card
```css
.stats-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

#### Hero Card (With Background Image)
```css
.hero-card {
  background: linear-gradient(to right, rgba(15, 21, 53, 0.95), transparent),
              url('background-image.jpg');
  background-size: cover;
  border-radius: 20px;
  padding: 32px;
  min-height: 344px;
}
```

### Buttons

#### Primary Button
```css
.btn-primary {
  background: linear-gradient(135deg, #4318FF, #7551FF);
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(67, 24, 255, 0.3);
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(67, 24, 255, 0.4);
}
```

#### Secondary Button
```css
.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #FFFFFF;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 500;
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}
```

### Icons

#### Icon Container (Small)
```css
.icon-container-sm {
  width: 35px;
  height: 35px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(67, 24, 255, 0.15), rgba(117, 81, 255, 0.15));
}
```

#### Icon Container (Large)
```css
.icon-container-lg {
  width: 45px;
  height: 45px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4318FF, #7551FF);
  box-shadow: 0 4px 12px rgba(67, 24, 255, 0.25);
}
```

### Progress Bars

```css
.progress-bar {
  width: 100%;
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #4318FF, #4FD1C5);
  border-radius: 9999px;
  transition: width 0.3s ease;
}
```

### Tables

```css
.table-row {
  padding: 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.table-header {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: #A0AEC0;
  letter-spacing: 0.5px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
```

### Inputs

```css
.input-field {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 16px;
  color: #FFFFFF;
  font-size: 14px;
  transition: all 0.3s ease;
}

.input-field:focus {
  background: rgba(255, 255, 255, 0.08);
  border-color: #4318FF;
  box-shadow: 0 0 0 3px rgba(67, 24, 255, 0.1);
  outline: none;
}

.input-field::placeholder {
  color: #718096;
}
```

### Avatars

```css
.avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
  object-fit: cover;
}

.avatar-group {
  display: flex;
  margin-left: -8px; /* Overlap avatars */
}

.avatar-group .avatar {
  margin-left: -8px;
}
```

### Badges

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(79, 209, 197, 0.15);
  color: #4FD1C5;
}

.badge-success {
  background: rgba(1, 181, 116, 0.15);
  color: #01B574;
}

.badge-error {
  background: rgba(227, 26, 26, 0.15);
  color: #E31A1A;
}
```

## Charts & Data Visualization

### Line Chart
```css
.chart-line {
  stroke-width: 2.5;
  fill: none;
  filter: drop-shadow(0 4px 8px rgba(67, 24, 255, 0.3));
}

/* Gradient fill for area charts */
.chart-gradient {
  fill: url(#gradient);
}

.chart-gradient-def stop:first-child {
  stop-color: #4318FF;
  stop-opacity: 0.5;
}

.chart-gradient-def stop:last-child {
  stop-color: #4318FF;
  stop-opacity: 0;
}
```

### Bar Chart
```css
.chart-bar {
  border-radius: 4px;
  background: linear-gradient(180deg, #4318FF, #7551FF);
  transition: all 0.3s ease;
}

.chart-bar:hover {
  transform: scaleY(1.05);
  filter: brightness(1.2);
}
```

## Sidebar

```css
.sidebar {
  width: 264px;
  background: rgba(15, 21, 53, 0.95);
  backdrop-filter: blur(40px);
  border-radius: 20px;
  padding: 24px 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-item {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  margin: 4px 12px;
  border-radius: 12px;
  color: #A0AEC0;
  transition: all 0.3s ease;
}

.sidebar-item.active {
  background: linear-gradient(135deg, #4318FF, #7551FF);
  color: #FFFFFF;
  box-shadow: 0 4px 12px rgba(67, 24, 255, 0.3);
}

.sidebar-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #FFFFFF;
}
```

## Animations & Transitions

```css
/* Default transition */
.transition-default {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Fade in */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}

/* Hover lift effect */
.hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
}
```

## Dark Mode Base

```css
:root {
  /* Background layers */
  --bg-primary: #0F1535;        /* Darkest background */
  --bg-secondary: #1A1F37;      /* Medium background */
  --bg-tertiary: #242B4B;       /* Lighter background */
  
  /* Text colors */
  --text-primary: #FFFFFF;      /* Brightest text */
  --text-secondary: #A0AEC0;    /* Dim text */
  --text-tertiary: #718096;     /* Dimmer text */
  
  /* Overlays */
  --overlay-light: rgba(255, 255, 255, 0.05);
  --overlay-medium: rgba(255, 255, 255, 0.08);
  --overlay-strong: rgba(255, 255, 255, 0.12);
}
```

## Tailwind CSS Configuration

To implement this design system in your Nuxt 3 project, update your `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#4318FF',
          400: '#7551FF',
        },
        success: '#01B574',
        error: '#E31A1A',
        teal: {
          300: '#4FD1C5',
        },
        gray: {
          300: '#CBD5E0',
          400: '#A0AEC0',
          500: '#718096',
          700: '#2D3748',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #4318FF, #7551FF)',
        'gradient-dark': 'linear-gradient(to bottom, #0F1535, #1A1F37)',
      },
      backdropBlur: {
        'xl': '40px',
      },
      boxShadow: {
        'elevated': '0 20px 27px rgba(0, 0, 0, 0.05)',
        'primary': '0 4px 12px rgba(67, 24, 255, 0.3)',
      },
    },
  },
}
```

## Usage Guidelines

### Do's ✅
- Use glass-morphism cards for elevated content
- Maintain consistent 8px spacing grid
- Apply subtle animations for interactions
- Use gradient backgrounds for primary actions
- Keep dark mode as the primary theme
- Layer backgrounds for depth

### Don'ts ❌
- Don't use pure black backgrounds (#000000)
- Avoid harsh borders (use subtle rgba borders)
- Don't overcomplicate animations
- Avoid using more than 3 accent colors per view
- Don't use flat designs without depth

## Implementation Priority

1. **Base Styles** - Colors, typography, spacing
2. **Component Library** - Cards, buttons, inputs
3. **Layout Components** - Sidebar, header, grid
4. **Data Visualization** - Charts, graphs, tables
5. **Animations** - Transitions, hover effects
