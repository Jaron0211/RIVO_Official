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

            // Top-filling wave: covers upper hero with a subtle lighter layer.
            this.drawWave(
                phase * 0.7,
                ['rgba(60, 65, 70, 0.55)', 'rgba(40, 42, 45, 0.30)'],
                h * 0.28, amp1, 1.2, 'top'
            );

            // Bottom-filling waves: cover middle and lower sections.
            this.drawWave(
                phase,
                ['rgba(55, 58, 62, 0.45)', 'rgba(30, 32, 35, 0.50)'],
                h * 0.38, amp2, 1.0, 'bottom'
            );
            this.drawWave(
                phase + Math.PI / 2,
                ['rgba(65, 68, 72, 0.40)', 'rgba(35, 37, 40, 0.45)'],
                h * 0.60, amp3, 1.5, 'bottom'
            );
            this.drawWave(
                phase + Math.PI,
                ['rgba(50, 53, 58, 0.35)', 'rgba(25, 27, 30, 0.40)'],
                h * 0.82, amp4, 2.0, 'bottom'
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
