import {useMemo, useEffect, useRef} from "react";
import {Canvas, useFrame, useThree} from "@react-three/fiber";
import * as THREE from "three";
import Globe from "./Globe";
import SkyAndGround from "./SkyAndGround";
import BillboardSign from "./BillboardSign";
import CameraRig from "./CameraRig";
import {useGoalStore} from "../../store/goalStore";
import {useSettingsStore} from "../../store/settingsStore";
import {useTheme} from "../../hooks/useTheme";
import {dayOffsetToTimelineAngle, dayOffsetToFlatTimelineTranslation, getGlobeCenterY, getGlobeRadius} from "../../utils/globe";
import {railPositionToDayRange} from "../../utils/dates";

/**
 * Scroll handler component — captures wheel events and adjusts rail position.
 * Must be inside Canvas to access gl.domElement.
 */
function ScrollHandler() {
  const {gl} = useThree();
  const setCameraRailPosition = useSettingsStore((s) => s.setCameraRailPosition);
  const railRef = useRef(useSettingsStore.getState().cameraRailPosition);

  // Keep ref in sync
  useEffect(() => {
    const unsub = useSettingsStore.subscribe((state) => {
      railRef.current = state.cameraRailPosition;
    });
    return unsub;
  }, []);

  useEffect(() => {
    const canvas = gl.domElement;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * 0.0006;
      setCameraRailPosition(railRef.current + delta);
    };
    canvas.addEventListener("wheel", handleWheel, {passive: false});
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [gl.domElement, setCameraRailPosition]);

  return null;
}

/**
 * Lighting rig — reads from theme config.
 */
function Lights() {
  const theme = useTheme();
  return (
    <>
      <ambientLight intensity={theme.ambientIntensity} color={theme.ambientColor} />
      <directionalLight intensity={theme.directionalIntensity} color={theme.directionalColor} position={theme.directionalPosition} castShadow={false} />
    </>
  );
}

/**
 * Goal billboard collection — computes positions and renders all visible billboards.
 */
function GoalBillboards() {
  const goals = useGoalStore((s) => s.goals);
  const categories = useGoalStore((s) => s.categories);
  const filters = useGoalStore((s) => s.filters);
  const getFilteredGoals = useGoalStore((s) => s.getFilteredGoals);

  const filteredIds = useMemo(() => {
    return new Set(getFilteredGoals().map((g) => g.id));
  }, [getFilteredGoals, goals, filters]);

  const filterActive = filters.categories.length > 0 || filters.priorities.length > 0 || filters.searchQuery.trim() !== "";

  // Group goals by date for same-day indexing
  const goalsByDate = useMemo(() => {
    const map = new Map<string, typeof goals>();
    goals.forEach((g) => {
      const existing = map.get(g.date) || [];
      existing.push(g);
      map.set(g.date, existing);
    });
    return map;
  }, [goals]);

  return (
    <>
      {goals.map((goal) => {
        const sameDayGoals = goalsByDate.get(goal.date) || [goal];
        const sameDayIndex = sameDayGoals.indexOf(goal);
        const category = categories.find((c) => c.id === goal.category);

        return <BillboardSign key={goal.id} goal={goal} category={category} sameDayIndex={sameDayIndex} sameDayTotal={sameDayGoals.length} filterActive={filterActive} matchesFilter={filteredIds.has(goal.id)} />;
      })}
    </>
  );
}

const FLAT_CURVATURE_THRESHOLD = 0.82;

/**
 * Moves the full globe world (surface + grid + goals) as simulated time moves forward.
 * - Curved view: rotates the world (timeline tilts towards camera).
 * - Flat view: translates the world straight towards the camera, one day at a time.
 * Both use smooth damping for a realistic feel.
 */
function RotatingTimelineWorld() {
  const simulatedDaysAhead = useSettingsStore((s) => s.simulatedDaysAhead);
  const railPosition = useSettingsStore((s) => s.cameraRailPosition);
  const curvature = useSettingsStore((s) => s.curvature);
  const worldRef = useRef<THREE.Group>(null);
  const globeRadius = getGlobeRadius();
  const globeCenterY = useMemo(() => getGlobeCenterY(curvature), [curvature]);
  const pivotY = useMemo(() => {
    const nearFlatMix = THREE.MathUtils.smoothstep(curvature, FLAT_CURVATURE_THRESHOLD, 1);
    return THREE.MathUtils.lerp(globeCenterY, globeRadius, nearFlatMix);
  }, [curvature, globeCenterY, globeRadius]);
  const maxDaysVisible = useMemo(() => railPositionToDayRange(railPosition), [railPosition]);
  const isFlat = curvature >= 0.999;

  const targetTilt = useMemo(() => {
    return dayOffsetToTimelineAngle(simulatedDaysAhead, maxDaysVisible, curvature);
  }, [simulatedDaysAhead, maxDaysVisible, curvature]);

  const targetZ = useMemo(() => {
    return dayOffsetToFlatTimelineTranslation(simulatedDaysAhead, maxDaysVisible);
  }, [simulatedDaysAhead, maxDaysVisible]);

  useFrame((_, delta) => {
    if (!worldRef.current) return;
    const dampFactor = 9;
    if (isFlat) {
      worldRef.current.rotation.x = THREE.MathUtils.damp(worldRef.current.rotation.x, 0, dampFactor, delta);
      worldRef.current.position.z = THREE.MathUtils.damp(worldRef.current.position.z, targetZ, dampFactor, delta);
    } else {
      worldRef.current.rotation.x = THREE.MathUtils.damp(worldRef.current.rotation.x, targetTilt, dampFactor, delta);
      worldRef.current.position.z = THREE.MathUtils.damp(worldRef.current.position.z, 0, dampFactor, delta);
    }
  });

  return (
    <group ref={worldRef} position={[0, pivotY, 0]}>
      <group position={[0, -pivotY, 0]}>
        <Globe />
        <GoalBillboards />
      </group>
    </group>
  );
}

/**
 * Scene — the top-level 3D scene component.
 * Wraps everything in a Canvas with camera, lighting, globe, billboards, and sky.
 */
export default function Scene() {
  const theme = useTheme();
  const curvature = useSettingsStore((s) => s.curvature);
  const fogFactor = useMemo(() => THREE.MathUtils.smoothstep(curvature, 0.55, 1), [curvature]);
  const fogNear = useMemo(() => THREE.MathUtils.lerp(1200, theme.fogNear, fogFactor), [theme.fogNear, fogFactor]);
  const fogFar = useMemo(() => THREE.MathUtils.lerp(2200, theme.fogFar, fogFactor), [theme.fogFar, fogFactor]);

  return (
    <Canvas
      camera={{
        fov: 60,
        near: 0.1,
        far: 8000,
        position: [0, 90, 2],
      }}
      style={{width: "100%", height: "100%"}}
      gl={{antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0}}>
      {/* Fog ramps in as curvature approaches flat mode */}
      {fogFactor > 0.001 && <fog attach="fog" args={[theme.fogColor, fogNear, fogFar]} />}

      <color attach="background" args={[theme.backgroundColor]} />

      <Lights />
      <SkyAndGround />
      <RotatingTimelineWorld />
      <CameraRig />
      <ScrollHandler />
    </Canvas>
  );
}
