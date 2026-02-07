'use client'

import { useMemo, useEffect } from 'react'
import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber'
import { shaderMaterial, useTrailTexture } from '@react-three/drei'
import { useTheme } from 'next-themes'
import * as THREE from 'three'

const GridMaterial = shaderMaterial(
    {
        time: 0,
        resolution: new THREE.Vector2(),
        gridColor: new THREE.Color('#4c1d95'), // Darker purple base
        glowColor: new THREE.Color('#d8b4fe'), // Bright lavender glow
        bgColor: new THREE.Color('#020617'),   // Slate 950
        mouseTrail: null,
        gridSize: 40.0, // Fewer, larger squares
        cornerR: 0.1    // Slightly rounded corners
    },
  /* glsl */ `
    void main() {
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  /* glsl */ `
    uniform float time;
    uniform vec2 resolution;
    uniform vec3 gridColor;
    uniform vec3 glowColor;
    uniform vec3 bgColor;
    uniform sampler2D mouseTrail;
    uniform float gridSize;
    uniform float cornerR;

    // 2D Box SDF
    float sdBox(in vec2 p, in vec2 b) {
        vec2 d = abs(p)-b;
        return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
    }

    vec2 coverUv(vec2 uv) {
      vec2 s = resolution.xy / max(resolution.x, resolution.y);
      vec2 newUv = (uv - 0.5) * s + 0.5;
      return clamp(newUv, 0.0, 1.0);
    }

    void main() {
      vec2 screenUv = gl_FragCoord.xy / resolution;
      vec2 uv = coverUv(screenUv);

      // Create Grid
      vec2 gridUv = fract(uv * gridSize); // 0..1 in each cell
      vec2 gridIndex = floor(uv * gridSize); // Integer ID of cell
      
      // Center coordinates for looking up mouse trail (normalized back to 0..1)
      vec2 cellCenterUv = (gridIndex + 0.5) / gridSize;
      
      // Calculate distance to box (make them slightly smaller than cell for spacing)
      // Cell is 0..1, center is 0.5. Box size 0.4 means 0.1 gap.
      vec2 p = gridUv - 0.5;
      float d = sdBox(p, vec2(0.4)); 
      
      // Smooth edges
      float alpha = 1.0 - smoothstep(0.0, 0.05, d + cornerR); // +cornerR for rounded corners
      
      // Get Mouse Influence from Trail Texture
      // We lookup using the cell center so the whole cell lights up uniformly
      float mouseIso = texture2D(mouseTrail, cellCenterUv).r;
      
      // Animate the base grid slightly
      float pulse = sin(time * 1.5 + gridIndex.x * 0.2 + gridIndex.y * 0.2) * 0.5 + 0.5;
      float baseOpacity = 0.05 + pulse * 0.02;

      // Glow intensity based on mouse
      float glowIntensity = smoothstep(0.0, 1.0, mouseIso);
      
      // Final mixing
      // 1. Base State: Faint outline or block
      vec3 finalColor = gridColor;
      
      // 2. Add Glow
      finalColor = mix(finalColor, glowColor, glowIntensity * 0.8);
      
      // 3. Opacity logic
      float finalOpacity = baseOpacity + (glowIntensity * 0.8);
      
      // Apply shape mask
      finalColor = mix(bgColor, finalColor, alpha * finalOpacity);

      gl_FragColor = vec4(finalColor, 1.0);

      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `
)

// Extend Three.js
import { extend } from '@react-three/fiber'
extend({ GridMaterial })

function Scene() {
    const size = useThree((s) => s.size)
    const viewport = useThree((s) => s.viewport)

    // Custom trail settings for broader, lasting glow
    const [trail, onMove] = useTrailTexture({
        size: 512,
        radius: 0.15, // Radius of glow around mouse
        maxAge: 350,  // How long it stays lit
        interpolate: 1,
        ease: (x) => 1 - Math.pow(1 - x, 3) // Cubic ease out
    })

    // @ts-ignore
    const gridMaterial = useMemo(() => new GridMaterial(), [])

    useFrame((state) => {
        gridMaterial.uniforms.time.value = state.clock.elapsedTime
    })

    const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
        onMove(e)
    }

    const scale = Math.max(viewport.width, viewport.height) / 2

    return (
        <mesh scale={[scale, scale, 1]} onPointerMove={handlePointerMove}>
            <planeGeometry args={[2, 2]} />
            {/* @ts-ignore */}
            <gridMaterial
                ref={undefined}
                key={GridMaterial.key}
                resolution={[size.width * viewport.dpr, size.height * viewport.dpr]}
                mouseTrail={trail}
            />
        </mesh>
    )
}

export const DotScreenShader = () => {
    return (
        <Canvas
            gl={{
                antialias: true,
                powerPreference: 'high-performance',
                outputColorSpace: THREE.SRGBColorSpace,
                toneMapping: THREE.NoToneMapping
            }}
            camera={{ position: [0, 0, 1] }}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        >
            <Scene />
        </Canvas>
    )
}

export default DotScreenShader;
