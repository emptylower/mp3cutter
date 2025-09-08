class UIController {
    constructor() {
        this.initializeKeyboardShortcuts();
        this.initializeTooltips();
        this.initializeProgressIndicators();
    }

    initializeKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // 空格键播放/暂停
            if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
                e.preventDefault();
                const playBtn = document.getElementById('playBtn');
                if (playBtn) playBtn.click();
            }

            // Ctrl/Cmd + A 选择全部
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                e.preventDefault();
                const selectAllBtn = document.getElementById('selectAllBtn');
                if (selectAllBtn) selectAllBtn.click();
            }

            // Ctrl/Cmd + E 导出
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                const exportBtn = document.getElementById('exportBtn');
                if (exportBtn) exportBtn.click();
            }


            // + 放大
            if (e.key === '+' || e.key === '=') {
                const zoomInBtn = document.getElementById('zoomInBtn');
                if (zoomInBtn) zoomInBtn.click();
            }

            // - 缩小
            if (e.key === '-' || e.key === '_') {
                const zoomOutBtn = document.getElementById('zoomOutBtn');
                if (zoomOutBtn) zoomOutBtn.click();
            }
        });
    }

    initializeTooltips() {
        // 添加快捷键提示到按钮
        const shortcuts = {
            'playBtn': '空格键',
            'exportBtn': 'Ctrl+E',
            'zoomInBtn': '+',
            'zoomOutBtn': '-'
        };

        for (const [id, shortcut] of Object.entries(shortcuts)) {
            const element = document.getElementById(id);
            if (element) {
                const currentTitle = element.getAttribute('title') || '';
                element.setAttribute('title', `${currentTitle} (${shortcut})`);
            }
        }
    }

    initializeProgressIndicators() {
        // 为长时间操作添加进度指示
        this.createProgressBar();
    }

    createProgressBar() {
        const progressBar = document.createElement('div');
        progressBar.id = 'progressBar';
        progressBar.className = 'progress-bar';
        progressBar.innerHTML = `
            <div class="progress-bar-fill"></div>
            <span class="progress-bar-text">0%</span>
        `;
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: #e2e8f0;
            z-index: 9999;
            display: none;
        `;
        
        const fill = document.createElement('style');
        fill.textContent = `
            .progress-bar-fill {
                height: 100%;
                background: linear-gradient(90deg, #6366f1, #8b5cf6);
                width: 0%;
                transition: width 0.3s ease;
            }
            .progress-bar-text {
                position: absolute;
                right: 10px;
                top: 10px;
                background: white;
                padding: 5px 10px;
                border-radius: 4px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                font-size: 12px;
                font-weight: 600;
            }
        `;
        document.head.appendChild(fill);
        document.body.appendChild(progressBar);
    }

    showProgress(percent, message) {
        const progressBar = document.getElementById('progressBar');
        const fill = progressBar.querySelector('.progress-bar-fill');
        const text = progressBar.querySelector('.progress-bar-text');
        
        progressBar.style.display = 'block';
        fill.style.width = `${percent}%`;
        text.textContent = message || `${percent}%`;
        
        if (percent >= 100) {
            setTimeout(() => {
                progressBar.style.display = 'none';
                fill.style.width = '0%';
            }, 500);
        }
    }

    hideProgress() {
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.display = 'none';
        }
    }

    formatTimeDisplay(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 1000);

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    }

    validateTimeInput(input) {
        // 验证时间输入格式 MM:SS.mmm 或 HH:MM:SS.mmm
        const pattern1 = /^\d{1,2}:\d{2}\.\d{3}$/;
        const pattern2 = /^\d{1,2}:\d{2}:\d{2}\.\d{3}$/;
        
        return pattern1.test(input) || pattern2.test(input);
    }

    showNotification(title, message, type = 'info') {
        // 检查浏览器是否支持通知
        if (!("Notification" in window)) {
            return;
        }

        // 请求通知权限
        if (Notification.permission === "granted") {
            this.createNotification(title, message, type);
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                    this.createNotification(title, message, type);
                }
            });
        }
    }

    createNotification(title, message, type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const notification = new Notification(title, {
            body: message,
            icon: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">${icons[type]}</text></svg>`,
            badge: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">${icons[type]}</text></svg>`,
            vibrate: [200, 100, 200],
            requireInteraction: false
        });

        setTimeout(() => {
            notification.close();
        }, 5000);
    }

    animateValue(element, start, end, duration) {
        const startTime = performance.now();
        const endTime = startTime + duration;

        const update = () => {
            const currentTime = performance.now();
            const elapsed = Math.min(currentTime - startTime, duration);
            const progress = elapsed / duration;

            // 使用缓动函数
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = start + (end - start) * easeOutQuart;

            element.textContent = Math.floor(currentValue);

            if (currentTime < endTime) {
                requestAnimationFrame(update);
            } else {
                element.textContent = end;
            }
        };

        requestAnimationFrame(update);
    }

    createRippleEffect(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
        `;

        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    enableRippleEffects() {
        // 为所有按钮添加涟漪效果
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', this.createRippleEffect);
        });
    }

    createDropZone(element, onDrop) {
        let dragCounter = 0;

        element.addEventListener('dragenter', (e) => {
            e.preventDefault();
            dragCounter++;
            element.classList.add('drag-over');
        });

        element.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        element.addEventListener('dragleave', () => {
            dragCounter--;
            if (dragCounter === 0) {
                element.classList.remove('drag-over');
            }
        });

        element.addEventListener('drop', (e) => {
            e.preventDefault();
            dragCounter = 0;
            element.classList.remove('drag-over');
            
            const files = Array.from(e.dataTransfer.files);
            if (onDrop) {
                onDrop(files);
            }
        });
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('已复制到剪贴板', 'success');
        } catch (err) {
            // 降级方案
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showToast('已复制到剪贴板', 'success');
        }
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.className = `toast ${type}`;
            toast.classList.add('show');
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    }

    checkBrowserCompatibility() {
        const features = {
            'Web Audio API': typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined',
            'File API': typeof File !== 'undefined' && typeof FileReader !== 'undefined',
            'Blob': typeof Blob !== 'undefined',
            'MediaRecorder': typeof MediaRecorder !== 'undefined',
            'Canvas': !!document.createElement('canvas').getContext
        };

        const unsupported = Object.entries(features)
            .filter(([, supported]) => !supported)
            .map(([feature]) => feature);

        if (unsupported.length > 0) {
            console.warn('以下功能不受支持:', unsupported.join(', '));
            this.showToast(`浏览器不支持: ${unsupported.join(', ')}`, 'warning');
        }

        return unsupported.length === 0;
    }

    initializePWA() {
        // 注册Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then((registration) => {
                console.log('Service Worker 注册成功:', registration);
            }).catch((error) => {
                console.log('Service Worker 注册失败:', error);
            });
        }

        // 处理安装提示
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // 显示安装按钮
            const installBtn = document.createElement('button');
            installBtn.textContent = '安装应用';
            installBtn.className = 'btn btn-primary install-btn';
            installBtn.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                z-index: 1000;
            `;
            
            installBtn.addEventListener('click', async () => {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`用户选择: ${outcome}`);
                deferredPrompt = null;
                installBtn.remove();
            });
            
            document.body.appendChild(installBtn);
        });
    }
}

// 初始化UI控制器
document.addEventListener('DOMContentLoaded', () => {
    const uiController = new UIController();
    uiController.checkBrowserCompatibility();
    uiController.enableRippleEffects();
    
    // 导出到全局以供其他模块使用
    window.uiController = uiController;
});