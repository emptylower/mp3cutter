class AudioProcessor {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    async decodeAudioData(arrayBuffer) {
        return await this.audioContext.decodeAudioData(arrayBuffer);
    }

    getAudioMetadata(audioBuffer) {
        return {
            duration: audioBuffer.duration,
            sampleRate: audioBuffer.sampleRate,
            numberOfChannels: audioBuffer.numberOfChannels,
            length: audioBuffer.length
        };
    }

    trimAudioBuffer(audioBuffer, startTime, endTime) {
        const sampleRate = audioBuffer.sampleRate;
        const startSample = Math.floor(startTime * sampleRate);
        const endSample = Math.floor(endTime * sampleRate);
        const length = endSample - startSample;

        const trimmedBuffer = this.audioContext.createBuffer(
            audioBuffer.numberOfChannels,
            length,
            sampleRate
        );

        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
            const originalData = audioBuffer.getChannelData(channel);
            const trimmedData = trimmedBuffer.getChannelData(channel);
            
            for (let i = 0; i < length; i++) {
                trimmedData[i] = originalData[startSample + i];
            }
        }

        return trimmedBuffer;
    }

    fadeIn(audioBuffer, fadeDuration) {
        const fadeLength = fadeDuration * audioBuffer.sampleRate;
        
        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
            const channelData = audioBuffer.getChannelData(channel);
            
            for (let i = 0; i < fadeLength && i < channelData.length; i++) {
                const fadeAmount = i / fadeLength;
                channelData[i] *= fadeAmount;
            }
        }
        
        return audioBuffer;
    }

    fadeOut(audioBuffer, fadeDuration) {
        const fadeLength = fadeDuration * audioBuffer.sampleRate;
        const startFade = audioBuffer.length - fadeLength;
        
        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
            const channelData = audioBuffer.getChannelData(channel);
            
            for (let i = startFade; i < audioBuffer.length && i >= 0; i++) {
                const fadeAmount = (audioBuffer.length - i) / fadeLength;
                channelData[i] *= fadeAmount;
            }
        }
        
        return audioBuffer;
    }

    normalizeAudio(audioBuffer, targetLevel = 0.95) {
        let maxAmplitude = 0;
        
        // 找到最大振幅
        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
            const channelData = audioBuffer.getChannelData(channel);
            for (let i = 0; i < channelData.length; i++) {
                maxAmplitude = Math.max(maxAmplitude, Math.abs(channelData[i]));
            }
        }
        
        // 计算归一化因子
        const normalizationFactor = targetLevel / maxAmplitude;
        
        // 应用归一化
        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
            const channelData = audioBuffer.getChannelData(channel);
            for (let i = 0; i < channelData.length; i++) {
                channelData[i] *= normalizationFactor;
            }
        }
        
        return audioBuffer;
    }

    changeSpeed(audioBuffer, speedFactor) {
        const newLength = Math.floor(audioBuffer.length / speedFactor);
        const newBuffer = this.audioContext.createBuffer(
            audioBuffer.numberOfChannels,
            newLength,
            audioBuffer.sampleRate
        );

        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
            const oldData = audioBuffer.getChannelData(channel);
            const newData = newBuffer.getChannelData(channel);
            
            for (let i = 0; i < newLength; i++) {
                const oldIndex = Math.floor(i * speedFactor);
                if (oldIndex < oldData.length) {
                    newData[i] = oldData[oldIndex];
                }
            }
        }

        return newBuffer;
    }

    reverseAudio(audioBuffer) {
        const reversedBuffer = this.audioContext.createBuffer(
            audioBuffer.numberOfChannels,
            audioBuffer.length,
            audioBuffer.sampleRate
        );

        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
            const originalData = audioBuffer.getChannelData(channel);
            const reversedData = reversedBuffer.getChannelData(channel);
            
            for (let i = 0; i < originalData.length; i++) {
                reversedData[i] = originalData[originalData.length - 1 - i];
            }
        }

        return reversedBuffer;
    }

    mergeAudioBuffers(buffers, sampleRate) {
        const totalLength = buffers.reduce((sum, buffer) => sum + buffer.length, 0);
        const numberOfChannels = Math.max(...buffers.map(b => b.numberOfChannels));
        
        const mergedBuffer = this.audioContext.createBuffer(
            numberOfChannels,
            totalLength,
            sampleRate
        );

        let offset = 0;
        for (const buffer of buffers) {
            for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
                const sourceData = buffer.getChannelData(channel);
                const targetData = mergedBuffer.getChannelData(channel);
                
                for (let i = 0; i < sourceData.length; i++) {
                    targetData[offset + i] = sourceData[i];
                }
            }
            offset += buffer.length;
        }

        return mergedBuffer;
    }

    async encodeWAV(audioBuffer) {
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

        // RIFF identifier
        setUint32(0x46464952);
        // file length
        setUint32(length - 8);
        // WAVE identifier
        setUint32(0x45564157);

        // fmt sub-chunk
        setUint32(0x20746d66);
        setUint32(16);
        setUint16(1);
        setUint16(audioBuffer.numberOfChannels);
        setUint32(audioBuffer.sampleRate);
        setUint32(audioBuffer.sampleRate * 2 * audioBuffer.numberOfChannels);
        setUint16(audioBuffer.numberOfChannels * 2);
        setUint16(16);

        // data sub-chunk
        setUint32(0x61746164);
        setUint32(length - pos - 4);

        // 写入PCM数据
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

    calculatePeaks(audioBuffer, peaksCount = 1000) {
        const sampleSize = Math.floor(audioBuffer.length / peaksCount);
        const peaks = [];

        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
            const channelData = audioBuffer.getChannelData(channel);
            const channelPeaks = [];

            for (let i = 0; i < peaksCount; i++) {
                const start = i * sampleSize;
                const end = Math.min(start + sampleSize, channelData.length);
                
                let min = 0;
                let max = 0;
                
                for (let j = start; j < end; j++) {
                    const value = channelData[j];
                    if (value > max) max = value;
                    if (value < min) min = value;
                }
                
                channelPeaks.push({ min, max });
            }
            
            peaks.push(channelPeaks);
        }

        return peaks;
    }

    detectSilence(audioBuffer, threshold = 0.01, minSilenceDuration = 0.1) {
        const sampleRate = audioBuffer.sampleRate;
        const minSilenceSamples = minSilenceDuration * sampleRate;
        const silentRegions = [];

        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
            const channelData = audioBuffer.getChannelData(channel);
            let silenceStart = null;
            let silenceLength = 0;

            for (let i = 0; i < channelData.length; i++) {
                if (Math.abs(channelData[i]) < threshold) {
                    if (silenceStart === null) {
                        silenceStart = i;
                    }
                    silenceLength++;
                } else {
                    if (silenceStart !== null && silenceLength >= minSilenceSamples) {
                        silentRegions.push({
                            start: silenceStart / sampleRate,
                            end: i / sampleRate,
                            channel: channel
                        });
                    }
                    silenceStart = null;
                    silenceLength = 0;
                }
            }

            // 检查末尾的静音
            if (silenceStart !== null && silenceLength >= minSilenceSamples) {
                silentRegions.push({
                    start: silenceStart / sampleRate,
                    end: channelData.length / sampleRate,
                    channel: channel
                });
            }
        }

        return silentRegions;
    }

    removeSilence(audioBuffer, threshold = 0.01, minSilenceDuration = 0.1) {
        const silentRegions = this.detectSilence(audioBuffer, threshold, minSilenceDuration);
        
        if (silentRegions.length === 0) {
            return audioBuffer;
        }

        // 计算非静音部分
        const sampleRate = audioBuffer.sampleRate;
        const segments = [];
        let lastEnd = 0;

        // 合并所有通道的静音区域
        const mergedSilentRegions = this.mergeSilentRegions(silentRegions);

        for (const region of mergedSilentRegions) {
            if (region.start > lastEnd) {
                segments.push({
                    start: lastEnd,
                    end: region.start
                });
            }
            lastEnd = region.end;
        }

        // 添加最后一段
        const duration = audioBuffer.duration;
        if (lastEnd < duration) {
            segments.push({
                start: lastEnd,
                end: duration
            });
        }

        // 创建新的音频缓冲区
        const totalLength = segments.reduce((sum, seg) => {
            return sum + Math.floor((seg.end - seg.start) * sampleRate);
        }, 0);

        const newBuffer = this.audioContext.createBuffer(
            audioBuffer.numberOfChannels,
            totalLength,
            sampleRate
        );

        let offset = 0;
        for (const segment of segments) {
            const startSample = Math.floor(segment.start * sampleRate);
            const endSample = Math.floor(segment.end * sampleRate);
            const segmentLength = endSample - startSample;

            for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
                const sourceData = audioBuffer.getChannelData(channel);
                const targetData = newBuffer.getChannelData(channel);

                for (let i = 0; i < segmentLength; i++) {
                    targetData[offset + i] = sourceData[startSample + i];
                }
            }
            offset += segmentLength;
        }

        return newBuffer;
    }

    mergeSilentRegions(regions) {
        if (regions.length === 0) return [];

        // 按开始时间排序
        const sorted = regions.sort((a, b) => a.start - b.start);
        const merged = [sorted[0]];

        for (let i = 1; i < sorted.length; i++) {
            const last = merged[merged.length - 1];
            const current = sorted[i];

            if (current.start <= last.end) {
                // 合并重叠的区域
                last.end = Math.max(last.end, current.end);
            } else {
                merged.push(current);
            }
        }

        return merged;
    }
}

// 导出AudioProcessor类供其他模块使用
window.AudioProcessor = AudioProcessor;