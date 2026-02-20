import {useRef, useState, useCallback, useMemo, useEffect} from "react";
import {useFrame, type ThreeEvent} from "@react-three/fiber";
import {Html, Text, Billboard} from "@react-three/drei";
import * as THREE from "three";
import type {Goal, Category} from "../../types/goal";
import {useTheme} from "../../hooks/useTheme";
import {useUIStore} from "../../store/uiStore";
import {useSettingsStore} from "../../store/settingsStore";
import {daysFromToday, relativeLabel, formatDate, railPositionToDayRange} from "../../utils/dates";
import {goalToGlobePosition, getGoalOpacity, getPriorityScale} from "../../utils/globe";

interface BillboardSignProps {
  goal: Goal;
  category: Category | undefined;
  sameDayIndex: number;
  sameDayTotal: number;
  filterActive: boolean;
  matchesFilter: boolean;
}

/**
 * A physical billboard sign planted on the globe surface.
 * Includes: post, sign board, category-colored border, text, hover tooltip.
 */
export default function BillboardSign({goal, category, sameDayIndex, sameDayTotal, filterActive, matchesFilter}: BillboardSignProps) {
  const theme = useTheme();
  const curvature = useSettingsStore((s) => s.curvature);
  const simulatedDaysAhead = useSettingsStore((s) => s.simulatedDaysAhead);
  const railPosition = useSettingsStore((s) => s.cameraRailPosition);
  const openEditor = useUIStore((s) => s.openEditor);
  const hoveredGoalId = useUIStore((s) => s.hoveredGoalId);
  const setHoveredGoal = useUIStore((s) => s.setHoveredGoal);

  const groupRef = useRef<THREE.Group>(null);
  const entranceProgressRef = useRef(0);
  const [localHover, setLocalHover] = useState(false);

  const days = daysFromToday(goal.date, simulatedDaysAhead);
  const maxDays = railPositionToDayRange(railPosition);
  const isPast = days < 0;

  // Position on globe
  const position = useMemo(() => {
    return goalToGlobePosition(goal.date, sameDayIndex, sameDayTotal, maxDays, curvature);
  }, [goal.date, sameDayIndex, sameDayTotal, maxDays, curvature]);

  // Billboard scaling
  const priorityScale = getPriorityScale(goal.priority);
  const baseScale = 0.8;

  // Opacity from horizon mode
  const horizonOpacity = getGoalOpacity(days, maxDays, curvature);

  // Filter opacity
  const filterOpacity = filterActive ? (matchesFilter ? 1 : 0.08) : 1;

  // Past visual treatment
  const pastOpacity = isPast ? 0.45 : 1;

  // Combined opacity
  const targetOpacity = horizonOpacity * filterOpacity * pastOpacity;

  // Category color or fallback
  const catColor = category?.color ?? "#888888";

  // Entrance animation + hover effect
  useFrame((_, delta) => {
    if (entranceProgressRef.current < 1) {
      entranceProgressRef.current = Math.min(1, entranceProgressRef.current + delta * 1.8);
    }

    if (groupRef.current) {
      const entranceProgress = entranceProgressRef.current;
      // Hover scale
      const targetScale = localHover ? baseScale * priorityScale * 1.08 : baseScale * priorityScale;
      const currentScale = groupRef.current.scale.x;
      const newScale = THREE.MathUtils.lerp(currentScale, targetScale * entranceProgress, delta * 8);
      groupRef.current.scale.setScalar(newScale);

      // Opacity via material traversal (transparent set once on materials)
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (mat.opacity !== undefined) {
            mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, delta * 5);
          }
        }
      });

      // Entrance: rise from below
      const targetY = position.y;
      const entranceOffset = (1 - entranceProgress) * -3;
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY + entranceOffset, delta * 4);
      groupRef.current.position.x = position.x;
      groupRef.current.position.z = position.z;
    }
  });

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      openEditor(goal.id);
    },
    [goal.id, openEditor],
  );

  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      setLocalHover(true);
      setHoveredGoal(goal.id);
      document.body.style.cursor = "pointer";
    },
    [goal.id, setHoveredGoal],
  );

  const handlePointerOut = useCallback(() => {
    setLocalHover(false);
    setHoveredGoal(null);
    document.body.style.cursor = "default";
  }, [setHoveredGoal]);

  useEffect(
    () => () => {
      if (hoveredGoalId === goal.id) document.body.style.cursor = "default";
    },
    [hoveredGoalId, goal.id],
  );

  // Don't render if completely invisible
  if (targetOpacity <= 0.01) return null;

  const signWidth = 2.4;
  const signHeight = 1.6;
  const postHeight = 2.0;

  return (
    <group ref={groupRef} position={[position.x, position.y - 3, position.z]} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut} onClick={handleClick}>
      {/* Billboard wrapper: always faces camera */}
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        {/* Post / pole */}
        <mesh position={[0, postHeight / 2, 0]}>
          <cylinderGeometry args={[0.04, 0.06, postHeight, 8]} />
          <meshStandardMaterial color={theme.billboardPostColor} roughness={0.6} metalness={0.3} transparent opacity={targetOpacity} />
        </mesh>

        {/* Sign backing (slightly larger for border effect) */}
        <mesh position={[0, postHeight + signHeight / 2 + 0.1, 0]}>
          <boxGeometry args={[signWidth + 0.15, signHeight + 0.15, 0.06]} />
          <meshStandardMaterial color={catColor} roughness={0.4} metalness={0.2} emissive={catColor} emissiveIntensity={theme.billboardGlowIntensity * (localHover ? 1.5 : 1)} transparent opacity={targetOpacity} />
        </mesh>

        {/* Sign face */}
        <mesh position={[0, postHeight + signHeight / 2 + 0.1, 0.04]}>
          <boxGeometry args={[signWidth, signHeight, 0.04]} />
          <meshStandardMaterial color={isPast ? theme.billboardPastFaceColor : theme.billboardFaceColor} roughness={0.8} metalness={0.05} transparent opacity={targetOpacity} />
        </mesh>

        {/* Title text */}
        <Text position={[0, postHeight + signHeight / 2 + 0.35, 0.1]} fontSize={0.22} maxWidth={signWidth - 0.3} color={theme.billboardTextColor} anchorX="center" anchorY="middle" font={undefined} outlineWidth={0}>
          {goal.title}
        </Text>

        {/* Date label */}
        <Text position={[0, postHeight + signHeight / 2 - 0.1, 0.1]} fontSize={0.13} color={catColor} anchorX="center" anchorY="middle">
          {relativeLabel(goal.date, simulatedDaysAhead)}
        </Text>

        {/* Priority indicator dots */}
        {goal.priority === "high" && (
          <mesh position={[signWidth / 2 - 0.2, postHeight + signHeight + 0.0, 0.08]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} transparent opacity={targetOpacity} />
          </mesh>
        )}

        {/* Progress bar */}
        {goal.progressPercent > 0 && (
          <group position={[-signWidth / 2 + 0.15, postHeight + signHeight / 2 - 0.45, 0.1]}>
            {/* Background */}
            <mesh>
              <boxGeometry args={[signWidth - 0.3, 0.08, 0.01]} />
              <meshBasicMaterial color="#333344" transparent opacity={targetOpacity * 0.6} />
            </mesh>
            {/* Fill */}
            <mesh position={[(-(signWidth - 0.3) * (1 - goal.progressPercent / 100)) / 2, 0, 0.01]}>
              <boxGeometry args={[((signWidth - 0.3) * goal.progressPercent) / 100, 0.08, 0.01]} />
              <meshBasicMaterial color={catColor} transparent opacity={targetOpacity} />
            </mesh>
          </group>
        )}

        {/* Past goal stamp */}
        {isPast && goal.progressPercent === 100 && (
          <Text position={[0, postHeight + signHeight / 2 + 0.1, 0.12]} fontSize={0.35} color="#22c55e" anchorX="center" anchorY="middle" rotation={[0, 0, -0.2]}>
            ✓ DONE
          </Text>
        )}
      </Billboard>

      {/* Hover tooltip using Html */}
      {localHover && hoveredGoalId === goal.id && (
        <Html position={[0, postHeight + signHeight + 1.2, 0]} center distanceFactor={15} style={{pointerEvents: "none"}}>
          <div
            className="px-3 py-2 rounded-lg shadow-xl min-w-48 max-w-64 backdrop-blur-md"
            style={{
              background: theme.uiBackground,
              color: theme.uiText,
              border: `1px solid ${theme.uiBorder}`,
            }}>
            <div className="font-semibold text-sm truncate">{goal.title}</div>
            <div className="text-xs mt-1 opacity-70">{formatDate(goal.date)}</div>
            {goal.timeOfDay && <div className="text-xs opacity-70">at {goal.timeOfDay}</div>}
            {category && (
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-2 h-2 rounded-full" style={{backgroundColor: category.color}} />
                <span className="text-xs">{category.name}</span>
              </div>
            )}
            {goal.progressPercent > 0 && (
              <div className="mt-1.5">
                <div className="text-xs opacity-70 mb-0.5">Progress: {goal.progressPercent}%</div>
                <div className="w-full h-1 rounded-full bg-black/20">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${goal.progressPercent}%`,
                      backgroundColor: catColor,
                    }}
                  />
                </div>
              </div>
            )}
            {goal.description && <div className="text-xs mt-1 opacity-60 line-clamp-2">{goal.description}</div>}
          </div>
        </Html>
      )}
    </group>
  );
}
