/**
 * Hero WebGL Wave Background
 * Ported from RIVO_Media Three.js shader effect.
 * Runs on the hero canvas as a contained background.
 */
(function () {
    'use strict';

    function initHeroWave(canvas) {
        if (!window.THREE) return;
        const THREE = window.THREE;

        const config = {
            backgroundColor: '#05070a',
            lineColor: '#eaebeaff',
            lineOpacity: 0.45,
            waveAmplitude: 4.1,
            waveFrequency: 0.03,
            waveSpeed: 0.10,
            uncertainty: 3,
            flowSpeedX: 10.0,
            flowSpeedY: 5.0,
            fineDetailScale: 3.0,
            fineDetailAmount: 0.3,
            densityContrast: 1.5,
            textForceDepth: 0.0,
            imageForceDepth: 0.0,
            forceFieldStrength: 0.0,
            forceFieldRadius: 20.0,
            rowsPerGroup: 400,
        };

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(new THREE.Color(config.backgroundColor), 1);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        camera.position.set(0, -59.2, 60);
        camera.lookAt(0, 0, 0);

        // Blank textures (no text/image interaction in hero mode)
        const blankCanvas = document.createElement('canvas');
        blankCanvas.width = 4; blankCanvas.height = 4;
        const textTexture = new THREE.CanvasTexture(blankCanvas);
        const imageTexture = new THREE.CanvasTexture(blankCanvas);

        // Smooth mouse tracking
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

  // Mouse repulsion
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

        const uniformBlock = {
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector3(-9999, -9999, 0) },
            uGroupOffset: { value: 0 },
            uWaveAmplitude: { value: config.waveAmplitude },
            uWaveFrequency: { value: config.waveFrequency },
            uWaveSpeed: { value: config.waveSpeed },
            uUncertainty: { value: config.uncertainty },
            uFlowSpeedX: { value: config.flowSpeedX },
            uFlowSpeedY: { value: config.flowSpeedY },
            uFineDetailScale: { value: config.fineDetailScale },
            uFineDetailAmount: { value: config.fineDetailAmount },
            uDensityContrast: { value: config.densityContrast },
            uTextForceDepth: { value: config.textForceDepth },
            uImageForceDepth: { value: config.imageForceDepth },
            uForceRadius: { value: config.forceFieldRadius },
            uForceStrength: { value: config.forceFieldStrength },
            uTextTexture: { value: textTexture },
            uImageTexture: { value: imageTexture },
            uColor: { value: new THREE.Color(config.lineColor) },
            uOpacity: { value: config.lineOpacity },
        };

        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: uniformBlock,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        const totalVerts = config.rowsPerGroup * cols + (config.rowsPerGroup - 1);
        const positions = new Float32Array(totalVerts * 3);
        const originalPositions = new Float32Array(totalVerts * 3);
        const references = new Float32Array(totalVerts * 2);

        let idx = 0;
        for (let y = 0; y < config.rowsPerGroup; y++) {
            const yProgress = y / (config.rowsPerGroup - 1);
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
            if (y < config.rowsPerGroup - 1) {
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

        const line = new THREE.Line(geometry, material);
        scene.add(line);

        // Resize handler
        function onResize() {
            const w = canvas.clientWidth;
            const h = canvas.clientHeight;
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        }
        window.addEventListener('resize', onResize);
        onResize();

        // Animation
        const clock = new THREE.Clock();
        function animate() {
            requestAnimationFrame(animate);
            const elapsed = clock.getElapsedTime();
            currentMouse.lerp(targetMouse, 0.08);
            material.uniforms.uTime.value = elapsed;
            material.uniforms.uMouse.value.copy(currentMouse);
            renderer.render(scene, camera);
        }
        animate();
    }

    function init() {
        const canvas = document.getElementById('hero-webgl-canvas');
        if (!canvas) return;

        if (window.THREE) {
            initHeroWave(canvas);
        } else {
            // Wait for Three.js to load
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
