class AudioTrimmer {
    constructor() {
        this.wavesurfer = null;
        this.currentFile = null;
        this.activeRegion = null;
        this.audioContext = new (window.AudioContext || window.webkitAudioContext || AudioContext)();
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.elements = {
            uploadArea: document.getElementById('uploadArea'),
            fileInput: document.getElementById('fileInput'),
            selectFileBtn: document.getElementById('selectFileBtn'),
            uploadSection: document.getElementById('uploadSection'),
            editorSection: document.getElementById('editorSection'),
            playBtn: document.getElementById('playBtn'),
            stopBtn: document.getElementById('stopBtn'),
            playRegionBtn: document.getElementById('playRegionBtn'),
            zoomInBtn: document.getElementById('zoomInBtn'),
            zoomOutBtn: document.getElementById('zoomOutBtn'),
            startTime: document.getElementById('startTime'),
            endTime: document.getElementById('endTime'),
            selectedDuration: document.getElementById('selectedDuration'),
            clearSelectionBtn: document.getElementById('clearSelectionBtn'),
            exportBtn: document.getElementById('exportBtn'),
            resetBtn: document.getElementById('resetBtn'),
            loadingOverlay: document.getElementById('loadingOverlay'),
            loadingMessage: document.getElementById('loadingMessage'),
            toast: document.getElementById('toast'),
            fileName: document.getElementById('fileName'),
            duration: document.getElementById('duration'),
            format: document.getElementById('format'),
            fileSize: document.getElementById('fileSize'),
            outputName: document.getElementById('outputName'),
            outputFormat: document.getElementById('outputFormat'),
            outputQuality: document.getElementById('outputQuality')
        };
    }

    bindEvents() {
        // 文件上传事件
        this.elements.uploadArea.addEventListener('click', () => {
            this.elements.fileInput.click();
        });

        this.elements.selectFileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.elements.fileInput.click();
        });

        this.elements.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.loadAudioFile(e.target.files[0]);
            }
        });

        // 拖拽上传
        this.elements.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.elements.uploadArea.classList.add('dragover');
        });

        this.elements.uploadArea.addEventListener('dragleave', () => {
            this.elements.uploadArea.classList.remove('dragover');
        });

        this.elements.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.elements.uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type.startsWith('audio/')) {
                this.loadAudioFile(files[0]);
            } else {
                this.showToast('请上传音频文件', 'error');
            }
        });

        // 播放控制
        this.elements.playBtn.addEventListener('click', () => {
            this.togglePlayPause();
        });

        this.elements.stopBtn.addEventListener('click', () => {
            if (this.wavesurfer) {
                this.wavesurfer.stop();
                this.updatePlayButton(false);
            }
        });

        this.elements.playRegionBtn.addEventListener('click', () => {
            this.playSelectedRegion();
        });

        // 缩放控制
        this.elements.zoomInBtn.addEventListener('click', () => {
            if (this.wavesurfer) {
                const currentZoom = this.wavesurfer.params.minPxPerSec;
                this.wavesurfer.zoom(currentZoom * 1.5);
            }
        });

        this.elements.zoomOutBtn.addEventListener('click', () => {
            if (this.wavesurfer) {
                const currentZoom = this.wavesurfer.params.minPxPerSec;
                this.wavesurfer.zoom(currentZoom / 1.5);
            }
        });

        // 时间输入
        this.elements.startTime.addEventListener('change', () => {
            this.updateRegionFromInputs();
        });

        this.elements.endTime.addEventListener('change', () => {
            this.updateRegionFromInputs();
        });

        // 选择控制
        this.elements.clearSelectionBtn.addEventListener('click', () => {
            this.clearSelection();
        });

        // 导出和重置
        this.elements.exportBtn.addEventListener('click', () => {
            this.exportAudio();
        });

        this.elements.resetBtn.addEventListener('click', () => {
            this.reset();
        });
    }

    async loadAudioFile(file) {
        this.currentFile = file;
        this.showLoading('正在加载音频文件...');

        try {
            // 显示文件信息
            this.elements.fileName.textContent = file.name;
            this.elements.format.textContent = file.type.split('/')[1]?.toUpperCase() || 'UNKNOWN';
            this.elements.fileSize.textContent = this.formatFileSize(file.size);
            
            // 设置默认输出文件名
            const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            this.elements.outputName.value = `${nameWithoutExt}_trimmed`;

            // 创建音频URL
            const audioUrl = URL.createObjectURL(file);

            // 初始化WaveSurfer
            if (this.wavesurfer) {
                this.wavesurfer.destroy();
            }

            this.wavesurfer = WaveSurfer.create({
                container: '#waveform',
                waveColor: '#94a3b8',
                progressColor: '#6366f1',
                cursorColor: '#ef4444',
                barWidth: 2,
                barRadius: 3,
                responsive: true,
                height: 200,
                normalize: true,
                backend: 'WebAudio',
                plugins: [
                    WaveSurfer.regions.create({
                        regionsMinLength: 0.1,
                        dragSelection: false  // 禁用拖动创建新选区
                    })
                ]
            });

            // 加载音频
            await this.wavesurfer.load(audioUrl);

            // 显示时长
            const duration = this.wavesurfer.getDuration();
            this.elements.duration.textContent = this.formatTime(duration);

            // 绑定WaveSurfer事件
            this.bindWaveSurferEvents();

            // 显示编辑器
            this.elements.uploadSection.style.display = 'none';
            this.elements.editorSection.style.display = 'block';

            this.hideLoading();
            this.showToast('音频加载成功', 'success');

            // 确保在所有事件处理完成后创建默认选区
            setTimeout(() => {
                this.createDefaultSelection();
            }, 100);

        } catch (error) {
            console.error('加载音频失败:', error);
            this.hideLoading();
            this.showToast('加载音频失败，请检查文件格式', 'error');
        }
    }

    bindWaveSurferEvents() {
        // 播放/暂停事件
        this.wavesurfer.on('play', () => {
            this.updatePlayButton(true);
        });

        this.wavesurfer.on('pause', () => {
            this.updatePlayButton(false);
        });

        this.wavesurfer.on('finish', () => {
            this.updatePlayButton(false);
        });

        // 区域事件
        this.wavesurfer.on('region-created', (region) => {
            // 移除之前的区域
            const regions = this.wavesurfer.regions.list;
            Object.keys(regions).forEach(id => {
                if (id !== region.id) {
                    regions[id].remove();
                }
            });

            this.activeRegion = region;
            this.updateTimeInputs(region.start, region.end);
            
            // 区域更新事件
            region.on('update-end', () => {
                this.updateTimeInputs(region.start, region.end);
            });
        });

        this.wavesurfer.on('region-removed', () => {
            this.activeRegion = null;
            this.clearTimeInputs();
        });

        // 实现边界检测和点击逻辑
        const waveformElement = document.querySelector('#waveform');
        let isNearBoundary = false;

        // 辅助函数：检测是否靠近边界
        const checkBoundary = (x) => {
            if (!this.activeRegion) return null;
            
            const width = waveformElement.clientWidth;
            const duration = this.wavesurfer.getDuration();
            const startX = (this.activeRegion.start / duration) * width;
            const endX = (this.activeRegion.end / duration) * width;
            const threshold = 8; // 8像素检测范围
            
            if (Math.abs(x - startX) < threshold) return 'start';
            if (Math.abs(x - endX) < threshold) return 'end';
            return null;
        };

        // 鼠标移动时更新光标
        waveformElement.addEventListener('mousemove', (e) => {
            const rect = waveformElement.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const boundary = checkBoundary(x);
            
            if (boundary) {
                waveformElement.style.cursor = 'ew-resize';
                isNearBoundary = true;
            } else {
                waveformElement.style.cursor = 'pointer';
                isNearBoundary = false;
            }
        });

        // 点击事件处理
        waveformElement.addEventListener('click', (e) => {
            if (!isNearBoundary && this.activeRegion) {
                // 不在边界上，跳转播放位置
                const rect = waveformElement.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const progress = x / waveformElement.clientWidth;
                this.wavesurfer.seekTo(progress);
            }
        });

        // 移动端触摸支持
        let touchBoundary = null;
        let touchStartX = 0;

        waveformElement.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            const rect = waveformElement.getBoundingClientRect();
            touchStartX = touch.clientX - rect.left;
            touchBoundary = checkBoundary(touchStartX);
            
            // 防止默认行为，避免页面滚动
            if (touchBoundary) {
                e.preventDefault();
            }
        });

        waveformElement.addEventListener('touchend', (e) => {
            if (!touchBoundary && this.activeRegion) {
                // 不在边界上，跳转播放位置
                const touch = e.changedTouches[0];
                const rect = waveformElement.getBoundingClientRect();
                const x = touch.clientX - rect.left;
                const progress = x / waveformElement.clientWidth;
                this.wavesurfer.seekTo(progress);
            }
            touchBoundary = null;
        });
    }

    togglePlayPause() {
        if (this.wavesurfer) {
            this.wavesurfer.playPause();
        }
    }

    playSelectedRegion() {
        if (this.activeRegion) {
            this.activeRegion.play();
        } else {
            this.showToast('请先选择要播放的区域', 'warning');
        }
    }

    updatePlayButton(isPlaying) {
        const playIcon = this.elements.playBtn.querySelector('.play-icon');
        const pauseIcon = this.elements.playBtn.querySelector('.pause-icon');
        
        if (isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    }

    createDefaultSelection() {
        if (this.wavesurfer) {
            const duration = this.wavesurfer.getDuration();
            
            // 清除现有区域
            this.wavesurfer.clearRegions();
            
            // 创建默认选区（中间30%）
            const start = duration * 0.35;
            const end = duration * 0.65;
            
            // 创建选区
            this.activeRegion = this.wavesurfer.addRegion({
                start: start,
                end: end,
                color: 'rgba(99, 102, 241, 0.3)',
                drag: false,  // 禁用整体拖动
                resize: true   // 允许调整边界
            });
            
            this.updateTimeInputs(start, end);
            
            // 确保选区创建成功
            console.log('默认选区已创建:', {
                start: this.formatTime(start),
                end: this.formatTime(end),
                duration: this.formatTime(end - start)
            });
        }
    }

    selectAll() {
        if (this.wavesurfer) {
            const duration = this.wavesurfer.getDuration();
            
            // 清除现有区域
            this.wavesurfer.clearRegions();
            
            // 创建新区域
            this.activeRegion = this.wavesurfer.addRegion({
                start: 0,
                end: duration,
                color: 'rgba(99, 102, 241, 0.3)',
                drag: false,  // 禁用整体拖动
                resize: true
            });
            
            this.updateTimeInputs(0, duration);
        }
    }

    clearSelection() {
        if (this.wavesurfer) {
            this.wavesurfer.clearRegions();
            this.clearTimeInputs();
        }
    }

    updateTimeInputs(start, end) {
        this.elements.startTime.value = this.formatTimeForInput(start);
        this.elements.endTime.value = this.formatTimeForInput(end);
        this.elements.selectedDuration.value = this.formatTimeForInput(end - start);
    }

    clearTimeInputs() {
        this.elements.startTime.value = '';
        this.elements.endTime.value = '';
        this.elements.selectedDuration.value = '';
    }

    updateRegionFromInputs() {
        if (!this.wavesurfer) return;

        const start = this.parseTimeInput(this.elements.startTime.value);
        const end = this.parseTimeInput(this.elements.endTime.value);

        if (start !== null && end !== null && start < end) {
            // 清除现有区域
            this.wavesurfer.clearRegions();
            
            // 创建新区域
            this.activeRegion = this.wavesurfer.addRegion({
                start: start,
                end: end,
                color: 'rgba(99, 102, 241, 0.3)',
                drag: true,
                resize: true
            });
            
            this.elements.selectedDuration.value = this.formatTimeForInput(end - start);
        }
    }

    async exportAudio() {
        if (!this.activeRegion) {
            this.showToast('请先选择要导出的音频区域', 'warning');
            return;
        }

        this.showLoading('正在处理音频...');

        try {
            const audioBuffer = await this.getSelectedAudioBuffer();
            const format = this.elements.outputFormat.value;
            const quality = this.elements.outputQuality.value;
            const fileName = this.elements.outputName.value || 'trimmed_audio';

            let blob;
            
            if (format === 'wav') {
                blob = await this.audioBufferToWav(audioBuffer);
            } else if (format === 'mp3') {
                // 使用lamejs库生成真正的MP3文件
                blob = await this.audioBufferToMp3(audioBuffer, quality);
            } else if (format === 'webm') {
                blob = await this.audioBufferToWebM(audioBuffer, quality);
            }

            // 下载文件
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName}.${format}`;
            a.click();
            URL.revokeObjectURL(url);

            this.hideLoading();
            this.showToast('音频导出成功！', 'success');

        } catch (error) {
            console.error('导出音频失败:', error);
            this.hideLoading();
            this.showToast('导出音频失败，请重试', 'error');
        }
    }

    async getSelectedAudioBuffer() {
        const originalBuffer = this.wavesurfer.backend.buffer;
        const sampleRate = originalBuffer.sampleRate;
        const start = Math.floor(this.activeRegion.start * sampleRate);
        const end = Math.floor(this.activeRegion.end * sampleRate);
        const length = end - start;

        const newBuffer = this.audioContext.createBuffer(
            originalBuffer.numberOfChannels,
            length,
            sampleRate
        );

        for (let channel = 0; channel < originalBuffer.numberOfChannels; channel++) {
            const channelData = originalBuffer.getChannelData(channel);
            const newChannelData = newBuffer.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                newChannelData[i] = channelData[start + i];
            }
        }

        return newBuffer;
    }

    async audioBufferToWav(audioBuffer) {
        const length = audioBuffer.length * audioBuffer.numberOfChannels * 2 + 44;
        const buffer = new ArrayBuffer(length);
        const view = new DataView(buffer);
        const channels = [];
        let offset = 0;
        let pos = 0;

        // 写入WAV头部
        const setUint16 = (data) => {
            view.setUint16(pos, data, true);
            pos += 2;
        };

        const setUint32 = (data) => {
            view.setUint32(pos, data, true);
            pos += 4;
        };

        // RIFF标识符
        setUint32(0x46464952);
        setUint32(length - 8);
        setUint32(0x45564157);

        // fmt子块
        setUint32(0x20746d66);
        setUint32(16);
        setUint16(1);
        setUint16(audioBuffer.numberOfChannels);
        setUint32(audioBuffer.sampleRate);
        setUint32(audioBuffer.sampleRate * 2 * audioBuffer.numberOfChannels);
        setUint16(audioBuffer.numberOfChannels * 2);
        setUint16(16);

        // data子块
        setUint32(0x61746164);
        setUint32(length - pos - 4);

        // 写入音频数据
        for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
            channels.push(audioBuffer.getChannelData(i));
        }

        while (pos < length) {
            for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
                let sample = Math.max(-1, Math.min(1, channels[i][offset]));
                sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
                view.setInt16(pos, sample, true);
                pos += 2;
            }
            offset++;
        }

        return new Blob([buffer], { type: 'audio/wav' });
    }

    async audioBufferToMp3(audioBuffer, quality) {
        // 使用lamejs库编码为MP3
        const channels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const samples = audioBuffer.length;
        
        // 设置比特率
        const bitrates = {
            high: 320,
            medium: 192,
            low: 128
        };
        const kbps = bitrates[quality];
        
        // 创建编码器
        const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, kbps);
        
        // 准备样本数据
        const sampleBlockSize = 1152; // MP3编码器的标准块大小
        const mp3Data = [];
        
        // 转换为16位PCM
        const left = new Int16Array(samples);
        const right = channels > 1 ? new Int16Array(samples) : null;
        
        for (let i = 0; i < samples; i++) {
            const s = Math.max(-1, Math.min(1, audioBuffer.getChannelData(0)[i]));
            left[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            
            if (channels > 1) {
                const s2 = Math.max(-1, Math.min(1, audioBuffer.getChannelData(1)[i]));
                right[i] = s2 < 0 ? s2 * 0x8000 : s2 * 0x7FFF;
            }
        }
        
        // 编码
        for (let i = 0; i < samples; i += sampleBlockSize) {
            const leftChunk = left.subarray(i, i + sampleBlockSize);
            const rightChunk = right ? right.subarray(i, i + sampleBlockSize) : leftChunk;
            const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
            if (mp3buf.length > 0) {
                mp3Data.push(mp3buf);
            }
        }
        
        // 完成编码
        const mp3buf = mp3encoder.flush();
        if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
        }
        
        // 创建Blob
        return new Blob(mp3Data, { type: 'audio/mp3' });
    }

    async audioBufferToWebM(audioBuffer, quality) {
        // 使用MediaRecorder API生成WebM格式
        const mediaStreamDestination = this.audioContext.createMediaStreamDestination();
        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(mediaStreamDestination);

        const bitrates = {
            high: 320000,
            medium: 192000,
            low: 128000
        };

        const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream, {
            mimeType: 'audio/webm',
            audioBitsPerSecond: bitrates[quality]
        });

        const chunks = [];
        
        return new Promise((resolve) => {
            mediaRecorder.ondataavailable = (e) => {
                chunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                resolve(blob);
            };

            mediaRecorder.start();
            source.start();
            
            source.onended = () => {
                mediaRecorder.stop();
            };
        });
    }

    reset() {
        if (this.wavesurfer) {
            this.wavesurfer.destroy();
            this.wavesurfer = null;
        }
        
        this.currentFile = null;
        this.activeRegion = null;
        
        this.elements.uploadSection.style.display = 'block';
        this.elements.editorSection.style.display = 'none';
        this.elements.fileInput.value = '';
        
        this.showToast('已重置，请选择新的音频文件', 'success');
    }

    showLoading(message) {
        this.elements.loadingMessage.textContent = message;
        this.elements.loadingOverlay.style.display = 'flex';
    }

    hideLoading() {
        this.elements.loadingOverlay.style.display = 'none';
    }

    showToast(message, type = 'info') {
        this.elements.toast.textContent = message;
        this.elements.toast.className = `toast ${type}`;
        this.elements.toast.classList.add('show');
        
        setTimeout(() => {
            this.elements.toast.classList.remove('show');
        }, 3000);
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    formatTimeForInput(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const milliseconds = Math.floor((secs % 1) * 1000);
        return `${minutes.toString().padStart(2, '0')}:${Math.floor(secs).toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    }

    parseTimeInput(timeStr) {
        if (!timeStr) return null;
        
        const parts = timeStr.split(':');
        if (parts.length !== 2) return null;
        
        const minutes = parseInt(parts[0]);
        const secondsParts = parts[1].split('.');
        const seconds = parseInt(secondsParts[0]);
        const milliseconds = secondsParts[1] ? parseInt(secondsParts[1]) : 0;
        
        return minutes * 60 + seconds + milliseconds / 1000;
    }

    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new AudioTrimmer();
});