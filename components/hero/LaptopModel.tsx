"use client";

import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ErrorInfo,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, useGLTF, useProgress } from "@react-three/drei";
import { useReducedMotion, type MotionValue } from "motion/react";
import { Box3, MathUtils, Mesh, Vector3, type Group, type Material, type Object3D } from "three";
import { seg } from "./scrollMath";

const MODEL_URL = "/models/laptop.glb";

/* --- Camera and framing (unchanged: the laptop's size at rest is the same as before) ------ */
const FOV = 35;
/** Longest side of the model after normalising, in world units. Only a working size; framing is derived from it. */
const TARGET_SIZE = 3;
/** Upper targets for how much of the canvas the silhouette may fill at rest. */
const FILL_WIDTH = 0.97;
const FILL_HEIGHT = 0.88;
/** Hard limit: even at maximum tilt the silhouette may not exceed this share of the canvas. */
const CLIP_LIMIT = 0.97;
/** The canvas is drawn this much larger than the layout box (on every side, as a fraction of it). */
const CANVAS_OVERFLOW = "15%";
/** Upper bound on vertices used for fitting. Models with fewer vertices are measured exactly. */
const MAX_FIT_POINTS = 60000;

/* --- Hover tilt (unchanged) ----------------------------------------------------------------- */
/** Resting three-quarter pose (radians). Flip the sign of BASE_YAW if it faces the wrong way. */
const BASE_YAW = -0.4;
const BASE_PITCH = 0.08;
/** Maximum extra tilt from the pointer (radians). */
const MAX_YAW = 0.5;
const MAX_PITCH = 0.25;
/** Higher = snappier follow and return. */
const DAMPING = 6;
/** Tilt strength when the user prefers reduced motion. Only the idle float is switched off. */
const REDUCED_MOTION_TILT = 0.6;

/* --- Drag to rotate (outside the scroll transition) ------------------------------------------ */
const FULL_TURN = Math.PI; // 180 degrees
/** Dragging across this share of the laptop's width turns it 180 degrees. */
const DRAG_SPAN = 0.6;
/** Damping of the turn: while dragging (snappy), and while it springs back to the front. */
const SPIN_DAMPING_ACTIVE = 16;
const SPIN_DAMPING_RETURN = 3.5;

/* --- Scroll-driven transition ----------------------------------------------------------------- */
/**
 * How far the laptop turns on its own during the Hero-to-About scroll (radians, 0.8 is about 46 degrees).
 * Smaller = slower, gentler turn. Together with SCROLL_TURN this sets the turning speed.
 */
const SCROLL_YAW = 0.8;
const SCROLL_PITCH = -0.08;
/**
 * Part of the scroll (0 to 1) during which the laptop turns. A wider range is a slower turn.
 * It runs until 0.72, the point where the laptop has finished fading out.
 */
const SCROLL_TURN = [0, 0.72] as const;
/** On phones the scroll effect is lighter: a gentle turn only (radians). */
const LIGHT_YAW = 0.5;
/** How much further back the camera moves at the end of the transition (0.6 = 60% further away). */
const SCROLL_PULL = 0.6;
/** Camera safety table: resolution of the spin angles and number of vertices sampled for it. */
const SPIN_TABLE_STEPS = 24;
const SPIN_TABLE_POINTS = 15000;

/** Matches names that probably belong to the display (dev logging only). */
const SCREEN_HINT = /screen|display|monitor|lcd|panel|glass|emissive/i;

/** "full": cinematic desktop transition. "light": gentle phone version. "off": reduced motion. */
export type ScrollLevel = "full" | "light" | "off";

type Controls = {
  dragging: boolean;
  /** Where the user has dragged the laptop to, in radians from the front-facing pose. */
  spinTarget: number;
};

/* -------------------------------------------------------------------------- */
/* Error boundary: shows the fallback if the GLB or WebGL fails                */
/* -------------------------------------------------------------------------- */

type BoundaryProps = { fallback: ReactNode; children: ReactNode };
type BoundaryState = { failed: boolean };

class SceneErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[LaptopModel] Failed to render the 3D scene:", error, info.componentStack);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/* -------------------------------------------------------------------------- */
/* Loading overlay (DOM, outside the canvas)                                   */
/* -------------------------------------------------------------------------- */

function LoadingOverlay() {
  const { active, progress } = useProgress();
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 flex items-center justify-center text-xs tracking-wide text-[#A6A0B5] transition-opacity duration-500 ${
        active ? "opacity-100" : "opacity-0"
      }`}
    >
      Loading 3D model {Math.round(progress)}%
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Measuring and framing helpers                                               */
/* -------------------------------------------------------------------------- */

type Dims = { x: number; y: number; z: number };

function isVisibleInTree(node: Object3D): boolean {
  for (let n: Object3D | null = node; n; n = n.parent) {
    if (!n.visible) return false;
  }
  return true;
}

/** True when every material of the mesh is switched off or fully transparent (it draws nothing). */
function drawsNothing(mesh: Mesh): boolean {
  const materials: Material[] = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  return materials.every((m) => !m.visible || (m.transparent && m.opacity === 0));
}

/** World-space vertices of every visible mesh (x, y, z triplets), thinned to at most MAX_FIT_POINTS. */
function collectVisibleVertices(root: Object3D): { points: Float32Array; stride: number } {
  root.updateMatrixWorld(true);

  const meshes: Mesh[] = [];
  let total = 0;
  root.traverse((node) => {
    if (!(node instanceof Mesh) || !isVisibleInTree(node) || drawsNothing(node)) return;
    const position = node.geometry.getAttribute("position");
    if (!position) return;
    meshes.push(node);
    total += position.count;
  });

  const stride = Math.max(1, Math.ceil(total / MAX_FIT_POINTS));
  const out: number[] = [];
  const v = new Vector3();
  for (const mesh of meshes) {
    const position = mesh.geometry.getAttribute("position");
    for (let i = 0; i < position.count; i += stride) {
      v.fromBufferAttribute(position, i).applyMatrix4(mesh.matrixWorld);
      out.push(v.x, v.y, v.z);
    }
  }
  return { points: Float32Array.from(out), stride };
}

/**
 * Smallest camera distance (camera on +Z, looking at the origin) at which the model,
 * rotated like the rig (pitch about X applied after yaw about Y), fits inside
 * `fillW` x `fillH` of the frame. Perspective is handled exactly per vertex.
 */
function distanceForPose(
  points: Float32Array,
  yaw: number,
  pitch: number,
  fillW: number,
  fillH: number,
  aspect: number,
): number {
  const tanHalf = Math.tan(MathUtils.degToRad(FOV / 2));
  const kx = 1 / (fillW * tanHalf * aspect);
  const ky = 1 / (fillH * tanHalf);
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);

  let distance = -Infinity;
  let nearest = -Infinity;
  for (let i = 0; i < points.length; i += 3) {
    const x = points[i];
    const y = points[i + 1];
    const z = points[i + 2];
    const x1 = x * cy + z * sy;
    const z1 = -x * sy + z * cy;
    const y2 = y * cp - z1 * sp;
    const z2 = y * sp + z1 * cp;
    const needed = z2 + Math.max(Math.abs(x1) * kx, Math.abs(y2) * ky);
    if (needed > distance) distance = needed;
    if (z2 > nearest) nearest = z2;
  }
  // Never let the camera end up inside the model.
  return Math.max(distance, nearest + TARGET_SIZE * 0.5);
}

/** Camera distance for a given turn angle, interpolated from the precomputed table. */
function distanceAtSpin(table: Float32Array, spin: number): number {
  const f = MathUtils.clamp((spin + FULL_TURN) / (2 * FULL_TURN), 0, 1) * (table.length - 1);
  const i = Math.min(Math.floor(f), table.length - 2);
  const t = f - i;
  return table[i] * (1 - t) + table[i + 1] * t;
}

/* -------------------------------------------------------------------------- */
/* The model                                                                   */
/* -------------------------------------------------------------------------- */

type LaptopProps = {
  hovering: { current: boolean };
  pointerTarget: { current: Vector3 };
  controls: { current: Controls };
  reduceMotion: boolean;
  scroll?: MotionValue<number>;
  scrollLevel: ScrollLevel;
};

type Fit = {
  object: Object3D;
  /** Uniform scale that makes the longest side TARGET_SIZE. */
  scale: number;
  /** Moves the model's centre to the origin (in unscaled model units). */
  offset: Vector3;
  /** Vertices already centred and scaled, ready for distance fitting. */
  points: Float32Array;
  dims: Dims;
  rawSize: Vector3;
  stride: number;
};

function Laptop({ hovering, pointerTarget, controls, reduceMotion, scroll, scrollLevel }: LaptopProps) {
  const { scene } = useGLTF(MODEL_URL);
  const canvasWidth = useThree((state) => state.size.width);
  const canvasHeight = useThree((state) => state.size.height);
  const rig = useRef<Group>(null);

  // Animation state lives in refs: nothing here causes a React re-render.
  const elapsed = useRef(0);
  const spin = useRef(0);
  const tiltYaw = useRef(0);
  const tiltPitch = useRef(0);

  // Measure once per loaded scene. The clone is never moved or scaled directly:
  // centering and scaling happen on wrapper groups, so each is applied exactly once.
  const model = useMemo<Fit>(() => {
    const object = scene.clone(true);
    const { points, stride } = collectVisibleVertices(object);

    const min = new Vector3(Infinity, Infinity, Infinity);
    const max = new Vector3(-Infinity, -Infinity, -Infinity);
    for (let i = 0; i < points.length; i += 3) {
      min.x = Math.min(min.x, points[i]);
      min.y = Math.min(min.y, points[i + 1]);
      min.z = Math.min(min.z, points[i + 2]);
      max.x = Math.max(max.x, points[i]);
      max.y = Math.max(max.y, points[i + 1]);
      max.z = Math.max(max.z, points[i + 2]);
    }
    const size = max.clone().sub(min);
    const center = min.clone().add(max).multiplyScalar(0.5);

    const valid =
      points.length > 0 &&
      [size.x, size.y, size.z, center.x, center.y, center.z].every(Number.isFinite) &&
      size.x > 0 &&
      size.y > 0 &&
      size.z > 0;
    if (!valid) {
      // Handled by the error boundary, which shows the SVG fallback.
      throw new Error(
        `[LaptopModel] ${MODEL_URL} has no usable geometry (size ${size.x} x ${size.y} x ${size.z}).`,
      );
    }

    const scale = TARGET_SIZE / Math.max(size.x, size.y, size.z);
    for (let i = 0; i < points.length; i += 3) {
      points[i] = (points[i] - center.x) * scale;
      points[i + 1] = (points[i + 1] - center.y) * scale;
      points[i + 2] = (points[i + 2] - center.z) * scale;
    }

    return {
      object,
      scale,
      offset: center.clone().multiplyScalar(-1),
      points,
      dims: { x: size.x * scale, y: size.y * scale, z: size.z * scale },
      rawSize: size,
      stride,
    };
  }, [scene]);

  // Camera distance depends on the model and the canvas aspect only.
  const framing = useMemo(() => {
    const aspect = canvasWidth > 0 && canvasHeight > 0 ? canvasWidth / canvasHeight : 1;
    const { points, dims } = model;

    // Resting pose: the silhouette fills FILL_WIDTH / FILL_HEIGHT of the frame.
    let distance = distanceForPose(points, BASE_YAW, BASE_PITCH, FILL_WIDTH, FILL_HEIGHT, aspect);

    // At the extremes of the hover tilt the silhouette must still fit inside CLIP_LIMIT.
    for (const yaw of [BASE_YAW - MAX_YAW, BASE_YAW + MAX_YAW]) {
      for (const pitch of [BASE_PITCH - MAX_PITCH, BASE_PITCH + MAX_PITCH]) {
        distance = Math.max(distance, distanceForPose(points, yaw, pitch, CLIP_LIMIT, CLIP_LIMIT, aspect));
      }
    }

    // Safety table for the turn-around: for each spin angle, the camera is never closer than `distance`
    // (so the size at rest is unchanged) and moves back only if that angle would otherwise clip.
    const totalPoints = points.length / 3;
    const sampleStride = Math.max(1, Math.ceil(totalPoints / SPIN_TABLE_POINTS));
    const sample = new Float32Array(Math.ceil(totalPoints / sampleStride) * 3);
    let n = 0;
    for (let i = 0; i < totalPoints; i += sampleStride) {
      sample[n++] = points[i * 3];
      sample[n++] = points[i * 3 + 1];
      sample[n++] = points[i * 3 + 2];
    }
    const sampled = sample.subarray(0, n);
    const spinDistances = new Float32Array(SPIN_TABLE_STEPS + 1);
    for (let i = 0; i <= SPIN_TABLE_STEPS; i++) {
      const angle = -FULL_TURN + (i * 2 * FULL_TURN) / SPIN_TABLE_STEPS;
      spinDistances[i] = Math.max(
        distance,
        distanceForPose(sampled, BASE_YAW + angle, BASE_PITCH, CLIP_LIMIT, CLIP_LIMIT, aspect),
      );
    }

    return {
      distance,
      spinDistances,
      shadowY: -dims.y / 2 - TARGET_SIZE * 0.04,
      shadowFar: dims.y + TARGET_SIZE * 0.3,
      shadowScale: Math.max(dims.x, dims.z) * 1.7,
    };
  }, [model, canvasWidth, canvasHeight]);

  // Development helper: dimensions plus every mesh/material, so the screen can be identified.
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const s = model.rawSize;
    console.info(
      `[LaptopModel] raw size ${s.x.toFixed(3)} x ${s.y.toFixed(3)} x ${s.z.toFixed(3)}, ` +
        `${model.points.length / 3} fit points (stride ${model.stride}), scale ${model.scale.toFixed(4)}, ` +
        `camera distance ${framing.distance.toFixed(2)}, reduced motion: ${reduceMotion}`,
    );
    const rows: Array<Record<string, string>> = [];
    model.object.traverse((child) => {
      if (!(child instanceof Mesh)) return;
      const materials: Material[] = Array.isArray(child.material) ? child.material : [child.material];
      const size = new Box3().setFromObject(child).getSize(new Vector3());
      rows.push({
        mesh: child.name || "(unnamed)",
        material: materials.map((m) => m.name || "(unnamed)").join(", "),
        size: `${size.x.toFixed(2)} x ${size.y.toFixed(2)} x ${size.z.toFixed(2)}`,
        screenCandidate: SCREEN_HINT.test(child.name + materials.map((m) => m.name).join(" ")) ? "YES" : "",
      });
    });
    console.groupCollapsed(`[LaptopModel] ${rows.length} meshes in ${MODEL_URL}`);
    console.table(rows);
    console.groupEnd();
  }, [model, framing.distance, reduceMotion]);

  // All animation lives here. It only touches refs, MotionValues and three.js objects: no React state.
  useFrame((state, rawDelta) => {
    const group = rig.current;
    if (!group) return;
    const c = controls.current;
    const dt = Math.min(rawDelta, 0.05);
    elapsed.current += dt;

    // Dragging turns the laptop; letting go springs it back to the front.
    if (!c.dragging) c.spinTarget = 0;
    spin.current = MathUtils.damp(
      spin.current,
      c.spinTarget,
      c.dragging ? SPIN_DAMPING_ACTIVE : SPIN_DAMPING_RETURN,
      dt,
    );

    // Scroll progress of the Hero-to-About transition. It is read, never stored in React state, and every
    // value below is a pure function of it, so scrolling back up reverses the motion exactly.
    const sp = scroll ? MathUtils.clamp(scroll.get(), 0, 1) : 0;
    const full = scrollLevel === "full";
    const light = scrollLevel === "light";
    const yawScroll = full ? SCROLL_YAW * seg(sp, SCROLL_TURN[0], SCROLL_TURN[1]) : light ? LIGHT_YAW * sp : 0;
    const pitchScroll = full ? SCROLL_PITCH * seg(sp, SCROLL_TURN[0], SCROLL_TURN[1]) : 0;
    const pull = full ? seg(sp, 0.35, 0.8) : 0;

    // Hover tilt (unchanged behaviour), faded out while dragging, turned away, or scrolling.
    const tilt = reduceMotion ? REDUCED_MOTION_TILT : 1;
    const follow = hovering.current && !c.dragging && sp < 0.3;
    const px = follow ? pointerTarget.current.x : 0;
    const py = follow ? pointerTarget.current.y : 0;
    tiltYaw.current = MathUtils.damp(tiltYaw.current, px * MAX_YAW * tilt, DAMPING, dt);
    tiltPitch.current = MathUtils.damp(tiltPitch.current, -py * MAX_PITCH * tilt, DAMPING, dt);
    const tiltScale =
      (1 - MathUtils.clamp(Math.abs(spin.current) / (Math.PI / 2), 0, 1)) * (1 - seg(sp, 0, 0.3));

    group.rotation.y = BASE_YAW + spin.current + yawScroll + tiltYaw.current * tiltScale;
    group.rotation.x = BASE_PITCH + pitchScroll + tiltPitch.current * tiltScale;
    group.position.y = reduceMotion ? 0 : Math.sin(elapsed.current * 0.8) * TARGET_SIZE * 0.02;

    // Camera: at rest this is exactly the distance used before. The safety table keeps the laptop inside the
    // canvas at every turn angle, and the scroll "pull back" then moves the camera away for depth.
    const turned = MathUtils.clamp(spin.current + yawScroll, -FULL_TURN, FULL_TURN);
    const distance = distanceAtSpin(framing.spinDistances, turned) * (1 + SCROLL_PULL * pull);
    state.camera.position.set(0, 0, distance);
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <>
      {/* rig: rotation and float. Starts at the base pose so there is no swing on load. */}
      <group ref={rig} rotation={[BASE_PITCH, BASE_YAW, 0]}>
        <group scale={model.scale}>
          <group position={model.offset}>
            <primitive object={model.object} />
          </group>
        </group>
      </group>
      {/* frames={1}: the shadow is rendered once instead of every frame. */}
      <ContactShadows
        position={[0, framing.shadowY, 0]}
        opacity={0.4}
        scale={framing.shadowScale}
        blur={2.6}
        far={framing.shadowFar}
        resolution={256}
        frames={1}
        color="#05040A"
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Public component                                                            */
/* -------------------------------------------------------------------------- */

type LaptopModelProps = {
  fallback: ReactNode;
  /** Scroll progress (0 to 1) of the Hero-to-About transition, supplied by the Hero. */
  scroll?: MotionValue<number>;
  scrollLevel?: ScrollLevel;
};

export default function LaptopModel({ fallback, scroll, scrollLevel = "off" }: LaptopModelProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const hovering = useRef(false);
  const pointerTarget = useRef(new Vector3(0, 0, 0));
  const controls = useRef<Controls>({ dragging: false, spinTarget: 0 });
  // Drag bookkeeping lives in refs: pressing and dragging never causes a React render.
  const dragPointer = useRef<number | null>(null);
  const drag = useRef({ lastX: 0, radiansPerPx: 0 });
  // The scene only renders frames while the laptop can actually be seen.
  const [visible, setVisible] = useState(true);

  // Only rendered client-side (dynamic import with ssr: false), so reading matchMedia here is safe.
  const [dpr] = useState<[number, number]>(() =>
    window.matchMedia("(pointer: coarse)").matches ? [1, 1.5] : [1, 2],
  );
  const [touchDevice] = useState<boolean>(() => window.matchMedia("(hover: none), (pointer: coarse)").matches);

  // Stop rendering once the transition has carried the laptop out of view (the state flips only when it
  // crosses the threshold, not on every scroll frame).
  useEffect(() => {
    if (!scroll) return;
    const update = (v: number) => setVisible(v < 0.8);
    update(scroll.get());
    return scroll.on("change", update);
  }, [scroll]);

  // Pointer handling, all on the window: hover tilt and dragging.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const onMove = (e: PointerEvent) => {
      const c = controls.current;

      // Dragging: turn the laptop by how far this pointer moved.
      if (dragPointer.current === e.pointerId && c.dragging) {
        const dx = e.clientX - drag.current.lastX;
        drag.current.lastX = e.clientX;
        c.spinTarget = MathUtils.clamp(c.spinTarget + dx * drag.current.radiansPerPx, -FULL_TURN, FULL_TURN);
      }

      // Hover tilt (unchanged): the laptop turns toward the mouse wherever it is on the page.
      if (e.pointerType === "touch") {
        hovering.current = false;
        return;
      }
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const x = MathUtils.clamp((e.clientX - cx) / (window.innerWidth / 2), -1, 1);
      const y = MathUtils.clamp(-(e.clientY - cy) / (window.innerHeight / 2), -1, 1);
      pointerTarget.current.set(x, y, 0);
      hovering.current = true;
    };

    const endDrag = (e: PointerEvent) => {
      if (dragPointer.current !== e.pointerId) return;
      dragPointer.current = null;
      controls.current.dragging = false;
    };
    const onLeavePage = () => {
      hovering.current = false;
    };
    const onBlurWindow = () => {
      hovering.current = false;
      dragPointer.current = null;
      controls.current.dragging = false;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    document.documentElement.addEventListener("pointerleave", onLeavePage);
    window.addEventListener("blur", onBlurWindow);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
      document.documentElement.removeEventListener("pointerleave", onLeavePage);
      window.removeEventListener("blur", onBlurWindow);
    };
  }, []);

  // One press and drag is enough: the first pointer-down starts turning immediately.
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragPointer.current !== null) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    // Stops the press from starting a text selection or moving keyboard focus in the middle of the drag.
    e.preventDefault();
    dragPointer.current = e.pointerId;
    drag.current.lastX = e.clientX;
    drag.current.radiansPerPx = FULL_TURN / (e.currentTarget.getBoundingClientRect().width * DRAG_SPAN);
    controls.current.dragging = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId); // keeps touch drags smooth; window listeners are the fallback
    } catch {
      /* capture is optional */
    }
    hintRef.current?.setAttribute("data-hidden", "true"); // a DOM attribute, not React state
  };

  return (
    <div
      ref={wrapperRef}
      onPointerDown={onPointerDown}
      className="relative aspect-[21/17] w-full cursor-grab touch-pan-y select-none rounded-2xl active:cursor-grabbing"
    >
      <SceneErrorBoundary fallback={fallback}>
        <div className="pointer-events-none absolute" style={{ inset: `-${CANVAS_OVERFLOW}` }}>
          <Canvas
            dpr={dpr}
            frameloop={visible ? "always" : "demand"}
            camera={{ position: [0, 0, 6], fov: FOV, near: 0.1, far: 100 }}
            gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
            onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
            // The wrapper receives all pointer input, so the canvas itself ignores the pointer.
            style={{ background: "transparent", pointerEvents: "none" }}
          >
            <ambientLight intensity={0.5} />
            <directionalLight position={[4, 5, 3]} intensity={1.6} />
            {/* Small, one-time environment map for metal and glass reflections. */}
            <Environment resolution={32} frames={1}>
              <Lightformer form="rect" intensity={2} position={[0, 4, -3]} scale={[8, 2, 1]} />
              <Lightformer
                form="rect"
                intensity={1.2}
                color="#B8A0FF"
                position={[-5, 1, 2]}
                rotation-y={Math.PI / 2}
                scale={[3, 4, 1]}
              />
            </Environment>
            <Suspense fallback={null}>
              <Laptop
                hovering={hovering}
                pointerTarget={pointerTarget}
                controls={controls}
                reduceMotion={reduceMotion}
                scroll={scroll}
                scrollLevel={scrollLevel}
              />
            </Suspense>
          </Canvas>
        </div>
        <LoadingOverlay />
        <p
          ref={hintRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -bottom-7 text-center text-xs tracking-wide text-[#A6A0B5] transition-opacity duration-500 data-[hidden=true]:opacity-0"
        >
          {touchDevice ? "Swipe to rotate" : "Drag to rotate"}
        </p>
      </SceneErrorBoundary>
    </div>
  );
}

useGLTF.preload(MODEL_URL);