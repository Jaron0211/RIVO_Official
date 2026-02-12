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

        getWaveColors() {
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            const isDark = document.documentElement.classList.contains('dark') || prefersDark;

            if (isDark) {
                return {
                    colors1: ['#202020', '#000000'],
                    colors2: ['#303030', '#101010'],
                    colors3: ['#404040', '#202020'],
                };
            }

            return {
                colors1: ['rgba(156, 163, 175, 0.55)', 'rgba(255, 255, 255, 0.96)'],
                colors2: ['rgba(209, 213, 219, 0.50)', 'rgba(255, 255, 255, 0.92)'],
                colors3: ['rgba(229, 231, 235, 0.46)', 'rgba(255, 255, 255, 0.88)'],
            };
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
            const offset = height * 0.18;
            for (let x = 0; x <= width; x += step) {
                const y = baseHeight + amplitude * Math.sin((x / width) * frequency * Math.PI * 2 + phase);
                ctx.lineTo(x, y - offset);
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
            const { colors1, colors2, colors3 } = this.getWaveColors();

            this.ctx.clearRect(0, 0, this.width, this.height);

            const amp0 = Math.min(20, this.height * 0.05);
            const amp1 = Math.min(30, this.height * 0.08);
            const amp2 = Math.min(50, this.height * 0.12);
            const amp3 = Math.min(40, this.height * 0.10);

            // Background wave: subtle full-coverage layer behind hero content.
            const bgColors = ['rgba(180, 190, 200, 0.18)', 'rgba(220, 225, 230, 0.22)'];
            this.drawWave(phase * 0.6, bgColors, this.height * 0.12, amp0, 0.7, 'bottom');

            // Upper wave band: makes label/intro area react to wave motion.
            this.drawWave(phase, colors1, this.height * 0.40, amp1, 1.0, 'bottom');
            this.drawWave(phase + Math.PI / 2, colors2, this.height * 0.55, amp2, 1.5, 'bottom');
            this.drawWave(phase + Math.PI, colors3, this.height * 0.8, amp3, 2.0, 'bottom');

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
