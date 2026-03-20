/**
 * Hero WebGL Wave Background
 * Ported from RIVO_Media Three.js shader effect.
 * Runs as a fixed full-page background canvas.
 * Supports phase transitions per scroll section.
 */
(function () {
    'use strict';

    // Phase configurations per section
    const PHASES = [
        // 0: Hero
        { bg: '#05070a', lineColor: '#eaebeaff', lineOpacity: 0.45, waveAmplitude: 4.1, waveSpeed: 0.04, flowSpeedX: 3.5, flowSpeedY: 1.8 },
        // 1: Audience
        { bg: '#050810', lineColor: '#c0d4f8', lineOpacity: 0.38, waveAmplitude: 3.0, waveSpeed: 0.03, flowSpeedX: 2.5, flowSpeedY: 1.2 },
        // 2: Integration
        { bg: '#040e09', lineColor: '#a8e0c8', lineOpacity: 0.42, waveAmplitude: 5.2, waveSpeed: 0.05, flowSpeedX: 4.2, flowSpeedY: 2.0 },
        // 3: AI
        { bg: '#080410', lineColor: '#ccc0f0', lineOpacity: 0.40, waveAmplitude: 3.5, waveSpeed: 0.035, flowSpeedX: 3.0, flowSpeedY: 3.2 },
        // 4: Security
        { bg: '#030e07', lineColor: '#88dca8', lineOpacity: 0.40, waveAmplitude: 2.5, waveSpeed: 0.025, flowSpeedX: 2.2, flowSpeedY: 1.0 },
        // 5: Pricing
        { bg: '#060708', lineColor: '#c8d0e0', lineOpacity: 0.35, waveAmplitude: 3.2, waveSpeed: 0.03, flowSpeedX: 3.2, flowSpeedY: 1.5 },
    ];

    let _material = null;
    let _renderer = null;
    let _currentPhase = 0;
    let _targetPhase = 0;
    let _phaseProgress = 1.0;
    let _THREE = null;

    function hexToRGB(hex) {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        return [r, g, b];
    }

    function lerpColor(a, b, t) {
        return [
            a[0] + (b[0] - a[0]) * t,
            a[1] + (b[1] - a[1]) * t,
            a[2] + (b[2] - a[2]) * t,
        ];
    }

    function lerp(a, b, t) { return a + (b - a) * t; }

    // Smooth easing
    function ease(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

    // Called each frame to interpolate uniforms toward target phase
    function updatePhaseUniforms(delta) {
        if (!_material || !_renderer) return;
        if (_phaseProgress >= 1.0) return;

        _phaseProgress = Math.min(1.0, _phaseProgress + delta * 0.8); // ~1.25s transition
        const t = ease(_phaseProgress);

        const from = PHASES[_currentPhase];
        const to = PHASES[_targetPhase];

        const fromBg = hexToRGB(from.bg);
        const toBg = hexToRGB(to.bg);
        const bgColor = lerpColor(fromBg, toBg, t);
        _renderer.setClearColor(new _THREE.Color(bgColor[0], bgColor[1], bgColor[2]), 1);

        const fromLine = hexToRGB(from.lineColor);
        const toLine = hexToRGB(to.lineColor);
        const lineColor = lerpColor(fromLine, toLine, t);
        _material.uniforms.uColor.value.setRGB(lineColor[0], lineColor[1], lineColor[2]);

        _material.uniforms.uOpacity.value = lerp(from.lineOpacity, to.lineOpacity, t);
        _material.uniforms.uWaveAmplitude.value = lerp(from.waveAmplitude, to.waveAmplitude, t);
        _material.uniforms.uWaveSpeed.value = lerp(from.waveSpeed, to.waveSpeed, t);
        _material.uniforms.uFlowSpeedX.value = lerp(from.flowSpeedX, to.flowSpeedX, t);
        _material.uniforms.uFlowSpeedY.value = lerp(from.flowSpeedY, to.flowSpeedY, t);

        if (_phaseProgress >= 1.0) {
            _currentPhase = _targetPhase;
        }
    }

    // Public API: set phase index (0-5)
    window.rivoSetPhase = function (phaseIndex) {
        const idx = Math.max(0, Math.min(PHASES.length - 1, phaseIndex));
        if (idx === _targetPhase && _phaseProgress >= 1.0) return;
        _currentPhase = _targetPhase;
        _targetPhase = idx;
        _phaseProgress = 0.0;
    };

    function initHeroWave(canvas) {
        if (!window.THREE) return;
        _THREE = window.THREE;
        const THREE = _THREE;

        const config = PHASES[0];

        _renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
        _renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        _renderer.setClearColor(new THREE.Color(config.bg), 1);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        camera.position.set(0, -59.2, 60);
        camera.lookAt(0, 0, 0);

        const blankCanvas = document.createElement('canvas');
        blankCanvas.width = 4; blankCanvas.height = 4;
        const textTexture = new THREE.CanvasTexture(blankCanvas);
        const imageTexture = new THREE.CanvasTexture(blankCanvas);

        const mouse = new THREE.Vector2(-9999, -9999);
        const raycaster = new THREE.Raycaster();
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const targetMouse = new THREE.Vector3(-9999, -9999, 0);
        const currentMouse = new THREE.Vector3(-9999, -9999, 0);

        function updateMouse(clientX, clientY) {
            const rect = canvas.getBoundingClientRect();
            mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            raycaster.ray.intersectPlane(plane, targetMouse);
        }

        window.addEventListener('mousemove', (e) => updateMouse(e.clientX, e.clientY));
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) updateMouse(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });

        const vertexShader = `
uniform float uTime;
uniform vec3 uMouse;
uniform float uWaveAmplitude;
uniform float uWaveFrequency;
uniform float uWaveSpeed;
uniform float uUncertainty;
uniform float uFlowSpeedX;
uniform float uFlowSpeedY;
uniform float uFineDetailScale;
uniform float uFineDetailAmount;
uniform float uDensityContrast;
uniform float uTextForceDepth;
uniform float uImageForceDepth;
uniform float uForceRadius;
uniform float uForceStrength;
uniform sampler2D uTextTexture;
uniform sampler2D uImageTexture;
uniform float uGroupOffset;

attribute vec3 aOriginalPosition;
attribute vec2 aReference;

varying vec2 vUv;
varying float vZ;
varying float vTextMask;
varying float vImageMask;
varying float vRowFade;
varying float vGroupFactor;
varying float vDensity;

vec3 mod289v3(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289v2(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289v3(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289v2(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vUv = aReference;
  vec3 pos = aOriginalPosition;
  vGroupFactor = uGroupOffset;

  vRowFade = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);
  vRowFade *= smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);

  vec4 texColor = texture2D(uTextTexture, vUv);
  vTextMask = texColor.r;
  vec4 imgColor = texture2D(uImageTexture, vUv);
  vImageMask = imgColor.r;

  float timeOffset = uTime * uWaveSpeed;

  vec2 noiseInput1 = vec2(
    (pos.x + timeOffset * uFlowSpeedX) * uWaveFrequency,
    (pos.y + timeOffset * uFlowSpeedY) * uWaveFrequency
  );
  float elevation = snoise(noiseInput1) * uWaveAmplitude;

  float fineElevation = snoise(vec2(
    (pos.x + timeOffset * uFlowSpeedX * 1.5) * uWaveFrequency * uFineDetailScale,
    (pos.y - timeOffset * uFlowSpeedY * 1.6) * uWaveFrequency * uFineDetailScale
  )) * (uWaveAmplitude * uFineDetailAmount);

  pos.z += elevation + fineElevation;

  float yTwist = snoise(vec2(pos.x * uWaveFrequency * 2.0 + timeOffset * 2.0, pos.y * 0.1 - timeOffset)) * uUncertainty;
  pos.y += yTwist;

  float densityProxy = abs(elevation) / uWaveAmplitude + abs(yTwist) / max(uUncertainty, 0.001);
  vDensity = smoothstep(0.0, uDensityContrast, densityProxy);

  float dist = distance(aOriginalPosition.xy, uMouse.xy);
  if (dist < uForceRadius) {
    float force = (uForceRadius - dist) / uForceRadius;
    force = force * force * (3.0 - 2.0 * force);
    vec2 dir = normalize(aOriginalPosition.xy - uMouse.xy);
    pos.x += dir.x * force * uForceStrength;
    pos.y += dir.y * force * uForceStrength;
    pos.z -= force * (uForceStrength * 2.0);
  }

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  vZ = pos.z;
}
`;

        const fragmentShader = `
uniform vec3 uColor;
uniform float uTime;
uniform float uOpacity;
varying vec2 vUv;
varying float vZ;
varying float vTextMask;
varying float vImageMask;
varying float vRowFade;
varying float vGroupFactor;
varying float vDensity;

void main() {
  vec3 finalColor = uColor;
  float alpha = vRowFade;
  alpha *= mix(0.1, 1.0, vDensity);
  alpha *= uOpacity;
  gl_FragColor = vec4(finalColor, alpha);
}
`;

        const cols = 600;
        const width = 450;
        const height = 280;
        const rowsPerGroup = 400;

        const uniformBlock = {
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector3(-9999, -9999, 0) },
            uGroupOffset: { value: 0 },
            uWaveAmplitude: { value: config.waveAmplitude },
            uWaveFrequency: { value: 0.03 },
            uWaveSpeed: { value: config.waveSpeed },
            uUncertainty: { value: 3 },
            uFlowSpeedX: { value: config.flowSpeedX },
            uFlowSpeedY: { value: config.flowSpeedY },
            uFineDetailScale: { value: 3.0 },
            uFineDetailAmount: { value: 0.3 },
            uDensityContrast: { value: 1.5 },
            uTextForceDepth: { value: 0.0 },
            uImageForceDepth: { value: 0.0 },
            uForceRadius: { value: 20.0 },
            uForceStrength: { value: 0.0 },
            uTextTexture: { value: textTexture },
            uImageTexture: { value: imageTexture },
            uColor: { value: new THREE.Color(config.lineColor) },
            uOpacity: { value: config.lineOpacity },
        };

        _material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: uniformBlock,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        const totalVerts = rowsPerGroup * cols + (rowsPerGroup - 1);
        const positions = new Float32Array(totalVerts * 3);
        const originalPositions = new Float32Array(totalVerts * 3);
        const references = new Float32Array(totalVerts * 2);

        let idx = 0;
        for (let y = 0; y < rowsPerGroup; y++) {
            const yProgress = y / (rowsPerGroup - 1);
            const yProgressJittered = yProgress + (Math.random() - 0.5) * 0.05;
            const yOffset = (yProgressJittered - 0.5) * height;
            for (let x = 0; x < cols; x++) {
                const px = (x / (cols - 1) - 0.5) * width;
                const py = yOffset;
                positions[idx * 3] = px;
                positions[idx * 3 + 1] = py;
                positions[idx * 3 + 2] = 0;
                originalPositions[idx * 3] = px;
                originalPositions[idx * 3 + 1] = py;
                originalPositions[idx * 3 + 2] = 0;
                references[idx * 2] = x / (cols - 1);
                references[idx * 2 + 1] = yProgress;
                idx++;
            }
            if (y < rowsPerGroup - 1) {
                positions[idx * 3] = NaN; positions[idx * 3 + 1] = NaN; positions[idx * 3 + 2] = NaN;
                originalPositions[idx * 3] = NaN; originalPositions[idx * 3 + 1] = NaN; originalPositions[idx * 3 + 2] = NaN;
                references[idx * 2] = 0.5; references[idx * 2 + 1] = yProgress;
                idx++;
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('aOriginalPosition', new THREE.BufferAttribute(originalPositions, 3));
        geometry.setAttribute('aReference', new THREE.BufferAttribute(references, 2));
        geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1000);

        const line = new THREE.Line(geometry, _material);
        scene.add(line);

        function onResize() {
            const w = canvas.clientWidth;
            const h = canvas.clientHeight;
            _renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        }
        window.addEventListener('resize', onResize);
        onResize();

        const clock = new THREE.Clock();
        let lastTime = 0;
        function animate() {
            requestAnimationFrame(animate);
            const elapsed = clock.getElapsedTime();
            const delta = elapsed - lastTime;
            lastTime = elapsed;
            currentMouse.lerp(targetMouse, 0.08);
            _material.uniforms.uTime.value = elapsed;
            _material.uniforms.uMouse.value.copy(currentMouse);
            updatePhaseUniforms(delta);
            _renderer.render(scene, camera);
        }
        animate();
    }

    function init() {
        const canvas = document.getElementById('hero-webgl-canvas');
        if (!canvas) return;

        if (window.THREE) {
            initHeroWave(canvas);
        } else {
            const script = document.querySelector('script[src*="three"]');
            if (script) {
                script.addEventListener('load', () => initHeroWave(canvas));
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
