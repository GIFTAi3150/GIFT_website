/*
 * Evolve hero — vanilla WebGL 1, no libraries, video, font downloads or textures.
 * A blue-tinted CSS drift is the lightweight fallback. See README.md for embedding.
 */
(() => {
  'use strict';

  const VERTEX = `
    attribute vec2 aPosition;
    void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
  `;

  const FRAGMENT = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
      precision highp float;
    #else
      precision mediump float;
    #endif

    uniform vec2 uResolution;
    uniform vec2 uCover;
    uniform float uPhase;
    uniform float uScroll;
    uniform float uGlyphAA;

    float hash21(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * 0.1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
                 mix(hash21(i + vec2(0.0, 1.0)), hash21(i + 1.0), f.x), f.y);
    }

    float bell(float p) { return exp(-p * p); }

    // An outline numeral, drawn mathematically instead of loading a typeface.
    float numeral(vec2 p, float seed) {
      p -= vec2(0.5, 0.5);
      vec2 q = abs(p) - vec2(0.14, 0.24);
      float roundBox = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - 0.065;
      float ring = 1.0 - smoothstep(0.018, 0.018 + uGlyphAA, abs(roundBox));
      float crossbar = (1.0 - smoothstep(0.016, 0.016 + uGlyphAA, abs(p.y)))
                       * (1.0 - smoothstep(0.14, 0.21, abs(p.x)));
      float one = (1.0 - smoothstep(0.02, 0.02 + uGlyphAA, abs(p.x)))
                  * (1.0 - smoothstep(0.25, 0.33, abs(p.y)));
      float eight = max(ring, crossbar);
      return mix(mix(ring, eight, step(0.50, seed)), one, step(0.92, seed));
    }

    float digitalRain(vec2 uv, float phase) {
      float column = floor(uv.x * 137.0);
      // Stable, tiled streams: no synchronized, time-stepped rehash of the sky.
      float columnSeed = hash21(vec2(column, 17.0));
      float speed = 1.0 + step(0.68, columnSeed);
      vec2 grid = vec2(uv.x * 137.0, uv.y * 44.0 + uScroll * speed + columnSeed * 64.0);
      vec2 cell = floor(grid);
      cell.y = mod(cell.y, 64.0);
      vec2 local = fract(grid);
      float group = hash21(floor(cell / vec2(4.0, 3.0)));
      float seed = hash21(cell);
      float present = step(0.29, seed) * smoothstep(0.12, 0.60, group);
      float fade = 1.0 - smoothstep(0.34, 0.51, uv.y);
      float flicker = 0.90 + 0.10 * sin(phase * 3.0 + seed * 24.0);
      return numeral(local, seed) * present * fade * flicker;
    }

    void main() {
      vec2 screen = gl_FragCoord.xy / uResolution;
      screen.y = 1.0 - screen.y;
      // The same center crop as object-fit: cover on a 1920 × 1080 video.
      vec2 uv = (screen - 0.5) * uCover + 0.5;
      float x = uv.x;
      float y = uv.y;
      float phase = uPhase;

      // Royal-blue atmosphere, ice-blue light and a deeper blue horizon.
      vec3 sky = mix(vec3(0.11, 0.23, 0.51), vec3(0.15, 0.31, 0.68), y);
      float cloud = bell((x - 0.50 - 0.018 * sin(phase)) / 0.28)
                    * bell((y - 0.20) / 0.37);
      sky = mix(sky, vec3(0.67, 0.80, 1.0), cloud * 0.90);
      float mist = noise(vec2(x * 8.0 + 0.28 * sin(phase), y * 5.0 + 0.24 * cos(phase)));
      sky += (mist - 0.5) * 0.085;
      float horizonY = 0.392 + 0.006 * sin(x * 9.0 - phase * 2.0);
      sky = mix(sky, vec3(0.075, 0.22, 0.69), bell((y - horizonY) / 0.025) * 0.75);

      // Coherent waves travel in one direction rather than rocking back and forth.
      // Integer phase harmonics keep both position AND velocity continuous at the wrap.
      float center = 0.50 + 0.024 * sin(phase);
      float mound = (x - center) / (0.40 + 0.009 * sin(phase * 2.0 + 0.3));
      float height = 0.215 + 0.010 * sin(phase * 2.0 - 0.5);
      float rearY = 0.545 - height * exp(-pow(abs(mound), 3.2));
      rearY += 0.018 * sin(x * 8.0 - phase * 5.0 + 0.1)
             + 0.007 * sin(x * 15.0 - phase * 3.0 + 1.6);
      float rearD = y - rearY;
      float middle = bell((x - 0.49) / 0.26);
      vec3 rearLight = mix(vec3(0.16, 0.43, 1.0), vec3(0.255, 0.412, 0.882), middle);

      // Blue bloom follows the moving silhouette.
      float halo = bell(rearD / 0.095);
      sky = mix(sky, vec3(0.19, 0.38, 0.93), halo * 0.38);
      sky += rearLight * bell((rearD + 0.01) / 0.025) * 0.14;
      float rain = digitalRain(uv, phase);
      sky += vec3(0.66, 0.82, 1.0) * rain * 0.27;

      vec3 rear = vec3(0.006, 0.012, 0.027);
      rear += rearLight * exp(-max(rearD, 0.0) / 0.048) * 0.70;
      rear += vec3(0.04, 0.11, 0.34) * exp(-max(rearD, 0.0) / 0.14) * (1.0 - middle) * 0.45;
      vec3 color = mix(sky, rear, smoothstep(-0.012, 0.012, rearD));

      // Foreground dune sweeps down through the center, leaving the lower area black.
      float waveX = x + 0.020 * sin(phase + 0.9);
      float arch = 0.5 - 0.5 * cos(waveX * 6.283185);
      float frontY = 0.571 + 0.151 * arch;
      frontY += 0.022 * sin(x * 6.0 - phase * 4.0 + 0.75)
              + 0.005 * sin(x * 13.0 - phase * 3.0 + 2.2);
      float frontD = y - frontY;
      vec3 frontLight = mix(vec3(0.08, 0.26, 0.83), vec3(0.13, 0.44, 1.0), smoothstep(0.48, 1.0, x));
      frontLight = mix(frontLight, vec3(0.255, 0.412, 0.882), bell((x - 0.52) / 0.24) * 0.75);
      vec3 front = vec3(0.001, 0.002, 0.007);
      front += frontLight * exp(-max(frontD, 0.0) / 0.036) * 0.70;
      color = mix(color, front, smoothstep(-0.003, 0.010, frontD));
      color += frontLight * bell(frontD / 0.009) * 0.15;

      // Fine, stable film grain and a little brighter dust around the lit crests.
      // Grain is spatial, never randomized on every animation frame.
      float grain = hash21(floor(uv * vec2(1920.0, 1080.0))) - 0.5;
      float light = max(max(color.r, color.g), color.b);
      color += grain * (0.055 * smoothstep(0.02, 0.22, light));
      float dust = hash21(floor(uv * vec2(1600.0, 900.0)) + 31.0);
      float dustMask = bell(rearD / 0.065) * (1.0 - smoothstep(-0.004, 0.012, frontD))
                       + bell(frontD / 0.05);
      color += (dust - 0.50) * dustMask * 0.10;
      color *= 1.0 - smoothstep(0.82, 1.0, y);
      gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
    }
  `;

  // Smaller buffers offset the increase from 30 to 60 frames per second.
  // Limits are independent of a phone's large devicePixelRatio.
  const PROFILES = [
    { pixels: 600000, dpr: 1.0 },
    { pixels: 360000, dpr: 1.0 },
    { pixels: 200000, dpr: 0.8 },
    { pixels: 120000, dpr: 0.6 }
  ];
  const MOTION_PERIOD = 48;
  const mounted = new WeakMap();

  class EvolveBackground {
    constructor(host, options = {}) {
      this.host = host;
      this.options = Object.assign({ motion: true, speed: 1, fps: 60 }, options);
      this.options.fps = Math.max(15, Math.min(60, Number(this.options.fps) || 60));
      this.options.speed = Math.max(0.1, Math.min(3, Number(this.options.speed) || 1));
      this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      const compact = window.matchMedia('(max-width: 720px)').matches;
      const modest = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
        || (navigator.deviceMemory && navigator.deviceMemory <= 4);
      this.quality = modest ? 2 : compact ? 1 : 0;
      this.inView = true;
      this.pageActive = true;
      this.manualPause = false;
      this.destroyed = false;
      this.failed = false;
      this.contextLost = false;
      this.running = false;
      this.elapsed = 0;
      this.frameCount = 0;
      this.slowWindows = 0;
      this.resizePending = true;
      this.cleanups = [];
      this.frame = this.frame.bind(this);
      this.sync = this.sync.bind(this);
      this.listen(document, 'visibilitychange', this.sync);
      this.listen(window, 'pagehide', () => { this.pageActive = false; this.sync(); });
      this.listen(window, 'pageshow', () => { this.pageActive = true; this.sync(); });
      this.listen(window, 'resize', () => { this.resizePending = true; }, { passive: true });
      this.listen(this.connection, 'change', this.sync);
      if (this.motionQuery.addEventListener) this.listen(this.motionQuery, 'change', this.sync);
      else if (this.motionQuery.addListener) {
        this.motionQuery.addListener(this.sync);
        this.cleanups.push(() => this.motionQuery.removeListener(this.sync));
      }
      if ('ResizeObserver' in window) {
        this.resizeObserver = new ResizeObserver(() => { this.resizePending = true; this.sync(); });
        this.resizeObserver.observe(host);
      }
      if ('IntersectionObserver' in window) {
        this.intersectionObserver = new IntersectionObserver(entries => {
          this.inView = entries[0].isIntersecting;
          this.sync();
        }, { threshold: 0 });
        this.intersectionObserver.observe(host);
      }
      this.sync();
    }

    listen(target, type, fn, options) {
      if (!target || !target.addEventListener) return;
      target.addEventListener(type, fn, options);
      this.cleanups.push(() => target.removeEventListener(type, fn, options));
    }

    staticPreferred() {
      return !this.options.motion || this.motionQuery.matches || !!(this.connection && this.connection.saveData);
    }

    sync() {
      if (this.destroyed) return;
      const still = this.staticPreferred();
      const motionAllowed = !still && !this.manualPause && this.inView && this.pageActive && !document.hidden;
      const useFallback = this.failed || this.contextLost || !this.gl;
      if (motionAllowed && useFallback) this.host.classList.add('fallback-moving');
      else this.host.classList.remove('fallback-moving');
      if (still || this.failed || this.contextLost) this.host.classList.remove('is-live');
      const allowed = motionAllowed && !this.failed && !this.contextLost;
      if (!allowed) { this.stop(); return; }
      if (!this.gl) {
        if (this.startTimer == null) {
          // Let the page and small fallback paint before compiling the shader.
          this.startTimer = window.setTimeout(() => {
            this.startTimer = null;
            if (!this.destroyed) this.initialize();
          }, 100);
        }
        return;
      }
      if (!this.running) {
        this.running = true;
        this.lastFrame = 0;
        this.lastDraw = 0;
        this.sampleStart = 0;
        this.samples = 0;
        this.slowSamples = 0;
        this.severeSamples = 0;
        this.raf = requestAnimationFrame(this.frame);
      }
    }

    initialize() {
      if (this.staticPreferred() || this.manualPause || !this.inView || !this.pageActive || document.hidden) return;
      try {
        this.canvas = document.createElement('canvas');
        this.canvas.setAttribute('aria-hidden', 'true');
        const settings = {
          alpha: false, antialias: false, depth: false, stencil: false,
          preserveDrawingBuffer: false, powerPreference: 'low-power',
          failIfMajorPerformanceCaveat: true
        };
        this.gl = this.canvas.getContext('webgl', settings)
          || this.canvas.getContext('experimental-webgl', settings);
        if (!this.gl) { this.fallback('webgl-unavailable'); return; }
        this.listen(this.canvas, 'webglcontextlost', event => {
          event.preventDefault();
          this.contextLost = true;
          this.sync();
        });
        this.listen(this.canvas, 'webglcontextrestored', () => {
          if (this.destroyed || this.failed) return;
          this.contextLost = false;
          try { this.createResources(); this.resizePending = true; this.sync(); }
          catch (_) { this.fallback('context-restore-failed'); }
        });
        this.createResources();
        this.host.appendChild(this.canvas);
        this.sync();
      } catch (_) { this.fallback('initialization-failed'); }
    }

    createResources() {
      const gl = this.gl;
      const shaders = [];
      let program;
      try {
        for (const [type, source] of [[gl.VERTEX_SHADER, VERTEX], [gl.FRAGMENT_SHADER, FRAGMENT]]) {
          const shader = gl.createShader(type);
          if (!shader) throw new Error('Shader allocation failed');
          shaders.push(shader);
          gl.shaderSource(shader, source);
          gl.compileShader(shader);
          if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('Shader compilation failed');
        }
        program = gl.createProgram();
        if (!program) throw new Error('Program allocation failed');
        shaders.forEach(shader => gl.attachShader(program, shader));
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Program linking failed');
      } catch (error) {
        if (program) gl.deleteProgram(program);
        throw error;
      } finally { shaders.forEach(shader => gl.deleteShader(shader)); }
      this.program = program;
      gl.useProgram(program);
      this.buffer = gl.createBuffer();
      if (!this.buffer) throw new Error('Buffer allocation failed');
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, 'aPosition');
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      this.uniforms = {};
      for (const key of ['uResolution', 'uCover', 'uPhase', 'uScroll', 'uGlyphAA']) {
        this.uniforms[key] = gl.getUniformLocation(program, key);
      }
      this.maxSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);
      gl.disable(gl.DITHER);
    }

    resize() {
      const rect = this.host.getBoundingClientRect();
      if (!rect.width || !rect.height) return false;
      const profile = PROFILES[this.quality];
      const ratio = Math.min(window.devicePixelRatio || 1, profile.dpr,
        Math.sqrt(profile.pixels / (rect.width * rect.height)),
        this.maxSize / rect.width, this.maxSize / rect.height);
      const width = Math.max(1, Math.floor(rect.width * ratio));
      const height = Math.max(1, Math.floor(rect.height * ratio));
      this.canvas.width = width;
      this.canvas.height = height;
      this.gl.viewport(0, 0, width, height);
      this.gl.uniform2f(this.uniforms.uResolution, width, height);
      const aspect = rect.width / rect.height;
      const coverX = Math.min(1, aspect / (16 / 9));
      const coverY = Math.min(1, (16 / 9) / aspect);
      this.gl.uniform2f(this.uniforms.uCover, coverX, coverY);
      this.gl.uniform1f(this.uniforms.uGlyphAA, Math.min(0.18, Math.max(0.035, 55 * coverX / width)));
      this.resizePending = false;
      return true;
    }

    frame(now) {
      if (!this.running || this.destroyed) return;
      const delta = this.lastFrame ? now - this.lastFrame : 0;
      this.lastFrame = now;
      // Advance by actual callback time, independent of how many frames were drawn.
      // lastFrame is reset on resume so time spent hidden/paused is excluded.
      this.elapsed += delta / 1000;
      if (delta > 0) this.monitor(now, delta);
      if (!this.running) return;
      const interval = 1000 / this.options.fps;
      if (!this.lastDraw || now - this.lastDraw >= interval - 2.0) {
        if (this.resizePending && !this.resize()) { this.stop(); return; }
        // Advance the deadline even when a callback arrives fractionally early.
        // This avoids accidentally drawing on consecutive 60 Hz callbacks.
        this.lastDraw = this.lastDraw && now - this.lastDraw < interval * 2
          ? this.lastDraw + interval : now;
        const motionTime = this.elapsed * this.options.speed;
        // Bounded phases avoid loss of float precision in long-running sessions.
        this.gl.uniform1f(this.uniforms.uPhase, (motionTime % MOTION_PERIOD) / MOTION_PERIOD * Math.PI * 2);
        this.gl.uniform1f(this.uniforms.uScroll, (motionTime * 0.40) % 64);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
        if (!this.host.classList.contains('is-live')) this.host.classList.add('is-live');
        this.frameCount++;
      }
      this.raf = requestAnimationFrame(this.frame);
    }

    monitor(now, delta) {
      if (!this.sampleStart) this.sampleStart = now;
      this.samples++;
      const targetInterval = 1000 / this.options.fps;
      if (delta > targetInterval * 1.45) this.slowSamples++;
      if (delta > Math.max(46, targetInterval * 2.2)) this.severeSamples++;
      if (now - this.sampleStart < 2600) return;
      // rAF cadence is a responsiveness signal, not a hardware GPU benchmark.
      if (this.samples > 0 && this.slowSamples / this.samples > 0.22) {
        if (this.quality < PROFILES.length - 1) {
          this.quality++;
          this.resizePending = true;
        } else if (this.severeSamples / this.samples > 0.22) {
          if (++this.slowWindows >= 2) this.fallback('sustained-slow-frames');
        } else this.slowWindows = 0;
      } else this.slowWindows = 0;
      this.sampleStart = now;
      this.samples = 0;
      this.slowSamples = 0;
      this.severeSamples = 0;
    }

    stop() {
      this.running = false;
      if (this.raf) cancelAnimationFrame(this.raf);
      this.raf = 0;
      if (this.startTimer != null) clearTimeout(this.startTimer);
      this.startTimer = null;
    }

    fallback(reason) {
      this.failed = true;
      this.fallbackReason = reason;
      this.host.classList.remove('is-live');
      this.stop();
      if (this.gl && !this.contextLost) {
        if (this.buffer) this.gl.deleteBuffer(this.buffer);
        if (this.program) this.gl.deleteProgram(this.program);
      }
      this.buffer = null;
      this.program = null;
      this.sync();
    }

    pause() { this.manualPause = true; this.sync(); }
    resume() { this.manualPause = false; this.sync(); }
    getDiagnostics() {
      const cssMotion = this.host.classList.contains('fallback-moving');
      return {
        renderer: cssMotion ? 'css' : this.failed || !this.gl || this.staticPreferred() || this.contextLost ? 'still' : 'webgl',
        running: this.running || cssMotion, quality: this.quality,
        resolution: this.canvas ? [this.canvas.width, this.canvas.height] : [0, 0],
        frameCap: this.options.fps, framesDrawn: this.frameCount,
        fallbackReason: this.fallbackReason || null
      };
    }

    destroy() {
      if (this.destroyed) return;
      this.stop();
      this.destroyed = true;
      this.cleanups.forEach(cleanup => cleanup());
      if (this.intersectionObserver) this.intersectionObserver.disconnect();
      if (this.resizeObserver) this.resizeObserver.disconnect();
      if (this.gl && !this.contextLost) {
        if (this.buffer) this.gl.deleteBuffer(this.buffer);
        if (this.program) this.gl.deleteProgram(this.program);
        const loseContext = this.gl.getExtension('WEBGL_lose_context');
        if (loseContext) loseContext.loseContext();
      }
      if (this.canvas && this.canvas.parentNode) this.canvas.parentNode.removeChild(this.canvas);
      this.host.classList.remove('is-live');
      this.host.classList.remove('fallback-moving');
      mounted.delete(this.host);
      this.gl = null;
      this.canvas = null;
    }
  }

  window.EvolveBackground = {
    mount(host, options) {
      if (typeof host === 'string') host = document.querySelector(host);
      if (!host || host.nodeType !== 1) throw new TypeError('A background container is required');
      if (!mounted.has(host)) mounted.set(host, new EvolveBackground(host, options));
      return mounted.get(host);
    }
  };

  document.querySelectorAll('[data-evolve-background]').forEach(host => {
    window.EvolveBackground.mount(host, { motion: host.getAttribute('data-motion') !== 'off' });
  });
})();
