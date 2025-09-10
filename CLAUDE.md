# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
用中文回答，用英文思考

## 最近更新 (2025-01-10)

### UI/UX全面升级
- 实现了专业级的界面美化，参考Raphael.app设计理念
- 统一了视觉系统，采用柔和渐变配色方案
- 替换所有emoji为专业SVG图标
- 优化了字体系统（Poppins + Inter）
- 增加了信任体系模块（数据统计展示）
- 增强了交互动画和微交互效果
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

#### 颜色系统
- Primary color: `#FFAB00` (主黄色)
- Primary hover: `#FF9500`
- Primary dark: `#CC8800`
- Background: 柔和渐变 `#FAFAFA` → `#F5F5F5`
- Card background: `#FFFFFF`
- Text primary: `#1D1D1F`
- Text secondary: `#86868B`

#### 字体系统
- 标题字体: Poppins (600-900 weight)
- 正文字体: Inter (300-700 weight)
- 字体大小: 响应式，移动端自适应

#### 设计元素
- Logo: 优化的SVG音频波形设计 (`logo/smartkit-optimized.svg`)
- 图标: 专业SVG图标，带渐变边框效果
- 圆角系统: 8px (小), 16px (默认), 24px (大)
- 阴影系统: sm, md, lg, xl四个层级
- 动画时长: 0.2s (快速), 0.3s (基础), 0.5s (慢速)

#### 响应式断点
- Desktop: 1200px+
- Tablet: 768px - 1199px
- Mobile: < 768px

#### 交互设计
- 按钮波纹效果
- 卡片悬停动画
- Toast弹窗动画
- 平滑滚动
- 上传区域光晕效果

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

### 开发环境
```bash
# Python HTTP server (推荐)
python -m http.server 8000

# Node.js alternative
npx http-server
```

### Git工作流
```bash
# 查看状态
git status

# 提交更改
git add .
git commit -m "描述更改"

# 推送到GitHub
git push origin main
```

### 部署
- 自动部署: 推送到main分支后自动通过GitHub Pages部署
- 生产URL: https://smartkit.online/

## Important Notes

### 技术注意事项
- WaveSurfer.js 6.x API (not 7.x) for stability
- MP3 export requires LameJS library loaded from CDN
- Large files (>100MB) may cause performance issues
- Browser compatibility: Chrome 60+, Firefox 55+, Safari 11+, Edge 79+

### 开发规范
- 保持代码简洁，避免过度设计
- 优先使用CSS动画而非JavaScript
- 所有文本使用中文
- 图标使用SVG，避免emoji
- 保持响应式设计

### 项目信息
- GitHub repository: https://github.com/emptylower/mp3cutter
- Production URL: https://smartkit.online/
- 维护者: @emptylower
- 许可: MIT License