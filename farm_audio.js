/**
 * CloudAgri Studio - Farm Audio & Soundscape Synthesizer
 * Uses Web Audio API to synthesize ambient wind, rain drops,
 * solenoid valve clicks, and radar telemetry telemetry pings.
 */

class FarmAudioSynthesizer {
    constructor() {
        this.audioCtx = null;
        this.isMuted = true;
        this.ambientGain = null;
        this.noiseNode = null;
    }

    initContext() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
        }
    }

    toggleMute() {
        this.initContext();
        this.isMuted = !this.isMuted;
        if (!this.isMuted) {
            this.startBreeze();
        } else {
            this.stopBreeze();
        }
        return !this.isMuted;
    }

    startBreeze() {
        if (this.isMuted || !this.audioCtx) return;
        try {
            // Create white noise buffer
            const bufferSize = this.audioCtx.sampleRate * 2;
            const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            this.noiseNode = this.audioCtx.createBufferSource();
            this.noiseNode.buffer = buffer;
            this.noiseNode.loop = true;

            // Lowpass filter to simulate gentle wind rustling through crops
            const filter = this.audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(320, this.audioCtx.currentTime);

            this.ambientGain = this.audioCtx.createGain();
            this.ambientGain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);

            this.noiseNode.connect(filter);
            filter.connect(this.ambientGain);
            this.ambientGain.connect(this.audioCtx.destination);
            this.noiseNode.start();
        } catch (e) {
            console.warn("Audio synthesis warning:", e);
        }
    }

    stopBreeze() {
        if (this.noiseNode) {
            try {
                this.noiseNode.stop();
                this.noiseNode.disconnect();
            } catch (e) {}
            this.noiseNode = null;
        }
    }

    playSonarPing() {
        if (this.isMuted) return;
        this.initContext();
        try {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, this.audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1760, this.audioCtx.currentTime + 0.15);

            gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.35);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.35);
        } catch (e) {}
    }

    playValveClick() {
        if (this.isMuted) return;
        this.initContext();
        try {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(140, this.audioCtx.currentTime);

            gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.08);
        } catch (e) {}
    }
}

window.farmAudio = new FarmAudioSynthesizer();
