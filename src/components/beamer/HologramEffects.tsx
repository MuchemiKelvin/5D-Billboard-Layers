import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface HologramEffectProps {
  type: 'glow' | 'spin' | 'lightReflection' | 'combined' | 'video';
  intensity: number;
  duration: number;
  slotNumber: number;
  className?: string;
}

// WebGL-based hologram effect generator
class HologramEffectGenerator {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | null;
  private program: WebGLProgram | null;
  private animationId: number | null = null;
  private time: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
    this.program = null;
    this.initWebGL();
  }

  private initWebGL() {
    if (!this.gl) return;

    const gl = this.gl;
    
    // Vertex shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    if (vertexShader) {
      gl.shaderSource(vertexShader, `
        attribute vec2 a_position;
        attribute vec2 a_texCoord;
        varying vec2 v_texCoord;
        
        void main() {
          gl_Position = vec4(a_position, 0.0, 1.0);
          v_texCoord = a_texCoord;
        }
      `);
      gl.compileShader(vertexShader);
    }

    // Fragment shader for hologram effects
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (fragmentShader) {
      gl.shaderSource(fragmentShader, `
        precision mediump float;
        uniform float u_time;
        uniform float u_intensity;
        uniform vec2 u_resolution;
        varying vec2 v_texCoord;
        
        void main() {
          vec2 uv = v_texCoord;
          vec2 center = vec2(0.5);
          float dist = distance(uv, center);
          
          // Hologram glow effect
          float glow = sin(u_time * 2.0 + dist * 10.0) * 0.5 + 0.5;
          glow *= exp(-dist * 3.0) * u_intensity;
          
          // Color variation
          vec3 color = vec3(0.0, 0.8, 1.0) * glow;
          color += vec3(0.5, 0.0, 1.0) * sin(u_time + dist * 5.0) * 0.3;
          
          // Alpha channel for transparency
          float alpha = glow * 0.8;
          
          gl_FragColor = vec4(color, alpha);
        }
      `);
      gl.compileShader(fragmentShader);
    }

    // Create program
    if (vertexShader && fragmentShader) {
      this.program = gl.createProgram();
      if (this.program) {
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);
      }
    }

    // Set up geometry
    this.setupGeometry();
  }

  private setupGeometry() {
    if (!this.gl || !this.program) return;

    const gl = this.gl;
    gl.useProgram(this.program);

    // Create buffer
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(this.program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Set uniforms
    const timeLocation = gl.getUniformLocation(this.program, 'u_time');
    const intensityLocation = gl.getUniformLocation(this.program, 'u_intensity');
    const resolutionLocation = gl.getUniformLocation(this.program, 'u_resolution');

    gl.uniform1f(intensityLocation, 1.0);
    gl.uniform2f(resolutionLocation, this.canvas.width, this.canvas.height);

    // Animation loop
    this.animate(timeLocation, intensityLocation);
  }

  private animate(timeLocation: WebGLUniformLocation | null, intensityLocation: WebGLUniformLocation | null) {
    if (!this.gl || !timeLocation || !intensityLocation) return;

    const gl = this.gl;
    
    const animate = () => {
      this.time += 0.016; // 60fps
      
      gl.uniform1f(timeLocation, this.time);
      gl.uniform1f(intensityLocation, 1.0);
      
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  public setIntensity(intensity: number) {
    if (!this.gl || !this.program) return;

    const intensityLocation = this.gl.getUniformLocation(this.program, 'u_intensity');
    if (intensityLocation) {
      this.gl.uniform1f(intensityLocation, intensity);
    }
  }

  public destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// Canvas-based hologram effect generator
class CanvasHologramGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationId: number | null = null;
  private time: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.setupCanvas();
  }

  private setupCanvas() {
    this.canvas.width = 400;
    this.canvas.height = 400;
    this.ctx.globalCompositeOperation = 'screen';
  }

  public generateGlowEffect(intensity: number) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) * 0.8;

    // Create radial gradient for glow
    const gradient = this.ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, maxRadius
    );

    const alpha = intensity * 0.8;
    gradient.addColorStop(0, `rgba(0, 255, 255, ${alpha})`);
    gradient.addColorStop(0.3, `rgba(59, 130, 246, ${alpha * 0.7})`);
    gradient.addColorStop(0.7, `rgba(0, 255, 255, ${alpha * 0.3})`);
    gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Add pulsing effect
    const pulse = Math.sin(this.time * 2) * 0.2 + 0.8;
    this.ctx.globalAlpha = pulse;
    
    // Draw additional glow layers
    for (let i = 0; i < 3; i++) {
      const layerRadius = maxRadius * (0.6 + i * 0.2);
      const layerAlpha = alpha * (0.3 - i * 0.1);
      
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, layerRadius, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(0, 255, 255, ${layerAlpha})`;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
  }

  public generateSpinEffect(intensity: number) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) * 0.8;

    // Draw spinning rings
    for (let i = 0; i < 5; i++) {
      const radius = maxRadius * (0.3 + i * 0.15);
      const rotation = this.time * (1 + i * 0.5);
      const alpha = intensity * (0.8 - i * 0.15);

      this.ctx.save();
      this.ctx.translate(centerX, centerY);
      this.ctx.rotate(rotation);

      // Create gradient for ring
      const gradient = this.ctx.createLinearGradient(-radius, 0, radius, 0);
      gradient.addColorStop(0, `rgba(0, 255, 255, ${alpha})`);
      gradient.addColorStop(0.5, `rgba(59, 130, 246, ${alpha * 1.2})`);
      gradient.addColorStop(1, `rgba(0, 255, 255, ${alpha})`);

      this.ctx.strokeStyle = gradient;
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
      this.ctx.stroke();

      this.ctx.restore();
    }
  }

  public generateLightReflectionEffect(intensity: number) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) * 0.8;

    // Create light sweep effect
    const sweepPosition = (this.time * 0.5) % (this.canvas.width + maxRadius * 2) - maxRadius;
    
    // Main light sweep
    const gradient = this.ctx.createLinearGradient(
      sweepPosition - 50, 0,
      sweepPosition + 50, 0
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(0.3, `rgba(255, 255, 255, ${intensity * 0.6})`);
    gradient.addColorStop(0.7, `rgba(0, 255, 255, ${intensity * 0.8})`);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Add reflection highlights
    for (let i = 0; i < 3; i++) {
      const offset = i * 100;
      const highlightPos = (sweepPosition + offset) % (this.canvas.width + 100);
      
      this.ctx.beginPath();
      this.ctx.arc(highlightPos, centerY, 20 + i * 10, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(0, 255, 255, ${intensity * (0.4 - i * 0.1)})`;
      this.ctx.fill();
    }
  }

  public generateCombinedEffect(intensity: number) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Combine all effects
    this.generateGlowEffect(intensity * 0.7);
    this.generateSpinEffect(intensity * 0.8);
    this.generateLightReflectionEffect(intensity * 0.6);

    // Add special combined elements
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    // Central energy core
    const coreRadius = 30 + Math.sin(this.time * 3) * 10;
    const coreGradient = this.ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, coreRadius
    );
    coreGradient.addColorStop(0, `rgba(255, 255, 255, ${intensity})`);
    coreGradient.addColorStop(0.5, `rgba(0, 255, 255, ${intensity * 0.8})`);
    coreGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');

    this.ctx.fillStyle = coreGradient;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  public animate(type: string, intensity: number) {
    this.time += 0.016; // 60fps

    switch (type) {
      case 'glow':
        this.generateGlowEffect(intensity);
        break;
      case 'spin':
        this.generateSpinEffect(intensity);
        break;
      case 'lightReflection':
        this.generateLightReflectionEffect(intensity);
        break;
      case 'combined':
        this.generateCombinedEffect(intensity);
        break;
    }

    this.animationId = requestAnimationFrame(() => this.animate(type, intensity));
  }

  public destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// SVG-based hologram effects
const SVGGlowEffect: React.FC<{ intensity: number; duration: number }> = ({ intensity, duration }) => (
  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
    <defs>
      <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={`rgba(0, 255, 255, ${intensity * 0.8})`} />
        <stop offset="30%" stopColor={`rgba(59, 130, 246, ${intensity * 0.6})`} />
        <stop offset="70%" stopColor={`rgba(0, 255, 255, ${intensity * 0.3})`} />
        <stop offset="100%" stopColor="rgba(0, 255, 255, 0)" />
      </radialGradient>
    </defs>
    
    <circle cx="50" cy="50" r="45" fill="url(#glowGradient)">
      <animate
        attributeName="r"
        values="40;50;40"
        dur={`${duration}s`}
        repeatCount="indefinite"
      />
      <animate
        attributeName="opacity"
        values="0.6;1;0.6"
        dur={`${duration * 0.5}s`}
        repeatCount="indefinite"
      />
    </circle>
  </svg>
);

const SVGSpinEffect: React.FC<{ intensity: number; duration: number }> = ({ intensity, duration }) => (
  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
    {[0, 1, 2, 3].map((i) => (
      <circle
        key={i}
        cx="50"
        cy="50"
        r={30 + i * 8}
        fill="none"
        stroke={`rgba(0, 255, 255, ${intensity * (0.8 - i * 0.2)})`}
        strokeWidth="1"
        strokeDasharray="5,5"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          values={`0 50 50;360 50 50`}
          dur={`${duration * (1 + i * 0.3)}s`}
          repeatCount="indefinite"
        />
      </circle>
    ))}
  </svg>
);

const SVGLightReflectionEffect: React.FC<{ intensity: number; duration: number }> = ({ intensity, duration }) => (
  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="lightSweep" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
        <stop offset="40%" stopColor={`rgba(255, 255, 255, ${intensity * 0.6})`} />
        <stop offset="60%" stopColor={`rgba(0, 255, 255, ${intensity * 0.8})`} />
        <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
      </linearGradient>
    </defs>
    
    <rect
      x="0"
      y="0"
      width="100"
      height="100"
      fill="url(#lightSweep)"
      transform="skewX(-20)"
    >
      <animate
        attributeName="x"
        values="-100;100"
        dur={`${duration}s`}
        repeatCount="indefinite"
      />
    </rect>
  </svg>
);

// Main HologramEffects component
export const HologramEffects: React.FC<HologramEffectProps> = ({
  type,
  intensity,
  duration,
  slotNumber,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const webglRef = useRef<HTMLCanvasElement>(null);
  const [useWebGL, setUseWebGL] = useState(false);
  const [generator, setGenerator] = useState<CanvasHologramGenerator | HologramEffectGenerator | null>(null);

  // Initialize effect generator
  useEffect(() => {
    if (type === 'video') {
      // For video type, we'll use enhanced CSS effects
      setUseWebGL(false);
      return;
    }

    if (webglRef.current && type === 'combined') {
      // Use WebGL for complex effects
      try {
        const webglGen = new HologramEffectGenerator(webglRef.current);
        setGenerator(webglGen);
        setUseWebGL(true);
      } catch (error) {
        console.warn('WebGL not available, falling back to Canvas');
        setUseWebGL(false);
      }
    }

    if (canvasRef.current && !useWebGL) {
      // Use Canvas for other effects
      const canvasGen = new CanvasHologramGenerator(canvasRef.current);
      setGenerator(canvasGen);
      setUseWebGL(false);
    }

    return () => {
      if (generator) {
        generator.destroy();
      }
    };
  }, [type, useWebGL]);

  // Start animation
  useEffect(() => {
    if (generator && type !== 'video') {
      if (useWebGL && generator instanceof HologramEffectGenerator) {
        generator.setIntensity(intensity);
      } else if (generator instanceof CanvasHologramGenerator) {
        generator.animate(type, intensity);
      }
    }
  }, [generator, type, intensity, useWebGL]);

  // Enhanced CSS-based effects for video simulation
  const renderCSSEffects = () => {
    const baseClasses = 'absolute inset-0 pointer-events-none z-10';
    
    switch (type) {
      case 'glow':
        return (
          <div className={`${baseClasses} hologram-glow`}>
            <SVGGlowEffect intensity={intensity} duration={duration} />
            <div className="absolute inset-0 bg-gradient-radial from-blue-400/30 via-cyan-300/20 to-transparent animate-pulse" />
          </div>
        );
      
      case 'spin':
        return (
          <div className={`${baseClasses} hologram-spin`}>
            <SVGSpinEffect intensity={intensity} duration={duration} />
            <div className="absolute inset-0 border-2 border-blue-400/50 rounded-full animate-spin" 
                 style={{ animationDuration: `${duration}s` }} />
          </div>
        );
      
      case 'lightReflection':
        return (
          <div className={`${baseClasses} hologram-light-reflection`}>
            <SVGLightReflectionEffect intensity={intensity} duration={duration} />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration, repeat: Infinity, ease: "linear" }}
            />
          </div>
        );
      
      case 'combined':
        return (
          <div className={`${baseClasses} hologram-combined`}>
            <SVGGlowEffect intensity={intensity * 0.7} duration={duration} />
            <SVGSpinEffect intensity={intensity * 0.8} duration={duration} />
            <SVGLightReflectionEffect intensity={intensity * 0.6} duration={duration} />
          </div>
        );
      
      case 'video':
        return (
          <div className={`${baseClasses} hologram-video`}>
            {/* Simulated video effect with advanced CSS */}
            <div className="absolute inset-0 bg-gradient-radial from-cyan-400/20 via-transparent to-blue-400/20 animate-pulse" />
            <motion.div
              className="absolute inset-0"
              animate={{
                background: [
                  'radial-gradient(circle at 30% 30%, rgba(0,255,255,0.3) 0%, transparent 50%)',
                  'radial-gradient(circle at 70% 70%, rgba(59,130,246,0.3) 0%, transparent 50%)',
                  'radial-gradient(circle at 30% 70%, rgba(0,255,255,0.3) 0%, transparent 50%)',
                  'radial-gradient(circle at 70% 30%, rgba(59,130,246,0.3) 0%, transparent 50%)'
                ]
              }}
              transition={{ duration: duration * 0.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="absolute inset-0 bg-gradient-radial from-blue-400/15 via-transparent to-cyan-400/15 animate-pulse" 
                 style={{ animationDelay: '0.5s' }} />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <motion.div
      className={`hologram-effects-container ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: intensity }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* WebGL Canvas for complex effects */}
      {useWebGL && (
        <canvas
          ref={webglRef}
          className="absolute inset-0 w-full h-full"
          style={{ mixBlendMode: 'screen' }}
        />
      )}

      {/* Canvas for standard effects */}
      {!useWebGL && type !== 'video' && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ mixBlendMode: 'screen' }}
        />
      )}

      {/* Enhanced CSS effects */}
      {renderCSSEffects()}

      {/* Effect info overlay */}
      <div className="absolute top-0 left-0 text-xs text-cyan-400 bg-black/50 px-2 py-1 rounded dev-hologram-info">
        L2: {type} • {duration}s • {useWebGL ? 'WebGL' : 'Canvas/CSS'} • Slot {slotNumber}
      </div>

      {/* Hologram frame effect */}
      <div className="absolute inset-0 border border-cyan-400/30 rounded-lg pointer-events-none">
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-400/50 hologram-frame-corner"></div>
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-400/50 hologram-frame-corner"></div>
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-400/50 hologram-frame-corner"></div>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-400/50 hologram-frame-corner"></div>
      </div>
    </motion.div>
  );
};
