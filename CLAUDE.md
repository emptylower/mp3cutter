# CLAUDE.md
总是用英文思考用中文回答我
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a browser-based audio trimming web application that operates entirely client-side. It allows users to upload audio files, visualize waveforms, select regions for trimming, and export the trimmed audio in multiple formats.

## Running the Application

The application requires no build process. To run locally with full functionality:

```bash
# Python HTTP server (recommended)
python -m http.server 8000

# Node.js alternative
npx http-server
```

Then visit `http://localhost:8000`. Direct file opening (`file://`) has limited functionality.

## Architecture

### Core Components

1. **AudioTrimmer** (`js/app.js`) - Main application controller
   - Manages WaveSurfer.js instance for waveform visualization
   - Handles file uploads and audio loading
   - Controls region selection and trimming
   - Implements export functionality with format conversion

2. **AudioProcessor** (`js/audio-processor.js`) - Audio manipulation utilities
   - Provides audio effects (fade, normalize, reverse, speed change)
   - Handles silence detection and removal
   - Contains WAV encoding and buffer manipulation functions

3. **UIController** (`js/ui-controller.js`) - UI enhancements
   - Manages keyboard shortcuts (Space, Ctrl+A, Ctrl+E, Esc, +/-)
   - Provides progress indicators and notifications
   - Handles browser compatibility checks

### External Dependencies

Loaded via CDN in `index.html`:
- **WaveSurfer.js v6.6.4** - Waveform visualization and region selection
- **LameJS v1.2.1** - MP3 encoding capability

### Audio Export Implementation

The export system handles three formats differently:
- **WAV**: Native implementation using ArrayBuffer manipulation
- **MP3**: Uses LameJS library for proper MP3 encoding
- **WebM**: Uses MediaRecorder API (browser-dependent)

### Key Technical Decisions

1. **No Build System**: Pure static files for simplicity and immediate deployment
2. **Client-Side Processing**: All audio processing happens in browser using Web Audio API
3. **Format Support**: Reads MP3, WAV, M4A, OGG, FLAC; exports MP3, WAV, WebM
4. **Region Selection**: Uses WaveSurfer.js regions plugin for visual selection

## Common Development Tasks

### Adding New Audio Effects
New effects should be added to `AudioProcessor` class in `js/audio-processor.js`. Follow the existing pattern of operating on AudioBuffer objects.

### Modifying Export Formats
Export logic is in `AudioTrimmer.exportAudio()` method. Each format has its own conversion method (`audioBufferToWav`, `audioBufferToMp3`, `audioBufferToWebM`).

### Updating UI Styles
All styles are in `css/style.css` using CSS variables for theming. The application supports both light and dark modes via media queries.

## Important Notes

- The application uses WaveSurfer.js 6.x API (not 7.x) for stability
- MP3 export requires LameJS library loaded in the browser
- Large files may cause performance issues due to client-side processing
- Browser compatibility: Chrome 60+, Firefox 55+, Safari 11+, Edge 79+