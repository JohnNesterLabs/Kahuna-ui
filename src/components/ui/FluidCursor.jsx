
import React, { useEffect, useRef } from 'react';

const FluidCursor = ({ className = '', style = {} }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('FluidCursor: Canvas not found');
      return;
    }
    
    console.log('FluidCursor: Initializing fluid effect');

    let config = {
      SIM_RESOLUTION: 128,
      DYE_RESOLUTION: 1440,
      CAPTURE_RESOLUTION: 512,
      DENSITY_DISSIPATION: 3.5,
      VELOCITY_DISSIPATION: 2,
      PRESSURE: 0.1,
      PRESSURE_ITERATIONS: 20,
      CURL: 3,
      SPLAT_RADIUS: 0.2,
      SPLAT_FORCE: 6000,
      SHADING: true,
      COLOR_UPDATE_SPEED: 10,
      PAUSED: false,
      BACK_COLOR: { r: 0, g: 0, b: 0 },
      TRANSPARENT: true,
    };

    function pointerPrototype() {
      this.id = -1;
      this.texcoordX = 0;
      this.texcoordY = 0;
      this.prevTexcoordX = 0;
      this.prevTexcoordY = 0;
      this.deltaX = 0;
      this.deltaY = 0;
      this.down = false;
      this.moved = false;
      this.color = [30, 0, 300];
    }

    let pointers = [];
    pointers.push(new pointerPrototype());

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.floor(rect.width * (window.devicePixelRatio || 1));
      const height = Math.floor(rect.height * (window.devicePixelRatio || 1));
      
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        return true;
      }
      return false;
    };

    const getWebGLContext = (canvas) => {
      const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };

      let gl = canvas.getContext('webgl2', params);
      const isWebGL2 = !!gl;
      if (!isWebGL2)
        gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);

      if (!gl) {
        console.error('WebGL not supported');
        return null;
      }

      let halfFloat;
      let supportLinearFiltering;
      if (isWebGL2) {
        gl.getExtension('EXT_color_buffer_float');
        supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
      } else {
        halfFloat = gl.getExtension('OES_texture_half_float');
        supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
      }

      gl.clearColor(0.0, 0.0, 0.0, 1.0);

      const halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : halfFloat.HALF_FLOAT_OES;
      let formatRGBA, formatRG, formatR;

      const getSupportedFormat = (gl, internalFormat, format, type) => {
        if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
          switch (internalFormat) {
            case gl.R16F:
              return getSupportedFormat(gl, gl.RG16F, gl.RG, type);
            case gl.RG16F:
              return getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
            default:
              return null;
          }
        }
        return { internalFormat, format };
      };

      const supportRenderTextureFormat = (gl, internalFormat, format, type) => {
        let texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);

        let fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

        let status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        return status === gl.FRAMEBUFFER_COMPLETE;
      };

      if (isWebGL2) {
        formatRGBA = getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, halfFloatTexType);
        formatRG = getSupportedFormat(gl, gl.RG16F, gl.RG, halfFloatTexType);
        formatR = getSupportedFormat(gl, gl.R16F, gl.RED, halfFloatTexType);
      } else {
        formatRGBA = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
        formatRG = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
        formatR = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
      }

      return {
        gl,
        ext: {
          formatRGBA,
          formatRG,
          formatR,
          halfFloatTexType,
          supportLinearFiltering
        }
      };
    };

    const initFluid = () => {
      resizeCanvas();

      const contextResult = getWebGLContext(canvas);
      if (!contextResult) {
        console.error('FluidCursor: WebGL context creation failed');
        return;
      }

      console.log('FluidCursor: WebGL context created successfully');
      const { gl, ext } = contextResult;

      if (!ext.supportLinearFiltering) {
        config.DYE_RESOLUTION = 512;
        config.SHADING = false;
      }

      // Shader compilation functions
      const compileShader = (type, source, keywords) => {
        if (keywords) {
          let keywordsString = '';
          keywords.forEach(keyword => {
            keywordsString += '#define ' + keyword + '\n';
          });
          source = keywordsString + source;
        }

        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
        }

        return shader;
      };

      const createProgram = (vertexShader, fragmentShader) => {
        let program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          console.error('Program linking error:', gl.getProgramInfoLog(program));
        }

        return program;
      };

      const getUniforms = (program) => {
        let uniforms = [];
        let uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < uniformCount; i++) {
          let uniformName = gl.getActiveUniform(program, i).name;
          uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
        }
        return uniforms;
      };

      class Program {
        constructor(vertexShader, fragmentShader) {
          this.uniforms = {};
          this.program = createProgram(vertexShader, fragmentShader);
          this.uniforms = getUniforms(this.program);
        }

        bind() {
          gl.useProgram(this.program);
        }
      }

      class Material {
        constructor(vertexShader, fragmentShaderSource) {
          this.vertexShader = vertexShader;
          this.fragmentShaderSource = fragmentShaderSource;
          this.programs = [];
          this.activeProgram = null;
          this.uniforms = [];
        }

        setKeywords(keywords) {
          let hash = 0;
          for (let i = 0; i < keywords.length; i++) {
            hash += this.hashCode(keywords[i]);
          }

          let program = this.programs[hash];
          if (program == null) {
            let fragmentShader = compileShader(gl.FRAGMENT_SHADER, this.fragmentShaderSource, keywords);
            program = createProgram(this.vertexShader, fragmentShader);
            this.programs[hash] = program;
          }

          if (program === this.activeProgram) return;

          this.uniforms = getUniforms(program);
          this.activeProgram = program;
        }

        hashCode(s) {
          if (s.length === 0) return 0;
          let hash = 0;
          for (let i = 0; i < s.length; i++) {
            hash = (hash << 5) - hash + s.charCodeAt(i);
            hash |= 0;
          }
          return hash;
        }

        bind() {
          gl.useProgram(this.activeProgram);
        }
      }

      // Shader sources
      const baseVertexShader = compileShader(gl.VERTEX_SHADER, `
        precision highp float;
        attribute vec2 aPosition;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform vec2 texelSize;

        void main () {
            vUv = aPosition * 0.5 + 0.5;
            vL = vUv - vec2(texelSize.x, 0.0);
            vR = vUv + vec2(texelSize.x, 0.0);
            vT = vUv + vec2(0.0, texelSize.y);
            vB = vUv - vec2(0.0, texelSize.y);
            gl_Position = vec4(aPosition, 0.0, 1.0);
        }
      `);

      const displayShaderSource = `
        precision highp float;
        precision highp sampler2D;

        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform sampler2D uTexture;
        uniform vec2 texelSize;

        void main () {
            vec3 c = texture2D(uTexture, vUv).rgb;

        #ifdef SHADING
            vec3 lc = texture2D(uTexture, vL).rgb;
            vec3 rc = texture2D(uTexture, vR).rgb;
            vec3 tc = texture2D(uTexture, vT).rgb;
            vec3 bc = texture2D(uTexture, vB).rgb;

            float dx = length(rc) - length(lc);
            float dy = length(tc) - length(bc);

            vec3 n = normalize(vec3(dx, dy, length(texelSize)));
            vec3 l = vec3(0.0, 0.0, 1.0);

            float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
            c *= diffuse;
        #endif

            float a = max(c.r, max(c.g, c.b));
            gl_FragColor = vec4(c, a);
        }
      `;

      const splatShader = compileShader(gl.FRAGMENT_SHADER, `
        precision highp float;
        precision highp sampler2D;

        varying vec2 vUv;
        uniform sampler2D uTarget;
        uniform float aspectRatio;
        uniform vec3 color;
        uniform vec2 point;
        uniform float radius;

        void main () {
            vec2 p = vUv - point.xy;
            p.x *= aspectRatio;
            vec3 splat = exp(-dot(p, p) / radius) * color;
            vec3 base = texture2D(uTarget, vUv).xyz;
            gl_FragColor = vec4(base + splat, 1.0);
        }
      `);

      const copyShader = compileShader(gl.FRAGMENT_SHADER, `
        precision mediump float;
        precision mediump sampler2D;

        varying highp vec2 vUv;
        uniform sampler2D uTexture;

        void main () {
            gl_FragColor = texture2D(uTexture, vUv);
        }
      `);

      const advectionShader = compileShader(gl.FRAGMENT_SHADER, `
        precision highp float;
        precision highp sampler2D;

        varying vec2 vUv;
        uniform sampler2D uVelocity;
        uniform sampler2D uSource;
        uniform vec2 texelSize;
        uniform vec2 dyeTexelSize;
        uniform float dt;
        uniform float dissipation;

        vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
            vec2 st = uv / tsize - 0.5;
            vec2 iuv = floor(st);
            vec2 fuv = fract(st);
            vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
            vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
            vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
            vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
            return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
        }

        void main () {
        #ifdef MANUAL_FILTERING
            vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
            vec4 result = bilerp(uSource, coord, dyeTexelSize);
        #else
            vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
            vec4 result = texture2D(uSource, coord);
        #endif
            float decay = 1.0 + dissipation * dt;
            gl_FragColor = result / decay;
        }
      `, ext.supportLinearFiltering ? null : ['MANUAL_FILTERING']);

      // Create shader programs
      const splatProgram = new Program(baseVertexShader, splatShader);
      const copyProgram = new Program(baseVertexShader, copyShader);
      const advectionProgram = new Program(baseVertexShader, advectionShader);
      const displayMaterial = new Material(baseVertexShader, displayShaderSource);

      // Initialize buffers
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(0);

      const blit = (target, clear = false) => {
        if (target == null) {
          gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        } else {
          gl.viewport(0, 0, target.width, target.height);
          gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        }
        if (clear) {
          gl.clearColor(0.0, 0.0, 0.0, 1.0);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      };

      // Framebuffer creation functions
      const createFBO = (w, h, internalFormat, format, type, param) => {
        gl.activeTexture(gl.TEXTURE0);
        let texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

        let fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        gl.viewport(0, 0, w, h);
        gl.clear(gl.COLOR_BUFFER_BIT);

        return {
          texture,
          fbo,
          width: w,
          height: h,
          texelSizeX: 1.0 / w,
          texelSizeY: 1.0 / h,
          attach(id) {
            gl.activeTexture(gl.TEXTURE0 + id);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            return id;
          }
        };
      };

      const createDoubleFBO = (w, h, internalFormat, format, type, param) => {
        let fbo1 = createFBO(w, h, internalFormat, format, type, param);
        let fbo2 = createFBO(w, h, internalFormat, format, type, param);

        return {
          width: w,
          height: h,
          texelSizeX: fbo1.texelSizeX,
          texelSizeY: fbo1.texelSizeY,
          get read() { return fbo1; },
          set read(value) { fbo1 = value; },
          get write() { return fbo2; },
          set write(value) { fbo2 = value; },
          swap() {
            let temp = fbo1;
            fbo1 = fbo2;
            fbo2 = temp;
          }
        };
      };

      const getResolution = (resolution) => {
        let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
        if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;

        let min = Math.round(resolution);
        let max = Math.round(resolution * aspectRatio);

        if (gl.drawingBufferWidth > gl.drawingBufferHeight)
          return { width: max, height: min };
        else
          return { width: min, height: max };
      };

      let dye, velocity;
      let lastUpdateTime = Date.now();
      let colorUpdateTimer = 0.0;

      const initFramebuffers = () => {
        let simRes = getResolution(config.SIM_RESOLUTION);
        let dyeRes = getResolution(config.DYE_RESOLUTION);

        const texType = ext.halfFloatTexType;
        const rgba = ext.formatRGBA;
        const rg = ext.formatRG;
        const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

        gl.disable(gl.BLEND);

        dye = createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);
        velocity = createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);
      };

      const generateColor = () => {
        // Base color #c5fcfc in RGB (cyan/blue) - matching the glowing orb
        const baseR = 0xc5 / 255; // 197/255 = 0.773
        const baseG = 0xfc / 255; // 252/255 = 0.988
        const baseB = 0xfc / 255; // 252/255 = 0.988

        // Generate a random shade (0.5 to 1) for consistent bright appearance
        const shade = Math.random();

        // Apply the shade to the base color
        let r = baseR * shade;
        let g = baseG * shade;
        let b = baseB * shade;

        // Increase brightness significantly to match the glowing orb effect
        r *= 0.15; // Bright enough to be clearly visible
        g *= 0.15;
        b *= 0.15;

        // Ensure values don't exceed 1.0
        r = Math.min(r, 1.0);
        g = Math.min(g, 1.0);
        b = Math.min(b, 1.0);

        return { r, g, b };
      };

      const correctRadius = (radius) => {
        let aspectRatio = canvas.width / canvas.height;
        if (aspectRatio > 1) radius *= aspectRatio;
        return radius;
      };

      const splat = (x, y, dx, dy, color) => {
        splatProgram.bind();
        gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
        gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
        gl.uniform2f(splatProgram.uniforms.point, x, y);
        gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0.0);
        gl.uniform1f(splatProgram.uniforms.radius, correctRadius(config.SPLAT_RADIUS / 100.0));
        blit(velocity.write);
        velocity.swap();

        gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
        gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
        blit(dye.write);
        dye.swap();
      };

      const updateColors = (dt) => {
        colorUpdateTimer += dt * config.COLOR_UPDATE_SPEED;
        if (colorUpdateTimer >= 1) {
          colorUpdateTimer = colorUpdateTimer - Math.floor(colorUpdateTimer);
          pointers.forEach(p => {
            p.color = generateColor();
          });
        }
      };

      const applyInputs = () => {
        pointers.forEach(p => {
          if (p.moved) {
            p.moved = false;
            let dx = p.deltaX * config.SPLAT_FORCE;
            let dy = p.deltaY * config.SPLAT_FORCE;
            splat(p.texcoordX, p.texcoordY, dx, dy, p.color);
          }
        });
      };

      const step = (dt) => {
        gl.disable(gl.BLEND);

        // Simplified advection step
        advectionProgram.bind();
        gl.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        if (!ext.supportLinearFiltering)
          gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
        let velocityId = velocity.read.attach(0);
        gl.uniform1i(advectionProgram.uniforms.uVelocity, velocityId);
        gl.uniform1i(advectionProgram.uniforms.uSource, velocityId);
        gl.uniform1f(advectionProgram.uniforms.dt, dt);
        gl.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION);
        blit(velocity.write);
        velocity.swap();

        if (!ext.supportLinearFiltering)
          gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
        gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
        gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
        gl.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION);
        blit(dye.write);
        dye.swap();
      };

      const render = () => {
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);

        let displayKeywords = [];
        if (config.SHADING) displayKeywords.push("SHADING");
        displayMaterial.setKeywords(displayKeywords);

        let width = gl.drawingBufferWidth;
        let height = gl.drawingBufferHeight;

        displayMaterial.bind();
        if (config.SHADING)
          gl.uniform2f(displayMaterial.uniforms.texelSize, 1.0 / width, 1.0 / height);
        gl.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0));
        blit(null);
      };

      const update = () => {
        const now = Date.now();
        const dt = Math.min((now - lastUpdateTime) / 1000, 0.016666);
        lastUpdateTime = now;

        if (resizeCanvas()) initFramebuffers();
        updateColors(dt);
        applyInputs();
        step(dt);
        render();
        animationRef.current = requestAnimationFrame(update);
      };

      const scaleByPixelRatio = (input) => {
        let pixelRatio = window.devicePixelRatio || 1;
        return Math.floor(input * pixelRatio);
      };

      const updatePointerMoveData = (pointer, posX, posY, color) => {
        pointer.prevTexcoordX = pointer.texcoordX;
        pointer.prevTexcoordY = pointer.texcoordY;
        pointer.texcoordX = posX / canvas.width;
        pointer.texcoordY = 1.0 - posY / canvas.height;
        
        let aspectRatio = canvas.width / canvas.height;
        let deltaX = pointer.texcoordX - pointer.prevTexcoordX;
        let deltaY = pointer.texcoordY - pointer.prevTexcoordY;
        
        if (aspectRatio < 1) deltaX *= aspectRatio;
        if (aspectRatio > 1) deltaY /= aspectRatio;
        
        pointer.deltaX = deltaX;
        pointer.deltaY = deltaY;
        pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
        pointer.color = color;
      };

      // Event handlers - matching demo implementation
      const handleMouseMove = (e) => {
        let pointer = pointers[0];
        let posX = scaleByPixelRatio(e.clientX);
        let posY = scaleByPixelRatio(e.clientY);
        let color = pointer.color;
        updatePointerMoveData(pointer, posX, posY, color);
      };

      const handleTouchMove = (e) => {
        e.preventDefault();
        const touches = e.touches;
        let pointer = pointers[0];
        
        if (touches.length > 0) {
          let posX = scaleByPixelRatio(touches[0].clientX);
          let posY = scaleByPixelRatio(touches[0].clientY);
          let color = pointer.color;
          updatePointerMoveData(pointer, posX, posY, color);
        }
      };

      // Initialize
      initFramebuffers();
      
      // Add event listeners to window - matching demo implementation
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });

      // Start animation loop
      update();

      // Cleanup function
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('touchmove', handleTouchMove);
      };
    };

    // Initialize the fluid effect
    const cleanup = initFluid();

    return cleanup;
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
        ...style
      }}
    />
  );
};

export default FluidCursor;