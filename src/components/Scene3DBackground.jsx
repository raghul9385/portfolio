import { AdaptiveDpr, AdaptiveEvents, Environment, Float, Grid, Lightformer, Outlines, RoundedBox } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { useReducedMotion } from 'motion/react';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { usePalette } from '../hooks.js';
import { SCENE } from '../theme.js';
import { useToonGradient, usePetalTexture, useRaysTexture, useRiftTexture, useRuneTexture } from './animeBits.js';
import { CODE, TERMINAL, useCodeTexture } from './codeTexture.js';

/* ── pieces ───────────────────────────────────────────────── */

function Panel({ texture, colors, size = [4.3, 2.7], position, rotation, scale = 1 }) {
  const [w, h] = size;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <RoundedBox args={[w, h, 0.12]} radius={0.07} smoothness={3}>
        <meshPhysicalMaterial color={colors.panel} metalness={0.85} roughness={0.25} clearcoat={1} clearcoatRoughness={0.1} envMapIntensity={1.1} />
        <Outlines thickness={0.035} color="#03101c" opacity={0.9} transparent />
      </RoundedBox>
      <mesh position={[0, 0, 0.065]}>
        <planeGeometry args={[w - 0.22, h - 0.22]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

// A small feed-forward net: 3 → 5 → 4 → 2, laid out left to right.
const LAYERS = [3, 5, 4, 2];
const NODES = [];
const LAYER_OF = [];
LAYERS.forEach((count, layer) => {
  for (let i = 0; i < count; i++) {
    NODES.push([(layer - (LAYERS.length - 1) / 2) * 1.5, (i - (count - 1) / 2) * 0.85, 0]);
    LAYER_OF.push(layer);
  }
});
const EDGES = [];
NODES.forEach((_, a) => {
  NODES.forEach((__, b) => {
    if (LAYER_OF[b] === LAYER_OF[a] + 1) EDGES.push([a, b]);
  });
});

/** A neural net: layers of units with an inference wave running through them. */
function ModuleGraph({ colors, still, position, scale = 1 }) {
  const group = useRef(null);
  const units = useRef([]);
  const edges = useMemo(() => {
    const a = new Float32Array(EDGES.length * 6);
    EDGES.forEach(([i, j], k) => { a.set(NODES[i], k * 6); a.set(NODES[j], k * 6 + 3); });
    return a;
  }, []);

  useFrame(({ clock }, dt) => {
    if (still) return;
    if (group.current) group.current.rotation.y += dt * 0.12;
    // the wave sweeps left to right, lighting each layer as it passes
    const head = (clock.elapsedTime * 0.85) % (LAYERS.length + 1.4);
    units.current.forEach((mesh, i) => {
      if (!mesh) return;
      const d = Math.abs(head - LAYER_OF[i]);
      const lit = Math.max(0, 1 - d * 1.6);
      mesh.material.emissiveIntensity = 0.18 + lit * 1.5;
      const s = 1 + lit * 0.45;
      mesh.scale.setScalar(s);
    });
  });

  return (
    <group ref={group} position={position} scale={scale}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[edges, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={colors.grid} transparent opacity={0.45} />
      </lineSegments>
      {NODES.map((p, i) => (
        <mesh key={i} position={p} ref={(el) => { units.current[i] = el; }}>
          <icosahedronGeometry args={[0.14, 1]} />
          <meshStandardMaterial
            color={LAYER_OF[i] % 2 ? colors.glow : colors.accent}
            emissive={LAYER_OF[i] % 2 ? colors.glow : colors.accent}
            emissiveIntensity={0.3} metalness={0.4} roughness={0.25}
          />
        </mesh>
      ))}
    </group>
  );
}

/** A lattice of modules — the deeper the page, the more structure. */
function Lattice({ colors, position, still }) {
  const group = useRef(null);
  useFrame((_, dt) => { if (group.current && !still) group.current.rotation.y += dt * 0.12; });
  const cells = useMemo(() => {
    const out = [];
    for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
      if ((x + y + z) % 2 === 0) out.push([x * 1.25, y * 1.25, z * 1.25]);
    }
    return out;
  }, []);
  return (
    <group ref={group} position={position}>
      {cells.map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.42, 0.42, 0.42]} />
          <meshPhysicalMaterial color={i % 4 === 0 ? colors.accent : colors.panel} metalness={0.8} roughness={0.25} envMapIntensity={1} transparent opacity={0.92} />
        </mesh>
      ))}
    </group>
  );
}

function Motes({ colors, count = 190 }) {
  const ref = useRef(null);
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      a[i * 3] = (Math.random() - 0.5) * 30;
      a[i * 3 + 1] = (Math.random() - 0.5) * 60 - 14;
      a[i * 3 + 2] = (Math.random() - 0.5) * 14 - 3;
    }
    return a;
  }, [count]);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.015; });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color={colors.accent} transparent opacity={0.65} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/** Anime ray burst behind the headline. */
function RayBurst({ colors, still, position, scale = 1 }) {
  const ref = useRef(null);
  const tex = useRaysTexture(colors.accent, colors.glow);
  useFrame(({ clock }, dt) => {
    if (!ref.current || still) return;
    ref.current.rotation.z += dt * 0.06;
    const pulse = 1 + Math.sin(clock.elapsedTime * 0.8) * 0.03;
    ref.current.scale.setScalar(scale * pulse);
  });
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <planeGeometry args={[26, 26]} />
      <meshBasicMaterial map={tex} transparent opacity={0.26} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

/** The rift: a glowing tear that breathes. */
function Rift({ colors, still, position, scale = 1 }) {
  const ref = useRef(null);
  const tex = useRiftTexture(colors.accent, colors.glow);
  useFrame(({ clock }, dt) => {
    if (!ref.current || still) return;
    const t = clock.elapsedTime;
    ref.current.scale.set(scale * (1 + Math.sin(t * 1.4) * 0.04), scale * (1 + Math.sin(t * 0.7) * 0.02), 1);
    ref.current.material.opacity = 0.55 + Math.sin(t * 2.1) * 0.12;
    ref.current.rotation.z = Math.sin(t * 0.3) * 0.03;
    void dt;
  });
  return (
    <mesh ref={ref} position={position}>
      <planeGeometry args={[5, 10]} />
      <meshBasicMaterial map={tex} transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

/** Two rune rings turning against each other — a gate. */
function RuneGate({ colors, still, position, scale = 1 }) {
  const outer = useRef(null);
  const inner = useRef(null);
  const tex = useRuneTexture(colors.accent, colors.glow);
  useFrame(({ clock }, dt) => {
    if (still) return;
    if (outer.current) outer.current.rotation.z += dt * 0.08;
    if (inner.current) inner.current.rotation.z -= dt * 0.13;
    const p = 0.9 + Math.sin(clock.elapsedTime * 0.9) * 0.06;
    if (inner.current) inner.current.scale.setScalar(0.58 * p);
  });
  return (
    <group position={position} scale={scale}>
      <mesh ref={outer}>
        <planeGeometry args={[9, 9]} />
        <meshBasicMaterial map={tex} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={inner} scale={0.58}>
        <planeGeometry args={[9, 9]} />
        <meshBasicMaterial map={tex} transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Petals drifting down across the hero. */
function Petals({ colors, count = 42 }) {
  const ref = useRef(null);
  const tex = usePetalTexture(colors.glow);
  const seeds = useMemo(() => Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * 26,
    y: Math.random() * 16 - 4,
    z: (Math.random() - 0.5) * 8,
    vy: 0.35 + Math.random() * 0.5,
    sway: 0.4 + Math.random() * 0.9,
    phase: Math.random() * 6.28,
  })), [count]);
  const positions = useMemo(() => new Float32Array(count * 3), [count]);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    seeds.forEach((s, i) => {
      s.y -= s.vy * dt;
      if (s.y < -9) { s.y = 12; s.x = (Math.random() - 0.5) * 26; }
      positions[i * 3] = s.x + Math.sin(t * 0.6 + s.phase) * s.sway;
      positions[i * 3 + 1] = s.y;
      positions[i * 3 + 2] = s.z;
    });
    if (ref.current) ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial map={tex} size={0.42} transparent opacity={0.85} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/** The camera descends through the world as the page scrolls. */
function ScrollCamera({ still, depth }) {
  const { camera, pointer } = useThree();
  const target = useRef(0);
  useFrame((_, dt) => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    target.current = -p * depth;
    const k = Math.min(1, dt * 2.6);
    camera.position.y += (target.current - camera.position.y) * k;
    if (!still) {
      camera.position.x += (pointer.x * 0.9 - camera.position.x) * k * 0.6;
      camera.rotation.x += (-pointer.y * 0.05 - camera.rotation.x) * k * 0.6;
    }
  });
  return null;
}

const DEPTH = 30;

function World({ colors, still, heavy }) {
  const { viewport } = useThree();
  const x = Math.min(viewport.width * 0.19, 4.6);
  const toon = useToonGradient(4);
  const code = useCodeTexture(CODE, colors, { title: 'CheckInScreen.tsx' });
  const term = useCodeTexture(TERMINAL, colors, { width: 640, height: 420, title: 'zsh — build' });
  const float = (props) => (still ? { speed: 0, rotationIntensity: 0, floatIntensity: 0 } : props);

  return (
    <>
      <ScrollCamera still={still} depth={DEPTH} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} color={colors.key} />
      <pointLight position={[-5, -1, 3]} intensity={70} color={colors.accent} distance={22} />
      <pointLight position={[5, 3, -2]} intensity={50} color={colors.glow} distance={22} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.4} color={colors.key} position={[0, 5, -6]} scale={[12, 6, 1]} />
        <Lightformer form="rect" intensity={1.6} color={colors.accent} position={[-6, 1, 2]} scale={[6, 8, 1]} rotation={[0, Math.PI / 2, 0]} />
        <Lightformer form="rect" intensity={1.2} color={colors.glow} position={[6, 2, 1]} scale={[6, 8, 1]} rotation={[0, -Math.PI / 2, 0]} />
      </Environment>

      {/* hero level */}
      <RayBurst colors={colors} still={still} position={[x * 0.35, 0.4, -9]} scale={1} />
      <RuneGate colors={colors} still={still} position={[x * 0.5, 0.2, -6.4]} scale={1.08} />
      <Rift colors={colors} still={still} position={[x * 1.15, 0.3, -7.6]} scale={1} />
      {!still && <Petals colors={colors} />}
      <Float {...float({ speed: 0.8, rotationIntensity: 0.5, floatIntensity: 0.5 })}>
        <mesh position={[-x * 0.95, 0.6, -7]}>
          <icosahedronGeometry args={[3.1, 1]} />
          <meshBasicMaterial color={colors.grid} wireframe transparent opacity={0.32} />
        </mesh>
      </Float>
      <Float {...float({ speed: 1.8, rotationIntensity: 1.4, floatIntensity: 1.3 })}>
        <mesh position={[-x * 0.62, 2.5, -1.5]}>
          <icosahedronGeometry args={[0.62, 0]} />
          <meshToonMaterial color={colors.accent} gradientMap={toon} />
          <Outlines thickness={0.06} color="#03101c" />
        </mesh>
      </Float>
      <Float {...float({ speed: 1.3, rotationIntensity: 1, floatIntensity: 1.1 })}>
        <mesh position={[-x * 0.3, -2.6, 1]}>
          <torusGeometry args={[0.55, 0.2, 10, 28]} />
          <meshToonMaterial color={colors.glow} gradientMap={toon} />
          <Outlines thickness={0.05} color="#03101c" />
        </mesh>
      </Float>
      <group position={[x, 0, 0]}>
        <Float {...float({ speed: 1.2, rotationIntensity: 0.35, floatIntensity: 0.9 })}>
          <Panel texture={code} colors={colors} position={[-0.9, 0.85, 0]} rotation={[0.07, 0.36, 0.02]} />
        </Float>
        <Float {...float({ speed: 1.6, rotationIntensity: 0.4, floatIntensity: 1.1 })}>
          <Panel texture={term} colors={colors} size={[3.4, 2.1]} position={[1.35, -1.6, 0.9]} rotation={[0.1, -0.34, -0.03]} scale={0.95} />
        </Float>
        <Float {...float({ speed: 1, rotationIntensity: 0.6, floatIntensity: 0.8 })}>
          <ModuleGraph colors={colors} still={still} position={[1.5, 2.1, -3.6]} scale={0.95} />
        </Float>
        <Float {...float({ speed: 2.2, rotationIntensity: 1.6, floatIntensity: 1.5 })}>
          <mesh position={[2.6, -0.2, 1.6]}>
            <torusKnotGeometry args={[0.34, 0.12, 64, 10]} />
            <meshToonMaterial color={colors.accent} gradientMap={toon} />
            <Outlines thickness={0.05} color="#03101c" />
          </mesh>
        </Float>
      </group>

      {/* about / skills level */}
      <Float {...float({ speed: 2, rotationIntensity: 1.1, floatIntensity: 1.2 })}>
        <mesh position={[-x * 0.85, -7.5, -4]}>
          <torusKnotGeometry args={[0.95, 0.28, 80, 12]} />
          <meshToonMaterial color={colors.accent} gradientMap={toon} />
          <Outlines thickness={0.05} color="#03101c" />
        </mesh>
      </Float>
      <Float {...float({ speed: 1.1, rotationIntensity: 0.4, floatIntensity: 0.9 })}>
        <mesh position={[x * 1.05, -9.5, -6]}>
          <icosahedronGeometry args={[1.8, 1]} />
          <meshBasicMaterial color={colors.glow} wireframe transparent opacity={0.3} />
        </mesh>
      </Float>

      {/* work level */}
      <Lattice colors={colors} still={still} position={[x * 0.95, -16, -3.5]} />
      <Float {...float({ speed: 1.4, rotationIntensity: 0.5, floatIntensity: 1 })}>
        <mesh position={[-x, -17.5, -5]}>
          <torusGeometry args={[1.5, 0.12, 12, 48]} />
          <meshPhysicalMaterial color={colors.glow} metalness={0.7} roughness={0.25} envMapIntensity={1.1} />
        </mesh>
      </Float>

      {/* experience / contact level */}
      <Float {...float({ speed: 0.9, rotationIntensity: 0.6, floatIntensity: 0.8 })}>
        <mesh position={[x * 0.9, -24, -5]}>
          <dodecahedronGeometry args={[1.5, 0]} />
          <meshToonMaterial color={colors.glow} gradientMap={toon} />
          <Outlines thickness={0.05} color="#03101c" />
        </mesh>
      </Float>
      <Float {...float({ speed: 1.3, rotationIntensity: 0.9, floatIntensity: 1.1 })}>
        <mesh position={[-x * 0.9, -26, -6]}>
          <sphereGeometry args={[2.1, 18, 12]} />
          <meshBasicMaterial color={colors.grid} wireframe transparent opacity={0.28} />
        </mesh>
      </Float>

      <Motes colors={colors} />
      {heavy && (
        <EffectComposer disableNormalPass>
          <Bloom intensity={0.8} luminanceThreshold={0.25} luminanceSmoothing={0.3} mipmapBlur radius={0.6} height={200} />
          <Vignette offset={0.28} darkness={0.7} eskil={false} />
        </EffectComposer>
      )}

      <Grid
        position={[0, -DEPTH - 4, 0]}
        args={[40, 40]}
        cellSize={0.6}
        cellThickness={0.7}
        cellColor={colors.grid}
        sectionSize={3}
        sectionThickness={1.1}
        sectionColor={colors.accent}
        fadeDistance={34}
        fadeStrength={1.2}
        infiniteGrid
        followCamera
      />
    </>
  );
}

/** One WebGL world behind the whole page. */
export default function Scene3DBackground() {
  const reduce = useReducedMotion();
  const colors = SCENE[usePalette()] ?? SCENE.ocean;
  const [awake, setAwake] = useState(true);
  const [heavy, setHeavy] = useState(false);

  useEffect(() => {
    // bloom is a full-screen pass — keep it for roomy, non-reduced-motion screens
    const roomy = window.matchMedia('(min-width: 1024px)').matches;
    setHeavy(roomy && !reduce);
  }, [reduce]);

  useEffect(() => {
    const onVis = () => setAwake(!document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 10.4], fov: 40 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        performance={{ min: 0.4 }}
        frameloop={awake && !reduce ? 'always' : 'demand'}
      >
        <Suspense fallback={null}>
          <World colors={colors} still={reduce} heavy={heavy} />
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
        </Suspense>
      </Canvas>
      {/* keeps text legible over the world */}
      <div className="absolute inset-0 bg-[radial-gradient(78%_65%_at_16%_45%,var(--color-ink)_22%,transparent_72%)] opacity-85" />
    </div>
  );
}
