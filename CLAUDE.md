# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
用中文回答，用英文思考
## Project Overview

Browser-based audio trimming web application that operates entirely client-side. Supports audio file upload, waveform visualization, region selection for trimming, and multi-format export. The application includes a landing page with SEO optimization and a fully functional audio editing interface.

## Running the Application

No build process required. To run locally with full functionality:

```bash
# Python HTTP server (recommended)
python -m http.server 8000

# Node.js alternative
npx http-server
```

Visit `http://localhost:8000`. Direct file opening (`file://`) has limited functionality due to CORS restrictions.

## Architecture

### Core Components

1. **AudioTrimmer** (`js/app.js`) - Main application controller
   - WaveSurfer.js instance management
   - File upload and audio loading
   - Region selection and trimming control
   - Export functionality with format conversion
   - Time format conversion and validation

2. **AudioProcessor** (`js/audio-processor.js`) - Audio manipulation
   - Audio effects (fade, normalize, reverse, speed change)
   - Silence detection and removal
   - WAV encoding and buffer manipulation
   - Format conversion logic

3. **UIController** (`js/ui-controller.js`) - UI enhancements
   - Keyboard shortcuts (Space, Ctrl+A, Ctrl+E, Esc, +/-)
   - Progress indicators and notifications
   - Browser compatibility checks
   - Dark mode toggle

4. **SmoothScroll** (`js/smooth-scroll.js`) - Landing page navigation
   - Smooth scrolling for anchor links
   - Dynamic navbar styling on scroll
   - Section highlighting

### Page Structure

- **index.html** - Main landing page with SEO optimization and audio trimmer interface
- **privacy.html** - Privacy policy page
- **robots.txt** - Search engine crawling rules
- **sitemap.xml** - Site structure for search engines

### Styling

- **css/style.css** - Core application styles including audio interface, controls, and responsive design
- **css/landing.css** - Landing page specific styles, hero section, features grid, FAQ accordion

### Design System

- Primary color: `#FFAB00` (Yellow/Orange)
- Logo: Optimized SVG with audio waveform design (`logo/smartkit-optimized.svg`)
- Responsive breakpoints: 768px (tablet), 480px (mobile)
- Dark mode support with CSS custom properties

### External Dependencies

CDN-loaded in `index.html`:
- **WaveSurfer.js v6.6.4** - Waveform visualization and region selection
- **LameJS v1.2.1** - MP3 encoding

### Audio Export Implementation

Format-specific handling:
- **WAV**: Native ArrayBuffer manipulation in `AudioProcessor`
- **MP3**: LameJS library encoding with quality settings (128/192/320 kbps)
- **WebM**: MediaRecorder API (browser-dependent)

### Key Technical Decisions

1. **No Build System**: Pure static files for deployment simplicity
2. **Client-Side Processing**: Web Audio API for privacy and performance
3. **Format Support**: Input - MP3, WAV, M4A, OGG, FLAC, WMA; Output - MP3, WAV, WebM
4. **Region Selection**: WaveSurfer.js regions plugin with visual feedback
5. **SEO Optimization**: Structured data, meta tags, semantic HTML

## Commands

No build/test commands - this is a static site. Development only requires a local HTTP server.

## Important Notes

- WaveSurfer.js 6.x API (not 7.x) for stability
- MP3 export requires LameJS library loaded from CDN
- Large files (>100MB) may cause performance issues
- Browser compatibility: Chrome 60+, Firefox 55+, Safari 11+, Edge 79+
- GitHub repository: https://github.com/emptylower/mp3cutter
- Production URL: https://smartkit.online/