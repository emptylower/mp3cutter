# CLAUDE.md
用英文思考，用中文回答我
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Browser-based audio trimming web application that operates entirely client-side. Supports audio file upload, waveform visualization, region selection for trimming, and multi-format export.

## Running the Application

No build process required. To run locally with full functionality:

```bash
# Python HTTP server (recommended)
python -m http.server 8000

# Node.js alternative
npx http-server
```

Visit `http://localhost:8000`. Direct file opening (`file://`) has limited functionality.

## Architecture

### Core Components

1. **AudioTrimmer** (`js/app.js`) - Main application controller
   - WaveSurfer.js instance management
   - File upload and audio loading
   - Region selection and trimming control
   - Export functionality with format conversion

2. **AudioProcessor** (`js/audio-processor.js`) - Audio manipulation
   - Audio effects (fade, normalize, reverse, speed change)
   - Silence detection and removal
   - WAV encoding and buffer manipulation

3. **UIController** (`js/ui-controller.js`) - UI enhancements
   - Keyboard shortcuts (Space, Ctrl+A, Ctrl+E, Esc, +/-)
   - Progress indicators and notifications
   - Browser compatibility checks

### External Dependencies

CDN-loaded in `index.html`:
- **WaveSurfer.js v6.6.4** - Waveform visualization and region selection
- **LameJS v1.2.1** - MP3 encoding

### Audio Export Implementation

Format-specific handling:
- **WAV**: Native ArrayBuffer manipulation
- **MP3**: LameJS library encoding
- **WebM**: MediaRecorder API (browser-dependent)

### Key Technical Decisions

1. **No Build System**: Pure static files for simplicity
2. **Client-Side Processing**: Web Audio API in browser
3. **Format Support**: Input - MP3, WAV, M4A, OGG, FLAC; Output - MP3, WAV, WebM
4. **Region Selection**: WaveSurfer.js regions plugin

## Commands

No build/test commands - this is a static site. Development only requires a local HTTP server.

## Important Notes

- WaveSurfer.js 6.x API (not 7.x) for stability
- MP3 export requires LameJS library
- Large files may cause performance issues
- Browser compatibility: Chrome 60+, Firefox 55+, Safari 11+, Edge 79+