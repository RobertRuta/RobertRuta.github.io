const fs = require('fs');
const path = require('path');

// Pure CJS implementation to avoid TypeScript import at runtime
function hexToHsl(hex) {
  const cleanHex = hex.replace('#', '');
  let r, g, b;
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0].repeat(2), 16);
    g = parseInt(cleanHex[1].repeat(2), 16);
    b = parseInt(cleanHex[2].repeat(2), 16);
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  } else {
    throw new Error('Invalid hex color');
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  const hue = Math.round(h * 360);
  const saturation = Math.round(s * 100);
  const lightness = Math.round(l * 100);
  return `${hue} ${saturation}% ${lightness}%`;
}

function rgbaToHsl(rgba) {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return '0 0% 0%';
  const r = parseInt(match[1]) / 255;
  const g = parseInt(match[2]) / 255;
  const b = parseInt(match[3]) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  const hue = Math.round(h * 360);
  const saturation = Math.round(s * 100);
  const lightness = Math.round(l * 100);
  return `${hue} ${saturation}% ${lightness}%`;
}

function generateTerminalTheme() {
  const colors = {
    terminal: {
      DEFAULT: '#0a0e0a',
      green: '#00ff9c',
      dim: '#0f2018',
    },
  };
  return {
    background: hexToHsl(colors.terminal.DEFAULT),
    foreground: hexToHsl(colors.terminal.green),
    muted: hexToHsl(colors.terminal.dim),
    'muted-foreground': rgbaToHsl('rgba(0, 255, 156, 0.25)'),
    popover: hexToHsl(colors.terminal.DEFAULT),
    'popover-foreground': hexToHsl(colors.terminal.green),
    card: hexToHsl(colors.terminal.DEFAULT),
    'card-foreground': hexToHsl(colors.terminal.green),
    border: rgbaToHsl('rgba(0, 255, 156, 0.3)'),
    input: rgbaToHsl('rgba(0, 255, 156, 0.3)'),
    primary: hexToHsl(colors.terminal.green),
    'primary-foreground': hexToHsl(colors.terminal.DEFAULT),
    secondary: hexToHsl(colors.terminal.dim),
    'secondary-foreground': hexToHsl(colors.terminal.green),
    accent: `${hexToHsl(colors.terminal.dim).replace(/ .*% (.*)%$/, (m, l) => ` ${parseInt(l) + 2}%`)}`,
    'accent-foreground': hexToHsl(colors.terminal.green),
    ring: rgbaToHsl('rgba(0, 255, 156, 0.4)'),
    'crt-frame-bg': hexToHsl(colors.terminal.dim),
    'crt-screen-bg': hexToHsl(colors.terminal.DEFAULT),
    'crt-border-green': hexToHsl(colors.terminal.green),
    'crt-glow': rgbaToHsl('rgba(0, 255, 156, 0.1)'),
    'crt-glow-strong': rgbaToHsl('rgba(0, 255, 156, 0.4)'),
    'crt-scanline': rgbaToHsl('rgba(0, 255, 156, 0.02)'),
    'crt-vignette': rgbaToHsl('rgba(15, 32, 24, 0.6)'),
  };
}

function generateTerminalCss() {
  const theme = generateTerminalTheme();
  const cssVars = Object.entries(theme)
    .map(([key, value]) => `  --${key}: ${value};`)
    .join('\n');
  return `
/* Generated Terminal Theme Variables */
:root[data-theme="terminal"],
html.terminal-theme,
body.terminal-theme {
${cssVars}
}

/* CRT-specific dynamic styles */
.crt-frame {
  --crt-glow-color: hsl(var(--crt-glow));
  --crt-glow-strong-color: hsl(var(--crt-glow-strong));
  --crt-scanline-color: hsl(var(--crt-scanline));
  --crt-border-color: hsl(var(--crt-border-green));
  --crt-frame-bg-color: hsl(var(--crt-frame-bg));
  --crt-screen-bg-color: hsl(var(--crt-screen-bg));
}

.crt-frame::before {
  background: 
    radial-gradient(circle at top left, var(--crt-glow-strong-color) 0%, transparent 70%),
    radial-gradient(circle at top right, var(--crt-glow-strong-color) 0%, transparent 70%),
    radial-gradient(circle at bottom left, var(--crt-glow-strong-color) 0%, transparent 70%),
    radial-gradient(circle at bottom right, var(--crt-glow-strong-color) 0%, transparent 70%);
  box-shadow: 0 0 30px var(--crt-glow-color);
}

.crt-screen {
  background: var(--crt-screen-bg);
  border-color: var(--crt-border-color);
  box-shadow: 
    inset 0 0 20px rgba(0, 0, 0, 0.9),
    0 0 30px var(--crt-glow-color);
}

.crt-scanlines {
  background-image: 
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      var(--crt-scanline-color) 2px,
      var(--crt-scanline-color) 4px
    );
}

.crt-vignette {
  background: radial-gradient(
    circle at 50% 50%,
    transparent 30%,
    hsl(var(--crt-vignette)) 100%
  );
}
`;
}

try {
  const cssContent = generateTerminalCss();

  // Ensure app directory exists
  const appDir = path.join(process.cwd(), 'app');
  if (!fs.existsSync(appDir)) {
    fs.mkdirSync(appDir, { recursive: true });
  }

  // Write to app/terminal-theme.css
  const terminalThemePath = path.join(appDir, 'terminal-theme.css');
  fs.writeFileSync(terminalThemePath, cssContent);
  console.log('✅ Generated terminal theme CSS at:', terminalThemePath);

  // Inject import at top of app/globals.css if present
  const globalsPath = path.join(appDir, 'globals.css');
  if (fs.existsSync(globalsPath)) {
    const globalsContent = fs.readFileSync(globalsPath, 'utf8');
    const importLine = '@import "./terminal-theme.css";';
    if (!globalsContent.includes(importLine)) {
      fs.writeFileSync(globalsPath, `${importLine}\n\n${globalsContent}`);
      console.log('✅ Added import to app/globals.css');
    } else {
      console.log('ℹ️  Import already exists in app/globals.css');
    }
  } else {
    console.warn('⚠️  app/globals.css not found - skipping import injection');
  }

  process.exit(0);
} catch (error) {
  console.error('❌ Error generating terminal theme:', error && error.message ? error.message : error);
  process.exit(1);
}