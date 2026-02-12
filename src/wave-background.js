(function () {
    'use strict';

    class LivelyWaveBackground {
        constructor(canvas, options = {}) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d', { alpha: true });
            if (!this.ctx) {
                return;
            }

            this.options = Object.assign({
                duration: 10000,
                dprCap: 2,
            }, options);

            this._rafId = null;
            this._resizeHandler = () => this.resize();

            this.resize();
            window.addEventListener('resize', this._resizeHandler);
            this.animate = this.animate.bind(this);
            this._rafId = requestAnimationFrame(this.animate);
        }

        destroy() {
            if (this._rafId) {
                cancelAnimationFrame(this._rafId);
                this._rafId = null;
            }
            window.removeEventListener('resize', this._resizeHandler);
        }

        resize() {
            const rect = this.canvas.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, this.options.dprCap);
            const width = Math.max(1, Math.round(rect.width * dpr));
            const height = Math.max(1, Math.round(rect.height * dpr));

            if (this.canvas.width !== width || this.canvas.height !== height) {
                this.canvas.width = width;
                this.canvas.height = height;
            }

            this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            this.width = rect.width;
            this.height = rect.height;
        }

        drawWave(phase, colors, baseHeight, amplitude, frequency, fillMode = 'bottom') {
            const { ctx, width, height } = this;
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, colors[0]);
            gradient.addColorStop(1, colors[1]);

            ctx.beginPath();
            if (fillMode === 'top') {
                ctx.moveTo(0, 0);
                ctx.lineTo(0, baseHeight);
            } else {
                ctx.moveTo(0, height);
                ctx.lineTo(0, baseHeight);
            }

            const step = Math.max(3, Math.round(width / 400));
            for (let x = 0; x <= width; x += step) {
                const y = baseHeight + amplitude * Math.sin((x / width) * frequency * Math.PI * 2 + phase);
                ctx.lineTo(x, y);
            }

            if (fillMode === 'top') {
                ctx.lineTo(width, 0);
            } else {
                ctx.lineTo(width, height);
            }
            ctx.closePath();
            ctx.fillStyle = gradient;
            ctx.fill();
        }

        animate(timestamp) {
            if (!this.ctx) {
                return;
            }

            const { width, height } = this;
            if (!width || !height) {
                this.resize();
            }

            const phase = ((timestamp % this.options.duration) / this.options.duration) * Math.PI * 2;
            const h = this.height;

            this.ctx.clearRect(0, 0, this.width, this.height);

            const amp1 = Math.min(25, h * 0.06);
            const amp2 = Math.min(35, h * 0.08);
            const amp3 = Math.min(30, h * 0.07);
            const amp4 = Math.min(20, h * 0.05);

            // All bottom-filling waves. Top 30% stays clean dark (#1a1a1a)
            // so nav + label text remains readable on the dark background.
            this.drawWave(
                phase,
                ['rgba(75, 80, 85, 0.40)', 'rgba(40, 42, 45, 0.45)'],
                h * 0.30, amp1, 1.0, 'bottom'
            );
            this.drawWave(
                phase + Math.PI / 3,
                ['rgba(65, 70, 75, 0.35)', 'rgba(35, 37, 40, 0.40)'],
                h * 0.50, amp2, 1.3, 'bottom'
            );
            this.drawWave(
                phase + Math.PI,
                ['rgba(70, 75, 80, 0.30)', 'rgba(38, 40, 43, 0.38)'],
                h * 0.72, amp3, 1.6, 'bottom'
            );
            this.drawWave(
                phase + Math.PI * 1.5,
                ['rgba(55, 58, 62, 0.28)', 'rgba(30, 32, 35, 0.35)'],
                h * 0.93, amp4, 2.0, 'bottom'
            );

            this._rafId = requestAnimationFrame(this.animate);
        }
    }

    function initWaveBackgrounds() {
        document.querySelectorAll('canvas[data-wave-bg]').forEach((canvas) => {
            if (canvas.dataset.waveReady === 'true') {
                return;
            }
            canvas.dataset.waveReady = 'true';
            new LivelyWaveBackground(canvas);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWaveBackgrounds);
    } else {
        initWaveBackgrounds();
    }

    window.LivelyWaveBackground = LivelyWaveBackground;
})();
