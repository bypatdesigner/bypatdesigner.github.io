(() => {
'use strict';
    function initHeroMeshDriftShader() {
      const canvas = document.getElementById('meshDriftCanvas');
      const heroElem = document.getElementById('top');
      if (!canvas || !heroElem) return;

      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        console.warn('WebGL not supported for Mesh Drift Shader');
        return;
      }

      const vsSource = `
        attribute vec2 position;
        void main() {
          gl_Position = vec4(position, 0.0, 1.0);
        }
      `;

      const fsSource = `
        precision highp float;
        uniform vec2 u_resolution;
        uniform float u_time;
        uniform vec2 u_mouse;
        uniform vec3 u_color1; // Base dark space ink
        uniform vec3 u_color2; // Electric Violet
        uniform vec3 u_color3; // Cyan / Electric Azure
        uniform vec3 u_color4; // Luminous Glow Magenta

        // 2D Simplex Noise
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy) );
          vec2 x0 = v - i + dot(i, C.xx);
          vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod289(i);
          vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
          m = m*m ;
          m = m*m ;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }

        // Fractional Brownian Motion for Mesh Drift
        float fbm(vec2 p) {
          float f = 0.0;
          float w = 0.5;
          for (int i = 0; i < 4; i++) {
            f += w * snoise(p);
            p *= 2.04;
            w *= 0.5;
          }
          return f;
        }

        void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;
          float aspect = u_resolution.x / u_resolution.y;
          vec2 st = vec2(uv.x * aspect, uv.y);

          // Mouse displacement
          vec2 mouseNorm = u_mouse / u_resolution.xy;
          mouseNorm.x *= aspect;
          mouseNorm.y = 1.0 - mouseNorm.y;
          float distToMouse = length(st - mouseNorm);
          float mouseInfluence = smoothstep(0.55, 0.0, distToMouse) * 0.14;

          float t = u_time * 0.075;

          // Domain Warping Mesh Drift
          vec2 q = vec2(
            fbm(st * 1.25 + vec2(0.0, 0.0) + t * 0.32 + mouseInfluence),
            fbm(st * 1.25 + vec2(5.2, 1.3) + t * 0.26 - mouseInfluence)
          );

          vec2 r = vec2(
            fbm(st * 1.5 + 4.0 * q + vec2(1.7, 9.2) + t * 0.22),
            fbm(st * 1.5 + 4.0 * q + vec2(8.3, 2.8) + t * 0.16)
          );

          float f = fbm(st * 1.35 + 3.0 * r + t * 0.14);

          // 4-Color Mesh Palette Drift Blending (Electric Cyan, Cosmic Violet, Magenta Glow)
          vec3 col = mix(u_color1, u_color2, clamp(f * f * 3.2, 0.0, 1.0));
          col = mix(col, u_color3, clamp(length(q) * 1.15, 0.0, 1.0));
          col = mix(col, u_color4, clamp(pow(r.x * 1.3, 2.0), 0.0, 1.0));

          // Soft vignette effect
          float vignette = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
          col *= clamp(16.0 * vignette + 0.35, 0.0, 1.0);

          gl_FragColor = vec4(col, 0.95);
        }
      `;

      function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          console.error(gl.getShaderInfoLog(shader));
          gl.deleteShader(shader);
          return null;
        }
        return shader;
      }

      const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
      const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
      if (!vs || !fs) return;

      const program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        return;
      }

      gl.useProgram(program);

      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1,
        1, -1,
        -1, 1,
        -1, 1,
        1, -1,
        1, 1,
      ]), gl.STATIC_DRAW);

      const positionLoc = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(positionLoc);
      gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

      const resolutionLoc = gl.getUniformLocation(program, 'u_resolution');
      const timeLoc = gl.getUniformLocation(program, 'u_time');
      const mouseLoc = gl.getUniformLocation(program, 'u_mouse');
      const color1Loc = gl.getUniformLocation(program, 'u_color1');
      const color2Loc = gl.getUniformLocation(program, 'u_color2');
      const color3Loc = gl.getUniformLocation(program, 'u_color3');
      const color4Loc = gl.getUniformLocation(program, 'u_color4');

      // 4-color palette: Deep space ink, Electric violet, Cyan azure, Luminous magenta glow
      gl.uniform3f(color1Loc, 0.04, 0.03, 0.09);
      gl.uniform3f(color2Loc, 0.52, 0.22, 0.95);
      gl.uniform3f(color3Loc, 0.0, 0.78, 1.0);
      gl.uniform3f(color4Loc, 0.88, 0.45, 0.95);

      let currentMouseX = window.innerWidth * 0.5;
      let currentMouseY = window.innerHeight * 0.3;
      let targetMouseX = currentMouseX;
      let targetMouseY = currentMouseY;

      heroElem.addEventListener('mousemove', (e) => {
        const rect = heroElem.getBoundingClientRect();
        targetMouseX = e.clientX - rect.left;
        targetMouseY = e.clientY - rect.top;
      });

      function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const rect = heroElem.getBoundingClientRect();
        const width = rect.width || window.innerWidth;
        const height = rect.height || window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
      }
      window.addEventListener('resize', resize);
      resize();

      let startTime = performance.now();
      let heroVisible = true;
      new IntersectionObserver(entries => { heroVisible = entries[0].isIntersecting; }).observe(heroElem);
      function render(now) {
        if (!heroVisible || document.hidden) { requestAnimationFrame(render); return; }
        const paused = document.documentElement.classList.contains('motion-off');
        const elapsed = paused ? 0 : (now - startTime) * 0.001;

        currentMouseX += (targetMouseX - currentMouseX) * 0.05;
        currentMouseY += (targetMouseY - currentMouseY) * 0.05;

        gl.uniform1f(timeLoc, elapsed);
        const heroW = heroElem.clientWidth || window.innerWidth;
        const heroH = heroElem.clientHeight || window.innerHeight;
        gl.uniform2f(mouseLoc, currentMouseX * (canvas.width / heroW), currentMouseY * (canvas.height / heroH));

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(render);
      }
      requestAnimationFrame(render);
    }


initHeroMeshDriftShader();
})();
